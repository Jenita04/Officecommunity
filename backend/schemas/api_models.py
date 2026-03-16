from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    pseudo_name: str
    reputation_score: int
    is_verified: bool = False
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    pseudo_name: Optional[str] = None
    real_name: Optional[str] = None
    
class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    real_name: str
    email: str
    role: str
    team_id: Optional[str] = None
    pseudo_name: str
    password: str

class UserAdminResponse(BaseModel):
    id: int
    email: str
    pseudo_name: str
    real_name: Optional[str]
    role: str
    reputation_score: int
    
    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None
    
class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    author: UserBase
    parent_id: Optional[int] = None
    resolution_status: Optional[str] = None
    replies: Optional[List['CommentResponse']] = []
    
    class Config:
        from_attributes = True

# Resolve forward reference for replies
CommentResponse.model_rebuild()

class CommentStatusUpdate(BaseModel):
    resolution_status: str

class PostCreate(BaseModel):
    title: str
    description: str
    tags: str
    type: str = "general"
    media_url: Optional[str] = None
    visibility: str
    visibility_group: Optional[str] = None

class PostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    type: Optional[str] = None
    visibility: Optional[str] = None
    visibility_group: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    title: str
    description: str
    tags: str
    type: str
    media_url: Optional[str] = None
    visibility: str
    created_at: datetime
    author: UserBase
    helpful_count: int
    innovative_count: int
    critical_count: int
    is_solution_validated: bool
    comments: List[CommentResponse] = []
    
    class Config:
        from_attributes = True

class InnovationCreate(BaseModel):
    business_pain_point: str
    proposed_solution_concept: str
    expected_impact: str
    scalability_potential: str
    prototype_complexity: str
    source_post_id: Optional[int] = None

class InnovationResponse(BaseModel):
    id: int
    business_pain_point: str
    proposed_solution_concept: str
    expected_impact: str
    scalability_potential: str
    prototype_complexity: str
    votes_count: int
    status: str
    author: UserBase
    source_post_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class InnovationUpdate(BaseModel):
    business_pain_point: Optional[str] = None
    proposed_solution_concept: Optional[str] = None
    expected_impact: Optional[str] = None
    scalability_potential: Optional[str] = None
    prototype_complexity: Optional[str] = None

class FailureCreate(BaseModel):
    context: str
    wrong_assumption: str
    impact_level: str
    lesson_learned: str
    prevention_checklist: List[str]

class FailureUpdate(BaseModel):
    context: Optional[str] = None
    wrong_assumption: Optional[str] = None
    impact_level: Optional[str] = None
    lesson_learned: Optional[str] = None
    prevention_checklist: Optional[List[str]] = None

class FailureResponse(FailureCreate):
    id: int
    created_at: datetime
    useful_count: int = 0
    author: UserBase
    
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    post_id: Optional[int] = None
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    reported_item_type: str # POST, COMMENT, SUGGESTION, INNOVATION, FAILURE
    reported_item_id: int
    reason: str

class ReportResponse(BaseModel):
    id: int
    reporter_id: int
    reported_item_type: str
    reported_item_id: int
    reported_user_id: Optional[int] = None
    reason: str
    status: str
    created_at: datetime
    
    # Optional relationships to help admin frontend
    reporter: Optional[UserBase] = None
    reported_user: Optional[UserBase] = None
    
    class Config:
        from_attributes = True

class SuggestionCreate(BaseModel):
    title: str
    description: str

class SuggestionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class SuggestionResponse(SuggestionCreate):
    id: int
    votes_count: int
    created_at: datetime
    author: UserBase
    
    class Config:
        from_attributes = True

class SearchQuery(BaseModel):
    query: str
