from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
import io
from PIL import Image
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
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Open image with Pillow for optimization
        img = Image.open(io.BytesIO(file_content))
        
        # 1. OPTIMIZED VERSION (Max Width: 1200px)
        optimized_img = img.copy()
        optimized_img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
        
        # Fix orientation / transparency
        if optimized_img.mode in ("RGBA", "P"):
            optimized_img = optimized_img.convert("RGBA")
        else:
            optimized_img = optimized_img.convert("RGB")
            
        opt_buffer = io.BytesIO()
        optimized_img.save(opt_buffer, format="WEBP", quality=80)
        optimized_content = opt_buffer.getvalue()
        
        # 2. THUMBNAIL VERSION (Max Width: 400px)
        thumbnail_img = img.copy()
        thumbnail_img.thumbnail((400, 400), Image.Resampling.LANCZOS)
        
        if thumbnail_img.mode in ("RGBA", "P"):
            thumbnail_img = thumbnail_img.convert("RGBA")
        else:
            thumbnail_img = thumbnail_img.convert("RGB")

        thumb_buffer = io.BytesIO()
        thumbnail_img.save(thumb_buffer, format="WEBP", quality=70) # Lower quality for faster thumbnails
        thumbnail_content = thumb_buffer.getvalue()
        
        # Create unique filenames
        base_uuid = uuid.uuid4()
        opt_filename = f"{base_uuid}_opt.webp"
        thumb_filename = f"{base_uuid}_thumb.webp"
        
        # Upload Optimized version
        supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=opt_filename,
            file=optimized_content,
            file_options={"content-type": "image/webp"}
        )
        
        # Upload Thumbnail version
        supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=thumb_filename,
            file=thumbnail_content,
            file_options={"content-type": "image/webp"}
        )
        
        # Get URLs
        url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(opt_filename)
        thumbnail_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(thumb_filename)
        
        return {
            "url": url,
            "thumbnail_url": thumbnail_url
        }
        
    except Exception as e:
        print(f"UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Could not process or upload image: {str(e)}")
