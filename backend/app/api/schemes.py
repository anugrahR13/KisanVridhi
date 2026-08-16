from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models import GovernmentScheme
from app.schemas import GovernmentSchemeResponse

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])

@router.get("", response_model=List[GovernmentSchemeResponse])
def get_government_schemes(
    state: Optional[str] = None,
    crop: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(GovernmentScheme)
    
    if state and state.lower() != "all":
        query = query.filter(
            (GovernmentScheme.state.ilike(f"%{state}%")) | 
            (GovernmentScheme.state == "All India")
        )
    if crop and crop.lower() != "all":
        query = query.filter(
            (GovernmentScheme.applicable_crops.ilike(f"%{crop}%")) | 
            (GovernmentScheme.applicable_crops == "All")
        )
    if category and category.lower() != "all":
        query = query.filter(GovernmentScheme.category.ilike(f"%{category}%"))

    return query.order_by(GovernmentScheme.id.asc()).all()

@router.get("/{scheme_id}", response_model=GovernmentSchemeResponse)
def get_scheme_detail(scheme_id: int, db: Session = Depends(get_db)):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Government scheme not found")
    return scheme
