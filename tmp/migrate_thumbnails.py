import sqlite3
import os

db_path = "c:/Users/admin/Documents/Programming/findIT/backend/findit.db"

def migrate():
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    columns_to_add = [
        ("found_items", "safe_photo_thumbnail_url"),
        ("lost_items", "safe_photo_thumbnail_url"),
        ("witness_reports", "witness_photo_thumbnail_url"),
        ("assets", "photo_thumbnail_url")
    ]

    for table, column in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} TEXT")
            print(f"Added {column} to {table}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {column} already exists in {table}")
            else:
                print(f"Error adding {column} to {table}: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
