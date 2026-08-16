import React, { useState, useEffect } from 'react';
import { Tractor, ChevronDown } from 'lucide-react';
import { farmService } from '../../services/appServices';
import { Farm } from '../../types';

interface FarmSelectorProps {
  onFarmChange?: (farm: Farm) => void;
  className?: string;
}

export const FarmSelector: React.FC<FarmSelectorProps> = ({ onFarmChange, className = '' }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  useEffect(() => {
    farmService.getFarms()
      .then(data => {
        setFarms(data);
        if (data.length > 0) {
          setSelectedFarm(data[0]);
          if (onFarmChange) onFarmChange(data[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelect = (farmId: number) => {
    const found = farms.find(f => f.id === farmId);
    if (found) {
      setSelectedFarm(found);
      if (onFarmChange) onFarmChange(found);
    }
  };

  if (farms.length === 0) {
    return (
      <div className={`flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 ${className}`}>
        <Tractor className="w-4 h-4 text-green-700 shrink-0" />
        <span>No Farm Registered</span>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-md px-3 py-1.5">
        <Tractor className="w-4 h-4 text-green-700 shrink-0" />
        <select
          value={selectedFarm?.id}
          onChange={(e) => handleSelect(Number(e.target.value))}
          className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-4"
          aria-label="Select Farm"
        >
          {farms.map(f => (
            <option key={f.id} value={f.id}>
              {f.farm_name} • {f.area_acres} acres ({f.primary_crop})
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500 pointer-events-none -ml-4" />
      </div>
    </div>
  );
};
