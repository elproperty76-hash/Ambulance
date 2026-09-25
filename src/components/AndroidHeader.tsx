import React, { useState, useEffect } from 'react';
import {
  Ambulance,
  PhoneCall,
  ShieldCheck,
  Radio,
  Clock,
  Sparkles,
  RotateCcw,
  Database,
  Cloud,
} from 'lucide-react';

interface AndroidHeaderProps {
  onQuickEmergency: () => void;
  onNavigateToInput?: () => void;
  onNavigateToPersonal?: () => void;
  activeTripsCount: number;
  pendingTripsCount?: number;
  fleetPlatNomor?: string;
  isAuthenticated?: boolean;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  onQuickEmergency,
  onNavigateToInput,
  onNavigateToPersonal,
  activeTripsCount,
  pendingTripsCount = 0,
  fleetPlatNomor,
  isAuthenticated = false,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-xs">
      {/* Android System Status Bar Simulation */}
      <div className="px-3 py-0.5 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950 border-b border-slate-800/80 font-mono select-none">
        <div className="flex items-center space-x-1.5">
          <span className="font-semibold text-slate-200">{currentTime || '08:00'}</span>
          <span className="text-emerald-400 font-semibold">• BPA RANCAEKEK</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex items-center text-[10px] text-sky-400 font-semibold">
            <Cloud className="w-2.5 h-2.5 mr-0.5" />
            CLOUD
          </span>
          <span className="flex items-center text-[10px] text-emerald-400 font-semibold">
            <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" />
            LIVE
          </span>
          <span className="text-[10px]">4G</span>
          <span className="text-[10px]">100%</span>
        </div>
      </div>

      {/* Main App Bar - High Density */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-xs border border-red-400/30 relative shrink-0">
            <Ambulance className="w-4 h-4 text-white" />
            {activeTripsCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-3.5 h-3.5 text-slate-950 text-[8px] font-extrabold rounded-full flex items-center justify-center ring-1 ring-slate-900 ${
                  pendingTripsCount > 0
                    ? 'bg-amber-400 animate-pulse ring-amber-200 shadow-sm'
                    : 'bg-emerald-400'
                }`}
              >
                {activeTripsCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <h1 className="font-bold text-xs tracking-tight text-white leading-tight">
                AMBULANCE BPA
              </h1>
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[8px] font-bold px-1 py-0.1 rounded">
                24 JAM
              </span>
            </div>
            <p className="text-[10px] text-slate-300 flex items-center font-medium">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 mr-0.5 inline" />
              FKW Bumi Pesona Asri
            </p>
          </div>
        </div>

        {/* Action Buttons: Personal Admin, Hotline */}
        <div className="flex items-center space-x-1.5">
          {onNavigateToPersonal && (
            <button
              id="header-btn-personal-admin"
              onClick={onNavigateToPersonal}
              title="Akses Fitur Personal & Admin"
              className={`flex items-center space-x-1 text-[11px] font-semibold px-2 py-1 rounded-lg border cursor-pointer transition-colors shadow-xs ${
                isAuthenticated
                  ? 'bg-red-950/80 text-red-200 border-red-800 hover:bg-red-900'
                  : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              {isAuthenticated ? (
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              ) : (
                <Database className="w-3 h-3 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {isAuthenticated ? 'Admin BPA' : 'Personal'}
              </span>
            </button>
          )}

          <button
            id="btn-quick-call-emergency"
            onClick={onQuickEmergency}
            title="Telepon Hotline Darurat"
            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs border border-red-500 cursor-pointer"
          >
            <PhoneCall className="w-3 h-3" />
            <span className="hidden xs:inline">Hotline</span>
          </button>
        </div>
      </div>

      {/* Sub Header Badge Bar */}
      <div className="bg-slate-800 px-3 py-0.5 text-[10px] text-slate-300 flex items-center justify-between overflow-x-auto whitespace-nowrap scrollbar-none border-t border-slate-700/60 font-sans">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Unit:</span>
          <span className="text-amber-300 font-bold font-mono">
            {fleetPlatNomor || 'D 1945 BPA'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Pool:</span>
          <span className="text-slate-200 font-medium">Posko Masjid Jami Al Adnan</span>
        </div>
        <div className="flex items-center text-[10px] text-emerald-400 font-semibold pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
          Siaga Tanggap Darurat
        </div>
      </div>
    </header>
  );
};
