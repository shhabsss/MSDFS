import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  MapPin, 
  Crown, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  MessageCircle,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Booking, Jodi, TimeSlot } from '../types';
import { 
  getTodayDateString, 
  getDateOffsetString, 
  formatDateDMY, 
  TIME_SLOTS, 
  TIME_SLOT_HOURS,
  formatAmountDisplay,
  getWhatsAppUrl
} from '../utils/bookingUtils';

interface DailyStaffScheduleViewProps {
  staffList: Jodi[];
  bookings: Booking[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSelectBooking: (booking: Booking) => void;
  onOpenWhatsAppModal: (booking: Booking) => void;
  onOpenNewBookingWithPrefill?: (prefill: { serviceDate: string; timeSlot: TimeSlot; assignedStaff: string }) => void;
}

export const DailyStaffScheduleView: React.FC<DailyStaffScheduleViewProps> = ({
  staffList,
  bookings,
  selectedDate,
  onDateChange,
  onSelectBooking,
  onOpenWhatsAppModal,
  onOpenNewBookingWithPrefill
}) => {
  const today = getTodayDateString();
  const tomorrow = getDateOffsetString(1);

  // Active staff only
  const activeStaff = staffList.filter(s => s.active);

  // Filter bookings for selected date (excluding cancelled)
  const dayBookings = bookings.filter(
    b => b.serviceDate === selectedDate && b.jobStatus !== 'Cancelled'
  );

  // Helper to shift date by offset
  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${d}`);
  };

  // Build staff schedule metrics
  const staffSchedules = activeStaff.map(staff => {
    const staffNameLower = staff.name.trim().toLowerCase();

    // Find bookings where this staff is involved
    const assignedBookings = dayBookings.filter(b => {
      if (b.assignedStaff && b.assignedStaff.trim().toLowerCase() === staffNameLower) return true;
      if (b.assignedStaff2 && b.assignedStaff2.trim().toLowerCase() === staffNameLower) return true;
      if (b.teamLeader && b.teamLeader.trim().toLowerCase() === staffNameLower) return true;
      if (b.teamMembers && Array.isArray(b.teamMembers) && b.teamMembers.some(m => m.trim().toLowerCase() === staffNameLower)) return true;
      return false;
    });

    // Check slots
    const slotMap: Record<TimeSlot, Booking[]> = {
      'Morning Slot': [],
      'Afternoon Slot': [],
      'Evening Slot': []
    };

    assignedBookings.forEach(b => {
      if (slotMap[b.timeSlot]) {
        slotMap[b.timeSlot].push(b);
      }
    });

    // Detect slot conflict (more than 1 booking in the same slot)
    const hasSlotConflict = Object.values(slotMap).some(list => list.length > 1);

    const maxServices = staff.maxServicesPerDay || 3;
    const totalServices = assignedBookings.length;

    return {
      staff,
      assignedBookings,
      slotMap,
      hasSlotConflict,
      maxServices,
      totalServices,
      isAvailableAllDay: totalServices === 0
    };
  });

  const totalAssignedStaffToday = staffSchedules.filter(s => s.totalServices > 0).length;
  const availableStaffToday = staffSchedules.filter(s => s.totalServices < s.maxServices).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Schedule Header & Date Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Daily Staff Assignment Schedule
                </h2>
                <span className="hidden sm:inline-block text-xs bg-slate-800 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-slate-700">
                  6 Staff Roster
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Track assigned jobs, service times, locations, and Leader vs Member roles
              </p>
            </div>
          </div>

          {/* Quick Date Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onDateChange(today)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDate === today
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onDateChange(tomorrow)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDate === tomorrow
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              Tomorrow
            </button>

            {/* Shift controls */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => handleShiftDate(-1)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-2.5 font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{formatDateDMY(selectedDate)}</span>
              </div>
              <button
                type="button"
                onClick={() => handleShiftDate(1)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Total Scheduled Jobs</span>
            <span className="text-lg font-black text-white">{dayBookings.length}</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Staff Working Today</span>
            <span className="text-lg font-black text-emerald-400">{totalAssignedStaffToday} / {activeStaff.length}</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Available Staff</span>
            <span className="text-lg font-black text-sky-400">{availableStaffToday} free slots</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Overlaps / Conflicts</span>
            <span className={`text-lg font-black ${staffSchedules.some(s => s.hasSlotConflict) ? 'text-rose-400' : 'text-emerald-400'}`}>
              {staffSchedules.filter(s => s.hasSlotConflict).length} Warnings
            </span>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {staffSchedules.map(({ staff, assignedBookings, slotMap, hasSlotConflict, maxServices, totalServices }) => {
          const workloadPercentage = Math.min(100, Math.round((totalServices / maxServices) * 100));

          return (
            <div
              key={staff.id}
              id={`staff-schedule-card-${staff.id}`}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all ${
                hasSlotConflict
                  ? 'border-rose-500/60 ring-1 ring-rose-500/30'
                  : totalServices > 0
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/80 opacity-90'
              }`}
            >
              {/* Staff Header */}
              <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center text-amber-400 font-black text-base shadow-inner">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-white text-base">
                        Mr. {staff.name}
                      </h3>
                      {staff.role && (
                        <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 truncate max-w-[140px]">
                          {staff.role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <a
                        href={`tel:${staff.phone}`}
                        className="flex items-center gap-1 hover:text-emerald-400"
                      >
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{staff.phone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Workload Pill */}
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                    totalServices >= maxServices
                      ? 'bg-rose-950/80 text-rose-300 border-rose-700/50'
                      : totalServices > 0
                      ? 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                  }`}>
                    {totalServices} / {maxServices} Jobs Today
                  </span>
                </div>
              </div>

              {/* Conflict Alert if any */}
              {hasSlotConflict && (
                <div className="my-3 p-3 bg-rose-950/60 border border-rose-700/50 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-white">Overlapping Booking Conflict!</strong>
                    <p className="text-[11px] text-rose-300 mt-0.5">
                      This staff member has multiple bookings assigned to the same time slot today.
                    </p>
                  </div>
                </div>
              )}

              {/* 3 Slot Breakdown */}
              <div className="mt-4 space-y-2.5">
                {TIME_SLOTS.map((slot) => {
                  const slotList = slotMap[slot];
                  const slotHour = TIME_SLOT_HOURS[slot];
                  const isBooked = slotList.length > 0;

                  return (
                    <div
                      key={slot}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        isBooked
                          ? 'bg-slate-950/90 border-slate-800'
                          : 'bg-slate-950/30 border-dashed border-slate-800/80 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{slot}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({slotHour.time})</span>
                        </span>

                        {!isBooked && onOpenNewBookingWithPrefill && (
                          <button
                            type="button"
                            onClick={() => onOpenNewBookingWithPrefill({
                              serviceDate: selectedDate,
                              timeSlot: slot,
                              assignedStaff: staff.name
                            })}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Assign</span>
                          </button>
                        )}
                      </div>

                      {isBooked ? (
                        <div className="space-y-2">
                          {slotList.map((booking) => {
                            const isLeader = (booking.teamLeader && booking.teamLeader.trim().toLowerCase() === staff.name.trim().toLowerCase()) ||
                              (!booking.teamLeader && booking.assignedStaff.trim().toLowerCase() === staff.name.trim().toLowerCase());

                            return (
                              <div
                                key={booking.id}
                                className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 space-y-1.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-amber-400 text-xs">
                                      {booking.refNo}
                                    </span>
                                    <span className="text-slate-300 font-semibold truncate max-w-[140px]">
                                      {booking.customerName}
                                    </span>
                                  </div>

                                  {/* Leader or Team Member Tag */}
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                    isLeader
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                  }`}>
                                    {isLeader ? (
                                      <>
                                        <Crown className="w-3 h-3 text-amber-400" />
                                        <span>Leader</span>
                                      </>
                                    ) : (
                                      <>
                                        <Users className="w-3 h-3 text-blue-400" />
                                        <span>Team</span>
                                      </>
                                    )}
                                  </span>
                                </div>

                                <div className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="truncate">{booking.address}</span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                                  <span className="text-slate-400 truncate max-w-[180px]">
                                    🧹 {booking.services}
                                  </span>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => onSelectBooking(booking)}
                                      className="text-sky-400 hover:text-sky-300 font-bold"
                                    >
                                      View
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onOpenWhatsAppModal(booking)}
                                      className="text-emerald-400 hover:text-emerald-300 font-bold"
                                      title="Send WhatsApp Job Dispatch"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 inline" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-500/80 font-medium py-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Available for booking</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
