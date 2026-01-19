# Triggering reload
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import database
from routers import auth as auth_router, admin_users, found, lost, claims, notifications

app = FastAPI(
    title="FindIT API", 
    description="Backend API for the FindIT Lost and Found System, supporting AI-assisted matching and role-based verification.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
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

# Mount central router to app
app.include_router(v1_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
