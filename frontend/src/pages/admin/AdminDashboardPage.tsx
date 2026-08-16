import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/appServices';
import { AdminStats } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { Shield, Users, Tractor, Target, CheckCircle2, Award } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-600" />
          <span>System Admin Dashboard</span>
        </h1>
        <p className="text-xs text-slate-600 font-medium mt-1">Platform management, mission creation, and Computer Vision image verifications review</p>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Platform Users" value={stats.total_users} icon={Users} color="purple" />
        <StatCard title="Active Farmers" value={stats.active_farmers} icon={Tractor} color="emerald" />
        <StatCard title="Total Missions" value={stats.total_missions} icon={Target} color="amber" />
        <StatCard title="Avg Sustainability Score" value={`${Math.round(stats.avg_sustainability_score)} / 100`} icon={Award} color="teal" />
      </div>

      {/* Category Popularity Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-soft">
        <h3 className="text-base font-bold text-slate-900">Practice Category Completion Rates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.popular_categories.map((cat, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
              <span className="text-xs font-bold text-slate-800">{cat.category}</span>
              <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                {cat.completed_count} Completed
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
