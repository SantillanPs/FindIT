import os
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from database import Base, FoundItem, LostItem, Claim, User
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///backend/findit.db"
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

try:
    print(f"Connected to: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
    print(f"Users: {session.query(func.count(User.id)).scalar()}")
    print(f"Found Items: {session.query(func.count(FoundItem.id)).scalar()}")
    print(f"Lost Items: {session.query(func.count(LostItem.id)).scalar()}")
    print(f"Claims: {session.query(func.count(Claim.id)).scalar()}")
    
    # Check one item
    item = session.query(FoundItem).first()
    if item:
        print(f"First Found Item: {item.item_name} at {item.found_time}")
    else:
        print("No items found.")
except Exception as e:
    print(f"Error: {e}")
finally:
    session.close()
