from fastapi import APIRouter, Form, HTTPException, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from passlib.context import CryptContext
from pydantic import BaseModel
import pymysql
from fastapi import UploadFile, File
import random
from datetime import datetime, timedelta
import os, shutil
import time
from typing import List

router = APIRouter(prefix="/auth", tags=["auth"])

templates = Jinja2Templates(directory="templates")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# ---------- DATABASE ----------
def get_db():
    return pymysql.connect(
        host="localhost",
        user="azimi_azimi0908",
        password="Parol12345",
        database="azimi_azimi",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

# ---------- DATABASE MIGRATION ----------
def migrate_db():
    """Автоматӣ сутунҳои камшударо илова мекунад"""
    db = get_db()
    cur = db.cursor()

    # Сутунҳои лозима барои posts
    columns_to_add = [
        ("views", "INT DEFAULT 0"),
        ("calls", "INT DEFAULT 0"),
        ("archived_at", "DATETIME NULL"),
    ]

    for col_name, col_type in columns_to_add:
        try:
            # Проверка - вуҷуд дорад ё не
            cur.execute(f"SELECT {col_name} FROM posts LIMIT 1")
            print(f"✅ Сутун '{col_name}' аллакай вуҷуд дорад")
        except pymysql.err.OperationalError as e:
            if "Unknown column" in str(e):
                # Илова кардани сутун
                cur.execute(f"ALTER TABLE posts ADD COLUMN {col_name} {col_type}")
                print(f"✅ Сутун '{col_name}' илова шуд!")
            else:
                print(f"❌ Хатогӣ: {e}")

    db.commit()
    db.close()
    print("🎉 Мигратсия ба итмом расид!")

# Run migration on startup
migrate_db()

# ---------- MODELS ----------
class BubbleStyleUpdate(BaseModel):
    bubble_style: str

class ThemeUpdate(BaseModel):
    theme: str

class ChatSettingsUpdate(BaseModel):
    user_id: int
    theme: str | None = None
    bubble_style: str | None = None
    font_size: str | None = None

class SendCodeRequest(BaseModel):
    phone: str


# ---------- GET USER ID ----------
@router.get("/get_user")
def get_user(id: int):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT username, avatar, bio, last_seen, is_private
        FROM users WHERE id=%s
    """, (id,))
    row = cursor.fetchone()
    db.close()

    if not row:
        raise HTTPException(404, "User not found")

    return {
        "username": row["username"],
        "avatar": row["avatar"],
        "bio": row["bio"],
        "last_seen": row["last_seen"],
        "is_private": bool(row["is_private"])
    }


#send_code
@router.post("/send_code")
def send_code(data: SendCodeRequest):
    code = str(random.randint(100000, 999999))

    db = get_db()
    cur = db.cursor()

    cur.execute(
        "INSERT INTO sms_codes (phone, code, expires_at) VALUES (%s, %s, %s)",
        (
            data.phone,
            code,
            datetime.now() + timedelta(minutes=5)
        )
    )

    db.commit()
    db.close()

    # FAKE SMS (барои санҷиш)
    print("SMS CODE:", data.phone, code)

    return {"status": "ok"}


@router.post("/login")
def login(
    phone: str = Form(...),
    code: str = Form(...),
    request: Request = None
):
    db = get_db()
    cur = db.cursor()

    # verify code
    cur.execute("""
        SELECT 1 FROM sms_codes
        WHERE phone=%s AND code=%s AND expires_at > NOW()
        ORDER BY id DESC LIMIT 1
    """, (phone, code))

    if not cur.fetchone():
        raise HTTPException(400, "Invalid code")

    # get user
    cur.execute(
        "SELECT id, username, avatar FROM users WHERE phone=%s",
        (phone,)
    )
    user = cur.fetchone()

    if not user:
        cur.execute(
            "INSERT INTO users (phone) VALUES (%s)",
            (phone,)
        )
        db.commit()

        cur.execute(
            "SELECT id, username, avatar FROM users WHERE phone=%s",
            (phone,)
        )
        user = cur.fetchone()

    request.session["user_id"] = user["id"]
    db.close()

    needs_setup = user["username"] is None or not user.get("avatar")

    return {
        "user_id": user["id"],
        "needs_setup": needs_setup
    }


@router.post("/setup-profile")
def setup_profile(
    username: str = Form(...),
    avatar: UploadFile = File(None),
    request: Request = None
):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401)

    db = get_db()
    cur = db.cursor()

    avatar_path = None

    if avatar:
        os.makedirs("static/avatars", exist_ok=True)
        timestamp = int(time.time())
        avatar_path = f"static/avatars/{user_id}_{timestamp}.png"

        with open(avatar_path, "wb") as f:
            shutil.copyfileobj(avatar.file, f)

    cur.execute("""
        UPDATE users
        SET username=%s, avatar=%s
        WHERE id=%s
    """, (username, avatar_path, user_id))

    db.commit()
    db.close()

    return {"status": "ok", "avatar": f"/{avatar_path}" if avatar_path else None}

# GET PROFILE
@router.get("/profile")
def profile(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    db = get_db()
    cur = db.cursor(pymysql.cursors.DictCursor)

    cur.execute("""
        SELECT id, username, phone, avatar, bio, last_seen
        FROM users WHERE id=%s
    """, (user_id,))

    user = cur.fetchone()
    db.close()

    if not user:
        raise HTTPException(404, "User not found")

    return user


#SETTINGS
@router.get("/settings", response_class=HTMLResponse)
def settings_page(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT id, username, phone, avatar, bio
        FROM users
        WHERE id=%s
    """, (user_id,))
    user = cursor.fetchone()
    db.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return templates.TemplateResponse(
        "settings.html",
        {
            "request": request,
            "user": user
        }
    )



