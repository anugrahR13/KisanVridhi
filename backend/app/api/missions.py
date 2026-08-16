from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.session import get_db
from app.models import User, Mission, MissionProgress, Farm
from app.schemas import MissionResponse, MissionProgressResponse
from app.auth.dependencies import get_current_user
from app.services.gamification_service import award_xp
from app.services.sustainability_calculator import calculate_sustainability_score

router = APIRouter(prefix="/missions", tags=["Missions & Challenges"])

@router.get("", response_model=List[MissionResponse])
def list_missions(category_id: Optional[int] = None, difficulty: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Mission).filter(Mission.is_active == True)
    if category_id:
        query = query.filter(Mission.category_id == category_id)
    if difficulty:
        query = query.filter(Mission.difficulty == difficulty)
    return query.all()

@router.get("/my-progress", response_model=List[MissionProgressResponse])
def get_my_mission_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(MissionProgress).filter(MissionProgress.user_id == current_user.id).all()

@router.post("/{mission_id}/start", response_model=MissionProgressResponse)
def start_mission(mission_id: int, farm_id: Optional[int] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id, Mission.is_active == True).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found.")

    existing = db.query(MissionProgress).filter(
        MissionProgress.user_id == current_user.id,
        MissionProgress.mission_id == mission_id,
        MissionProgress.status.in_(["started", "pending_verification"])
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="You have already started this mission.")

    # Find farm ID if not provided
    if not farm_id:
        user_farm = db.query(Farm).filter(Farm.user_id == current_user.id).first()
        if user_farm:
            farm_id = user_farm.id

    progress = MissionProgress(
        user_id=current_user.id,
        farm_id=farm_id,
        mission_id=mission_id,
        status="started",
        started_at=datetime.utcnow()
    )
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress

@router.post("/{mission_id}/complete", response_model=dict)
def complete_mission(mission_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress = db.query(MissionProgress).filter(
        MissionProgress.user_id == current_user.id,
        MissionProgress.mission_id == mission_id
    ).first()

    if not progress:
        raise HTTPException(status_code=404, detail="Mission progress record not found. Please start the mission first.")

    if progress.status == "completed":
        raise HTTPException(status_code=400, detail="Mission is already marked as completed.")

    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found.")

    if mission.requires_image and not progress.image_url and progress.status != "pending_verification":
        raise HTTPException(
            status_code=400, 
            detail="This mission requires image proof verification before completion. Please upload an image."
        )

    progress.status = "completed"
    progress.completed_at = datetime.utcnow()
    db.commit()

    # Award XP & handle level-up / badge unlock
    xp_result = award_xp(
        user_id=current_user.id,
        amount=mission.xp_reward,
        source_type="mission",
        source_id=mission.id,
        description=f"Completed Mission: {mission.title}",
        db=db
    )

    # Recalculate Sustainability Score
    score_result = calculate_sustainability_score(current_user.id, db)

    return {
        "message": f"Mission '{mission.title}' completed successfully!",
        "xp_earned": mission.xp_reward,
        "gamification": xp_result,
        "sustainability_score": score_result
    }
