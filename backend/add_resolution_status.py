import sqlite3
import os

def upgrade():
    # The database file is likely kaariq.db based on config
    db_path = 'kaariq.db'
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return
        
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    try:
        c.execute("ALTER TABLE comments ADD COLUMN resolution_status VARCHAR;")
        print("Column added successfully.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column already exists.")
        else:
            print("Error:", e)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    upgrade()
