import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Grid3X3, 
  ClipboardList, 
  Users, 
  BarChart3, 
  FileSpreadsheet,
  MoreHorizontal,
  MapPin,
  Clock
} from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  pendingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  pendingCount
}) => {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  // If user is Staff, show simplified navigation
  if (userRole === 'staff') {
    return null; // Staff portal has its own unified mobile view
  }

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Calendar',
      icon: Calendar,
    },
    {
      id: 'staff-schedule' as ActiveTab,
      label: 'Schedule',
      icon: Clock,
      badge: '6-Staff'
    },
    {
      id: 'bookings' as ActiveTab,
      label: 'Bookings',
      icon: ClipboardList,
      countBadge: pendingCount > 0 ? pendingCount : null
    },
    {
      id: 'more' as const,
      label: 'More',
      icon: MoreHorizontal,
      isMore: true
    }
  ];

  return (
    <>
      {/* "More" Drawer Overlay for mobile */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 dark:bg-black/70 backdrop-blur-xs transition-opacity"
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            className="fixed bottom-16 right-3 left-3 sm:left-auto sm:right-6 sm:w-72 bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in slide-in-from-bottom-5 duration-200 text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-3 py-1.5 uppercase tracking-wider">
              Management & Operations
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('locations');
                setShowMoreMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'locations' 
                  ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-500/40' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Saved Locations (Manage)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('staff-schedule');
                setShowMoreMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'staff-schedule' 
                  ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-500/40' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Daily Staff Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('customers');
                setShowMoreMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'customers' 
                  ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-500/40' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Customer Database</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('staff');
                setShowMoreMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'staff' 
                  ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-500/40' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Staff Roster Management</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('reports');
                setShowMoreMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'reports' 
                  ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-500/40' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span>Reports & Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('sheets');
                setShowMoreMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'sheets' 
                  ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-500/40' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Google Sheet Sync</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/90 shadow-2xl pb-safe transition-colors duration-200">
        <div className="max-w-md mx-auto grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = item.isMore 
              ? ['staff', 'customers', 'reports', 'sheets', 'locations'].includes(activeTab) || showMoreMenu
              : activeTab === item.id;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.isMore) {
                    setShowMoreMenu(!showMoreMenu);
                  } else {
                    setShowMoreMenu(false);
                    setActiveTab(item.id as ActiveTab);
                  }
                }}
                className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected ? 'text-amber-500 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isSelected ? 'scale-110 text-amber-500 dark:text-amber-400' : ''}`} />
                  
                  {item.countBadge && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.countBadge}
                    </span>
                  )}

                  {item.badge && !isSelected && (
                    <span className="hidden sm:inline absolute -top-1 -right-4 text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-500/30 px-1 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
