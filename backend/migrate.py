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
        
        if 'integrity_points' not in columns:
            print("Adding integrity_points to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN integrity_points INTEGER DEFAULT 0")
            
        if 'fraud_strikes' not in columns:
            print("Adding fraud_strikes to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN fraud_strikes INTEGER DEFAULT 0")
            
        if 'is_blacklisted' not in columns:
            print("Adding is_blacklisted to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN is_blacklisted BOOLEAN DEFAULT 0")
        
        # In case other columns are missing from recent updates
        # FoundItem additions?
        cursor.execute("PRAGMA table_info(found_items)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'embedding' not in columns:
             print("Adding embedding to found_items table...")
             cursor.execute("ALTER TABLE found_items ADD COLUMN embedding TEXT")
        
        if 'released_to_photo_url' not in columns:
             print("Adding released_to_photo_url to found_items table...")
             cursor.execute("ALTER TABLE found_items ADD COLUMN released_to_photo_url TEXT")

        if 'zone_id' not in columns:
             print("Adding zone_id to found_items table...")
             cursor.execute("ALTER TABLE found_items ADD COLUMN zone_id INTEGER")
             
        # Check lost_items table
        cursor.execute("PRAGMA table_info(lost_items)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'zone_id' not in columns:
             print("Adding zone_id to lost_items table...")
             cursor.execute("ALTER TABLE lost_items ADD COLUMN zone_id INTEGER")

        # Check zones table for coordinates
        cursor.execute("PRAGMA table_info(zones)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'pos_x' not in columns:
            print("Adding pos_x to zones table...")
            cursor.execute("ALTER TABLE zones ADD COLUMN pos_x INTEGER DEFAULT 0")
        if 'pos_y' not in columns:
            print("Adding pos_y to zones table...")
            cursor.execute("ALTER TABLE zones ADD COLUMN pos_y INTEGER DEFAULT 0")

        # --- NEW COLUMNS FOR SPLIT NAMES & CONTACT INFO ---

        # Users table
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'first_name' not in columns:
            print("Adding first_name to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN first_name TEXT")
        if 'last_name' not in columns:
            print("Adding last_name to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN last_name TEXT")

        # Found items table
        cursor.execute("PRAGMA table_info(found_items)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'contact_first_name' not in columns:
            print("Adding contact_first_name to found_items table...")
            cursor.execute("ALTER TABLE found_items ADD COLUMN contact_first_name TEXT")
        if 'contact_last_name' not in columns:
            print("Adding contact_last_name to found_items table...")
            cursor.execute("ALTER TABLE found_items ADD COLUMN contact_last_name TEXT")
        if 'contact_info' not in columns:
            print("Adding contact_info to found_items table...")
            cursor.execute("ALTER TABLE found_items ADD COLUMN contact_info TEXT")
        if 'guest_email' not in columns:
            print("Adding guest_email to found_items table...")
            cursor.execute("ALTER TABLE found_items ADD COLUMN guest_email TEXT")

        # Lost items table
        cursor.execute("PRAGMA table_info(lost_items)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'guest_first_name' not in columns:
            print("Adding guest_first_name to lost_items table...")
            cursor.execute("ALTER TABLE lost_items ADD COLUMN guest_first_name TEXT")
        if 'guest_last_name' not in columns:
            print("Adding guest_last_name to lost_items table...")
            cursor.execute("ALTER TABLE lost_items ADD COLUMN guest_last_name TEXT")
        if 'guest_email' not in columns:
            print("Adding guest_email to lost_items table...")
            cursor.execute("ALTER TABLE lost_items ADD COLUMN guest_email TEXT")
        if 'contact_info' not in columns:
            print("Adding contact_info to lost_items table...")
            cursor.execute("ALTER TABLE lost_items ADD COLUMN contact_info TEXT")

        # Claims table
        cursor.execute("PRAGMA table_info(claims)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'guest_first_name' not in columns:
            print("Adding guest_first_name to claims table...")
            cursor.execute("ALTER TABLE claims ADD COLUMN guest_first_name TEXT")
        if 'guest_last_name' not in columns:
            print("Adding guest_last_name to claims table...")
            cursor.execute("ALTER TABLE claims ADD COLUMN guest_last_name TEXT")
        if 'guest_email' not in columns:
            print("Adding guest_email to claims table...")
            cursor.execute("ALTER TABLE claims ADD COLUMN guest_email TEXT")
        if 'contact_info' not in columns:
            print("Adding contact_info to claims table...")
            cursor.execute("ALTER TABLE claims ADD COLUMN contact_info TEXT")

        # Witness reports table
        cursor.execute("PRAGMA table_info(witness_reports)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'guest_first_name' not in columns:
            print("Adding guest_first_name to witness_reports table...")
            cursor.execute("ALTER TABLE witness_reports ADD COLUMN guest_first_name TEXT")
        if 'guest_last_name' not in columns:
            print("Adding guest_last_name to witness_reports table...")
            cursor.execute("ALTER TABLE witness_reports ADD COLUMN guest_last_name TEXT")
        if 'guest_email' not in columns:
            print("Adding guest_email to witness_reports table...")
            cursor.execute("ALTER TABLE witness_reports ADD COLUMN guest_email TEXT")
        if 'contact_info' not in columns:
            print("Adding contact_info to witness_reports table...")
            cursor.execute("ALTER TABLE witness_reports ADD COLUMN contact_info TEXT")

        # --- DATA MIGRATION ---
        
        # 1. Migrate user full_names to split names
        print("Migrating user names...")
        cursor.execute("SELECT id, full_name FROM users WHERE first_name IS NULL AND full_name IS NOT NULL")
        users_to_migrate = cursor.fetchall()
        for user_id, full_name in users_to_migrate:
            if full_name:
                parts = full_name.split(' ', 1)
                first = parts[0]
                last = parts[1] if len(parts) > 1 else ""
                cursor.execute("UPDATE users SET first_name = ?, last_name = ? WHERE id = ?", (first, last, user_id))
        
        # 2. Clear non-account data as requested ("remove all of the data aside from the accounts")
        print("Clearing non-account data...")
        tables_to_clear = [
            'found_items', 
            'lost_items', 
            'claims', 
            'witness_reports', 
            'notifications', 
            'audit_logs',
            'category_stats',
            'other_suggestions'
        ]
        for table in tables_to_clear:
            try:
                cursor.execute(f"DELETE FROM {table}")
                # Reset auto-increment if applicable (SQLite specific)
                cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'")
            except Exception as e:
                print(f"Skipping clear for {table}: {e}")

        conn.commit()
        conn.close()
        print("Migration and data cleanup complete!")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
