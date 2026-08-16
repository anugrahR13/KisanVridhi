from sqlalchemy.orm import Session
from app.models import User, Farm, MissionProgress, FarmingPractice, SustainabilityScoreHistory
import datetime

def calculate_sustainability_score(user_id: int, db: Session) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"overall_score": 50.0, "water_score": 50.0, "soil_score": 50.0, "waste_score": 50.0, "diversity_score": 50.0, "resource_score": 50.0}

    farms = db.query(Farm).filter(Farm.user_id == user_id).all()
    completed_missions = db.query(MissionProgress).filter(
        MissionProgress.user_id == user_id, 
        MissionProgress.status == "completed"
    ).all()

    # Base Scores
    water_score = 50.0
    soil_score = 50.0
    waste_score = 50.0
    diversity_score = 50.0
    resource_score = 50.0

    if farms:
        primary_farm = farms[0]
        
        # Irrigation & Water evaluation
        irrigation = (primary_farm.irrigation_type or "").lower()
        water_src = (primary_farm.water_source or "").lower()
        if "drip" in irrigation:
            water_score += 25
        elif "sprinkler" in irrigation:
            water_score += 18
        elif "rainfed" in irrigation:
            water_score += 12
        elif "flood" in irrigation or "ditch" in irrigation:
            water_score -= 10
            
        if "rainwater" in water_src or "harvesting" in water_src:
            water_score += 15
        elif "pond" in water_src:
            water_score += 10

        # Soil evaluation
        soil = (primary_farm.soil_type or "").lower()
        practices_text = (primary_farm.current_practices or "").lower()
        if "mulching" in practices_text or "cover crop" in practices_text:
            soil_score += 20
        if "organic" in practices_text or "compost" in practices_text:
            soil_score += 15
            waste_score += 20
        if "zero tillage" in practices_text or "no-till" in practices_text:
            soil_score += 15

        # Crop diversity evaluation
        secondary = primary_farm.secondary_crops or ""
        crop_count = 1 + (len(secondary.split(",")) if secondary.strip() else 0)
        if crop_count >= 3:
            diversity_score += 30
        elif crop_count == 2:
            diversity_score += 18
        else:
            diversity_score += 5

    # Mission completion bonuses (Adds points across relevant areas)
    for progress in completed_missions:
        cat_id = progress.mission.category_id if progress.mission else 1
        if cat_id == 1: # Water
            water_score += 5
        elif cat_id == 2: # Soil
            soil_score += 5
        elif cat_id in [3, 5, 6]: # Organic / Waste / Compost
            waste_score += 5
            soil_score += 3
        elif cat_id == 4: # Diversity
            diversity_score += 5
        else:
            resource_score += 5

    # Cap all sub-scores between 10 and 100
    water_score = max(10.0, min(100.0, round(water_score, 1)))
    soil_score = max(10.0, min(100.0, round(soil_score, 1)))
    waste_score = max(10.0, min(100.0, round(waste_score, 1)))
    diversity_score = max(10.0, min(100.0, round(diversity_score, 1)))
    resource_score = max(10.0, min(100.0, round(resource_score, 1)))

    overall_score = round((water_score + soil_score + waste_score + diversity_score + resource_score) / 5.0, 1)

    # Update user's current sustainability score
    user.sustainability_score = overall_score
    
    # Store historical entry
    history = SustainabilityScoreHistory(
        user_id=user_id,
        overall_score=overall_score,
        water_score=water_score,
        soil_score=soil_score,
        waste_score=waste_score,
        diversity_score=diversity_score,
        resource_score=resource_score
    )
    db.add(history)
    db.commit()

    return {
        "overall_score": overall_score,
        "water_score": water_score,
        "soil_score": soil_score,
        "waste_score": waste_score,
        "diversity_score": diversity_score,
        "resource_score": resource_score
    }
