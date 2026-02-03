import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'findit.db')

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check current columns
    cursor.execute("PRAGMA table_info(found_items)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'identified_student_id' not in columns:
        print("Adding identified_student_id to found_items...")
        cursor.execute("ALTER TABLE found_items ADD COLUMN identified_student_id TEXT")
    
    if 'identified_name' not in columns:
        print("Adding identified_name to found_items...")
        cursor.execute("ALTER TABLE found_items ADD COLUMN identified_name TEXT")
    
    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
