import React, { useState, useEffect } from 'react';
import { Landmark, ExternalLink, Search, Filter, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { schemeService } from '../services/appServices';
import { GovernmentScheme } from '../types';

export const GovernmentSchemesPage: React.FC = () => {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [stateFilter, setStateFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const data = await schemeService.getSchemes(
        stateFilter === 'All' ? undefined : stateFilter,
        undefined,
        categoryFilter === 'All' ? undefined : categoryFilter
      );
      setSchemes(data);
    } catch (err) {
      console.error('Error loading government schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, [stateFilter, categoryFilter]);

  const filteredSchemes = schemes.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.benefits.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-green-700" /> Government Agriculture Scheme Finder
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Discover verified Central & State government subsidies, equipment grants, insurance schemes, and organic farming incentives.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search schemes or benefits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-xs bg-white focus:ring-green-700"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <label className="text-slate-600">State:</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="border border-slate-300 rounded-md p-1.5 bg-white text-xs font-medium"
            >
              <option value="All">All States</option>
              <option value="All India">All India / Central</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <label className="text-slate-600">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-slate-300 rounded-md p-1.5 bg-white text-xs font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Irrigation">Irrigation Subsidy</option>
              <option value="Organic Farming">Organic Farming</option>
              <option value="Equipment">Equipment Machinery</option>
              <option value="Insurance">Crop Insurance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scheme Cards */}
      <div className="space-y-4">
        {filteredSchemes.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-lg text-center text-xs text-slate-500">
            No government schemes match the selected filters.
          </div>
        ) : (
          filteredSchemes.map(scheme => (
            <div key={scheme.id} className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{scheme.title}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-green-100 text-green-800 border border-green-200">
                      {scheme.state}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {scheme.category}
                    </span>
                    <span className="text-[11px] text-slate-500">Verified: {scheme.last_verified_date}</span>
                  </div>
                </div>

                <a
                  href={scheme.official_source_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-200 transition-colors flex items-center gap-1 shrink-0 self-start sm:self-auto"
                >
                  Official Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1">
                  <strong className="text-slate-900 block font-bold">Financial Benefits</strong>
                  <p className="text-slate-700 leading-snug">{scheme.benefits}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1">
                  <strong className="text-slate-900 block font-bold">Eligibility Criteria</strong>
                  <p className="text-slate-700 leading-snug">{scheme.eligibility}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1">
                  <strong className="text-slate-900 block font-bold">Required Documents</strong>
                  <p className="text-slate-700 leading-snug">{scheme.required_documents}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
