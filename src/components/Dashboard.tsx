import React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  MessageCircle, 
  Phone, 
  Grid3X3, 
  CalendarDays, 
  Sparkles, 
  DollarSign,
  MapPin,
  Bookmark,
  FileSpreadsheet
} from 'lucide-react';
import { Booking, Jodi, TimeSlot, ActiveTab } from '../types';
import { 
  getTodayDateString, 
  getDateOffsetString, 
  formatDateDMY, 
  TIME_SLOTS, 
  TIME_SLOT_HOURS, 
  STATUS_COLORS, 
  formatAmountDisplay, 
  getSlotCapacities,
  formatStaffNameWithTitle
} from '../utils/bookingUtils';
import { CompanyLogo } from './CompanyLogo';

interface DashboardProps {
  bookings: Booking[];
  jodis: Jodi[];
  onOpenNewBooking: () => void;
  onSelectBooking: (booking: Booking) => void;
  onOpenWhatsAppModal: (booking: Booking) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedDate: (date: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  bookings,
  jodis,
  onOpenNewBooking,
  onSelectBooking,
  onOpenWhatsAppModal,
  setActiveTab,
  setSelectedDate
}) => {
  const today = getTodayDateString();
  const tomorrow = getDateOffsetString(1);

  // Today's and tomorrow's bookings
  const todayBookings = bookings.filter(b => b.serviceDate === today);
  const tomorrowBookings = bookings.filter(b => b.serviceDate === tomorrow);

  // Status counts
  const pendingCount = bookings.filter(b => ['New', 'Assigned', 'In Progress'].includes(b.jobStatus)).length;
  const confirmedCount = bookings.filter(b => b.jobStatus === 'Confirmed').length;
  const completedCount = bookings.filter(b => b.jobStatus === 'Completed').length;
  const cancelledCount = bookings.filter(b => b.jobStatus === 'Cancelled').length;

  // Revenue calculation for today
  let todayRevenueTotal = 0;
  let hasDynamicPricingToday = false;
  todayBookings.forEach(b => {
    if (b.jobStatus !== 'Cancelled') {
      const numMatch = b.amount.match(/\d+/);
      if (numMatch) {
        todayRevenueTotal += parseInt(numMatch[0], 10);
      }
      if (b.amount.toLowerCase().includes('after') || b.amount.includes('to')) {
        hasDynamicPricingToday = true;
      }
    }
  });

  // Capacities for today (6 staff, max 3 per day)
  const activeStaffCount = jodis.filter(j => j.active).length || 6;
  const totalCapacity = activeStaffCount * 3; // 18 slots
  const totalTodayBooked = todayBookings.filter(b => b.jobStatus !== 'Cancelled').length;
  const capacities = getSlotCapacities(bookings, jodis, today);

  return (
    <div className="space-y-6 pb-20 text-slate-100">
      
      {/* Top Banner with Logo and Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <CompanyLogo size="lg" className="shrink-0 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-md" />
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-300 text-xs px-2.5 py-0.5 rounded-full mb-1.5 border border-amber-500/30 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Puducherry Facility Management Hub</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Operations & Booking Overview
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Today is <strong className="text-amber-300 font-bold">{formatDateDMY(today)}</strong> • {totalTodayBooked} of {totalCapacity} slots booked
              </p>
            </div>
          </div>

          {/* Quick Add CTA */}
          <button
            type="button"
            onClick={onOpenNewBooking}
            className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm self-start sm:self-center shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add New Booking</span>
          </button>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setSelectedDate(today);
              setActiveTab('staff-schedule');
            }}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 text-amber-300 transition-colors font-bold"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Today's Staff Schedule (6 Staff)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedDate(today);
              setActiveTab('calendar');
            }}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white transition-colors font-semibold"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Booking Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('locations')}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white transition-colors font-semibold"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved Locations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sheets')}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-300 hover:text-emerald-200 transition-colors font-semibold"
            title="Target Google Sheet Tab GID: 997243141"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Sheet Sync (Tab GID: 997243141)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedDate(tomorrow);
              setActiveTab('bookings');
            }}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-colors font-medium ml-auto"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Tomorrow: {tomorrowBookings.length} Jobs</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Today's Bookings */}
        <div 
          onClick={() => {
            setSelectedDate(today);
            setActiveTab('bookings');
          }}
          className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Jobs</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{todayBookings.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{totalCapacity - totalTodayBooked} slots free</span>
          </div>
        </div>

        {/* Tomorrow's Bookings */}
        <div 
          onClick={() => {
            setSelectedDate(tomorrow);
            setActiveTab('bookings');
          }}
          className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tomorrow</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{tomorrowBookings.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {formatDateDMY(tomorrow)}
          </div>
        </div>

        {/* Confirmed / Pending */}
        <div 
          onClick={() => setActiveTab('bookings')}
          className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Confirmed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{confirmedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {pendingCount} in progress / active
          </div>
        </div>

        {/* Today's Estimated Revenue */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today Est. Rev</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300">
            ₹{todayRevenueTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {hasDynamicPricingToday ? '+ Quotes on visit' : `${todayBookings.length} bookings`}
          </div>
        </div>

      </div>

      {/* Staff Capacity & Slots Section */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base">
              Time Slot Capacity (Today)
            </h3>
            <p className="text-xs text-slate-400">
              6 Staff roster • Morning, Afternoon & Evening slots
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedDate(today);
              setActiveTab('staff-schedule');
            }}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Staff Roster Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIME_SLOTS.map((slot) => {
            const cap = capacities[slot];
            const percent = Math.min(100, Math.round((cap.bookedCount / cap.maxCount) * 100));
            const hours = TIME_SLOT_HOURS[slot];

            return (
              <div 
                key={slot}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-white">{slot}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                    {cap.bookedCount} / {cap.maxCount} booked
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 mb-2">{hours.time}</div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      cap.isFull ? 'bg-rose-500' : percent >= 60 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="mt-2.5 text-[11px] flex items-center justify-between">
                  {cap.isFull ? (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Fully Booked
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">
                      {cap.maxCount - cap.bookedCount} slots available
                    </span>
                  )}
                  <span className="text-slate-500 font-mono text-[10px]">{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK BOOKING VIEW FOR TODAY */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="font-bold text-white text-base">
              Today's Scheduled Bookings ({formatDateDMY(today)})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {todayBookings.length} total scheduled
          </span>
        </div>

        {todayBookings.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No bookings scheduled for today yet.
          </div>
        ) : (
          <div className="space-y-4">
            {TIME_SLOTS.map((slot) => {
              const slotBookings = todayBookings.filter(b => b.timeSlot === slot);
              const hours = TIME_SLOT_HOURS[slot];

              return (
                <div key={slot} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                  {/* Slot Header */}
                  <div className="bg-slate-950 px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{slot}</span>
                      <span className="text-[11px] text-slate-400">({hours.time})</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                      {slotBookings.length} Bookings
                    </span>
                  </div>

                  {/* Bookings List */}
                  {slotBookings.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 italic text-center">
                      No bookings in this slot. All staff free.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/80">
                      {slotBookings.map((b, idx) => {
                        return (
                          <div 
                            key={b.id}
                            className="p-3.5 hover:bg-slate-900/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => onSelectBooking(b)}
                            >
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-600/40 px-2 py-0.5 rounded">
                                  {b.refNo}
                                </span>
                                <span className="font-bold text-sm text-white">
                                  {b.customerName}
                                </span>
                                <span className="inline-flex items-center gap-1 font-semibold text-xs bg-slate-800 text-sky-300 px-2 py-0.5 rounded-full border border-slate-700">
                                  <Users className="w-3 h-3 text-sky-400" />
                                  <span>{formatStaffNameWithTitle(b.teamLeader || b.assignedStaff)}</span>
                                  {b.teamMembers && b.teamMembers.length > 1 && (
                                    <span className="text-[10px] text-slate-400">& Team</span>
                                  )}
                                </span>
                              </div>

                              <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="truncate">{b.address}</span>
                              </div>

                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                                <span>Service: <strong className="text-slate-200">{b.services}</strong></span>
                                <span>Amount: <strong className="text-amber-300">{formatAmountDisplay(b.amount)}</strong></span>
                                <span className="px-2 py-0.2 rounded-full font-semibold text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                                  {b.jobStatus}
                                </span>
                              </div>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => onOpenWhatsAppModal(b)}
                                className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                title="Send WhatsApp Message"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>

                              <a
                                href={`tel:${b.customerCell}`}
                                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                                title="Call Customer"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
