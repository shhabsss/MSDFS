import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { Booking, Jodi, TimeSlot } from '../types';
import { 
  formatDateDMY, 
  getTodayDateString, 
  TIME_SLOTS,
  formatStaffNameWithTitle,
  TIME_SLOT_HOURS
} from '../utils/bookingUtils';

interface BookingCalendarViewProps {
  bookings: Booking[];
  staffList: Jodi[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectBooking: (booking: Booking) => void;
  onOpenWhatsAppModal: (booking: Booking) => void;
  onNewBookingForDate: (date: string) => void;
}

export const BookingCalendarView: React.FC<BookingCalendarViewProps> = ({
  bookings,
  staffList,
  selectedDate,
  onSelectDate,
  onSelectBooking,
  onOpenWhatsAppModal,
  onNewBookingForDate
}) => {
  const today = getTodayDateString();

  // Current calendar display month/year state
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date(selectedDate || today);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(today);
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      bookings: Booking[];
      unassignedCount: number;
    }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayBookings = bookings.filter(b => b.serviceDate === dateStr && b.jobStatus !== 'Cancelled');
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === today,
        isSelected: dateStr === selectedDate,
        bookings: dayBookings,
        unassignedCount: dayBookings.filter(b => !b.assignedStaff).length
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayBookings = bookings.filter(b => b.serviceDate === dateStr && b.jobStatus !== 'Cancelled');
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === today,
        isSelected: dateStr === selectedDate,
        bookings: dayBookings,
        unassignedCount: dayBookings.filter(b => !b.assignedStaff).length
      });
    }

    // Next month padding to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayBookings = bookings.filter(b => b.serviceDate === dateStr && b.jobStatus !== 'Cancelled');
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === today,
        isSelected: dateStr === selectedDate,
        bookings: dayBookings,
        unassignedCount: dayBookings.filter(b => !b.assignedStaff).length
      });
    }

    return days;
  }, [year, month, bookings, today, selectedDate]);

  // Selected date bookings
  const selectedDayBookings = useMemo(() => {
    return bookings.filter(b => b.serviceDate === selectedDate && b.jobStatus !== 'Cancelled');
  }, [bookings, selectedDate]);

  return (
    <div className="space-y-6 pb-20">
      {/* Calendar Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Booking Schedule Calendar
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Visualize total bookings, staff availability, and unassigned bookings by date
              </p>
            </div>
          </div>

          {/* Month Navigator Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGoToday}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-bold text-white min-w-[130px] text-center">
                {monthName}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNewBookingForDate(selectedDate)}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Booking</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Selected Date Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: The Month Calendar Grid */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2 pb-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((day) => {
              const isSelected = day.isSelected;
              const hasBookings = day.bookings.length > 0;
              const hasUnassigned = day.unassignedCount > 0;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => onSelectDate(day.dateStr)}
                  className={`min-h-[75px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                      : day.isCurrentMonth
                      ? 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800'
                      : 'bg-slate-950/20 text-slate-600 border-slate-900/60 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      day.isToday
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : isSelected
                        ? 'text-amber-300'
                        : day.isCurrentMonth
                        ? 'text-slate-200'
                        : 'text-slate-600'
                    }`}>
                      {day.dayNumber}
                    </span>

                    {hasBookings && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {day.bookings.length}
                      </span>
                    )}
                  </div>

                  {/* Day Content Badges */}
                  <div className="space-y-1 my-1">
                    {hasUnassigned && (
                      <div className="text-[9px] bg-rose-950/80 text-rose-300 border border-rose-800/50 px-1 py-0.2 rounded font-bold truncate flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                        <span>{day.unassignedCount} Unassigned</span>
                      </div>
                    )}

                    {hasBookings && !hasUnassigned && (
                      <div className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-1 py-0.2 rounded font-medium truncate flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                        <span>{day.bookings.length} Job{day.bookings.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Slots dots indicator */}
                  <div className="flex items-center gap-1 pt-1 border-t border-slate-800/60">
                    {['Morning Slot', 'Afternoon Slot', 'Evening Slot'].map(slot => {
                      const count = day.bookings.filter(b => b.timeSlot === slot).length;
                      return (
                        <div
                          key={slot}
                          title={`${slot}: ${count} bookings`}
                          className={`w-1.5 h-1.5 rounded-full ${
                            count > 0 ? 'bg-amber-400' : 'bg-slate-800'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Selected Date Schedule Detail */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Selected Date Details
                </span>
                <h3 className="text-lg font-black text-white">
                  {formatDateDMY(selectedDate)}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onNewBookingForDate(selectedDate)}
                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Job</span>
              </button>
            </div>

            {/* Bookings on this date */}
            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {selectedDayBookings.length === 0 ? (
                <div className="text-center py-10 text-slate-500 space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50" />
                  <p className="text-xs font-medium">No bookings scheduled for this date</p>
                  <button
                    type="button"
                    onClick={() => onNewBookingForDate(selectedDate)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                  >
                    + Schedule first booking
                  </button>
                </div>
              ) : (
                selectedDayBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 hover:border-slate-700 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400">
                        {booking.refNo}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-semibold">
                        {booking.timeSlot}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {booking.customerName}
                      </h4>
                      <p className="text-slate-400 text-[11px] truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{booking.address}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Users className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate max-w-[120px]">
                          {booking.teamLeader || booking.assignedStaff || 'Unassigned'}
                        </span>
                      </div>

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
                          className="text-emerald-400 hover:text-emerald-300"
                          title="Open WhatsApp Dispatch"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Date Summary Footer */}
          <div className="pt-4 border-t border-slate-800 mt-4 text-xs text-slate-400 flex items-center justify-between">
            <span>Total: <strong>{selectedDayBookings.length}</strong> jobs</span>
            <span className="text-emerald-400 font-semibold">
              {selectedDayBookings.filter(b => b.assignedStaff).length} Assigned
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
