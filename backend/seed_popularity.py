import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
import database
from datetime import datetime, timedelta
import random

def seed_popularity():
    db = database.SessionLocal()
    
    # Target Zones
    # 150: LIBRARY (High)
    # 132: GRADUATE SCHOOL (Medium)
    # 142: IGP (Medium)
    # 145: ADMINISTRATOR (Low)
    
    zone_distributions = {
        150: 15, # Library (15 reports)
        132: 8,  # Graduate School (8 reports)
        142: 7,  # IGP (7 reports)
        145: 2   # Administrator (2 reports)
    }

    print("Seeding popularity data...")
    
    categories = ["Electronics", "Bags", "Documents", "Personal Items", "Books"]
    
    for zone_id, count in zone_distributions.items():
        print(f"Adding {count} reports for Zone ID: {zone_id}")
        for i in range(count):
            # Add a Lost Item
            lost_item = database.LostItem(
                item_name=f"Test Lost {i} in {zone_id}",
                category=random.choice(categories),
                description="Seeded test data for popularity testing.",
                location_zone=f"Seeded Zone {zone_id}",
                zone_id=zone_id,
                last_seen_time=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                status="reported"
            )
            db.add(lost_item)
            
            # Add a Found Item (to mix it up)
            if random.random() > 0.5:
                found_item = database.FoundItem(
                    item_name=f"Test Found {i} in {zone_id}",
                    category=random.choice(categories),
                    description="Seeded test data for popularity testing.",
                    location_zone=f"Seeded Zone {zone_id}",
                    zone_id=zone_id,
                    found_time=datetime.utcnow() - timedelta(days=random.randint(1, 10)),
                    status="reported"
                )
                db.add(found_item)

    db.commit()
    print("Popularity seeding complete.")
    db.close()

if __name__ == "__main__":
    seed_popularity()
