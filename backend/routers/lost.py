from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta
import database, schemas, auth
from dependencies import admin_required, verified_student_required
from ai_service import AIService

router = APIRouter(tags=["Lost Items"])

def _calculate_hybrid_score(base_score, lost_item, found_item):
    """
    Combines AI semantic score with metadata (location/time) boosts and penalties.
    """
    final_score = base_score
    
    # 0. Information Density Check (Zombie Report Penalty)
    # Penalize findings that have almost no information to verify
    found_desc_len = len(found_item.description.strip())
    if found_desc_len < 5:
        final_score -= 0.35 # Severe penalty for empty/tiny descriptions
    elif found_desc_len < 15:
        final_score -= 0.10 # Light penalty for very vague descriptions
        
    if not found_item.location_zone or found_item.location_zone.strip() in ["", "Unknown", "none"]:
        final_score -= 0.10 # Penalty for missing found location
        
    if not found_item.private_admin_notes or len(found_item.private_admin_notes.strip()) < 3:
        final_score -= 0.05 # Small penalty for missing finder proof (Master Record)
    
    # 1. Location Weighting
    if lost_item.location_zone and found_item.location_zone:
        if lost_item.location_zone == found_item.location_zone:
            final_score += 0.15 # Exact match boost
        else:
            final_score -= 0.10 # Mismatch penalty (per user request)

    # 2. Time Weighting
    if lost_item.last_seen_time and found_item.found_time:
        delta = abs((lost_item.last_seen_time - found_item.found_time).days)
        if delta <= 2:
            final_score += 0.05 # Immediate match boost
        elif delta > 14:
            final_score -= 0.20 # Severe gap penalty
        elif delta > 5:
            final_score -= 0.10 # Reduced confidence gap (per user request)

    # 3. Secret Proof Cross-Check (Manual precision layer)
    # This helps penalize mismatches that AI might miss if description is long
    if lost_item.private_proof_details and found_item.private_admin_notes:
        s1 = set(w for w in lost_item.private_proof_details.lower().split() if len(w) > 2)
        s2 = set(w for w in found_item.private_admin_notes.lower().split() if len(w) > 2)
        
        if s1 and s2:
            if s1.intersection(s2):
                final_score += 0.05 # Boost for shared secret keywords
            else:
                final_score -= 0.05 # Small penalty for completely different secrets (per user request)
            
    # Clamp results to reasonable range [0.01, 0.99]
    return max(0.01, min(0.99, final_score))

