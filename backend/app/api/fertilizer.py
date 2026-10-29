import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict
from app.database.session import get_db
from app.models import User, Farm, SoilRecord
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/fertilizer", tags=["Precision Fertilizer & NPK Optimizer"])

class FertilizerRequest(BaseModel):
    crop_name: str
    area_acres: float
    farm_id: Optional[int] = None
    soil_ph: Optional[float] = 6.8
    nitrogen_ppm: Optional[float] = 160.0
    phosphorus_ppm: Optional[float] = 35.0
    potassium_ppm: Optional[float] = 190.0
    organic_carbon_pct: Optional[float] = 0.65
    target_yield_qtl: Optional[float] = None

class NutrientRequirement(BaseModel):
    n_kg_per_acre: float
    p2o5_kg_per_acre: float
    k2o_kg_per_acre: float
    total_n_kg: float
    total_p2o5_kg: float
    total_k2o_kg: float

class CommercialBags(BaseModel):
    dap_bags: float           # 50 kg bag (18% N, 46% P2O5)
    urea_bags: float          # 45 kg bag (46% N)
    mop_bags: float           # 50 kg bag (60% K2O)
    dap_weight_kg: float
    urea_weight_kg: float
    mop_weight_kg: float
    estimated_cost_inr: float
    customary_cost_inr: float
    estimated_savings_inr: float

class ApplicationStage(BaseModel):
    stage_name: str
    timing: str
    dap_bags: float
    urea_bags: float
    mop_bags: float
    instructions: str

class OrganicAlternative(BaseModel):
    item_name: str
    dosage: str
    benefit: str

class FertilizerResponse(BaseModel):
    crop_name: str
    area_acres: float
    soil_status: Dict[str, str]
    nutrient_requirements: NutrientRequirement
    commercial_bags: CommercialBags
    application_schedule: List[ApplicationStage]
    organic_alternatives: List[OrganicAlternative]
    agronomic_advisory: List[str]

# ICAR Standard Recommended Doses of Fertilizer (RDF) in kg per Acre
# Format: (N, P2O5, K2O)
CROP_RDF_PER_ACRE: Dict[str, Dict[str, float]] = {
    "wheat": {"n": 50.0, "p": 25.0, "k": 16.0, "customary_urea_multiplier": 1.4},
    "rice": {"n": 50.0, "p": 24.0, "k": 20.0, "customary_urea_multiplier": 1.5},
    "paddy": {"n": 50.0, "p": 24.0, "k": 20.0, "customary_urea_multiplier": 1.5},
    "cotton": {"n": 60.0, "p": 25.0, "k": 25.0, "customary_urea_multiplier": 1.4},
    "maize": {"n": 48.0, "p": 24.0, "k": 16.0, "customary_urea_multiplier": 1.35},
    "mustard": {"n": 32.0, "p": 16.0, "k": 16.0, "customary_urea_multiplier": 1.3},
    "potato": {"n": 60.0, "p": 40.0, "k": 40.0, "customary_urea_multiplier": 1.3},
    "sugarcane": {"n": 100.0, "p": 35.0, "k": 35.0, "customary_urea_multiplier": 1.5},
    "pulses": {"n": 10.0, "p": 20.0, "k": 10.0, "customary_urea_multiplier": 1.6},
    "gram": {"n": 10.0, "p": 20.0, "k": 10.0, "customary_urea_multiplier": 1.6},
    "vegetables": {"n": 45.0, "p": 25.0, "k": 25.0, "customary_urea_multiplier": 1.35},
    "default": {"n": 45.0, "p": 22.0, "k": 18.0, "customary_urea_multiplier": 1.4}
}

# Subsidized Indian Market Retail Bag Prices (INR)
PRICE_PER_BAG = {
    "dap_50kg": 1350.0,
    "urea_45kg": 267.0,
    "mop_50kg": 1700.0
}