#NOTIFICATION
@router.get("/notifications", response_class=HTMLResponse)
def notifications_page(request: Request):
    return templates.TemplateResponse("notifications.html", {"request": request})

#PRIVASY
@router.get("/privacy", response_class=HTMLResponse)
def privacy_page(request: Request):
    return templates.TemplateResponse(
        "privacy.html",
        {"request": request}
    )
#APPEARANSE
@router.get("/appearance", response_class=HTMLResponse)
def appearanse_page(request: Request):
    return templates.TemplateResponse(
        "appearance.html",
        {"request": request}
    )

#LANGUAGE
@router.get("/language", response_class=HTMLResponse)
def language_page(request: Request):
    return templates.TemplateResponse(
        "language.html",
        {"request": request}
    )
#DEVICES
@router.get("/devices", response_class=HTMLResponse)
def devices_page(request: Request):
    return templates.TemplateResponse(
        "devices.html",
        {"request": request}
    )
#HELP
@router.get("/help", response_class=HTMLResponse)
def help_page(request: Request):
    return templates.TemplateResponse(
        "help.html",
        {"request": request}
    )


#---------- CHAT SETTINGS PAGE ----------
@router.get("/chat_settings", response_class=HTMLResponse)
def chat_settings_page(request: Request, user_id: int):
    return templates.TemplateResponse(
        "chat_settings.html",
        {
            "request": request,
            "user_id": user_id
        }
    )

# ---------- GET CHAT SETTINGS ----------
@router.get("/chat-settings")
def get_chat_settings(user_id: int):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        """
        SELECT wallpaper, font_size, bubble_style, theme
        FROM user_chat_settings
        WHERE user_id=%s
        """,
        (user_id,)
    )
    row = cur.fetchone()

    if not row:
        cur.execute(
            "INSERT INTO user_chat_settings (user_id) VALUES (%s)",
            (user_id,)
        )
        db.commit()
        db.close()
        return {
            "wallpaper": "default",
            "font_size": "medium",
            "bubble_style": "round",
            "theme": "purple"
        }

    db.close()
    return row


