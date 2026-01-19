from database import SessionLocal, FoundItem
db = SessionLocal()
items = db.query(FoundItem).all()
for item in items:
    print(f"ID: {item.id}, Category: {item.category}, FinderID: {item.finder_id}")
db.close()
