import urllib.request
import json
import urllib.error

url = "http://localhost:8000/api/feed/1/comments/1/status"
data = json.dumps({"resolution_status": "RESOLVED"}).encode('utf-8')
headers = {
    "Content-Type": "application/json",
}

# The endpoint expects auth, but let's see if we get a 401 or a crash
req = urllib.request.Request(url, data=data, headers=headers, method='PUT')

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} - {e.reason}")
    print("Body:", e.read().decode())
except Exception as e:
    print("Other Error:", e)
