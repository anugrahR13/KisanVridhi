import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationService, missionService, farmService } from '../services/appServices';
import { Recommendation, Farm } from '../types';
import { Sparkles, Filter, Play, RefreshCw, AlertCircle } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [recsData, farmsData] = await Promise.all([
        recommendationService.getRecommendations(),
        farmService.getFarms()
      ]);
      setRecommendations(recsData);
      setFarms(farmsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegenerate = async () => {
    if (farms.length === 0) return;
    setGenerating(true);
    try {
      const freshRecs = await recommendationService.generateRecommendations(farms[0].id);
      setRecommendations(freshRecs);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleStartMission = async (missionId?: number) => {
    if (!missionId) {
      navigate('/missions');
      return;
    }
    try {
      await missionService.startMission(missionId, farms[0]?.id);
      navigate('/missions');
    } catch (err) {
      console.error(err);
      navigate('/missions');
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (selectedPriority === 'all') return true;
    return r.priority === selectedPriority;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-700" /> AI Agricultural Recommendation Engine
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Personalized sustainable practice recommendations generated based on your farm location, soil type, and primary crop.
          </p>
        </div>

        {farms.length > 0 && (
          <button
            onClick={handleRegenerate}
            disabled={generating}
            className="mt-3 sm:mt-0 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Regenerating AI...' : 'Re-Run AI Engine'}</span>
          </button>
        )}
      </div>

      {/* Priority Filter */}
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs flex items-center space-x-2 text-xs">
        <Filter className="w-4 h-4 text-slate-500 ml-1" />
        <span className="font-semibold text-slate-700">Filter Priority:</span>
        {['all', 'high', 'medium', 'low'].map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPriority(p)}
            className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-colors ${
              selectedPriority === p
                ? 'bg-green-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-green-700 border-t-transparent" />
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 rounded-lg text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No Recommendations Found</h3>
          <p className="text-xs text-slate-500">Create or update your Farm Profile to trigger farm-specific AI recommendations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((rec) => (
            <div key={rec.id} className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="text-sm font-bold text-slate-900">{rec.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {rec.priority} Priority
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Agricultural Rationale:</span>
                  <p className="text-slate-800 font-medium">{rec.reason}</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-green-800">Impact: {rec.estimated_impact}</span>
                  <span className="text-slate-600">Difficulty: {rec.difficulty}</span>
                </div>
              </div>

              <button
                onClick={() => handleStartMission(rec.related_mission_id)}
                className="w-full py-2 rounded text-xs font-semibold text-white bg-slate-900 hover:bg-green-700 flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Related Sustainable Mission</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
