import React from 'react';
import { Sparkles, Phone, Plus, UserCheck, ShieldCheck, MapPin, Sun, Moon } from 'lucide-react';
import { BUSINESS_INFO } from '../utils/bookingUtils';
import { UserRole, Jodi } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedStaffJodiId: string;
  setSelectedStaffJodiId: (id: string) => void;
  jodis: Jodi[];
  onOpenNewBooking: () => void;
  isCloudConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  setUserRole,
  selectedStaffJodiId,
  setSelectedStaffJodiId,
  jodis,
  onOpenNewBooking,
  isCloudConnected = true
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs dark:shadow-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg text-slate-900 dark:text-white leading-tight truncate tracking-tight">
                  {BUSINESS_INFO.name}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-600/50">
                  <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {BUSINESS_INFO.location}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                Professional Cleaning & Facility Services • Puducherry
              </p>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle (Light / Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
              aria-label={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Firestore Cloud Sync Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300" title="Firestore Database Connected">
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="hidden md:inline font-mono">Firestore DB</span>
            </div>

            {/* Quick Call hotline */}
            <a
              href={`tel:${BUSINESS_INFO.primaryPhone}`}
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              title="Call Helpline"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">{BUSINESS_INFO.primaryPhone}</span>
            </a>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setUserRole('admin')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  userRole === 'admin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setUserRole('staff')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  userRole === 'staff'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Staff</span>
              </button>
            </div>

            {/* Staff Jodi Selector (if in staff mode) */}
            {userRole === 'staff' && (
              <select
                value={selectedStaffJodiId}
                onChange={(e) => setSelectedStaffJodiId(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/50 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-emerald-400"
              >
                {jodis.map((jodi) => (
                  <option key={jodi.id} value={jodi.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {jodi.name} ({jodi.members})
                  </option>
                ))}
              </select>
            )}

            {/* Main Action: + Add Booking */}
            <button
              type="button"
              onClick={onOpenNewBooking}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-sm hover:shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Booking</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

