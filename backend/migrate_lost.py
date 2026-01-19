import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'findit.db')

def check_lost_items():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(lost_items)")
    columns = [column[1] for column in cursor.fetchall()]
    print(f"lost_items columns: {columns}")
    if 'embedding' not in columns:
        print("Adding embedding to lost_items table...")
        cursor.execute("ALTER TABLE lost_items ADD COLUMN embedding TEXT")
        conn.commit()
    conn.close()

if __name__ == "__main__":
    check_lost_items()