# POST update chat settings (theme, bubble, font)
@router.post("/chat-settings")
def update_chat_settings(data: ChatSettingsUpdate):
    db = get_db()
    cur = db.cursor()
    if data.theme:
        cur.execute("UPDATE user_chat_settings SET theme=%s WHERE user_id=%s", (data.theme, data.user_id))
    if data.bubble_style:
        cur.execute("UPDATE user_chat_settings SET bubble_style=%s WHERE user_id=%s", (data.bubble_style, data.user_id))
    if data.font_size:
        cur.execute("UPDATE user_chat_settings SET font_size=%s WHERE user_id=%s", (data.font_size, data.user_id))
    db.commit()
    db.close()
    return {"status": "ok"}

# POST update bubble style only
@router.post("/chat-settings/bubble")
def update_bubble_style(data: BubbleStyleUpdate, user_id: int = Query(...)):
    db = get_db()
    cur = db.cursor()
    cur.execute("UPDATE user_chat_settings SET bubble_style=%s WHERE user_id=%s", (data.bubble_style, user_id))
    db.commit()
    db.close()
    return {"status": "ok"}

# POST update theme only
@router.post("/chat-settings/theme")
def update_theme(data: ThemeUpdate, user_id: int = Query(...)):
    db = get_db()
    cur = db.cursor()
    cur.execute("UPDATE user_chat_settings SET theme=%s WHERE user_id=%s", (data.theme, user_id))
    db.commit()
    db.close()
    return {"status": "ok"}


@router.get("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/auth/login")

@router.get("/data-storage", response_class=HTMLResponse)
def data_storage_page(request: Request):
    return templates.TemplateResponse(
        "data_storage.html",
        {"request": request}
    )


#EDIT NAME
@router.get("/edit-name")
def edit_name_page(request: Request):
    return templates.TemplateResponse(
        "edit_name.html",
        {"request": request}
    )

#UPDATE NAME
@router.post("/profile/name")
def update_name(data: dict, request: Request):
    user_id = request.session.get("user_id")

    db = get_db()
    cur = db.cursor()
    cur.execute(
        "UPDATE users SET username=%s WHERE id=%s",
        (data["username"], user_id)
    )
    db.commit()
    db.close()

    return {"ok": True}

#SADO
@router.get("/sado_new", response_class=HTMLResponse)
def sado_page(request: Request):
    return templates.TemplateResponse(
        "sado_new.html",
        {"request": request}
    )

#CHANGE PHONE
@router.get("/change-phone", response_class=HTMLResponse)
def change_phone_page(request: Request):
    return templates.TemplateResponse(
        "change_phone.html",
        {"request": request}
    )

#NEW
@router.get("/change-phone/new")
def change_phone_new_page(request: Request):
    return templates.TemplateResponse(
        "change_phone_new.html",
        {"request": request}
    )


