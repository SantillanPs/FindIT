import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'findit.db')

def migrate():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check claims table
        cursor.execute("PRAGMA table_info(claims)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'proof_photo_url' not in columns:
            print("Adding proof_photo_url to claims table...")
            cursor.execute("ALTER TABLE claims ADD COLUMN proof_photo_url TEXT")
            
        # Check users table
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'full_name' not in columns:
            print("Adding full_name to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN full_name TEXT")
        
        # In case other columns are missing from recent updates
        # FoundItem additions?
        cursor.execute("PRAGMA table_info(found_items)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'embedding' not in columns:
             print("Adding embedding to found_items table...")
             cursor.execute("ALTER TABLE found_items ADD COLUMN embedding TEXT")

        conn.commit()
        conn.close()
        print("Migration complete!")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
