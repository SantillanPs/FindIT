from database import SessionLocal, FoundItem
db = SessionLocal()
items = db.query(FoundItem).all()
for item in items:
    print(f"ID: {item.id}, Notes: {repr(item.private_admin_notes)}")
db.close()