#DATA
@router.get("/change-phone-data")
def change_phone_data(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Not authorized")

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT phone FROM users WHERE id=%s", (user_id,))
    row = cur.fetchone()
    db.close()

    return {
        "phone": row["phone"] if row else ""
    }


@router.get("/change-phone/country", response_class=HTMLResponse)
def change_phone_country(request: Request):
    if not request.session.get("user_id"):
        return HTMLResponse("Unauthorized", status_code=401)

    return templates.TemplateResponse(
        "change_phone_country.html",
        {"request": request}
    )

@router.get("/sado")
def sado_page(request: Request):
    return templates.TemplateResponse(
        "sado.html",
        {"request": request}
    )

@router.get("/add")
def add_page(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401)

    db = get_db()
    cur = db.cursor()

    cur.execute(
        "INSERT INTO posts (user_id, status) VALUES (%s, 'draft')",
        (user_id,)
    )
    post_id = cur.lastrowid

    db.commit()
    db.close()

    return templates.TemplateResponse(
        "add.html",
        {
            "request": request,
            "post_id": post_id
        }
    )

@router.get("/add2")
def add2_page(request: Request, post_id: int = Query(...)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401)

    return templates.TemplateResponse(
        "add2.html",
        {
            "request": request,
            "post_id": post_id
        }
    )


@router.get("/add3")
def add3_page(request: Request, post_id: int = Query(...)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401)

    return templates.TemplateResponse(
        "add3.html",
        {
            "request": request,
            "post_id": post_id
        }
    )


@router.get("/add4")
def add4_page(request: Request, post_id: int = Query(...)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401)

    return templates.TemplateResponse(
        "add4.html",
        {"request": request, "post_id": post_id}
    )


@router.get("/feed-data")
def feed_data():
    db = get_db()
    cur = db.cursor(pymysql.cursors.DictCursor)

    cur.execute("""
        SELECT p.id, p.title, p.price, p.currency, p.city, p.district,
               pi.filename AS image
        FROM posts p
        LEFT JOIN post_images pi ON pi.post_id = p.id
        WHERE p.status='active'
        GROUP BY p.id
        ORDER BY p.id DESC
        LIMIT 50
    """)
    posts = cur.fetchall()
    db.close()
    return {"posts": posts}


@router.get("/add-selection", response_class=HTMLResponse)
def add_selection_page(request: Request):
    return templates.TemplateResponse(
        "add-selection.html",
        {"request": request}
    )


@router.get("/add-short")
def add_short_page(request: Request, short_id: int = Query(...)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401)

    print(f"Rendering add-short.html with short_id={short_id}")

    return templates.TemplateResponse(
        "add-short.html",
        {
            "request": request,
            "short_id": short_id
        }
    )


@router.get("/my-posts-count")
def my_posts_count(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401)

    db = get_db()
    cur = db.cursor()

    # Active posts
    cur.execute(
        "SELECT COUNT(*) AS cnt FROM posts WHERE user_id=%s AND status='active'",
        (user_id,)
    )
    active = cur.fetchone()["cnt"]

    # Archived posts
    cur.execute(
        "SELECT COUNT(*) AS cnt FROM posts WHERE user_id=%s AND status='archived'",
        (user_id,)
    )
    archived = cur.fetchone()["cnt"]

    # Favorites
    cur.execute(
        "SELECT COUNT(*) AS cnt FROM favorites WHERE user_id=%s",
        (user_id,)
    )
    favorites = cur.fetchone()["cnt"]

    db.close()

    return {
        "active": active,
        "archived": archived,
        "favorites": favorites
    }


# ============================================
# MY ADS - ACTIVE & ARCHIVED (БО МИГРАТСИЯ)
# ============================================

# ---------- MY ADS - ACTIVE ----------
@router.get("/my-ads/active", response_class=HTMLResponse)
def my_ads_active_page(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")
    return templates.TemplateResponse("my_ads_active.html", {"request": request})

@router.get("/my-ads/active/data")
def my_ads_active_data(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    db = get_db()
    cur = db.cursor(pymysql.cursors.DictCursor)

    cur.execute("""
        SELECT p.id, p.title, p.price, p.currency, p.city, p.district, 
               p.created_at, p.views, p.calls,
               (SELECT filename FROM post_images WHERE post_id=p.id LIMIT 1) as image
        FROM posts p
        WHERE p.user_id=%s AND p.status='active'
        ORDER BY p.created_at DESC
    """, (user_id,))

    posts = cur.fetchall()

    # ИСЛОҲИ ПУТЬ - илова кардани static/uploads/posts/
    for post in posts:
        if post['image']:
            # Агар аллакай пурра бошад, иваз накун
            if not post['image'].startswith(('static/', 'uploads/', '/')):
                post['image'] = f'static/uploads/posts/{post["image"]}'
            # Агар бо uploads/ оғоз шавад, иловаи static/
            elif post['image'].startswith('uploads/') and not post['image'].startswith('static/'):
                post['image'] = f'static/{post["image"]}'

    db.close()
    return {"posts": posts}


# ---------- MY ADS - ARCHIVED ----------
@router.get("/my-ads/archived", response_class=HTMLResponse)
def my_ads_archived_page(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")
    return templates.TemplateResponse("my_ads_archived.html", {"request": request})

@router.get("/my-ads/archived/data")
def my_ads_archived_data(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    db = get_db()
    cur = db.cursor(pymysql.cursors.DictCursor)

    cur.execute("""
        SELECT p.id, p.title, p.price, p.currency, p.city, p.district,
               p.created_at, p.archived_at,
               (SELECT filename FROM post_images WHERE post_id=p.id LIMIT 1) as image
        FROM posts p
        WHERE p.user_id=%s AND p.status='archived'
        ORDER BY p.archived_at DESC
    """, (user_id,))

    posts = cur.fetchall()

    # Ҳамин ислоҳ барои архив
    for post in posts:
        if post['image']:
            if not post['image'].startswith(('static/', 'uploads/', '/')):
                post['image'] = f'static/uploads/posts/{post["image"]}'
            elif post['image'].startswith('uploads/') and not post['image'].startswith('static/'):
                post['image'] = f'static/{post["image"]}'

    db.close()
    return {"posts": posts}

# ---------- POST ACTIONS ----------
@router.post("/archive-post")
def archive_post(id: int = Query(...), request: Request = None):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    db = get_db()
    cur = db.cursor()
    cur.execute("""
        UPDATE posts SET status='archived', archived_at=NOW() 
        WHERE id=%s AND user_id=%s
    """, (id, user_id))
    db.commit()
    db.close()
    return {"status": "ok"}

@router.post("/restore-post")
def restore_post(id: int = Query(...), request: Request = None):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    db = get_db()
    cur = db.cursor()
    cur.execute("""
        UPDATE posts SET status='active', archived_at=NULL 
        WHERE id=%s AND user_id=%s
    """, (id, user_id))
    db.commit()
    db.close()
    return {"status": "ok"}

@router.delete("/delete-post")
def delete_post(id: int = Query(...), request: Request = None):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    db = get_db()
    cur = db.cursor()

    # Delete images first
    cur.execute("SELECT filename FROM post_images WHERE post_id=%s", (id,))
    images = cur.fetchall()
    for img in images:
        try:
            if os.path.exists(img["filename"]):
                os.remove(img["filename"])
        except:
            pass

    cur.execute("DELETE FROM post_images WHERE post_id=%s", (id,))
    cur.execute("DELETE FROM posts WHERE id=%s AND user_id=%s", (id, user_id))
    db.commit()
    db.close()
    return {"status": "ok"}

@router.delete("/clear-archived")
def clear_archived(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    db = get_db()
    cur = db.cursor()

    # Get archived posts
    cur.execute("SELECT id FROM posts WHERE user_id=%s AND status='archived'", (user_id,))
    posts = cur.fetchall()

    for post in posts:
        # Delete images
        cur.execute("SELECT filename FROM post_images WHERE post_id=%s", (post["id"],))
        images = cur.fetchall()
        for img in images:
            try:
                if os.path.exists(img["filename"]):
                    os.remove(img["filename"])
            except:
                pass
        cur.execute("DELETE FROM post_images WHERE post_id=%s", (post["id"],))
        cur.execute("DELETE FROM posts WHERE id=%s", (post["id"],))

    db.commit()
    db.close()
    return {"status": "ok"}

# Ҳар ду роут фаъол кунед:
@router.get("/upload-promo", response_class=HTMLResponse)
@router.get("/upload_promo", response_class=HTMLResponse)  # Ин ҳам
def upload_promo_page(request: Request):
    return templates.TemplateResponse("upload_promo.html", {"request": request})


@router.post("/upload-promo-image")
@router.post("/upload_promo_image")  # Ин ҳам
async def upload_promo_image(
    request: Request,
    file: UploadFile = File(...),
    filename: str = Form(...)
):
    upload_dir = "static/images"
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    return {"status": "ok", "filename": filename, "url": f"/static/images/{filename}"}

