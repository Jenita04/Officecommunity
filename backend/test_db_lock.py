import sqlite3
import time
from core.config import settings

try:
    db_path = settings.SQLALCHEMY_DATABASE_URI.replace('sqlite:///', '')
    print(f"Connecting to {db_path}...")
    conn = sqlite3.connect(db_path, timeout=3)
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM users")
    print("Read success:", cursor.fetchone())
    
    # Try an insert to test write lock
    print("Testing write lock...")
    cursor.execute("UPDATE users SET reputation_score = reputation_score WHERE id = 1")
    conn.commit()
    print("Write success!")
    conn.close()
except Exception as e:
    print("Database error:", e)
