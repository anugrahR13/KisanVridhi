from typing import List, Dict, Any
import re

AGRICULTURAL_KNOWLEDGE_BASE = [
    {
        "id": "kb_water_01",
        "category": "Water Conservation",
        "title": "Precision Drip Irrigation & Water Management Guidelines",
        "source": "ICAR - Indian Council of Agricultural Research Guidelines",
        "keywords": ["drip", "irrigation", "water", "tube well", "borewell", "schedule", "wheat", "rice", "sandy"],
        "content": "Drip irrigation delivers water at operating pressure of 1.0-1.5 kg/cm2 directly to root zones. For wheat and vegetable crops, drip irrigation saves up to 40% water compared to flood irrigation, reduces weed growth by 60%, and increases fertilizer application efficiency when combined with fertigation. In sandy and loamy soils, operating drip lines for 45-60 minutes daily during peak growth stages maintains soil matrix potential at optimum levels."
    },
    {
        "id": "kb_soil_01",
        "category": "Soil Health",
        "title": "Organic Mulching and Moisture Retention Protocol",
        "source": "FAO - Food and Agriculture Organization Sustainable Farming Manual",
        "keywords": ["mulching", "straw", "moisture", "soil", "evaporation", "temperature", "weeds"],
        "content": "Applying organic straw mulch (5-7 cm thickness) conserves 20-30% soil moisture, regulates diurnal soil temperatures by 4-6°C, and adds organic matter upon decomposition. Straw mulching suppresses light penetration required for weed seed germination and prevents soil crusting after heavy rains or irrigation."
    },
    {
        "id": "kb_compost_01",
        "category": "Composting & Soil Fertility",
        "title": "Eisenia Fetida Vermicomposting & Bio-Organic Nutrient Recycling",
        "source": "National Centre of Organic Farming (NCOF) Technical Bulletin",
        "keywords": ["compost", "vermicompost", "dung", "waste", "organic", "fertilizer", "nitrogen", "soil"],
        "content": "Vermicomposting converts crop residues and cattle dung into rich vermicompost (1.5-2.2% N, 0.4-0.7% P2O5, 0.9-1.5% K2O) within 45-60 days using Eisenia fetida red worms. Applying 2-3 tonnes of vermicompost per acre improves soil cation exchange capacity (CEC), enhances beneficial mycorrhizal fungi, and reduces reliance on chemical NPK by 30%."
    },
    {
        "id": "kb_ipm_01",
        "category": "Integrated Pest Management",
        "title": "Eco-Friendly Integrated Pest & Disease Management",
        "source": "TNAU Agritech Portal - Sustainable Plant Protection",
        "keywords": ["pest", "ipm", "neem", "sticky", "insects", "disease", "biological", "spray"],
        "content": "Integrated Pest Management (IPM) combines cultural, physical, and biological controls before applying targeted eco-friendly sprays. Installing 15 yellow/blue sticky traps per acre captures aphid, whitefly, and thrip vectors. Cold-pressed Neem Seed Kernel Extract (NSKE 5%) or Azadirachtin (10,000 ppm) acts as an antifeedant and oviposition deterrent without harming pollinators like honeybees."
    },
    {
        "id": "kb_climate_01",
        "category": "Climate-Smart Farming",
        "title": "Climate-Resilient Agriculture & Cover Cropping",
        "source": "CGIAR Climate-Smart Agriculture Guide",
        "keywords": ["climate", "green manure", "dhaincha", "nitrogen", "cover crop", "carbon", "drought"],
        "content": "Incorporating leguminous cover crops like Crotalaria juncea (Sunnhemp) or Sesbania aculeata (Dhaincha) fixes up to 80 kg atmospheric nitrogen per hectare in 45 days. Cover crops build soil organic carbon (SOC), buffer crops against rainfall variability, and prevent topsoil erosion during extreme storm events."
    }
]

class AgriculturalRAGKnowledgeBase:
    @staticmethod
    def query_knowledge(query_text: str, farm_context: str = "", top_k: int = 2) -> List[Dict[str, Any]]:
        query_words = set(re.findall(r'\w+', (query_text + " " + farm_context).lower()))
        
        scored_docs = []
        for doc in AGRICULTURAL_KNOWLEDGE_BASE:
            score = 0
            # Keyword matching score
            for kw in doc["keywords"]:
                if kw in query_words:
                    score += 3
            for word in query_words:
                if len(word) > 3 and word in doc["content"].lower():
                    score += 1

            if score > 0:
                scored_docs.append((score, doc))

        # Sort by relevance score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        results = [doc for _, doc in scored_docs[:top_k]]

        # Fallback if no exact match found
        if not results:
            results = AGRICULTURAL_KNOWLEDGE_BASE[:2]

        return results

    @staticmethod
    def generate_grounded_answer(query_text: str, farm_info: dict = None) -> Dict[str, Any]:
        farm_context_str = ""
        if farm_info:
            farm_context_str = f"Crop: {farm_info.get('primary_crop')}, Soil: {farm_info.get('soil_type')}, Irrigation: {farm_info.get('irrigation_type')}, Water: {farm_info.get('water_source')}, Area: {farm_info.get('area_acres')} acres."

        kb_docs = AgriculturalRAGKnowledgeBase.query_knowledge(query_text, farm_context_str)

        sources = []
        doc_snippets = []
        for doc in kb_docs:
            sources.append({
                "title": doc["title"],
                "source": doc["source"],
                "snippet": doc["content"][:200] + "..."
            })
            doc_snippets.append(f"[{doc['source']}]: {doc['content']}")

        # Formulate grounded response using farm context and retrieved knowledge
        prefix = f"Based on your farm profile ({farm_context_str}):\n\n" if farm_context_str else ""
        knowledge_summary = "\n\n".join(doc_snippets)

        reply = f"{prefix}Here is personalized sustainable farming guidance for your query:\n\n{knowledge_summary}\n\nKey Actionable Advice:\n- Tailor your watering and soil management schedule to your specific {farm_info.get('soil_type', 'farm')} soil conditions.\n- Combine organic practices like mulching or composting to build soil fertility over time."

        return {
            "reply": reply,
            "sources": sources,
            "farm_context_used": farm_context_str if farm_context_str else "General Farm Profile"
        }