@router.post("/lost/report", response_model=schemas.LostItemResponse)
def report_lost_item(
    item: schemas.LostItemCreate,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(verified_student_required)
):
    # Deep Secret Matching: Include private proof in the embedding for better semantic matching
    combined_text = f"{item.category}: {item.description}. Proof: {item.private_proof_details}"
    embedding_json = AIService.generate_embedding(combined_text)

    new_item = database.LostItem(
        **item.model_dump(),
        user_id=current_user.id,
        embedding=embedding_json
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.post("/lost/report/guest", response_model=schemas.LostItemResponse)
def report_lost_item_guest(
    item: schemas.LostItemCreate,
    db: Session = Depends(auth.get_db)
):
    if not item.contact_email:
        raise HTTPException(status_code=400, detail="Contact email is required for guest reports")

    # Deep Secret Matching: Include private proof in the embedding for better semantic matching
    combined_text = f"{item.category}: {item.description}. Proof: {item.private_proof_details}"
    embedding_json = AIService.generate_embedding(combined_text)

    new_item = database.LostItem(
        **item.model_dump(),
        user_id=None,
        embedding=embedding_json
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/lost/my-reports", response_model=list[schemas.LostItemResponse])
def list_my_lost_reports(
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    return current_user.lost_items

@router.get("/lost/{report_id}/matches", response_model=list[schemas.MatchSuggestion])
def get_matches_for_lost_item(
    report_id: int,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    lost_item = db.query(database.LostItem).filter(
        database.LostItem.id == report_id,
        database.LostItem.user_id == current_user.id
    ).first()
    
    if not lost_item:
        raise HTTPException(status_code=404, detail="Lost report not found")
    
    if not lost_item.embedding:
        raise HTTPException(status_code=400, detail="Report has no embedding")

    lost_embedding = AIService.get_embedding_list(lost_item.embedding)
    
    # Relaxed time window for hybrid scoring: +/- 14 days
    time_window = timedelta(days=14)
    start_time = lost_item.last_seen_time - time_window
    end_time = lost_item.last_seen_time + time_window

    query = db.query(database.FoundItem).filter(
        database.FoundItem.status.in_([database.ItemStatus.REPORTED.value, database.ItemStatus.IN_CUSTODY.value]),
        database.FoundItem.category == lost_item.category,
        database.FoundItem.found_time >= start_time,
        database.FoundItem.found_time <= end_time
    )

    # Note: We removed the hard location filter here so Hybrid Scoring can handle 
    # the location boost/penalty probabilisticly.
    found_candidates = query.all()
    
    suggestions = []
    for found in found_candidates:
        if found.embedding:
            found_embedding = AIService.get_embedding_list(found.embedding)
            base_score = AIService.calculate_similarity(lost_embedding, found_embedding)
            hybrid_score = _calculate_hybrid_score(base_score, lost_item, found)
            
            # For students, only show items with a decent hybrid confidence
            if hybrid_score >= 0.4:
                suggestions.append(schemas.MatchSuggestion(
                    item=found,
                    similarity_score=hybrid_score
                ))
    
    suggestions.sort(key=lambda x: x.similarity_score, reverse=True)
    return suggestions

@router.get("/admin/matches/all", response_model=list[schemas.GlobalMatchGroup])
def admin_get_all_global_matches(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    # 1. Get all eligible found items
    found_items = db.query(database.FoundItem).filter(
        database.FoundItem.status.in_([database.ItemStatus.REPORTED.value, database.ItemStatus.IN_CUSTODY.value])
    ).all()
    
    # 2. Get all eligible lost reports
    lost_items = db.query(database.LostItem).filter(
        database.LostItem.status == "reported"
    ).all()
    
    results = []
    
    for found in found_items:
        if not found.embedding: continue
        
        found_emb = AIService.get_embedding_list(found.embedding)
        matches = []
        
        for lost in lost_items:
            # Only match same category
            if lost.category != found.category: continue
            if not lost.embedding: continue
            
            lost_emb = AIService.get_embedding_list(lost.embedding)
            base_score = AIService.calculate_similarity(found_emb, lost_emb)
            score = _calculate_hybrid_score(base_score, lost, found)
            
            # Threshold to avoid noise, but keep it low enough for manual review
            if score >= 0.3: 
                matches.append({
                    "item": {
                        "id": lost.id,
                        "category": lost.category,
                        "description": lost.description,
                        "location_zone": lost.location_zone,
                        "last_seen_time": lost.last_seen_time,
                        "private_proof_details": lost.private_proof_details,
                        "status": lost.status,
                        "user_id": lost.user_id,
                        "contact_email": lost.contact_email
                    },
                    "similarity_score": score
                })
        
        if matches:
            matches.sort(key=lambda x: x['similarity_score'], reverse=True)
            results.append({
                "found_item": {
                    "id": found.id,
                    "category": found.category,
                    "description": found.description,
                    "location_zone": found.location_zone,
                    "found_time": found.found_time,
                    "status": found.status,
                    "private_admin_notes": found.private_admin_notes
                },
                "top_matches": matches,
                "max_score": matches[0]['similarity_score']
            })
            
    # Sort groups by highest match score in the entire system
    results.sort(key=lambda x: x['max_score'], reverse=True)
    return results

@router.post("/admin/matches/connect")
def admin_connect_match(
    request: schemas.MatchRequest,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    found_item = db.query(database.FoundItem).filter(database.FoundItem.id == request.found_item_id).first()
    lost_item = db.query(database.LostItem).filter(database.LostItem.id == request.lost_item_id).first()
    
    if not found_item or not lost_item:
        raise HTTPException(status_code=404, detail="Item or report not found")
    
    # Update statuses
    found_item.status = database.ItemStatus.MATCHED.value
    lost_item.status = database.ItemStatus.MATCHED.value
    
    # Create notification for the OWNER (Lost report student)
    owner_notif = database.Notification(
        user_id=lost_item.user_id,
        title="Good News! A Potential Match Found",
        message=f"Admin has identified a found '{found_item.category}' that matches your lost report. Please visit the USG office or check your claims for more info.",
        found_item_id=found_item.id,
        lost_item_id=lost_item.id
    )
    
    # Create notification for the FINDER
    finder_notif = database.Notification(
        user_id=found_item.finder_id,
        title="Match Found for Item You Reported",
        message=f"The '{found_item.category}' you found has been matched with a student's lost report. Please ensure you have surrendered it to the USG office if you haven't yet.",
        found_item_id=found_item.id,
        lost_item_id=lost_item.id
    )
    
    db.add(owner_notif)
    db.add(finder_notif)
    db.commit()
    
    return {"status": "success", "message": "Match connected and students notified"}

@router.get("/admin/found/{item_id}/matches", response_model=list[schemas.AdminMatchSuggestion])
def admin_get_matches_for_found_item(
    item_id: int,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    found_item = db.query(database.FoundItem).filter(database.FoundItem.id == item_id).first()
    if not found_item:
        raise HTTPException(status_code=404, detail="Found item not found")
    
    if not found_item.embedding:
        raise HTTPException(status_code=400, detail="Item has no embedding")

    found_embedding = AIService.get_embedding_list(found_item.embedding)
    
    query = db.query(database.LostItem).filter(
        database.LostItem.status == "reported",
        database.LostItem.category == found_item.category
    )

    lost_candidates = query.all()
    
    suggestions = []
    for lost in lost_candidates:
        if lost.embedding:
            lost_embedding = AIService.get_embedding_list(lost.embedding)
            base_score = AIService.calculate_similarity(found_embedding, lost_embedding)
            score = _calculate_hybrid_score(base_score, lost, found_item)
            suggestions.append({
                "item": {
                    "id": lost.id,
                    "category": lost.category,
                    "description": lost.description,
                    "location_zone": lost.location_zone,
                    "last_seen_time": lost.last_seen_time,
                    "private_proof_details": lost.private_proof_details,
                    "status": lost.status,
                    "user_id": lost.user_id,
                    "contact_email": lost.contact_email
                },
                "similarity_score": score
            })
    
    suggestions.sort(key=lambda x: x['similarity_score'], reverse=True)
    return suggestions
