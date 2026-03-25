import sqlite3
import os

db_path = "findit.db"

if not os.path.exists(db_path):
    print(f"Database {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Checking and fixing schema...")
    
    try:
        cursor.execute("ALTER TABLE found_items ADD COLUMN matched_lost_id INTEGER")
        print("Added found_items.matched_lost_id")
    except sqlite3.OperationalError:
        print("found_items.matched_lost_id already exists or table missing.")
        
    try:
        cursor.execute("ALTER TABLE claims ADD COLUMN is_pickup_ready BOOLEAN DEFAULT 0")
        print("Added claims.is_pickup_ready")
    except sqlite3.OperationalError:
        print("claims.is_pickup_ready already exists or table missing.")

    try:
        cursor.execute("ALTER TABLE claims ADD COLUMN scheduled_pickup_time DATETIME")
        print("Added claims.scheduled_pickup_time")
    except sqlite3.OperationalError:
        print("claims.scheduled_pickup_time already exists or table missing.")

    conn.commit()
    conn.close()
    print("Done.")
