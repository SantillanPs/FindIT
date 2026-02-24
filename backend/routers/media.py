from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from datetime import datetime

router = APIRouter(tags=["Media"])

UPLOAD_DIR = "uploads"

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and WebP are allowed.")
    
    # Create unique filename
    file_extension = os.path.splitext(file.filename)[1]
    new_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    
    # Save the file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
    
    # Return the URL
    # Assuming the backend runs on port 8000 and mounts 'uploads' at '/uploads'
    return {"url": f"/uploads/{new_filename}"}
