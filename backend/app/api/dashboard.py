from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models import User, Farm, MissionProgress, UserBadge, Recommendation, XPTransaction, SustainabilityScoreHistory
from app.schemas import FarmerDashboardStats, RecommendationResponse, UserResponse
from app.auth.dependencies import get_current_user
from app.services.sustainability_calculator import calculate_sustainability_score

router = APIRouter(prefix="/dashboard", tags=["Farmer Dashboard"])

@router.get("/stats", response_model=dict)
def get_farmer_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get dynamic sustainability score breakdown
    score_breakdown = calculate_sustainability_score(current_user.id, db)

    active_missions_cnt = db.query(MissionProgress).filter(
        MissionProgress.user_id == current_user.id,
        MissionProgress.status.in_(["started", "pending_verification"])
    ).count()

    completed_missions_cnt = db.query(MissionProgress).filter(
        MissionProgress.user_id == current_user.id,
        MissionProgress.status == "completed"
    ).count()

    total_badges_cnt = db.query(UserBadge).filter(UserBadge.user_id == current_user.id).count()

    recent_recs = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(Recommendation.created_at.desc()).limit(5).all()

    recent_xp_txns = db.query(XPTransaction).filter(
        XPTransaction.user_id == current_user.id
    ).order_by(XPTransaction.created_at.desc()).limit(10).all()

    recent_activities = [
        {
            "id": t.id,
            "description": t.description,
            "amount": t.amount,
            "type": t.source_type,
            "created_at": t.created_at
        }
        for t in recent_xp_txns
    ]

    # Pending tasks for Today's Farm Check
    from app.models import FarmTask, FarmExpense
    pending_tasks = db.query(FarmTask).filter(
        FarmTask.user_id == current_user.id,
        FarmTask.status == "pending"
    ).order_by(FarmTask.due_date.asc()).limit(5).all()

    user_farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    
    total_expenses = db.query(func.sum(FarmExpense.amount)).filter(FarmExpense.user_id == current_user.id).scalar() or 0.0

    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "display_name": current_user.display_name,
            "location": current_user.location,
            "phone_number": current_user.phone_number,
            "preferred_language": current_user.preferred_language,
            "role": current_user.role,
            "xp": current_user.xp,
            "level": current_user.level,
            "sustainability_score": current_user.sustainability_score,
            "created_at": current_user.created_at
        },
        "sustainability_breakdown": score_breakdown,
        "active_missions_count": active_missions_cnt,
        "completed_missions_count": completed_missions_cnt,
        "total_badges_count": total_badges_cnt,
        "farms_count": len(user_farms),
        "total_expenses": round(total_expenses, 2),
        "pending_tasks": [
            {
                "id": tk.id,
                "title": tk.title,
                "description": tk.description,
                "category": tk.category,
                "due_date": tk.due_date,
                "priority": tk.priority,
                "status": tk.status,
                "source": tk.source
            } for tk in pending_tasks
        ],
        "recent_recommendations": [
            {
                "id": r.id,
                "user_id": r.user_id,
                "farm_id": r.farm_id,
                "category_id": r.category_id,
                "title": r.title,
                "description": r.description,
                "reason": r.reason,
                "priority": r.priority,
                "estimated_impact": r.estimated_impact,
                "difficulty": r.difficulty,
                "related_mission_id": r.related_mission_id,
                "is_read": r.is_read,
                "created_at": r.created_at.strftime("%Y-%m-%d %H:%M")
            } for r in recent_recs
        ],
        "recent_activities": recent_activities
    }

@router.get("/analytics")
def get_farmer_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    score_history = db.query(SustainabilityScoreHistory).filter(
        SustainabilityScoreHistory.user_id == current_user.id
    ).order_by(SustainabilityScoreHistory.calculated_at.asc()).limit(30).all()

    xp_history = db.query(XPTransaction).filter(
        XPTransaction.user_id == current_user.id
    ).order_by(XPTransaction.created_at.asc()).limit(50).all()

    return {
        "score_history": [
            {
                "date": s.calculated_at.strftime("%b %d"),
                "overall": s.overall_score,
                "water": s.water_score,
                "soil": s.soil_score,
                "waste": s.waste_score,
                "diversity": s.diversity_score,
                "resource": s.resource_score
            } for s in score_history
        ],
        "xp_history": [
            {
                "date": x.created_at.strftime("%b %d"),
                "description": x.description,
                "amount": x.amount
            } for x in xp_history
        ]
    }
