import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'findit.db')

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check lost_items
    cursor.execute("PRAGMA table_info(lost_items)")
    lost_columns = [col[1] for col in cursor.fetchall()]
    
    if 'safe_photo_url' not in lost_columns:
        print("Adding safe_photo_url to lost_items...")
        cursor.execute("ALTER TABLE lost_items ADD COLUMN safe_photo_url VARCHAR")
    
    # Check if any other columns are missing from LostItem model
    # Model: id, item_name, category, description, location_zone, last_seen_time, status, embedding, user_id, guest_full_name, guest_email, safe_photo_url, tracking_id
    
    # Check found_items as well for consistency
    cursor.execute("PRAGMA table_info(found_items)")
    found_columns = [col[1] for col in cursor.fetchall()]
    
    if 'safe_photo_url' not in found_columns:
        print("Adding safe_photo_url to found_items...")
        cursor.execute("ALTER TABLE found_items ADD COLUMN safe_photo_url VARCHAR")
        
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
