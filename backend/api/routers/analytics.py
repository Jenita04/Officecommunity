from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any

from models.base import get_db
from models.domain import User, Post, Innovation, FailureLearning, Comment
from api.routers.feed import get_current_user

router = APIRouter()

@router.get("/summary", response_model=Dict[str, Any])
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve top-level aggregates
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_posts = db.query(func.count(Post.id)).scalar() or 0
    total_innovations = db.query(func.count(Innovation.id)).scalar() or 0
    total_failures = db.query(func.count(FailureLearning.id)).scalar() or 0
    
    # 1. Which post type has more queries (Top 10)
    most_queried_type_rows = (
        db.query(Post.type, func.count(Post.id).label('count'))
        .group_by(Post.type)
        .order_by(func.count(Post.id).desc())
        .limit(10)
        .all()
    )
    most_queried_post_types = [{"type": row[0] or "General", "count": row[1]} for row in most_queried_type_rows]

    # 2. Which user produces more resolved queries (Top 10)
    top_solvers_rows = (
        db.query(User.pseudo_name, func.count(Comment.id).label('count'))
        .join(Comment, Comment.author_id == User.id)
        .filter(Comment.resolution_status == "RESOLVED")
        .group_by(User.id)
        .order_by(func.count(Comment.id).desc())
        .limit(10)
        .all()
    )
    top_problem_solvers = [{"pseudo_name": row[0], "count": row[1]} for row in top_solvers_rows]

    # 3. Who has most likes in failure (Most useful failure - Top 10)
    most_useful_failures_rows = (
        db.query(FailureLearning.context, FailureLearning.useful_count, User.pseudo_name)
        .join(User, FailureLearning.author_id == User.id)
        .order_by(FailureLearning.useful_count.desc())
        .limit(10)
        .all()
    )
    most_useful_failures = [
        {"context": row[0], "likes": row[1], "author": row[2]} for row in most_useful_failures_rows
    ]

    # 4. Which innovation has most likes (Top 10)
    most_liked_innovations_rows = (
        db.query(Innovation.business_pain_point, Innovation.votes_count, User.pseudo_name)
        .join(User, Innovation.author_id == User.id)
        .order_by(Innovation.votes_count.desc())
        .limit(10)
        .all()
    )
    most_liked_innovations = [
        {"title": row[0], "likes": row[1], "author": row[2]} for row in most_liked_innovations_rows
    ]
    
    # Calculate some dynamic metrics
    health_score = 100
    if total_users == 0:
        health_score = 0
    else:
        # Simple mock logic for platform health based on engagement
        engagement_ratio = (total_posts + total_innovations + total_failures) / total_users
        health_score = min(100, int(50 + (engagement_ratio * 10)))

    return {
        "metrics": {
            "total_users": total_users,
            "total_knowledge_posts": total_posts,
            "active_innovations": total_innovations,
            "failures_logged": total_failures
        },
        "health": {
            "score": health_score,
            "status": "Excellent" if health_score > 80 else "Good" if health_score > 60 else "Needs Attention"
        },
        "insights": {
            "most_queried_post_types": most_queried_post_types,
            "top_problem_solvers": top_problem_solvers,
            "most_useful_failures": most_useful_failures,
            "most_liked_innovations": most_liked_innovations
        }
    }
