import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { OfflineSyncBanner } from '../common/OfflineSyncBanner';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <OfflineSyncBanner />
      <Navbar />
      
      <div className="flex flex-1 w-full">
        <DesktopSidebar />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full mb-safe-nav md:mb-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
};
