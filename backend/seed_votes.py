from models.base import SessionLocal
from models.domain import Innovation

db = SessionLocal()
inv = db.query(Innovation).first()
if inv:
    inv.votes_count = 85
    db.commit()
    print(f"Updated Innovation ID {inv.id} to 85 votes.")
else:
    print("No innovations found in the database. Please create one.")
db.close()
