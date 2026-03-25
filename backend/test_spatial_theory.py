from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, Zone, ZoneType
from location_service import LocationService

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create Hierarchy: Campus -> LS Building -> Floor 1 -> Room 101, Room 102
    campus = Zone(id=1, name="Campus", type=ZoneType.OUTDOOR)
    ls_bldg = Zone(id=2, name="LS Building", type=ZoneType.BUILDING, parent_zone_id=1)
    floor1 = Zone(id=3, name="Floor 1", type=ZoneType.FLOOR, parent_zone_id=2)
    rm101 = Zone(id=4, name="Room 101", type=ZoneType.ROOM, parent_zone_id=3)
    rm102 = Zone(id=5, name="Room 102", type=ZoneType.ROOM, parent_zone_id=3)
    
    # Another Building: GK Building -> Gym
    gk_bldg = Zone(id=6, name="GK Building", type=ZoneType.BUILDING, parent_zone_id=1)
    gym = Zone(id=7, name="Gym", type=ZoneType.ROOM, parent_zone_id=6)
    
    db.add_all([campus, ls_bldg, floor1, rm101, rm101, rm102, gk_bldg, gym])
    db.commit()
    return db

def test_spatial_logic():
    db = setup_test_db()
    
    print("\n--- Testing Set-Based Spatial Theory ---")
    
    # Test Case 1: Exact Match
    score = LocationService.get_spatial_similarity(db, 4, 4) # Lost RM101, Found RM101
    print(f"Exact Match (RM101 == RM101): {score} (Expected: 1.0)")
    assert score == 1.0
    
    # Test Case 2: Potential Zones Match
    score = LocationService.get_spatial_similarity(db, None, 4, [4, 5]) # Lost in RM101 or RM102, Found in RM101
    print(f"Potential Zone Match (RM101 in [101, 102]): {score} (Expected: 1.0)")
    assert score == 1.0
    
    # Test Case 3: Containment (Found in Room, Lost in Building)
    score = LocationService.get_spatial_similarity(db, 2, 4) # Lost in LS Bldg, Found in RM101
    print(f"Containment Match (RM101 inside LS Building): {score} (Expected: 0.95)")
    assert score == 0.95
    
    # Test Case 4: Reverse Containment (Lost in Room, Found in Building)
    score = LocationService.get_spatial_similarity(db, 4, 2) # Lost in RM101, Found in LS Bldg
    print(f"Reverse Containment (LS Building contains RM101): {score} (Expected: 0.85)")
    assert score == 0.85
    
    # Test Case 5: Sibling Match (Same Floor)
    score = LocationService.get_spatial_similarity(db, 4, 5) # Lost in RM101, Found in RM102
    print(f"Sibling Match (RM101 and RM102 share Floor 1): {score} (Expected: 0.80)")
    assert score == 0.80
    
    # Test Case 6: Disjoint (Different Buildings)
    score = LocationService.get_spatial_similarity(db, 4, 7) # Lost in RM101, Found in Gym
    print(f"Disjoint Match (RM101 vs Gym): {score} (Expected: 0.10)")
    assert score == 0.10

    print("\nAll Spatial Theory tests passed! ✅")

if __name__ == "__main__":
    test_spatial_logic()
