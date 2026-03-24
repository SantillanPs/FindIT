
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to local SQLite if no DATABASE_URL is provided
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'findit.db')}"

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

TABLES_TO_CLEAR = [
    "found_items",
    "lost_items",
    "claims",
    "audit_logs",
    "notifications",
    "witness_reports",
    "feedbacks",
    "category_stats",
    "other_suggestions",
    "assets"
]

def clear_data():
    db = SessionLocal()
    try:
        print(f"Connecting to database: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
        
        # Disable foreign key checks for clearing (different syntax for SQLite and Postgres)
        is_sqlite = "sqlite" in DATABASE_URL
        
        if is_sqlite:
            db.execute(text("PRAGMA foreign_keys = OFF;"))
        else:
            # For Postgres, we truncate with CASCADE or disable triggers
            pass

        for table in TABLES_TO_CLEAR:
            try:
                print(f"Clearing table: {table}...")
                if is_sqlite:
                    db.execute(text(f"DELETE FROM {table};"))
                    db.execute(text(f"DELETE FROM sqlite_sequence WHERE name='{table}';"))
                else:
                    # TRUNCATE is faster and resets sequences in Postgres
                    db.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;"))
                print(f"  [OK] {table} cleared.")
            except Exception as e:
                print(f"  [ERROR] Could not clear {table}: {e}")

        if is_sqlite:
            db.execute(text("PRAGMA foreign_keys = ON;"))
        
        db.commit()
        print("\nData clearing complete (Users, Zones, and Master Data preserved).")
        
    except Exception as e:
        db.rollback()
        print(f"CRITICAL ERROR during clearing: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Safety confirmation
    confirm = input("Are you sure you want to clear all transactional data? (y/N): ")
    if confirm.lower() == 'y':
        clear_data()
    else:
        print("Operation cancelled.")
