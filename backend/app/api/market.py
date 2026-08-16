from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models import MarketPrice, GovernmentAuction
from app.schemas import MarketPriceResponse
from app.api.auctions import AuctionResponse

router = APIRouter(prefix="/market", tags=["Market Information & Mandi Prices"])

@router.get("/prices", response_model=List[MarketPriceResponse])
def get_market_prices(
    state: Optional[str] = None,
    crop_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MarketPrice)
    if state and state.lower() != "all":
        query = query.filter(MarketPrice.state.ilike(f"%{state}%"))
    if crop_name and crop_name.lower() != "all":
        query = query.filter(MarketPrice.crop_name.ilike(f"%{crop_name}%"))
    return query.order_by(MarketPrice.updated_at.desc()).all()

@router.get("/msp-auctions", response_model=List[AuctionResponse])
def get_msp_auctions(
    db: Session = Depends(get_db)
):
    return db.query(GovernmentAuction).filter(GovernmentAuction.status == "Open").all()
