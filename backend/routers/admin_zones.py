from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, schemas, auth
from dependencies import super_admin_required

router = APIRouter(prefix="/admin", tags=["Admin Map Builder"])

# --- ZONES CRUD ---

@router.get("/zones/all", response_model=list[schemas.ZoneResponse])
def get_all_zones_admin(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(super_admin_required)
):
    return db.query(database.Zone).all()

@router.post("/zones", response_model=schemas.ZoneResponse)
def create_zone(
    zone_data: schemas.ZoneCreate,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(super_admin_required)
):
    new_zone = database.Zone(**zone_data.model_dump())
    db.add(new_zone)
    db.commit()
    db.refresh(new_zone)
    return new_zone

@router.put("/zones/{zone_id}", response_model=schemas.ZoneResponse)
def update_zone(
    zone_id: int,
    zone_data: schemas.ZoneUpdate,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(super_admin_required)
):
    zone = db.query(database.Zone).filter(database.Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
        
    update_data = zone_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(zone, key, value)
        
    db.commit()
    db.refresh(zone)
    return zone

@router.delete("/zones/{zone_id}")
def delete_zone(
    zone_id: int,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(super_admin_required)
):
    zone = db.query(database.Zone).filter(database.Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
        
    # Manually delete dependencies to avoid foreign key constraints
    # 1. Delete associated adjacencies
    db.query(database.ZoneAdjacency).filter(
        (database.ZoneAdjacency.zone_a_id == zone_id) | 
        (database.ZoneAdjacency.zone_b_id == zone_id)
    ).delete()
    
    # 2. Nullify parent_zone_id in children (or could delete them, but nullifying is safer)
    children = db.query(database.Zone).filter(database.Zone.parent_zone_id == zone_id).all()
    for child in children:
        child.parent_zone_id = None
        
    db.delete(zone)
    db.commit()
    return {"status": "success", "message": "Zone deleted"}

# --- ADJACENCIES CRUD ---

@router.get("/adjacencies/all", response_model=list[schemas.ZoneAdjacencyResponse])
def get_all_adjacencies_admin(
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(super_admin_required)
):
    return db.query(database.ZoneAdjacency).all()

@router.post("/adjacencies", response_model=schemas.ZoneAdjacencyResponse)
def create_adjacency(
    adj_data: schemas.ZoneAdjacencyCreate,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(super_admin_required)
):
    # Check if zones exist
    zone_a = db.query(database.Zone).filter(database.Zone.id == adj_data.zone_a_id).first()
    zone_b = db.query(database.Zone).filter(database.Zone.id == adj_data.zone_b_id).first()
    
    if not zone_a or not zone_b:
         raise HTTPException(status_code=404, detail="One or both zones not found")
         
    # Create the primary edge
    new_edge = database.ZoneAdjacency(**adj_data.model_dump())
    db.add(new_edge)
    
    # Create the symmetric edge automatically (to ensure undirectional graph routing)
    symmetric_edge = database.ZoneAdjacency(
        zone_a_id=adj_data.zone_b_id,
        zone_b_id=adj_data.zone_a_id,
        distance_weight=adj_data.distance_weight
    )
    db.add(symmetric_edge)
    
    db.commit()
    db.refresh(new_edge)
    return new_edge

@router.delete("/adjacencies/{adjacency_id}")
def delete_adjacency(
    adjacency_id: int,
    db: Session = Depends(auth.get_db),
    admin: database.User = Depends(super_admin_required)
):
    edge = db.query(database.ZoneAdjacency).filter(database.ZoneAdjacency.id == adjacency_id).first()
    if not edge:
        raise HTTPException(status_code=404, detail="Adjacency not found")
        
    # Delete the symmetric edge as well
    db.query(database.ZoneAdjacency).filter(
        database.ZoneAdjacency.zone_a_id == edge.zone_b_id,
        database.ZoneAdjacency.zone_b_id == edge.zone_a_id
    ).delete()
    
    db.delete(edge)
    db.commit()
    return {"status": "success", "message": "Adjacency pair deleted"}
