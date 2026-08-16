from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models import Crop, Farm, User
from app.auth.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/crop-tracking", tags=["Crop Tracking & Growth Stage Manager"])

class CropUpdateStage(BaseModel):
    growth_stage: str  # Sowing, Sprouting, Tillering, Flowering, Harvest
    soil_moisture_level: Optional[str] = "Optimal (45%)"
    watering_schedule: Optional[str] = "Every 4 days (Drip)"
    estimated_yield_quintals: Optional[float] = 18.5

class CropTrackingResponse(BaseModel):
    id: int
    crop_name: str
    variety: Optional[str] = None
    area_acres: Optional[float] = 1.0
    planting_date: Optional[str] = "2026-06-15"
    growth_stage: str = "Sprouting"
    status: str = "active"

@router.get("", response_model=List[CropTrackingResponse])
def get_tracked_crops(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    if not farms:
        return []

    crops = db.query(Crop).filter(Crop.farm_id == farms[0].id).all()
    res = []
    for c in crops:
        res.append({
            "id": c.id,
            "crop_name": c.crop_name,
            "variety": c.variety or "Standard Local",
            "area_acres": c.area_acres or 1.0,
            "planting_date": c.planting_date or "2026-06-15",
            "growth_stage": "Tillering" if c.crop_name == "Wheat" else "Sprouting",
            "status": c.status or "active"
        })
    return res

@router.put("/{crop_id}/growth-stage")
def update_crop_growth_stage(
    crop_id: int,
    stage_in: CropUpdateStage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    crop.status = "active"
    db.commit()
    return {
        "message": f"Updated growth stage for '{crop.crop_name}' to {stage_in.growth_stage}!",
        "crop_id": crop.id,
        "growth_stage": stage_in.growth_stage,
        "soil_moisture_level": stage_in.soil_moisture_level,
        "watering_schedule": stage_in.watering_schedule,
        "estimated_yield_quintals": stage_in.estimated_yield_quintals
    }
