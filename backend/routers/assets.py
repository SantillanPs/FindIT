from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import database, schemas, auth

router = APIRouter(
    prefix="/assets",
    tags=["assets"]
)

@router.post("/", response_model=schemas.AssetResponse)
def create_asset(
    asset: schemas.AssetCreate,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    db_asset = database.Asset(
        owner_id=current_user.id,
        category=asset.category,
        description=asset.description,
        photo_url=asset.photo_url,
        serial_number=asset.serial_number,
        brand=asset.brand,
        model_name=asset.model_name
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.get("/", response_model=List[schemas.AssetResponse])
def get_my_assets(
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    return db.query(database.Asset).filter(database.Asset.owner_id == current_user.id).all()

@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(
    asset_id: int,
    db: Session = Depends(auth.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    db_asset = db.query(database.Asset).filter(
        database.Asset.id == asset_id,
        database.Asset.owner_id == current_user.id
    ).first()
    
    if not db_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found or not owned by current user"
        )
    
    db.delete(db_asset)
    db.commit()
    return None
