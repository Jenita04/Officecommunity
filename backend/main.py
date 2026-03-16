from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from models.base import engine, Base
from api.routers import feed, innovations, failures, search, users, auth, notifications, analytics, suggestions, reports
from models.domain import User, RoleEnum
from sqlalchemy.orm import Session
from models.base import SessionLocal
from api.routers.auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)
import os
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
def seed_admin_user():
    db = SessionLocal()
    try:
        if not db.query(User).first():
            print("Creating seed admin user...")
            admin_user = User(
                real_name="IT Admin",
                email="admin@kaartech.com",
                pseudo_name="Admin",
                role=RoleEnum.ADMIN.value,
                team_id="IT_SUPPORT",
                hashed_password=get_password_hash("admin123"),
                reputation_score=100
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()

# CORS setup for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for production (Vercel) & local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(feed.router, prefix="/api/feed", tags=["feed"])
app.include_router(innovations.router, prefix="/api/innovations", tags=["innovations"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(search.router, prefix="/api/discovery", tags=["discovery"])
app.include_router(failures.router, prefix="/api/failures", tags=["failures"])
app.include_router(suggestions.router, prefix="/api/suggestions", tags=["suggestions"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
