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
            "email": "admin@nemsu.edu.ph",
            "password": "pass",
            "role": database.UserRole.ADMIN.value,
            "is_verified": True
        },
        {
            "email": "verified@nemsu.edu.ph",
            "password": "pass",
            "role": database.UserRole.STUDENT.value,
            "is_verified": True
        },
        {
            "email": "new@nemsu.edu.ph",
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
    admin_user = db.query(database.User).filter(database.User.email == "admin@nemsu.edu.ph").first()
    
    found_items = [
        {
            "item_name": "Backpack",
            "category": "Bags",
            "description": "Blue Jansport backpack with several notebooks.",
            "location_zone": "Library 2nd Floor",
            "found_time": datetime.utcnow() - timedelta(hours=5),
            "safe_photo_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
            "contact_full_name": "Security Desk B"
        },
        {
            "item_name": "Scientific Calculator",
            "category": "Electronics",
            "description": "Casio fx-991EX, silver color.",
            "location_zone": "Building C Room 402",
            "found_time": datetime.utcnow() - timedelta(days=1),
            "safe_photo_url": "https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=800",
            "contact_full_name": "Canteen Counter"
        },
        {
            "item_name": "Water Bottle",
            "category": "Other",
            "description": "Hydroflask 32oz, olive green color.",
            "location_zone": "Gymnasium Entrance",
            "found_time": datetime.utcnow() - timedelta(hours=2),
            "safe_photo_url": "https://images.unsplash.com/photo-1602143302326-455bc4dd2493?w=800",
            "contact_full_name": "Physical Ed Office"
        },
        {
            "item_name": "Calculus Textbook",
            "category": "Books",
            "description": "Stewart Calculus 8th Edition, hardbound.",
            "location_zone": "Auditorium Row F",
            "found_time": datetime.utcnow() - timedelta(days=2),
            "safe_photo_url": "https://images.unsplash.com/photo-1544716124-05952d83ff44?w=800",
            "contact_full_name": "Staff Lounge"
        }
    ]

    from ai_service import AIService
    for item_data in found_items:
        combined_text = f"{item_data['category']}: {item_data['description']}"
        embedding_json = AIService.generate_embedding(combined_text)
        
        new_item = database.FoundItem(
            item_name=item_data["item_name"],
            category=item_data["category"],
            description=item_data["description"],
            location_zone=item_data["location_zone"],
            found_time=item_data["found_time"],
            safe_photo_url=item_data["safe_photo_url"],
            contact_full_name=item_data["contact_full_name"],
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
