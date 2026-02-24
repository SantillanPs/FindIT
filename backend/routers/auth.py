from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import auth, database, schemas

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
    new_user = database.User(
        email=email_lower,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role,
        is_verified=(user.role == database.UserRole.ADMIN),  # Admins auto-verified
        student_id_number=student_id,
        verification_proof_url=user.verification_proof_url
    )
    db.add(new_user)
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
        full_name=request.full_name,
        hashed_password=hashed_password,
        student_id_number=student_id,
        role=database.UserRole.STUDENT,
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Link all guest reports to this new user by full name
    # We use a case-insensitive match for the reporter name provided during guest submission
    db.query(database.LostItem).filter(database.LostItem.guest_full_name.ilike(request.full_name)).update({
        "user_id": new_user.id, 
        "guest_full_name": None
    }, synchronize_session=False)
    db.query(database.FoundItem).filter(database.FoundItem.contact_full_name.ilike(request.full_name)).update({
        "finder_id": new_user.id, 
        "contact_full_name": None
    }, synchronize_session=False)
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

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: database.User = Depends(auth.get_current_user)):
    return current_user
