from database import SessionLocal, User, FoundItem
import schemas

def mock_get_current_user(db, user_id):
    return db.query(User).filter(User.id == user_id).first()

db = SessionLocal()
user = mock_get_current_user(db, 5)
print(f"User: {user.email}")
print(f"Found Items count: {len(user.found_items)}")

for item in user.found_items:
    # Mimic FastAPI serialization
    obj = schemas.FoundItemPublic.from_orm(item)
    print(f"- {obj.id}: {obj.category} ({obj.status})")

db.close()
