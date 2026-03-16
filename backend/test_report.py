import urllib.request
import urllib.error
import urllib.parse
import json

data = json.dumps({
    "reported_item_type": "POST",
    "reported_item_id": 1,
    "reason": "Test reason"
}).encode('utf-8')

req = urllib.request.Request(
    'http://localhost:8000/api/reports/',
    data=data,
    headers={
        'Content-Type': 'application/json',
        # Need a valid token, let's login first
    }
)

# First get a token
login_data = urllib.parse.urlencode({'username': 'test@example.com', 'password': 'password123'}).encode('utf-8')
try:
    token_req = urllib.request.Request('http://localhost:8000/api/auth/login', data=login_data)
    token_res = urllib.request.urlopen(token_req)
    token = json.loads(token_res.read())['access_token']
    
    req.add_header('Authorization', f'Bearer {token}')
    res = urllib.request.urlopen(req)
    print(res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(e.read().decode('utf-8'))
except Exception as e:
    print(e)
