from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import database, schemas, auth
from dependencies import super_admin_required

router = APIRouter(tags=["Feedbacks"])

@router.post("/feedbacks", response_model=schemas.FeedbackResponse)
def create_feedback(
    feedback: schemas.FeedbackCreate, 
    db: Session = Depends(auth.get_db), 
    current_user: database.User = Depends(auth.get_current_user_optional)  # Use correct optional user dependency
):
    user_id = current_user.id if current_user else None
    user_name = f"{current_user.first_name} {current_user.last_name}" if current_user else "Anonymous Guest"
    
    db_feedback = database.Feedback(
        **feedback.model_dump(),
        user_id=user_id
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    # Enrichment for response
    user_name = f"{current_user.first_name} {current_user.last_name}"
    
    # Since FeedbackResponse is the model, and we are returning db_feedback, 
    # we can set an attribute on db_feedback object even if it's not in the DB model
    # as long as the Pydantic model expects it and from_attributes is true.
    setattr(db_feedback, "user_name", user_name)
    
    return db_feedback

@router.get("/feedbacks", response_model=list[schemas.FeedbackResponse])
def list_feedbacks(
    db: Session = Depends(auth.get_db), 
    admin: database.User = Depends(super_admin_required)
):
    feedbacks = db.query(database.Feedback).order_by(database.Feedback.created_at.desc()).all()
    
    for f in feedbacks:
        if f.user:
            setattr(f, "user_name", f"{f.user.first_name} {f.user.last_name}")
        else:
            setattr(f, "user_name", "Anonymous")
            
    return feedbacks

@router.get("/feedbacks/my", response_model=list[schemas.FeedbackResponse])
def list_my_feedbacks(
    db: Session = Depends(auth.get_db), 
    current_user: database.User = Depends(auth.get_current_user)
):
    feedbacks = db.query(database.Feedback).filter(database.Feedback.user_id == current_user.id).order_by(database.Feedback.created_at.desc()).all()
    for f in feedbacks:
        setattr(f, "user_name", f"{current_user.first_name} {current_user.last_name}")
    return feedbacks

@router.patch("/feedbacks/{feedback_id}", response_model=schemas.FeedbackResponse)
def update_feedback_status(
    feedback_id: int, 
    update: schemas.FeedbackStatusUpdate, 
    db: Session = Depends(auth.get_db), 
    admin: database.User = Depends(super_admin_required)
):
    db_feedback = db.query(database.Feedback).filter(database.Feedback.id == feedback_id).first()
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    db_feedback.status = update.status
    if update.admin_notes is not None:
        db_feedback.admin_notes = update.admin_notes
        
    db.commit()
    db.refresh(db_feedback)
    
    # Auto-notify user if resolved
    if update.status == database.FeedbackStatus.RESOLVED.value and db_feedback.user_id:
        notification = database.Notification(
            user_id=db_feedback.user_id,
            title="✅ Feedback Resolved",
            message=f"Your feedback '{db_feedback.subject}' has been marked as resolved by the Super Admin. Notes: {update.admin_notes or 'No additional notes.'}"
        )
        db.add(notification)
        db.commit()

    if db_feedback.user:
        setattr(db_feedback, "user_name", f"{db_feedback.user.first_name} {db_feedback.user.last_name}")
    else:
        setattr(db_feedback, "user_name", "Anonymous")
        
    return db_feedback
