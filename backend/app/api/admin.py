from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database.session import get_db
from app.models import User, Farm, Mission, MissionProgress, ImageVerification, PracticeCategory, SustainabilityScoreHistory
from app.schemas import MissionCreate, MissionResponse, ImageVerificationResponse, AdminStats
from app.auth.dependencies import get_current_admin
from app.services.gamification_service import award_xp
from app.services.sustainability_calculator import calculate_sustainability_score

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats", response_model=dict)
def get_admin_dashboard_stats(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    active_farmers = db.query(User).filter(User.role == "farmer").count()
    total_farms = db.query(Farm).count()
    total_missions = db.query(Mission).count()
    completed_missions = db.query(MissionProgress).filter(MissionProgress.status == "completed").count()

    avg_score_res = db.query(func.avg(User.sustainability_score)).filter(User.role == "farmer").scalar()
    avg_score = round(float(avg_score_res), 1) if avg_score_res else 50.0

    # Practice Category Breakdown
    categories = db.query(PracticeCategory).all()
    popular_categories = []
    for cat in categories:
        cnt = db.query(MissionProgress).join(Mission).filter(Mission.category_id == cat.id, MissionProgress.status == "completed").count()
        popular_categories.append({
            "category": cat.name,
            "completed_count": cnt
        })

    recent_verifications = db.query(ImageVerification).order_by(ImageVerification.verified_at.desc()).limit(10).all()

    return {
        "total_users": total_users,
        "active_farmers": active_farmers,
        "total_farms": total_farms,
        "total_missions": total_missions,
        "completed_missions": completed_missions,
        "avg_sustainability_score": avg_score,
        "popular_categories": popular_categories,
        "recent_verifications": [
            {
                "id": v.id,
                "user_id": v.user_id,
                "detected_practice": v.detected_practice,
                "confidence_score": v.confidence_score,
                "verification_status": v.verification_status,
                "verified_at": v.verified_at
            } for v in recent_verifications
        ]
    }

@router.post("/missions", response_model=MissionResponse, status_code=status.HTTP_201_CREATED)
def create_mission_admin(mission_in: MissionCreate, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    new_mission = Mission(
        title=mission_in.title,
        description=mission_in.description,
        category_id=mission_in.category_id,
        difficulty=mission_in.difficulty,
        xp_reward=mission_in.xp_reward,
        duration_days=mission_in.duration_days,
        requires_image=mission_in.requires_image,
        expected_practice_label=mission_in.expected_practice_label,
        is_active=True
    )
    db.add(new_mission)
    db.commit()
    db.refresh(new_mission)
    return new_mission

@router.put("/missions/{mission_id}", response_model=MissionResponse)
def update_mission_admin(mission_id: int, mission_in: MissionCreate, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found.")

    mission.title = mission_in.title
    mission.description = mission_in.description
    mission.category_id = mission_in.category_id
    mission.difficulty = mission_in.difficulty
    mission.xp_reward = mission_in.xp_reward
    mission.duration_days = mission_in.duration_days
    mission.requires_image = mission_in.requires_image
    mission.expected_practice_label = mission_in.expected_practice_label

    db.commit()
    db.refresh(mission)
    return mission

@router.delete("/missions/{mission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mission_admin(mission_id: int, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found.")

    db.delete(mission)
    db.commit()
    return None

@router.get("/verifications", response_model=List[ImageVerificationResponse])
def get_all_verifications_admin(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(ImageVerification).order_by(ImageVerification.verified_at.desc()).all()

@router.post("/verifications/{verification_id}/review")
def review_verification_admin(verification_id: int, action: str, notes: Optional[str] = None, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    if action not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Action must be 'approved' or 'rejected'.")

    verif = db.query(ImageVerification).filter(ImageVerification.id == verification_id).first()
    if not verif:
        raise HTTPException(status_code=404, detail="Verification record not found.")

    verif.verification_status = action
    verif.review_notes = notes or f"Reviewed by Admin {current_admin.full_name}"

    progress = verif.mission_progress
    if progress:
        if action == "approved":
            progress.status = "completed"
            award_xp(
                user_id=progress.user_id,
                amount=100,
                source_type="practice_verification",
                source_id=verif.id,
                description=f"Admin Verified: {verif.detected_practice}",
                db=db
            )
            calculate_sustainability_score(progress.user_id, db)
        else:
            progress.status = "started"

    db.commit()
    return {"message": f"Verification status updated to {action}."}
