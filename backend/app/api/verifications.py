import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
from app.models import User, MissionProgress, Mission, ImageVerification
from app.schemas import ImageVerificationResponse
from app.auth.dependencies import get_current_user
from app.core.config import settings
from app.ai.vision_verifier import SustainablePracticeVisionVerifier
from app.services.gamification_service import award_xp
from app.services.sustainability_calculator import calculate_sustainability_score

router = APIRouter(prefix="/verifications", tags=["Computer Vision Verification"])

@router.post("/image", response_model=dict)
async def upload_and_verify_image(
    mission_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension '{file_ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Validate file size
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE / (1024*1024)} MB."
        )

    # Save file with safe UUID
    safe_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as f:
        f.write(contents)

    relative_image_url = f"/uploads/{safe_filename}"

    # Get mission details
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found.")

    # Find or create mission progress
    progress = db.query(MissionProgress).filter(
        MissionProgress.user_id == current_user.id,
        MissionProgress.mission_id == mission_id
    ).first()

    if not progress:
        progress = MissionProgress(
            user_id=current_user.id,
            mission_id=mission_id,
            status="started",
            started_at=datetime.utcnow()
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)

    progress.image_url = relative_image_url

    # Run Computer Vision verification model
    cv_result = SustainablePracticeVisionVerifier.verify_practice_image(
        image_path=file_path,
        expected_practice=mission.expected_practice_label or mission.title
    )

    verif_status = cv_result["verification_status"]
    
    verification_record = ImageVerification(
        mission_progress_id=progress.id,
        user_id=current_user.id,
        image_path=relative_image_url,
        detected_practice=cv_result["detected_practice"],
        confidence_score=cv_result["confidence_score"],
        verification_status=verif_status,
        review_notes=cv_result["message"]
    )
    db.add(verification_record)

    gamification_res = None
    score_res = None

    if verif_status == "approved":
        progress.status = "completed"
        progress.completed_at = datetime.utcnow()
        
        # Award verified bonus XP (+150 XP for verified practice)
        total_xp = mission.xp_reward + 50  # Bonus for CV verification
        gamification_res = award_xp(
            user_id=current_user.id,
            amount=total_xp,
            source_type="practice_verification",
            source_id=verification_record.id,
            description=f"Verified Practice: {cv_result['detected_practice']}",
            db=db
        )
        score_res = calculate_sustainability_score(current_user.id, db)
    else:
        progress.status = "pending_verification"

    db.commit()

    return {
        "verification_id": verification_record.id,
        "image_url": relative_image_url,
        "detected_practice": cv_result["detected_practice"],
        "confidence_score": cv_result["confidence_score"],
        "verification_status": verif_status,
        "message": cv_result["message"],
        "gamification": gamification_res,
        "sustainability_score": score_res
    }
