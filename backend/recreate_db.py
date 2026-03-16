import os
import sys

# Ensure backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.base import engine, Base
from models.domain import User, Post, Comment, Innovation, FailureLearning

print("Dropping all tables...")
try:
    Base.metadata.drop_all(bind=engine)
    print("Tables dropped.")
except Exception as e:
    print("Error dropping:", e)

print("Creating all tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("Tables created.")
except Exception as e:
    print("Error creating:", e)
