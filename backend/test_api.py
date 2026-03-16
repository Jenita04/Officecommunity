import requests
try:
    res = requests.get("http://localhost:8000/api/users/profile/me")
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.text}")
except Exception as e:
    print(f"Error: {e}")
