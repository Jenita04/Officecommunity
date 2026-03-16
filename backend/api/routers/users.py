from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from models.base import get_db
from models.domain import User, RoleEnum
from schemas.api_models import UserBase, UserUpdate, UserAdminResponse, PostResponse, InnovationResponse, FailureResponse, SuggestionResponse
from api.routers.feed import get_current_user
from models.domain import Post, Innovation, FailureLearning, Suggestion

router = APIRouter()

@router.get("/leaderboard", response_model=List[UserBase])
def get_leaderboard(db: Session = Depends(get_db), limit: int = 5):
    """Get top users ranked by reputation score."""
    top_users = db.query(User).order_by(User.reputation_score.desc()).limit(limit).all()
    return top_users

@router.get("/profile/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "pseudo_name": current_user.pseudo_name,
        "real_name": current_user.real_name,
        "role": str(current_user.role.value) if hasattr(current_user.role, 'value') else str(current_user.role),
        "reputation_score": current_user.reputation_score,
    }

@router.get("/profile/posts", response_model=List[PostResponse])
def get_my_posts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get posts authored by the current user."""
    posts = db.query(Post).filter(Post.author_id == current_user.id).order_by(Post.created_at.desc()).all()
    return posts

@router.get("/profile/innovations", response_model=List[InnovationResponse])
def get_my_innovations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get innovations authored by the current user."""
    innovations = db.query(Innovation).filter(Innovation.author_id == current_user.id).order_by(Innovation.id.desc()).all()
    return innovations

@router.get("/profile/failures", response_model=List[FailureResponse])
def get_my_failures(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get failures authored by the current user."""
    failures = db.query(FailureLearning).filter(FailureLearning.author_id == current_user.id).order_by(FailureLearning.created_at.desc()).all()
    return failures

@router.get("/profile/suggestions", response_model=List[SuggestionResponse])
def get_my_suggestions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get suggestions authored by the current user."""
    suggestions = db.query(Suggestion).filter(Suggestion.author_id == current_user.id).order_by(Suggestion.created_at.desc()).all()
    return suggestions

@router.post("/profile")
def update_profile(user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_update.pseudo_name:
        current_user.pseudo_name = user_update.pseudo_name
    if user_update.real_name:
        current_user.real_name = user_update.real_name
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/admin", response_model=List[UserAdminResponse])
def get_all_users_admin(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(User).all()
