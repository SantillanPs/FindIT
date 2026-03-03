import sys
import os
# Add the current directory to path so we can import database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import database

def remove_students():
    db = database.SessionLocal()
    try:
        # 1. Identify all student IDs
        student_query = db.query(database.User).filter(database.User.role == "student")
        student_ids = [u.id for u in student_query.all()]
        
        print(f"Found {len(student_ids)} student accounts to remove.")
        if not student_ids:
            print("Cleanup complete: No student accounts found.")
            return

        # 2. Cleanup related data
        print("Cleaning up notifications...")
        db.query(database.Notification).filter(database.Notification.user_id.in_(student_ids)).delete(synchronize_session=False)
        
        print("Cleaning up claims...")
        db.query(database.Claim).filter(database.Claim.student_id.in_(student_ids)).delete(synchronize_session=False)
        
        print("Cleaning up lost items...")
        db.query(database.LostItem).filter(database.LostItem.user_id.in_(student_ids)).delete(synchronize_session=False)

        print("Nullifying found item relationships...")
        db.query(database.FoundItem).filter(database.FoundItem.finder_id.in_(student_ids)).update({database.FoundItem.finder_id: None}, synchronize_session=False)
        db.query(database.FoundItem).filter(database.FoundItem.released_to_id.in_(student_ids)).update({database.FoundItem.released_to_id: None}, synchronize_session=False)

        # 3. Remove the student users themselves
        print("Removing student accounts...")
        db.query(database.User).filter(database.User.id.in_(student_ids)).delete(synchronize_session=False)

        db.commit()
        print(f"Successfully purged {len(student_ids)} student(s) and their associated data.")
        
        # 4. Verify Admins still exist
        admin_count = db.query(database.User).filter(database.User.role == "admin").count()
        print(f"Verification: {admin_count} admin account(s) safely preserved.")

    except Exception as e:
        db.rollback()
        print(f"CRITICAL ERROR during cleanup: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    remove_students()
