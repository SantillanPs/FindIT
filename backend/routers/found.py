from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import database, schemas, auth
from dependencies import admin_required, verified_student_required, log_audit
from ai_service import AIService

router = APIRouter(tags=["Found Items"])

@router.post("/found/report/guest", response_model=schemas.FoundItemPublic)
def report_found_item_guest(
    item: schemas.FoundItemCreate,
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
    
    combined_text = f"{item.item_name} ({category}): {item.description}"
    embedding_json = AIService.generate_embedding(combined_text)

    item_data = item.model_dump()
    item_data['category'] = category

    # Extract guest info to avoid potential conflicts or duplicates
    guest_first_name = item_data.pop('guest_first_name', None)
    guest_last_name = item_data.pop('guest_last_name', None)
    guest_email = item_data.pop('guest_email', None)

    new_item = database.FoundItem(
        **item_data,
        finder_id=None,
        guest_first_name=guest_first_name,
        guest_last_name=guest_last_name,
        guest_email=guest_email,
        embedding=embedding_json
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    # AUTO-NOTIFY Logic
    target_user = None
    if item.identified_student_id:
        target_user = db.query(database.User).filter(database.User.student_id_number == item.identified_student_id).first()
    elif item.identified_name:
        # Search by first name or last name or combined
        name_part = f"%{item.identified_name}%"
        target_user = db.query(database.User).filter(
            (database.User.first_name + " " + database.User.last_name).ilike(name_part)
        ).first()

    if target_user:
        notification = database.Notification(
            user_id=target_user.id,
            title="🛡️ Proactive Safety Net: Item Identified",
            message=f"FindIT's safety net has identified an item that likely belongs to you! A '{item.item_name}' was recovered at {item.location_zone}. Since your ID was found on the item, it has been reserved for you. Visit the office to verify and claim it.",
            found_item_id=new_item.id
        )
        db.add(notification)
        db.commit()

    return new_item

@router.post("/found/report", response_model=schemas.FoundItemPublic)
def report_found_item(
    item: schemas.FoundItemCreate, 
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(verified_student_required)
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

    combined_text = f"{item.item_name} ({category}): {item.description}"
    embedding_json = AIService.generate_embedding(combined_text)

    item_data = item.model_dump()
    item_data['category'] = category

    # Ensure guest info is cleared for verified student reports
    item_data.pop('guest_first_name', None)
    item_data.pop('guest_last_name', None)
    item_data.pop('guest_email', None)

    new_item = database.FoundItem(
        **item_data,
        finder_id=current_user.id,
        embedding=embedding_json
    )
    db.add(new_item)
    
    db.commit()
    db.refresh(new_item)
    db.refresh(current_user)

    # AUTO-NOTIFY Logic
    target_user = None
    if item.identified_student_id:
        target_user = db.query(database.User).filter(database.User.student_id_number == item.identified_student_id).first()
    elif item.identified_name:
        # Search for exact name match (case-insensitive)
        target_user = db.query(database.User).filter(database.User.full_name.ilike(item.identified_name)).first()

    if target_user:
        notification = database.Notification(
            user_id=target_user.id,
            title="🛡️ Proactive Safety Net: Item Identified",
            message=f"FindIT's safety net has identified an item that likely belongs to you! A '{item.item_name}' was recovered at {item.location_zone}. Since your ID was found on the item, it has been reserved for you. Visit the office to verify and claim it.",
            found_item_id=new_item.id
        )
        db.add(notification)
        db.commit()

    return new_item

@router.get("/found/my-reports", response_model=list[schemas.FoundItemPublic])
def list_my_found_reports(
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    return db.query(database.FoundItem).filter(database.FoundItem.finder_id == current_user.id).all()

@router.get("/found/public", response_model=list[schemas.FoundItemPublic])
def list_public_found_items(db: Session = Depends(auth.get_db)):
    # Items only appear in the public feed once they are in USG custody
    return db.query(database.FoundItem).filter(
        database.FoundItem.status == database.ItemStatus.IN_CUSTODY.value
    ).all()

@router.get("/admin/found", response_model=list[schemas.FoundItemDetail])
def list_admin_found_items(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    return db.query(database.FoundItem).all()

@router.get("/admin/found/{item_id}", response_model=schemas.FoundItemDetail)
def get_found_item_admin_detail(
    item_id: int, 
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    item = db.query(database.FoundItem).filter(database.FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/admin/found/{item_id}/custody", response_model=schemas.FoundItemDetail)
def update_item_custody(
    item_id: int,
    update: schemas.CustodyUpdate,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    item = db.query(database.FoundItem).filter(database.FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # AWARD REWARDS LOGIC (Only if moving to IN_CUSTODY for the first time)
    if item.status != database.ItemStatus.IN_CUSTODY.value and item.finder_id:
        finder = db.query(database.User).filter(database.User.id == item.finder_id).first()
        if finder:
            points_awarded = AIService.calculate_item_value(item.category, item.description)
            finder.integrity_points += points_awarded
            
            # Milestone Check
            milestone_reached = False
            if finder.integrity_points >= 1000 and not finder.is_certificate_eligible:
                finder.is_certificate_eligible = True
                milestone_reached = True
            
            # Notifications
            if milestone_reached:
                cert_notif = database.Notification(
                    user_id=finder.id,
                    title="🏆 1,000 Points Reached: Certificate Eligible!",
                    message="Congratulations! You have reached 1,000 Integrity Points. You are now eligible to receive an Official Certificate of Appreciation from the University. Visit the office to claim yours!"
                )
                db.add(cert_notif)
            
            points_notif = database.Notification(
                user_id=finder.id,
                title="Integrity Points Awarded / Item Verified",
                message=f"Your report for '{item.item_name}' was verified by the USG. You earned +{points_awarded} integrity points. Total: {finder.integrity_points}"
            )
            db.add(points_notif)

    item.status = database.ItemStatus.IN_CUSTODY.value
    db.commit()
    db.refresh(item)
    
    return item

@router.post("/admin/found/bulk/custody", response_model=list[schemas.FoundItemDetail])
def bulk_update_item_custody(
    update: schemas.BulkCustodyUpdate,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    items = db.query(database.FoundItem).filter(database.FoundItem.id.in_(update.item_ids)).all()
    
    # Track finder points for those being verified
    finders_to_reward = {} # finder_id -> total_points
    
    for item in items:
        # Only reward if moving to IN_CUSTODY for the first time
        if item.status != database.ItemStatus.IN_CUSTODY.value and item.finder_id:
            points = AIService.calculate_item_value(item.category, item.description)
            finders_to_reward[item.finder_id] = finders_to_reward.get(item.finder_id, 0) + points
        
        item.status = database.ItemStatus.IN_CUSTODY.value
    
    # Process rewards
    for finder_id, total_points in finders_to_reward.items():
        finder = db.query(database.User).filter(database.User.id == finder_id).first()
        if finder:
            finder.integrity_points += total_points
            
            # Milestone Check
            if finder.integrity_points >= 1000 and not finder.is_certificate_eligible:
                finder.is_certificate_eligible = True
                cert_notif = database.Notification(
                    user_id=finder.id,
                    title="🏆 1,000 Points Reached: Certificate Eligible!",
                    message="Congratulations! You have reached 1,000 Integrity Points. You are now eligible to receive an Official Certificate of Appreciation. Visit the office to claim yours!"
                )
                db.add(cert_notif)
            
            points_notif = database.Notification(
                user_id=finder.id,
                title="Integrity Points Awarded / Items Verified",
                message=f"Your reports were verified by the USG. You earned +{total_points} integrity points. Total: {finder.integrity_points}"
            )
            db.add(points_notif)

    db.commit()
    for item in items:
        db.refresh(item)
        log_audit(db, admin.id, "bulk_custody_update", item_id=item.id, notes=update.notes)
    
    return items

@router.post("/admin/found/{item_id}/release", response_model=schemas.FoundItemDetail)
def release_item(
    item_id: int,
    release: schemas.ItemRelease,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    found_item = db.query(database.FoundItem).filter(database.FoundItem.id == item_id).first()
    if not found_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if found_item.status != database.ItemStatus.CLAIMED.value:
        raise HTTPException(status_code=400, detail="Item must be in 'claimed' status before release")

    found_item.status = database.ItemStatus.RELEASED.value
    found_item.released_to_id = release.released_to_id
    found_item.released_by_name = release.released_by_name
    found_item.released_at = datetime.utcnow()
    
    db.commit()
    db.refresh(found_item)
    
    log_audit(db, admin.id, "item_release", item_id=item_id, notes=f"Released to user {release.released_to_id} by {release.released_by_name}")
    
    return found_item

@router.post("/admin/found/{item_id}/direct-release", response_model=schemas.FoundItemDetail)
def direct_release_item(
    item_id: int,
    release: schemas.ItemDirectRelease,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    found_item = db.query(database.FoundItem).filter(database.FoundItem.id == item_id).first()
    if not found_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Allow release from most active statuses
    if found_item.status in [database.ItemStatus.CLAIMED.value, database.ItemStatus.RELEASED.value]:
        # If it's already released, we shouldn't release it again
        if found_item.status == database.ItemStatus.RELEASED.value:
            raise HTTPException(status_code=400, detail="Item is already released")
    
    # Try to find user by student ID if possible (for better linking)
    actual_user = db.query(database.User).filter(database.User.student_id_number == release.released_to_id_number).first()
    if actual_user:
        found_item.released_to_id = actual_user.id

    found_item.status = database.ItemStatus.RELEASED.value
    found_item.released_to_name = release.released_to_name
    found_item.released_to_id_number = release.released_to_id_number
    found_item.released_by_name = release.released_by_name
    found_item.released_at = datetime.utcnow()
    found_item.released_to_photo_url = release.released_to_photo_url
    
    # Auto-resolve matching lost reports for this recipient
    if actual_user:
        matching_lost = db.query(database.LostItem).filter(
            database.LostItem.user_id == actual_user.id,
            database.LostItem.category == found_item.category,
            database.LostItem.status == database.ItemStatus.REPORTED.value
        ).all()
        for report in matching_lost:
            report.status = database.ItemStatus.RESOLVED.value
            report.admin_notes = (report.admin_notes or "") + f"\n[System] Auto-resolved on {datetime.utcnow().strftime('%Y-%m-%d')} via direct release of item #{item_id}."

    db.commit()
    db.refresh(found_item)
    
    log_audit(db, admin.id, "direct_release", item_id=item_id, notes=f"Directly released to {release.released_to_name} ({release.released_to_id_number}) by {release.released_by_name}")
    
    return found_item

@router.get("/admin/found/released", response_model=list[schemas.FoundItemDetail])
def list_released_items(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    return db.query(database.FoundItem).filter(database.FoundItem.status == database.ItemStatus.RELEASED.value).all()
