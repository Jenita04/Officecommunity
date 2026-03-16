from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.domain import User
from core.config import settings
import io

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
Session = sessionmaker(bind=engine)
session = Session()

users = session.query(User).all()

with io.open("users_output_utf8.txt", mode="w", encoding="utf-8") as f:
    for u in users:
        f.write(f"ID: {u.id}, Pseudo: '{u.pseudo_name}', Real: '{u.real_name}', Email: '{u.email}', Role: '{u.role}'\n")
