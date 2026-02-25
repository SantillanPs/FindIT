import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'findit.db')

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Adding new columns to claims table...")
    try:
        cursor.execute("ALTER TABLE claims ADD COLUMN contact_method TEXT")
    except sqlite3.OperationalError:
        print("contact_method already exists")
        
    try:
        cursor.execute("ALTER TABLE claims ADD COLUMN contact_info TEXT")
    except sqlite3.OperationalError:
        print("contact_info already exists")
        
    try:
        cursor.execute("ALTER TABLE claims ADD COLUMN course_department TEXT")
    except sqlite3.OperationalError:
        print("course_department already exists")
        
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
