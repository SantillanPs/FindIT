import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'findit.db')

def migrate():
    if not os.path.exists(DB_PATH):
        print("Database not found. Skipping migration as it will be created fresh.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # --- Fix lost_items ---
    cursor.execute("PRAGMA table_info(lost_items)")
    lost_columns = [column[1] for column in cursor.fetchall()]
    print(f"Current lost_items columns: {lost_columns}")
    
    add_lost = {
        'guest_full_name': 'TEXT',
        'guest_email': 'TEXT',
        'tracking_id': 'TEXT',
        'embedding': 'TEXT'
    }
    
    for col, col_type in add_lost.items():
        if col not in lost_columns:
            print(f"Adding {col} to lost_items...")
            cursor.execute(f"ALTER TABLE lost_items ADD COLUMN {col} {col_type}")
    
    # --- Fix found_items ---
    cursor.execute("PRAGMA table_info(found_items)")
    found_columns = [column[1] for column in cursor.fetchall()]
    print(f"Current found_items columns: {found_columns}")
    
    add_found = {
        'contact_full_name': 'TEXT',
        'identified_student_id': 'TEXT',
        'identified_name': 'TEXT',
        'embedding': 'TEXT'
    }
    
    for col, col_type in add_found.items():
        if col not in found_columns:
            print(f"Adding {col} to found_items...")
            cursor.execute(f"ALTER TABLE found_items ADD COLUMN {col} {col_type}")

    # --- Fix claims ---
    cursor.execute("PRAGMA table_info(claims)")
    claims_columns = [column[1] for column in cursor.fetchall()]
    print(f"Current claims columns: {claims_columns}")
    
    add_claims = {
        'guest_full_name': 'TEXT',
        'guest_email': 'TEXT',
        'tracking_id': 'TEXT'
    }
    
    for col, col_type in add_claims.items():
        if col not in claims_columns:
            print(f"Adding {col} to claims...")
            cursor.execute(f"ALTER TABLE claims ADD COLUMN {col} {col_type}")

    conn.commit()
    conn.close()
    print("Migration check complete!")

if __name__ == "__main__":
    migrate()
