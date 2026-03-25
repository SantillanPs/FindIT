import os
import sys
from sqlalchemy.orm import Session

# Add current dir to path to import from backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base, Zone, MasterCollege, ZoneType

# Structured Location Data
# Hierarchy: Building -> Floor -> Rooms/Areas
CAMPUS_DATA = {
    "ICT Building": {
        "floor 1": ["Comp lab 1", "Comp lab 2"],
        "floor 2": ["Innovation lab", "Faculty"]
    },
    "CITE": {
        "floor 1": ["501", "502", "503", "504", "505", "506 Technician", "CE lab"],
        "floor 2": ["601", "602", "603", "604", "Faculty"]
    },
    "MIDWIFERY": {
        "floor 1": ["SDSSU Birthing Clinic", "Lecture Room"],
        "floor 2": ["Lecture Room", "Laboratory/RLE Room"]
    },
    "GYM": {
        "Inside": [],
        "2nd floor": []
    },
    "CANTEEN": {
        "Inside": [],
        "Outside": []
    },
    "CBM": {
        "1st floor": [
            "101", "102", "103", "104", "Entrance area", "106", "107", 
            "Hospitality Management", "Childminding and Breastfeeding Area", "Gender and development office"
        ],
        "2nd floor": [
            "RM. A", "RM. B", "203", "204", "205", "206", "207", "208", "209", "210", 
            "RM. C", "P go", "Publication office"
        ]
    },
    "CAS BUILDING 1": {
        "1st floor": ["DSS 101", "DSS 102", "Faculty", "DSS 103", "DSS 104"],
        "2nd floor": ["DOL 201", "DOL 202", "DOL 203", "DOL 204", "DOL 205", "DOL 206"],
        "3rd floor": ["DOL 301", "DOL 302", "DOL 303", "DOL 304", "DOL 305", "DOL 306"]
    },
    "CAS BUILDING 2": {
        "1st floor": ["DMNS 101", "Department chair", "Faculty 1", "Faculty 2", "DMNS 105", "DMNS 106"],
        "2nd floor": ["DMNS 201", "DMNS 202", "DMNS 203", "DMNS 204", "DMNS 205", "DMNS 206"]
    },
    "COLLEGE OF LAW": {
        "1st floor": ["Moot Court", "Legal Assistance Center"],
        "2nd floor": ["Law Library", "Student Affair center"]
    },
    "CTE": {
        "1st floor": ["105", "104", "103", "102", "Chem Lab", "Edtech Room", "Beed Faculty & College Staff", "Registrar"],
        "2nd floor": ["204", "203", "202", "201", "Biology Lab", "Physics Lab", "307"]
    },
    "GRADUATE SCHOOL": {
        "1st floor": ["Graduate School office", "Defense Room"],
        "2nd floor": ["room 1", "room 2", "room 3"]
    },
    "AVC": {
        "Main Area": []
    }
}

def seed_locations():
    db = SessionLocal()
    try:
        print("Starting bulk location ingestion...")
        
        for bldg_name, floors in CAMPUS_DATA.items():
            # 1. Sync MasterCollege for the building/college
            college_id = bldg_name.split()[0].upper() if " " in bldg_name else bldg_name.upper()
            existing_col = db.query(MasterCollege).filter_by(id=college_id).first()
            if not existing_col:
                db.add(MasterCollege(
                    id=college_id,
                    label=bldg_name,
                    icon="fa-solid fa-building",
                    color="bg-slate-500"
                ))
                print(f"Added MasterCollege: {bldg_name}")

            # 2. Create Building Zone
            existing_bldg = db.query(Zone).filter_by(name=bldg_name, type=ZoneType.BUILDING.value).first()
            if not existing_bldg:
                bldg_zone = Zone(name=bldg_name, type=ZoneType.BUILDING.value)
                db.add(bldg_zone)
                db.flush() # Get ID
                print(f"Created Building: {bldg_name}")
            else:
                bldg_zone = existing_bldg

            # 3. Create Floors
            for floor_name, rooms in floors.items():
                full_floor_name = f"{bldg_name} - {floor_name}"
                existing_floor = db.query(Zone).filter_by(name=full_floor_name, parent_zone_id=bldg_zone.id).first()
                if not existing_floor:
                    floor_zone = Zone(
                        name=full_floor_name, 
                        type=ZoneType.FLOOR.value, 
                        parent_zone_id=bldg_zone.id
                    )
                    db.add(floor_zone)
                    db.flush()
                    print(f"  Added Floor: {floor_name}")
                else:
                    floor_zone = existing_floor

                # 4. Create Rooms
                for room_name in rooms:
                    if not room_name or room_name == "???":
                        continue
                        
                    existing_room = db.query(Zone).filter_by(name=room_name, parent_zone_id=floor_zone.id).first()
                    if not existing_room:
                        db.add(Zone(
                            name=room_name,
                            type=ZoneType.ROOM.value,
                            parent_zone_id=floor_zone.id
                        ))
                        # print(f"    - Room: {room_name}")
        
        db.commit()
        print("\nBulk ingestion completed successfully!")
        
        total_zones = db.query(Zone).count()
        print(f"Total Zones in Database: {total_zones}")

    except Exception as e:
        db.rollback()
        print(f"Error during ingestion: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_locations()
