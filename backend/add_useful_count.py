import sqlite3

def add_column():
    conn = sqlite3.connect('kaariq.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE failures ADD COLUMN useful_count INTEGER DEFAULT 0")
        print("Column useful_count added successfully.")
    except sqlite3.OperationalError as e:
        print(f"OperationalError: {e}")
    conn.commit()
    conn.close()

if __name__ == '__main__':
    add_column()
