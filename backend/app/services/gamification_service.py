from sqlalchemy.orm import Session
from app.models import User, XPTransaction, Badge, UserBadge, MissionProgress, Notification
import datetime

LEVEL_THRESHOLDS = [
    {"level": 1, "title": "Beginner Farmer", "min_xp": 0},
    {"level": 2, "title": "Eco Farmer", "min_xp": 300},
    {"level": 3, "title": "Sustainable Farmer", "min_xp": 800},
    {"level": 4, "title": "Smart Farmer", "min_xp": 1500},
    {"level": 5, "title": "Climate-Smart Farmer", "min_xp": 3000},
]

def calculate_level_for_xp(xp: int) -> int:
    current_level = 1
    for lvl_info in LEVEL_THRESHOLDS:
        if xp >= lvl_info["min_xp"]:
            current_level = lvl_info["level"]
    return current_level

def award_xp(user_id: int, amount: int, source_type: str, description: str, db: Session, source_id: int = None) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"xp_awarded": 0, "new_total": 0, "level_up": False}

    old_xp = user.xp
    new_xp = old_xp + amount
    user.xp = new_xp

    # Log transaction
    txn = XPTransaction(
        user_id=user_id,
        amount=amount,
        source_type=source_type,
        source_id=source_id,
        description=description
    )
    db.add(txn)

    old_level = user.level
    new_level = calculate_level_for_xp(new_xp)
    level_up = new_level > old_level
    if level_up:
        user.level = new_level
        # Create Level Up notification
        notif = Notification(
            user_id=user_id,
            title="Level Up!",
            message=f"Congratulations! You reached Level {new_level} - {LEVEL_THRESHOLDS[new_level-1]['title']}!",
            type="level"
        )
        db.add(notif)

    db.commit()

    # Check for unlocked badges
    unlocked_badges = check_and_award_badges(user_id, db)

    return {
        "xp_awarded": amount,
        "new_total": new_xp,
        "old_level": old_level,
        "new_level": new_level,
        "level_up": level_up,
        "unlocked_badges": unlocked_badges
    }

def check_and_award_badges(user_id: int, db: Session) -> list:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    # Get user's existing badge IDs
    existing_badge_ids = {ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()}
    all_badges = db.query(Badge).all()

    completed_missions = db.query(MissionProgress).filter(
        MissionProgress.user_id == user_id, 
        MissionProgress.status == "completed"
    ).all()
    completed_count = len(completed_missions)

    unlocked_new = []

    for badge in all_badges:
        if badge.id in existing_badge_ids:
            continue

        unlocked = False
        req_type = badge.requirement_type
        req_val = badge.requirement_value

        if req_type == "mission_count":
            if completed_count >= int(req_val):
                unlocked = True
        elif req_type == "level_threshold":
            if user.level >= int(req_val):
                unlocked = True
        elif req_type == "score_threshold":
            if user.sustainability_score >= float(req_val):
                unlocked = True
        elif req_type == "water_missions":
            water_count = sum(1 for m in completed_missions if m.mission and m.mission.category_id == 1)
            if water_count >= int(req_val):
                unlocked = True
        elif req_type == "soil_missions":
            soil_count = sum(1 for m in completed_missions if m.mission and m.mission.category_id == 2)
            if soil_count >= int(req_val):
                unlocked = True
        elif req_type == "compost_mission":
            compost_count = sum(1 for m in completed_missions if m.mission and m.mission.category_id in [3, 6])
            if compost_count >= int(req_val):
                unlocked = True

        if unlocked:
            ub = UserBadge(user_id=user_id, badge_id=badge.id)
            db.add(ub)
            unlocked_new.append(badge.name)

            # Notification
            notif = Notification(
                user_id=user_id,
                title="Badge Unlocked!",
                message=f"You earned the '{badge.name}' badge! (+{badge.xp_reward} XP)",
                type="badge"
            )
            db.add(notif)
            
            # Award bonus XP for badge
            user.xp += badge.xp_reward

    db.commit()
    return unlocked_new
