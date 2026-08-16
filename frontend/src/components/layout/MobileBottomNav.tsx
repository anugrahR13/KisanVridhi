import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Tractor, CheckCircle2, Store, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const items = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/farm-profile', label: 'Farm', icon: Tractor },
    { to: '/tasks', label: 'Tasks', icon: CheckCircle2 },
    { to: '/market', label: 'Market', icon: Store },
    { to: '/profile-more', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 md:hidden pb-safe select-none">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `touch-target flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
                  isActive
                    ? 'text-green-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
