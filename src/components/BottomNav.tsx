import React from 'react';
import {
  Activity,
  PlusCircle,
  History,
  BarChart3,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export type NavTab = 'live' | 'input' | 'history' | 'reports' | 'personal';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  activeTripsCount: number;
  pendingTripsCount?: number;
  isAuthenticated?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  activeTripsCount,
  pendingTripsCount = 0,
  isAuthenticated = false,
}) => {
  const tabs = [
    {
      id: 'live' as NavTab,
      label: 'Operasional',
      icon: Activity,
      badge: activeTripsCount > 0 ? activeTripsCount : null,
      isUrgent: pendingTripsCount > 0,
    },
    {
      id: 'input' as NavTab,
      label: 'Input Data',
      icon: PlusCircle,
      isPrimary: true,
    },
    {
      id: 'history' as NavTab,
      label: 'Riwayat',
      icon: History,
    },
    {
      id: 'reports' as NavTab,
      label: 'Laporan',
      icon: BarChart3,
    },
    {
      id: 'personal' as NavTab,
      label: 'Personal',
      icon: isAuthenticated ? ShieldCheck : Lock,
      isAuth: true,
    },
  ];

  return (
    <nav
      id="android-bottom-navigation"
      aria-label="Navigasi Utama"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 text-slate-500 px-2 py-1 shadow-md safe-area-pb"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                id={`nav-btn-${tab.id}`}
                onClick={() => onChangeTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-4 group focus:outline-none cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-red-600 text-white ring-3 ring-slate-100'
                      : 'bg-red-600 hover:bg-red-700 text-white ring-3 ring-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-0.5 tracking-tight ${
                    isActive ? 'text-red-600' : 'text-slate-600'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 relative transition-colors focus:outline-none cursor-pointer ${
                isActive ? 'text-red-600 font-bold' : 'hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'scale-110 text-red-600' : 'text-slate-500'
                  }`}
                />
                {!isAuthenticated && tab.id === 'reports' && (
                  <span
                    className="absolute -top-1 -right-1 text-slate-500 bg-slate-100 ring-1 ring-slate-300 rounded-full p-0.5"
                    title="Akses Laporan Terproteksi"
                  >
                    <Lock className="w-2 h-2" />
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 text-white text-[9px] font-extrabold px-1 rounded-full ring-1 ring-white ${
                      tab.isUrgent
                        ? 'bg-amber-500 ring-amber-300 animate-pulse shadow-sm'
                        : 'bg-red-600 ring-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1 bg-red-600 rounded-full mt-0.5"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
