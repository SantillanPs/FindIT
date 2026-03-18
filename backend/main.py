from fastapi import FastAPI, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import uvicorn
import logging

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

import database
import database
from routers import auth as auth_router, admin_users, found, lost, claims, notifications, media, categories, analytics, zones, admin_zones, colleges, feedbacks, assets, init

# Ensure uploads directory exists (wrap in try-except for read-only environments like Vercel)
try:
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
except OSError:
    pass

app = FastAPI(
    title="FindIT API",
    description="Backend API for the FindIT Lost and Found System, supporting AI-assisted matching and role-based verification.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
async def setup_logging_timestamps():
    # Dynamically inject timestamps into uvicorn loggers after they are created
    access_formatter = uvicorn.logging.AccessFormatter(
        "%(asctime)s | %(levelprefix)s %(client_addr)s - \"%(request_line)s\" %(status_code)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    for handler in logging.getLogger("uvicorn.access").handlers:
        handler.setFormatter(access_formatter)

    default_formatter = uvicorn.logging.DefaultFormatter(
        "%(asctime)s | %(levelprefix)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    for handler in logging.getLogger("uvicorn.error").handlers:
        handler.setFormatter(default_formatter)

    # Also update the root uvicorn logger if needed
    for handler in logging.getLogger("uvicorn").handlers:
        handler.setFormatter(default_formatter)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Log the full error to the server terminal
    err_msg = f"[{datetime.utcnow()}] VALIDATION ERROR: {exc.errors()}"
    print(err_msg)
    # Return a generic message to the client
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

# Enable CORS for development and production
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
v1_router.include_router(zones.router)
v1_router.include_router(admin_zones.router)
v1_router.include_router(colleges.router)
v1_router.include_router(feedbacks.router)
v1_router.include_router(assets.router)
v1_router.include_router(init.router)

# Mount central router to app
app.include_router(v1_router)

# Mount Static Files for Uploads (skip if dir doesn't exist to prevent crash on Vercel)
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
if __name__ == "__main__":
    import uvicorn
    # Using string 'main:app' with reload=True for development
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
# Triggering reload.
