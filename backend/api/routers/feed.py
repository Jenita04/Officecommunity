import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from models.base import get_db
from models.domain import Post, User, Comment, Notification
from schemas.api_models import PostCreate, PostUpdate, PostResponse, CommentCreate, CommentResponse, CommentStatusUpdate

router = APIRouter()

from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from core.config import settings
from api.routers.auth import ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

@router.get("/", response_model=List[PostResponse])
def get_feed(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch posts based on visibility logic
    if current_user.role == "ADMIN":
        # Admins see everything
        posts = db.query(Post).order_by(Post.created_at.desc()).all()
    else:
        # Regular users see OPEN posts, OR CONTROLLED posts targeted to their team, OR posts they authored
        posts = db.query(Post).filter(
            (Post.visibility == 'OPEN') |
            ((Post.visibility == 'CONTROLLED') & (Post.visibility_group == current_user.team_id)) |
            (Post.author_id == current_user.id)
        ).order_by(Post.created_at.desc()).all()
        
    return posts

@router.post("/", response_model=PostResponse)
def create_post(post_in: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_post = Post(
        **post_in.model_dump(),
        author_id=current_user.id
    )
    db.add(new_post)
    db.flush() # Populate new_post.id
    
    # Points based on post type
    if post_in.type and post_in.type.lower() in ['technical help', 'kebs help']:
        current_user.reputation_score += 10
    else:
        current_user.reputation_score += 5
    
    # Send notifications to team members if visibility_group is provided
    if post_in.visibility_group:
        target_users = db.query(User).filter(
            User.team_id == post_in.visibility_group,
            User.id != current_user.id  # Don't notify the author
        ).all()
        
        for user in target_users:
            msg_type = "restricted post" if post_in.visibility == 'CONTROLLED' else "post"
            notification = Notification(
                recipient_id=user.id,
                message=f"{current_user.pseudo_name} shared a {msg_type} with your team: {post_in.title}",
                post_id=new_post.id
            )
            db.add(notification)
            
    db.commit()
    db.refresh(new_post)
    return new_post

@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, post_update: PostUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if post.author_id != current_user.id and current_user.role != "ADMIN" and current_user.role != "LEADERSHIP":
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")
        
    update_data = post_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(post, key, value)
        
    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if post.author_id != current_user.id and current_user.role != "ADMIN" and current_user.role != "LEADERSHIP":
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        
    # Deduct creation points from author
    author = db.query(User).filter(User.id == post.author_id).first()
    if author:
        points_to_deduct = 10 if post.type and post.type.lower() in ['technical help', 'kebs help'] else 5
        author.reputation_score = max(0, author.reputation_score - points_to_deduct)

    db.delete(post)
    db.commit()
    return {"status": "success", "message": "Post deleted"}

@router.post("/upload")
def upload_media(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    try:
        # Create a unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = f"uploads/{unique_filename}"
        
        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return serving URL (assuming base URL is https://kaartechapi.onrender.com)
        return {"media_url": f"https://kaartechapi.onrender.com/{file_path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/{post_id}/like", response_model=PostResponse)
def like_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    post.helpful_count += 1
    
    # +5 points to the author for providing helpful content
    author = db.query(User).filter(User.id == post.author_id).first()
    if author:
        author.reputation_score += 5
        
    db.commit()
    db.refresh(post)
    return post

@router.post("/{post_id}/comments", response_model=CommentResponse)
def create_comment(post_id: int, comment_in: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    new_comment = Comment(
        content=comment_in.content,
        author_id=current_user.id,
        post_id=post_id,
        parent_id=comment_in.parent_id
    )
    db.add(new_comment)
    
    # +5 points for providing a comment
    current_user.reputation_score += 5
    
    # Send notification to the post author
    if post.author_id != current_user.id:
        if comment_in.parent_id:
            msg = f"{current_user.pseudo_name} replied to a comment on your post: {post.title}"
        else:
            msg = f"{current_user.pseudo_name} just commented on your post: {post.title}"
            
        notification = Notification(
            recipient_id=post.author_id,
            message=msg,
            post_id=post.id
        )
        db.add(notification)
        
    # Send notification to the parent comment author if it's a reply
    if comment_in.parent_id:
        parent_comment = db.query(Comment).filter(Comment.id == comment_in.parent_id).first()
        if parent_comment and parent_comment.author_id != current_user.id and parent_comment.author_id != post.author_id:
            reply_notification = Notification(
                recipient_id=parent_comment.author_id,
                message=f"{current_user.pseudo_name} replied to your comment on: {post.title}",
                post_id=post.id
            )
            db.add(reply_notification)
            
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.put("/{post_id}/comments/{comment_id}/resolve", response_model=CommentResponse)
def update_comment_status(
    post_id: int, 
    comment_id: int, 
    status_update: CommentStatusUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the post author can set resolution status.")
        
    comment = db.query(Comment).filter(Comment.id == comment_id, Comment.post_id == post_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    if status_update.resolution_status == 'RESOLVED' and comment.resolution_status != 'RESOLVED':
        comment_author = db.query(User).filter(User.id == comment.author_id).first()
        if comment_author:
            comment_author.reputation_score += 30
            
            # Check for verification badge eligibility
            resolved_count = db.query(Comment).filter(
                Comment.author_id == comment_author.id,
                Comment.resolution_status == 'RESOLVED'
            ).count()
            
            # Since this current comment is being resolved right now, add 1
            if resolved_count + 1 >= 15:
                comment_author.is_verified = True
            
    comment.resolution_status = status_update.resolution_status
    db.commit()
    db.refresh(comment)
    return comment
