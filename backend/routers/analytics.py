from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from datetime import datetime, timedelta
import database, schemas, auth
from dependencies import admin_required
import csv
import io
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/reports/stats")
def get_report_stats(
    period: str = "monthly", # weekly, monthly, 6months, yearly
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    now = datetime.utcnow()
    
    if period == "today":
        start_date = now - timedelta(days=1)
        strftime_fmt = "%H:00"
    elif period == "weekly":
        start_date = now - timedelta(weeks=12)
        strftime_fmt = "%Y-W%W"
    elif period == "monthly":
        start_date = now - timedelta(days=365)
        strftime_fmt = "%Y-%m"
    elif period == "6months":
        start_date = now - timedelta(days=365*2)
        strftime_fmt = "%Y-%m"
    elif period == "yearly":
        start_date = now - timedelta(days=365*5)
        strftime_fmt = "%Y"
    elif period == "all_time":
        start_date = now - timedelta(days=365*100) # Effectively all time
        strftime_fmt = "%Y"
    else:
        start_date = now - timedelta(days=365)
        strftime_fmt = "%Y-%m"

    # Found Items
    found_stats = db.query(
        func.strftime(strftime_fmt, database.FoundItem.found_time).label('period'),
        database.FoundItem.category,
        func.count(database.FoundItem.id).label('count')
    ).filter(database.FoundItem.found_time >= start_date)\
     .group_by('period', database.FoundItem.category)\
     .all()

    # Lost Items
    lost_stats = db.query(
        func.strftime(strftime_fmt, database.LostItem.last_seen_time).label('period'),
        database.LostItem.category,
        func.count(database.LostItem.id).label('count')
    ).filter(database.LostItem.last_seen_time >= start_date)\
     .group_by('period', database.LostItem.category)\
     .all()

    return {
        "found": [{"period": s.period, "category": s.category, "count": s.count} for s in found_stats],
        "lost": [{"period": s.period, "category": s.category, "count": s.count} for s in lost_stats]
    }

@router.get("/claims/stats")
def get_claim_stats(
    period: str = "monthly",
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    now = datetime.utcnow()
    if period == "today":
        start_date = now - timedelta(days=1)
        strftime_fmt = "%H:00"
    elif period == "weekly":
        start_date = now - timedelta(weeks=12)
        strftime_fmt = "%Y-W%W"
    elif period == "monthly":
        start_date = now - timedelta(days=365)
        strftime_fmt = "%Y-%m"
    elif period == "6months":
        start_date = now - timedelta(days=365*2)
        strftime_fmt = "%Y-%m"
    elif period == "yearly":
        start_date = now - timedelta(days=365*5)
        strftime_fmt = "%Y"
    elif period == "all_time":
        start_date = now - timedelta(days=365*100) # Effectively all time
        strftime_fmt = "%Y"
    else:
        start_date = now - timedelta(days=365)
        strftime_fmt = "%Y-%m"

    # Join with FoundItem to get category
    claim_stats = db.query(
        func.strftime(strftime_fmt, database.Claim.created_at).label('period'),
        database.FoundItem.category,
        func.count(database.Claim.id).label('count')
    ).join(database.FoundItem, database.Claim.found_item_id == database.FoundItem.id)\
     .filter(database.Claim.created_at >= start_date)\
     .group_by('period', database.FoundItem.category)\
     .all()

    return [{"period": s.period, "category": s.category, "count": s.count} for s in claim_stats]

@router.get("/insights")
def get_insights(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    # What type gets lost the most?
    most_lost = db.query(
        database.LostItem.category,
        func.count(database.LostItem.id).label('count')
    ).group_by(database.LostItem.category)\
     .order_by(func.count(database.LostItem.id).desc())\
     .first()

    # Hardest to claim (Highest rejection rate, limited to categories with at least 3 claims)
    # rejection_rate = (rejected claims) / (total claims)
    claim_counts = db.query(
        database.FoundItem.category,
        func.count(database.Claim.id).label('total'),
        func.sum(case((database.Claim.status == 'rejected', 1), else_=0)).label('rejected')
    ).join(database.FoundItem, database.Claim.found_item_id == database.FoundItem.id)\
     .group_by(database.FoundItem.category)\
     .having(func.count(database.Claim.id) >= 3)\
     .all()

    hardest_to_claim = None
    max_rate = -1
    for c in claim_counts:
        rate = c.rejected / c.total if c.total > 0 else 0
        if rate > max_rate:
            max_rate = rate
            hardest_to_claim = {"category": c.category, "rate": rate}

    # Most successful recovery (Found -> Released)
    # success_rate = (released items) / (total found items)
    found_counts = db.query(
        database.FoundItem.category,
        func.count(database.FoundItem.id).label('total'),
        func.sum(case((database.FoundItem.status == 'released', 1), else_=0)).label('released')
    ).group_by(database.FoundItem.category)\
     .having(func.count(database.FoundItem.id) >= 3)\
     .all()

    best_recovery = None
    max_success = -1
    for f in found_counts:
        rate = f.released / f.total if f.total > 0 else 0
        if rate > max_success:
            max_success = rate
            best_recovery = {"category": f.category, "rate": rate}

    # Today's Activity
    today = datetime.utcnow().date()
    today_found = db.query(func.count(database.FoundItem.id)).filter(func.date(database.FoundItem.found_time) == today).scalar()
    today_lost = db.query(func.count(database.LostItem.id)).filter(func.date(database.LostItem.last_seen_time) == today).scalar()

    # Weekly Activity
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_found = db.query(func.count(database.FoundItem.id)).filter(database.FoundItem.found_time >= week_ago).scalar()
    weekly_lost = db.query(func.count(database.LostItem.id)).filter(database.LostItem.last_seen_time >= week_ago).scalar()

    return {
        "most_lost": {"category": most_lost.category, "count": most_lost.count} if most_lost else None,
        "hardest_to_claim": hardest_to_claim,
        "best_recovery": best_recovery,
        "today": {"found": today_found, "lost": today_lost},
        "weekly": {"found": weekly_found, "lost": weekly_lost}
    }

@router.get("/export")
def export_data(
    data_type: str = "all", # lost, found, claims, all
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(admin_required)
):
    output = io.StringIO()
    writer = csv.writer(output)
    
    if data_type in ["found", "all"]:
        writer.writerow(["--- FOUND ITEMS ---"])
        writer.writerow(["ID", "Item Name", "Category", "Location", "Found Time", "Status", "Release Date"])
        found_items = db.query(database.FoundItem).all()
        for item in found_items:
            writer.writerow([item.id, item.item_name, item.category, item.location_zone, item.found_time, item.status, item.released_at])
        writer.writerow([])

    if data_type in ["lost", "all"]:
        writer.writerow(["--- LOST ITEMS ---"])
        writer.writerow(["ID", "Item Name", "Category", "Location", "Last Seen Time", "Status"])
        lost_items = db.query(database.LostItem).all()
        for item in lost_items:
            writer.writerow([item.id, item.item_name, item.category, item.location_zone, item.last_seen_time, item.status])
        writer.writerow([])

    if data_type in ["claims", "all"]:
        writer.writerow(["--- CLAIMS ---"])
        writer.writerow(["ID", "Found Item ID", "Category", "Claimant", "Status", "Created At"])
        claims = db.query(database.Claim).join(database.FoundItem).all()
        for claim in claims:
            writer.writerow([claim.id, claim.found_item_id, claim.found_item.category, claim.student_id or claim.guest_full_name, claim.status, claim.created_at])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=findit_export_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )
