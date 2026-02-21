# app/admin/router.py - Admin Panel for Mshop

from fastapi import APIRouter, Request, HTTPException, Form, Query, Depends
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
import pymysql
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/admin", tags=["admin"])

# Templates
admin_templates = Jinja2Templates(directory="templates/admin")

# ========== DATABASE CONNECTION ==========
def get_db():
    return pymysql.connect(
        host="localhost",
        user="azimi_azimi0908",
        password="Parol12345",
        database="azimi_azimi",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

# ========== ADMIN AUTHENTICATION ==========
ADMIN_CREDENTIALS = {
    "username": "admin",
    "password": "admin123"
}

def is_admin(request: Request):
    """Проверка авторизации админа"""
    admin_session = request.session.get("is_admin")
    if not admin_session:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# ========== LOGIN PAGE ==========
@router.get("/login", response_class=HTMLResponse)
def admin_login_page(request: Request, error: Optional[str] = None):
    """Саҳифаи воридшавии админ"""
    return admin_templates.TemplateResponse(
        "login.html",
        {"request": request, "error": error}
    )

@router.post("/login")
def admin_login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...)
):
    """Проверка логин/парол"""
    if username == ADMIN_CREDENTIALS["username"] and password == ADMIN_CREDENTIALS["password"]:
        request.session["is_admin"] = True
        request.session["admin_user"] = username
        return RedirectResponse(url="/admin", status_code=302)

    return RedirectResponse(url="/admin/login?error=invalid", status_code=302)

@router.get("/logout")
def admin_logout(request: Request):
    """Баромад аз админ панел"""
    request.session.clear()
    return RedirectResponse(url="/admin/login")

# ========== DASHBOARD (ГЛАВНАЯ) ==========
@router.get("/", response_class=HTMLResponse)
def admin_dashboard(request: Request, admin=Depends(is_admin)):
    """Саҳифаи асосии админ панел"""
    db = get_db()
    cur = db.cursor()

    # Статистика
    stats = {}

    # Всего пользователей
    cur.execute("SELECT COUNT(*) as cnt FROM users")
    stats["total_users"] = cur.fetchone()["cnt"]

    # Новых сегодня (last_seen истифода мебарем)
    cur.execute("SELECT COUNT(*) as cnt FROM users WHERE DATE(last_seen) = CURDATE()")
    stats["new_users_today"] = cur.fetchone()["cnt"]

    # Всего объявлений
    cur.execute("SELECT COUNT(*) as cnt FROM posts")
    stats["total_posts"] = cur.fetchone()["cnt"]

    # Активных объявлений
    cur.execute("SELECT COUNT(*) as cnt FROM posts WHERE status='active'")
    stats["active_posts"] = cur.fetchone()["cnt"]

    # На модерации (draft)
    cur.execute("SELECT COUNT(*) as cnt FROM posts WHERE status='draft'")
    stats["draft_posts"] = cur.fetchone()["cnt"]

    # Архивных
    cur.execute("SELECT COUNT(*) as cnt FROM posts WHERE status='archived'")
    stats["archived_posts"] = cur.fetchone()["cnt"]

    # Всего сообщений
    cur.execute("SELECT COUNT(*) as cnt FROM messages")
    stats["total_messages"] = cur.fetchone()["cnt"]

    # Сегодняшние сообщения
    cur.execute("SELECT COUNT(*) as cnt FROM messages WHERE DATE(created_at) = CURDATE()")
    stats["messages_today"] = cur.fetchone()["cnt"]

    # Последние 5 пользователей
    cur.execute("""
        SELECT id, username, phone, last_seen as created_at 
        FROM users 
        ORDER BY id DESC 
        LIMIT 5
    """)
    recent_users = cur.fetchall()

    # Последние 5 объявлений
    cur.execute("""
        SELECT p.id, p.title, p.status, p.created_at, u.username
        FROM posts p
        JOIN users u ON u.id = p.user_id
        ORDER BY p.id DESC
        LIMIT 5
    """)
    recent_posts = cur.fetchall()

    db.close()

    return admin_templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "stats": stats,
            "recent_users": recent_users,
            "recent_posts": recent_posts
        }
    )

# ========== USERS (ПОЛЬЗОВАТЕЛИ) ==========
@router.get("/users", response_class=HTMLResponse)
def admin_users(
    request: Request,
    page: int = Query(1, ge=1),
    search: Optional[str] = None,
    admin=Depends(is_admin)
):
    """Идоракунии корбарон"""
    db = get_db()
    cur = db.cursor()

    per_page = 20
    offset = (page - 1) * per_page

    # Базовый запрос
    base_query = "FROM users u WHERE 1=1"
    params = []

    if search:
        base_query += " AND (u.username LIKE %s OR u.phone LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])

    # Подсчет общего количества
    cur.execute(f"SELECT COUNT(*) as cnt {base_query}", params)
    total = cur.fetchone()["cnt"]
    total_pages = (total + per_page - 1) // per_page

    # Получение пользователей
    cur.execute(f"""
        SELECT u.id, u.username, u.phone, u.avatar, u.last_seen as created_at,
               (SELECT COUNT(*) FROM posts WHERE user_id=u.id) as posts_count,
               (SELECT COUNT(*) FROM messages WHERE sender_id=u.id OR receiver_id=u.id) as messages_count
        {base_query}
        ORDER BY u.id DESC
        LIMIT %s OFFSET %s
    """, params + [per_page, offset])

    users = cur.fetchall()
    db.close()

    return admin_templates.TemplateResponse(
        "users.html",
        {
            "request": request,
            "users": users,
            "page": page,
            "total_pages": total_pages,
            "search": search,
            "total": total
        }
    )

