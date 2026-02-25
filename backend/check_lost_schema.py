import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'findit.db')

def check_schema():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(lost_items)")
    columns = cursor.fetchall()
    print("lost_items columns:")
    for col in columns:
        print(f"  {col[1]} ({col[2]})")
    conn.close()

if __name__ == "__main__":
    check_schema()
