import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database.session import get_db, Base
from app.auth.security import get_password_hash

# Setup test SQLite database in memory
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_sustainable_farming.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Ensure seed categories exist in test DB
    from app.models import PracticeCategory, Mission
    if db.query(PracticeCategory).count() == 0:
        c1 = PracticeCategory(name="Water Conservation", slug="water-conservation", description="Water management", icon="Droplets")
        c2 = PracticeCategory(name="Soil Health", slug="soil-health", description="Soil carbon", icon="Sprout")
        db.add(c1)
        db.add(c2)
        db.commit()
        db.refresh(c1)
        m1 = Mission(title="Test Water Mission", description="Test mission", category_id=c1.id, xp_reward=100, requires_image=False)
        db.add(m1)
        db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_user_registration_and_login():
    reg_payload = {
        "email": "testfarmer@example.com",
        "password": "Password123",
        "confirm_password": "Password123",
        "full_name": "Test Farmer",
        "location": "Punjab",
        "preferred_language": "English"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "farmer"

    # Test login
    login_payload = {
        "email": "testfarmer@example.com",
        "password": "Password123"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]

    # Test protected /me endpoint
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "testfarmer@example.com"

def test_farm_creation_and_recommendations():
    # Register user
    reg_payload = {
        "email": "farmuser@example.com",
        "password": "Password123",
        "confirm_password": "Password123",
        "full_name": "Farm Tester",
        "location": "Haryana",
        "preferred_language": "English"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    token = res_reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create farm profile
    farm_payload = {
        "farm_name": "Green Acres",
        "location": "Karnal, Haryana",
        "area_acres": 5.0,
        "soil_type": "Loamy",
        "irrigation_type": "Flood Irrigation",
        "water_source": "Borewell",
        "primary_crop": "Wheat",
        "secondary_crops": "Mustard",
        "farming_experience": "1-5 years",
        "current_practices": "Mulching"
    }
    res_farm = client.post("/api/farms", json=farm_payload, headers=headers)
    assert res_farm.status_code == 201
    farm_data = res_farm.json()
    assert farm_data["farm_name"] == "Green Acres"
    farm_id = farm_data["id"]

    # Fetch recommendations
    res_recs = client.get("/api/recommendations", headers=headers)
    assert res_recs.status_code == 200
    recs = res_recs.json()
    assert len(recs) > 0
    # Flood irrigation should trigger Drip Irrigation recommendation
    titles = [r["title"] for r in recs]
    assert any("Drip" in t for t in titles)

def test_mission_lifecycle_and_xp():
    reg_payload = {
        "email": "missionuser@example.com",
        "password": "Password123",
        "confirm_password": "Password123",
        "full_name": "Mission Tester",
        "location": "UP",
        "preferred_language": "English"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    token = res_reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List missions
    res_m = client.get("/api/missions")
    assert res_m.status_code == 200
    missions = res_m.json()
    assert len(missions) > 0
    mission_id = missions[0]["id"]

    # Start mission
    res_start = client.post(f"/api/missions/{mission_id}/start", headers=headers)
    assert res_start.status_code == 200

    # Complete mission
    res_comp = client.post(f"/api/missions/{mission_id}/complete", headers=headers)
    assert res_comp.status_code == 200
    data_comp = res_comp.json()
    assert data_comp["xp_earned"] == 100

def test_cv_vision_verifier():
    from app.ai.vision_verifier import SustainablePracticeVisionVerifier
    import tempfile
    from PIL import Image

    # Create temporary test image
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        img = Image.new("RGB", (200, 200), color=(34, 139, 34)) # Green image
        img.save(tmp.name)
        tmp_path = tmp.name

    try:
        result = SustainablePracticeVisionVerifier.verify_practice_image(
            image_path=tmp_path,
            expected_practice="Cover Crops"
        )
        assert result["detected_practice"] is not None
        assert "confidence_score" in result
        assert result["confidence_score"] > 0.5
    finally:
        import os
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

def test_farm_expenses_and_profitability():
    reg_payload = {
        "email": "module_farmer@example.com",
        "password": "Password123",
        "confirm_password": "Password123",
        "full_name": "Module Farmer",
        "location": "Punjab",
        "preferred_language": "English"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    token = res_reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create farm
    farm_resp = client.post("/api/farms", json={
        "farm_name": "Green Valley Acres",
        "location": "Ludhiana, Punjab",
        "area_acres": 5.0,
        "soil_type": "Loamy",
        "irrigation_type": "Drip",
        "water_source": "Borewell",
        "primary_crop": "Wheat",
        "season": "Rabi"
    }, headers=headers)
    assert farm_resp.status_code == 201
    farm_id = farm_resp.json()["id"]

    # Create expense
    exp_resp = client.post("/api/expenses", json={
        "farm_id": farm_id,
        "category": "Seeds",
        "amount": 3500.0,
        "expense_date": "2026-08-10",
        "description": "Certified Wheat Seeds HD-2967"
    }, headers=headers)
    assert exp_resp.status_code == 200
    assert exp_resp.json()["amount"] == 3500.0

    # Get expense summary
    summary_resp = client.get("/api/expenses/summary", headers=headers)
    assert summary_resp.status_code == 200
    assert summary_resp.json()["total_expenses"] == 3500.0

    # Create profit record
    prof_resp = client.post("/api/profitability", json={
        "farm_id": farm_id,
        "crop_name": "Wheat",
        "harvest_date": "2026-04-15",
        "production_qty_kg": 4000.0,
        "selling_price_per_kg": 23.5,
        "total_expenses": 35000.0
    }, headers=headers)
    assert prof_resp.status_code == 200
    assert prof_resp.json()["revenue"] == 94000.0
    assert prof_resp.json()["net_profit"] == 59000.0

def test_soil_and_tasks():
    reg_payload = {
        "email": "soil_farmer@example.com",
        "password": "Password123",
        "confirm_password": "Password123",
        "full_name": "Soil Farmer",
        "location": "Haryana",
        "preferred_language": "English"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    token = res_reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    farm_resp = client.post("/api/farms", json={
        "farm_name": "Soil Acres",
        "location": "Karnal",
        "area_acres": 4.0,
        "soil_type": "Loamy",
        "irrigation_type": "Sprinkler",
        "water_source": "Canal",
        "primary_crop": "Rice"
    }, headers=headers)
    farm_id = farm_resp.json()["id"]

    # Soil Record
    soil_resp = client.post("/api/soil", json={
        "farm_id": farm_id,
        "ph": 6.8,
        "nitrogen_ppm": 160.0,
        "phosphorus_ppm": 32.0,
        "potassium_ppm": 210.0,
        "organic_carbon_percent": 0.65,
        "soil_type": "Loamy",
        "tested_at": "2026-08-01"
    }, headers=headers)
    assert soil_resp.status_code == 200

    # Task Creation
    task_resp = client.post("/api/tasks", json={
        "farm_id": farm_id,
        "title": "Check Drip Irrigation Filters",
        "description": "Clean sand filters before next watering cycle",
        "category": "Irrigation",
        "due_date": "2026-08-18",
        "priority": "high"
    }, headers=headers)
    assert task_resp.status_code == 200
    task_id = task_resp.json()["id"]

    # Toggle task
    toggle_resp = client.post(f"/api/tasks/{task_id}/toggle", headers=headers)
    assert toggle_resp.status_code == 200
    assert toggle_resp.json()["status"] == "completed"

def test_weather_schemes_and_market():
    reg_payload = {
        "email": "weather_farmer@example.com",
        "password": "Password123",
        "confirm_password": "Password123",
        "full_name": "Weather Farmer",
        "location": "Punjab",
        "preferred_language": "English"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    token = res_reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Weather
    w_resp = client.get("/api/weather?location=Punjab", headers=headers)
    assert w_resp.status_code == 200
    assert "platform_interpretation" in w_resp.json()

    # Schemes
    s_resp = client.get("/api/schemes")
    assert s_resp.status_code == 200

    # Market prices
    m_resp = client.get("/api/market/prices")
    assert m_resp.status_code == 200

