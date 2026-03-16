import sqlite3

def add_suggestions_table():
    conn = sqlite3.connect('kaariq.db')
    cursor = conn.cursor()

    try:
        cursor.execute('''
            CREATE TABLE suggestions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR NOT NULL,
                description TEXT NOT NULL,
                votes_count INTEGER DEFAULT 0,
                author_id INTEGER REFERENCES users(id),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("Successfully created suggestions table.")
    except Exception as e:
        print(f"Error creating table: {e}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    add_suggestions_table()
