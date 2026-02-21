# app/chat.py
from fastapi import APIRouter, Form, WebSocket, WebSocketDisconnect, HTTPException
from app.auth import get_db
from fastapi import Query
from app.db import get_db
from fastapi import UploadFile, File
import uuid
import os
from datetime import datetime
import pymysql
from typing import Optional
from fastapi import Request
import time  # Барои timestamp дар avatar URL

router = APIRouter(prefix="/chat")


VOICE_DIR = "uploads/voice"
os.makedirs(VOICE_DIR, exist_ok=True)


# WebSocket connections
connections = {}

# Сохтани ҷадвали messages (агар набошад)
def create_messages_table():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.commit()
    db.close()

create_messages_table()

@router.get("/history")
def get_chat_history(request: Request):
    """Гирифтани рӯйхати чатҳои корбар бо охирин паём"""
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "Unauthorized")

    db = get_db()
    cursor = db.cursor(pymysql.cursors.DictCursor)

    cursor.execute("""
        SELECT 
            u.id as contact_id,
            u.username,
            u.avatar,
            m.content as last_message,
            m.created_at as last_time,
            m.sender_id as last_sender_id
        FROM users u
        JOIN (
            SELECT
                CASE
                    WHEN sender_id = %s THEN receiver_id
                    ELSE sender_id
                END as contact_id,
                MAX(id) as last_msg_id
            FROM messages
            WHERE sender_id = %s OR receiver_id = %s
            GROUP BY contact_id
        ) chats ON u.id = chats.contact_id
        JOIN messages m ON m.id = chats.last_msg_id
        ORDER BY m.created_at DESC
    """, (user_id, user_id, user_id))

    history = cursor.fetchall()
    db.close()

    # Формат кардан
    for item in history:
        if item['last_time']:
            item['last_time'] = item['last_time'].strftime("%H:%M")
        if item['last_message'] and len(item['last_message']) > 50:
            item['last_message'] = item['last_message'][:50] + "..."
        # === ИЛОВА: Формат кардани avatar ===
        if item['avatar']:
            # Агар avatar аллакай бо / оғоз шавад, дигар илова накун
            if not item['avatar'].startswith('/'):
                item['avatar'] = '/' + item['avatar']
            # Иловаи timestamp барои cache-busting
            item['avatar'] = item['avatar'] + "?v=" + str(int(time.time()))
        else:
            item['avatar'] = '/static/default-avatar.png'

        item['current_user_id'] = user_id

    return history


#START
@router.post("/start")
async def start_chat(
    request: Request,
    seller_id: int = Form(...),
    post_id: Optional[int] = Form(None)
):
    """Оғози чат бо фурӯшанда"""
    user_id = request.session.get("user_id")

    # === ЛОГ ===
    print(f"CHAT START DEBUG: user_id={user_id}, seller_id={seller_id}, post_id={post_id}")
    # ===========

    if not user_id:
        raise HTTPException(401, "Unauthorized")

    if user_id == seller_id:
        raise HTTPException(400, "Cannot chat with yourself")

    db = get_db()
    cursor = db.cursor(pymysql.cursors.DictCursor)

    # Проверка вуҷуди фурӯшанда
    cursor.execute("SELECT id, username FROM users WHERE id = %s", (seller_id,))
    seller = cursor.fetchone()

    if not seller:
        db.close()
        raise HTTPException(404, "Seller not found")

    # Проверка вуҷуди пост (агар post_id бошад)
    if post_id:
        cursor.execute("SELECT title, user_id FROM posts WHERE id = %s", (post_id,))
        post = cursor.fetchone()
        if post:
            # Проверка ки пост ба ҳамин фурӯшанда тааллуқ дорад
            if post['user_id'] != seller_id:
                db.close()
                raise HTTPException(400, "Post does not belong to this seller")

            first_msg = f"Салом! Ман ба эълони '{post['title']}' шавқам меомад."
            cursor.execute(
                "INSERT INTO messages (sender_id, receiver_id, content) VALUES (%s, %s, %s)",
                (user_id, seller_id, first_msg)
            )
            db.commit()

    db.close()

    return {
        "chat_id": f"{min(user_id, seller_id)}_{max(user_id, seller_id)}",
        "seller_id": seller_id,
        "seller_name": seller['username']
    }



@router.get("/contacts")
def get_contacts(user_id: int = Query(...)):
    db = get_db()
    cursor = db.cursor(pymysql.cursors.DictCursor)  # dict cursor барои JS
    cursor.execute(
        "SELECT id, username, avatar FROM users WHERE id != %s",
        (user_id,)
    )
    users = cursor.fetchall()
    db.close()
    return users

# Гирифтани user_id бо username
@router.get("/get_user")
def get_user(id: int = Query(...)):
    db = get_db()
    cursor = db.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT id, username, avatar FROM users WHERE id=%s", (id,))
    user = cursor.fetchone()
    db.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ---------- Гирифтани паёмҳо ----------
@router.get("/messages")
def get_messages(user1: int, user2: int):
    db = get_db()
    cursor = db.cursor(pymysql.cursors.DictCursor)  # DictCursor барои дастрасӣ ба сутунҳо бо ном
    cursor.execute("""
        SELECT sender_id, receiver_id, content, created_at
        FROM messages
        WHERE (sender_id=%s AND receiver_id=%s)
           OR (sender_id=%s AND receiver_id=%s)
        ORDER BY created_at ASC
    """, (user1, user2, user2, user1))
    msgs = cursor.fetchall()
    db.close()

    return [
        {
            "sender_id": m["sender_id"],
            "receiver_id": m["receiver_id"],
            "content": m["content"],
            "timestamp": m["created_at"].strftime("%H:%M")  # ⬅️ вақти паём
        } for m in msgs
    ]

# Сабти паём матнӣ
@router.post("/send")
def send_message(
    user_id: int = Form(...),
    receiver_id: int = Form(...),
    content: str = Form(...)
):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES (%s, %s, %s)",
        (user_id, receiver_id, content)
    )
    db.commit()
    db.close()

    # WebSocket real-time
    if receiver_id in connections:
        ws = connections[receiver_id]
        import asyncio
        time_now = datetime.now()
        timestamp = time_now.strftime("%H:%M")
        asyncio.create_task(ws.send_json({
            "sender_id": user_id,
            "receiver_id": receiver_id,
            "content": content,
            "timestamp": timestamp
        }))
    return {"message": "Message sent"}




# ---------- WebSocket real-time ----------
@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await websocket.accept()
    connections[user_id] = websocket
    try:
        while True:
            data = await websocket.receive_json()
            receiver_id = data.get("receiver_id")
            content = data.get("content")
            timestamp = datetime.now().strftime("%H:%M")  # ⬅️ timestamp илова

            # Фиристодан ба receiver, агар пайваст бошад
            if receiver_id in connections:
                await connections[receiver_id].send_json({
                    "sender_id": user_id,
                    "receiver_id": receiver_id,
                    "content": content,
                    "timestamp": timestamp
                })

    except WebSocketDisconnect:
        if user_id in connections:
            del connections[user_id]

# Сабти овоз
@router.post("/voice")
async def upload_voice(voice: UploadFile = File(...), sender_id: int = Form(...), receiver_id: int = Form(...)):
    filename = f"{uuid.uuid4()}.webm"
    filepath = os.path.join(VOICE_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(await voice.read())

    # Сабт дар база
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES (%s, %s, %s)",
        (sender_id, receiver_id, f'<audio controls src="/uploads/voice/{filename}"></audio>')
    )
    db.commit()
    db.close()

    return {"status": "ok", "file": filename}

