import requests

url = "https://kaartechapi.onrender.com/api/feed/"
data = {
    "title": "Test Challenge",
    "description": "This is a test",
    "tags": "test, python",
    "visibility": "OPEN"
}
try:
    res = requests.post(url, json=data)
    print("Status:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print("Error:", e)
