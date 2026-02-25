import sqlite3
import os

db_path = 'C:/Users/admin/Documents/Programming/findIT/backend/findit.db'

def check_counts():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"{table}: {count}")
    conn.close()

if __name__ == "__main__":
    check_counts()
