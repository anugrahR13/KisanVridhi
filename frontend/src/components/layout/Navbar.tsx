import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, Bell, LogOut, Award, Shield } from 'lucide-react';
import { gamificationService } from '../../services/appServices';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { FarmSelector } from './FarmSelector';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (user) {
      gamificationService.getNotifications()
        .then(setNotifications)
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 px-3 lg:px-6 py-2 flex items-center justify-between shadow-xs select-none">
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2 shrink-0">
          <div className="p-1.5 rounded bg-green-700 text-white shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none">
              KisanVridhi
            </span>
            <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline-block">
              Farmer Decision Platform
            </span>
          </div>
        </Link>

        {/* Global Farm Selector Bar */}
        {user && (
          <div className="hidden sm:block ml-2">
            <FarmSelector />
          </div>
        )}
      </div>

      {user ? (
        <div className="flex items-center space-x-2.5">
          {/* Level & XP Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs">
            <Award className="w-3.5 h-3.5 text-green-700 shrink-0" />
            <span className="font-semibold text-slate-900">Lvl {user.level}</span>
            <span className="text-slate-300">•</span>
            <span className="text-green-700 font-bold">{user.xp} XP</span>
          </div>

          <LanguageSwitcher />

          {/* Admin Tag */}
          {isAdmin && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-700" /> Admin
            </span>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="touch-target p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.is_read) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-700 ring-2 ring-white" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md border border-slate-200 shadow-md py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <span className="text-xs font-semibold text-slate-700">Notifications</span>
                  <span className="text-[10px] text-green-800 font-semibold bg-green-100 px-1.5 py-0.5 rounded">{notifications.length} Total</span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-2.5 hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="touch-target p-2 rounded bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          <Link
            to="/login"
            className="px-3 py-1.5 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-green-700 hover:bg-green-800 transition-colors shadow-xs"
          >
            Register
          </Link>
        </div>
      )}
    </header>
  );
};
