import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  LayoutDashboard, Tractor, Sparkles, Target, Trophy, 
  Bot, LineChart, ShieldCheck, CheckSquare, Layers,
  Building2, Users, HelpCircle, Sprout, Gift, CloudSun,
  DollarSign, TestTube, FileText, Landmark, CheckCircle2, Store
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'admin';

  const mainFarmerNav = [
    { to: '/dashboard', label: 'Action Center', icon: LayoutDashboard },
    { to: '/farm-profile', label: 'My Farms', icon: Tractor },
    { to: '/tasks', label: 'Daily Tasks', icon: CheckCircle2 },
    { to: '/disease-detection', label: 'Crop Health AI', icon: Sprout },
    { to: '/recommendations', label: 'AI Advice', icon: Sparkles },
    { to: '/weather-irrigation', label: 'Weather & Water', icon: CloudSun },
    { to: '/expenses', label: 'Expenses & Profit', icon: DollarSign },
    { to: '/soil', label: 'Soil Health', icon: TestTube },
    { to: '/market', label: 'Mandi & MSP', icon: Store },
    { to: '/schemes', label: 'Govt Schemes', icon: Landmark },
    { to: '/documents', label: 'Document Vault', icon: FileText },
  ];

  const secondaryNav = [
    { to: '/community', label: t('nav_community') || 'Community', icon: Users },
    { to: '/missions', label: 'Eco Missions', icon: Target },
    { to: '/rewards', label: t('nav_rewards') || 'Rewards', icon: Gift },
    { to: '/leaderboard', label: t('nav_leaderboard') || 'Leaderboard', icon: Trophy },
    { to: '/assistant', label: 'Ask KisanVridhi', icon: Bot },
    { to: '/analytics', label: t('nav_analytics') || 'Analytics', icon: LineChart },
  ];

  const adminNav = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: ShieldCheck },
    { to: '/admin/verifications', label: 'Verification Queue', icon: CheckSquare },
    { to: '/admin/missions', label: 'Mission Manager', icon: Layers },
  ];

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 hidden lg:flex flex-col justify-between p-3.5 shrink-0 select-none z-20">
      <div className="space-y-4">
        {/* Farmer Main Section */}
        <div>
          <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            FARM DECISION SUPPORT
          </div>
          <nav className="mt-1.5 space-y-0.5">
            {mainFarmerNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-green-700 text-white shadow-xs font-semibold'
                        : 'text-slate-700 hover:bg-slate-200/70 hover:text-green-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Engagement & Community Section */}
        <div>
          <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            ENGAGEMENT & ASSIST
          </div>
          <nav className="mt-1.5 space-y-0.5">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-green-700 text-white shadow-xs font-semibold'
                        : 'text-slate-700 hover:bg-slate-200/70 hover:text-green-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin Navigation if role is admin */}
        {isAdmin && (
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-amber-700 uppercase">
              ADMINISTRATION
            </div>
            <nav className="mt-1.5 space-y-0.5">
              {adminNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-amber-700 text-white shadow-xs font-semibold'
                          : 'text-slate-700 hover:bg-amber-100/70 hover:text-amber-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 font-medium text-center">
        <span>AGRIQUEST • Decision Platform</span>
      </div>
    </aside>
  );
};
