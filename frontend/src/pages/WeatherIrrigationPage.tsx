import React, { useState, useEffect } from 'react';
import { CloudSun, Droplet, Wind, Thermometer, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { weatherService, farmService } from '../services/appServices';
import { WeatherData, Farm } from '../types';

export const WeatherIrrigationPage: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const farmsList = await farmService.getFarms();
      setFarms(farmsList);
      const activeFarm = selectedFarmId ? farmsList.find(f => f.id === selectedFarmId) : (farmsList.length > 0 ? farmsList[0] : null);
      if (activeFarm) setSelectedFarmId(activeFarm.id);

      const data = await weatherService.getWeather(activeFarm?.location || 'Punjab', activeFarm?.id);
      setWeather(data);
    } catch (err) {
      console.error('Error loading weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [selectedFarmId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-2 text-slate-600 text-sm font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-green-700" />
          <span>Fetching live weather intelligence...</span>
        </div>
      </div>
    );
  }

  const activeFarm = farms.find(f => f.id === selectedFarmId);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-blue-600" /> Weather Intelligence & Smart Irrigation Advisor
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Real weather API integration converted into actionable farm-context irrigation advice.
          </p>
        </div>

        {farms.length > 0 && (
          <div className="mt-3 sm:mt-0 flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-700">Select Farm:</label>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(Number(e.target.value))}
              className="text-xs border border-slate-300 rounded-md p-1.5 bg-white font-medium focus:ring-green-700"
            >
              {farms.map(f => (
                <option key={f.id} value={f.id}>{f.farm_name} ({f.location})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Weather Current Stats Grid */}
      {weather && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-md">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Temperature</span>
              <span className="text-xl font-black text-slate-900">{weather.temperature_c}°C</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-md">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Humidity</span>
              <span className="text-xl font-black text-slate-900">{weather.humidity_percent}%</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-md">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Rain Probability</span>
              <span className="text-xl font-black text-slate-900">{weather.rain_probability_percent}%</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs flex items-center space-x-3">
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-md">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Wind Speed</span>
              <span className="text-xl font-black text-slate-900">{weather.wind_speed_kmh} km/h</span>
            </div>
          </div>
        </div>
      )}

      {/* Platform Interpretation & Severe Warnings */}
      {weather && (
        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-green-700" /> Platform Agricultural Interpretation
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">Source: {weather.source}</span>
          </div>

          {weather.severe_warning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start space-x-2 text-xs text-amber-900 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{weather.severe_warning}</span>
            </div>
          )}

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2">
            <p className="text-xs font-bold text-slate-900">Recommended Smart Irrigation Action:</p>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {weather.platform_interpretation}
            </p>
            <p className="text-[11px] text-slate-500 pt-1">
              Context applied: Crop: <strong className="text-slate-800">{activeFarm?.primary_crop || 'Wheat'}</strong> | System: <strong className="text-slate-800">{activeFarm?.irrigation_type || 'Drip'}</strong>
            </p>
          </div>
        </div>
      )}

      {/* 5-Day Forecast Table */}
      {weather && weather.forecast.length > 0 && (
        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Calendar className="w-4 h-4 text-blue-600" /> 5-Day Weather Forecast
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {weather.forecast.map((day, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-md text-center space-y-1">
                <span className="font-bold text-slate-900 block">{day.date}</span>
                <span className="text-slate-600 block">{day.max_temp_c}°C / {day.min_temp_c}°C</span>
                <span className="text-blue-700 font-semibold block text-[11px]">Rain: {day.rain_prob_pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
