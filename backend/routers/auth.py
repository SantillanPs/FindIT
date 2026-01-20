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

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: database.User = Depends(auth.get_current_user)):
    return current_user
