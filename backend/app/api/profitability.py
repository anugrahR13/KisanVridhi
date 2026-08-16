from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models import ProfitRecord, FarmExpense, Farm, User
from app.schemas import ProfitRecordCreate, ProfitRecordResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/profitability", tags=["Profitability"])

@router.get("", response_model=List[ProfitRecordResponse])
def get_profit_records(
    farm_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ProfitRecord).filter(ProfitRecord.user_id == current_user.id)
    if farm_id:
        query = query.filter(ProfitRecord.farm_id == farm_id)
    return query.order_by(ProfitRecord.created_at.desc()).all()

@router.post("", response_model=ProfitRecordResponse)
def create_profit_record(
    record_in: ProfitRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == record_in.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    area_acres = max(farm.area_acres, 0.1)
    revenue = round(record_in.production_qty_kg * record_in.selling_price_per_kg, 2)
    net_profit = round(revenue - record_in.total_expenses, 2)
    
    cost_per_acre = round(record_in.total_expenses / area_acres, 2)
    revenue_per_acre = round(revenue / area_acres, 2)
    profit_per_acre = round(net_profit / area_acres, 2)
    
    break_even_price = round(record_in.total_expenses / record_in.production_qty_kg, 2) if record_in.production_qty_kg > 0 else 0.0

    new_record = ProfitRecord(
        user_id=current_user.id,
        farm_id=record_in.farm_id,
        crop_name=record_in.crop_name,
        harvest_date=record_in.harvest_date,
        production_qty_kg=record_in.production_qty_kg,
        selling_price_per_kg=record_in.selling_price_per_kg,
        revenue=revenue,
        total_expenses=record_in.total_expenses,
        net_profit=net_profit,
        area_acres=area_acres,
        cost_per_acre=cost_per_acre,
        revenue_per_acre=revenue_per_acre,
        profit_per_acre=profit_per_acre,
        break_even_price_per_kg=break_even_price,
        notes=record_in.notes
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@router.delete("/{record_id}")
def delete_profit_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(ProfitRecord).filter(ProfitRecord.id == record_id, ProfitRecord.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Profit record not found")
    db.delete(record)
    db.commit()
    return {"message": "Profit record deleted successfully"}
