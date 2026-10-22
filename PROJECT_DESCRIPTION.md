# KisanVridhi: Project Description & Feature Specification

## 1. Executive Summary
**KisanVridhi** (formerly AgriQuest) is an intelligent, multi-modal, human-designed agricultural decision support platform engineered specifically for smallholder farmers, field workers, and agricultural extension officers. Built with a mobile-first product architecture, KisanVridhi bridges the gap between agricultural science, financial ledger analytics, meteorological intelligence, and field-level execution.

Unlike conventional agricultural SaaS templates or generic chatbots, KisanVridhi prioritizes **practicality, trust, financial transparency, and usability**. The platform answers the primary question on every screen: *"What does the farmer need to know or do here today?"*

---

## 2. Target Audience & Primary Use Cases
1. **Smallholder & Marginal Farmers**: Seeking simple, weather-guided irrigation schedules, early plant disease diagnosis, and input cost reduction.
2. **Commercial & Progressive Crop Growers**: Requiring itemized expense tracking, revenue calculations per acre, and break-even selling price targets per kilogram before selling in Mandis.
3. **Krishi Vigyan Kendra (KVK) Extension Officers**: Utilizing the expert escalation workflow to review low-confidence AI pathogen diagnoses and support community inquiries.
4. **Platform Administrators**: Managing user verifications, sustainable practice mission catalogs, reward vouchers, and system analytics.

---

## 3. Detailed Feature Breakdown & System Modules

### 3.1 Farmer Action Center Dashboard (`/dashboard`)
The central operational hub designed specifically to prioritize daily field actions above the fold:
- **Today's Farm Check**:
  - *Weather Check*: Live temperature (°C), humidity (%), wind speed (km/h), 24-hour rain probability (%), and agricultural interpretation.
  - *Smart Irrigation Advisory*: Crop-specific watering advice based on meteorological forecasts (e.g., *"Hold Irrigation Today - 65% Rain Probability Expected"*).
  - *Top AI Recommendation*: High-priority sustainable practice recommendation customized to the active farm profile.
  - *Urgent Farm Tasks*: Count of pending field tasks due today with one-click completion checkboxes.
- **My Farm Snapshot**: Active farm name, acreage, primary crop, soil type, and irrigation method.
- **Financial & Sustainability Summary**: Total recorded expenses, completed eco-missions count, and multi-variable Sustainability Index breakdown.
- **Recent Activity Audit Log**: Real database log of completed farm activities and earned XP.

---

### 3.2 Global Farm Selector & Context Engine (`FarmSelector.tsx`)
A persistent dropdown bar positioned near the top of the interface allowing farmers with multiple land holdings to switch active context:
- Automatically updates weather forecasts, irrigation advisories, crop records, soil logs, expense ledgers, and AI recommendations based on the selected farm.

---

### 3.3 Weather Intelligence & Smart Irrigation Advisor (`/weather-irrigation`)
Integrates the **Open-Meteo REST API** to deliver real meteorological intelligence:
- **Live Weather Metrics**: Real-time ambient temperature, humidity, rain probability percentage, wind speed, and severe weather alert banners.
- **Evapotranspiration Irrigation Rule Base**: Translates meteorological raw data into field watering actions:
  - $P_{\text{rain}} \ge 50\% \implies$ *"Hold Irrigation Today to conserve water and prevent root rot."*
  - $30\% \le P_{\text{rain}} < 50\% \implies$ *"Reduced Irrigation - Apply 50% normal water quantity."*
  - $P_{\text{rain}} < 30\% \implies$ *"Scheduled Irrigation - Run drip lateral lines for recommended duration."*
- **5-Day Weather Forecast**: Minimum/maximum temperature trends and daily precipitation probabilities.

---

### 3.4 Farm Expenses & Net Profitability Ledger (`/expenses`)
A digital farm financial ledger replacing traditional paper notebooks:
- **9-Category Expense Logging**: Itemized operational costs under *Seeds, Fertilizer, Labour, Irrigation, Electricity, Machinery, Transport, Pesticides, and Other*.
- **Harvest Yield & Revenue Calculator**: Log crop harvest dates, production yield ($Y_{\text{kg}}$), and Mandi selling prices ($P_{\text{selling}}$). Automatically computes:
  - Gross Revenue ($R = Y_{\text{kg}} \times P_{\text{selling}}$)
  - Net Harvest Profit ($P_{\text{net}} = R - E_{\text{total}}$)
  - Cost, Revenue, and Net Profit per Acre ($P_{\text{acre}} = \frac{P_{\text{net}}}{A_{\text{acres}}}$)
  - **Break-Even Selling Price Target**: $P_{\text{breakeven}} = \frac{E_{\text{total}}}{Y_{\text{kg}}}$ (The absolute minimum price per kg required to avoid financial loss).

