from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta
import database, schemas, auth
from dependencies import admin_required, verified_student_required
from ai_service import AIService

router = APIRouter(tags=["Lost Items"])

@router.post("/lost/report", response_model=schemas.LostItemResponse)
def report_lost_item(
    item: schemas.LostItemCreate,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(verified_student_required)
):
    combined_text = f"{item.category}: {item.description}"
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
    
    time_window = timedelta(days=3)
    start_time = lost_item.last_seen_time - time_window
    end_time = lost_item.last_seen_time + time_window

    query = db.query(database.FoundItem).filter(
        database.FoundItem.status.in_([database.ItemStatus.REPORTED.value, database.ItemStatus.IN_CUSTODY.value]),
        database.FoundItem.category == lost_item.category,
        database.FoundItem.found_time >= start_time,
        database.FoundItem.found_time <= end_time
    )

    if lost_item.location_zone:
        query = query.filter(database.FoundItem.location_zone == lost_item.location_zone)

    found_candidates = query.all()
    
    suggestions = []
    for found in found_candidates:
        if found.embedding:
            found_embedding = AIService.get_embedding_list(found.embedding)
            score = AIService.calculate_similarity(lost_embedding, found_embedding)
            suggestions.append(schemas.MatchSuggestion(
                item=found,
                similarity_score=score
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
            score = AIService.calculate_similarity(found_emb, lost_emb)
            
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
                        "user_id": lost.user_id
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
                    "status": found.status
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
            score = AIService.calculate_similarity(found_embedding, lost_embedding)
            suggestions.append({
                "item": {
                    "id": lost.id,
                    "category": lost.category,
                    "description": lost.description,
                    "location_zone": lost.location_zone,
                    "last_seen_time": lost.last_seen_time,
                    "private_proof_details": lost.private_proof_details,
                    "status": lost.status,
                    "user_id": lost.user_id
                },
                "similarity_score": score
            })
    
    suggestions.sort(key=lambda x: x['similarity_score'], reverse=True)
    return suggestions
