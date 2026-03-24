import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'backend', 'findit.db')

def list_columns():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(found_items)")
        columns = cursor.fetchall()
        print("Columns in found_items:")
        for col in columns:
            print(f"{col[0]}: {col[1]} ({col[2]})")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_columns()
