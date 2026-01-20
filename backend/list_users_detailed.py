from database import SessionLocal, User
db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(f"DB_ID: {u.id}, Email: {u.email}, StudentID: [{u.student_id_number}]")
db.close()
