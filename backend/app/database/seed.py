from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine, Base
from app.models import User, Farm, Crop, PracticeCategory, Mission, Badge, Recommendation, MissionProgress, XPTransaction, UserBadge, ImageVerification, GovernmentAuction, CommunityPost, RewardItem, UserRewardRedemption, GovernmentScheme, MarketPrice
from app.auth.security import get_password_hash
from app.services.sustainability_calculator import calculate_sustainability_score
from app.services.gamification_service import award_xp

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("[SEED] Seeding Sustainable Farming Platform Database...")

        # 1. Practice Categories
        categories_data = [
            {"name": "Water Conservation", "slug": "water-conservation", "description": "Drip irrigation, rainwater harvesting, moisture conservation", "icon": "Droplets"},
            {"name": "Soil Health", "slug": "soil-health", "description": "Mulching, green manuring, zero tillage, soil organic carbon", "icon": "Sprout"},
            {"name": "Organic Farming", "slug": "organic-farming", "description": "Bio-fertilizers, neem-based sprays, Jeevamrut, vermicompost", "icon": "Leaf"},
            {"name": "Crop Diversity", "slug": "crop-diversity", "description": "Intercropping, crop rotation, polyculture, legumes", "icon": "Grid"},
            {"name": "Waste Management", "slug": "waste-management", "description": "Stubble management, recycling agricultural waste", "icon": "Recycle"},
            {"name": "Composting", "slug": "composting", "description": "Vermicomposting pits, organic waste degradation", "icon": "Box"},
            {"name": "Integrated Pest Management", "slug": "integrated-pest-management", "description": "Sticky traps, biological pest control, eco-sprays", "icon": "ShieldCheck"},
            {"name": "Resource Conservation", "slug": "resource-conservation", "description": "Solar pumps, efficient energy, input optimization", "icon": "Sun"},
            {"name": "Sustainable Irrigation", "slug": "sustainable-irrigation", "description": "Weather-guided scheduling, sprinkler automation", "icon": "CloudRain"},
            {"name": "Climate-Smart Farming", "slug": "climate-smart-farming", "description": "Resilient crop varieties, carbon sequestration", "icon": "ThermometerSun"},
        ]

        cat_map = {}
        for cat in categories_data:
            existing = db.query(PracticeCategory).filter(PracticeCategory.slug == cat["slug"]).first()
            if not existing:
                existing = PracticeCategory(**cat)
                db.add(existing)
                db.commit()
                db.refresh(existing)
            cat_map[cat["slug"]] = existing.id

        # 2. Badges
        badges_data = [
            {"name": "Sustainability Starter", "description": "Started your sustainable farming journey by completing 1 mission.", "icon_name": "Award", "xp_reward": 50, "requirement_type": "mission_count", "requirement_value": "1"},
            {"name": "Water Saver", "description": "Master of efficient irrigation and water conservation techniques.", "icon_name": "Droplets", "xp_reward": 100, "requirement_type": "water_missions", "requirement_value": "2"},
            {"name": "Soil Protector", "description": "Champion of soil organic carbon and mulching practices.", "icon_name": "Sprout", "xp_reward": 100, "requirement_type": "soil_missions", "requirement_value": "2"},
            {"name": "Compost Champion", "description": "Successfully set up or maintained a verified vermicomposting pit.", "icon_name": "Box", "xp_reward": 150, "requirement_type": "compost_mission", "requirement_value": "1"},
            {"name": "Eco Farmer", "description": "Reached Level 2 Eco Farmer status through active participation.", "icon_name": "CheckCircle", "xp_reward": 100, "requirement_type": "level_threshold", "requirement_value": "2"},
            {"name": "Waste Reducer", "description": "Recycled agricultural residues into rich organic inputs.", "icon_name": "Recycle", "xp_reward": 100, "requirement_type": "mission_count", "requirement_value": "3"},
            {"name": "Biodiversity Builder", "description": "Enhanced farm ecological balance through multi-crop intercropping.", "icon_name": "Grid", "xp_reward": 120, "requirement_type": "mission_count", "requirement_value": "4"},
            {"name": "Climate-Smart Farmer", "description": "Achieved a Sustainability Score of 80+ across water, soil, and diversity.", "icon_name": "Sun", "xp_reward": 250, "requirement_type": "score_threshold", "requirement_value": "80.0"},
        ]

        for b in badges_data:
            existing_b = db.query(Badge).filter(Badge.name == b["name"]).first()
            if not existing_b:
                db.add(Badge(**b))
        db.commit()

        # 3. Missions
        missions_data = [
            {
                "title": "Implement Micro-Irrigation / Drip Scheduling",
                "description": "Run your drip irrigation system for recommended duration based on crop moisture needs instead of continuous flooding.",
                "category_id": cat_map["water-conservation"],
                "difficulty": "Medium",
                "xp_reward": 100,
                "duration_days": 7,
                "requires_image": True,
                "expected_practice_label": "Drip Irrigation Installation"
            },
            {
                "title": "Apply Organic Crop Straw Mulching",
                "description": "Cover soil around crop rows with 3 inches of straw or organic residue to conserve moisture and suppress weeds.",
                "category_id": cat_map["soil-health"],
                "difficulty": "Easy",
                "xp_reward": 80,
                "duration_days": 5,
                "requires_image": True,
                "expected_practice_label": "Organic Mulching Practice"
            },
            {
                "title": "Establish Vermicomposting Setup",
                "description": "Construct or clean a vermicompost pit using cattle dung, crop residue, and earthworms.",
                "category_id": cat_map["composting"],
                "difficulty": "Hard",
                "xp_reward": 150,
                "duration_days": 14,
                "requires_image": True,
                "expected_practice_label": "Composting Setup"
            },
            {
                "title": "Intercrop Legumes / Cowpea with Main Crop",
                "description": "Sow nitrogen-fixing legume rows between main crop rows to enrich soil nutrients naturally.",
                "category_id": cat_map["crop-diversity"],
                "difficulty": "Medium",
                "xp_reward": 120,
                "duration_days": 10,
                "requires_image": False,
                "expected_practice_label": "Cover Crops / Green Manure"
            },
            {
                "title": "Prepare & Spray Fermented Jeevamrut",
                "description": "Mix cow dung, urine, jaggery, and pulse flour; ferment for 48 hours and apply as bio-stimulant.",
                "category_id": cat_map["organic-farming"],
                "difficulty": "Medium",
                "xp_reward": 110,
                "duration_days": 3,
                "requires_image": False,
                "expected_practice_label": "Bio-Organic Spray"
            },
            {
                "title": "Sow Green Manure Cover Crop (Sunnhemp/Dhaincha)",
                "description": "Plant green manure cover crops before major season sowing to prevent topsoil erosion and fix atmospheric nitrogen.",
                "category_id": cat_map["climate-smart-farming"],
                "difficulty": "Medium",
                "xp_reward": 130,
                "duration_days": 14,
                "requires_image": True,
                "expected_practice_label": "Cover Crops / Green Manure"
            },
            {
                "title": "Deploy Yellow Sticky Traps for Sucking Pests",
                "description": "Install 15 yellow sticky cards per acre to trap whiteflies and aphids without chemical sprays.",
                "category_id": cat_map["integrated-pest-management"],
                "difficulty": "Easy",
                "xp_reward": 70,
                "duration_days": 3,
                "requires_image": False,
                "expected_practice_label": "Sticky Trap IPM"
            },
            {
                "title": "Adopt Zero Stubble Burning Protocol",
                "description": "Incorporate post-harvest paddy/wheat crop stubble directly into the soil using happy seeder or mulcher.",
                "category_id": cat_map["waste-management"],
                "difficulty": "Hard",
                "xp_reward": 160,
                "duration_days": 7,
                "requires_image": True,
                "expected_practice_label": "Stubble Mulching Practice"
            },
            {
                "title": "Construct Rainwater Harvesting Trench",
                "description": "Dig a rainwater percolation trench along farm perimeter to channel surface runoff into groundwater aquifers.",
                "category_id": cat_map["water-conservation"],
                "difficulty": "Hard",
                "xp_reward": 180,
                "duration_days": 10,
                "requires_image": False,
                "expected_practice_label": "Rainwater Harvesting Trench"
            }
        ]

        for m in missions_data:
            existing_m = db.query(Mission).filter(Mission.title == m["title"]).first()
            if not existing_m:
                db.add(Mission(**m))
        db.commit()

        # 4. Admin User
        admin_email = "admin@eco.farm"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            admin_user = User(
                email=admin_email,
                password_hash=get_password_hash("Admin@123456"),
                full_name="System Admin",
                display_name="EcoFarm Admin",
                location="HQ Central",
                preferred_language="English",
                role="admin",
                xp=5000,
                level=5,
                sustainability_score=95.0
            )
            db.add(admin_user)
            db.commit()
            print("[SUCCESS] Admin created: admin@eco.farm / Admin@123456")

        # 5. Demo Farmer User & Farm
        farmer_email = "farmer@eco.farm"
        existing_farmer = db.query(User).filter(User.email == farmer_email).first()
        if not existing_farmer:
            demo_farmer = User(
                email=farmer_email,
                password_hash=get_password_hash("Farmer@123456"),
                full_name="Anugrah Sharma",
                display_name="EcoFarmer Anugrah",
                location="Punjab, India",
                preferred_language="English",
                role="farmer",
                xp=450,
                level=2,
                sustainability_score=76.0
            )
            db.add(demo_farmer)
            db.commit()
            db.refresh(demo_farmer)

            demo_farm = Farm(
                user_id=demo_farmer.id,
                farm_name="Green Valley Eco Farm",
                location="Ludhiana, Punjab",
                area_acres=4.5,
                soil_type="Loamy",
                irrigation_type="Drip Irrigation",
                water_source="Borewell + Rainwater Harvesting",
                primary_crop="Wheat",
                secondary_crops="Mustard, Pulses",
                farming_experience="5-10 years",
                current_practices="Mulching, Composting, Crop Rotation"
            )
            db.add(demo_farm)
            db.commit()
            db.refresh(demo_farm)

            db.add(Crop(farm_id=demo_farm.id, crop_name="Wheat", variety="HD-2967", area_acres=3.5, status="active"))
            db.add(Crop(farm_id=demo_farm.id, crop_name="Mustard", variety="Pusa Bold", area_acres=1.0, status="active"))
            db.commit()

            # Award initial XP and calculate score
            award_xp(demo_farmer.id, 450, "bonus", "Welcome Bonus & Profile Creation", db)
            calculate_sustainability_score(demo_farmer.id, db)

            # Generate initial AI recommendations
            from app.ai.recommendation_engine import SustainabilityRecommendationEngine
            recs = SustainabilityRecommendationEngine.generate_recommendations_for_farm(demo_farm, demo_farmer, db)
            for rec in recs:
                db.add(Recommendation(
                    user_id=demo_farmer.id,
                    farm_id=demo_farm.id,
                    category_id=rec["category_id"],
                    title=rec["title"],
                    description=rec["description"],
                    reason=rec["reason"],
                    priority=rec["priority"],
                    estimated_impact=rec["estimated_impact"],
                    difficulty=rec["difficulty"],
                    related_mission_id=rec["related_mission_id"]
                ))
            db.commit()

            print("[SUCCESS] Demo Farmer created: farmer@eco.farm / Farmer@123456")

        # 6. Seed Demo Farm Expenses, Profitability, Soil Records, and Tasks
        demo_farmer = db.query(User).filter(User.email == farmer_email).first()
        if demo_farmer:
            demo_farm = db.query(Farm).filter(Farm.user_id == demo_farmer.id).first()
            if demo_farm:
                from app.models import FarmExpense, ProfitRecord, SoilRecord, FarmTask
                
                # Seed Expenses
                if db.query(FarmExpense).filter(FarmExpense.farm_id == demo_farm.id).count() == 0:
                    expenses_data = [
                        FarmExpense(user_id=demo_farmer.id, farm_id=demo_farm.id, category="Seeds", amount=4500.0, expense_date="2026-05-10", description="Certified HD-2967 Wheat Seeds (100kg)"),
                        FarmExpense(user_id=demo_farmer.id, farm_id=demo_farm.id, category="Fertilizer", amount=8200.0, expense_date="2026-05-25", description="Bio-NPK & Organic Neem Cake fertilizer"),
                        FarmExpense(user_id=demo_farmer.id, farm_id=demo_farm.id, category="Labour", amount=12000.0, expense_date="2026-06-15", description="Sowing and field leveling labor charges"),
                        FarmExpense(user_id=demo_farmer.id, farm_id=demo_farm.id, category="Irrigation", amount=3500.0, expense_date="2026-07-02", description="Sub-surface drip lateral maintenance"),
                    ]
                    for exp in expenses_data:
                        db.add(exp)
                    db.commit()
                    print("[SUCCESS] Demo Farm Expenses seeded!")

                # Seed Profitability
                if db.query(ProfitRecord).filter(ProfitRecord.farm_id == demo_farm.id).count() == 0:
                    profit_rec = ProfitRecord(
                        user_id=demo_farmer.id,
                        farm_id=demo_farm.id,
                        crop_name="Wheat (HD-2967)",
                        harvest_date="2026-04-15",
                        production_qty_kg=4800.0,
                        selling_price_per_kg=24.5,
                        revenue=117600.0,
                        total_expenses=28200.0,
                        net_profit=89400.0,
                        area_acres=4.5,
                        cost_per_acre=6266.67,
                        revenue_per_acre=26133.33,
                        profit_per_acre=19866.67,
                        break_even_price_per_kg=5.88,
                        notes="High yield season with zero chemical pesticide usage."
                    )
                    db.add(profit_rec)
                    db.commit()
                    print("[SUCCESS] Demo Profitability Record seeded!")

                # Seed Soil Record
                if db.query(SoilRecord).filter(SoilRecord.farm_id == demo_farm.id).count() == 0:
                    soil_rec = SoilRecord(
                        user_id=demo_farmer.id,
                        farm_id=demo_farm.id,
                        ph=6.8,
                        nitrogen_ppm=165.0,
                        phosphorus_ppm=38.0,
                        potassium_ppm=210.0,
                        organic_carbon_percent=0.68,
                        soil_type="Loamy",
                        moisture_percent=22.5,
                        tested_at="2026-07-20",
                        notes="KVK District Lab test result. Good NPK balance."
                    )
                    db.add(soil_rec)
                    db.commit()
                    print("[SUCCESS] Demo Soil Record seeded!")

                # Seed Farm Tasks
                if db.query(FarmTask).filter(FarmTask.user_id == demo_farmer.id).count() == 0:
                    tasks_data = [
                        FarmTask(user_id=demo_farmer.id, farm_id=demo_farm.id, title="Inspect Wheat Crop for Yellow Rust", description="Walk through 3.5 acre wheat field and check underside of lower leaves.", category="Pest Control", due_date="2026-08-17", priority="high", status="pending", source="AI System"),
                        FarmTask(user_id=demo_farmer.id, farm_id=demo_farm.id, title="Flush Drip Irrigation Laterals", description="Open end-caps of drip lateral lines and run pump at 2 bar pressure to remove silt.", category="Irrigation", due_date="2026-08-18", priority="medium", status="pending", source="Manual"),
                        FarmTask(user_id=demo_farmer.id, farm_id=demo_farm.id, title="Apply Fermented Jeevamrut Liquid", description="Apply 200L Jeevamrut solution via drip venturi injector during evening watering.", category="Organic Farming", due_date="2026-08-20", priority="medium", status="pending", source="Recommendation"),
                    ]
                    for t in tasks_data:
                        db.add(t)
                    db.commit()
                    print("[SUCCESS] Demo Farm Tasks seeded!")

        # Seed Government Auctions & Community Posts
        if db.query(GovernmentAuction).count() == 0:
            db.add(GovernmentAuction(
                title="National Organic Wheat Procurement Scheme 2026",
                crop_type="Organic Wheat",
                msp_price_per_quintal=2550.0,
                min_sustainability_score_required=65.0,
                location_region="Punjab & Haryana Region",
                deadline_date="2026-11-30",
                procurement_agency="Food Corporation of India (FCI)",
                status="Open"
            ))
            db.add(GovernmentAuction(
                title="Sustainable Basmati Paddy Direct Government Purchase",
                crop_type="Basmati Rice",
                msp_price_per_quintal=3850.0,
                min_sustainability_score_required=70.0,
                location_region="North India Agricultural Belt",
                deadline_date="2026-12-15",
                procurement_agency="State Agricultural Produce Board",
                status="Open"
            ))
            db.commit()
            print("[SUCCESS] Government Auctions seeded!")

        if db.query(CommunityPost).count() == 0:
            db.add(CommunityPost(
                user_id=1,
                author_name="EcoFarmer Anugrah",
                author_level=2,
                title="How Drip Irrigation saved 40% water on my 4-acre wheat farm",
                content="Installing sub-surface drip lines along with organic mulching gave me higher grain weight and reduced weeds drastically!",
                category="Water Conservation",
                upvotes=18
            ))
            db.add(CommunityPost(
                user_id=1,
                author_name="Gurpreet Singh",
                author_level=3,
                title="Best organic recipe for Jeevamrut liquid fertilizer",
                content="Mix 10kg cow dung, 10L cow urine, 2kg jaggery, 2kg pulse flour in 200L water. Ferment for 7 days. Spray on crops every 15 days!",
                category="Organic Farming",
                upvotes=25
            ))
            db.commit()
            print("[SUCCESS] Community Posts seeded!")

        # Seed Reward Items & Prizes
        if db.query(RewardItem).count() == 0:
            rewards_list = [
                {
                    "title": "₹500 Organic Seeds Discount Voucher",
                    "description": "Get ₹500 off certified organic Wheat, Pulses & Vegetable seeds at any authorized IFFCO / Krishi Kendra center.",
                    "category": "Seeds & Inputs",
                    "points_cost": 250,
                    "sponsor_agency": "IFFCO / State Organic Seed Corp",
                    "voucher_code_prefix": "SEED500",
                    "image_icon": "Sprout",
                    "inventory_count": 50
                },
                {
                    "title": "Free Comprehensive Soil Health Card Test",
                    "description": "Voucher for 1 free NPK + Micronutrient soil lab testing at government district KVK laboratory.",
                    "category": "Services",
                    "points_cost": 300,
                    "sponsor_agency": "Soil Health Card Mission",
                    "voucher_code_prefix": "SOILTEST",
                    "image_icon": "CheckCircle2",
                    "inventory_count": 40
                },
                {
                    "title": "15% Subsidy Voucher for Drip Irrigation Kit",
                    "description": "Exclusive 15% discount coupon on micro-drip irrigation lateral pipes & drippers.",
                    "category": "Equipment",
                    "points_cost": 400,
                    "sponsor_agency": "Jain Irrigation / PMKSY Scheme",
                    "voucher_code_prefix": "DRIP15",
                    "image_icon": "Droplets",
                    "inventory_count": 30
                },
                {
                    "title": "1-on-1 Senior KVK Agronomist Consultation Pass",
                    "description": "Priority 30-minute phone/in-person consultation with senior KVK soil & crop doctor.",
                    "category": "Services",
                    "points_cost": 200,
                    "sponsor_agency": "ICAR - Krishi Vigyan Kendra",
                    "voucher_code_prefix": "EXPERT30",
                    "image_icon": "User",
                    "inventory_count": 100
                },
                {
                    "title": "Certified Climate-Smart Farmer Digital Pass",
                    "description": "Official digital certificate pass verifying eco-farming practices for bank loan interest subsidies.",
                    "category": "Training",
                    "points_cost": 350,
                    "sponsor_agency": "National Bio-Farming Board",
                    "voucher_code_prefix": "CERTIFIED",
                    "image_icon": "Award",
                    "inventory_count": 200
                },
                {
                    "title": "₹1,000 Solar Pump Equipment Repair Credit",
                    "description": "Credit voucher applicable on solar pump maintenance, inverter service, and panel cleaning.",
                    "category": "Equipment",
                    "points_cost": 500,
                    "sponsor_agency": "PM-KUSUM Solar Mission",
                    "voucher_code_prefix": "SOLAR1000",
                    "image_icon": "Sun",
                    "inventory_count": 25
                }
            ]
            for r in rewards_list:
                db.add(RewardItem(**r))
            db.commit()
            print("[SUCCESS] Reward Items & Prizes seeded!")

        # 9. Government Schemes
        if db.query(GovernmentScheme).count() == 0:
            schemes_list = [
                {
                    "title": "PM Krishi Sinchayee Yojana (PMKSY) - Micro Irrigation Subsidy",
                    "state": "All India",
                    "applicable_crops": "All",
                    "category": "Irrigation",
                    "eligibility": "Small and marginal farmers with land ownership or long lease.",
                    "benefits": "55% subsidy for small/marginal farmers and 45% for other farmers on Drip/Sprinkler systems.",
                    "required_documents": "Aadhaar Card, Land Record (7/12 or Khatauni), Bank Passbook, Passport Photo.",
                    "application_process": "Apply via State Horticulture Portal or District Agriculture Officer.",
                    "official_source_link": "https://pmksy.gov.in/",
                    "last_verified_date": "2026-08-01"
                },
                {
                    "title": "Paramparagat Krishi Vikas Yojana (PKVY) Organic Farming",
                    "state": "All India",
                    "applicable_crops": "All",
                    "category": "Organic Farming",
                    "eligibility": "Farmer clusters/groups adopting certified organic farming practices.",
                    "benefits": "Financial assistance of ₹50,000 per hectare over 3 years for organic inputs and certification.",
                    "required_documents": "Aadhaar, Cluster Registration Form, Bank Details, Land Ownership proof.",
                    "application_process": "Register group with District Organic Nodal Officer or State Agriculture Department.",
                    "official_source_link": "https://pgsindia-ncof.gov.in/",
                    "last_verified_date": "2026-08-01"
                },
                {
                    "title": "PM-KUSUM Component B - Off-Grid Solar Pumps",
                    "state": "All India",
                    "applicable_crops": "All",
                    "category": "Equipment",
                    "eligibility": "Farmers with diesel pumps or grid-unconnected agricultural land.",
                    "benefits": "Up to 60% total subsidy (30% Central + 30% State) for installing standalone solar water pumps.",
                    "required_documents": "Aadhaar, Land Records, Underground Water Clearance, Bank Passbook.",
                    "application_process": "Online portal of State Renewable Energy Agency (e.g. HAREDA, MEDA, PEDA).",
                    "official_source_link": "https://pmkusum.mnre.gov.in/",
                    "last_verified_date": "2026-08-01"
                },
                {
                    "title": "Sub-Mission on Agricultural Mechanization (SMAM)",
                    "state": "All India",
                    "applicable_crops": "All",
                    "category": "Equipment",
                    "eligibility": "Farmers purchasing tractors, rotavators, seed drills, laser levellers.",
                    "benefits": "40% to 50% subsidy on procurement of modern agricultural machinery.",
                    "required_documents": "Aadhaar, Land Proof, Quotation from Dealer, Bank Passbook.",
                    "application_process": "Apply online at Direct Benefit Transfer in Agricultural Mechanization portal (agrimachinery.nic.in).",
                    "official_source_link": "https://agrimachinery.nic.in/",
                    "last_verified_date": "2026-08-01"
                },
                {
                    "title": "PM Fasal Bima Yojana (PMFBY) Crop Insurance",
                    "state": "All India",
                    "applicable_crops": "Wheat, Paddy, Cotton, Pulses, Mustard",
                    "category": "Insurance",
                    "eligibility": "All farmers growing notified crops in notified areas.",
                    "benefits": "Comprehensive risk cover for yield loss; premium of only 1.5% for Rabi and 2% for Kharif crops.",
                    "required_documents": "Land Record (Khasra/Khatauni), Sowing Certificate, Aadhaar, Bank Details.",
                    "application_process": "Through Bank branch, CSC center, or PMFBY National Crop Insurance Portal.",
                    "official_source_link": "https://pmfby.gov.in/",
                    "last_verified_date": "2026-08-01"
                }
            ]
            for s in schemes_list:
                db.add(GovernmentScheme(**s))
            db.commit()
            print("[SUCCESS] Government Schemes seeded!")

        # 10. Market Prices
        if db.query(MarketPrice).count() == 0:
            prices_list = [
                {
                    "market_name": "Khanna Mandi",
                    "state": "Punjab",
                    "district": "Ludhiana",
                    "crop_name": "Wheat",
                    "variety": "PBW-725 / Kalyan Sona",
                    "min_price": 2275.0,
                    "max_price": 2420.0,
                    "modal_price": 2350.0,
                    "unit": "Rs / Quintal",
                    "price_date": "2026-08-16",
                    "source": "Agmarknet / Punjab Mandi Board"
                },
                {
                    "market_name": "Karnal Grain Market",
                    "state": "Haryana",
                    "district": "Karnal",
                    "crop_name": "Rice (Basmati 1509)",
                    "variety": "Super Fine",
                    "min_price": 3400.0,
                    "max_price": 3850.0,
                    "modal_price": 3650.0,
                    "unit": "Rs / Quintal",
                    "price_date": "2026-08-16",
                    "source": "Haryana State Agricultural Marketing Board"
                },
                {
                    "market_name": "Guntur APMC Mandi",
                    "state": "Andhra Pradesh",
                    "district": "Guntur",
                    "crop_name": "Cotton",
                    "variety": "Medium Staple",
                    "min_price": 6800.0,
                    "max_price": 7450.0,
                    "modal_price": 7100.0,
                    "unit": "Rs / Quintal",
                    "price_date": "2026-08-16",
                    "source": "Agmarknet / AP Marketing Dept"
                },
                {
                    "market_name": "Latur Agriculture Market",
                    "state": "Maharashtra",
                    "district": "Latur",
                    "crop_name": "Soybean",
                    "variety": "Yellow",
                    "min_price": 4400.0,
                    "max_price": 4850.0,
                    "modal_price": 4650.0,
                    "unit": "Rs / Quintal",
                    "price_date": "2026-08-16",
                    "source": "MSAMB Maharashtra"
                },
                {
                    "market_name": "Azadpur Mandi",
                    "state": "Delhi",
                    "district": "North Delhi",
                    "crop_name": "Tomato",
                    "variety": "Hybrid Red",
                    "min_price": 1800.0,
                    "max_price": 2600.0,
                    "modal_price": 2200.0,
                    "unit": "Rs / Quintal",
                    "price_date": "2026-08-16",
                    "source": "Azadpur APMC Board"
                }
            ]
            for m in prices_list:
                db.add(MarketPrice(**m))
            db.commit()
            print("[SUCCESS] Mandi Market Prices seeded!")

        print("[SUCCESS] Seed completed successfully!")

    except Exception as e:
        print(f"[ERROR] Seed error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