@router.post("/optimize", response_model=FertilizerResponse)
def calculate_optimal_fertilizer(
    payload: FertilizerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    crop_key = payload.crop_name.strip().lower()
    rdf = None
    for k, v in CROP_RDF_PER_ACRE.items():
        if k in crop_key:
            rdf = v
            break
    if not rdf:
        rdf = CROP_RDF_PER_ACRE["default"]

    acres = max(0.1, payload.area_acres)

    # Soil adjustments based on test parameters
    soil_status = {}
    adj_n = 1.0
    adj_p = 1.0
    adj_k = 1.0

    # Nitrogen adjustment
    n_ppm = payload.nitrogen_ppm or 160.0
    if n_ppm < 140:
        soil_status["nitrogen"] = "Low (<140 ppm) - Boosted +20%"
        adj_n = 1.20
    elif n_ppm > 250:
        soil_status["nitrogen"] = "High (>250 ppm) - Reduced -20%"
        adj_n = 0.80
    else:
        soil_status["nitrogen"] = "Optimal (140-250 ppm) - Standard"

    # Phosphorus adjustment
    p_ppm = payload.phosphorus_ppm or 35.0
    if p_ppm < 20:
        soil_status["phosphorus"] = "Low (<20 ppm) - Boosted +20%"
        adj_p = 1.20
    elif p_ppm > 50:
        soil_status["phosphorus"] = "High (>50 ppm) - Reduced -20%"
        adj_p = 0.80
    else:
        soil_status["phosphorus"] = "Optimal (20-50 ppm) - Standard"

    # Potassium adjustment
    k_ppm = payload.potassium_ppm or 190.0
    if k_ppm < 120:
        soil_status["potassium"] = "Low (<120 ppm) - Boosted +20%"
        adj_k = 1.20
    elif k_ppm > 280:
        soil_status["potassium"] = "High (>280 ppm) - Reduced -20%"
        adj_k = 0.80
    else:
        soil_status["potassium"] = "Optimal (120-280 ppm) - Standard"

    # Net required nutrients per acre and total
    n_per_acre = round(rdf["n"] * adj_n, 1)
    p_per_acre = round(rdf["p"] * adj_p, 1)
    k_per_acre = round(rdf["k"] * adj_k, 1)

    total_n_required = n_per_acre * acres
    total_p_required = p_per_acre * acres
    total_k_required = k_per_acre * acres

    # Commercial Fertilizer Bag Calculations:
    # 1) Supply P2O5 via DAP: 1 bag DAP (50kg) = 23 kg P2O5 and 9 kg N
    dap_bags = round(total_p_required / 23.0, 1) if total_p_required > 0 else 0.0
    n_supplied_by_dap = dap_bags * 9.0

    # 2) Remaining Nitrogen supplied via Urea: 1 bag Urea (45kg) = 20.7 kg N
    remaining_n = max(0.0, total_n_required - n_supplied_by_dap)
    urea_bags = round(remaining_n / 20.7, 1)

    # 3) Potassium supplied via MOP: 1 bag MOP (50kg) = 30.0 kg K2O
    mop_bags = round(total_k_required / 30.0, 1) if total_k_required > 0 else 0.0

    # Financial Estimates
    cost_dap = dap_bags * PRICE_PER_BAG["dap_50kg"]
    cost_urea = urea_bags * PRICE_PER_BAG["urea_45kg"]
    cost_mop = mop_bags * PRICE_PER_BAG["mop_50kg"]
    total_opt_cost = round(cost_dap + cost_urea + cost_mop, 2)

    # Customary Over-fertilization Comparison (Farmers typically overdose Urea by 40-60%)
    customary_urea_bags = round(urea_bags * rdf["customary_urea_multiplier"], 1)
    customary_cost = round(cost_dap + (customary_urea_bags * PRICE_PER_BAG["urea_45kg"]) + cost_mop, 2)
    savings = max(0.0, round(customary_cost - total_opt_cost, 2))

    # Application Split Schedule
    # Basal: 100% DAP, 100% MOP, 33% Urea
    basal_urea = round(urea_bags * 0.33, 1)
    top1_urea = round(urea_bags * 0.33, 1)
    top2_urea = round(urea_bags - basal_urea - top1_urea, 1)

    schedule = [
        ApplicationStage(
            stage_name="Basal Dressing (At Sowing / Transplanting)",
            timing="Day 0 — Field preparation & sowing",
            dap_bags=dap_bags,
            urea_bags=basal_urea,
            mop_bags=mop_bags,
            instructions="Broadcast full DAP and MOP with 1/3rd Urea at time of last plowing or drilling near the seed zone (3-5 cm below seed)."
        ),
        ApplicationStage(
            stage_name="1st Top-Dressing (Crown Root / Active Tillering)",
            timing="Day 21 - 25 — Immediately before first irrigation",
            dap_bags=0.0,
            urea_bags=top1_urea,
            mop_bags=0.0,
            instructions="Top dress Urea evenly across the field when leaves are dry, followed immediately by light irrigation."
        ),
        ApplicationStage(
            stage_name="2nd Top-Dressing (Panicle Initiation / Pre-Flowering)",
            timing="Day 45 - 55 — Pre-flowering stage",
            dap_bags=0.0,
            urea_bags=top2_urea,
            mop_bags=0.0,
            instructions="Apply final Urea dose. Avoid application if heavy rain is forecast within 24 hours to prevent leaching."
        )
    ]

    organic_alternatives = [
        OrganicAlternative(
            item_name="Well-Decomposed Vermicompost",
            dosage=f"{round(1.5 * acres, 1)} - {round(2.0 * acres, 1)} Tonnes total",
            benefit="Improves soil organic carbon, moisture retention, and provides micronutrients (Zn, Fe, Mn)."
        ),
        OrganicAlternative(
            item_name="Bio-NPK Consortia (Azotobacter + PSB + KSB)",
            dosage="1 Litre / acre mixed with 50kg farmyard manure or via drip irrigation",
            benefit="Fixes 20-25 kg atmospheric Nitrogen and solubilizes fixed soil phosphorus naturally."
        ),
        OrganicAlternative(
            item_name="Neem Seed Cake Top-Dressing",
            dosage=f"{round(100 * acres)} kg total at basal stage",
            benefit="Acts as a natural nitrification inhibitor, slowing down nitrogen loss and repelling soil nematodes."
        )
    ]

    advisories = [
        f"For {payload.crop_name} across {acres} acres, precision dosage uses {urea_bags} bags Urea, {dap_bags} bags DAP, and {mop_bags} bags MOP.",
        f"Soil test integration avoided over-application, saving an estimated ₹{savings:,.0f} compared to conventional broadcast rates.",
        "Always use Neem-Coated Urea (NCU) to maximize nitrogen use efficiency (NUE) by 15-20%.",
        "If soil pH is above 7.8, consider blending 25 kg elemental sulfur per acre to enhance phosphorus uptake."
    ]

    return FertilizerResponse(
        crop_name=payload.crop_name,
        area_acres=acres,
        soil_status=soil_status,
        nutrient_requirements=NutrientRequirement(
            n_kg_per_acre=n_per_acre,
            p2o5_kg_per_acre=p_per_acre,
            k2o_kg_per_acre=k_per_acre,
            total_n_kg=round(total_n_required, 1),
            total_p2o5_kg=round(total_p_required, 1),
            total_k2o_kg=round(total_k_required, 1)
        ),
        commercial_bags=CommercialBags(
            dap_bags=dap_bags,
            urea_bags=urea_bags,
            mop_bags=mop_bags,
            dap_weight_kg=round(dap_bags * 50.0, 1),
            urea_weight_kg=round(urea_bags * 45.0, 1),
            mop_weight_kg=round(mop_bags * 50.0, 1),
            estimated_cost_inr=total_opt_cost,
            customary_cost_inr=customary_cost,
            estimated_savings_inr=savings
        ),
        application_schedule=schedule,
        organic_alternatives=organic_alternatives,
        agronomic_advisory=advisories
    )
