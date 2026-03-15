from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import auth, database, schemas
from sqlalchemy import func

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    email_lower = user.email.lower()
    db_user = db.query(database.User).filter(database.User.email == email_lower).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    student_id = user.student_id_number.strip() if user.student_id_number else None
    if student_id:
        existing_student = db.query(database.User).filter(database.User.student_id_number == student_id).first()
        if existing_student:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student ID number already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    # Process department to automatically prepend "BS " for students
    processed_dept = user.department
    if user.role == "student" and processed_dept:
        trimmed_dept = processed_dept.strip()
        if trimmed_dept and not trimmed_dept.upper().startswith("BS"):
            processed_dept = f"BS {trimmed_dept}"

    new_user = database.User(
        email=email_lower,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_password,
        role=database.UserRole.STUDENT, # Enforce student role
        is_verified=False, # Students start unverified
        student_id_number=student_id,
        department=processed_dept,
        verification_proof_url=user.verification_proof_url
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # NEW: Handle Witness Reports points for newly registered user
    approved_witness_reports = db.query(database.WitnessReport).filter(
        database.WitnessReport.guest_email.ilike(email_lower),
        database.WitnessReport.status == database.WitnessReportStatus.APPROVED.value,
        database.WitnessReport.reporter_id == None
    ).all()
    
    total_points_to_award = 0
    for wr in approved_witness_reports:
        wr.reporter_id = new_user.id
        wr.guest_email = None
        wr.guest_first_name = None
        wr.guest_last_name = None
        if not wr.is_anonymous:
            total_points_to_award += 100 # Match fixed points in lost.py
            
    if total_points_to_award > 0:
        new_user.integrity_points += total_points_to_award
        if new_user.integrity_points >= 1000 and not new_user.is_certificate_eligible:
            new_user.is_certificate_eligible = True
        
        notif = database.Notification(
            user_id=new_user.id,
            title="Integrity Points Awarded!",
            message=f"Welcome! You earned +{total_points_to_award} integrity points from your previously approved witness reports."
        )
        db.add(notif)
    
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(auth.get_db)):
    email_lower = form_data.username.lower()
    user = db.query(database.User).filter(database.User.email == email_lower).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user
    }

@router.post("/upgrade-guest", response_model=schemas.Token)
def upgrade_guest(request: schemas.UpgradeGuestRequest, db: Session = Depends(auth.get_db)):
    email_lower = request.email.lower()
    
    # Check if user already exists
    db_user = db.query(database.User).filter(database.User.email == email_lower).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="An account with this email already exists. Please login to link your reports."
        )
    
    # Check if student ID already registered
    student_id = request.student_id_number.strip()
    existing_student = db.query(database.User).filter(database.User.student_id_number == student_id).first()
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Student ID number already registered"
        )

    # Create the user
    # If no password is provided (passwordless registration), generate a random one
    # The user can later use a magic link or "Forgot Password" to set a real one
    import uuid
    reg_password = request.password or str(uuid.uuid4())
    hashed_password = auth.get_password_hash(reg_password)
    
    new_user = database.User(
        email=email_lower,
        first_name=request.first_name,
        last_name=request.last_name,
        hashed_password=hashed_password,
        student_id_number=student_id,
        role=database.UserRole.STUDENT,
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Link all guest reports to this new user by name
    # We use a case-insensitive match for the reporter name provided during guest submission
    db.query(database.LostItem).filter(
        (database.LostItem.guest_first_name.ilike(request.first_name)) & 
        (database.LostItem.guest_last_name.ilike(request.last_name))
    ).update({
        "user_id": new_user.id, 
        "guest_first_name": None,
        "guest_last_name": None
    }, synchronize_session=False)
    
    db.query(database.FoundItem).filter(
        (database.FoundItem.contact_first_name.ilike(request.first_name)) & 
        (database.FoundItem.contact_last_name.ilike(request.last_name))
    ).update({
        "finder_id": new_user.id, 
        "contact_first_name": None,
        "contact_last_name": None
    }, synchronize_session=False)

    # Link Witness Reports
    approved_witness_reports = db.query(database.WitnessReport).filter(
        database.WitnessReport.guest_email.ilike(email_lower),
        database.WitnessReport.status == database.WitnessReportStatus.APPROVED.value,
        database.WitnessReport.reporter_id == None
    ).all()
    
    total_points_to_award = 0
    for wr in approved_witness_reports:
        wr.reporter_id = new_user.id
        wr.guest_email = None
        wr.guest_name = None
        if not wr.is_anonymous:
            total_points_to_award += 100
            
    if total_points_to_award > 0:
        new_user.integrity_points += total_points_to_award
        if new_user.integrity_points >= 1000 and not new_user.is_certificate_eligible:
            new_user.is_certificate_eligible = True
        
        notif = database.Notification(
            user_id=new_user.id,
            title="Integrity Points Awarded!",
            message=f"You earned +{total_points_to_award} integrity points from your previously approved witness reports."
        )
        db.add(notif)

    db.commit()
    
    # Login the user
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": new_user
    }

