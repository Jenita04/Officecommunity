from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Temporary script to alter existing SQLite database tables

# Path to the database file (matches models/base.py)
SQLALCHEMY_DATABASE_URL = "sqlite:///./kaariq.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_migration():
    print("Running migration to add 'type' and 'media_url' to posts table...")
    with engine.connect() as conn:
        try:
            # Add 'type' column
            conn.execute("ALTER TABLE posts ADD COLUMN type VARCHAR DEFAULT 'general'")
            print("Added 'type' column.")
        except Exception as e:
            print(f"Error adding 'type' (might already exist): {e}")

        try:
            # Add 'media_url' column
            conn.execute("ALTER TABLE posts ADD COLUMN media_url VARCHAR")
            print("Added 'media_url' column.")
        except Exception as e:
            print(f"Error adding 'media_url' (might already exist): {e}")

    print("Migration complete.")

if __name__ == "__main__":
    run_migration()
