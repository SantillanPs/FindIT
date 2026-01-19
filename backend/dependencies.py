from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
import database, auth

def admin_required(current_user: database.User = Depends(auth.get_current_user)):
    if current_user.role != database.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def verified_student_required(current_user: database.User = Depends(auth.get_current_user)):
    if current_user.role == database.UserRole.STUDENT and not current_user.is_verified:
        raise HTTPException(
            status_code=403, 
            detail="Student account must be verified by an admin before performing this action"
        )
    return current_user

def log_audit(db: Session, admin_id: int, action: str, item_id: int = None, claim_id: int = None, notes: str = None):
    audit_entry = database.AuditLog(
        admin_id=admin_id,
        action_type=action,
        item_id=item_id,
        claim_id=claim_id,
        notes=notes
    )
    db.add(audit_entry)
    db.commit()
