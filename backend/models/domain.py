from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
import enum
import datetime
from models.base import Base

class VisibilityMode(str, enum.Enum):
    OPEN = "OPEN"
    CONTROLLED = "CONTROLLED"

class RoleEnum(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    INNOVATION_MENTOR = "INNOVATION_MENTOR"
    ADMIN = "ADMIN"
    LEADERSHIP = "LEADERSHIP"

class User(Base):
    __tablename__ = "users"
    
    # Real Identity (Secure)
    id = Column(Integer, primary_key=True, index=True)
    real_name = Column(String, nullable=True) # E.g. John Doe
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default=RoleEnum.EMPLOYEE)
    team_id = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    
    # Pseudo Identity (Public)
    pseudo_name = Column(String, unique=True, index=True, nullable=False)
    reputation_score = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    
    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    tags = Column(String) # JSON or comma separated string
    type = Column(String, default="general") # information, general, achievement, etc.
    media_url = Column(String, nullable=True) # URL for uploaded image/video
    visibility = Column(String, default=VisibilityMode.OPEN)
    visibility_group = Column(String, nullable=True) # e.g. "SAP Module Community"
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="posts")
    
    # Simple reactions count for mockup
    helpful_count = Column(Integer, default=0)
    innovative_count = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    
    is_solution_validated = Column(Boolean, default=False)
    
    innovations = relationship("Innovation", back_populates="source_post")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    author_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    resolution_status = Column(String, nullable=True)
    
    author = relationship("User")
    post = relationship("Post", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], backref="replies")

class Innovation(Base):
    __tablename__ = "innovations"
    
    id = Column(Integer, primary_key=True, index=True)
    business_pain_point = Column(Text, nullable=False)
    proposed_solution_concept = Column(Text, nullable=False)
    expected_impact = Column(Text)
    scalability_potential = Column(Text)
    prototype_complexity = Column(String)
    
    votes_count = Column(Integer, default=0)
    status = Column(String, default="Idea") # Idea, Evaluation, Prototype, Pilot, Asset
    
    author_id = Column(Integer, ForeignKey("users.id"))
    source_post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    
    author = relationship("User")
    source_post = relationship("Post", back_populates="innovations")

class FailureLearning(Base):
    __tablename__ = "failures"
    
    id = Column(Integer, primary_key=True, index=True)
    context = Column(Text, nullable=False)
    wrong_assumption = Column(Text, nullable=False)
    impact_level = Column(String)
    lesson_learned = Column(Text, nullable=False)
    prevention_checklist = Column(JSON) # List of strings
    useful_count = Column(Integer, default=0)
    
    author_id = Column(Integer, ForeignKey("users.id"))
    
    author = relationship("User")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    recipient = relationship("User", foreign_keys=[recipient_id])
    post = relationship("Post")

class Suggestion(Base):
    __tablename__ = "suggestions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    votes_count = Column(Integer, default=0)
    
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"))
    reported_item_type = Column(String, nullable=False) # e.g. POST, COMMENT, SUGGESTION, INNOVATION, FAILURE
    reported_item_id = Column(Integer, nullable=False)
    reported_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reason = Column(String, nullable=False)
    status = Column(String, default="PENDING") # PENDING, RESOLVED, DISMISSED
    
    reporter = relationship("User", foreign_keys=[reporter_id])
    reported_user = relationship("User", foreign_keys=[reported_user_id])
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
