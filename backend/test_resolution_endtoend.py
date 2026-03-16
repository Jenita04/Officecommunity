from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.domain import User, Post, Comment
from core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
Session = sessionmaker(bind=engine)
session = Session()

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# 1. Get the admin user token
user = session.query(User).filter(User.email=="admin@kaartech.com").first()

response = client.post(
    "/api/auth/login",
    data={"username": user.email, "password": "admin123"}
)
token = response.json().get("access_token")

# 2. Create a test post
post_res = client.post(
    "/api/feed/",
    json={"title": "Test Resolution", "description": "test", "tags": "test", "visibility": "OPEN"},
    headers={"Authorization": f"Bearer {token}"}
)
post_id = post_res.json().get("id")

# 3. Create a test comment
comment_res = client.post(
    f"/api/feed/{post_id}/comments",
    json={"content": "Test comment"},
    headers={"Authorization": f"Bearer {token}"}
)
comment_id = comment_res.json().get("id")

# 4. Resolve the comment
status_res = client.put(
    f"/api/feed/{post_id}/comments/{comment_id}/status",
    json={"resolution_status": "RESOLVED"},
    headers={"Authorization": f"Bearer {token}"}
)

print("Status Code:", status_res.status_code)
print("Response JSON:", status_res.json())

session.close()
