import sqlite3
import os

def create_reports_table():
    db_path = os.path.join(os.path.dirname(__file__), "project.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create reports table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_id INTEGER NOT NULL,
        reported_item_type VARCHAR NOT NULL,
        reported_item_id INTEGER NOT NULL,
        reported_user_id INTEGER,
        reason VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(reporter_id) REFERENCES users(id),
        FOREIGN KEY(reported_user_id) REFERENCES users(id)
    )
    """)
    conn.commit()
    conn.close()
    print("Reports table created successfully.")

if __name__ == "__main__":
    create_reports_table()
