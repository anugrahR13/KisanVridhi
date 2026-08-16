import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { farmService, authService } from '../services/appServices';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState('Anugrah Sharma');
  const [language, setLanguage] = useState('English');
  const [location, setLocation] = useState('Ludhiana, Punjab');
  const [areaAcres, setAreaAcres] = useState(4.5);
  const [cropName, setCropName] = useState('Wheat');
  const [season, setSeason] = useState('Rabi');
  const [waterSource, setWaterSource] = useState('Borewell + Rainwater Harvesting');
  const [irrigationType, setIrrigationType] = useState('Drip Irrigation');
  const [goals, setGoals] = useState<string[]>(['Water conservation', 'Lower expenses']);

  const toggleGoal = (g: string) => {
    if (goals.includes(g)) setGoals(goals.filter(item => item !== g));
    else setGoals([...goals, g]);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Create farm with onboarding inputs
      await farmService.createFarm({
        farm_name: `${cropName} Farm`,
        location,
        area_acres: areaAcres,
        soil_type: 'Loamy',
        irrigation_type: irrigationType,
        water_source: waterSource,
        primary_crop: cropName,
        current_practices: goals.join(', ')
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* Progress Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Sprout className="w-5 h-5 text-green-700" />
            <span className="font-bold text-slate-900 text-sm">KisanVridhi Setup</span>
          </div>
          <span className="text-xs font-semibold text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-200">
            Step {step} of 5
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-green-700 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Step 1: About You */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 1: About You</h2>
              <p className="text-slate-600 mt-0.5">Enter your basic profile details.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 rounded bg-white border border-slate-300 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2.5 rounded bg-white border border-slate-300 text-slate-900 font-medium"
              >
                <option value="English">English</option>
                <option value="Hindi">हिंदी (Hindi)</option>
                <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Marathi">मराठी (Marathi)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Your Farm */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 2: Your Farm Details</h2>
              <p className="text-slate-600 mt-0.5">Where is your agricultural land located?</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">District / Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Ludhiana, Punjab"
                className="w-full p-2.5 rounded bg-white border border-slate-300 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Area (Acres)</label>
              <input
                type="number"
                step="0.5"
                value={areaAcres}
                onChange={(e) => setAreaAcres(parseFloat(e.target.value))}
                className="w-full p-2.5 rounded bg-white border border-slate-300 text-slate-900 font-medium"
              />
            </div>
          </div>
        )}

        {/* Step 3: Your Crop */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 3: Primary Crop</h2>
              <p className="text-slate-600 mt-0.5">What is your main crop this season?</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Crop Name</label>
              <input
                type="text"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Wheat, Paddy, Cotton"
                className="w-full p-2.5 rounded bg-white border border-slate-300 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Farming Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full p-2.5 rounded bg-white border border-slate-300 text-slate-900 font-medium"
              >
                <option value="Rabi">Rabi (Winter - Wheat, Mustard)</option>
                <option value="Kharif">Kharif (Monsoon - Rice, Cotton)</option>
                <option value="Zaid">Zaid (Summer - Vegetables, Pulses)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Your Resources */}
        {step === 4 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 4: Water & Irrigation</h2>
              <p className="text-slate-600 mt-0.5">Select your irrigation and water resources.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Water Source</label>
              <select
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                className="w-full p-2.5 rounded bg-white border border-slate-300 text-slate-900 font-medium"
              >
                <option value="Borewell + Rainwater Harvesting">Borewell + Rainwater Harvesting</option>
                <option value="Tube well">Tube well</option>
                <option value="Canal / River">Canal / River</option>
                <option value="Farm Pond">Farm Pond</option>
                <option value="Rainfed Only">Rainfed Only</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Irrigation Method</label>
              <select
                value={irrigationType}
                onChange={(e) => setIrrigationType(e.target.value)}
                className="w-full p-2.5 rounded bg-white border border-slate-300 text-slate-900 font-medium"
              >
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
                <option value="Flood Irrigation">Flood Irrigation</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 5: Your Goals */}
        {step === 5 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 5: Your Farm Goals</h2>
              <p className="text-slate-600 mt-0.5">Select what you wish to optimize with KisanVridhi AI.</p>
            </div>

            <div className="space-y-2">
              {['Water conservation', 'Lower expenses', 'Crop health', 'Sustainable farming'].map(g => (
                <div
                  key={g}
                  onClick={() => toggleGoal(g)}
                  className={`p-3 rounded border cursor-pointer flex items-center justify-between transition-colors ${
                    goals.includes(g) ? 'bg-green-50 border-green-300 text-green-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{g}</span>
                  {goals.includes(g) && <CheckCircle2 className="w-4 h-4 text-green-700" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-slate-500 text-xs font-semibold hover:underline"
            >
              Skip Setup
            </button>
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1 disabled:opacity-50"
            >
              {loading ? 'Finalizing Setup...' : 'Complete & Open Action Center'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
