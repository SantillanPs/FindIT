import sys
sys.path.append('backend')
import database
from ai_service import AIService
from datetime import datetime

def seed_complex_matches():
    db = database.SessionLocal()
    
    # 1. High Match: iPhone 15 Pro
    found_iphone = database.FoundItem(
        category="Cellphone",
        description="Found an iPhone 15 Pro, titanium blue, near the cafeteria.",
        location_zone="Library 2nd Floor",
        embedding=AIService.generate_embedding("Cell Phones: Found an iPhone 15 Pro, titanium blue, near the cafeteria.")
    )
    lost_iphone = database.LostItem(
        category="Cellphone",
        description="Lost my new iPhone 15 Pro (Blue Titanium) somewhere near the dining area.",
        location_zone="Cafeteria",
        private_proof_details="Wallpaper is a photo of a golden retriever.",
        status="reported",
        user_id=2,
        embedding=AIService.generate_embedding("Cell Phones: Lost my new iPhone 15 Pro (Blue Titanium) somewhere near the dining area.")
    )
    
    # 2. Medium Match: Scientific Calculator
    found_calc = database.FoundItem(
        category="Book",
        description="Casio Scientific Calculator, black.",
        location_zone="Student Center Cafeteria",
        embedding=AIService.generate_embedding("Books & Stationery: Casio Scientific Calculator, black.")
    )
    lost_calc = database.LostItem(
        category="Book",
        description="Lost my black calculator (Casio) in the engineering building.",
        location_zone="Engineering Hall",
        private_proof_details="Has an 'Engineering' sticker.",
        status="reported",
        user_id=2,
        embedding=AIService.generate_embedding("Books & Stationery: Lost my black calculator (Casio) in the engineering building.")
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
