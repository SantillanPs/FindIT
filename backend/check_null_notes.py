from database import SessionLocal, FoundItem
db = SessionLocal()
items = db.query(FoundItem).all()
for item in items:
    if item.private_admin_notes is None:
        print(f"ID: {item.id} has NULL private_admin_notes")
db.close()
