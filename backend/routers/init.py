from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import database, auth, schemas

router = APIRouter(prefix="/init", tags=["System Initialization"])

@router.get("/")
def get_bootstrap_data(db: Session = Depends(auth.get_db)):
    """
    Returns a consolidated package of metadata and leaderboard data 
    to reduce the number of initial API calls from the frontend.
    """
    # 1. Categories
    categories = db.query(database.MasterCategory).filter_by(is_active=True).all()
    
    # 2. Colleges
    colleges = db.query(database.MasterCollege).filter_by(is_active=True).all()
    
    # 3. Student Leaderboard (Top 5 for Landing)
    students = db.query(database.User)\
              .filter(database.User.role == database.UserRole.STUDENT.value)\
              .order_by(database.User.integrity_points.desc())\
              .limit(5).all()
    
    student_leaderboard = []
    for i, user in enumerate(students):
        fname = user.first_name or ""
        lname = user.last_name or ""
        masked_first = f"{fname[0]}***" if len(fname) > 0 else "*"
        masked_last = f"{lname[0]}***" if len(lname) > 0 else "*"
        masked_name = f"{masked_first} {masked_last}".strip()
        final_name = f"{fname} {lname}".strip() if user.show_full_name else masked_name
        if not final_name:
            final_name = "Anonymous Student"
            
        student_leaderboard.append({
            "id": user.id,
            "full_name_masked": final_name,
            "show_full_name": user.show_full_name,
            "department": user.department or "General Education",
            "integrity_points": user.integrity_points,
            "is_certificate_eligible": user.is_certificate_eligible,
            "rank": i + 1
        })

    # 4. Department Leaderboard
    dept_results = db.query(
        database.User.department,
        func.sum(database.User.integrity_points).label("total_points"),
        func.count(database.User.id).label("student_count")
    ).filter(
        database.User.role == database.UserRole.STUDENT,
        database.User.department.isnot(None)
    ).group_by(database.User.department).order_by(func.sum(database.User.integrity_points).desc()).limit(5).all()
    
    dept_leaderboard = [
        {
            "department": r.department,
            "total_points": r.total_points,
            "student_count": r.student_count
        } for r in dept_results
    ]

    return {
        "categories": categories,
        "colleges": colleges,
        "leaderboard": {
            "students": student_leaderboard,
            "departments": dept_leaderboard
        }
    }
