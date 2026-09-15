import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Users, 
  Check, 
  Phone, 
  MessageCircle,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Booking, Jodi, TimeSlot } from '../types';
import { 
  TIME_SLOTS, 
  TIME_SLOT_HOURS, 
  getTodayDateString, 
  getDateOffsetString, 
  formatDateDMY,
  STATUS_COLORS,
  formatAmountDisplay
} from '../utils/bookingUtils';

interface DailyScheduleMatrixProps {
  bookings: Booking[];
  jodis: Jodi[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onOpenNewBookingWithPrefill: (prefill: { serviceDate: string; timeSlot: TimeSlot; assignedStaff: string }) => void;
  onSelectBooking: (booking: Booking) => void;
  onOpenWhatsAppModal: (booking: Booking) => void;
}

export const DailyScheduleMatrix: React.FC<DailyScheduleMatrixProps> = ({
  bookings,
  jodis,
  selectedDate,
  setSelectedDate,
  onOpenNewBookingWithPrefill,
  onSelectBooking,
  onOpenWhatsAppModal
}) => {
  const today = getTodayDateString();
  const tomorrow = getDateOffsetString(1);

  // Helper to shift date by days
  const handleShiftDate = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  // Filter bookings for the selected date
  const dayBookings = bookings.filter(b => b.serviceDate === selectedDate && b.jobStatus !== 'Cancelled');
  const activeJodis = jodis.filter(j => j.active);
  const totalSlots = activeJodis.length * 3;
  const bookedSlots = dayBookings.length;

  return (
    <div className="space-y-4 pb-20">
      
      {/* Date Control Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleShiftDate(-1)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => handleShiftDate(1)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Quick shortcuts */}
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => setSelectedDate(today)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                  selectedDate === today
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(tomorrow)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                  selectedDate === tomorrow
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                Tomorrow
              </button>
            </div>
          </div>

          {/* Day Capacity Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">Day Staff Allocation</div>
              <div className="text-sm font-bold text-slate-900">
                <span className="text-blue-600">{bookedSlots}</span> / {totalSlots} Slots Assigned
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm">
              {Math.round((bookedSlots / totalSlots) * 100)}%
            </div>
          </div>

        </div>

        {/* Mobile quick shortcuts */}
        <div className="flex sm:hidden items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSelectedDate(today)}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border text-center transition-colors ${
              selectedDate === today
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Today ({formatDateDMY(today)})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(tomorrow)}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border text-center transition-colors ${
              selectedDate === tomorrow
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* 6-Staff Matrix Board */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Board Title */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Daily Staff Allocation Matrix
              </h3>
              <p className="text-[11px] text-slate-400">
                6 Staff Members × 3 Services/Day = 18 Max Daily Capacity (1 staff can do 3 services max)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
              {activeJodis.length} Active Staff
            </span>
            <div className="text-xs font-semibold text-blue-300 bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-800">
              {formatDateDMY(selectedDate)}
            </div>
          </div>
        </div>

        {/* Responsive Table / Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4 w-48 sticky left-0 bg-slate-50 z-10">
                  Staff Member (3 Max)
                </th>
                {TIME_SLOTS.map(slot => (
                  <th key={slot} className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{slot}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {TIME_SLOT_HOURS[slot].time}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {activeJodis.map((staff) => {
                const staffNameLower = staff.name.trim().toLowerCase();
                const staffDayJobs = dayBookings.filter(
                  b => b.assignedStaff.trim().toLowerCase() === staffNameLower ||
                       (b.assignedStaff2 && b.assignedStaff2.trim().toLowerCase() === staffNameLower)
                );
                const jobCountToday = staffDayJobs.length;
                const maxJobs = staff.maxServicesPerDay || 3;
                const isFull = jobCountToday >= maxJobs;

                return (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Staff Row Header */}
                    <td className="py-3.5 px-4 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 text-sm">{staff.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isFull 
                            ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                            : jobCountToday === 2
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : jobCountToday === 1
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {jobCountToday}/{maxJobs}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-500 truncate" title={staff.role || staff.members}>
                        {staff.role || staff.members || 'Staff Member'}
                      </div>
                      
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{staff.phone}</span>
                      </div>

                      {/* Mini 3-dot workload progress */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {[0, 1, 2].map((idx) => (
                          <div 
                            key={idx}
                            className={`h-1.5 flex-1 rounded-full ${
                              idx < jobCountToday 
                                ? isFull ? 'bg-rose-500' : 'bg-blue-500' 
                                : 'bg-slate-200'
                            }`}
                            title={`Service slot ${idx + 1} of 3`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Slot Cells */}
                    {TIME_SLOTS.map((slot) => {
                      const assignedBooking = dayBookings.find(
                        b => (b.assignedStaff.trim().toLowerCase() === staffNameLower ||
                             (b.assignedStaff2 && b.assignedStaff2.trim().toLowerCase() === staffNameLower)) && 
                             b.timeSlot === slot
                      );

                      if (assignedBooking) {
                        const isPrimary = assignedBooking.assignedStaff.trim().toLowerCase() === staffNameLower;
                        const statusColor = STATUS_COLORS[assignedBooking.jobStatus] || STATUS_COLORS['Confirmed'];

                        return (
                          <td key={slot} className="p-2 align-top">
                            <div 
                              onClick={() => onSelectBooking(assignedBooking)}
                              className="bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 rounded-xl p-2.5 transition-all cursor-pointer shadow-2xs group relative"
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {assignedBooking.customerName}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                                  {assignedBooking.jobStatus}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-600 line-clamp-1 mb-1 font-medium">
                                {assignedBooking.services}
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  isPrimary ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {isPrimary ? 'Primary (Staff 1)' : 'Helper (Staff 2)'}
                                </span>
                                <span className="font-semibold text-slate-800">
                                  {formatAmountDisplay(assignedBooking.amount)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-blue-100">
                                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                  {assignedBooking.address}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenWhatsAppModal(assignedBooking);
                                    }}
                                    className="p-1 hover:bg-white text-emerald-600 rounded transition-colors"
                                    title="Send WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {assignedBooking.refNo.replace('MSD/PDY/', '')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      // If staff is already full (3/3 jobs today), show filled notice
                      if (isFull) {
                        return (
                          <td key={slot} className="p-2 align-top">
                            <div className="w-full h-full min-h-[82px] border border-dashed border-slate-200 bg-slate-50 text-slate-400 rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 text-center">
                              <span className="text-xs font-semibold text-slate-500">Day Full</span>
                              <span className="text-[10px] text-slate-400">3 of 3 done</span>
                            </div>
                          </td>
                        );
                      }

                      // Available Slot Cell
                      return (
                        <td key={slot} className="p-2 align-top">
                          <button
                            type="button"
                            onClick={() => onOpenNewBookingWithPrefill({
                              serviceDate: selectedDate,
                              timeSlot: slot,
                              assignedStaff: staff.name
                            })}
                            className="w-full h-full min-h-[82px] border border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-700 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer"
                          >
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                            <span className="text-xs font-bold text-emerald-700">Available</span>
                            <span className="text-[10px] text-emerald-600/80">Tap to Assign {staff.name}</span>
                          </button>
                        </td>
                      );
                    })}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Guide Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Double Booking Protection Active:</strong> Green slots indicate that the Jodi is completely free. Tapping any green slot opens the new booking form pre-selected with that exact Jodi, date, and slot.
        </div>
      </div>

    </div>
  );
};
