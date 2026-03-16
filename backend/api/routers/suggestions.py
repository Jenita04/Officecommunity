from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.base import get_db
from models.domain import Suggestion, User, RoleEnum
from schemas.api_models import SuggestionCreate, SuggestionResponse, SuggestionUpdate
from api.routers.feed import get_current_user

router = APIRouter()

@router.get("/", response_model=List[SuggestionResponse])
def get_all_suggestions(db: Session = Depends(get_db)):
    """Get all suggestions, ordered by created date."""
    return db.query(Suggestion).order_by(Suggestion.created_at.desc()).all()

@router.get("/top", response_model=List[SuggestionResponse])
def get_top_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin only: Get suggestions with more than 80 upvotes."""
    if current_user.role != RoleEnum.ADMIN:
         raise HTTPException(
             status_code=status.HTTP_403_FORBIDDEN,
             detail="Not authorized to view top suggestions"
         )
    return db.query(Suggestion).filter(Suggestion.votes_count > 80).order_by(Suggestion.votes_count.desc()).all()

@router.post("/", response_model=SuggestionResponse, status_code=status.HTTP_201_CREATED)
def create_suggestion(
    suggestion_in: SuggestionCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Create a new suggestion and award author 10 points."""
    new_suggestion = Suggestion(
        title=suggestion_in.title,
        description=suggestion_in.description,
        author_id=current_user.id
    )
    
    # Award 10 points for a suggestion post
    current_user.reputation_score += 10
    
    db.add(new_suggestion)
    db.commit()
    db.refresh(new_suggestion)
    db.refresh(current_user)
    
    return new_suggestion

@router.post("/{suggestion_id}/upvote")
def upvote_suggestion(
    suggestion_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Upvote a suggestion. At 81 votes, award author 60 points."""
    suggestion = db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
        
    suggestion.votes_count += 1
    
    # Check for the 60 bonus points threshold (votes > 80)
    # Give it precisely when it transitions to 81 to avoid duplicate awards
    if suggestion.votes_count == 81:
        author = db.query(User).filter(User.id == suggestion.author_id).first()
        if author:
             author.reputation_score += 60
             
    db.commit()
    db.refresh(suggestion)
    return {"message": "Suggestion upvoted successfully", "votes_count": suggestion.votes_count}

@router.put("/{suggestion_id}", response_model=SuggestionResponse)
def update_suggestion(
    suggestion_id: int, 
    suggestion_in: SuggestionUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Update a suggestion if the current user is the author."""
    suggestion = db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
        
    if suggestion.author_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to modify this suggestion")
         
    if suggestion_in.title is not None:
         suggestion.title = suggestion_in.title
    if suggestion_in.description is not None:
         suggestion.description = suggestion_in.description
         
    db.commit()
    db.refresh(suggestion)
    return suggestion

@router.delete("/{suggestion_id}")
def delete_suggestion(
    suggestion_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Delete a suggestion if the current user is the author."""
    suggestion = db.query(Suggestion).filter(Suggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
        
    if suggestion.author_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to delete this suggestion")
         
    db.delete(suggestion)
    db.commit()
    return {"message": "Suggestion deleted successfully"}
