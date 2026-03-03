import sqlite3
import os

def migrate():
    # Path to the database
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'findit.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        print("Checking for 'show_full_name' column in 'users' table...")
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'show_full_name' not in columns:
            print("Adding 'show_full_name' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN show_full_name BOOLEAN DEFAULT 0")
            conn.commit()
            print("Column 'show_full_name' added successfully.")
        else:
            print("Column 'show_full_name' already exists.")
            
    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
