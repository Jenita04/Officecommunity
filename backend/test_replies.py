import urllib.request
import json
import urllib.error

# We will use Admin
url_login = 'http://localhost:8000/api/auth/login'
data_login = {
    "username": "Admin",
    "password": "password"
}
req_login = urllib.request.Request(url_login, data=json.dumps(data_login).encode('utf-8'), headers={'Content-Type': 'application/json'})
resp_login = urllib.request.urlopen(req_login)
token = json.loads(resp_login.read().decode('utf-8'))['access_token']

# Create a post
url_post = 'http://localhost:8000/api/feed/'
data_post = {
    "title": "Reply Test Post",
    "description": "Test description",
    "tags": "test",
    "type": "general",
    "visibility": "OPEN"
}
req_post = urllib.request.Request(url_post, data=json.dumps(data_post).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'})
resp_post = urllib.request.urlopen(req_post)
post_id = json.loads(resp_post.read().decode('utf-8'))['id']
print("Created Post ID:", post_id)

# Create Top-Level Comment
url_comment = f'http://localhost:8000/api/feed/{post_id}/comments'
data_comment = {
    "content": "Top Level Comment",
    "parent_id": None
}
req_comment = urllib.request.Request(url_comment, data=json.dumps(data_comment).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'})
try:
    response = urllib.request.urlopen(req_comment)
    top_comment = json.loads(response.read().decode('utf-8'))
    print("TOP COMMENT SUCCESS:", top_comment)
    top_comment_id = top_comment['id']
except urllib.error.HTTPError as e:
    print("TOP COMMENT ERROR:", e.code, e.read().decode('utf-8'))
    exit(1)

# Create Reply
data_reply = {
    "content": "This is a reply",
    "parent_id": top_comment_id
}
req_reply = urllib.request.Request(url_comment, data=json.dumps(data_reply).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'})
try:
    response = urllib.request.urlopen(req_reply)
    reply_comment = json.loads(response.read().decode('utf-8'))
    print("REPLY SUCCESS:", reply_comment)
except urllib.error.HTTPError as e:
    print("REPLY ERROR:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("REPLY EXCEPTION:", str(e))

