from database import SessionLocal, User
db = SessionLocal()
user = db.query(User).filter(User.student_id_number == '22-00130').first()
if user:
    print(f"User found: {user.email}, ID: {user.student_id_number}")
else:
    print("User not found")
db.close()
