from fastapi.responses import HTMLResponse, JSONResponse
from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form, Query
from typing import List, Optional
from app.db import get_db
import os, shutil, time, pymysql, json
from fastapi.templating import Jinja2Templates


# --- Роутер барои корбарони логиншуда ---
post_auth_router = APIRouter(prefix="/auth/post", tags=["post"])

templates = Jinja2Templates(directory="templates")


@post_auth_router.post("/create-draft")
def create_post_draft(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401)

    db = get_db()
    cur = db.cursor()

    cur.execute("""
        INSERT INTO posts (user_id, status)
        VALUES (%s, 'draft')
    """, (user_id,))

    post_id = cur.lastrowid

    db.commit()
    db.close()

    return {"status": "ok", "post_id": post_id}


@post_auth_router.post("/upload-images")
async def upload_post_images(
    request: Request,
    post_id: str = Form(...),  # Метавонад "new" ё ID бошад
    files: List[UploadFile] = File(...)
):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    db = get_db()
    cur = db.cursor()

    # Агар post_id = "new", пас draft-и нав соз
    if post_id == "new" or not post_id.isdigit():
        cur.execute("""
            INSERT INTO posts (user_id, status)
            VALUES (%s, 'draft')
        """, (user_id,))
        post_id = cur.lastrowid
        db.commit()
    else:
        post_id = int(post_id)
        # Проверка ки ин пост ба ин корбар тааллуқ дорад
        cur.execute("SELECT id FROM posts WHERE id=%s AND user_id=%s", (post_id, user_id))
        if not cur.fetchone():
            db.close()
            raise HTTPException(403, "Post not found or access denied")

    upload_dir = "static/uploads/posts"
    os.makedirs(upload_dir, exist_ok=True)

    uploaded_files = []

    for file in files:
        timestamp = int(time.time())
        safe_name = file.filename.replace(" ", "_").replace("/", "_")
        filename = f"{user_id}_{timestamp}_{safe_name}"
        filepath = os.path.join(upload_dir, filename)

        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)

        cur.execute("""
            INSERT INTO post_images (post_id, user_id, filename)
            VALUES (%s, %s, %s)
        """, (post_id, user_id, filename))

        uploaded_files.append({
            "filename": filename,
            "url": f"/static/uploads/posts/{filename}"
        })

    db.commit()
    db.close()

    return {
        "status": "ok",
        "post_id": post_id,
        "files": uploaded_files
    }

@post_auth_router.post("/add-details")
async def add_post_details(
    request: Request,
    post_id: int = Form(...),
    title: str = Form(...),
    category: str = Form(...),
    subcategory: Optional[str] = Form(None),
    price: Optional[str] = Form(None),
    currency: Optional[str] = Form("TJS"),
    negotiable: str = Form("false"),
    description: Optional[str] = Form(None),
    attributes: Optional[str] = Form(None)
):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    negotiable_value = 1 if negotiable.lower() == "true" else 0

    db = get_db()
    cur = db.cursor()

    # Проверка дастрасӣ
    cur.execute("SELECT id FROM posts WHERE id=%s AND user_id=%s", (post_id, user_id))
    if not cur.fetchone():
        db.close()
        raise HTTPException(403, "Post not found")

    # === ИСЛОҲ: Агар price холӣ бошад, NULL гузор ===
    price_value = None if not price or price.strip() == "" else price.strip()

    # Сабти атрибутҳо дар description
    full_description = description or ""
    if attributes:
        try:
            attrs = json.loads(attributes)
            if attrs:
                full_description += "\n\n---\n"
                for key, value in attrs.items():
                    if value:
                        full_description += f"\n{key}: {value}"
        except:
            pass

    cur.execute("""
        UPDATE posts
        SET
            title=%s,
            category=%s,
            subcategory=%s,
            price=%s,
            currency=%s,
            negotiable=%s,
            description=%s
        WHERE id=%s AND user_id=%s
    """, (
        title.strip(),
        category,
        subcategory,
        price_value,  # ИСЛОҲ: None агар холӣ бошад
        currency,
        negotiable_value,
        full_description.strip(),
        post_id,
        user_id
    ))

    db.commit()
    db.close()

    return {"status": "ok", "post_id": post_id}


