import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, Tractor, Sprout, Sparkles, CheckCircle2, DollarSign, 
  Store, Bot, ShieldCheck, CheckSquare, Layers, Landmark, FileText,
  Users, Target, Gift, Trophy, LineChart, HelpCircle
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const primaryNav = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/farm-profile', label: 'My Farm', icon: Tractor },
    { to: '/disease-detection', label: 'Crop Health', icon: Sprout },
    { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
    { to: '/tasks', label: 'Tasks', icon: CheckCircle2 },
    { to: '/expenses', label: 'Expenses', icon: DollarSign },
    { to: '/market', label: 'Market', icon: Store },
    { to: '/community', label: 'Community', icon: Users },
    { to: '/assistant', label: 'Ask KisanVridhi', icon: Bot },
  ];

  const secondaryNav = [
    { to: '/rewards', label: 'Rewards & XP', icon: Gift },
    { to: '/schemes', label: 'Government Schemes', icon: Landmark },
    { to: '/documents', label: 'Document Vault', icon: FileText },
    { to: '/missions', label: 'Eco Missions', icon: Target },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const adminNav = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: ShieldCheck },
    { to: '/admin/verifications', label: 'Verification Queue', icon: CheckSquare },
    { to: '/admin/missions', label: 'Mission Manager', icon: Layers },
  ];

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 hidden md:flex flex-col justify-between p-3.5 shrink-0 select-none z-20">
      <div className="space-y-4">
        {/* Primary Farmer Navigation */}
        <div>
          <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            PRIMARY MANAGEMENT
          </div>
          <nav className="mt-1 space-y-0.5">
            {primaryNav.map((item) => {
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

        {/* Secondary Resources */}
        <div>
          <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            RESOURCES & ENGAGEMENT
          </div>
          <nav className="mt-1 space-y-0.5">
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

        {/* Admin Navigation */}
        {isAdmin && (
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-amber-800 uppercase">
              ADMINISTRATION
            </div>
            <nav className="mt-1 space-y-0.5">
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

      <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium text-center">
        <span>KisanVridhi v2.0 • Agriculture Platform</span>
      </div>
    </aside>
  );
};
