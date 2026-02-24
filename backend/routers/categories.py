from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
import database, auth

router = APIRouter(tags=["Categories"])

@router.get("/categories/stats")
def get_category_stats(db: Session = Depends(auth.get_db)):
    """Returns categories ordered by hit count."""
    stats = db.query(database.CategoryStat).order_by(desc(database.CategoryStat.hit_count)).all()
    return [{"category_id": s.category_id, "hit_count": s.hit_count} for s in stats]

@router.get("/categories/suggestions")
def get_other_suggestions(db: Session = Depends(auth.get_db)):
    """Returns 'Other' item suggestions ordered by hit count and recency."""
    suggestions = db.query(database.OtherSuggestion).order_by(
        desc(database.OtherSuggestion.hit_count), 
        desc(database.OtherSuggestion.last_reported_at)
    ).all()
    return suggestions
