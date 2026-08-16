import React, { useState, useEffect } from 'react';
import { Store, Building2, ExternalLink, Filter, TrendingUp, ShieldCheck } from 'lucide-react';
import { marketService } from '../services/appServices';
import { MarketPrice, GovernmentAuction } from '../types';

export const MarketPage: React.FC = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [auctions, setAuctions] = useState<GovernmentAuction[]>([]);
  const [stateFilter, setStateFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [pricesData, auctionsData] = await Promise.all([
        marketService.getPrices(stateFilter === 'All' ? undefined : stateFilter),
        marketService.getMspAuctions()
      ]);
      setPrices(pricesData);
      setAuctions(auctionsData);
    } catch (err) {
      console.error('Error loading market data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, [stateFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-green-700" /> Mandi Market Prices & Government MSP Procurement
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Verified agricultural commodity market rates from Agmarknet & direct Government MSP auction listings.
          </p>
        </div>

        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-700">Filter State:</label>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md p-1.5 bg-white font-medium focus:ring-green-700"
          >
            <option value="All">All Mandis</option>
            <option value="Punjab">Punjab</option>
            <option value="Haryana">Haryana</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>
      </div>

      {/* Mandi Prices Section */}
      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <TrendingUp className="w-4 h-4 text-green-700" /> Verified Mandi Market Rates
        </h2>

        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-3">Mandi Market</th>
                <th className="p-3">State & District</th>
                <th className="p-3">Crop / Variety</th>
                <th className="p-3">Min Price</th>
                <th className="p-3">Max Price</th>
                <th className="p-3">Modal Price</th>
                <th className="p-3">Date & Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">No mandi market rates available for the selected state.</td>
                </tr>
              ) : (
                prices.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{p.market_name}</td>
                    <td className="p-3 text-slate-600">{p.state}, {p.district}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">{p.crop_name}</span>
                      {p.variety && <span className="block text-[10px] text-slate-500">{p.variety}</span>}
                    </td>
                    <td className="p-3 text-slate-700">₹{p.min_price}</td>
                    <td className="p-3 text-slate-700">₹{p.max_price}</td>
                    <td className="p-3 font-bold text-green-800 text-sm">₹{p.modal_price} / Qtl</td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      <div>{p.price_date}</div>
                      <div className="text-[10px] text-slate-400">{p.source}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Government MSP Auction Listings */}
      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Building2 className="w-4 h-4 text-blue-700" /> Open Government MSP Procurement Listings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {auctions.map(auc => (
            <div key={auc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900 text-sm">{auc.title}</h3>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-semibold text-[10px]">
                  {auc.status}
                </span>
              </div>
              <p className="text-slate-600">Crop Type: <strong className="text-slate-800">{auc.crop_type}</strong> | Region: <strong className="text-slate-800">{auc.location_region}</strong></p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-extrabold text-green-800 text-base">₹{auc.msp_price_per_quintal} / Qtl</span>
                <span className="text-[11px] text-slate-500 font-medium">Deadline: {auc.deadline_date}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Min Score: {auc.min_sustainability_score_required}</span>
                <span className="text-blue-800 font-semibold">{auc.procurement_agency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
