# ===== HELP PAGES ROUTES =====
# Файл: help_routes.py
# Инро ба main.py ё routers/help.py илова кунед

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter(prefix="/help", tags=["Help Pages"])
templates = Jinja2Templates(directory="templates")

# Main help page
@router.get("/", response_class=HTMLResponse)
def help_page(request: Request):
    return templates.TemplateResponse("help.html", {"request": request})

# Category pages
@router.get("/buying", response_class=HTMLResponse)
def help_buying(request: Request):
    return templates.TemplateResponse("buying.html", {"request": request})

@router.get("/selling", response_class=HTMLResponse)
def help_selling(request: Request):
    return templates.TemplateResponse("selling.html", {"request": request})

@router.get("/payments", response_class=HTMLResponse)
def help_payments(request: Request):
    return templates.TemplateResponse("payments.html", {"request": request})

@router.get("/delivery", response_class=HTMLResponse)
def help_delivery(request: Request):
    return templates.TemplateResponse("delivery.html", {"request": request})

# Article pages
@router.get("/how-to-post", response_class=HTMLResponse)
def help_how_to_post(request: Request):
    return templates.TemplateResponse("how-to-post.html", {"request": request})

@router.get("/how-to-buy", response_class=HTMLResponse)
def help_how_to_buy(request: Request):
    return templates.TemplateResponse("how-to-buy.html", {"request": request})

@router.get("/safety", response_class=HTMLResponse)
def help_safety(request: Request):
    return templates.TemplateResponse("safety.html", {"request": request})

@router.get("/scam", response_class=HTMLResponse)
def help_scam(request: Request):
    return templates.TemplateResponse("scam.html", {"request": request})

@router.get("/center", response_class=HTMLResponse)
def help_center(request: Request):
    return templates.TemplateResponse("center.html", {"request": request})

@router.get("/contact", response_class=HTMLResponse)
def help_contact(request: Request):
    return templates.TemplateResponse("contact.html", {"request": request})

@router.get("/privacy2", response_class=HTMLResponse)
def help_privacy2(request: Request):
    return templates.TemplateResponse("privacy2.html", {"request": request})

@router.get("/report", response_class=HTMLResponse)
def help_report(request: Request):
    return templates.TemplateResponse("report.html", {"request": request})

# API endpoint for contact form
@router.post("/contact-submit")
async def contact_submit(request: Request):
    """Формаи тамос"""
    form_data = await request.form()
    # Инҷо логикаи фиристодани email ё сабт дар DB
    return {"status": "success", "message": "Сообщение отправлено!"}

# API endpoint for report form  
@router.post("/report-submit")
async def report_submit(request: Request):
    """Формаи шикоят"""
    form_data = await request.form()
    # Инҷо логикаи сабти шикоят
    return {"status": "success", "message": "Жалоба принята!"}


