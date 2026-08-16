from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.database.session import get_db
from app.models import FarmExpense, Farm, User
from app.schemas import FarmExpenseCreate, FarmExpenseResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.get("", response_model=List[FarmExpenseResponse])
def get_expenses(
    farm_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FarmExpense).filter(FarmExpense.user_id == current_user.id)
    if farm_id:
        query = query.filter(FarmExpense.farm_id == farm_id)
    if category:
        query = query.filter(FarmExpense.category == category)
    return query.order_by(FarmExpense.expense_date.desc()).all()

@router.post("", response_model=FarmExpenseResponse)
def create_expense(
    expense_in: FarmExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == expense_in.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    new_expense = FarmExpense(
        user_id=current_user.id,
        farm_id=expense_in.farm_id,
        crop_name=expense_in.crop_name or farm.primary_crop,
        category=expense_in.category,
        amount=expense_in.amount,
        expense_date=expense_in.expense_date,
        description=expense_in.description,
        notes=expense_in.notes
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(FarmExpense).filter(FarmExpense.id == expense_id, FarmExpense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}

@router.get("/summary")
def get_expense_summary(
    farm_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FarmExpense).filter(FarmExpense.user_id == current_user.id)
    if farm_id:
        query = query.filter(FarmExpense.farm_id == farm_id)
    
    expenses = query.all()
    total_amount = sum(e.amount for e in expenses)
    
    # Category totals
    category_totals = {}
    for e in expenses:
        category_totals[e.category] = category_totals.get(e.category, 0.0) + e.amount
        
    category_breakdown = [{"category": cat, "total": round(amt, 2)} for cat, amt in category_totals.items()]

    return {
        "total_expenses": round(total_amount, 2),
        "total_count": len(expenses),
        "category_breakdown": category_breakdown
    }
