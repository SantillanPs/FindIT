from database import SessionLocal, FoundItem
db = SessionLocal()
items = db.query(FoundItem).all()
for item in items:
    print(f"ID: {item.id}, Notes: [{item.private_admin_notes}]")
db.close()
