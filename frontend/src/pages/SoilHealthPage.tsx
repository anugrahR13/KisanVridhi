import React, { useState, useEffect } from 'react';
import { TestTube, Plus, Lightbulb, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { soilService, farmService } from '../services/appServices';
import { SoilRecord, Farm } from '../types';

export const SoilHealthPage: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>(undefined);
  const [soilRecords, setSoilRecords] = useState<SoilRecord[]>([]);
  const [selectedGuidance, setSelectedGuidance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [ph, setPh] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [organicCarbon, setOrganicCarbon] = useState('');
  const [soilType, setSoilType] = useState('Loamy');
  const [testedAt, setTestedAt] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const farmsList = await farmService.getFarms();
      setFarms(farmsList);
      const activeFarmId = selectedFarmId || (farmsList.length > 0 ? farmsList[0].id : undefined);

      if (activeFarmId) {
        setSelectedFarmId(activeFarmId);
        const records = await soilService.getRecords(activeFarmId);
        setSoilRecords(records);
        if (records.length > 0) {
          const guidance = await soilService.getGuidance(records[0].id);
          setSelectedGuidance(guidance);
        } else {
          setSelectedGuidance(null);
        }
      }
    } catch (err) {
      console.error('Error loading soil records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFarmId]);

  const handleSelectRecord = async (soilId: number) => {
    try {
      const guidance = await soilService.getGuidance(soilId);
      setSelectedGuidance(guidance);
    } catch (err) {
      console.error('Error fetching soil guidance:', err);
    }
  };

  const handleAddSoilRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmId) return;
    try {
      await soilService.createRecord({
        farm_id: selectedFarmId,
        ph: ph ? parseFloat(ph) : undefined,
        nitrogen_ppm: nitrogen ? parseFloat(nitrogen) : undefined,
        phosphorus_ppm: phosphorus ? parseFloat(phosphorus) : undefined,
        potassium_ppm: potassium ? parseFloat(potassium) : undefined,
        organic_carbon_percent: organicCarbon ? parseFloat(organicCarbon) : undefined,
        soil_type: soilType,
        tested_at: testedAt,
        notes
      });
      setShowForm(false);
      setPh('');
      setNitrogen('');
      setPhosphorus('');
      setPotassium('');
      setOrganicCarbon('');
      setNotes('');
      loadData();
    } catch (err) {
      console.error('Error creating soil record:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-green-700" /> Soil Health & Nutrient Management
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Track soil lab test metrics (pH, N-P-K, Organic Carbon) and receive safe, educational soil management advice.
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
                <option key={f.id} value={f.id}>{f.farm_name} ({f.soil_type})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Soil Records & Test Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Historical Soil Test Logs</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Log Soil Lab Test
              </button>
            </div>

            {/* Add Soil Test Form */}
            {showForm && (
              <form onSubmit={handleAddSoilRecord} className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-3">
                <h3 className="text-xs font-bold text-slate-800">Record Soil Health Test Parameters</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">pH Level</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 6.8"
                      value={ph}
                      onChange={(e) => setPh(e.target.value)}
                      className="w-full border border-slate-300 p-2 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nitrogen (PPM)</label>
                    <input
                      type="number"
                      placeholder="e.g. 160"
                      value={nitrogen}
                      onChange={(e) => setNitrogen(e.target.value)}
                      className="w-full border border-slate-300 p-2 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Phosphorus (PPM)</label>
                    <input
                      type="number"
                      placeholder="e.g. 35"
                      value={phosphorus}
                      onChange={(e) => setPhosphorus(e.target.value)}
                      className="w-full border border-slate-300 p-2 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Potassium (PPM)</label>
                    <input
                      type="number"
                      placeholder="e.g. 210"
                      value={potassium}
                      onChange={(e) => setPotassium(e.target.value)}
                      className="w-full border border-slate-300 p-2 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Organic Carbon (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 0.65"
                      value={organicCarbon}
                      onChange={(e) => setOrganicCarbon(e.target.value)}
                      className="w-full border border-slate-300 p-2 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Test Date</label>
                    <input
                      type="date"
                      value={testedAt}
                      onChange={(e) => setTestedAt(e.target.value)}
                      required
                      className="w-full border border-slate-300 p-2 rounded bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-green-700 hover:bg-green-800 text-white rounded shadow-xs"
                  >
                    Save Soil Test Log
                  </button>
                </div>
              </form>
            )}

            {/* Soil Records Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-3">Test Date</th>
                    <th className="p-3">Soil Type</th>
                    <th className="p-3">pH</th>
                    <th className="p-3">Nitrogen (N)</th>
                    <th className="p-3">Phosphorus (P)</th>
                    <th className="p-3">Potassium (K)</th>
                    <th className="p-3">Organic Carbon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {soilRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500">No soil test records logged yet.</td>
                    </tr>
                  ) : (
                    soilRecords.map(rec => (
                      <tr
                        key={rec.id}
                        onClick={() => rec.id && handleSelectRecord(rec.id)}
                        className={`cursor-pointer hover:bg-slate-50 ${selectedGuidance?.record?.id === rec.id ? 'bg-green-50/60 font-medium' : ''}`}
                      >
                        <td className="p-3 font-semibold text-slate-900">{rec.tested_at}</td>
                        <td className="p-3">{rec.soil_type}</td>
                        <td className="p-3 font-bold text-slate-800">{rec.ph || '-'}</td>
                        <td className="p-3">{rec.nitrogen_ppm ? `${rec.nitrogen_ppm} ppm` : '-'}</td>
                        <td className="p-3">{rec.phosphorus_ppm ? `${rec.phosphorus_ppm} ppm` : '-'}</td>
                        <td className="p-3">{rec.potassium_ppm ? `${rec.potassium_ppm} ppm` : '-'}</td>
                        <td className="p-3">{rec.organic_carbon_percent ? `${rec.organic_carbon_percent}%` : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Educational Soil Guidance */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Lightbulb className="w-4 h-4 text-amber-600" /> Educational Soil Advice
            </h2>

            {!selectedGuidance || !selectedGuidance.educational_guidance || selectedGuidance.educational_guidance.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Select a soil test log to view personalized educational soil health recommendations.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedGuidance.educational_guidance.map((g: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1 text-xs">
                    <span className="font-bold text-slate-900 block">{g.nutrient}</span>
                    <p className="text-slate-600">{g.observation}</p>
                    <p className="text-slate-800 font-medium bg-white p-2 rounded border border-slate-200 mt-1 leading-snug">
                      <strong className="text-green-800">Recommendation:</strong> {g.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
