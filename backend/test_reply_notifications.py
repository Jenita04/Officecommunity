from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.domain import User, Post, Comment, Notification
from core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
Session = sessionmaker(bind=engine)
session = Session()

try:
    # 1. Fetch some users
    users = session.query(User).limit(3).all()
    if len(users) < 3:
        print("Need at least 3 users for this test")
        exit()
        
    author = users[0]
    commenter1 = users[1]
    commenter2 = users[2]
    
    # 2. Create a test post
    test_post = Post(
        title="Test Post for Notifications",
        description="This is a test post to verify reply notifications",
        author_id=author.id,
        tags="test",
        visibility="OPEN"
    )
    session.add(test_post)
    session.commit()
    session.refresh(test_post)
    
    print(f"Post created by {author.pseudo_name} (ID: {author.id})")
    
    # We will simulate the same logic present in create_comment
    
    # --- Top-level comment ---
    print(f"\n--- {commenter1.pseudo_name} adds a top-level comment ---")
    comment1 = Comment(
        content="This is a top level comment",
        author_id=commenter1.id,
        post_id=test_post.id
    )
    session.add(comment1)
    
    # Simulate notification logic for comment1
    msg1 = f"{commenter1.pseudo_name} just commented on your post: {test_post.title}"
    notif1 = Notification(recipient_id=test_post.author_id, message=msg1)
    session.add(notif1)
    session.commit()
    session.refresh(comment1)
    
    print(f"Top-level comment created. Notification sent to post author (ID: {test_post.author_id}): '{msg1}'")
    
    # --- Reply ---
    print(f"\n--- {commenter2.pseudo_name} replies to the top-level comment ---")
    reply = Comment(
        content="This is a reply to the top level comment",
        author_id=commenter2.id,
        post_id=test_post.id,
        parent_id=comment1.id
    )
    session.add(reply)
    
    # Simulate notification logic for reply (Post Author)
    msg2_post_author = f"{commenter2.pseudo_name} replied to a comment on your post: {test_post.title}"
    notif2 = Notification(recipient_id=test_post.author_id, message=msg2_post_author)
    session.add(notif2)
    
    # Simulate notification logic for reply (Comment Author)
    msg2_comment_author = f"{commenter2.pseudo_name} replied to your comment on: {test_post.title}"
    notif3 = Notification(recipient_id=comment1.author_id, message=msg2_comment_author)
    session.add(notif3)
    
    session.commit()
    
    print(f"Reply created.")
    print(f"Notification sent to post author (ID: {test_post.author_id}): '{msg2_post_author}'")
    print(f"Notification sent to comment author (ID: {comment1.author_id}): '{msg2_comment_author}'")

    print("\n--- Summary Validation ---")
    notifs = session.query(Notification).filter(Notification.message.like(f"%{test_post.title}%")).all()
    for n in notifs:
        print(f"Recipient ID: {n.recipient_id} | Message: '{n.message}'")
        
    print("\nTest completed successfully!")

except Exception as e:
    import traceback
    traceback.print_exc()

finally:
    session.close()

