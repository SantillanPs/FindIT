import sys
sys.path.append('backend')
import database
from ai_service import AIService
from datetime import datetime

def seed_complex_matches():
    db = database.SessionLocal()
    
    # 1. High Match: iPhone 15 Pro
    found_iphone = database.FoundItem(
        category="Electronics",
        description="Found an iPhone 15 Pro, titanium blue, near the cafeteria.",
        location_zone="Cafeteria",
        private_admin_notes="Has a cracked screen protector. IMEI: 12345",
        status="reported",
        embedding=AIService.generate_embedding("Electronics: Found an iPhone 15 Pro, titanium blue, near the cafeteria.")
    )
    lost_iphone = database.LostItem(
        category="Electronics",
        description="Lost my new iPhone 15 Pro (Blue Titanium) somewhere near the dining area.",
        location_zone="Cafeteria",
        private_proof_details="Wallpaper is a photo of a golden retriever.",
        status="reported",
        user_id=2,
        embedding=AIService.generate_embedding("Electronics: Lost my new iPhone 15 Pro (Blue Titanium) somewhere near the dining area.")
    )
    
    # 2. Medium Match: Scientific Calculator
    found_calc = database.FoundItem(
        category="Stationery",
        description="Casio Scientific Calculator, black.",
        location_zone="Engineering Hall",
        private_admin_notes="Student name 'Juan' scratched on back.",
        status="reported",
        embedding=AIService.generate_embedding("Stationery: Casio Scientific Calculator, black.")
    )
    lost_calc = database.LostItem(
        category="Stationery",
        description="Lost my black calculator (Casio) in the engineering building.",
        location_zone="Engineering Hall",
        private_proof_details="Has an 'Engineering' sticker.",
        status="reported",
        user_id=2,
        embedding=AIService.generate_embedding("Stationery: Lost my black calculator (Casio) in the engineering building.")
    )
    
    db.add(found_iphone)
    db.add(found_calc)
    db.add(lost_iphone)
    db.add(lost_calc)
    
    db.commit()
    print("Complex match scenario seeded.")
    db.close()

if __name__ == "__main__":
    seed_complex_matches()
