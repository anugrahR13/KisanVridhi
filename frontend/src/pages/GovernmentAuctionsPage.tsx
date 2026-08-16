import React, { useState, useEffect } from 'react';
import { auctionService } from '../services/appServices';
import { GovernmentAuction } from '../types';
import { Building2, CheckCircle2, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const GovernmentAuctionsPage: React.FC = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<GovernmentAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAuctions = async () => {
    try {
      const data = await auctionService.getAuctions();
      setAuctions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleApply = async (id: number) => {
    setMessage('');
    setError('');
    try {
      const res = await auctionService.applyAuction(id);
      setMessage(res.message);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Application failed.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Building2 className="w-8 h-8 text-emerald-600 animate-pulse" />
          <span>Government MSP Auctions & Procurement Portal</span>
        </h1>
        <p className="text-xs text-slate-600 font-bold mt-1">Direct government crop procurement at Minimum Support Price (MSP) for verified sustainable farmers</p>
      </div>

      {/* User Sustainability Score Qualification Banner */}
      <div className="glass-panel-premium p-6 rounded-3xl border border-white/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Your Verified Sustainability Score</h3>
            <p className="text-xs text-slate-600 font-medium">Farmers with scores &gt; 60 qualify for direct government MSP auctions</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-100/90 text-emerald-950 px-4 py-2 rounded-2xl border border-emerald-300 shadow-xs">
          <span className="text-xl font-black">{user?.sustainability_score || 76} / 100</span>
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white px-2 py-0.5 rounded-full">Qualified</span>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-100/90 border border-rose-300 text-rose-950 text-xs font-bold flex items-center space-x-2 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Auctions Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {auctions.map((auc) => {
            const isQualified = (user?.sustainability_score || 76) >= auc.min_sustainability_score_required;

            return (
              <div key={auc.id} className="glass-card-interactive p-6 rounded-3xl border border-white/90 space-y-4 flex flex-col justify-between shadow-md">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-base font-black text-slate-900 leading-snug">{auc.title}</span>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      ₹{auc.msp_price_per_quintal} / Quintal
                    </span>
                  </div>

                  <div className="glass-panel p-3.5 rounded-2xl border border-white/80 space-y-1 text-xs">
                    <p><strong>Crop Type:</strong> {auc.crop_type}</p>
                    <p><strong>Region:</strong> {auc.location_region}</p>
                    <p><strong>Procurement Agency:</strong> {auc.procurement_agency}</p>
                    <p><strong>Deadline:</strong> {auc.deadline_date}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 font-bold">
                    <span className="text-slate-600">Required Score: {auc.min_sustainability_score_required}+</span>
                    <span className={isQualified ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'}>
                      {isQualified ? 'Eligible to Apply' : 'Score Too Low'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleApply(auc.id)}
                  disabled={!isQualified}
                  className="w-full py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 hover:scale-[1.01]"
                >
                  <span>Apply for MSP Direct Procurement</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
