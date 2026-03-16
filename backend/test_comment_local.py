from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.domain import User, Post, Comment
from core.config import settings
from pydantic import ValidationError

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
Session = sessionmaker(bind=engine)
session = Session()

import traceback
with open("test_out.txt", "w") as f:
    try:
        user = session.query(User).first()
        post = session.query(Post).first()
        
        # Create Reply
        reply_comment = Comment(content="Reply", author_id=user.id, post_id=post.id, parent_id=1)
        session.add(reply_comment)
        session.commit()
        session.refresh(reply_comment)
        
        from schemas.api_models import CommentResponse
        
        f.write("Testing reply comment serialization...\n")
        try:
            res2 = CommentResponse.model_validate(reply_comment)
            f.write("Success 2\n")
        except Exception as e:
            f.write(f"Error 2: {str(e)}\n")

    except Exception as e:
        f.write(traceback.format_exc())
    finally:
        session.close()