---

### 3.5 Soil Health & Nutrient Management (`/soil`)
Tracks soil lab test parameters and provides educational soil improvement advice:
- **Lab Test Log Repository**: Stores tested values for pH, Nitrogen (ppm), Phosphorus (ppm), Potassium (ppm), Organic Carbon (%), soil classification, and test date.
- **Educational Nutrient Advice**: Automatically flags deficient parameters (e.g., Low Nitrogen or Acidic pH) and delivers organic management steps (e.g., green manuring, vermicompost application, lime treatment).

---

### 3.6 AI Crop Health Inspection & Pathogen Diagnostic Studio (`/disease-detection`)
An agricultural leaf inspection tool powered by Computer Vision:
- **Mobile Camera & Gallery Capture**:
  - `[ Take Photo ]`: Direct access to device rear camera using `capture="environment"`.
  - `[ Choose from Gallery ]`: Select stored photos from mobile gallery.
- **Diagnostic Output**: Crop detection, pathogen name, match confidence score (%), and disease severity.
- **Dual Remedy Advisories**:
  - *🌿 Organic Remedy*: Recommended biological bio-stimulants, neem oil sprays, and cultural practices.
  - *🧪 Chemical Intervention*: Recommended fungicide/bactericide active ingredients for severe outbreaks.
- **Diagnostic Uncertainty & KVK Expert Escalation**:
  - When AI model confidence score $C_{\text{model}} < 75\%$, the app displays a prominent **Uncertainty Alert** and provides a one-click link to post the sample for Krishi Vigyan Kendra (KVK) human extension specialist review on the community forum.

---

### 3.7 Government Schemes Finder (`/schemes`)
A verified directory of agricultural subsidies, grants, and insurance schemes:
- **Multi-Filter Search**: Filter schemes by State (*All India, Punjab, Haryana, Maharashtra, AP*), Crop, or Category (*Irrigation, Organic Farming, Equipment, Insurance*).
- **Scheme Metadata**: Displays financial benefits, eligibility criteria, required documents (Aadhaar, 7/12 Land Record, Bank Passbook), application process steps, and official portal links.

---

### 3.8 Mandi Market Rates & MSP Procurement (`/market`)
Delivers market pricing transparency to prevent distress selling:
- **Daily Mandi Market Rates**: Real commodity prices from Agmarknet & State Mandi Boards displaying minimum price, maximum price, and **modal price per quintal**.
- **Government MSP Procurement Listings**: Direct notices from procurement agencies (e.g., Food Corporation of India, State Produce Boards) showing crop MSP rates, minimum sustainability score prerequisites, and application deadlines.

---

### 3.9 Secure Document Vault (`/documents`)
Cloud-backed document management for farm records:
- Categories: *Soil Reports, Bills/Receipts, Insurance Policies, Certificates, Scheme Applications, and Other*.
- Multipart file upload supporting PDFs, image scans, and documents with instant online viewing and deletion with server file cleanup.

---

### 3.10 Gamified Sustainability & Rewards Marketplace (`/rewards`, `/missions`, `/leaderboard`)
Encourages climate-smart farming adoption through structured incentives:
- **Sustainability Index (0-100)**: Evaluates water conservation, soil organic carbon practices, stubble management, crop rotation, and energy efficiency.
- **Eco Missions**: Actionable practices (e.g., *Implement Drip Irrigation, Apply Organic Straw Mulch, Establish Vermicompost Pit, Zero Stubble Burning*).
- **Rewards Marketplace**: Redeem accumulated XP for real value vouchers (e.g., *₹500 Organic Seeds Discount Voucher from IFFCO, Free Soil Lab Test, Solar Pump Repair Credits*).
- **Leaderboard**: Regional farmer rankings based on level and sustainability scores.

---

### 3.11 Ask KisanVridhi AI Assistant (`/assistant`)
A grounded Retrieval-Augmented Generation (RAG) chat assistant:
- Answers farmer questions using verified ICAR, FAO, and TNAU sustainable agricultural literature.
- Displays reference knowledge sources and farm context used for transparent explanations.
- Includes quick-prompt shortcuts (*"What should I do today?", "Should I irrigate?", "How to make Jeevamrut?"*).

---

