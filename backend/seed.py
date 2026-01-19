import database
import auth
from sqlalchemy.orm import Session
from datetime import datetime

def seed_data():
    db = database.SessionLocal()
    
    # Check if we already have users to avoid duplicates
    if db.query(database.User).count() > 0:
        print("Database already has data. Skipping seed.")
        db.close()
        return

    print("Seeding initial accounts...")

    # Data to seed users
    users = [
        {
            "email": "admin@findit.edu",
            "password": "pass",
            "role": database.UserRole.ADMIN.value,
            "is_verified": True
        },
        {
            "email": "verified@student.edu",
            "password": "pass",
            "role": database.UserRole.STUDENT.value,
            "is_verified": True
        },
        {
            "email": "new@student.edu",
            "password": "pass",
            "role": database.UserRole.STUDENT.value,
            "is_verified": False
        }
    ]

    for user_data in users:
        new_user = database.User(
            email=user_data["email"],
            hashed_password=auth.get_password_hash(user_data["password"]),
            role=user_data["role"],
            is_verified=user_data["is_verified"]
        )
        db.add(new_user)
    
    db.commit()

    # Seed Found Items
    print("Seeding found items with embeddings...")
    admin_user = db.query(database.User).filter(database.User.email == "admin@findit.edu").first()
    
    found_items = [
        {
            "category": "Electronics",
            "description": "Space Gray iPad with a blue keyboard case.",
            "location_zone": "Engineering Hall",
            "status": database.ItemStatus.IN_CUSTODY.value,
            "private_admin_notes": "Small dent on back, serial ends in 99X."
        },
        {
            "category": "Electronics",
            "description": "Black Dell Laptop with a university sticker on the lid.",
            "location_zone": "Library 2F",
            "status": database.ItemStatus.REPORTED.value,
            "private_admin_notes": "Sticker is from the Robotics Club."
        },
        {
            "category": "Wallets & Keys",
            "description": "Brown leather wallet with several cards.",
            "location_zone": "Student Center",
            "status": database.ItemStatus.IN_CUSTODY.value,
            "private_admin_notes": "Contains a driver's license for a student named Alex."
        },
        {
            "category": "Books",
            "description": "Advanced Mathematics textbook, blue cover.",
            "location_zone": "Cafeteria",
            "status": database.ItemStatus.REPORTED.value,
            "private_admin_notes": "Name 'Sarah' written on the inside cover."
        }
    ]

    from ai_service import AIService
    for item_data in found_items:
        combined_text = f"{item_data['category']}: {item_data['description']}"
        embedding_json = AIService.generate_embedding(combined_text)
        
        new_item = database.FoundItem(
            **item_data,
            finder_id=admin_user.id,
            embedding=embedding_json,
            found_time=datetime.utcnow()
        )
        db.add(new_item)
    
    db.commit()
    print(f"Successfully seeded {len(found_items)} found items.")
    
    db.close()

if __name__ == "__main__":
    database.init_db()
    seed_data()
