from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import os
import json
from datetime import datetime

# ===== CONFIGURATION =====
router = APIRouter(prefix="/sado", tags=["Sado AI"])
templates = Jinja2Templates(directory="templates")

# Google Gemini API Key - аз environment variables гиред
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "your-api-key-here")
genai.configure(api_key=GOOGLE_API_KEY)

# Model configuration
model = genai.GenerativeModel('gemini-pro')

# ===== DATABASE MODELS =====
class SadoRequest(BaseModel):
    user_id: int
    message: str
    context: Optional[str] = None  # Мавзӯъи платформа (мошин, телефон, хона)

class ImageRequest(BaseModel):
    user_id: int
    description: str

# ===== SYSTEM PROMPT =====
SADO_SYSTEM_PROMPT = """
Ту Sado AI ҳастӣ - ёрии ҳушманди платформаи хариду фурӯши тоҷикӣ.

Қоидаҳо:
1. Ҳамеша ба тоҷикӣ ҷавоб диҳ (бо кириллӣ ё лотинӣ)
2. Ба саволҳои дар бораи мошинҳо, телефонҳо, амвол, маҳсулоти рӯзмарра ҷавоб диҳ
3. Агар корбар мошин ҷустуҷӯ кунад - нархҳо, моделҳо, солҳои истеҳсолро пешниҳод кун
4. Агар телефон ҷустуҷӯ кунад - iPhone, Samsung, Xiaomi ва ғайраро пешниҳод кун
5. Агар амвол ҷустуҷӯ кунад - хонаҳо, квартираҳо, заминро пешниҳод кун
6. Ҳамеша дӯстона, касбӣ ва кӯмаккунанда бош
7. Агар корбар хоҳиши фурӯши чизе дошта бошад, роҳнамоиаш кун

Мисолҳои ҷавоб:
- "Салом! Ман метавонам ба шумо дар ёфтани мошини дилхоҳ кӯмак кунам. Чӣ гуна мошин меҷӯед?"
- "iPhone 15 Pro Max дар бозори Тоҷикистон аз 12000 сомонӣ шурӯъ мешавад. Моделҳои дигарро нишон диҳам?"
"""

# ===== DATABASE FUNCTIONS =====
def get_db():
    # Функсияи пайвастшавӣ ба database-и шумо
    from app.auth import get_db as auth_get_db
    return auth_get_db()

def save_message(user_id: int, role: str, text: str):
    """Сабти паём дар database"""
    try:
        db = get_db()
        cur = db.cursor()
        cur.execute(
            "INSERT INTO sado_messages (user_id, role, message, created_at) VALUES (%s,%s,%s,%s)",
            (user_id, role, text, datetime.now())
        )
        db.commit()
        db.close()
    except Exception as e:
        print(f"Error saving message: {e}")

def get_user_history(user_id: int, limit: int = 10) -> List[dict]:
    """Гирифтани таърихи чат"""
    try:
        db = get_db()
        cur = db.cursor(dictionary=True)
        cur.execute("""
            SELECT role, message, created_at
            FROM sado_messages
            WHERE user_id=%s
            ORDER BY id DESC
            LIMIT %s
        """, (user_id, limit))
        rows = cur.fetchall()
        db.close()
        return list(reversed(rows))  # Баръакс кун барои tartibi durust
    except Exception as e:
        print(f"Error getting history: {e}")
        return []

# ===== AI FUNCTIONS =====
def build_conversation_context(user_id: int, current_message: str) -> List[dict]:
    """Сохтани контексти суҳбат барои AI"""
    history = get_user_history(user_id, limit=5)

    conversation = []

    # System prompt
    conversation.append({
        "role": "user",
        "parts": [SADO_SYSTEM_PROMPT]
    })
    conversation.append({
        "role": "model", 
        "parts": ["Фаҳмидам. Ман Sado AI ҳастам ва ба тоҷикӣ ҷавоб медиҳам."]
    })

    # Таърихи чат
    for msg in history:
        if msg['role'] == 'user':
            conversation.append({"role": "user", "parts": [msg['message']]})
        else:
            conversation.append({"role": "model", "parts": [msg['message']]})

    # Паёми ҷорӣ
    conversation.append({"role": "user", "parts": [current_message]})

    return conversation

def get_ai_reply(user_id: int, message: str) -> str:
    """Гирифтани ҷавоб аз Google Gemini"""
    try:
        # Сохтани контекст
        conversation = build_conversation_context(user_id, message)

        # Сохтани чат
        chat = model.start_chat(history=conversation[:-1])  # Бе паёми охирин

        # Фиристодани паём
        response = chat.send_message(message)

        return response.text

    except Exception as e:
        print(f"AI Error: {e}")
        # Fallback ба ҷавоби оддӣ
        return f"Sado AI: Бубахшед, ман наметавонам ҳозир ҷавоб диҳам. Хатогӣ: {str(e)[:100]}"

# ===== ENDPOINTS =====

@router.get("/sado", response_class=HTMLResponse)
def sado_page(request: Request):
    """Саҳифаи асосии Sado AI"""
    return templates.TemplateResponse("sado.html", {"request": request})

@router.post("/ask")
def ask_sado(data: SadoRequest):
    """Асосӣ endpoint барои суол додан"""

    # Сабт кардани паёми корбар
    save_message(data.user_id, "user", data.message)

    # Гирифтани ҷавоб аз AI
    reply = get_ai_reply(data.user_id, data.message)

    # Сабт кардани ҷавоби AI
    save_message(data.user_id, "sado", reply)

    return JSONResponse({
        "reply": reply,
        "status": "success",
        "timestamp": datetime.now().isoformat()
    })

@router.get("/history")
def sado_history(user_id: int):
    """Гирифтани таърихи чат"""
    history = get_user_history(user_id, limit=20)
    return JSONResponse({
        "history": history,
        "count": len(history)
    })

@router.post("/clear-history")
def clear_history(user_id: int):
    """Пок кардани таърихи чат"""
    try:
        db = get_db()
        cur = db.cursor()
        cur.execute("DELETE FROM sado_messages WHERE user_id=%s", (user_id,))
        db.commit()
        db.close()
        return JSONResponse({"status": "success", "message": "Таърих пок шуд"})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)})

# ===== IMAGE GENERATION (Mock - бо AI тасвирҳо) =====
mock_images_db = {
    "мошин": ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400", 
              "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400"],
    "car": ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400"],
    "телефон": ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"],
    "iphone": ["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400"],
    "хона": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
    "house": ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"]
}

@router.post("/generate-image")
def generate_image(data: ImageRequest):
    """Генератсияи тасвир (mock)"""
    desc_lower = data.description.lower()

    # Ёфтани категория
    category = "default"
    for key in mock_images_db.keys():
        if key in desc_lower:
            category = key
            break

    import random
    image_url = random.choice(mock_images_db.get(category, ["https://via.placeholder.com/400"]))

    return JSONResponse({
        "description": data.description,
        "image_url": image_url,
        "category": category,
        "message": f"Тасвири '{data.description}' омода шуд"
    })


============================================================
✅ Коди backend омода аст!
============================================================
