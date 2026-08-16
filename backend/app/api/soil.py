from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models import SoilRecord, Farm, User
from app.schemas import SoilRecordCreate, SoilRecordResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/soil", tags=["Soil Health"])

@router.get("", response_model=List[SoilRecordResponse])
def get_soil_records(
    farm_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(SoilRecord).filter(SoilRecord.user_id == current_user.id)
    if farm_id:
        query = query.filter(SoilRecord.farm_id == farm_id)
    return query.order_by(SoilRecord.created_at.desc()).all()

@router.post("", response_model=SoilRecordResponse)
def create_soil_record(
    soil_in: SoilRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == soil_in.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    new_record = SoilRecord(
        user_id=current_user.id,
        farm_id=soil_in.farm_id,
        ph=soil_in.ph,
        nitrogen_ppm=soil_in.nitrogen_ppm,
        phosphorus_ppm=soil_in.phosphorus_ppm,
        potassium_ppm=soil_in.potassium_ppm,
        organic_carbon_percent=soil_in.organic_carbon_percent,
        soil_type=soil_in.soil_type or farm.soil_type,
        moisture_percent=soil_in.moisture_percent,
        tested_at=soil_in.tested_at,
        notes=soil_in.notes
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@router.get("/guidance/{soil_id}")
def get_soil_guidance(
    soil_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(SoilRecord).filter(SoilRecord.id == soil_id, SoilRecord.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Soil record not found")

    suggestions = []
    
    # pH evaluation
    if record.ph is not None:
        if record.ph < 6.0:
            suggestions.append({
                "nutrient": "pH (Acidic)",
                "observation": f"Soil pH is acidic ({record.ph}).",
                "recommendation": "Apply agricultural lime (calcium carbonate) or wood ash to raise pH gradually. Integrate organic compost to buffer soil acidity."
            })
        elif record.ph > 7.8:
            suggestions.append({
                "nutrient": "pH (Alkaline)",
                "observation": f"Soil pH is alkaline ({record.ph}).",
                "recommendation": "Incorporate organic matter, gypsum, or elemental sulfur. Avoid over-irrigation with hard water."
            })
        else:
            suggestions.append({
                "nutrient": "pH (Optimal)",
                "observation": f"Soil pH is neutral/optimal ({record.ph}).",
                "recommendation": "Maintain current organic manuring practices to preserve soil reaction."
            })

    # Organic Carbon evaluation
    if record.organic_carbon_percent is not None:
        if record.organic_carbon_percent < 0.5:
            suggestions.append({
                "nutrient": "Organic Carbon (Low)",
                "observation": f"Soil organic carbon is low ({record.organic_carbon_percent}%).",
                "recommendation": "Add 5-10 tonnes/acre of well-decomposed FYM or vermicompost. Practice green manuring with Sesbania (Dhaincha) or Sunn hemp."
            })
        else:
            suggestions.append({
                "nutrient": "Organic Carbon (Good)",
                "observation": f"Soil organic carbon level is healthy ({record.organic_carbon_percent}%).",
                "recommendation": "Continue crop residue retention and reduced tillage to maintain soil carbon stocks."
            })

    # Nitrogen evaluation
    if record.nitrogen_ppm is not None:
        if record.nitrogen_ppm < 140:
            suggestions.append({
                "nutrient": "Nitrogen",
                "observation": f"Available Nitrogen is deficient ({record.nitrogen_ppm} ppm).",
                "recommendation": "Incorporate Azotobacter/Rhizobium biofertilizers and rotate with legume crops (Pulse/Chickpea)."
            })

    return {
        "record": record,
        "educational_guidance": suggestions
    }
