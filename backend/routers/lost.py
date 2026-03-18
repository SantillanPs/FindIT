from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta
import database, schemas, auth
from database import WitnessReport, WitnessReportStatus, User
from dependencies import admin_required, verified_student_required
from ai_service import AIService
from location_service import LocationService
from datetime import datetime
import uuid

router = APIRouter(tags=["Lost Items"])

def _calculate_hybrid_score(db: Session, base_score, lost_item, found_item):
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
    
    # 1. Location Weighting
    if lost_item.zone_id and found_item.zone_id:
        distance = LocationService.get_shortest_path_distance(db, lost_item.zone_id, found_item.zone_id)
        final_score += LocationService.calculate_location_score(distance)
    elif lost_item.location_zone and found_item.location_zone:
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

    # Clamp results to reasonable range [0.01, 0.99]
    return max(0.01, min(0.99, final_score))

@router.post("/lost/report/guest", response_model=schemas.LostItemResponse)
def report_lost_item_guest(
    item: schemas.LostItemCreate,
    db: Session = Depends(auth.get_db)
):
    # Use provided category, fallback to item_name (the "title") as requested
    category = item.category or item.item_name

    # Dynamic Stats logic
    stat = db.query(database.CategoryStat).filter(database.CategoryStat.category_id == category).first()
    if not stat:
        stat = database.CategoryStat(category_id=category, hit_count=1)
        db.add(stat)
    else:
        stat.hit_count += 1
    
    if category == "Other" and item.item_name:
        suggestion = db.query(database.OtherSuggestion).filter(database.OtherSuggestion.suggested_name.ilike(item.item_name)).first()
        if not suggestion:
            suggestion = database.OtherSuggestion(suggested_name=item.item_name)
            db.add(suggestion)
        else:
            suggestion.hit_count += 1
            suggestion.last_reported_at = datetime.utcnow()

    # Semantic Matching: Generate embedding
    combined_text = f"{item.item_name} ({category}): {item.description}"
    embedding_json = AIService.generate_embedding(combined_text)

    item_data = item.model_dump()
    item_data['category'] = category

    # Extract guest info to avoid duplicate kwargs
    guest_first_name = item_data.pop('guest_first_name', None)
    guest_last_name = item_data.pop('guest_last_name', None)
    guest_email = item_data.pop('guest_email', None)

    new_item = database.LostItem(
        **item_data,
        user_id=None,
        guest_first_name=guest_first_name,
        guest_last_name=guest_last_name,
        guest_email=guest_email,
        tracking_id=str(uuid.uuid4()),
        embedding=embedding_json
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.post("/lost/report", response_model=schemas.LostItemResponse)
def report_lost_item(
    item: schemas.LostItemCreate,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user_optional)
):
    # Use provided category, fallback to item_name (the "title") as requested
    category = item.category or item.item_name

    # Dynamic Stats logic
    stat = db.query(database.CategoryStat).filter(database.CategoryStat.category_id == category).first()
    if not stat:
        stat = database.CategoryStat(category_id=category, hit_count=1)
        db.add(stat)
    else:
        stat.hit_count += 1
    
    if category == "Other" and item.item_name:
        suggestion = db.query(database.OtherSuggestion).filter(database.OtherSuggestion.suggested_name.ilike(item.item_name)).first()
        if not suggestion:
            suggestion = database.OtherSuggestion(suggested_name=item.item_name)
            db.add(suggestion)
        else:
            suggestion.hit_count += 1
            suggestion.last_reported_at = datetime.utcnow()

    # Semantic Matching: Generate embedding for item name and description
    combined_text = f"{item.item_name} ({category}): {item.description}"
    embedding_json = AIService.generate_embedding(combined_text)

    item_data = item.model_dump()
    item_data['category'] = category

    # Extract guest info to avoid duplicate kwargs
    guest_first_name = item_data.pop('guest_first_name', None)
    guest_last_name = item_data.pop('guest_last_name', None)
    guest_email = item_data.pop('guest_email', None)

    if not current_user:
        if not (guest_first_name or guest_last_name) or not guest_email:
            raise HTTPException(status_code=400, detail="Name and email are required for guest reports.")

    new_item = database.LostItem(
        **item_data,
        user_id=current_user.id if current_user else None,
        guest_first_name=guest_first_name if not current_user else None,
        guest_last_name=guest_last_name if not current_user else None,
        guest_email=guest_email if not current_user else None,
        tracking_id=str(uuid.uuid4()) if not current_user else None,
        embedding=embedding_json
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/lost/status/{tracking_id}", response_model=schemas.LostItemResponse)
def get_lost_report_status(
    tracking_id: str,
    db: Session = Depends(auth.get_db)
):
    report = db.query(database.LostItem).filter(database.LostItem.tracking_id == tracking_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Tracking ID not found.")
    return report



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
        database.FoundItem.status == database.ItemStatus.IN_CUSTODY.value,
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
            hybrid_score = _calculate_hybrid_score(db, base_score, lost_item, found)
            
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
            score = _calculate_hybrid_score(db, base_score, lost, found)
            
            # Threshold to avoid noise, but keep it low enough for manual review
            if score >= 0.3: 
                matches.append({
                    "item": lost,
                    "similarity_score": score
                })
        
        if matches:
            matches.sort(key=lambda x: x['similarity_score'], reverse=True)
            results.append({
                "found_item": found,
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
            score = _calculate_hybrid_score(db, base_score, lost, found_item)
            suggestions.append({
                "item": lost,
                "similarity_score": score
            })
    
    suggestions.sort(key=lambda x: x['similarity_score'], reverse=True)
    return suggestions
@router.get("/lost/public", response_model=list[schemas.LostItemPublic])
def list_public_lost_items(db: Session = Depends(auth.get_db)):
    return db.query(database.LostItem).filter(
        database.LostItem.status == "reported"
    ).all()

@router.get("/lost/public/{report_id}", response_model=schemas.LostItemPublic)
def get_public_lost_item(report_id: int, db: Session = Depends(auth.get_db)):
    report = db.query(database.LostItem).filter(
        database.LostItem.id == report_id,
        database.LostItem.status == "reported"
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lost report not found or is no longer public")
    return report

@router.get("/lost/my-reports/{report_id}", response_model=schemas.LostItemResponse)
def get_my_lost_report(report_id: int, current_user: database.User = Depends(auth.get_current_user), db: Session = Depends(auth.get_db)):
    report = db.query(database.LostItem).filter(
        database.LostItem.id == report_id,
        database.LostItem.reporter_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lost report not found or you are not the owner")
    return report

@router.get("/admin/lost/all", response_model=list[schemas.LostItemResponse])
def admin_get_all_lost_reports(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    return db.query(database.LostItem).filter(
        database.LostItem.status != "found"
    ).order_by(database.LostItem.last_seen_time.desc()).all()

@router.put("/admin/lost/{report_id}/status", response_model=schemas.LostItemResponse)
def admin_update_lost_report_status(
    report_id: int,
    update: schemas.LostItemUpdate,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    report = db.query(database.LostItem).filter(database.LostItem.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lost report not found")
    
    if update.status:
        report.status = update.status
    if update.admin_notes is not None:
        report.admin_notes = update.admin_notes
    
    db.commit()
    db.refresh(report)
    return report

@router.post("/lost/{report_id}/witness", response_model=schemas.WitnessReportResponse)
def submit_witness_report(
    report_id: int,
    witness_report: schemas.WitnessReportCreate,
    db: Session = Depends(auth.get_db),
    current_user: User = Depends(auth.get_current_user_optional)
):
    lost_item = db.query(database.LostItem).filter(database.LostItem.id == report_id).first()
    if not lost_item:
        raise HTTPException(status_code=404, detail="Lost report not found")
    
    new_report = WitnessReport(
        lost_item_id=report_id,
        reporter_id=current_user.id if current_user else None,
        guest_first_name=witness_report.guest_first_name if not current_user else None,
        guest_last_name=witness_report.guest_last_name if not current_user else None,
        guest_email=witness_report.guest_email if not current_user else None,
        contact_info=witness_report.contact_info,
        witness_description=witness_report.witness_description,
        witness_photo_url=witness_report.witness_photo_url,
        is_anonymous=witness_report.is_anonymous,
        status=WitnessReportStatus.PENDING.value
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@router.get("/admin/witness-reports", response_model=list[schemas.WitnessReportResponse])
def get_all_witness_reports(
    db: Session = Depends(auth.get_db),
    admin: User = Depends(admin_required)
):
    return db.query(WitnessReport).all()

@router.put("/admin/witness-reports/{report_id}/status", response_model=schemas.WitnessReportResponse)
def update_witness_report_status(
    report_id: int,
    update: schemas.WitnessReportStatusUpdate,
    db: Session = Depends(auth.get_db),
    admin: User = Depends(admin_required)
):
    report = db.query(WitnessReport).filter(WitnessReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Witness report not found")
    
    old_status = report.status
    report.status = update.status
    
    # Award points if approved and not anonymous
    if report.status == WitnessReportStatus.APPROVED.value and old_status != WitnessReportStatus.APPROVED.value:
        if not report.is_anonymous and report.reporter_id:
            reporter = db.query(User).filter(User.id == report.reporter_id).first()
            if reporter:
                # Award fixed points for witness report (e.g., 100 points)
                points_to_award = 100 
                reporter.integrity_points += points_to_award
                
                # Check milestone
                if reporter.integrity_points >= 1000 and not reporter.is_certificate_eligible:
                    reporter.is_certificate_eligible = True
                
                # Notification
                notif = database.Notification(
                    user_id=reporter.id,
                    title="Witness Report Approved!",
                    message=f"Your witness report was approved. You earned +{points_to_award} integrity points!"
                )
                db.add(notif)
    
    db.commit()
    db.refresh(report)
    return report

@router.post("/lost/{report_id}/matches/{found_id}/respond")
def respond_to_match(
    report_id: int,
    found_id: int,
    response: schemas.MatchResponse,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    lost_item = db.query(database.LostItem).filter(
        database.LostItem.id == report_id,
        database.LostItem.user_id == current_user.id
    ).first()
    
    found_item = db.query(database.FoundItem).filter(
        database.FoundItem.id == found_id,
        database.FoundItem.matched_lost_id == report_id
    ).first()

    if not lost_item or not found_item:
        raise HTTPException(status_code=404, detail="Match not found")

    if response.action == "confirm":
        # Keep it as pending_owner but maybe add a note
        found_item.private_admin_notes = (found_item.private_admin_notes or "") + f"\n[System] Owner confirmed match on {datetime.utcnow().strftime('%Y-%m-%d')}."
        # Create notification for the FINDER
        if found_item.finder_id:
            finder_notif = database.Notification(
                user_id=found_item.finder_id,
                title="✅ Match Confirmed by Owner!",
                message=f"The owner of the '{lost_item.item_name}' has confirmed your find! Please surrender the item to the USG office as soon as possible to receive your integrity points.",
                found_item_id=found_item.id
            )
            db.add(finder_notif)
    elif response.action == "reject":
        # Rejection: Make the found item public
        found_item.status = database.ItemStatus.REPORTED.value
        found_item.matched_lost_id = None
        found_item.private_admin_notes = (found_item.private_admin_notes or "") + f"\n[System] Owner rejected match on {datetime.utcnow().strftime('%Y-%m-%d')}. Item is now public."
        
        # Notify the finder that it's now a public report
        if found_item.finder_id:
            finder_notif = database.Notification(
                user_id=found_item.finder_id,
                title="⚠️ Match Rejected (Item now Public)",
                message=f"The owner of the '{lost_item.item_name}' indicated this is not their item. Your report has been converted to a public Found Item report.",
                found_item_id=found_item.id
            )
            db.add(finder_notif)

    db.commit()
    return {"status": "success", "action": response.action}
