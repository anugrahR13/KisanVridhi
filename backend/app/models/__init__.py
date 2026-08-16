import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    display_name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    preferred_language = Column(String, default="English")
    role = Column(String, default="farmer")  # "farmer" or "admin"
    
    # Gamification and Stats
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    sustainability_score = Column(Float, default=50.0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    farms = relationship("Farm", back_populates="user", cascade="all, delete-orphan")
    mission_progresses = relationship("MissionProgress", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    user_badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    xp_transactions = relationship("XPTransaction", back_populates="user", cascade="all, delete-orphan")
    verifications = relationship("ImageVerification", back_populates="user", cascade="all, delete-orphan")
    sustainability_history = relationship("SustainabilityScoreHistory", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("AIChatMessage", back_populates="user", cascade="all, delete-orphan")
    disease_diagnoses = relationship("DiseaseDiagnosis", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("FarmExpense", back_populates="user", cascade="all, delete-orphan")
    profit_records = relationship("ProfitRecord", back_populates="user", cascade="all, delete-orphan")
    soil_records = relationship("SoilRecord", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("FarmTask", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("FarmDocument", back_populates="user", cascade="all, delete-orphan")


class DiseaseDiagnosis(Base):
    __tablename__ = "disease_diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    crop_detected = Column(String, nullable=False)
    disease_name = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    severity = Column(String, nullable=False)
    organic_treatment = Column(Text, nullable=False)
    chemical_treatment = Column(Text, nullable=False)
    preventive_measure = Column(Text, nullable=False)
    recommended_quest = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="disease_diagnoses")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    area_acres = Column(Float, nullable=False)
    soil_type = Column(String, nullable=False)  # Clay, Loamy, Sandy, Black, Silt, Alluvial
    irrigation_type = Column(String, nullable=False)  # Drip, Sprinkler, Ditch/Flood, Rainfed, Canal, Tube well
    water_source = Column(String, nullable=False)  # Borewell, River, Rainwater Harvesting, Canal, Pond
    primary_crop = Column(String, nullable=False)
    secondary_crops = Column(Text, nullable=True)  # Comma separated
    farming_experience = Column(String, nullable=True)  # <1 year, 1-5 years, 5-10 years, 10+ years
    current_practices = Column(Text, nullable=True)  # Comma separated practices
    season = Column(String, nullable=True, default="Kharif")  # Kharif, Rabi, Zaid
    sowing_date = Column(String, nullable=True)
    expected_harvest_date = Column(String, nullable=True)
    farming_goals = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="farms")
    crops = relationship("Crop", back_populates="farm", cascade="all, delete-orphan")
    practices = relationship("FarmingPractice", back_populates="farm", cascade="all, delete-orphan")
    mission_progresses = relationship("MissionProgress", back_populates="farm")
    recommendations = relationship("Recommendation", back_populates="farm")
    expenses = relationship("FarmExpense", back_populates="farm", cascade="all, delete-orphan")
    profit_records = relationship("ProfitRecord", back_populates="farm", cascade="all, delete-orphan")
    soil_records = relationship("SoilRecord", back_populates="farm", cascade="all, delete-orphan")
    tasks = relationship("FarmTask", back_populates="farm", cascade="all, delete-orphan")
    documents = relationship("FarmDocument", back_populates="farm", cascade="all, delete-orphan")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop_name = Column(String, nullable=False)
    variety = Column(String, nullable=True)
    area_acres = Column(Float, nullable=True)
    planting_date = Column(String, nullable=True)
    expected_harvest_date = Column(String, nullable=True)
    status = Column(String, default="active")  # active, harvested, planned

    farm = relationship("Farm", back_populates="crops")


class PracticeCategory(Base):
    __tablename__ = "practice_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String, nullable=False)  # Lucide icon name

    missions = relationship("Mission", back_populates="category")
    practices = relationship("FarmingPractice", back_populates="category")
    recommendations = relationship("Recommendation", back_populates="category")


class FarmingPractice(Base):
    __tablename__ = "farming_practices"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("practice_categories.id"), nullable=False)
    practice_name = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farm = relationship("Farm", back_populates="practices")
    category = relationship("PracticeCategory", back_populates="practices")


class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("practice_categories.id"), nullable=False)
    difficulty = Column(String, default="Medium")  # Easy, Medium, Hard
    xp_reward = Column(Integer, nullable=False)
    duration_days = Column(Integer, default=7)
    requires_image = Column(Boolean, default=False)
    expected_practice_label = Column(String, nullable=True)  # For CV verifier matching
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    category = relationship("PracticeCategory", back_populates="missions")
    progresses = relationship("MissionProgress", back_populates="mission")


class MissionProgress(Base):
    __tablename__ = "mission_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    status = Column(String, default="started")  # started, pending_verification, completed
    image_url = Column(String, nullable=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="mission_progresses")
    farm = relationship("Farm", back_populates="mission_progresses")
    mission = relationship("Mission", back_populates="progresses")
    verifications = relationship("ImageVerification", back_populates="mission_progress")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("practice_categories.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    priority = Column(String, default="medium")  # high, medium, low
    estimated_impact = Column(String, nullable=False)
    difficulty = Column(String, default="Medium")
    related_mission_id = Column(Integer, ForeignKey("missions.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="recommendations")
    farm = relationship("Farm", back_populates="recommendations")
    category = relationship("PracticeCategory", back_populates="recommendations")


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=False)
    icon_name = Column(String, nullable=False)
    xp_reward = Column(Integer, default=50)
    requirement_type = Column(String, nullable=False)  # mission_count, score_threshold, practice_category
    requirement_value = Column(String, nullable=False)

    user_badges = relationship("UserBadge", back_populates="badge")


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False)
    awarded_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="user_badges")
    badge = relationship("Badge", back_populates="user_badges")


class XPTransaction(Base):
    __tablename__ = "xp_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    source_type = Column(String, nullable=False)  # mission, practice_verification, level_up, badge
    source_id = Column(Integer, nullable=True)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="xp_transactions")


class ImageVerification(Base):
    __tablename__ = "image_verifications"

    id = Column(Integer, primary_key=True, index=True)
    mission_progress_id = Column(Integer, ForeignKey("mission_progress.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_path = Column(String, nullable=False)
    detected_practice = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    verification_status = Column(String, default="approved")  # approved, rejected, pending_review
    review_notes = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission_progress = relationship("MissionProgress", back_populates="verifications")
    user = relationship("User", back_populates="verifications")


class SustainabilityScoreHistory(Base):
    __tablename__ = "sustainability_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    overall_score = Column(Float, nullable=False)
    water_score = Column(Float, nullable=False)
    soil_score = Column(Float, nullable=False)
    waste_score = Column(Float, nullable=False)
    diversity_score = Column(Float, nullable=False)
    resource_score = Column(Float, nullable=False)
    calculated_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="sustainability_history")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, success, warning, badge, level
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")



class AIChatMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    role = Column(String, nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    sources_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")


class GovernmentAuction(Base):
    __tablename__ = "government_auctions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    crop_type = Column(String, nullable=False)
    msp_price_per_quintal = Column(Float, nullable=False)
    min_sustainability_score_required = Column(Float, default=60.0)
    location_region = Column(String, nullable=False)
    deadline_date = Column(String, nullable=False)
    procurement_agency = Column(String, default="FCI / State Agriculture Board")
    status = Column(String, default="Open")  # Open, Closed


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name = Column(String, nullable=False)
    author_level = Column(Integer, default=1)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, default="General Eco Farming")
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")


class RewardItem(Base):
    __tablename__ = "reward_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # Seeds & Inputs, Equipment, Services, Training
    points_cost = Column(Integer, nullable=False)
    sponsor_agency = Column(String, default="National Bio-Farming Board")
    voucher_code_prefix = Column(String, default="ECO")
    image_icon = Column(String, default="Gift")
    inventory_count = Column(Integer, default=100)
    is_active = Column(Boolean, default=True)


class UserRewardRedemption(Base):
    __tablename__ = "user_redemptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reward_id = Column(Integer, ForeignKey("reward_items.id"), nullable=False)
    points_spent = Column(Integer, nullable=False)
    voucher_code = Column(String, unique=True, nullable=False)
    status = Column(String, default="Active")  # Active, Used, Expired
    redeemed_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
    reward = relationship("RewardItem")


class FarmExpense(Base):
    __tablename__ = "farm_expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop_name = Column(String, nullable=True)
    category = Column(String, nullable=False)  # Seeds, Fertilizer, Labour, Irrigation, Electricity, Machinery, Transport, Pesticides, Other
    amount = Column(Float, nullable=False)
    expense_date = Column(String, nullable=False)  # YYYY-MM-DD
    description = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="expenses")
    farm = relationship("Farm", back_populates="expenses")


class ProfitRecord(Base):
    __tablename__ = "profit_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop_name = Column(String, nullable=False)
    harvest_date = Column(String, nullable=False)
    production_qty_kg = Column(Float, nullable=False)
    selling_price_per_kg = Column(Float, nullable=False)
    revenue = Column(Float, nullable=False)
    total_expenses = Column(Float, nullable=False)
    net_profit = Column(Float, nullable=False)
    area_acres = Column(Float, nullable=False)
    cost_per_acre = Column(Float, nullable=False)
    revenue_per_acre = Column(Float, nullable=False)
    profit_per_acre = Column(Float, nullable=False)
    break_even_price_per_kg = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profit_records")
    farm = relationship("Farm", back_populates="profit_records")


class SoilRecord(Base):
    __tablename__ = "soil_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    ph = Column(Float, nullable=True)
    nitrogen_ppm = Column(Float, nullable=True)
    phosphorus_ppm = Column(Float, nullable=True)
    potassium_ppm = Column(Float, nullable=True)
    organic_carbon_percent = Column(Float, nullable=True)
    soil_type = Column(String, nullable=False)
    moisture_percent = Column(Float, nullable=True)
    tested_at = Column(String, nullable=False)  # YYYY-MM-DD
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="soil_records")
    farm = relationship("Farm", back_populates="soil_records")


