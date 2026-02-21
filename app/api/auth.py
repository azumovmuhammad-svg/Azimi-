from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import session, models
from app.core.security import hash_pwd, verify_pwd, create_access_token

router = APIRouter()

def get_db():
    db = session.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(username: str, password: str, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username==username).first():
        raise HTTPException(status_code=400, detail="User exists")
    user = models.User(username=username, password=hash_pwd(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return {"id": user.id, "username": user.username, "token": token}

@router.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username==username).first()
    if not user or not verify_pwd(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.id)
    return {"id": user.id, "username": user.username, "token": token}
