from fastapi import APIRouter, WebSocket, Header
from app.ws.manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(ws: WebSocket, user_id: int, token: str = Header(...)):
    # ⚠ Token verification skipped for now (later decode JWT)
    await manager.connect(user_id, ws)
    try:
        while True:
            data = await ws.receive_text()
            await manager.send_personal_message(user_id, f"You said: {data}")
    except:
        manager.disconnect(user_id)
