import sys
sys.path.append('backend')
import database
from ai_service import AIService
from datetime import datetime

def cleanup_and_add_unique():
    db = database.SessionLocal()
    
    print("Cleaning up duplicate test reports (ID 3-6)...")
    db.query(database.LostItem).filter(database.LostItem.id.in_([3, 4, 5, 6])).delete(synchronize_session=False)
    
    # Update ID 2 to have slightly different text to be sure
    report2 = db.query(database.LostItem).filter(database.LostItem.id == 2).first()
    if report2:
        report2.description = "Space Gray iPad (Original Test)"
        report2.private_proof_details = "Original Test Proof: Blue keyboard case."
    
    print("Adding a new unique lost report...")
    unique_data = {
        "category": "Electronics",
        "description": "MacBook Air with a custom laser engraving",
        "location_zone": "Engineering Hall",
        "private_proof_details": "Unique Proof: The engraving says 'Property of Admin' on the bottom.",
        "status": "reported",
        "user_id": 2
    }
    
    combined_text = f"{unique_data['category']}: {unique_data['description']}"
    embedding_json = AIService.generate_embedding(combined_text)
    
    new_report = database.LostItem(
        **unique_data,
        embedding=embedding_json,
        last_seen_time=datetime.utcnow()
    )
    db.add(new_report)
    
    db.commit()
    print("Database updated successfully.")
    db.close()

if __name__ == "__main__":
    cleanup_and_add_unique()
