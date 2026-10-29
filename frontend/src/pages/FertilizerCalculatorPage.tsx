import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calculator, CheckCircle2, AlertCircle, TrendingDown, 
  Calendar, Sprout, ArrowRight, DollarSign, Layers, Plus, 
  Leaf, ShieldAlert, Award, FileText, Check, HelpCircle
} from 'lucide-react';
import { fertilizerService, soilService, farmService, taskService } from '../services/appServices';
import { FertilizerOptimizationResponse, Farm, SoilRecord } from '../types';

export const FertilizerCalculatorPage: React.FC = () => {
  // Input parameters
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [areaAcres, setAreaAcres] = useState<number>(2.5);
  const [fymApplied, setFymApplied] = useState<boolean>(false);
  const [soilMode, setSoilMode] = useState<'quick' | 'lab'>('quick');
  const [soilFertilityLevel, setSoilFertilityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Specific lab values
  const [labN, setLabN] = useState<string>('165');
  const [labP, setLabP] = useState<string>('38');
  const [labK, setLabK] = useState<string>('210');
  const [labOC, setLabOC] = useState<string>('0.55');

  // Farm and Soil auto-loading
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarmId, setActiveFarmId] = useState<number | null>(null);
  const [latestSoilRecord, setLatestSoilRecord] = useState<SoilRecord | null>(null);

  // Execution state
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FertilizerOptimizationResponse | null>(null);
  const [tasksCreated, setTasksCreated] = useState<boolean>(false);
  const [taskCreating, setTaskCreating] = useState<boolean>(false);

  // Available crop options
  const cropList = [
    { name: 'Wheat', standardYield: '20 quintals/acre', season: 'Rabi' },
    { name: 'Paddy / Rice', standardYield: '25 quintals/acre', season: 'Kharif' },
    { name: 'Cotton', standardYield: '12 quintals/acre', season: 'Kharif' },
    { name: 'Sugarcane', standardYield: '350 quintals/acre', season: 'Annual' },
    { name: 'Maize', standardYield: '30 quintals/acre', season: 'Kharif/Rabi' },
    { name: 'Tomato', standardYield: '180 quintals/acre', season: 'Vegetable' },
    { name: 'Potato', standardYield: '120 quintals/acre', season: 'Rabi' },
    { name: 'Soybean', standardYield: '10 quintals/acre', season: 'Kharif' },
    { name: 'Mustard', standardYield: '8 quintals/acre', season: 'Rabi' },
    { name: 'Groundnut', standardYield: '12 quintals/acre', season: 'Kharif' },
  ];

  // Load farms on mount to offer auto-fill from soil records
  useEffect(() => {
    farmService.getFarms().then((farmList) => {
      setFarms(farmList);
      if (farmList.length > 0) {
        setActiveFarmId(farmList[0].id);
        if (farmList[0].primary_crop) {
          const match = cropList.find(c => c.name.toLowerCase().includes(farmList[0].primary_crop.toLowerCase()));
          if (match) setSelectedCrop(match.name);
        }
        if (farmList[0].area_acres) {
          setAreaAcres(farmList[0].area_acres);
        }
        soilService.getRecords(farmList[0].id).then((records) => {
          if (records.length > 0) {
            setLatestSoilRecord(records[0]);
          }
        }).catch(() => {});
      }
    }).catch(() => {});

    // Initial calculation for immediate insight
    calculateDosage('Wheat', 2.5, false, 165, 38, 210, 0.55);
  }, []);

  const handleApplySoilRecord = () => {
    if (!latestSoilRecord) return;
    setSoilMode('lab');
    if (latestSoilRecord.nitrogen_ppm) setLabN(String(latestSoilRecord.nitrogen_ppm));
    if (latestSoilRecord.phosphorus_ppm) setLabP(String(latestSoilRecord.phosphorus_ppm));
    if (latestSoilRecord.potassium_ppm) setLabK(String(latestSoilRecord.potassium_ppm));
    if (latestSoilRecord.organic_carbon_percent) setLabOC(String(latestSoilRecord.organic_carbon_percent));
  };

  const calculateDosage = async (
    crop: string, 
    acres: number, 
    fym: boolean, 
    nVal?: number, 
    pVal?: number, 
    kVal?: number, 
    ocVal?: number
  ) => {
    setLoading(true);
    setTasksCreated(false);
    try {
      let finalN = nVal;
      let finalP = pVal;
      let finalK = kVal;

      if (soilMode === 'quick') {
        if (soilFertilityLevel === 'low') {
          finalN = 100;
          finalP = 15;
          finalK = 110;
        } else if (soilFertilityLevel === 'high') {
          finalN = 250;
          finalP = 65;
          finalK = 350;
        } else {
          finalN = 165;
          finalP = 38;
          finalK = 210;
        }
      }

      const res = await fertilizerService.optimize({
        crop_name: crop,
        area_acres: acres,
        nitrogen_ppm: finalN,
        phosphorus_ppm: finalP,
        potassium_ppm: finalK,
        organic_carbon_pct: ocVal,
        farmyard_manure_applied: fym
      });
      setResult(res);
    } catch (err: any) {
      console.error('Fertilizer calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = soilMode === 'lab' ? parseFloat(labN) || 165 : undefined;
    const p = soilMode === 'lab' ? parseFloat(labP) || 38 : undefined;
    const k = soilMode === 'lab' ? parseFloat(labK) || 210 : undefined;
    const oc = soilMode === 'lab' ? parseFloat(labOC) || 0.55 : undefined;

    calculateDosage(selectedCrop, areaAcres, fymApplied, n, p, k, oc);
  };

  const handleAddScheduleToTasks = async () => {
    if (!result || !result.application_schedule) return;
    setTaskCreating(true);
    try {
      const today = new Date();
      for (let i = 0; i < result.application_schedule.length; i++) {
        const stage = result.application_schedule[i];
        let offsetDays = 0;
        if (i === 1) offsetDays = 22;
        if (i === 2) offsetDays = 50;

        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + offsetDays);

        const taskTitle = `Fertilizer Application: ${stage.stage_name} (${result.crop_name})`;
        const taskDesc = `${stage.instructions} Requirement: DAP ${stage.dap_bags} bags, Urea ${stage.urea_bags} bags, MOP ${stage.mop_bags} bags.`;

        await taskService.createTask({
          title: taskTitle,
          description: taskDesc,
          due_date: dueDate.toISOString().split('T')[0],
          category: 'Fertilizer',
          farm_id: activeFarmId || undefined
        });
      }
      setTasksCreated(true);
    } catch (err) {
      console.error('Error adding schedule tasks:', err);
      alert('Failed to automatically schedule tasks. Please check your tasks page.');
    } finally {
      setTaskCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded bg-emerald-700 text-white shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Smart NPK Fertilizer & DAP-Urea Optimizer
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ICAR RDF Scientific Standard
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Precision calculation of commercial fertilizer bags (DAP 50kg, Urea 45kg, MOP 50kg) eliminating Nitrogen double-counting, preventing overdosing, and saving input costs.
          </p>
        </div>

        {latestSoilRecord && (
          <button
            type="button"
            onClick={handleApplySoilRecord}
            className="self-start sm:self-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span>Load Soil Test ({latestSoilRecord.soil_type || 'Lab Record'})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Form Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Farm & Crop Parameters</span>
              <span className="text-[11px] font-normal text-slate-500">Step 1 of 2</span>
            </h2>

            <form onSubmit={handleCalculateSubmit} className="space-y-4 text-xs">
              {/* Crop Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Field Crop
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white border border-slate-300 font-medium text-slate-900 focus:outline-none focus:border-emerald-700"
                >
                  {cropList.map((crop) => (
                    <option key={crop.name} value={crop.name}>
                      {crop.name} ({crop.season} — Expected {crop.standardYield})
                    </option>
                  ))}
                </select>
              </div>

              {/* Area Acres */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Cultivated Area (Acres)</label>
                  <span className="font-bold text-emerald-800 text-sm">{areaAcres} Acres</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0.5 Acre</span>
                  <span>10 Acres</span>
                  <span>25 Acres</span>
                  <span>50 Acres</span>
                </div>
              </div>

              {/* Soil Assessment Mode Toggle */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700">Soil Nutrient Status</label>
                  <div className="flex bg-slate-100 p-0.5 rounded text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSoilMode('quick')}
                      className={`px-2 py-0.5 rounded font-medium transition-colors ${
                        soilMode === 'quick' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Quick Level
                    </button>
                    <button
                      type="button"
                      onClick={() => setSoilMode('lab')}
                      className={`px-2 py-0.5 rounded font-medium transition-colors ${
                        soilMode === 'lab' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Lab Soil Test
                    </button>
                  </div>
                </div>

                {soilMode === 'quick' ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: 'Low Fertility', sub: '+25% NPK Dose' },
                      { id: 'medium', label: 'Medium (Normal)', sub: 'Standard RDF' },
                      { id: 'high', label: 'High Fertility', sub: '-20% NPK Dose' },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setSoilFertilityLevel(lvl.id as any)}
                        className={`p-2 rounded border text-center transition-all ${
                          soilFertilityLevel === lvl.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-[11px]">{lvl.label}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{lvl.sub}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Available N (ppm)</label>
                      <input
                        type="number"
                        value={labN}
                        onChange={(e) => setLabN(e.target.value)}
                        placeholder="165"
                        className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Available P (ppm)</label>
                      <input
                        type="number"
                        value={labP}
                        onChange={(e) => setLabP(e.target.value)}
                        placeholder="38"
                        className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Available K (ppm)</label>
                      <input
                        type="number"
                        value={labK}
                        onChange={(e) => setLabK(e.target.value)}
                        placeholder="210"
                        className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Organic Carbon %</label>
                      <input
                        type="number"
                        step="0.01"
                        value={labOC}
                        onChange={(e) => setLabOC(e.target.value)}
                        placeholder="0.55"
                        className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-slate-900 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* FYM Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="fymCheckbox"
                  checked={fymApplied}
                  onChange={(e) => setFymApplied(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-700 h-4 w-4 border-slate-300"
                />
                <label htmlFor="fymCheckbox" className="text-slate-700 font-medium cursor-pointer">
                  Incorporated Farmyard Manure (FYM / Gobar Khad) this season
                  <span className="block text-[10px] text-slate-500 font-normal">
                    Applies a 10% organic nutrient credit to reduce chemical requirements.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>{loading ? 'Optimizing Dosage...' : 'Calculate Precision Fertilizer Dosage (+25 XP)'}</span>
              </button>
            </form>
          </div>

          {/* Precision Agronomy Principle Callout */}
          <div className="bg-emerald-950 text-emerald-100 p-4 rounded-lg space-y-2 border border-emerald-900 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>The ICAR Anti-Overdosing Algorithm</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-200/90">
              Traditional farmer practice applies DAP for phosphorus, but neglects that <strong>1 bag of DAP (50kg) also supplies 9kg of pure Nitrogen</strong>. Overlooking this causes rampant Urea overdosing, triggering foliar pest attacks, crop lodging, and excessive spending.
            </p>
          </div>
        </div>

        {/* Right Column: Fertilizer Bags, Cost Savings, and Split Schedule (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {!result ? (
            <div className="bg-white border border-slate-200 p-8 rounded-lg text-center space-y-2">
              <Sprout className="w-8 h-8 text-emerald-700 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Ready to Compute Fertilizer Dosage</h3>
              <p className="text-xs text-slate-500">Configure your crop and acreage on the left to view exact bag counts.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Commercial Fertilizer Bags Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* DAP Card */}
                <div className="bg-white border border-emerald-200 rounded-lg p-4 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-50 rounded-bl-full flex items-start justify-end p-2 text-emerald-800 font-black text-xs">
                    50kg
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-800">
                    Phosphorus (P) Source
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {result.commercial_bags.dap_bags}
                    </span>
                    <span className="text-xs font-bold text-slate-600">Bags DAP</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Total: {result.commercial_bags.dap_weight_kg} kg (@ ₹1,350/bag)
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-emerald-900 font-medium">
                    Supplies 23kg P₂O₅ + 9kg N per bag
                  </div>
                </div>

                {/* Urea Card */}
                <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-blue-50 rounded-bl-full flex items-start justify-end p-2 text-blue-800 font-black text-xs">
                    45kg
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-800">
                    Nitrogen (N) Source
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {result.commercial_bags.urea_bags}
                    </span>
                    <span className="text-xs font-bold text-slate-600">Bags Urea</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Total: {result.commercial_bags.urea_weight_kg} kg (@ ₹267/bag)
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-blue-900 font-medium">
                    Adjusted after DAP Nitrogen deduction
                  </div>
                </div>

                {/* MOP Card */}
                <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-amber-50 rounded-bl-full flex items-start justify-end p-2 text-amber-800 font-black text-xs">
                    50kg
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800">
                    Potassium (K) Source
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {result.commercial_bags.mop_bags}
                    </span>
                    <span className="text-xs font-bold text-slate-600">Bags MOP</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Total: {result.commercial_bags.mop_weight_kg} kg (@ ₹1,700/bag)
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-amber-900 font-medium">
                    Strengthens stem & disease resistance
                  </div>
                </div>
              </div>

              {/* Cost Savings & Environmental Defense Card */}
              <div className="bg-gradient-to-r from-emerald-900 to-green-950 text-white rounded-lg p-4 sm:p-5 shadow-sm border border-emerald-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Financial & Eco Efficiency
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Cost vs. Customary Overdosing Comparison
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/40 text-emerald-300 font-bold text-xs self-start sm:self-center">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <span>Save ₹{result.commercial_bags.estimated_savings_inr.toLocaleString()} Total</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-emerald-950/60 p-3 rounded border border-emerald-800/60 space-y-1">
                    <span className="text-slate-400 text-[11px]">Conventional Overdosed Cost:</span>
                    <p className="text-lg font-bold text-rose-300 line-through">
                      ₹{result.commercial_bags.customary_cost_inr.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Based on standard 1.45x Urea overdosing seen in conventional broadcast practices.
                    </p>
                  </div>

                  <div className="bg-emerald-950/60 p-3 rounded border border-emerald-800/60 space-y-1">
                    <span className="text-slate-400 text-[11px]">Optimized Scientific Cost:</span>
                    <p className="text-lg font-black text-emerald-400">
                      ₹{result.commercial_bags.estimated_cost_inr.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Zero nutrient wastage, preventing nitrate leaching into farm groundwater.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3-Stage Split Application Schedule */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      3-Stage Split Application Timeline
                    </h3>
                    <p className="text-xs text-slate-500">
                      Split dosing maximizes Nitrogen Use Efficiency (NUE) by up to 25%.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddScheduleToTasks}
                    disabled={tasksCreated || taskCreating}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-center ${
                      tasksCreated
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    {tasksCreated ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Scheduled in Farm Tasks
                      </>
                    ) : taskCreating ? (
                      'Adding to Tasks...'
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add Schedule to Farm Tasks
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  {result.application_schedule.map((stage, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{stage.stage_name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
                          {stage.timing}
                        </span>
                      </div>

                      {/* Dosage quantities */}
                      <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                        <span className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-800 font-semibold">
                          DAP: <span className="text-emerald-800">{stage.dap_bags} Bags</span>
                        </span>
                        <span className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-800 font-semibold">
                          Urea: <span className="text-blue-800">{stage.urea_bags} Bags</span>
                        </span>
                        <span className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-800 font-semibold">
                          MOP: <span className="text-amber-800">{stage.mop_bags} Bags</span>
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        {stage.instructions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organic Alternatives & Bio-Fertilizers */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Leaf className="w-4 h-4 text-emerald-700" />
                  Recommended Organic Alternatives & Bio-Fertilizers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {result.organic_alternatives.map((org, oIdx) => (
                    <div key={oIdx} className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-1">
                      <span className="font-bold text-emerald-950 block text-[11px]">{org.item_name}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 block bg-white px-1.5 py-0.5 rounded w-fit border border-emerald-200">
                        {org.dosage}
                      </span>
                      <p className="text-[10px] text-slate-600 leading-snug">{org.benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
