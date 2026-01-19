from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, schemas, auth

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=list[schemas.NotificationResponse])
def list_my_notifications(
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    return db.query(database.Notification).filter(
        database.Notification.user_id == current_user.id
    ).order_by(database.Notification.created_at.desc()).all()

@router.put("/{notification_id}/read", response_model=schemas.NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    update: schemas.NotificationReadUpdate,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    notification = db.query(database.Notification).filter(
        database.Notification.id == notification_id,
        database.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = update.is_read
    db.commit()
    db.refresh(notification)
    return notification
