from database import SessionLocal, User
db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(f"Email: {u.email}, Role: {u.role}, Verified: {u.is_verified}")
db.close()
