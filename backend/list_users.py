from database import SessionLocal, User
db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(f"Email: {u.email}, ID: [{u.student_id_number}]")
db.close()
