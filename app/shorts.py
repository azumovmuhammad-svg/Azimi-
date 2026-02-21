# app/shorts.py
from fastapi import APIRouter, Request, HTTPException, UploadFile, Form, Query
from app.db import get_db
import os
import shutil
import time
import pymysql
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

# ⭐ ТАНҲО ЯК МАРОТИБА!
shorts_router = APIRouter(prefix="/shorts", tags=["shorts"])

templates = Jinja2Templates(directory="templates")

# =========================
# Саҳифаи асосии shorts (Reels-style) - GET /shorts/
# =========================
@shorts_router.get("/", response_class=HTMLResponse)
def shorts_page(request: Request):
    # ⭐ shortS.html бояд вуҷуд дошта бошад!
    return templates.TemplateResponse("shorts.html", {"request": request})

# =========================
# Гирифтани рӯйхати shorts
# =========================
@shorts_router.get("/shorts-data")
def shorts_feed():
    db = get_db()
    cur = db.cursor(pymysql.cursors.DictCursor)
    cur.execute("""
        SELECT s.id, s.title, s.description, s.video, u.username, s.created_at
        FROM shorts s
        JOIN users u ON u.id = s.user_id
        WHERE s.status='active'
        ORDER BY s.created_at DESC
        LIMIT 50
    """)
    shorts = cur.fetchall()
    db.close()

    print(f"DEBUG: Found {len(shorts)} shorts")  # Debug

    for short in shorts:
        if short.get('video'):
            short['video_url'] = f"/static/uploads/shorts/{short['video']}"
        print(f"DEBUG: id={short.get('id')}, video={short.get('video')}")

    return {"shorts": shorts}

# =========================
# Гирифтани як short (танҳо барои add-short)
# =========================
@shorts_router.get("/get-short")
def get_short(id: int = Query(...), request: Request = None):
    if not request:
        raise HTTPException(401)

    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401)

    db = get_db()
    cur = db.cursor(pymysql.cursors.DictCursor)
    cur.execute("""
        SELECT id, title, description, video, status
        FROM shorts
        WHERE id=%s AND user_id=%s
    """, (id, user_id))
    short = cur.fetchone()
    db.close()

    if not short:
        raise HTTPException(404, "Short not found")

    return {
        "id": short["id"],
        "title": short["title"],
        "description": short["description"],
        "video": f"/static/uploads/shorts/{short['video']}" if short["video"] else None,
        "status": short["status"]
    }

# =========================
# Сохтани draft
# =========================
@shorts_router.post("/create-draft")
def create_video_draft(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401)

    db = get_db()
    cur = db.cursor()
    cur.execute("""
        INSERT INTO shorts (user_id, status)
        VALUES (%s, 'draft')
    """, (user_id,))
    draft_id = cur.lastrowid
    db.commit()
    db.close()
    return {"status": "ok", "draft_id": draft_id}

# =========================
# Upload-и видео
# =========================
@shorts_router.post("/upload-video")
async def upload_video(
    draft_id: int = Form(...),
    file: UploadFile = None,
    request: Request = None
):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401)

    if not file:
        raise HTTPException(400, "Видео файл талаб карда мешавад")

    upload_dir = "static/uploads/shorts"
    os.makedirs(upload_dir, exist_ok=True)

    timestamp = int(time.time())
    safe_name = file.filename.replace(" ", "_")
    filename = f"{user_id}_{timestamp}_{safe_name}"
    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    db = get_db()
    cur = db.cursor()
    cur.execute("""
        UPDATE shorts 
        SET video = %s
        WHERE id = %s AND user_id = %s
    """, (filename, draft_id, user_id))
    db.commit()
    db.close()

    return {"status": "ok", "file": f"/static/uploads/shorts/{filename}"}

# =========================
# Иловаи тафсилот
# =========================
@shorts_router.post("/add-details")
async def add_video_details(
    draft_id: int = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    request: Request = None
):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401)

    db = get_db()
    cur = db.cursor()
    cur.execute("""
        UPDATE shorts
        SET title=%s, description=%s
        WHERE id=%s AND user_id=%s
    """, (title, description, draft_id, user_id))
    db.commit()
    db.close()
    return {"status": "ok"}

# =========================
# Нашри short
# =========================
@shorts_router.post("/publish")
async def publish_video(request: Request):
    user_id = request.session.get("user_id")
    data = await request.json()
    draft_id = data.get("draft_id")

    if not user_id or not draft_id:
        raise HTTPException(401)

    db = get_db()
    cur = db.cursor()
    cur.execute("""
        UPDATE shorts
        SET status='active'
        WHERE id=%s AND user_id=%s
    """, (draft_id, user_id))
    db.commit()
    db.close()

    return {
        "status": "published",
        "short_id": draft_id
    }