@post_auth_router.post("/add-location")
async def add_post_location(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    try:
        data = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON")

    post_id = data.get("post_id")
    if not post_id:
        raise HTTPException(400, "post_id required")

    db = get_db()
    cur = db.cursor()

    # Проверка дастрасӣ
    cur.execute("SELECT id FROM posts WHERE id=%s AND user_id=%s", (post_id, user_id))
    if not cur.fetchone():
        db.close()
        raise HTTPException(403, "Post not found")

    # === ЛОГ БАРОИ ДИАГНОСТИКА ===
    print(f"ADD-LOCATION DEBUG: post_id={post_id}")
    print(f"ADD-LOCATION DEBUG: phone={data.get('phone')}")
    print(f"ADD-LOCATION DEBUG: city={data.get('city')}")
    print(f"ADD-LOCATION DEBUG: contact_name={data.get('contact_name')}")
    # =============================

    cur.execute("""
        UPDATE posts
        SET
            city=%s,
            district=%s,
            phone=%s,
            contact_name=%s,
            telegram=%s,
            show_telegram=%s,
            allow_messages=%s,
            bargain=%s
        WHERE id=%s AND user_id=%s
    """, (
        data.get("city"),
        data.get("district"),
        data.get("phone"),        # Ин мебояд +992XXXXXXXXX бошад
        data.get("contact_name"),
        data.get("telegram"),
        1 if data.get("show_telegram") else 0,      # ИСЛОҲ: Boolean ба INT
        1 if data.get("allow_messages", True) else 0, # ИСЛОҲ: Boolean ба INT
        1 if data.get("bargain") else 0,             # ИСЛОҲ: Boolean ба INT
        post_id,
        user_id
    ))

    db.commit()
    db.close()

    return {"status": "ok", "post_id": post_id}



@post_auth_router.post("/save-draft")
async def save_draft(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    try:
        data = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON")

    post_id = data.get("post_id")

    # === ЛОГ ===
    print(f"SAVE-DRAFT DEBUG: received post_id={post_id}")
    # ===========

    if not post_id or post_id == "new":
        raise HTTPException(400, f"Invalid post_id: {post_id}")

    db = get_db()
    cur = db.cursor()

    # Проверка дастрасӣ
    cur.execute("SELECT id FROM posts WHERE id=%s AND user_id=%s", (post_id, user_id))
    if not cur.fetchone():
        db.close()
        raise HTTPException(403, "Post not found")

    # Сабти ҳамаи маълумот
    cur.execute("""
        UPDATE posts
        SET
            title=%s,
            category=%s,
            subcategory=%s,
            price=%s,
            currency=%s,
            negotiable=%s,
            description=%s,
            city=%s,
            district=%s,
            phone=%s,
            contact_name=%s,
            telegram=%s,
            show_telegram=%s,
            allow_messages=%s,
            bargain=%s
        WHERE id=%s AND user_id=%s
    """, (
        data.get("title", ""),
        data.get("category", ""),
        data.get("subcategory", ""),
        data.get("price", ""),
        data.get("currency", "TJS"),
        1 if data.get("negotiable") else 0,
        data.get("description", ""),
        data.get("city", ""),
        data.get("district", ""),
        data.get("phone", ""),
        data.get("contact_name", ""),
        data.get("telegram", ""),
        1 if data.get("show_telegram") else 0,
        1 if data.get("allow_messages", True) else 0,
        1 if data.get("bargain") else 0,
        post_id,
        user_id
    ))

    db.commit()
    db.close()

    return {"status": "ok", "post_id": post_id}

@post_auth_router.post("/publish")
async def publish_post(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    try:
        data = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON")

    post_id = data.get("post_id")
    if not post_id:
        raise HTTPException(400, "post_id required")

    db = get_db()
    cur = db.cursor(pymysql.cursors.DictCursor)  # ИСЛОҲ: DictCursor

    # Проверка дастрасӣ ва пуррагӣ
    cur.execute("""
        SELECT title, price, city, phone, status
        FROM posts 
        WHERE id=%s AND user_id=%s
    """, (post_id, user_id))

    post = cur.fetchone()

    # === ЛОГ БАРОИ ДИАГНОСТИКА ===
    print(f"PUBLISH DEBUG: post={post}")
    # =============================

    if not post:
        db.close()
        raise HTTPException(403, "Post not found")

    if post.get("status") != "draft":
        db.close()
        raise HTTPException(400, f"Post already published or status: {post.get('status')}")

    # Проверка ҳатмӣ бо номи сутунҳо
    missing = []
    if not post.get("title"):
        missing.append("title")
    if not post.get("city"):
        missing.append("city")
    if not post.get("phone"):
        missing.append("phone")

    if missing:
        db.close()
        raise HTTPException(400, f"Missing required fields: {', '.join(missing)}")

    # Нашр
    cur.execute("""
        UPDATE posts
        SET status='active', published_at=NOW()
        WHERE id=%s AND user_id=%s
    """, (post_id, user_id))

    db.commit()
    db.close()

    return {"status": "published", "post_id": post_id}


@post_auth_router.get("/{post_id}/public")
def get_post_public(post_id: int):
    db = get_db()
    cur = db.cursor(pymysql.cursors.DictCursor)

    cur.execute("""
        SELECT *
        FROM posts
        WHERE id=%s AND status='active'
    """, (post_id,))
    post = cur.fetchone()

    if not post:
        raise HTTPException(404, "Post not found")

    cur.execute("""
        SELECT filename
        FROM post_images
        WHERE post_id=%s
        ORDER BY id
    """, (post_id,))
    images = cur.fetchall()

    db.close()

    return {
        "post": post,
        "images": images
    }


@post_auth_router.get("/{post_id}/preview")
def get_post_preview(post_id: int, request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    db = get_db()
    cur = db.cursor(pymysql.cursors.DictCursor)

    cur.execute("""
        SELECT id, title, price, currency, description, city, district, 
               category, subcategory, phone, contact_name, telegram,
               negotiable, bargain
        FROM posts
        WHERE id=%s AND user_id=%s
    """, (post_id, user_id))
    post = cur.fetchone()

    if not post:
        db.close()
        raise HTTPException(404, "Post not found")

    cur.execute("""
        SELECT filename
        FROM post_images
        WHERE post_id=%s
        ORDER BY id
    """, (post_id,))
    images = cur.fetchall()

    # Парсинг атрибутҳо аз description
    attributes = {}
    if post["description"] and "---" in post["description"]:
        parts = post["description"].split("---")
        if len(parts) > 1:
            attrs_text = parts[1]
            for line in attrs_text.strip().split("\n"):
                if ":" in line:
                    key, value = line.split(":", 1)
                    attributes[key.strip()] = value.strip()

    db.close()

    return {
        "post": post,
        "images": images,
        "attributes": attributes
    }


# --- Роутер барои кушодани эълонҳо (public) ---
post_public_router = APIRouter(tags=["post"])

@post_public_router.get("/post/{post_id}", response_class=HTMLResponse)
def post_page(request: Request, post_id: int):
    return templates.TemplateResponse(
        "post.html",
        {"request": request, "post_id": post_id}
    )

@post_public_router.get("/api/post/{post_id}")
def get_post(post_id: int):
    db = get_db()
    cur = db.cursor(pymysql.cursors.DictCursor)

    cur.execute("""
        SELECT p.*, u.id as user_id, u.username, u.phone as user_phone, u.avatar
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.id=%s AND p.status='active'
    """, (post_id,))
    post = cur.fetchone()

    if not post:
        return {}

    cur.execute("SELECT filename FROM post_images WHERE post_id=%s", (post_id,))
    images = ["/static/uploads/posts/" + i["filename"] for i in cur.fetchall()]

    # Парс кардани атрибутҳо аз description
    attributes = {}
    if post.get("description") and "---" in post["description"]:
        parts = post["description"].split("---")
        if len(parts) > 1:
            attrs_text = parts[1]
            for line in attrs_text.strip().split("\n"):
                if ":" in line:
                    key, value = line.split(":", 1)
                    if key.strip() and value.strip():
                        clean_key = key.strip().lower().replace(" ", "_").replace("(", "").replace(")", "")
                        attributes[clean_key] = value.strip()

    # Тоза кардани description
    clean_description = post.get("description", "")
    if "---" in clean_description:
        clean_description = clean_description.split("---")[0].strip()

    return {
        "id": post["id"],
        "user_id": post["user_id"],  # === МУҲИМ: Ин барои чат лозим ===
        "title": post["title"],
        "price": post["price"],
        "currency": post["currency"],
        "city": post["city"],
        "district": post["district"],
        "description": clean_description,
        "phone": post["phone"],
        "contact_name": post["contact_name"],
        "telegram": post["telegram"],
        "show_telegram": post["show_telegram"],
        "allow_messages": post["allow_messages"],
        "bargain": post["bargain"],
        "images": images,
        "attributes": attributes,
        "user": {
            "name": post["username"],
            "phone": post["user_phone"],
            "avatar": post["avatar"]
        }
    }

@post_public_router.get("/my-ads/stats")
async def get_my_ads_stats(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        return JSONResponse({"error": "Not logged in"}, status_code=401)

    try:
        db = get_db()
        cur = db.cursor()

        # Ҳисоби просмотрҳо аз ҳамаи постҳои корбар
        cur.execute("""
            SELECT 
                COALESCE(SUM(views), 0) as total_views,
                COALESCE(SUM(calls), 0) as total_calls
            FROM posts 
            WHERE user_id = %s
        """, (user_id,))

        result = cur.fetchone()
        cur.close()
        db.close()

        return {
            "views": result[0] if result else 0,
            "calls": result[1] if result else 0
        }

    except Exception as e:
        print(f"Error getting stats: {e}")
        return {"views": 0, "calls": 0}
