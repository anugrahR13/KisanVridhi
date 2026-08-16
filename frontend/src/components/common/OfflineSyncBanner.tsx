import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2, RefreshCw } from 'lucide-react';

export const OfflineSyncBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('saving');
      setTimeout(() => setSyncStatus('synced'), 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && syncStatus === 'synced') {
    return null; // Silent when everything is online & synced
  }

  return (
    <div className="w-full bg-slate-900 text-white text-xs py-1.5 px-4 flex items-center justify-between z-50">
      {!isOnline ? (
        <div className="flex items-center space-x-2 text-amber-300 font-semibold">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline mode active • Changes will sync automatically when connectivity returns</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-green-300 font-semibold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Back online • Synchronizing farm records...</span>
        </div>
      )}
      <span className="text-[10px] text-slate-400 font-mono uppercase">KisanVridhi Offline Sync</span>
    </div>
  );
};
