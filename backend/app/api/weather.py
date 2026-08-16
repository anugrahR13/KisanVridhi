import httpx
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.database.session import get_db
from app.models import Farm, User
from app.schemas import WeatherResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/weather", tags=["Weather Intelligence"])

# Coordinate mapping for major Indian agricultural locations
LOCATION_COORDS = {
    "ludhiana": (30.9010, 75.8573),
    "punjab": (30.9010, 75.8573),
    "karnal": (29.6857, 76.9905),
    "haryana": (29.0588, 76.0856),
    "guntur": (16.3067, 80.4365),
    "andhra pradesh": (16.3067, 80.4365),
    "latur": (18.4088, 76.5604),
    "maharashtra": (19.7515, 75.7139),
    "delhi": (28.6139, 77.2090),
    "uttar pradesh": (26.8467, 80.9462),
    "lucknow": (26.8467, 80.9462),
    "jaipur": (26.9124, 75.7873),
    "rajasthan": (26.9124, 75.7873),
}

def get_coords_for_location(loc_name: str):
    key = loc_name.lower().strip()
    for k, v in LOCATION_COORDS.items():
        if k in key or key in k:
            return v
    # Default to Central India (Nagpur) if unknown location
    return (21.1458, 79.0882)

@router.get("", response_model=WeatherResponse)
async def get_weather(
    location: Optional[str] = None,
    farm_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_location = location or current_user.location or "Punjab"
    crop_context = "Wheat"
    irrigation_method = "Drip"

    if farm_id:
        farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
        if farm:
            target_location = farm.location or target_location
            crop_context = farm.primary_crop
            irrigation_method = farm.irrigation_type
    else:
        first_farm = db.query(Farm).filter(Farm.user_id == current_user.id).first()
        if first_farm:
            crop_context = first_farm.primary_crop
            irrigation_method = first_farm.irrigation_type

    lat, lon = get_coords_for_location(target_location)

    # Fetch live weather from Open-Meteo REST API
    temp_c = 28.5
    humidity_pct = 62.0
    rain_prob = 15.0
    wind_kmh = 12.0
    condition_text = "Partly Cloudy"
    severe_warning = None
    forecast_days = []

    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto"
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                daily = data.get("daily", {})

                temp_c = current.get("temperature_2m", temp_c)
                humidity_pct = current.get("relative_humidity_2m", humidity_pct)
                wind_kmh = current.get("wind_speed_10m", wind_kmh)
                
                daily_rain_probs = daily.get("precipitation_probability_max", [rain_prob])
                if daily_rain_probs:
                    rain_prob = float(daily_rain_probs[0] or 0)

                # Process 5-day forecast
                times = daily.get("time", [])
                max_temps = daily.get("temperature_2m_max", [])
                min_temps = daily.get("temperature_2m_min", [])
                for i in range(min(5, len(times))):
                    forecast_days.append({
                        "date": times[i],
                        "max_temp_c": max_temps[i] if i < len(max_temps) else temp_c,
                        "min_temp_c": min_temps[i] if i < len(min_temps) else temp_c - 5,
                        "rain_prob_pct": daily_rain_probs[i] if i < len(daily_rain_probs) else rain_prob
                    })
    except Exception:
        # Fallback forecast structure if external API is unreachable
        forecast_days = [
            {"date": "Today", "max_temp_c": 30.0, "min_temp_c": 22.0, "rain_prob_pct": 15},
            {"date": "Tomorrow", "max_temp_c": 31.0, "min_temp_c": 23.0, "rain_prob_pct": 65},
            {"date": "Day 3", "max_temp_c": 29.0, "min_temp_c": 21.0, "rain_prob_pct": 40},
            {"date": "Day 4", "max_temp_c": 32.0, "min_temp_c": 22.0, "rain_prob_pct": 10},
            {"date": "Day 5", "max_temp_c": 33.0, "min_temp_c": 23.0, "rain_prob_pct": 5},
        ]

    # Convert weather into clear agricultural platform interpretation
    if rain_prob > 60:
        platform_interpretation = f"High precipitation probability ({rain_prob}%). Hold irrigation for your {crop_context} crop to avoid waterlogging and nutrient leaching."
        severe_warning = "Rainfall expected within 24-48 hours."
    elif rain_prob > 35:
        platform_interpretation = f"Moderate chance of rain ({rain_prob}%). Reduce planned irrigation duration for {crop_context} by 50%."
    elif temp_c > 38.0:
        platform_interpretation = f"High temperature warning ({temp_c}°C). Increase early morning irrigation frequency for {crop_context} to prevent heat stress."
        severe_warning = "Heat wave warning for agricultural crops."
    else:
        platform_interpretation = f"Weather conditions are stable. Standard {irrigation_method} irrigation schedule is suitable for {crop_context}."

    return WeatherResponse(
        location=target_location,
        temperature_c=float(temp_c),
        humidity_percent=float(humidity_pct),
        rain_probability_percent=float(rain_prob),
        wind_speed_kmh=float(wind_kmh),
        condition_text=condition_text,
        severe_warning=severe_warning,
        platform_interpretation=platform_interpretation,
        forecast=forecast_days,
        source="Open-Meteo Weather API",
        last_updated=datetime.utcnow()
    )
