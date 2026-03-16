import bcrypt
import time

print("Starting bcrypt test...")
start = time.time()
salt = bcrypt.gensalt()
print(f"Generated salt in {time.time() - start:.4f}s")

start = time.time()
hashed = bcrypt.hashpw(b'password123', salt)
print(f"Generated hash in {time.time() - start:.4f}s: {hashed}")
