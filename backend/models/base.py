from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from core.config import settings

if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif settings.SQLALCHEMY_DATABASE_URI.startswith("postgresql"):
    # Fix for SQLAlchemy 2.0 + psycopg 3 + NeonDB Pooler (Render)
    connect_args = {"sslmode": "require"}
else:
    connect_args = {}

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
