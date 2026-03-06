import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "findit-media")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

try:
    print(f"Uploading to {SUPABASE_BUCKET}...")
    file_content = b"test content for testing"
    res = supabase.storage.from_(SUPABASE_BUCKET).upload(
        path="test_upload.txt",
        file=file_content,
        file_options={"content-type": "text/plain"}
    )
    print("Upload successful:", res)
    public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url("test_upload.txt")
    print("Public URL:", public_url)
except Exception as e:
    import traceback
    traceback.print_exc()

