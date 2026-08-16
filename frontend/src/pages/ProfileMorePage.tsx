import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Tractor, Sprout, Sparkles, CheckCircle2, DollarSign, Store,
  Users, Gift, Landmark, FileText, Target, Trophy, Bot, LineChart, 
  HelpCircle, Settings, LogOut, Award, Shield, ChevronRight
} from 'lucide-react';

export const ProfileMorePage: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const links = [
    { to: '/farm-profile', label: 'My Farm Profile', icon: Tractor, sub: 'Land area, soil type & irrigation' },
    { to: '/disease-detection', label: 'Crop Health AI Studio', icon: Sprout, sub: 'Pathogen diagnosis & leaf inspection' },
    { to: '/recommendations', label: 'AI Recommendations', icon: Sparkles, sub: 'Field-specific advisories' },
    { to: '/expenses', label: 'Farm Expenses & Profit', icon: DollarSign, sub: 'Category costs & break-even calculation' },
    { to: '/community', label: 'Community Forum', icon: Users, sub: 'Connect with neighboring farmers & KVK' },
    { to: '/rewards', label: 'Rewards & XP Vouchers', icon: Gift, sub: 'Redeem points for seed discounts' },
    { to: '/schemes', label: 'Government Schemes', icon: Landmark, sub: 'State & Central subsidies directory' },
    { to: '/documents', label: 'Document Vault', icon: FileText, sub: 'Soil reports, bills & certificates' },
    { to: '/missions', label: 'Eco Missions', icon: Target, sub: 'Earn XP through sustainable practices' },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, sub: 'Regional farmer rankings' },
    { to: '/assistant', label: 'Ask KisanVridhi AI', icon: Bot, sub: 'Practical farm Q&A assistant' },
    { to: '/analytics', label: 'Farm Analytics', icon: LineChart, sub: 'Long-term sustainability trends' },
    { to: '/help-desk', label: 'Help & Support', icon: HelpCircle, sub: 'FAQs & KVK Helpline numbers' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-12">
      {/* Farmer Profile Card */}
      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs space-y-3">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="p-3 bg-green-700 text-white rounded-full font-extrabold text-lg">
            {user.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">{user.full_name}</h1>
            <p className="text-xs text-slate-500">{user.location || 'Punjab, India'} • {user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Level Status</span>
            <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
              <Award className="w-3.5 h-3.5 text-green-700" /> Level {user.level}
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Sustainability XP</span>
            <span className="font-bold text-green-800 mt-0.5 block">{user.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Admin Panel Quick Link if Admin */}
      {isAdmin && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 font-bold text-amber-900">
            <Shield className="w-4 h-4 text-amber-700" />
            <span>Administrator Control Dashboard</span>
          </div>
          <Link to="/admin/dashboard" className="px-3 py-1 bg-amber-700 text-white font-semibold rounded shadow-xs">
            Open Admin →
          </Link>
        </div>
      )}

      {/* Navigation List */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden divide-y divide-slate-100">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-md">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{link.label}</p>
                  <p className="text-[11px] text-slate-500">{link.sub}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          );
        })}
      </div>

      {/* Sign Out Button */}
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out of KisanVridhi Account</span>
      </button>
    </div>
  );
};
