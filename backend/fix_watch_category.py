import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, 'findit.db')

def update_watch():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Update any smartwatch that got wrongly categorized
    cursor.execute("UPDATE found_items SET category = 'Electronics' WHERE item_name LIKE '%smart%watch%' OR item_name LIKE '%Apple%Watch%' OR item_name LIKE '%Samsung%Watch%'")
    cursor.execute("UPDATE lost_items SET category = 'Electronics' WHERE item_name LIKE '%smart%watch%' OR item_name LIKE '%Apple%Watch%' OR item_name LIKE '%Samsung%Watch%'")
    
    print(f"Updated {cursor.rowcount} records.")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    update_watch()
