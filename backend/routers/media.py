from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

router = APIRouter(tags=["Media"])

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "findit-media")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("WARNING: Supabase Storage credentials missing in .env")
    supabase: Client = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase Storage not configured.")

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and WebP are allowed.")
    
    # Create unique filename
    file_extension = os.path.splitext(file.filename)[1]
    new_filename = f"{uuid.uuid4()}{file_extension}"
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Upload to Supabase Storage
        res = supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=new_filename,
            file=file_content,
            file_options={"content-type": file.content_type}
        )
        
        # Get Public URL
        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(new_filename)
        
        return {"url": public_url}
        
    except Exception as e:
        print(f"UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Could not upload file to cloud storage: {str(e)}")