@router.get("/users/{user_id}", response_class=HTMLResponse)
def admin_user_detail(request: Request, user_id: int, admin=Depends(is_admin)):
    """Детали пользователя"""
    db = get_db()
    cur = db.cursor()

    # Информация о пользователе
    cur.execute("SELECT * FROM users WHERE id=%s", (user_id,))
    user = cur.fetchone()

    if not user:
        db.close()
        raise HTTPException(404, "User not found")

    # Объявления пользователя
    cur.execute("""
        SELECT id, title, price, currency, status, created_at, views
        FROM posts
        WHERE user_id=%s
        ORDER BY id DESC
    """, (user_id,))
    posts = cur.fetchall()

    # Статистика
    cur.execute("SELECT COUNT(*) as cnt FROM posts WHERE user_id=%s AND status='active'", (user_id,))
    active_posts = cur.fetchone()["cnt"]

    cur.execute("SELECT COUNT(*) as cnt FROM messages WHERE sender_id=%s OR receiver_id=%s", 
                (user_id, user_id))
    messages_count = cur.fetchone()["cnt"]

    db.close()

    return admin_templates.TemplateResponse(
        "user_detail.html",
        {
            "request": request,
            "user": user,
            "posts": posts,
            "active_posts": active_posts,
            "messages_count": messages_count
        }
    )

@router.post("/users/{user_id}/block")
def admin_block_user(request: Request, user_id: int, admin=Depends(is_admin)):
    """Блокировка пользователя"""
    db = get_db()
    cur = db.cursor()
    cur.execute("UPDATE users SET is_blocked=1 WHERE id=%s", (user_id,))
    db.commit()
    db.close()
    return {"status": "ok", "message": "User blocked"}

@router.post("/users/{user_id}/unblock")
def admin_unblock_user(request: Request, user_id: int, admin=Depends(is_admin)):
    """Разблокировка пользователя"""
    db = get_db()
    cur = db.cursor()
    cur.execute("UPDATE users SET is_blocked=0 WHERE id=%s", (user_id,))
    db.commit()
    db.close()
    return {"status": "ok", "message": "User unblocked"}

# ========== POSTS (ОБЪЯВЛЕНИЯ) ==========
@router.get("/posts", response_class=HTMLResponse)
def admin_posts(
    request: Request,
    page: int = Query(1, ge=1),
    status: Optional[str] = None,
    search: Optional[str] = None,
    admin=Depends(is_admin)
):
    """Идоракунии эълонҳо"""
    db = get_db()
    cur = db.cursor()

    per_page = 20
    offset = (page - 1) * per_page

    # Базовый запрос
    base_query = "FROM posts p JOIN users u ON u.id=p.user_id WHERE 1=1"
    params = []

    if status:
        base_query += " AND p.status=%s"
        params.append(status)

    if search:
        base_query += " AND (p.title LIKE %s OR p.description LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])

    # Подсчет
    cur.execute(f"SELECT COUNT(*) as cnt {base_query}", params)
    total = cur.fetchone()["cnt"]
    total_pages = (total + per_page - 1) // per_page

    # Получение объявлений
    cur.execute(f"""
        SELECT p.id, p.title, p.price, p.currency, p.city, p.status, 
               p.created_at, p.views, p.calls, u.username, u.id as user_id
        {base_query}
        ORDER BY p.id DESC
        LIMIT %s OFFSET %s
    """, params + [per_page, offset])

    posts = cur.fetchall()

    # Статусы для фильтра - ИСЛОҲ: posts на post
    cur.execute("SELECT DISTINCT status FROM posts")
    statuses = [row["status"] for row in cur.fetchall()]

    db.close()

    return admin_templates.TemplateResponse(
        "posts.html",
        {
            "request": request,
            "posts": posts,
            "page": page,
            "total_pages": total_pages,
            "search": search,
            "status_filter": status,
            "statuses": statuses,
            "total": total
        }
    )

