import React, { useState, useEffect, useRef } from 'react';
import { diseaseService } from '../services/appServices';
import { DiseaseDiagnosis } from '../types';
import { Bot, Camera, Image as ImageIcon, AlertTriangle, Sparkles, Leaf, UserCheck, RefreshCw, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CropHealthAnalysisPage: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseDiagnosis | null>(null);
  const [activeTab, setActiveTab] = useState<'organic' | 'chemical'>('organic');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const diag = await diseaseService.analyze(selectedCrop, file || undefined);
      setResult(diag);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Crop analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-green-700" /> Agricultural Crop Health Inspection Tool
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Capture field leaf photos or select your crop for instant AI pathogen diagnosis and KVK expert escalation options.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload / Capture Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Select Crop & Leaf Photo
          </h3>

          <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Crop</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 rounded bg-white border border-slate-300 font-medium"
              >
                <option value="Tomato">Tomato</option>
                <option value="Wheat">Wheat</option>
                <option value="Potato">Potato</option>
                <option value="Rice">Rice / Paddy</option>
                <option value="Cotton">Cotton</option>
              </select>
            </div>

            {/* Hidden Input Elements */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              ref={galleryInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Image Capture Actions */}
            {!previewUrl ? (
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Field Leaf Image (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="touch-target p-3 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 font-semibold rounded-md flex flex-col items-center justify-center space-y-1 transition-colors"
                  >
                    <Camera className="w-5 h-5 text-green-700" />
                    <span className="text-[11px]">Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="touch-target p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-md flex flex-col items-center justify-center space-y-1 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-slate-600" />
                    <span className="text-[11px]">Choose from Gallery</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span>Leaf Image Preview</span>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="text-red-600 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <X className="w-3.5 h-3.5" /> Remove Image
                  </button>
                </div>
                <div className="relative rounded border border-slate-200 overflow-hidden max-h-48 bg-slate-50 flex items-center justify-center">
                  <img src={previewUrl} alt="Leaf Preview" className="max-h-48 object-contain" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded text-xs font-semibold text-white bg-green-700 hover:bg-green-800 shadow-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Analyzing Leaf Sample...' : 'Run Crop Pathogen Inspection (+30 XP)'}</span>
            </button>
          </form>
        </div>

        {/* Diagnostic Inspection Results Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-4">
          {!result ? (
            <div className="flex flex-col items-center justify-center min-h-[220px] text-center space-y-2">
              <Leaf className="w-10 h-10 text-green-700 mb-1" />
              <h3 className="text-sm font-bold text-slate-900">Ready for Field Crop Health Inspection</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Select your crop, capture a leaf photo, and click 'Run Crop Pathogen Inspection' for AI diagnosis and recommended treatments.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase text-green-800">Target Crop: {result.crop_detected}</span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">{result.disease_name}</h2>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-bold">
                    {Math.round(result.confidence_score * 100)}% Confidence
                  </span>
                  <p className="text-xs font-semibold text-rose-700 mt-1">Severity: {result.severity}</p>
                </div>
              </div>

              {/* Uncertainty Warning if Confidence < 75% */}
              {result.expert_escalation_required && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded space-y-1.5 text-xs text-amber-950">
                  <div className="flex items-center space-x-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>AI Model Uncertainty Warning (&lt; 75% Confidence)</span>
                  </div>
                  <p className="text-amber-900 leading-snug">
                    {result.uncertainty_warning || 'Model confidence is under 75%. Please consult your local KVK or extension specialist before applying chemical sprays.'}
                  </p>
                  <div className="pt-1">
                    <Link
                      to="/community"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-950 underline hover:text-amber-800"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Ask Krishi Vigyan Kendra Specialist on Community Forum
                    </Link>
                  </div>
                </div>
              )}

              {/* Treatment Options */}
              <div className="space-y-2">
                <div className="flex space-x-2 bg-slate-100 p-1 rounded w-fit">
                  <button
                    onClick={() => setActiveTab('organic')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      activeTab === 'organic' ? 'bg-green-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    🌿 Organic Remedy (Recommended)
                  </button>
                  <button
                    onClick={() => setActiveTab('chemical')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      activeTab === 'chemical' ? 'bg-green-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    🧪 Chemical Intervention
                  </button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 leading-relaxed font-medium">
                  {activeTab === 'organic' ? result.organic_treatment : result.chemical_treatment}
                </div>
              </div>

              {/* Preventive Steps */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Preventive Field Management</span>
                <p className="text-slate-700 leading-snug">{result.preventive_measure}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
