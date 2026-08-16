import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Sparkles, Award, ArrowRight, CheckCircle2, CloudSun, DollarSign, TestTube, Landmark, Store, FileText } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 pb-12">
      {/* Clean Human Hero Header */}
      <div className="bg-white border border-slate-200 p-6 sm:p-10 rounded-lg shadow-xs space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-green-100 text-green-900 border border-green-200 text-xs font-semibold">
          <Sprout className="w-4 h-4 text-green-700" />
          <span>AGRIQUEST • Agricultural Decision Support System</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          AI-Powered Sustainable Farming & Farmer Decision Platform
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          KisanVridhi helps farmers optimize field profitability, schedule weather-guided irrigation, manage soil nutrients, access government subsidies, track Mandi rates, and verify sustainable farming practices.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-md text-xs font-semibold text-white bg-green-700 hover:bg-green-800 shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <span>Sign In to Action Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/register"
            className="px-5 py-2.5 rounded-md text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            Create Farmer Account
          </Link>
        </div>
      </div>

      {/* Decision Modules Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          FARM DECISION SUPPORT MODULES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded w-fit">
              <CloudSun className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Weather & Smart Irrigation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real Open-Meteo REST API forecast converted into crop-specific irrigation advisories to conserve groundwater.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-2">
            <div className="p-2 bg-green-50 text-green-700 rounded w-fit">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Expenses & Profitability</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track category operational costs, harvest yields, net profit, and break-even selling price targets per kg.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded w-fit">
              <TestTube className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Soil Nutrient Guidance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Record lab test pH & N-P-K metrics and receive actionable educational guidance for organic carbon enhancement.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-2">
            <div className="p-2 bg-purple-50 text-purple-700 rounded w-fit">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Government Schemes Finder</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Search verified Central & State government subsidies for drip irrigation, organic farming, equipment, and insurance.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded w-fit">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Mandi Rates & MSP</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verified daily commodity rates across regional Mandis alongside direct Government MSP procurement listings.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-2">
            <div className="p-2 bg-slate-100 text-slate-700 rounded w-fit">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Secure Document Vault</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Store and access land records, soil lab health cards, equipment receipts, and insurance policies securely.
            </p>
          </div>
        </div>
      </div>

      {/* Sustainable Domains Section */}
      <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          10 Sustainable Agricultural Practice Domains
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          {[
            'Water Conservation', 'Soil Health', 'Organic Farming', 'Crop Diversity', 'Waste Management',
            'Composting', 'Integrated Pest Management', 'Resource Conservation', 'Sustainable Irrigation', 'Climate-Smart Farming'
          ].map((cat, idx) => (
            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
              <span className="font-semibold text-slate-800 truncate">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
