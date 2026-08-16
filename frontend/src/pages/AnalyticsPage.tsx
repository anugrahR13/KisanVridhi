import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/appServices';
import { LineChart as LineChartIcon, TrendingUp, Award } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<{ score_history: any[]; xp_history: any[] }>({ score_history: [], xp_history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <LineChartIcon className="w-8 h-8 text-emerald-600" />
          <span>Sustainability Progress Analytics</span>
        </h1>
        <p className="text-xs text-slate-600 font-medium mt-1">Track your Sustainability Score trends and XP growth logged from completed missions</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Score Trend Line Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-soft">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900">Sustainability Score History</h3>
            </div>

            <div className="h-72 w-full">
              {data.score_history.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-500 font-medium">
                  No score history recorded yet. Complete missions or update farm profile.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.score_history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    />
                    <Line type="monotone" dataKey="overall" name="Overall Score" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="water" name="Water Score" stroke="#0284c7" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="soil" name="Soil Score" stroke="#d97706" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* XP History Bar Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-soft">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-slate-900">XP Rewards Log</h3>
            </div>

            <div className="h-64 w-full">
              {data.xp_history.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-500 font-medium">
                  No XP transactions logged yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.xp_history.slice(-15)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    />
                    <Bar dataKey="amount" name="XP Earned" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
