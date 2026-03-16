import urllib.request
import json
import urllib.error

url = 'http://localhost:8000/api/auth/register'
data = {
    "real_name": "Test User",
    "email": "test@test.com",
    "role": "EMPLOYEE",
    "team_id": "",
    "pseudo_name": "test_user",
    "password": "password123"
}
req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    response = urllib.request.urlopen(req)
    print("SUCCESS:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("ERROR:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("EXCEPTION:", str(e))
