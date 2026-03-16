import sqlite3
from core.config import settings

def upgrade_db():
    try:
        db_path = settings.SQLALCHEMY_DATABASE_URI.replace('sqlite:///', '')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Add parent_id to comments table
        cursor.execute("ALTER TABLE comments ADD COLUMN parent_id INTEGER REFERENCES comments(id)")
        conn.commit()
        print("Successfully added parent_id to comments table.")
    except Exception as e:
        print(f"Error updating database: {e}")
        # Could be "duplicate column name" if already run
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    upgrade_db()
