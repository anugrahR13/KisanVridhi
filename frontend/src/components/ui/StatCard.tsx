import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'blue' | 'purple' | 'teal';
  trend?: string;
}

const colorMap = {
  emerald: 'bg-emerald-100/80 text-emerald-700 border-emerald-300/80 shadow-emerald-500/10',
  amber: 'bg-amber-100/80 text-amber-700 border-amber-300/80 shadow-amber-500/10',
  blue: 'bg-blue-100/80 text-blue-700 border-blue-300/80 shadow-blue-500/10',
  purple: 'bg-purple-100/80 text-purple-700 border-purple-300/80 shadow-purple-500/10',
  teal: 'bg-teal-100/80 text-teal-700 border-teal-300/80 shadow-teal-500/10',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'emerald',
  trend
}) => {
  return (
    <div className="glass-card-interactive p-6 rounded-3xl border border-white/80 space-y-3 group">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-3 rounded-2xl border backdrop-blur-md ${colorMap[color]} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-black text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-slate-500 font-bold">{subtext}</p>}
    </div>
  );
};
