import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, 'findit.db')

def inspect():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("--- Found Items ---")
    cursor.execute("SELECT id, item_name, category FROM found_items")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- Lost Items ---")
    cursor.execute("SELECT id, item_name, category FROM lost_items")
    for row in cursor.fetchall():
        print(row)
        
    conn.close()

if __name__ == "__main__":
    inspect()