class FarmTask(Base):
    __tablename__ = "farm_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, default="General")  # Irrigation, Pest Control, Soil Care, Harvest, Mission
    due_date = Column(String, nullable=False)
    priority = Column(String, default="medium")  # high, medium, low
    status = Column(String, default="pending")  # pending, completed
    source = Column(String, default="user")  # user, recommendation, mission, weather_alert
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="tasks")
    farm = relationship("Farm", back_populates="tasks")


class WeatherSnapshot(Base):
    __tablename__ = "weather_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, index=True, nullable=False)
    temperature_c = Column(Float, nullable=False)
    humidity_percent = Column(Float, nullable=False)
    rain_probability_percent = Column(Float, nullable=False)
    wind_speed_kmh = Column(Float, nullable=False)
    condition_text = Column(String, nullable=False)
    forecast_json = Column(JSON, nullable=True)
    severe_warning = Column(String, nullable=True)
    fetched_at = Column(DateTime, default=datetime.datetime.utcnow)


class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    state = Column(String, nullable=False)  # All India, Punjab, Haryana, UP, Maharashtra, MP, AP, Telangana, etc.
    applicable_crops = Column(String, nullable=False)  # All, Wheat, Rice, Cotton, Pulses, Vegetables
    category = Column(String, nullable=False)  # Subsidy, Insurance, Equipment, Organic Farming, Irrigation
    eligibility = Column(Text, nullable=False)
    benefits = Column(Text, nullable=False)
    required_documents = Column(Text, nullable=False)
    application_process = Column(Text, nullable=False)
    official_source_link = Column(String, nullable=False)
    last_verified_date = Column(String, nullable=False)


class FarmDocument(Base):
    __tablename__ = "farm_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Soil Report, Bill/Receipt, Insurance, Certificate, Scheme Doc, Other
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="documents")
    farm = relationship("Farm", back_populates="documents")


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    market_name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    crop_name = Column(String, nullable=False)
    variety = Column(String, nullable=True)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    unit = Column(String, default="Rs / Quintal")
    price_date = Column(String, nullable=False)
    source = Column(String, default="Agmarknet / State Mandi Board")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)



