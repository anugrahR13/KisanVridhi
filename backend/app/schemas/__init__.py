from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

# --- Auth & User Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str
    full_name: str
    location: str
    phone_number: Optional[str] = None
    preferred_language: Optional[str] = "English"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPRequest(BaseModel):
    phone_number: str

class OTPVerify(BaseModel):
    phone_number: str
    otp_code: str
    full_name: Optional[str] = "Farmer"
    location: Optional[str] = "India"

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    display_name: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    display_name: str
    location: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_language: str
    role: str
    xp: int
    level: int
    sustainability_score: float
    created_at: datetime

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    location: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_language: Optional[str] = None

# --- Crop & Farm Schemas ---
class CropCreate(BaseModel):
    crop_name: str
    variety: Optional[str] = None
    area_acres: Optional[float] = None
    planting_date: Optional[str] = None
    expected_harvest_date: Optional[str] = None
    status: Optional[str] = "active"

class CropResponse(CropCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int

class FarmCreate(BaseModel):
    farm_name: str
    location: str
    area_acres: float = Field(..., gt=0)
    soil_type: str
    irrigation_type: str
    water_source: str
    primary_crop: str
    secondary_crops: Optional[str] = None
    farming_experience: Optional[str] = None
    current_practices: Optional[str] = None
    season: Optional[str] = "Kharif"
    sowing_date: Optional[str] = None
    expected_harvest_date: Optional[str] = None
    farming_goals: Optional[str] = None

class FarmResponse(FarmCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    crops: List[CropResponse] = []
    created_at: datetime
    updated_at: datetime

# --- Practice Category & Practice Schemas ---
class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: str
    icon: str

class PracticeCreate(BaseModel):
    category_id: int
    practice_name: str
    details: Optional[str] = None

class PracticeResponse(PracticeCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
    created_at: datetime

# --- Mission Schemas ---
class MissionBase(BaseModel):
    title: str
    description: str
    category_id: int
    difficulty: str = "Medium"
    xp_reward: int
    duration_days: int = 7
    requires_image: bool = False
    expected_practice_label: Optional[str] = None

class MissionCreate(MissionBase):
    pass

class MissionResponse(MissionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: Optional[CategoryResponse] = None
    is_active: bool
    created_at: datetime

class MissionProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    farm_id: Optional[int] = None
    mission_id: int
    mission: Optional[MissionResponse] = None
    status: str
    image_url: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

# --- Recommendation Schemas ---
class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    farm_id: int
    category_id: int
    category: Optional[CategoryResponse] = None
    title: str
    description: str
    reason: str
    priority: str
    estimated_impact: str
    difficulty: str
    related_mission_id: Optional[int] = None
    is_read: bool = False
    created_at: datetime

# --- Gamification & Badges Schemas ---
class BadgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    icon_name: str
    xp_reward: int
    requirement_type: str
    requirement_value: str

class UserBadgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    badge: BadgeResponse
    awarded_at: datetime

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    display_name: str
    level: int
    xp: int
    sustainability_score: float
    badges_count: int

# --- Image Verification Schema ---
class ImageVerificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    mission_progress_id: int
    image_path: str
    detected_practice: str
    confidence_score: float
    verification_status: str
    review_notes: Optional[str] = None
    verified_at: datetime

# --- Sustainability Breakdown ---
class SustainabilityBreakdown(BaseModel):
    overall_score: float
    water_score: float
    soil_score: float
    waste_score: float
    diversity_score: float
    resource_score: float

# --- AI Assistant Schemas ---
class ChatRequest(BaseModel):
    message: str
    farm_id: Optional[int] = None

class SourceCitation(BaseModel):
    title: str
    source: str
    snippet: str

class ChatResponse(BaseModel):
    reply: str
    sources: List[SourceCitation] = []
    farm_context_used: Optional[str] = None

# --- Dashboard & Admin Stats ---
class FarmerDashboardStats(BaseModel):
    user: UserResponse
    sustainability_breakdown: SustainabilityBreakdown
    active_missions_count: int
    completed_missions_count: int
    total_badges_count: int
    recent_recommendations: List[RecommendationResponse]
    recent_activities: List[dict]

class AdminStats(BaseModel):
    total_users: int
    active_farmers: int
    total_farms: int
    total_missions: int
    completed_missions: int
    avg_sustainability_score: float
    popular_categories: List[dict]
    recent_verifications: List[ImageVerificationResponse]

# --- Farm Expense & Profitability Schemas ---
class FarmExpenseCreate(BaseModel):
    farm_id: int
    crop_name: Optional[str] = None
    category: str
    amount: float = Field(..., gt=0)
    expense_date: str
    description: str
    notes: Optional[str] = None

class FarmExpenseResponse(FarmExpenseCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime

class ProfitRecordCreate(BaseModel):
    farm_id: int
    crop_name: str
    harvest_date: str
    production_qty_kg: float = Field(..., gt=0)
    selling_price_per_kg: float = Field(..., gt=0)
    total_expenses: float = Field(..., ge=0)
    notes: Optional[str] = None

class ProfitRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    farm_id: int
    crop_name: str
    harvest_date: str
    production_qty_kg: float
    selling_price_per_kg: float
    revenue: float
    total_expenses: float
    net_profit: float
    area_acres: float
    cost_per_acre: float
    revenue_per_acre: float
    profit_per_acre: float
    break_even_price_per_kg: float
    notes: Optional[str] = None
    created_at: datetime

# --- Soil Health Schemas ---
class SoilRecordCreate(BaseModel):
    farm_id: int
    ph: Optional[float] = None
    nitrogen_ppm: Optional[float] = None
    phosphorus_ppm: Optional[float] = None
    potassium_ppm: Optional[float] = None
    organic_carbon_percent: Optional[float] = None
    soil_type: str
    moisture_percent: Optional[float] = None
    tested_at: str
    notes: Optional[str] = None

class SoilRecordResponse(SoilRecordCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime

# --- Farm Task Schemas ---
class FarmTaskCreate(BaseModel):
    farm_id: Optional[int] = None
    title: str
    description: str
    category: Optional[str] = "General"
    due_date: str
    priority: Optional[str] = "medium"
    source: Optional[str] = "user"

class FarmTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class FarmTaskResponse(FarmTaskCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: str
    created_at: datetime

# --- Weather Schemas ---
class WeatherResponse(BaseModel):
    location: str
    temperature_c: float
    humidity_percent: float
    rain_probability_percent: float
    wind_speed_kmh: float
    condition_text: str
    severe_warning: Optional[str] = None
    platform_interpretation: str
    forecast: List[dict] = []
    source: str = "Open-Meteo Weather API"
    last_updated: datetime

# --- Government Scheme Schemas ---
class GovernmentSchemeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    state: str
    applicable_crops: str
    category: str
    eligibility: str
    benefits: str
    required_documents: str
    application_process: str
    official_source_link: str
    last_verified_date: str

# --- Farm Document Schemas ---
class FarmDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    farm_id: Optional[int] = None
    title: str
    category: str
    file_path: str
    file_type: str
    file_size_bytes: int
    uploaded_at: datetime

# --- Market Price Schemas ---
class MarketPriceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    market_name: str
    state: str
    district: str
    crop_name: str
    variety: Optional[str] = None
    min_price: float
    max_price: float
    modal_price: float
    unit: str
    price_date: str
    source: str
    updated_at: datetime

