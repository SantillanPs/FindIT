import database
from sqlalchemy.orm import Session
import os

def inspect():
    db = database.SessionLocal()
    try:
        print("--- Found Items ---")
        items = db.query(database.FoundItem).all()
        for i in items:
            print(f"ID: {i.id}, Name: {i.item_name}, Category: {i.category}, Finder: {i.finder_id}, Status: {i.status}")
        
        print("\n--- Users & Points ---")
        users = db.query(database.User).all()
        for u in users:
            print(f"ID: {u.id}, Name: {u.full_name}, Email: {u.email}, Points: {u.integrity_points}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect()
