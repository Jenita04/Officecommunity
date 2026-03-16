import requests
import json

url = "http://localhost:8000/api/feed/1/comments/1/status"
headers = {
    "Content-Type": "application/json",
    "Origin": "http://localhost:3000"
}
data = {
    "resolution_status": "RESOLVED"
}

try:
    print("Testing OPTIONS")
    options_res = requests.options(url, headers=headers)
    print("OPTIONS Status:", options_res.status_code)
    print("OPTIONS Headers:", options_res.headers)
    
    print("\nTesting PUT")
    # For a real put, we'd need an auth token, but let's see if we get a 401 Unauthenticated instead of a connection error
    put_res = requests.put(url, headers=headers, json=data)
    print("PUT Status:", put_res.status_code)
    print("PUT Body:", put_res.text)
except Exception as e:
    print("Error:", e)
