import urllib.request
import urllib.error

url = "http://localhost:8000/api/feed/1/comments/1/status"
headers = {
    "Origin": "http://localhost:3000",
    "Access-Control-Request-Method": "PUT",
    "Access-Control-Request-Headers": "authorization,content-type"
}

req = urllib.request.Request(url, headers=headers, method='OPTIONS')

try:
    with urllib.request.urlopen(req) as response:
        with open("cors_res.txt", "w") as f:
            f.write(f"Status: {response.status}\nHeaders:\n")
            for k, v in response.getheaders():
                f.write(f"  {k}: {v}\n")
except urllib.error.HTTPError as e:
    with open("cors_res.txt", "w") as f:
        f.write(f"HTTP Error: {e.code} - {e.reason}\nHeaders:\n")
        for k, v in e.headers.items():
            f.write(f"  {k}: {v}\n")
        f.write(f"Body: {e.read().decode()}\n")
    print(f"HTTP Error: {e.code} - {e.reason}")
    print("Headers:")
    for k, v in e.headers.items():
        print(f"  {k}: {v}")
    print("Body:", e.read().decode())
except Exception as e:
    print("Other Error:", e)
