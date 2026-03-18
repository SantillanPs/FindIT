
import database
from sqlalchemy.orm import Session

# Hardcoded data from frontend constants
CATEGORIES = [
  { 'id': 'Cellphone', 'label': 'Cellphone', 'icon': 'fa-solid fa-mobile-screen-button', 'emoji': '📱' },
  { 'id': 'Laptop', 'label': 'Laptop', 'icon': 'fa-solid fa-laptop', 'emoji': '💻' },
  { 'id': 'Tablet', 'label': 'Tablet', 'icon': 'fa-solid fa-tablet-screen-button', 'emoji': '📟' },
  { 'id': 'ID Card', 'label': 'ID Card', 'icon': 'fa-solid fa-address-card', 'emoji': '🪪' },
  { 'id': 'Wallet', 'label': 'Wallet', 'icon': 'fa-solid fa-wallet', 'emoji': '👛' },
  { 'id': 'Bag / Backpack', 'label': 'Bag / Backpack', 'icon': 'fa-solid fa-bag-shopping', 'emoji': '🎒' },
  { 'id': 'Keys', 'label': 'Keys', 'icon': 'fa-solid fa-key', 'emoji': '🔑' },
  { 'id': 'Headphones / Earbuds', 'label': 'Headphones / Earbuds', 'icon': 'fa-solid fa-headphones', 'emoji': '🎧' },
  { 'id': 'Watch / Wearable', 'label': 'Watch / Wearable', 'icon': 'fa-solid fa-clock', 'emoji': '⌚' },
  { 'id': 'Water Bottle', 'label': 'Water Bottle', 'icon': 'fa-solid fa-bottle-water', 'emoji': '🥤' },
  { 'id': 'Umbrella', 'label': 'Umbrella', 'icon': 'fa-solid fa-umbrella', 'emoji': '🌂' },
  { 'id': 'Eyewear', 'label': 'Eyewear', 'icon': 'fa-solid fa-glasses', 'emoji': '🕶️' },
  { 'id': 'Book', 'label': 'Book', 'icon': 'fa-solid fa-book', 'emoji': '📖' },
  { 'id': 'Notebook', 'label': 'Notebook', 'icon': 'fa-solid fa-book-open', 'emoji': '📓' },
  { 'id': 'Stationery', 'label': 'Stationery', 'icon': 'fa-solid fa-pen-nib', 'emoji': '✏️' },
  { 'id': 'Clothing', 'label': 'Clothing', 'icon': 'fa-solid fa-shirt', 'emoji': '👕' },
  { 'id': 'Accessories', 'label': 'Accessories', 'icon': 'fa-solid fa-gem', 'emoji': '💍' },
  { 'id': 'Other', 'label': 'Other', 'icon': 'fa-solid fa-box-archive', 'emoji': '📦' },
]

COLLEGES = [
  {
    'id': 'CTE',
    'label': 'College of Teacher Education',
    'icon': 'fa-chalkboard-user',
    'color': 'bg-emerald-500'
  },
  {
    'id': 'CAS',
    'label': 'College of Arts and Sciences',
    'icon': 'fa-flask-vial',
    'color': 'bg-blue-500'
  },
  {
    'id': 'CBM',
    'label': 'College of Business and Management',
    'icon': 'fa-briefcase',
    'color': 'bg-amber-500'
  },
  {
    'id': 'CITE',
    'label': 'College of Information Technology Education',
    'icon': 'fa-laptop-code',
    'color': 'bg-indigo-500'
  },
  {
    'id': 'CET',
    'label': 'College of Engineering and Technology',
    'icon': 'fa-gears',
    'color': 'bg-orange-500'
  },
  {
    'id': 'LAW',
    'label': 'College of Law',
    'icon': 'fa-scale-balanced',
    'color': 'bg-red-500'
  }
]

def seed_metadata():
    database.init_db()
    db = database.SessionLocal()
    try:
        # Seed Categories
        for cat in CATEGORIES:
            existing = db.query(database.MasterCategory).filter_by(id=cat['id']).first()
            if not existing:
                db.add(database.MasterCategory(**cat))
                print(f"Added Category: {cat['label']}")
        
        # Seed Colleges
        for col in COLLEGES:
            existing = db.query(database.MasterCollege).filter_by(id=col['id']).first()
            if not existing:
                db.add(database.MasterCollege(**col))
                print(f"Added College: {col['label']}")
        
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_metadata()
