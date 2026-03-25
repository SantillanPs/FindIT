from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import database, auth, schemas

router = APIRouter(prefix="/init", tags=["System Initialization"])

@router.get("/")
def get_bootstrap_data(db: Session = Depends(auth.get_db)):
    """
    Returns a consolidated package of metadata to reduce 
    the number of initial API calls from the frontend.
    """
    # 1. Categories
    categories = db.query(database.MasterCategory).filter_by(is_active=True).all()
    
    # 2. Colleges
    colleges = db.query(database.MasterCollege).filter_by(is_active=True).all()
    
    return {
        "categories": categories,
        "colleges": colleges
    }
