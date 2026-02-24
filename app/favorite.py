# app/favorite.py
from fastapi import APIRouter, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from app.db import get_db
import pymysql

favorite_router = APIRouter(prefix="/favorite", tags=["favorite"])
templates = Jinja2Templates(directory="templates")

# =========================
# Саҳифаи асосии Избранное
# =========================
@favorite_router.get("/", response_class=HTMLResponse)
def favorite_page(request: Request):
    return templates.TemplateResponse("favorite.html", {"request": request})

# =========================
# Гирифтани постҳои лайкшуда
# =========================
@favorite_router.get("/posts")
def favorite_posts(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db = get_db()
    cur = db.cursor(pymysql.cursors.DictCursor)

    cur.execute("""
        SELECT 
            p.id, 
            p.title, 
            p.price, 
            p.currency, 
            p.created_at,
            p.category as category_name,
            loc.city, 
            loc.district,
            u.username, 
            u.avatar,
            pi.filename as image
        FROM post_likes pl
        JOIN posts p ON p.id = pl.post_id
        LEFT JOIN locations loc ON loc.post_id = p.id
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN post_images pi ON pi.post_id = p.id
        WHERE pl.user_id = %s AND p.status = 'active'
        GROUP BY p.id
        ORDER BY pl.created_at DESC
    """, (user_id,))

    posts = cur.fetchall()
    db.close()

    # Формат кардани аксҳо
    for post in posts:
        if post.get('image'):
            post['image_url'] = f"/static/uploads/posts/{post['image']}"
        else:
            post['image_url'] = '/static/no-image.png'
        
        # Формат кардани нарх
        if post.get('price'):
            post['price_formatted'] = f"{int(post['price']):,}".replace(',', ' ') + ' ' + (post['currency'] or 'TJS')
        else:
            post['price_formatted'] = 'Договорная'

    return {"posts": posts}

# =========================
# Гирифтани shorts-ҳои лайкшуда
# =========================
@favorite_router.get("/shorts")
def favorite_shorts(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db = get_db()
    cur = db.cursor(pymysql.cursors.DictCursor)

    cur.execute("""
        SELECT s.id, s.title, s.description, s.video, s.created_at,
               u.username, u.avatar,
               (SELECT COUNT(*) FROM short_likes WHERE short_id = s.id) as total_likes
        FROM short_likes sl
        JOIN shorts s ON s.id = sl.short_id
        JOIN users u ON u.id = s.user_id
        WHERE sl.user_id = %s AND s.status = 'active'
        ORDER BY sl.created_at DESC
    """, (user_id,))

    shorts = cur.fetchall()
    db.close()

    for short in shorts:
        if short.get('video'):
            short['video_url'] = f"/static/uploads/shorts/{short['video']}"
        else:
            short['video_url'] = None

    return {"shorts": shorts}

# =========================
# Гирифтани шумораи лайкҳо
# =========================
@favorite_router.get("/counts")
def favorite_counts(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db = get_db()
    cur = db.cursor()  # Ин бояд курсори оддӣ (tuple) бошад

    cur.execute("SELECT COUNT(*) FROM post_likes WHERE user_id = %s", (user_id,))
    posts_result = cur.fetchone()
    # Агар натиҷа Tuple бошад (масалан (5,)), элемент 0-ро мегирем
    # Агар натиҷа Dict бошад (масалан {'COUNT(*)': 5}), калидро мегирем
    if isinstance(posts_result, dict):
        posts_count = posts_result.get('COUNT(*)', 0)
    else:
        posts_count = posts_result[0] if posts_result else 0

    cur.execute("SELECT COUNT(*) FROM short_likes WHERE user_id = %s", (user_id,))
    shorts_result = cur.fetchone()
    if isinstance(shorts_result, dict):
        shorts_count = shorts_result.get('COUNT(*)', 0)
    else:
        shorts_count = shorts_result[0] if shorts_result else 0

    db.close()

    return {
        "posts_count": posts_count,
        "shorts_count": shorts_count,
        "total": posts_count + shorts_count
    }
