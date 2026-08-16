from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Farm, User, Recommendation, PracticeCategory, MissionProgress, Mission

class SustainabilityRecommendationEngine:
    """
    AI Recommendation Engine for Personalized Sustainable Farming.
    Analyzes farm characteristics (soil, crop, irrigation, water source, area, existing practices)
    and user activity history to generate tailored sustainability recommendations.
    Designed for seamless future upgrade with ML models (XGBoost/Random Forest/LLM/RAG).
    """

    @staticmethod
    def generate_recommendations_for_farm(farm: Farm, user: User, db: Session) -> List[Dict[str, Any]]:
        categories = {c.slug: c.id for c in db.query(PracticeCategory).all()}
        completed_mission_ids = {
            mp.mission_id for mp in db.query(MissionProgress).filter(
                MissionProgress.user_id == user.id,
                MissionProgress.status == "completed"
            ).all()
        }

        recommendations = []

        crop = (farm.primary_crop or "").strip().title()
        soil = (farm.soil_type or "").strip().lower()
        irrigation = (farm.irrigation_type or "").strip().lower()
        water_src = (farm.water_source or "").strip().lower()
        area = farm.area_acres
        practices = (farm.current_practices or "").lower()

        # 1. Irrigation & Water Conservation Analysis
        if "flood" in irrigation or "ditch" in irrigation or "canal" in irrigation:
            recommendations.append({
                "category_id": categories.get("water-conservation", 1),
                "title": f"Transition to Micro/Drip Irrigation for {crop}",
                "description": f"Installing drip irrigation lines for your {area}-acre {crop} field delivers precise moisture directly to plant root zones, cutting evaporation and runoff.",
                "reason": f"Your current '{farm.irrigation_type}' method loses up to 40% water to evaporation. Drip irrigation is highly efficient for {soil} soil.",
                "priority": "high",
                "estimated_impact": "Reduce water consumption by 35-40% & boost fertilizer efficiency by 20%",
                "difficulty": "Medium",
                "related_mission_id": 1  # Irrigation scheduling / drip mission
            })
        elif "drip" in irrigation and "scheduling" not in practices:
            recommendations.append({
                "category_id": categories.get("sustainable-irrigation", 9),
                "title": "Implement Weather & Soil Moisture Guided Irrigation Scheduling",
                "description": "Adjust watering duration based on local evapotranspiration rates and soil moisture probes to prevent over-watering.",
                "reason": f"While you use Drip Irrigation, scheduling without moisture tracking still leads to 15% excess water application in {soil} soil.",
                "priority": "medium",
                "estimated_impact": "Save 15-20% additional water & prevent root rot",
                "difficulty": "Easy",
                "related_mission_id": 1
            })

        if "rainwater" not in water_src and area >= 2.0:
            recommendations.append({
                "category_id": categories.get("water-conservation", 1),
                "title": "Construct Farm Pond / Rainwater Harvesting Structure",
                "description": "Create a farm pond lined with silpaulin sheet to capture monsoon runoff and recharge groundwater near your borewell.",
                "reason": f"Your farm relies heavily on '{farm.water_source}'. Rainwater harvesting secures emergency irrigation during dry spells.",
                "priority": "high" if area >= 5.0 else "medium",
                "estimated_impact": "Harvest 500,000L water annually & stabilize groundwater table",
                "difficulty": "Hard",
                "related_mission_id": 9
            })

        # 2. Soil Health & Organic Farming Analysis
        if "sandy" in soil or "loamy" in soil:
            if "mulching" not in practices:
                recommendations.append({
                    "category_id": categories.get("soil-health", 2),
                    "title": f"Apply Organic Crop Straw Mulching for {crop}",
                    "description": f"Cover soil between {crop} rows with 3-4 inches of paddy straw or organic residue to suppress weeds and lock in soil moisture.",
                    "reason": f"{farm.soil_type.title()} soil has high percolation rate. Mulching reduces soil temperature by 4-6°C and slows evaporation.",
                    "priority": "high",
                    "estimated_impact": "Retain 25% more soil moisture & eliminate chemical weed sprays",
                    "difficulty": "Easy",
                    "related_mission_id": 2
                })
        elif "clay" in soil or "black" in soil:
            if "cover crop" not in practices and "green manure" not in practices:
                recommendations.append({
                    "category_id": categories.get("soil-health", 2),
                    "title": "Sow Green Manure Cover Crop (Dhaincha/Sunnhemp)",
                    "description": "Plant leguminous cover crops prior to main sowing and plow them back into the soil at flowering stage.",
                    "reason": f"Clay/Black soils benefit greatly from green manure to improve soil aeration, organic matter, and internal drainage.",
                    "priority": "medium",
                    "estimated_impact": "Fix 60-80 kg/ha atmospheric nitrogen & double earthworm population",
                    "difficulty": "Medium",
                    "related_mission_id": 6
                })

        # 3. Composting & Waste Management
        if "compost" not in practices:
            recommendations.append({
                "category_id": categories.get("composting", 6),
                "title": "Establish On-Farm Vermicomposting Pit",
                "description": "Convert crop residues, animal manure, and organic waste into nutrient-dense vermicompost using Eisenia fetida earthworms.",
                "reason": "Recycling farm waste reduces synthetic chemical fertilizer costs while enriching soil microflora.",
                "priority": "high",
                "estimated_impact": "Replace 30% chemical NPK fertilizer & save ₹8,000/acre annually",
                "difficulty": "Medium",
                "related_mission_id": 3
            })

        # 4. Crop Diversity & Intercropping
        secondary = (farm.secondary_crops or "").strip()
        if not secondary or len(secondary.split(",")) <= 1:
            recommendations.append({
                "category_id": categories.get("crop-diversity", 4),
                "title": f"Intercrop Legumes (Cowpea/Gram) with {crop}",
                "description": f"Plant rows of nitrogen-fixing pulses alongside {crop} to utilize row spacing and enhance farm biological diversity.",
                "reason": f"Monoculture farming with only {crop} increases vulnerability to pest outbreaks and soil nutrient depletion.",
                "priority": "medium",
                "estimated_impact": "Increase land equivalent ratio (LER) by 25% & fix soil nitrogen",
                "difficulty": "Medium",
                "related_mission_id": 4
            })

        # 5. Integrated Pest Management (IPM) & Climate Smart Farming
        if "ipm" not in practices and "yellow sticky" not in practices:
            recommendations.append({
                "category_id": categories.get("integrated-pest-management", 7),
                "title": "Deploy Yellow Sticky Traps & Neem-Based Bio-Pesticides",
                "description": "Install 15-20 yellow/blue sticky cards per acre and apply cold-pressed Neem oil (10,000 ppm) for early sucking pest control.",
                "reason": f"Protects {crop} crops naturally without harming beneficial pollinator insects or disrupting soil biology.",
                "priority": "medium",
                "estimated_impact": "Cut synthetic chemical pesticide use by 50% & protect pollinators",
                "difficulty": "Easy",
                "related_mission_id": 7
            })

        if user.sustainability_score < 70.0:
            recommendations.append({
                "category_id": categories.get("climate-smart-farming", 10),
                "title": "Adopt Zero-Budget Natural Farming Bio-Stimulants (Jeevamrut)",
                "description": "Prepare fermented liquid Jeevamrut using cow dung, cow urine, pulse flour, and jaggery to spray bi-weekly.",
                "reason": f"Your current Sustainability Score is {user.sustainability_score}/100. Jeevamrut revives soil biological activity rapidly.",
                "priority": "high",
                "estimated_impact": "Boost soil microbial count 10x & improve crop climate resilience",
                "difficulty": "Easy",
                "related_mission_id": 5
            })

        return recommendations
