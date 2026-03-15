from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import database, auth

router = APIRouter(prefix="/zones", tags=["Zones"])

@router.get("/")
def get_zones(db: Session = Depends(auth.get_db)):
    """
    Returns a hierarchical nested dictionary of all zones for the frontend cascading selectors.
    Builds the tree: Campus -> Building -> Floor/Hallway -> Room.
    """
    all_zones = db.query(database.Zone).all()
    
    # Create a fast lookup dict
    zone_dict = {z.id: {
        "id": z.id,
        "name": z.name,
        "type": z.type,
        "children": []
    } for z in all_zones}
    
    root_zones = []
    
    for zone in all_zones:
        if zone.parent_zone_id is None:
            root_zones.append(zone_dict[zone.id])
        else:
            if zone.parent_zone_id in zone_dict:
                zone_dict[zone.parent_zone_id]["children"].append(zone_dict[zone.id])
                
                
    return root_zones

@router.get("/stats")
def get_zone_stats(db: Session = Depends(auth.get_db)):
    """
    Returns hit counts for zones based on lost and found reports.
    Used by the frontend to prioritize 'most picked' locations.
    """
    # Count from LostItem
    lost_counts = db.query(
        database.LostItem.zone_id,
        func.count(database.LostItem.id).label('hit_count')
    ).filter(database.LostItem.zone_id.isnot(None))\
     .group_by(database.LostItem.zone_id)\
     .all()

    # Count from FoundItem
    found_counts = db.query(
        database.FoundItem.zone_id,
        func.count(database.FoundItem.id).label('hit_count')
    ).filter(database.FoundItem.zone_id.isnot(None))\
     .group_by(database.FoundItem.zone_id)\
     .all()

    # Merge counts
    stats = {}
    for z_id, count in lost_counts:
        stats[z_id] = stats.get(z_id, 0) + count
    for z_id, count in found_counts:
        stats[z_id] = stats.get(z_id, 0) + count

    return [{"zone_id": z_id, "hit_count": count} for z_id, count in stats.items()]
