from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from ai_service import AIService
import database, schemas, auth

app = FastAPI(title="FindIT API")

# Initialize DB
database.init_db()

@app.post("/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    db_user = db.query(database.User).filter(database.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = database.User(
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(auth.get_db)):
    user = db.query(database.User).filter(database.User.email == form_data.username).first()
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
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: database.User = Depends(auth.get_current_user)):
    return current_user

# --- Found Item Endpoints ---

@app.post("/found/report", response_model=schemas.FoundItemPublic)
def report_found_item(
    item: schemas.FoundItemCreate, 
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    # Prepare text for embedding: "Category: Description"
    combined_text = f"{item.category}: {item.description}"
    embedding_json = AIService.generate_embedding(combined_text)

    new_item = database.FoundItem(
        **item.model_dump(),
        finder_id=current_user.id,
        embedding=embedding_json
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.get("/found/list", response_model=list[schemas.FoundItemPublic])
def list_found_items(db: Session = Depends(auth.get_db)):
    items = db.query(database.FoundItem).all()
    return items

@app.get("/admin/found/detail/{item_id}", response_model=schemas.FoundItemDetail)
def get_found_item_detail(
    item_id: int, 
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    if current_user.role != database.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    item = db.query(database.FoundItem).filter(database.FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# --- Lost Item Endpoints ---

@app.post("/lost/report", response_model=schemas.LostItemResponse)
def report_lost_item(
    item: schemas.LostItemCreate,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    # Generate embedding for the lost report: "Category: Description"
    combined_text = f"{item.category}: {item.description}"
    embedding_json = AIService.generate_embedding(combined_text)

    new_item = database.LostItem(
        **item.model_dump(),
        user_id=current_user.id,
        embedding=embedding_json
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.get("/lost/my-reports", response_model=list[schemas.LostItemResponse])
def list_my_lost_reports(
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    return current_user.lost_items

@app.get("/lost/{report_id}/matches", response_model=list[schemas.MatchSuggestion])
def get_matches_for_lost_item(
    report_id: int,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    lost_item = db.query(database.LostItem).filter(
        database.LostItem.id == report_id,
        database.LostItem.user_id == current_user.id
    ).first()
    
    if not lost_item:
        raise HTTPException(status_code=404, detail="Lost report not found")
    
    if not lost_item.embedding:
        raise HTTPException(status_code=400, detail="Report has no embedding")

    lost_embedding = AIService.get_embedding_list(lost_item.embedding)
    
    # Get all active found items
    found_items = db.query(database.FoundItem).filter(
        database.FoundItem.status == database.ItemStatus.REPORTED.value
    ).all()
    
    suggestions = []
    for found in found_items:
        if found.embedding:
            found_embedding = AIService.get_embedding_list(found.embedding)
            score = AIService.calculate_similarity(lost_embedding, found_embedding)
            suggestions.append(schemas.MatchSuggestion(
                item=found,
                similarity_score=score
            ))
    
    # Sort by similarity score descending
    suggestions.sort(key=lambda x: x.similarity_score, reverse=True)
    
    return suggestions

# --- Claim Endpoints ---

@app.post("/claims/submit", response_model=schemas.ClaimResponse)
def submit_claim(
    claim: schemas.ClaimCreate,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    found_item = db.query(database.FoundItem).filter(database.FoundItem.id == claim.found_item_id).first()
    if not found_item:
        raise HTTPException(status_code=404, detail="Found item not found")
    
    if found_item.status != database.ItemStatus.REPORTED.value:
        raise HTTPException(status_code=400, detail="Item is not available for claiming")

    new_claim = database.Claim(
        **claim.model_dump(),
        student_id=current_user.id
    )
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)
    return new_claim

@app.get("/claims/my-claims", response_model=list[schemas.ClaimResponse])
def list_my_claims(
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    return current_user.claims

@app.get("/admin/claims/pending", response_model=list[schemas.ClaimResponse])
def list_pending_claims(
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    if current_user.role != database.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return db.query(database.Claim).filter(database.Claim.status == database.ClaimStatus.PENDING.value).all()

@app.post("/admin/claims/{claim_id}/review", response_model=schemas.ClaimResponse)
def review_claim(
    claim_id: int,
    review: schemas.ClaimReview,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    if current_user.role != database.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
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
            
            # Reject other pending claims for the same item
            other_claims = db.query(database.Claim).filter(
                database.Claim.found_item_id == found_item.id,
                database.Claim.id != claim_id,
                database.Claim.status == database.ClaimStatus.PENDING.value
            ).all()
            for c in other_claims:
                c.status = database.ClaimStatus.REJECTED.value
                c.admin_notes = "Auto-rejected because another claim was approved."
    
    db.commit()
    db.refresh(db_claim)
    return db_claim

# --- Release Endpoints ---

@app.post("/admin/found/{item_id}/release", response_model=schemas.FoundItemDetail)
def release_item(
    item_id: int,
    release: schemas.ItemRelease,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    if current_user.role != database.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    found_item = db.query(database.FoundItem).filter(database.FoundItem.id == item_id).first()
    if not found_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if found_item.status != database.ItemStatus.CLAIMED.value:
        raise HTTPException(status_code=400, detail="Item must be in 'claimed' status before release")

    # Log release details
    found_item.status = database.ItemStatus.RELEASED.value
    found_item.released_to_id = release.released_to_id
    found_item.released_by_name = release.released_by_name
    found_item.released_at = datetime.utcnow()
    
    db.commit()
    db.refresh(found_item)
    return found_item

@app.get("/admin/found/released", response_model=list[schemas.FoundItemDetail])
def list_released_items(
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    if current_user.role != database.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return db.query(database.FoundItem).filter(database.FoundItem.status == database.ItemStatus.RELEASED.value).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
