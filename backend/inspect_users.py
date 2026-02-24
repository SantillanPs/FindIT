import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, 'findit.db')

def inspect_all():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    for table in ["users", "found_items", "lost_items", "claims"]:
        print(f"\n--- {table} Table Columns ---")
        cursor.execute(f"PRAGMA table_info({table})")
        for column in cursor.fetchall():
            print(f"Column: {column[1]}, Type: {column[2]}")
        
    conn.close()

if __name__ == "__main__":
    inspect_all()
