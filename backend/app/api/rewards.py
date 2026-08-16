import random
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models import RewardItem, UserRewardRedemption, User, Notification
from app.auth.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/rewards", tags=["Rewards & Prize Redemption Marketplace"])

class RewardResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    points_cost: int
    sponsor_agency: str
    image_icon: str
    inventory_count: int
    is_active: bool

    class Config:
        from_attributes = True

class RedemptionResponse(BaseModel):
    id: int
    reward_id: int
    reward_title: str
    points_spent: int
    voucher_code: str
    status: str
    redeemed_at: str

@router.get("", response_model=List[RewardResponse])
def get_reward_items(db: Session = Depends(get_db)):
    return db.query(RewardItem).filter(RewardItem.is_active == True).all()

@router.get("/my-redemptions", response_model=List[RedemptionResponse])
def get_my_redemptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    redemptions = db.query(UserRewardRedemption).filter(UserRewardRedemption.user_id == current_user.id).order_by(UserRewardRedemption.redeemed_at.desc()).all()
    res = []
    for r in redemptions:
        res.append({
            "id": r.id,
            "reward_id": r.reward_id,
            "reward_title": r.reward.title if r.reward else "Agricultural Reward Pass",
            "points_spent": r.points_spent,
            "voucher_code": r.voucher_code,
            "status": r.status,
            "redeemed_at": r.redeemed_at.strftime("%Y-%m-%d %H:%M")
        })
    return res

@router.post("/redeem/{reward_id}")
def redeem_reward_item(
    reward_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reward = db.query(RewardItem).filter(RewardItem.id == reward_id).first()
    if not reward or not reward.is_active:
        raise HTTPException(status_code=404, detail="Reward item not found or inactive")

    if current_user.xp < reward.points_cost:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient points/XP balance. You have {current_user.xp} points, but '{reward.title}' costs {reward.points_cost} points. Complete more eco-missions to earn points!"
        )

    if reward.inventory_count <= 0:
        raise HTTPException(status_code=400, detail="This reward voucher is currently out of stock.")

    # Deduct user XP
    current_user.xp -= reward.points_cost
    reward.inventory_count -= 1

    # Generate unique voucher code (e.g. SEED500-8492)
    voucher_code = f"{reward.voucher_code_prefix}-{random.randint(1000, 9999)}"

    redemption = UserRewardRedemption(
        user_id=current_user.id,
        reward_id=reward.id,
        points_spent=reward.points_cost,
        voucher_code=voucher_code,
        status="Active"
    )
    db.add(redemption)

    # Add notification
    notif = Notification(
        user_id=current_user.id,
        title="Reward Pass Claimed! 🎁",
        message=f"You redeemed '{reward.title}' for {reward.points_cost} points. Voucher Code: {voucher_code}",
        type="success"
    )
    db.add(notif)

    db.commit()

    return {
        "message": f"Congratulations! You successfully redeemed '{reward.title}'!",
        "voucher_code": voucher_code,
        "points_spent": reward.points_cost,
        "remaining_points": current_user.xp,
        "sponsor_agency": reward.sponsor_agency
    }
