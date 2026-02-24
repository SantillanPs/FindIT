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
    
    if 'released_to_name' not in columns:
        print("Adding released_to_name to found_items...")
        cursor.execute("ALTER TABLE found_items ADD COLUMN released_to_name TEXT")
    
    if 'released_to_id_number' not in columns:
        print("Adding released_to_id_number to found_items...")
        cursor.execute("ALTER TABLE found_items ADD COLUMN released_to_id_number TEXT")
    
    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
