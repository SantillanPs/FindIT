import sqlite3
import os

# Get path to database
base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, 'findit.db')

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Adding 'is_certificate_eligible' column to 'users' table...")
        cursor.execute("ALTER TABLE users ADD COLUMN is_certificate_eligible BOOLEAN DEFAULT 0")
        conn.commit()
        print("Migration successful.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
            print("Column 'is_certificate_eligible' already exists. Skipping.")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
