from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.chat import router as chat_router
from app.auth import router as auth_router
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from app.post import post_auth_router, post_public_router
from app.shorts import shorts_router
from fastapi import Depends
from app. help_router import router as help_router
from app.favorite import favorite_router
from app.admin.router import router as admin_router
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

# ========== MIDDLEWARE: Проверка авторизации ==========
# ТАРТИБИ БАРЪАКС: AuthMiddleware аввал илова мешавад, аммо баъд иҷро мешавад

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        method = request.method
        user_id = request.session.get("user_id")

        # Роҳҳои кушода (бе логин) - ХОНДАН
        public_paths = [
            "/",           # Асосӣ
            "/feed",       # Лента
            "/login", 
            "/register",
            "/api/post/",  # API эълонҳо (хондан)
            "/post/",      # Саҳифаи эълони якка
            "/static/",    # Файлҳои статик
            "/uploads/",   # Аксҳо
            "/auth/send_code",  # Фиристодани код
            "/auth/login",      # Логин
            "/auth/feed-data",  # Данные ленты
        ]

        # Санҷед, ки оё роҳ кушода аст
        is_public = any(path.startswith(p) for p in public_paths)

        # Саҳифаҳои эҷоди эълон (танҳо бо логин)
        protected_paths = [
            "/auth/add",
            "/auth/add2", 
            "/auth/add3",
            "/auth/add4",
            "/auth/add-selection",
            "/auth/post/",
            "/auth/my-ads",
            "/auth/my-ad/",
            "/auth/settings",
            "/auth/profile",
            "/auth/history",
            "/chat",
            "/contacts",
            "/shorts",
            "/auth/like/",
        ]

        is_protected = any(path.startswith(p) for p in protected_paths)

        # Агар кушода бошад ё корбар логин карда бошад
        if is_public or user_id:
            return await call_next(request)

        # Агар саҳифаи махфӣ бошад ва логин набошад - ба лента
        if is_protected:
            return RedirectResponse("/feed")

        # Боқимонда ҳама кушода
        return await call_next(request)

# Иловаи AuthMiddleware АВВАЛ (баъд иҷро мешавад)
app.add_middleware(AuthMiddleware)

# Иловаи SessionMiddleware БАЪД (аввал иҷро мешавад)
app.add_middleware(
    SessionMiddleware,
    secret_key="SUPER_SECRET_KEY_123"
)
# =====================================================

# Static files (CSS, JS, images)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Templates
templates = Jinja2Templates(directory="templates")

# Routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(post_auth_router)
app.include_router(post_public_router)
app.include_router(shorts_router)
app.include_router(help_router)
app.include_router(favorite_router)

# ⭐ АДМИН ПАНЕЛ РОУТЕР
app.include_router(admin_router)

@app.get("/")
def root():
    return RedirectResponse("/feed")

@app.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register")
def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/setup-profile")
def setup_profile(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        return RedirectResponse("/feed")
    return templates.TemplateResponse(
        "setup-profile.html",
        {"request": request}
    )

@app.get("/contacts")
def contacts_page(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        return RedirectResponse("/feed")
    return templates.TemplateResponse(
        "contacts.html",
        {"request": request, "user_id": user_id}
    )

@app.get("/profile")
def profile_page(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        return RedirectResponse("/feed")
    return templates.TemplateResponse("profile.html", {"request": request})

@app.get("/chat", response_class=HTMLResponse)
def chat_page(request: Request, user: int, peer: int):
    user_id = request.session.get("user_id")
    if not user_id:
        return RedirectResponse("/feed")

    return templates.TemplateResponse(
        "chat.html",
        {
            "request": request,
            "user_id": user_id,
            "peer_id": peer
        }
    )

@app.get("/feed", response_class=HTMLResponse)
def feed_page(request: Request):
    user_id = request.session.get("user_id")
    return templates.TemplateResponse(
        "feed.html",
        {
            "request": request,
            "is_logged_in": bool(user_id)
        }
    )

@app.get("/auth/history", response_class=HTMLResponse)
def history_page(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        return RedirectResponse("/feed")
    return templates.TemplateResponse(
        "history.html",
        {"request": request, "user_id": user_id}
    )

@app.get("/auth/me")
def get_current_user(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")
    return {"user_id": user_id}

@app.on_event("startup")
async def list_routes():
    for route in app.routes:
        print(f"Route: {route.path}")

@app.get("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/login")

