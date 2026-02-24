# Triggering reload.
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from fastapi.staticfiles import StaticFiles
import database
from routers import auth as auth_router, admin_users, found, lost, claims, notifications, media, categories, analytics
import os

# Ensure uploads directory exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

from fastapi import FastAPI, APIRouter, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
# ... existing imports ...

app = FastAPI(
    title="FindIT API", 
    description="Backend API for the FindIT Lost and Found System, supporting AI-assisted matching and role-based verification.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Log the full error to the server terminal
    err_msg = f"[{datetime.utcnow()}] VALIDATION ERROR: {exc.errors()}"
    print(err_msg)
    with open(r"C:\Users\admin\Documents\Programming\findIT\backend\error_log.txt", "a") as f:
        f.write(err_msg + "\n")
    # Return a generic message to the client
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid submission data. Please check your inputs and try again."},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full error to the server terminal
    print(f"[{datetime.utcnow()}] UNHANDLED ERROR: {str(exc)}")
    import traceback
    traceback.print_exc()
    # Return a generic message to the client
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later or contact support."},
    )

# Enable CORS for all origins (Dev mode)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Initialize DB
database.init_db()

# Central v1 Router
v1_router = APIRouter(prefix="/api/v1")

# Include Modular Routers
v1_router.include_router(auth_router.router)
v1_router.include_router(admin_users.router)
v1_router.include_router(found.router)
v1_router.include_router(lost.router)
v1_router.include_router(claims.router)
v1_router.include_router(notifications.router)
v1_router.include_router(media.router)
v1_router.include_router(categories.router)
v1_router.include_router(analytics.router)

# Mount central router to app
app.include_router(v1_router)

# Mount Static Files for Uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

if __name__ == "__main__":
    import uvicorn
    # Using string 'main:app' with reload=True for development
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
