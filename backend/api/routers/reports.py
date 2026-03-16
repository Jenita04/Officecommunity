from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.base import get_db
from models.domain import Report, User, RoleEnum, Post, Comment, Suggestion, Innovation, FailureLearning
from schemas.api_models import ReportCreate, ReportResponse
from api.routers.feed import get_current_user

router = APIRouter()

@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new report for an item."""
    
    # Optional logic to auto-resolve the reported user based on item type
    reported_user_id = None
    
    # Find the author of the reported item to populate reported_user_id
    item_type = report_in.reported_item_type.upper()
    try:
        if item_type == "POST":
            item = db.query(Post).filter(Post.id == report_in.reported_item_id).first()
            if item: reported_user_id = item.author_id
        elif item_type == "COMMENT":
            item = db.query(Comment).filter(Comment.id == report_in.reported_item_id).first()
            if item: reported_user_id = item.author_id
        elif item_type == "SUGGESTION":
            item = db.query(Suggestion).filter(Suggestion.id == report_in.reported_item_id).first()
            if item: reported_user_id = item.author_id
        elif item_type == "INNOVATION":
            item = db.query(Innovation).filter(Innovation.id == report_in.reported_item_id).first()
            if item: reported_user_id = item.author_id
        elif item_type == "FAILURE":
            item = db.query(FailureLearning).filter(FailureLearning.id == report_in.reported_item_id).first()
            if item: reported_user_id = item.author_id
    except Exception as e:
        print(f"Failed to find reported user id: {e}")
        pass

    new_report = Report(
        reporter_id=current_user.id,
        reported_item_type=item_type,
        reported_item_id=report_in.reported_item_id,
        reason=report_in.reason,
        reported_user_id=reported_user_id
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return new_report

@router.get("/", response_model=List[ReportResponse])
def get_all_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin only: Get all reports."""
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view reports"
        )
    return db.query(Report).order_by(Report.created_at.desc()).all()

@router.put("/{report_id}/status", response_model=ReportResponse)
def update_report_status(
    report_id: int,
    status_update: str, # "RESOLVED" or "DISMISSED"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin only: Update a report's status."""
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update reports"
        )
        
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if status_update.upper() not in ["PENDING", "RESOLVED", "DISMISSED"]:
         raise HTTPException(status_code=400, detail="Invalid status")
    
    report.status = status_update.upper()
    db.commit()
    db.refresh(report)
    return report
