import os
import sys

# Add current dir to path to import from backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
import auth
from sqlalchemy.orm import Session

def seed_super_admin():
    db = database.SessionLocal()
    try:
        print("Seeding Super Admin account...")
        
        email = "superadmin@gmail.com"
        password = "admin"
        
        # Check if exists
        existing_user = db.query(database.User).filter_by(email=email).first()
        if existing_user:
            print(f"User {email} already exists. Updating role to super_admin.")
            existing_user.role = database.UserRole.SUPER_ADMIN.value
            existing_user.is_verified = True
        else:
            new_user = database.User(
                email=email,
                hashed_password=auth.get_password_hash(password),
                role=database.UserRole.SUPER_ADMIN.value,
                is_verified=True,
                first_name="System",
                last_name="Super Admin"
            )
            db.add(new_user)
            print(f"Created Super Admin: {email}")
            
        db.commit()
        print("Super Admin seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding super admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_super_admin()
