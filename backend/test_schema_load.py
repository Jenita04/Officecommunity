import requests

url = "http://localhost:8000/api/feed/"

# Attempting to fetch posts to see if our backend schemas deserialize correctly
try:
    res = requests.get(url, headers={"Authorization": "Bearer BAD_TOKEN"})
    # Since we can't easily script a full login via the fastAPI dependency without spinning up a mock user payload, 
    # we will rely on ensuring the uvicorn startup didn't crash because of our Pydantic schema changes.
    print(res.status_code)
except Exception as e:
    print("Error:", e)
