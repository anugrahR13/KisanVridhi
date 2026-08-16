import React, { useState, useEffect } from 'react';
import { farmService } from '../services/appServices';
import { Farm } from '../types';
import { Tractor, Plus, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const FarmProfilePage: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    farm_name: 'Green Valley Eco Farm',
    location: 'Ludhiana, Punjab',
    area_acres: 4.5,
    soil_type: 'Loamy',
    irrigation_type: 'Drip Irrigation',
    water_source: 'Borewell + Rainwater Harvesting',
    primary_crop: 'Wheat',
    secondary_crops: 'Mustard, Pulses',
    farming_experience: '5-10 years',
    current_practices: 'Mulching, Composting, Crop Rotation'
  });

  const [newCrop, setNewCrop] = useState({ crop_name: '', variety: '', area_acres: 1.0 });
  const [showCropModal, setShowCropModal] = useState(false);

  const fetchFarms = async () => {
    try {
      const data = await farmService.getFarms();
      setFarms(data);
      if (data.length > 0) {
        const first = data[0];
        setFormData({
          farm_name: first.farm_name,
          location: first.location,
          area_acres: first.area_acres,
          soil_type: first.soil_type,
          irrigation_type: first.irrigation_type,
          water_source: first.water_source,
          primary_crop: first.primary_crop,
          secondary_crops: first.secondary_crops || '',
          farming_experience: first.farming_experience || '',
          current_practices: first.current_practices || ''
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (farms.length > 0) {
        await farmService.updateFarm(farms[0].id, formData);
        setSuccessMsg('Farm profile updated successfully! AI Recommendations updated.');
      } else {
        await farmService.createFarm(formData);
        setSuccessMsg('Farm profile created! AI Recommendations generated.');
      }
      await fetchFarms();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Error saving farm profile.');
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farms[0] || !newCrop.crop_name) return;
    try {
      await farmService.addCrop(farms[0].id, newCrop);
      setNewCrop({ crop_name: '', variety: '', area_acres: 1.0 });
      setShowCropModal(false);
      await fetchFarms();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Tractor className="w-5 h-5 text-green-700" /> My Farm Profile & Soil Management
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Configure land area, soil characteristics, irrigation systems, and active crops for tailored AI advisories.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded bg-green-50 border border-green-200 text-green-900 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-700" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg border border-slate-200 space-y-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          {farms.length > 0 ? 'Edit Primary Farm Attributes' : 'Register New Farm Profile'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Farm Name</label>
            <input
              type="text"
              name="farm_name"
              value={formData.farm_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Location / District</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total Area (Acres)</label>
            <input
              type="number"
              step="0.1"
              name="area_acres"
              value={formData.area_acres}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Soil Type</label>
            <select
              name="soil_type"
              value={formData.soil_type}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900 font-medium"
            >
              <option value="Loamy">Loamy Soil</option>
              <option value="Clay">Clay Soil</option>
              <option value="Sandy">Sandy Soil</option>
              <option value="Black">Black Cotton Soil</option>
              <option value="Silt">Silt Soil</option>
              <option value="Alluvial">Alluvial Soil</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Irrigation Method</label>
            <select
              name="irrigation_type"
              value={formData.irrigation_type}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900 font-medium"
            >
              <option value="Drip Irrigation">Drip Irrigation</option>
              <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
              <option value="Flood Irrigation">Flood / Ditch Irrigation</option>
              <option value="Rainfed">Rainfed (No Irrigation System)</option>
              <option value="Canal Irrigation">Canal Sub-Surface</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary Water Source</label>
            <select
              name="water_source"
              value={formData.water_source}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900 font-medium"
            >
              <option value="Borewell + Rainwater Harvesting">Borewell + Rainwater Harvesting</option>
              <option value="Tube well">Tube well</option>
              <option value="River / Canal">River / Canal</option>
              <option value="Farm Pond">Farm Pond</option>
              <option value="Rainfed Only">Rainfed Only</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary Crop</label>
            <input
              type="text"
              name="primary_crop"
              value={formData.primary_crop}
              onChange={handleChange}
              required
              placeholder="e.g. Wheat, Rice, Vegetables"
              className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Secondary Crops</label>
            <input
              type="text"
              name="secondary_crops"
              value={formData.secondary_crops}
              onChange={handleChange}
              placeholder="e.g. Mustard, Pulses, Gram"
              className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Farming Experience</label>
            <select
              name="farming_experience"
              value={formData.farming_experience}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900 font-medium"
            >
              <option value="<1 year">&lt; 1 Year</option>
              <option value="1-5 years">1 - 5 Years</option>
              <option value="5-10 years">5 - 10 Years</option>
              <option value="10+ years">10+ Years</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Current Farming Practices</label>
          <textarea
            name="current_practices"
            rows={2}
            value={formData.current_practices}
            onChange={handleChange}
            placeholder="e.g. Organic straw mulching, vermicomposting, zero tillage"
            className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900 text-xs font-medium"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded text-xs font-semibold text-white bg-green-700 hover:bg-green-800 shadow-xs flex items-center space-x-1.5 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Farm Profile & Trigger AI Advisories</span>
        </button>
      </form>

      {/* Active Crops */}
      {farms.length > 0 && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Active Field Crops</h3>
            <button
              onClick={() => setShowCropModal(true)}
              className="px-3 py-1.5 rounded text-xs font-semibold text-green-800 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Crop
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {farms[0].crops?.map((crop, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-200 space-y-0.5">
                <span className="font-bold text-slate-900 block">{crop.crop_name}</span>
                {crop.variety && <p className="text-[11px] text-slate-600">Variety: {crop.variety}</p>}
                {crop.area_acres && <p className="text-[11px] text-slate-600">Area: {crop.area_acres} Acres</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white w-full max-w-md p-5 rounded-lg border border-slate-200 space-y-3 shadow-md">
            <h3 className="text-sm font-bold text-slate-900">Add New Crop</h3>
            <form onSubmit={handleAddCrop} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Crop Name (e.g. Maize)"
                value={newCrop.crop_name}
                onChange={(e) => setNewCrop({ ...newCrop, crop_name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900"
              />
              <input
                type="text"
                placeholder="Variety (Optional)"
                value={newCrop.variety}
                onChange={(e) => setNewCrop({ ...newCrop, variety: e.target.value })}
                className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCropModal(false)}
                  className="px-3 py-1.5 rounded text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-green-700 hover:bg-green-800 shadow-xs"
                >
                  Add Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
