from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models import User, Badge, UserBadge, Notification, UserBadge
from app.schemas import BadgeResponse, UserBadgeResponse, LeaderboardEntry
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="", tags=["Gamification & Leaderboard"])

@router.get("/badges", response_model=List[BadgeResponse])
def list_badges(db: Session = Depends(get_db)):
    return db.query(Badge).all()

@router.get("/users/me/badges", response_model=List[UserBadgeResponse])
def get_user_unlocked_badges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    top_users = db.query(User).filter(User.role == "farmer").order_by(User.xp.desc(), User.sustainability_score.desc()).limit(50).all()
    
    leaderboard = []
    for rank, user in enumerate(top_users, start=1):
        badges_cnt = db.query(UserBadge).filter(UserBadge.user_id == user.id).count()
        leaderboard.append({
            "rank": rank,
            "user_id": user.id,
            "display_name": user.display_name or f"Farmer #{user.id}",
            "level": user.level,
            "xp": user.xp,
            "sustainability_score": user.sustainability_score,
            "badges_count": badges_cnt
        })

    return leaderboard

@router.get("/notifications")
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()
