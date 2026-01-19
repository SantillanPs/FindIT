from database import SessionLocal, FoundItem
db = SessionLocal()
items = db.query(FoundItem).all()
print(f"Total found items in DB: {len(items)}")
for item in items:
    print(f"ID: {item.id}, Category: {item.category}, Status: {item.status}")
db.close()
