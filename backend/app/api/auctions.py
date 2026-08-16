from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models import GovernmentAuction, User
from app.auth.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/auctions", tags=["Government Auctions"])

class AuctionResponse(BaseModel):
    id: int
    title: str
    crop_type: str
    msp_price_per_quintal: float
    min_sustainability_score_required: float
    location_region: str
    deadline_date: str
    procurement_agency: str
    status: str

    class Config:
        from_attributes = True

@router.get("", response_model=List[AuctionResponse])
def get_auctions(db: Session = Depends(get_db)):
    return db.query(GovernmentAuction).all()

@router.post("/apply/{auction_id}")
def apply_for_auction(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    auction = db.query(GovernmentAuction).filter(GovernmentAuction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    if current_user.sustainability_score < auction.min_sustainability_score_required:
        raise HTTPException(
            status_code=400,
            detail=f"Sustainability Score too low. You need at least {auction.min_sustainability_score_required} score (Current: {current_user.sustainability_score}). Complete more eco-missions to unlock!"
        )

    return {
        "message": f"Successfully applied for '{auction.title}'! Your verified Sustainability Score of {current_user.sustainability_score} qualifies you for direct Government MSP procurement.",
        "status": "Applied",
        "auction_title": auction.title,
        "procurement_agency": auction.procurement_agency
    }
