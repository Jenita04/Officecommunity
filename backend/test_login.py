import time
import requests

start = time.time()
res = requests.post("http://localhost:8000/api/auth/login", json={"username": "Admin", "password": "admin123"})
end = time.time()
print(f"Login Time: {end - start}")
print(res.json())
