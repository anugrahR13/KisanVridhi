import React, { useState, useEffect } from 'react';
import { cropTrackingService } from '../services/appServices';
import { CropTracking } from '../types';
import { Sprout, CheckCircle2, Calendar, Droplets, ArrowRight } from 'lucide-react';

export const CropTrackingPage: React.FC = () => {
  const [crops, setCrops] = useState<CropTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState('Tillering');

  const fetchCrops = async () => {
    try {
      const data = await cropTrackingService.getCrops();
      setCrops(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleStageUpdate = async (id: number) => {
    try {
      await cropTrackingService.updateGrowthStage(id, { growth_stage: selectedStage });
      alert(`Updated growth stage to ${selectedStage}!`);
      await fetchCrops();
    } catch (err) {
      console.error(err);
    }
  };

  const stages = ['Sowing', 'Sprouting', 'Tillering', 'Flowering', 'Harvest'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Sprout className="w-8 h-8 text-emerald-600 animate-pulse" />
          <span>Crop Growth Stage & Irrigation Tracker</span>
        </h1>
        <p className="text-xs text-slate-600 font-bold mt-1">Track crop growth milestones, soil moisture levels, and water scheduling for optimal yields</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {crops.map((crop) => (
            <div key={crop.id} className="glass-panel-premium p-6 rounded-3xl border border-white/80 space-y-6 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{crop.crop_name} ({crop.variety})</h3>
                  <p className="text-xs text-slate-500 font-bold">Area: {crop.area_acres} Acres • Planted on {crop.planting_date}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black">
                  Stage: {crop.growth_stage}
                </span>
              </div>

              {/* Growth Stage Progress Timeline */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-700">Growth Timeline Milestone</span>
                <div className="grid grid-cols-5 gap-2">
                  {stages.map((stg, sIdx) => {
                    const isCurrent = crop.growth_stage === stg;
                    return (
                      <div
                        key={sIdx}
                        onClick={() => {
                          setSelectedStage(stg);
                          handleStageUpdate(crop.id);
                        }}
                        className={`p-3 rounded-2xl text-center border cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black border-emerald-600 shadow-md scale-105'
                            : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        <span className="text-xs font-bold block">{stg}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Soil Moisture & Water Schedule Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-2xl border border-white/90 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Soil Moisture</span>
                  <p className="text-sm font-black text-blue-700">Optimal (45%)</p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/90 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Irrigation Schedule</span>
                  <p className="text-sm font-black text-emerald-800">Every 4 days (Drip)</p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/90 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Estimated Yield</span>
                  <p className="text-sm font-black text-amber-700">18.5 Quintals / Acre</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
