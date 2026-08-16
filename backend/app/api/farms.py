from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models import User, Farm, Crop, FarmingPractice
from app.schemas import FarmCreate, FarmResponse, CropCreate, CropResponse, PracticeCreate, PracticeResponse
from app.auth.dependencies import get_current_user
from app.services.sustainability_calculator import calculate_sustainability_score
from app.ai.recommendation_engine import SustainabilityRecommendationEngine
from app.models import Recommendation

router = APIRouter(prefix="/farms", tags=["Farms"])

@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(farm_in: FarmCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_farm = Farm(
        user_id=current_user.id,
        farm_name=farm_in.farm_name,
        location=farm_in.location,
        area_acres=farm_in.area_acres,
        soil_type=farm_in.soil_type,
        irrigation_type=farm_in.irrigation_type,
        water_source=farm_in.water_source,
        primary_crop=farm_in.primary_crop,
        secondary_crops=farm_in.secondary_crops,
        farming_experience=farm_in.farming_experience,
        current_practices=farm_in.current_practices
    )
    db.add(new_farm)
    db.commit()
    db.refresh(new_farm)

    # Automatically add primary crop to crops table
    primary_crop_entry = Crop(
        farm_id=new_farm.id,
        crop_name=farm_in.primary_crop,
        area_acres=farm_in.area_acres,
        status="active"
    )
    db.add(primary_crop_entry)
    
    if farm_in.secondary_crops:
        for crop_str in farm_in.secondary_crops.split(","):
            c_name = crop_str.strip()
            if c_name:
                db.add(Crop(farm_id=new_farm.id, crop_name=c_name, status="active"))
    
    db.commit()
    db.refresh(new_farm)

    # Recalculate sustainability score
    calculate_sustainability_score(current_user.id, db)

    # Auto-generate personalized recommendations
    recs_data = SustainabilityRecommendationEngine.generate_recommendations_for_farm(new_farm, current_user, db)
    # Clear old recommendations for this farm
    db.query(Recommendation).filter(Recommendation.farm_id == new_farm.id).delete()
    for rec in recs_data:
        rec_obj = Recommendation(
            user_id=current_user.id,
            farm_id=new_farm.id,
            category_id=rec["category_id"],
            title=rec["title"],
            description=rec["description"],
            reason=rec["reason"],
            priority=rec["priority"],
            estimated_impact=rec["estimated_impact"],
            difficulty=rec["difficulty"],
            related_mission_id=rec["related_mission_id"]
        )
        db.add(rec_obj)
    db.commit()

    return new_farm

@router.get("", response_model=List[FarmResponse])
def get_user_farms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Farm).filter(Farm.user_id == current_user.id).all()

@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm_by_id(farm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")
    return farm

@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(farm_id: int, farm_in: FarmCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")

    farm.farm_name = farm_in.farm_name
    farm.location = farm_in.location
    farm.area_acres = farm_in.area_acres
    farm.soil_type = farm_in.soil_type
    farm.irrigation_type = farm_in.irrigation_type
    farm.water_source = farm_in.water_source
    farm.primary_crop = farm_in.primary_crop
    farm.secondary_crops = farm_in.secondary_crops
    farm.farming_experience = farm_in.farming_experience
    farm.current_practices = farm_in.current_practices

    db.commit()
    db.refresh(farm)

    # Recalculate score & generate fresh recommendations
    calculate_sustainability_score(current_user.id, db)
    recs_data = SustainabilityRecommendationEngine.generate_recommendations_for_farm(farm, current_user, db)
    db.query(Recommendation).filter(Recommendation.farm_id == farm.id).delete()
    for rec in recs_data:
        db.add(Recommendation(
            user_id=current_user.id,
            farm_id=farm.id,
            category_id=rec["category_id"],
            title=rec["title"],
            description=rec["description"],
            reason=rec["reason"],
            priority=rec["priority"],
            estimated_impact=rec["estimated_impact"],
            difficulty=rec["difficulty"],
            related_mission_id=rec["related_mission_id"]
        ))
    db.commit()

    return farm

@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(farm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")
    db.delete(farm)
    db.commit()
    return None

@router.post("/{farm_id}/crops", response_model=CropResponse)
def add_crop_to_farm(farm_id: int, crop_in: CropCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")
    
    new_crop = Crop(
        farm_id=farm.id,
        crop_name=crop_in.crop_name,
        variety=crop_in.variety,
        area_acres=crop_in.area_acres,
        planting_date=crop_in.planting_date,
        expected_harvest_date=crop_in.expected_harvest_date,
        status=crop_in.status or "active"
    )
    db.add(new_crop)
    db.commit()
    db.refresh(new_crop)
    return new_crop
