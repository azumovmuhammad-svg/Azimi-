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

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key="SUPER_SECRET_KEY_123"
)

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
    return templates.TemplateResponse(
        "setup-profile.html",
        {"request": request}
    )

@app.get("/contacts")
def contacts_page(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        return RedirectResponse("/login")
    return templates.TemplateResponse(
        "contacts.html",
        {"request": request, "user_id": user_id}
    )

@app.get("/profile")
def profile_page(request: Request):
    return templates.TemplateResponse("profile.html", {"request": request})

@app.get("/chat", response_class=HTMLResponse)
def chat_page(request: Request, user: int, peer: int):
    user_id = request.session.get("user_id")
    if not user_id:
        return RedirectResponse("/login")

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
        return RedirectResponse("/login")
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
