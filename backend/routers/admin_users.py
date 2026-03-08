from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, schemas, auth
from dependencies import admin_required, super_admin_required, log_audit

router = APIRouter(prefix="/admin", tags=["Admin User Management"])

@router.get("/users", response_model=list[schemas.UserResponse])
def list_users(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    return db.query(database.User).filter(database.User.role == database.UserRole.STUDENT).all()

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    # Total active lost items (not matched/resolved)
    total_lost = db.query(database.LostItem).filter(database.LostItem.status == database.ItemStatus.REPORTED.value).count()
    
    # Total items currently in registry (reported or in custody)
    total_found = db.query(database.FoundItem).filter(
        database.FoundItem.status.in_([database.ItemStatus.REPORTED.value, database.ItemStatus.IN_CUSTODY.value])
    ).count()
    
    # Total pending verification claims
    total_claims = db.query(database.Claim).filter(database.Claim.status == database.ClaimStatus.PENDING.value).count()
    
    return {
        "total_lost": total_lost,
        "total_found": total_found,
        "total_claims": total_claims
    }

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

@router.get("/leaderboard", response_model=list[schemas.UserResponse])
def get_leaderboard(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    return db.query(database.User)\
             .filter(database.User.role == database.UserRole.STUDENT)\
             .order_by(database.User.integrity_points.desc())\
             .limit(50).all()

@router.get("/leaderboard/departments")
def get_department_leaderboard(
    db: Session = Depends(auth.get_db)
):
    from sqlalchemy import func
    # Aggregate points by department for students
    results = db.query(
        database.User.department,
        func.sum(database.User.integrity_points).label("total_points"),
        func.count(database.User.id).label("student_count")
    ).filter(
        database.User.role == database.UserRole.STUDENT,
        database.User.department.isnot(None)
    ).group_by(database.User.department).order_by(func.sum(database.User.integrity_points).desc()).all()
    
    return [
        {
            "department": r.department,
            "total_points": r.total_points,
            "student_count": r.student_count
        } for r in results
    ]

@router.put("/users/{user_id}/certificate", response_model=schemas.UserResponse)
def toggle_certificate_eligibility(
    user_id: int,
    update: schemas.CertificateEligibilityUpdate,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_certificate_eligible = update.is_eligible
    db.commit()
    db.refresh(user)
    
    log_audit(db, admin.id, "certificate_toggle", notes=f"Certificate eligibility set to {update.is_eligible}")
    
    return user

@router.put("/users/{user_id}/reputation", response_model=schemas.UserResponse)
def adjust_reputation(
    user_id: int,
    update: schemas.UserReputationUpdate,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update.points_modifier:
        user.integrity_points += update.points_modifier
    if update.strikes_modifier:
        user.fraud_strikes += update.strikes_modifier
    if update.is_blacklisted is not None:
        user.is_blacklisted = update.is_blacklisted
        
    db.commit()
    db.refresh(user)
    
    log_audit(db, admin.id, "reputation_adjustment", notes=f"Adjusted reputation for user {user_id}: points={update.points_modifier}, strikes={update.strikes_modifier}, blacklisted={update.is_blacklisted}")
    
    return user

# ==========================================
# SUPER ADMIN STAFF MANAGEMENT ROUTES
# ==========================================

@router.get("/staff", response_model=list[schemas.UserResponse])
def get_staff_list(
    db: Session = Depends(auth.get_db),
    super_admin: database.User = Depends(super_admin_required)
):
    # Returns all users (students, admins, super_admins) so the super admin can search and manage them
    return db.query(database.User).order_by(database.User.role.asc(), database.User.full_name.asc()).all()

@router.post("/staff/{user_id}/promote", response_model=schemas.UserResponse)
def promote_to_admin(
    user_id: int,
    db: Session = Depends(auth.get_db),
    super_admin: database.User = Depends(super_admin_required)
):
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role == database.UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=400, detail="Cannot change role of another super admin")
        
    user.role = database.UserRole.ADMIN.value
    db.commit()
    db.refresh(user)
    
    log_audit(db, super_admin.id, "staff_promotion", notes=f"Promoted user {user_id} to ADMIN")
    return user

@router.post("/staff/{user_id}/demote", response_model=schemas.UserResponse)
def demote_to_student(
    user_id: int,
    db: Session = Depends(auth.get_db),
    super_admin: database.User = Depends(super_admin_required)
):
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.role == database.UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=400, detail="Cannot downgrade another super admin")
        
    user.role = database.UserRole.STUDENT.value
    db.commit()
    db.refresh(user)
    
    log_audit(db, super_admin.id, "staff_demotion", notes=f"Demoted user {user_id} to STUDENT")
    return user

@router.get("/audit-logs", response_model=list[schemas.AuditLogResponseDetail])
def get_audit_logs(
    db: Session = Depends(auth.get_db),
    super_admin: database.User = Depends(super_admin_required)
):
    from sqlalchemy.orm import joinedload
    
    logs = db.query(database.AuditLog)\
        .options(joinedload(database.AuditLog.admin_user))\
        .order_by(database.AuditLog.timestamp.desc())\
        .limit(200)\
        .all()
        
    result = []
    for log in logs:
        # Construct the detailed response
        log_dict = {
            "id": log.id,
            "item_id": log.item_id,
            "claim_id": log.claim_id,
            "admin_id": log.admin_id,
            "action_type": log.action_type,
            "notes": log.notes,
            "timestamp": log.timestamp,
            "admin_name": log.admin_user.full_name if log.admin_user else "Unknown System",
            "admin_email": log.admin_user.email if log.admin_user else "unknown@system"
        }
        result.append(log_dict)
        
    return result
