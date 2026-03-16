import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.base import SessionLocal
from api.routers.users import get_my_profile
from api.routers.feed import get_current_user
import traceback

try:
    db = SessionLocal()
    user = get_current_user(db)
    print("User retrieved:", user.email, "Real Name:", user.real_name)
    
    profile = get_my_profile(current_user=user)
    print("Profile Output:", profile)
    
except Exception as e:
    print("Exception occurred!")
    traceback.print_exc()
finally:
    db.close()
