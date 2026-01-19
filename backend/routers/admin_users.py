from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, schemas, auth
from dependencies import admin_required, log_audit

router = APIRouter(prefix="/admin", tags=["Admin User Management"])

@router.get("/users", response_model=list[schemas.UserResponse])
def list_users(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    return db.query(database.User).filter(database.User.role == database.UserRole.STUDENT).all()

@router.put("/users/{user_id}/verify", response_model=schemas.UserResponse)
def verify_user(
    user_id: int, 
    update: schemas.UserUpdate, 
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_verified = update.is_verified
    db.commit()
    db.refresh(user)
    
    log_audit(db, admin.id, "user_verification", notes=f"Verified user {user_id}: {update.is_verified}")
    
    return user
