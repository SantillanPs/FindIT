from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, schemas, auth
from dependencies import admin_required, verified_student_required, log_audit
from ai_service import AIService

router = APIRouter(tags=["Claims"])

@router.post("/claims/submit", response_model=schemas.ClaimResponse)
def submit_claim(
    claim: schemas.ClaimCreate,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(verified_student_required)
):
    found_item = db.query(database.FoundItem).filter(database.FoundItem.id == claim.found_item_id).first()
    if not found_item:
        raise HTTPException(status_code=404, detail="Found item not found")
    
    if found_item.status not in [database.ItemStatus.REPORTED.value, database.ItemStatus.IN_CUSTODY.value]:
        raise HTTPException(status_code=400, detail=f"Item is currently {found_item.status} and cannot be claimed.")
    
    if found_item.finder_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot claim an item that you yourself found.")

    new_claim = database.Claim(
        **claim.model_dump(),
        student_id=current_user.id
    )
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)
    return new_claim

def _populate_claim_details(db: Session, claim: database.Claim):
    found_item = db.query(database.FoundItem).filter(database.FoundItem.id == claim.found_item_id).first()
    lost_report = db.query(database.LostItem).filter(
        database.LostItem.user_id == claim.student_id,
        database.LostItem.category == (found_item.category if found_item else None)
    ).order_by(database.LostItem.id.desc()).first()
    
    score = None
    if found_item and lost_report and found_item.embedding and lost_report.embedding:
        found_emb = AIService.get_embedding_list(found_item.embedding)
        lost_emb = AIService.get_embedding_list(lost_report.embedding)
        score = AIService.calculate_similarity(found_emb, lost_emb)
    
    return {
        "id": claim.id,
        "found_item_id": claim.found_item_id,
        "student_id": claim.student_id,
        "proof_description": claim.proof_description,
        "proof_photo_url": claim.proof_photo_url,
        "found_item_private_notes": found_item.private_admin_notes if found_item else None,
        "found_item_category": found_item.category if found_item else None,
        "found_item_description": found_item.description if found_item else None,
        "status": claim.status,
        "admin_notes": claim.admin_notes,
        "similarity_score": score,
        "created_at": claim.created_at
    }

@router.get("/claims/my-claims", response_model=list[schemas.ClaimResponse])
def list_my_claims(
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    return [_populate_claim_details(db, claim) for claim in current_user.claims]

@router.get("/admin/claims/pending", response_model=list[schemas.ClaimResponse])
def list_pending_claims(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    claims = db.query(database.Claim).filter(database.Claim.status == database.ClaimStatus.PENDING.value).all()
    return [_populate_claim_details(db, claim) for claim in claims]

@router.post("/admin/claims/{claim_id}/review", response_model=schemas.ClaimResponse)
def review_claim(
    claim_id: int,
    review: schemas.ClaimReview,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    db_claim = db.query(database.Claim).filter(database.Claim.id == claim_id).first()
    if not db_claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if db_claim.status != database.ClaimStatus.PENDING.value:
        raise HTTPException(status_code=400, detail="Claim has already been reviewed")

    db_claim.status = review.status
    db_claim.admin_notes = review.admin_notes
    
    if review.status == database.ClaimStatus.APPROVED.value:
        found_item = db.query(database.FoundItem).filter(database.FoundItem.id == db_claim.found_item_id).first()
        if found_item:
            found_item.status = database.ItemStatus.CLAIMED.value
            
            # 1. Notify the successful claimer
            approval_notif = database.Notification(
                user_id=db_claim.student_id,
                title="Claim Approved - Ready for Pickup",
                message=f"Good news! Your claim for the '{found_item.category}' has been approved. Please visit the student desk to claim it.",
                found_item_id=found_item.id
            )
            db.add(approval_notif)

            # 2. Handle competing claims
            other_claims = db.query(database.Claim).filter(
                database.Claim.found_item_id == found_item.id,
                database.Claim.id != claim_id,
                database.Claim.status == database.ClaimStatus.PENDING.value
            ).all()
            for c in other_claims:
                c.status = database.ClaimStatus.REJECTED.value
                reason = "Auto-rejected because another claim was approved."
                c.admin_notes = reason
                log_audit(db, admin.id, "claim_auto_reject", claim_id=c.id, notes=reason)
                
                # Notify competing claimers
                rejection_notif = database.Notification(
                    user_id=c.student_id,
                    title="Claim Update",
                    message=f"Your claim for the '{found_item.category}' was not successful as the item has been returned to its verified owner.",
                    found_item_id=found_item.id
                )
                db.add(rejection_notif)
    
    elif review.status == database.ClaimStatus.REJECTED.value:
         # Notify user of manual rejection
         item = db.query(database.FoundItem).filter(database.FoundItem.id == db_claim.found_item_id).first()
         manual_reject_notif = database.Notification(
            user_id=db_claim.student_id,
            title="Claim Rejected",
            message=f"Your claim for the '{item.category if item else 'item'}' was rejected by an admin. Reason: {review.admin_notes or 'Incomplete proof.'}",
            found_item_id=db_claim.found_item_id
         )
         db.add(manual_reject_notif)

    db.commit()
    db.refresh(db_claim)
    
    log_audit(db, admin.id, "claim_review", claim_id=claim_id, notes=f"Decision: {review.status}. Notes: {review.admin_notes}")
    
    return db_claim
