from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import database, schemas, auth
from dependencies import admin_required, verified_student_required, log_audit
from ai_service import AIService

router = APIRouter(tags=["Found Items"])

@router.post("/found/report", response_model=schemas.FoundItemPublic)
def report_found_item(
    item: schemas.FoundItemCreate, 
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(verified_student_required)
):
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

@router.get("/found/my-reports", response_model=list[schemas.FoundItemPublic])
def list_my_found_reports(
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    return db.query(database.FoundItem).filter(database.FoundItem.finder_id == current_user.id).all()

@router.get("/found/public", response_model=list[schemas.FoundItemPublic])
def list_public_found_items(db: Session = Depends(auth.get_db)):
    return db.query(database.FoundItem).filter(
        database.FoundItem.status.in_([database.ItemStatus.REPORTED.value, database.ItemStatus.IN_CUSTODY.value])
    ).all()

@router.get("/admin/found", response_model=list[schemas.FoundItemDetail])
def list_admin_found_items(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    return db.query(database.FoundItem).all()

@router.get("/admin/found/{item_id}", response_model=schemas.FoundItemDetail)
def get_found_item_admin_detail(
    item_id: int, 
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    item = db.query(database.FoundItem).filter(database.FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/admin/found/{item_id}/custody", response_model=schemas.FoundItemDetail)
def update_item_custody(
    item_id: int,
    update: schemas.CustodyUpdate,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    item = db.query(database.FoundItem).filter(database.FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.status = database.ItemStatus.IN_CUSTODY.value
    db.commit()
    db.refresh(item)
    
    log_audit(db, admin.id, "custody_update", item_id=item_id, notes=update.notes)
    
    return item

@router.post("/admin/found/{item_id}/release", response_model=schemas.FoundItemDetail)
def release_item(
    item_id: int,
    release: schemas.ItemRelease,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    found_item = db.query(database.FoundItem).filter(database.FoundItem.id == item_id).first()
    if not found_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if found_item.status != database.ItemStatus.CLAIMED.value:
        raise HTTPException(status_code=400, detail="Item must be in 'claimed' status before release")

    found_item.status = database.ItemStatus.RELEASED.value
    found_item.released_to_id = release.released_to_id
    found_item.released_by_name = release.released_by_name
    found_item.released_at = datetime.utcnow()
    
    db.commit()
    db.refresh(found_item)
    
    log_audit(db, admin.id, "item_release", item_id=item_id, notes=f"Released to user {release.released_to_id} by {release.released_by_name}")
    
    return found_item

@router.get("/admin/found/released", response_model=list[schemas.FoundItemDetail])
def list_released_items(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    return db.query(database.FoundItem).filter(database.FoundItem.status == database.ItemStatus.RELEASED.value).all()
