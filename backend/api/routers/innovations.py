from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from models.base import get_db
from models.domain import Innovation, Post
from schemas.api_models import InnovationCreate, InnovationResponse, InnovationUpdate
from api.routers.feed import get_current_user
from models.domain import User

router = APIRouter()

@router.post("/")
def create_innovation(innovation_in: InnovationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_innovation = Innovation(
        **innovation_in.model_dump(),
        author_id=current_user.id
    )
    db.add(new_innovation)
    
    # +25 points for submitting an innovation
    current_user.reputation_score += 25
    db.commit()
    db.refresh(new_innovation)
    return {"status": "success", "id": new_innovation.id}

@router.get("/", response_model=List[InnovationResponse])
def get_innovations(db: Session = Depends(get_db)):
    innovations = db.query(Innovation).order_by(Innovation.votes_count.desc(), Innovation.id.desc()).all()
    return innovations

@router.get("/top", response_model=List[InnovationResponse])
def get_top_innovations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to view top innovations")
        
    innovations = db.query(Innovation).filter(Innovation.votes_count > 80).order_by(Innovation.votes_count.desc(), Innovation.id.desc()).all()
    return innovations

@router.post("/{innovation_id}/upvote")
def upvote_innovation(innovation_id: int, db: Session = Depends(get_db)):
    innovation = db.query(Innovation).filter(Innovation.id == innovation_id).first()
    if not innovation:
        raise HTTPException(status_code=404, detail="Innovation not found")
    
    innovation.votes_count += 1
    
    # Auto convert logic if score crosses threshold
    if innovation.votes_count >= 10 and innovation.status == "Idea":
        innovation.status = "Prototype"
        # In a real app, create a sprint workspace here
        
    # Bonus points for hitting >80 likes (exactly 81 to award once)
    if innovation.votes_count == 81:
        author = db.query(User).filter(User.id == innovation.author_id).first()
        if author:
            author.reputation_score += 75
            
    db.commit()
    return {"status": "success", "votes": innovation.votes_count, "stage": innovation.status}

@router.delete("/{innovation_id}")
def delete_innovation(innovation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    innovation = db.query(Innovation).filter(Innovation.id == innovation_id).first()
    if not innovation:
        raise HTTPException(status_code=404, detail="Innovation not found")
    
    if innovation.author_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to delete this innovation")
        
    # User loses the 25 points they gained from submitting
    current_user.reputation_score = max(0, current_user.reputation_score - 25)
    
    db.delete(innovation)
    db.commit()
    return {"status": "success"}

@router.put("/{innovation_id}", response_model=InnovationResponse)
def update_innovation(innovation_id: int, p_update: InnovationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    innovation = db.query(Innovation).filter(Innovation.id == innovation_id).first()
    if not innovation:
        raise HTTPException(status_code=404, detail="Innovation not found")
        
    if innovation.author_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to edit this innovation")
        
    update_data = p_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(innovation, key, value)
        
    db.commit()
    db.refresh(innovation)
    return innovation
