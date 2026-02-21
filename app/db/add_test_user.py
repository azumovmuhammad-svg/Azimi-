from app.db.database import SessionLocal, engine
from app.db.models import Base, User
from passlib.context import CryptContext

# Эҷоди ҷадвалҳо агар набошад
Base.metadata.create_all(bind=engine)

# Барои хеш кардани парол
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Сессияи база
db = SessionLocal()

# Санҷиши корбар
username = "azimov"
password = "maga23"

# Проверка, ки корбар ҳаст ё не
existing_user = db.query(User).filter(User.username == username).first()
if existing_user:
    print(f"User {username} already exists")
else:
    hashed_password = pwd_context.hash(password)
    new_user = User(username=username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    print(f"User {username} added successfully")

db.close()
