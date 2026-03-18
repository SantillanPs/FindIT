import sys
import os

# Improve path handling for Vercel functions
try:
    # Add the current directory and the backend directory to sys.path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, '..'))
    backend_path = os.path.join(project_root, 'backend')
    
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

    # Log environment info for debugging
    print(f"VERCEL: Backend path resolved to: {backend_path}")
    print(f"VERCEL: DATABASE_URL exists: {bool(os.getenv('DATABASE_URL'))}")

    from main import app
except Exception as e:
    import traceback
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI()
    error_msg = traceback.format_exc()
    print(f"VERCEL CRITICAL ERROR: {error_msg}")
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all(path: str):
        return JSONResponse(
            status_code=500, 
            content={
                "error": "Backend initialization failed", 
                "message": str(e),
                "path": path,
                "hint": "Check Vercel logs and ensure DATABASE_URL is set."
            }
        )
