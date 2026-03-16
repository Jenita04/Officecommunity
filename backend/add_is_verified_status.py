import sqlite3
import os

def migrate_db():
    db_path = os.path.join(os.path.dirname(__file__), "kaar.db")
    print(f"Migrating database at {db_path}...")
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    try:
        # Check if the column exists first
        c.execute("PRAGMA table_info(users)")
        columns = [info[1] for info in c.fetchall()]
        
        if "is_verified" not in columns:
            print("Adding 'is_verified' column to 'users' table...")
            c.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0;")
            conn.commit()
            print("Migration successful.")
        else:
            print("Column 'is_verified' already exists.")
            
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_db()
