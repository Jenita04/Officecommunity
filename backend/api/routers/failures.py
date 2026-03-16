from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from models.base import get_db
from models.domain import FailureLearning, User
from schemas.api_models import FailureCreate, FailureResponse, FailureUpdate
from api.routers.feed import get_current_user
from typing import List
from fastapi import HTTPException

router = APIRouter()

@router.post("/")
def create_failure_learning(failure_in: FailureCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_failure = FailureLearning(
        **failure_in.model_dump(),
        author_id=current_user.id
    )
    db.add(new_failure)
    
    # +35 points for logging a failure
    current_user.reputation_score += 35
    
    db.commit()
    db.refresh(new_failure)
    return new_failure

@router.get("/", response_model=List[FailureResponse])
def get_failures(db: Session = Depends(get_db)):
    failures = db.query(FailureLearning).order_by(FailureLearning.created_at.desc()).all()
    return failures

@router.post("/{failure_id}/useful")
def mark_failure_useful(failure_id: int, db: Session = Depends(get_db)):
    failure = db.query(FailureLearning).filter(FailureLearning.id == failure_id).first()
    if not failure:
        raise HTTPException(status_code=404, detail="Failure not found")
    
    failure.useful_count = getattr(failure, 'useful_count', 0) + 1
    
    # Optional: award points to author
    author = db.query(User).filter(User.id == failure.author_id).first()
    if author:
        author.reputation_score += 5
        
    db.commit()
    return {"status": "success", "useful_count": failure.useful_count}

@router.delete("/{failure_id}")
def delete_failure(failure_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    failure = db.query(FailureLearning).filter(FailureLearning.id == failure_id).first()
    if not failure:
        raise HTTPException(status_code=404, detail="Failure not found")
    
    if failure.author_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to delete this failure")
        
    # User loses the 35 points they gained from submitting
    current_user.reputation_score = max(0, current_user.reputation_score - 35)
    
    db.delete(failure)
    db.commit()
    return {"status": "success"}

@router.put("/{failure_id}", response_model=FailureResponse)
def update_failure(failure_id: int, p_update: FailureUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    failure = db.query(FailureLearning).filter(FailureLearning.id == failure_id).first()
    if not failure:
        raise HTTPException(status_code=404, detail="Failure not found")
        
    if failure.author_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to edit this failure")
        
    update_data = p_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(failure, key, value)
        
    db.commit()
    db.refresh(failure)
    return failure
