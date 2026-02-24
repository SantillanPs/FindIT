import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, 'findit.db')

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print(f"Migrating database at {db_path}...")
    
    try:
        # Add item_name to found_items
        cursor.execute("ALTER TABLE found_items ADD COLUMN item_name TEXT")
        print("Added item_name to found_items")
    except sqlite3.OperationalError as e:
        print(f"Skipping found_items: {e}")

    try:
        # Add item_name to lost_items
        cursor.execute("ALTER TABLE lost_items ADD COLUMN item_name TEXT")
        print("Added item_name to lost_items")
    except sqlite3.OperationalError as e:
        print(f"Skipping lost_items: {e}")
        
    # Set default values for existing records based on category
    cursor.execute("UPDATE found_items SET item_name = category WHERE item_name IS NULL")
    cursor.execute("UPDATE lost_items SET item_name = category WHERE item_name IS NULL")
    print("Backfilled existing records with category values.")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
