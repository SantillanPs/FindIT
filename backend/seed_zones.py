import os
import sys

# Add parent dir to path so we can import from backend
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base, Zone, ZoneAdjacency, ZoneType

def seed_zones():
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if zones already exist
        if db.query(Zone).count() > 0:
            print("Zones already seeded.")
            return

        print("Seeding zones...")
        
        # --- Create Zones ---
        # Outdoor
        quad = Zone(name="The Main Quad", type=ZoneType.OUTDOOR.value)
        db.add(quad)
        db.commit()

        # Building A: Science Building
        science_bldg = Zone(name="Science Building", type=ZoneType.BUILDING.value)
        db.add(science_bldg)
        db.commit()
        
        sci_floor1 = Zone(name="Science 1st F Hallway", type=ZoneType.HALLWAY.value, parent_zone_id=science_bldg.id)
        sci_room101 = Zone(name="Room 101 (Chemistry Lab)", type=ZoneType.ROOM.value, parent_zone_id=science_bldg.id)
        sci_room102 = Zone(name="Room 102 (Biology Lab)", type=ZoneType.ROOM.value, parent_zone_id=science_bldg.id)
        
        sci_floor2 = Zone(name="Science 2nd F Hallway", type=ZoneType.HALLWAY.value, parent_zone_id=science_bldg.id)
        sci_room201 = Zone(name="Room 201 (Lecture Hall)", type=ZoneType.ROOM.value, parent_zone_id=science_bldg.id)
        sci_room202 = Zone(name="Room 202 (Physics Lab)", type=ZoneType.ROOM.value, parent_zone_id=science_bldg.id)
        
        db.add_all([sci_floor1, sci_room101, sci_room102, sci_floor2, sci_room201, sci_room202])
        db.commit()

        # Building B: Library
        library = Zone(name="University Library", type=ZoneType.BUILDING.value)
        db.add(library)
        db.commit()
        
        lib_ground = Zone(name="Library Ground Floor", type=ZoneType.HALLWAY.value, parent_zone_id=library.id)
        lib_ref_desk = Zone(name="Reference Desk", type=ZoneType.ROOM.value, parent_zone_id=library.id)
        lib_study_a = Zone(name="Study Area A", type=ZoneType.ROOM.value, parent_zone_id=library.id)
        
        lib_floor1 = Zone(name="Library 1st Floor", type=ZoneType.HALLWAY.value, parent_zone_id=library.id)
        lib_quiet_room = Zone(name="Quiet Reading Room", type=ZoneType.ROOM.value, parent_zone_id=library.id)
        lib_computer_lab = Zone(name="Computer Lab", type=ZoneType.ROOM.value, parent_zone_id=library.id)
        
        db.add_all([lib_ground, lib_ref_desk, lib_study_a, lib_floor1, lib_quiet_room, lib_computer_lab])
        db.commit()

        print("Seeding Adjacencies...")
        
        # --- Create Adjacencies ---
        adjacencies = [
            # Science Building Internal
            ZoneAdjacency(zone_a_id=sci_room101.id, zone_b_id=sci_floor1.id, distance_weight=1),
            ZoneAdjacency(zone_a_id=sci_room102.id, zone_b_id=sci_floor1.id, distance_weight=1),
            ZoneAdjacency(zone_a_id=sci_floor1.id, zone_b_id=sci_floor2.id, distance_weight=3), # Stairs
            ZoneAdjacency(zone_a_id=sci_room201.id, zone_b_id=sci_floor2.id, distance_weight=1),
            ZoneAdjacency(zone_a_id=sci_room202.id, zone_b_id=sci_floor2.id, distance_weight=1),
            
            # Library Internal
            ZoneAdjacency(zone_a_id=lib_ref_desk.id, zone_b_id=lib_ground.id, distance_weight=1),
            ZoneAdjacency(zone_a_id=lib_study_a.id, zone_b_id=lib_ground.id, distance_weight=1),
            ZoneAdjacency(zone_a_id=lib_ground.id, zone_b_id=lib_floor1.id, distance_weight=3), # Stairs
            ZoneAdjacency(zone_a_id=lib_quiet_room.id, zone_b_id=lib_floor1.id, distance_weight=1),
            ZoneAdjacency(zone_a_id=lib_computer_lab.id, zone_b_id=lib_floor1.id, distance_weight=1),
            
            # Campus Connections (Outdoors)
            ZoneAdjacency(zone_a_id=sci_floor1.id, zone_b_id=quad.id, distance_weight=5),
            ZoneAdjacency(zone_a_id=lib_ground.id, zone_b_id=quad.id, distance_weight=5),
        ]
        
        # Add symmetric edges for undirected graph traversal
        symmetric_adjacencies = []
        for adj in adjacencies:
            symmetric_adjacencies.append(ZoneAdjacency(
                zone_a_id=adj.zone_b_id, 
                zone_b_id=adj.zone_a_id, 
                distance_weight=adj.distance_weight
            ))
            
        db.add_all(adjacencies + symmetric_adjacencies)
        db.commit()
        
        print("Zone seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding zones: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_zones()