@router.get("/college-leaderboard")
def get_college_leaderboard(db: Session = Depends(auth.get_db)):
    # Aggregate points by department for students
    results = db.query(
        database.User.department,
        func.sum(database.User.integrity_points).label("total_points"),
        func.count(database.User.id).label("student_count")
    ).filter(
        database.User.role == database.UserRole.STUDENT.value,
        database.User.department != None,
        database.User.department != ""
    ).group_by(
        database.User.department
    ).order_by(
        func.sum(database.User.integrity_points).desc()
    ).all()
    
    return [
        {
            "college": r.department,
            "total_integrity_points": r.total_points,
            "student_participation": r.student_count
        } for r in results
    ]

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: database.User = Depends(auth.get_current_user)):
    return current_user

@router.get("/user/{user_id}/profile", response_model=schemas.UserProfile)
def get_user_profile(user_id: int, db: Session = Depends(auth.get_db)):
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Filter items to only show active or relevant ones
    user.lost_items = [i for i in user.lost_items if i.status != "dismissed"]
    user.found_items = [i for i in user.found_items if i.status != "dismissed"]
    
    return user

@router.get("/leaderboard", response_model=list[schemas.UserPublicResponse])
def get_public_leaderboard(db: Session = Depends(auth.get_db)):
    users = db.query(database.User)\
              .filter(database.User.role == database.UserRole.STUDENT.value)\
              .order_by(database.User.integrity_points.desc())\
              .limit(50).all()
    
    results = []
    for i, user in enumerate(users):
        fname = user.first_name or ""
        lname = user.last_name or ""
        
        # Mask name: John Doe -> J*** D***
        masked_first = f"{fname[0]}***" if len(fname) > 0 else "*"
        masked_last = f"{lname[0]}***" if len(lname) > 0 else "*"
        masked_name = f"{masked_first} {masked_last}".strip()
        
        # Respect privacy toggle
        final_name = f"{fname} {lname}".strip() if user.show_full_name else masked_name
        if not final_name:
            final_name = "Anonymous Student"
        
        results.append({
            "id": user.id,
            "full_name_masked": final_name,
            "show_full_name": user.show_full_name,
            "department": user.department or "General Education",
            "integrity_points": user.integrity_points,
            "is_certificate_eligible": user.is_certificate_eligible,
            "rank": i + 1
        })
    return results

@router.put("/me/preference", response_model=schemas.UserResponse)
def update_my_preference(
    pref: schemas.UserPreferenceUpdate,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    if pref.show_full_name is not None:
        current_user.show_full_name = pref.show_full_name
    if pref.department is not None and current_user.role == database.UserRole.ADMIN:
        current_user.department = pref.department
        
    db.commit()
    db.refresh(current_user)
    return current_user
