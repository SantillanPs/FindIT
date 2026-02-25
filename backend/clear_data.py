import sqlite3
import os

db_path = 'C:/Users/admin/Documents/Programming/findIT/backend/findit.db'
tables_to_keep = ['users', 'sqlite_sequence']

def clear_database():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]

    for table in tables:
        if table not in tables_to_keep:
            try:
                cursor.execute(f"DELETE FROM {table}")
                # Optional: Reset auto-increment
                cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'")
                print(f"Cleared table: {table}")
            except sqlite3.OperationalError as e:
                print(f"Could not clear {table}: {e}")

    conn.commit()
    conn.close()
    print("Database data cleared (except users).")

if __name__ == "__main__":
    clear_database()
