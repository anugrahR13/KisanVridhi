from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models import User, Farm, Recommendation
from app.schemas import RecommendationResponse
from app.auth.dependencies import get_current_user
from app.ai.recommendation_engine import SustainabilityRecommendationEngine

router = APIRouter(prefix="/recommendations", tags=["AI Recommendations"])

@router.get("", response_model=List[RecommendationResponse])
def get_user_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(Recommendation.created_at.desc()).all()

@router.post("/generate", response_model=List[RecommendationResponse])
def generate_recommendations(farm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm profile not found.")

    recs_data = SustainabilityRecommendationEngine.generate_recommendations_for_farm(farm, current_user, db)
    
    # Replace existing recommendations for this farm
    db.query(Recommendation).filter(Recommendation.farm_id == farm.id).delete()
    
    created_recs = []
    for rec in recs_data:
        rec_obj = Recommendation(
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
        )
        db.add(rec_obj)
        created_recs.append(rec_obj)

    db.commit()
    for r in created_recs:
        db.refresh(r)

    return created_recs
