import urllib.request
import json
import urllib.error
import random

# Register a new user
unique_id = random.randint(10000, 99999)
url_register = 'http://localhost:8000/api/auth/register'
data_register = {
    "real_name": "Test Commenter",
    "email": f"commenter{unique_id}@test.com",
    "role": "EMPLOYEE",
    "team_id": "",
    "pseudo_name": f"commenter_{unique_id}",
    "password": "password"
}
req_register = urllib.request.Request(url_register, data=json.dumps(data_register).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    resp_register = urllib.request.urlopen(req_register)
    token = json.loads(resp_register.read().decode('utf-8'))['access_token']
except Exception as e:
    print("Registration Failed:", e.read().decode('utf-8') if hasattr(e, 'read') else str(e))
    exit(1)

# Create a post
url_post = 'http://localhost:8000/api/feed/'
data_post = {
    "title": "Test Post",
    "description": "Test description",
    "tags": "test",
    "type": "general",
    "visibility": "OPEN"
}
req_post = urllib.request.Request(url_post, data=json.dumps(data_post).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'})
try:
    resp_post = urllib.request.urlopen(req_post)
    post_id = json.loads(resp_post.read().decode('utf-8'))['id']
except Exception as e:
    print("CREATE POST ERROR:", e.read().decode('utf-8') if hasattr(e, 'read') else str(e))
    exit(1)

# Now try to create a comment on the new post
url_comment = f'http://localhost:8000/api/feed/{post_id}/comments'
data_comment = {
    "content": "Test comment reply",
    "parent_id": None
}
req_comment = urllib.request.Request(url_comment, data=json.dumps(data_comment).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'})

try:
    response = urllib.request.urlopen(req_comment)
    print("SUCCESS:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("COMMENT ERROR HTTP:", e.code, e.reason)
    print("BODY:", e.read().decode('utf-8'))
except Exception as e:
    print("COMMENT EXCEPTION:", str(e))