@router.get("/posts/{post_id}", response_class=HTMLResponse)
def admin_post_detail(request: Request, post_id: int, admin=Depends(is_admin)):
    """Детали объявления"""
    db = get_db()
    cur = db.cursor()

    # Информация об объявлении
    cur.execute("""
        SELECT p.*, u.username, u.phone as user_phone, u.avatar as user_avatar
        FROM posts p
        JOIN users u ON u.id=p.user_id
        WHERE p.id=%s
    """, (post_id,))
    post = cur.fetchone()

    if not post:
        db.close()
        raise HTTPException(404, "Post not found")

    # Фото
    cur.execute("SELECT filename FROM post_images WHERE post_id=%s", (post_id,))
    images = cur.fetchall()

    db.close()

    return admin_templates.TemplateResponse(
        "post_detail.html",
        {
            "request": request,
            "post": post,
            "images": images
        }
    )

@router.post("/posts/{post_id}/approve")
def admin_approve_post(request: Request, post_id: int, admin=Depends(is_admin)):
    """Одобрение объявления"""
    db = get_db()
    cur = db.cursor()
    cur.execute("UPDATE posts SET status='active' WHERE id=%s", (post_id,))
    db.commit()
    db.close()
    return {"status": "ok", "message": "Post approved"}

@router.post("/posts/{post_id}/reject")
def admin_reject_post(request: Request, post_id: int, reason: str = Form(""), admin=Depends(is_admin)):
    """Отклонение объявления"""
    db = get_db()
    cur = db.cursor()
    cur.execute("UPDATE posts SET status='rejected', reject_reason=%s WHERE id=%s", (reason, post_id))
    db.commit()
    db.close()
    return {"status": "ok", "message": "Post rejected"}

@router.delete("/posts/{post_id}")
def admin_delete_post(request: Request, post_id: int, admin=Depends(is_admin)):
    """Удаление объявления"""
    db = get_db()
    cur = db.cursor()

    # Удаление фото
    cur.execute("SELECT filename FROM post_images WHERE post_id=%s", (post_id,))
    images = cur.fetchall()
    for img in images:
        try:
            import os
            filepath = f"static/uploads/posts/{img['filename']}"
            if os.path.exists(filepath):
                os.remove(filepath)
        except:
            pass

    cur.execute("DELETE FROM post_images WHERE post_id=%s", (post_id,))
    cur.execute("DELETE FROM posts WHERE id=%s", (post_id,))
    db.commit()
    db.close()
    return {"status": "ok", "message": "Post deleted"}

# ========== CATEGORIES (КАТЕГОРИИ) ==========
@router.get("/categories", response_class=HTMLResponse)
def admin_categories(request: Request, admin=Depends(is_admin)):
    """Идоракунии категорияҳо"""
    db = get_db()
    cur = db.cursor()

    try:
        cur.execute("""
            SELECT c.*, 
                   (SELECT COUNT(*) FROM posts WHERE category=c.name) as posts_count
            FROM categories c
            ORDER BY c.sort_order, c.name
        """)
        categories = cur.fetchall()
    except:
        # Агар categories нест, аз posts гирифтан
        cur.execute("""
            SELECT category as name, COUNT(*) as posts_count 
            FROM posts 
            WHERE category IS NOT NULL AND category != ''
            GROUP BY category
        """)
        categories = cur.fetchall()

    db.close()

    return admin_templates.TemplateResponse(
        "categories.html",
        {
            "request": request,
            "categories": categories
        }
    )

@router.post("/categories/add")
def admin_add_category(
    request: Request,
    name: str = Form(...),
    icon: str = Form(""),
    sort_order: int = Form(0),
    admin=Depends(is_admin)
):
    """Иловаи категория"""
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "INSERT INTO categories (name, icon, sort_order) VALUES (%s, %s, %s)",
            (name, icon, sort_order)
        )
        db.commit()
        db.close()
        return {"status": "ok"}
    except:
        db.close()
        return {"status": "error", "message": "Categories table not found"}

# ========== REPORTS (ЖАЛОБЫ) ==========
@router.get("/reports", response_class=HTMLResponse)
def admin_reports(
    request: Request,
    status: Optional[str] = "pending",
    admin=Depends(is_admin)
):
    """Шикоятҳо - ҷадвал вуҷуд надорад"""
    return admin_templates.TemplateResponse(
        "reports.html",
        {
            "request": request,
            "reports": [],
            "status_filter": status
        }
    )

@router.post("/reports/{report_id}/resolve")
def admin_resolve_report(request: Request, report_id: int, action: str = Form(...), admin=Depends(is_admin)):
    """Решение жалобы"""
    return {"status": "error", "message": "Reports table not found"}

# ========== API ENDPOINTS ==========
@router.get("/api/stats")
def admin_api_stats(request: Request, admin=Depends(is_admin)):
    """API для графиков"""
    db = get_db()
    cur = db.cursor()

    # Статистика за последние 7 дней
    cur.execute("""
        SELECT 
            DATE(last_seen) as date,
            COUNT(*) as count
        FROM users
        WHERE last_seen >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(last_seen)
        ORDER BY date
    """)
    users_chart = cur.fetchall()

    cur.execute("""
        SELECT
            DATE(created_at) as date,
            COUNT(*) as count
        FROM posts
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date
    """)
    posts_chart = cur.fetchall()

    db.close()

    return {
        "users_chart": users_chart,
        "posts_chart": posts_chart
    }