### 3.12 Mobile-First Product Architecture & Onboarding
- **Mobile Bottom Navigation Bar (`MobileBottomNav.tsx`)**: Fixed bottom bar on mobile screens (`md:hidden`) with 5 core tabs: `Home`, `Farm`, `Tasks`, `Market`, `Profile`.
- **Mobile Profile & More Hub (`ProfileMorePage.tsx`)**: Secondary navigation hub for mobile users to access Community, Rewards, Schemes, Vault, Analytics, and Help.
- **5-Step Guided Onboarding Flow (`OnboardingPage.tsx`)**: Step-by-step setup wizard:
  - Step 1: About You (Full Name, Language)
  - Step 2: Your Farm (Location, Acreage)
  - Step 3: Your Crop (Crop Name, Season)
  - Step 4: Your Resources (Water Source, Irrigation Method)
  - Step 5: Your Goals (Water conservation, Lower expenses, Crop health)
- **Non-Intrusive Offline Sync Banner (`OfflineSyncBanner.tsx`)**: Displays online/offline status and automatic record synchronization.

---

## 4. Technology Stack Specification

| Tier | Technologies Used |
| :--- | :--- |
| **Frontend Core** | React 19, Vite 8, TypeScript 5.8, Tailwind CSS v4, Lucide React, React Router v7 |
| **Backend Core** | Python 3.13, FastAPI, Uvicorn, Pydantic V2, Starlette |
| **Database & ORM** | SQLite (Development) / PostgreSQL (Production), SQLAlchemy 2.0 ORM |
| **External APIs** | Open-Meteo REST API (Weather Forecasts), Agmarknet / Mandi Boards (Commodity Rates) |
| **AI & Machine Learning** | Computer Vision Leaf Pathogen Classifier, Grounded RAG ICAR Assistant, Sustainability Score Engine |
| **Authentication** | JWT (JSON Web Tokens), bcrypt password hashing, Mobile Phone OTP Verification |

---

## 5. Summary of System API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/auth/register` | `POST` | Register a new farmer user account |
| `/api/auth/login` | `POST` | Authenticate via email & password |
| `/api/auth/otp/send` | `POST` | Dispatch 6-digit OTP verification code to mobile phone |
| `/api/auth/otp/verify` | `POST` | Verify OTP code and return JWT access token |
| `/api/dashboard/stats` | `GET` | Retrieve complete Farmer Action Center dashboard dataset |
| `/api/farms` | `GET` / `POST` | List registered farms or create new farm profile |
| `/api/expenses` | `GET` / `POST` | Retrieve expense list or log new operational expense |
| `/api/expenses/summary` | `GET` | Get category breakdown & total expenses summary |
| `/api/profitability` | `GET` / `POST` | Get harvest profitability records or log new crop harvest |
| `/api/soil` | `GET` / `POST` | Get soil test logs or record new soil lab test parameters |
| `/api/soil/guidance/{id}`| `GET` | Get educational N-P-K & pH nutrient management advice |
| `/api/tasks` | `GET` / `POST` | Fetch actionable farm tasks or add new task |
| `/api/tasks/{id}/toggle`| `POST` | Toggle task status between pending and completed |
| `/api/weather` | `GET` | Fetch live Open-Meteo forecast & agricultural interpretation |
| `/api/disease-detection/analyze` | `POST` | Submit crop leaf photo for AI pathogen diagnostic scan |
| `/api/schemes` | `GET` | Search government agriculture schemes with state/category filters |
| `/api/documents` | `GET` / `POST` | List or upload secure documents to vault |
| `/api/market/prices` | `GET` | Fetch daily Mandi commodity market rates |
| `/api/market/msp-auctions`| `GET` | Fetch open government MSP procurement auction listings |
| `/api/assistant/chat` | `POST` | Submit query to Ask KisanVridhi grounded RAG AI assistant |

---

## 6. How to Run & Deploy KisanVridhi

### 6.1 Backend Setup (FastAPI)
```powershell
cd backend
# Install dependencies
pip install -r requirements.txt
# Seed database with demo data
python -m app.database.seed
# Run FastAPI server on port 8000
python -m uvicorn app.main:app --reload --port 8000
```

### 6.2 Frontend Setup (Vite + React)
```powershell
cd frontend
# Install dependencies
npm install
# Run development server on port 5173
npm run dev
# Build production bundle
npm run build
```

### 6.3 Demo Login Credentials
- **Farmer Email**: `farmer@eco.farm` / `Farmer@123456`
- **Phone OTP**: Any 10-digit number (e.g. `9876543210`) with demo OTP `123456`
- **Admin**: `admin@eco.farm` / `Admin@123456`
