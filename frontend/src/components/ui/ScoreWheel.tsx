import React from 'react';
import type { SustainabilityBreakdown } from '../../types';
import { Droplets, Sprout, Recycle, Grid, Sun } from 'lucide-react';

interface ScoreWheelProps {
  breakdown: SustainabilityBreakdown;
}

export const ScoreWheel: React.FC<ScoreWheelProps> = ({ breakdown }) => {
  const overall = Math.round(breakdown.overall_score || 50);

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'text-emerald-800 bg-emerald-100/80 border-emerald-300';
    if (score >= 60) return 'text-amber-800 bg-amber-100/80 border-amber-300';
    return 'text-rose-800 bg-rose-100/80 border-rose-300';
  };

  const subCategories = [
    { label: 'Water Management', score: breakdown.water_score, icon: Droplets, color: 'bg-blue-100/80 text-blue-700 border-blue-300' },
    { label: 'Soil Health', score: breakdown.soil_score, icon: Sprout, color: 'bg-emerald-100/80 text-emerald-700 border-emerald-300' },
    { label: 'Waste Management', score: breakdown.waste_score, icon: Recycle, color: 'bg-amber-100/80 text-amber-700 border-amber-300' },
    { label: 'Crop Diversity', score: breakdown.diversity_score, icon: Grid, color: 'bg-purple-100/80 text-purple-700 border-purple-300' },
    { label: 'Resource Conservation', score: breakdown.resource_score, icon: Sun, color: 'bg-teal-100/80 text-teal-700 border-teal-300' },
  ];

  return (
    <div className="glass-panel-premium p-6 lg:p-8 rounded-3xl border border-white/80 flex flex-col md:flex-row items-center gap-8 shadow-lg">
      {/* Circle Gauge */}
      <div className="relative flex items-center justify-center w-52 h-52 shrink-0 group">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            className="stroke-slate-200/80"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            className="stroke-emerald-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
            strokeWidth="10"
            strokeDasharray={264}
            strokeDashoffset={264 - (264 * overall) / 100}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute text-center flex flex-col items-center group-hover:scale-105 transition-transform">
          <span className="text-5xl font-black text-slate-900 tracking-tight">{overall}</span>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 mt-0.5">/ 100</span>
          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full mt-1.5 border border-emerald-300 shadow-xs">
            Sustainability Score
          </span>
        </div>
      </div>

      {/* Sub Scores Grid */}
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {subCategories.map((sub, idx) => (
          <div key={idx} className="glass-card-interactive p-4 rounded-2xl border border-white/90 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl border backdrop-blur-md ${sub.color}`}>
                <sub.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-slate-800">{sub.label}</span>
            </div>
            <span className={`text-xs font-black px-3 py-1 rounded-xl border backdrop-blur-md shadow-xs ${getScoreBadge(sub.score)}`}>
              {Math.round(sub.score)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
