from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
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
