# AI-Powered Gamified Platform for Personalized Sustainable Farming

An end-to-end, production-ready full-stack web application designed for a **B.Tech CSE Mini-Project** and structured for extension into a 4th-year **Major Project**.

The platform incentivizes farmers to adopt sustainable farming practices through personalized AI guidance, interactive missions, computer-vision image verification, RAG-grounded AI assistance, and gamification (XP, Levels, Badges, and Global Leaderboards).

---

## 🌟 Key Features

### 1. Farmer Features
* **Authentication & Role Authorization**: Secure JWT-based registration and login with bcrypt password hashing.
* **Farm Profile Management**: Manage farm location, area, soil type, irrigation system, water source, primary & secondary crops, and existing practices.
* **Personalized AI Recommendation Engine**: Rule-based + multi-attribute ML engine that generates customized recommendations based on farm attributes (e.g. recommending drip irrigation for flood-irrigated wheat or organic mulching for sandy soil).
* **Sustainable Farming Missions**: Category-wise challenges (Water Conservation, Soil Health, Composting, Pest Management) with XP rewards.
* **Computer Vision Practice Verification**: Upload practice images (e.g. composting pits, drip pipes, cover crops) for automated feature extraction, classification, and confidence scoring.
* **Dynamic Sustainability Score (0-100)**: Real-time calculation across 5 core sub-scores: Water, Soil, Waste, Crop Diversity, and Resource Conservation.
* **Gamification System**: Earn XP, level up across 5 ranks (*Beginner Farmer* to *Climate-Smart Farmer*), unlock badges, and track global leaderboard rank.
* **RAG-Grounded AI Farming Assistant**: Interactive chat interface powered by an agricultural knowledge base with verified source citations (ICAR, FAO, TNAU).
* **Analytics Dashboard**: Visual progress charts showing Sustainability Score trends and XP transaction history using Recharts.

### 2. Admin Features
* **Platform Analytics Dashboard**: Live system statistics on total users, active farmers, total farms, completed missions, and category completion breakdown.
* **Mission CRUD Management**: Create, edit, and delete sustainable missions with custom XP rewards, duration, and verification requirements.
* **Image Verification Review Queue**: Review farmer submitted practice images with AI confidence scores and manual approval/rejection overrides.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6 |
| **Backend** | Python 3.13, FastAPI, SQLAlchemy ORM, Pydantic v2, PyJWT, Passlib (bcrypt) |
| **Database** | PostgreSQL (Production) / SQLite (Out-of-the-box local development fallback) |
| **AI / ML & CV** | NumPy, Pillow, OpenCV feature extraction, Scikit-Learn classifier, RAG Knowledge Engine |
| **Testing** | Pytest, FastAPI TestClient |
| **DevOps** | Docker, Docker Compose |

---

## 🏗️ System Architecture

```
   ┌─────────────────────────────────────────────────────────┐
   │                  React + TypeScript UI                  │
   └────────────────────────────┬────────────────────────────┘
                                │ REST APIs + JWT Bearer
   ┌────────────────────────────▼────────────────────────────┐
   │                   FastAPI Backend API                   │
   ├────────────────────────────┬────────────────────────────┤
   │  Auth & Role Dependencies  │   SQLAlchemy Engine & DB   │
   └──────────────┬─────────────┴──────────────┬─────────────┘
                  │                            │
   ┌──────────────▼─────────────┐   ┌──────────▼──────────────┐
   │   AI Recommendation Engine │   │ Computer Vision Module  │
   ├────────────────────────────┤   ├─────────────────────────┤
   │ Multi-Attribute Farm Logic│   │ Feature Extraction & CV │
   └──────────────┬─────────────┘   └──────────┬──────────────┘
                  │                            │
   ┌──────────────▼─────────────┐   ┌──────────▼──────────────┐
   │ RAG Agricultural Assistant │   │ Gamification & Scoring  │
   └────────────────────────────┘   └─────────────────────────┘
```

---

## 🗄️ Database Design

```sql
users (id, email, password_hash, full_name, display_name, location, role, xp, level, sustainability_score)
farms (id, user_id, farm_name, location, area_acres, soil_type, irrigation_type, water_source, primary_crop)
crops (id, farm_id, crop_name, variety, area_acres, status)
practice_categories (id, name, slug, description, icon)
missions (id, title, description, category_id, difficulty, xp_reward, duration_days, requires_image)
mission_progress (id, user_id, farm_id, mission_id, status, image_url, started_at, completed_at)
recommendations (id, user_id, farm_id, category_id, title, description, reason, priority, estimated_impact)
badges (id, name, description, icon_name, xp_reward, requirement_type, requirement_value)
user_badges (id, user_id, badge_id, awarded_at)
image_verifications (id, mission_progress_id, user_id, image_path, detected_practice, confidence_score, verification_status)
sustainability_scores (id, user_id, overall_score, water_score, soil_score, waste_score, diversity_score, resource_score)
xp_transactions (id, user_id, amount, source_type, description, created_at)
```

---

## ⚡ Quickstart Setup Guide

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### 1. Backend Setup
```bash
cd backend

# Create & activate virtual environment (optional)
python -m venv venv
# Windows: venv\Scripts\activate | Linux/macOS: source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run database seed script (Populates categories, 9+ missions, 8 badges, admin & demo farmer)
python -m app.database.seed

# Start FastAPI dev server
uvicorn app.main:app --reload --port 8000
```
Backend API will run at `http://localhost:8000` (API Docs: `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend Web App will run at `http://localhost:5173`.

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Demo Farmer** | `farmer@eco.farm` | `Farmer@123456` |
| **System Admin** | `admin@eco.farm` | `Admin@123456` |

---

## 🧪 Running Automated Tests

To execute the Pytest backend test suite:
```bash
cd backend
python -m pytest tests/test_main.py -v
```

To verify the frontend TypeScript build:
```bash
cd frontend
npm run build
```

---

## 🚀 4th-Year Major Project Extension Path

The mini-project is modularly architected so that the following extensions can be added for the final-year major project:
1. **IoT Sensor Integration**: Connect soil moisture, EC, and pH sensors via MQTT / WebSockets.
2. **Deep Learning CV Upgrade**: Train a MobileNetV3 / YOLOv8 model on custom crop field datasets (`ml/training/train_classifier.py`).
3. **External Weather API**: Integrate OpenWeatherMap API for dynamic rain-forecast guided irrigation alerts.
4. **LLM/RAG Upgrade**: Connect Gemini / OpenAI API via `.env` (`AI_API_KEY`) for conversational voice support.
