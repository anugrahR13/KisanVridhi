import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.session import engine, Base
import app.models  # Ensure models are imported for metadata table creation

from app.api.auth import router as auth_router
from app.api.farms import router as farms_router
from app.api.recommendations import router as recs_router
from app.api.missions import router as missions_router
from app.api.verifications import router as verif_router
from app.api.gamification import router as gamification_router
from app.api.assistant import router as assistant_router
from app.api.dashboard import router as dashboard_router
from app.api.admin import router as admin_router
from app.api.auctions import router as auctions_router
from app.api.community import router as community_router
from app.api.disease_detection import router as disease_detection_router
from app.api.crop_tracking import router as crop_tracking_router
from app.api.help_desk import router as help_desk_router
from app.api.rewards import router as rewards_router
from app.api.expenses import router as expenses_router
from app.api.profitability import router as profitability_router
from app.api.soil import router as soil_router
from app.api.tasks import router as tasks_router
from app.api.weather import router as weather_router
from app.api.schemes import router as schemes_router
from app.api.documents import router as documents_router
from app.api.market import router as market_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for AI-Powered Gamified Platform for Personalized Sustainable Farming"
)

# CORS middleware for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads directory for serving practice verification images
upload_dir = settings.UPLOAD_DIR
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Include API Routers under /api
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(farms_router, prefix=settings.API_V1_STR)
app.include_router(recs_router, prefix=settings.API_V1_STR)
app.include_router(missions_router, prefix=settings.API_V1_STR)
app.include_router(verif_router, prefix=settings.API_V1_STR)
app.include_router(gamification_router, prefix=settings.API_V1_STR)
app.include_router(assistant_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(auctions_router, prefix=settings.API_V1_STR)
app.include_router(community_router, prefix=settings.API_V1_STR)
app.include_router(disease_detection_router, prefix=settings.API_V1_STR)
app.include_router(crop_tracking_router, prefix=settings.API_V1_STR)
app.include_router(help_desk_router, prefix=settings.API_V1_STR)
app.include_router(rewards_router, prefix=settings.API_V1_STR)
app.include_router(expenses_router, prefix=settings.API_V1_STR)
app.include_router(profitability_router, prefix=settings.API_V1_STR)
app.include_router(soil_router, prefix=settings.API_V1_STR)
app.include_router(tasks_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)
app.include_router(schemes_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(market_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error": str(exc)}
    )
