
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import database, auth

router = APIRouter(tags=["Colleges"])

@router.get("/colleges")
def get_colleges(db: Session = Depends(auth.get_db)):
    """Returns the master list of colleges."""
    return db.query(database.MasterCollege).filter_by(is_active=True).all()
