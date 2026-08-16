import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  sublabel?: string;
  color?: 'emerald' | 'amber' | 'blue' | 'purple';
  height?: 'sm' | 'md' | 'lg';
}

const colorStyles = {
  emerald: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
  amber: 'bg-gradient-to-r from-amber-500 to-yellow-400',
  blue: 'bg-gradient-to-r from-blue-600 to-cyan-400',
  purple: 'bg-gradient-to-r from-purple-600 to-indigo-400',
};

const heightStyles = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  label,
  sublabel,
  color = 'emerald',
  height = 'md'
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((current / (max || 1)) * 100)));

  return (
    <div className="w-full">
      {(label || sublabel) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-bold">
          {label && <span className="text-slate-700">{label}</span>}
          {sublabel && <span className="text-slate-500">{sublabel}</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightStyles[height]} p-0.5 border border-slate-200`}>
        <div
          className={`${colorStyles[color]} ${heightStyles[height]} rounded-full transition-all duration-500 shadow-xs`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
