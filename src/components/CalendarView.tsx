import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Users, 
  Clock, 
  Phone, 
  MessageCircle, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Booking, Jodi, TimeSlot } from '../types';
import { 
  TIME_SLOTS, 
  TIME_SLOT_HOURS, 
  formatDateDMY, 
  getTodayDateString, 
  STATUS_COLORS,
  formatAmountDisplay 
} from '../utils/bookingUtils';

interface CalendarViewProps {
  bookings: Booking[];
  jodis: Jodi[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onSelectBooking: (booking: Booking) => void;
  onOpenNewBookingWithPrefill: (prefill: { serviceDate: string; timeSlot?: TimeSlot }) => void;
  onOpenWhatsAppModal: (booking: Booking) => void;
}

type CalendarMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC<CalendarViewProps> = ({
  bookings,
  jodis,
  selectedDate,
  setSelectedDate,
  onSelectBooking,
  onOpenNewBookingWithPrefill,
  onOpenWhatsAppModal
}) => {
  const [viewMode, setViewMode] = useState<CalendarMode>('month');
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(selectedDate || getTodayDateString()));

  const todayStr = getTodayDateString();

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentMonthDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentMonthDate(d);
    if (viewMode === 'day') {
      setSelectedDate(d.toISOString().split('T')[0]);
    }
  };

  const handleNext = () => {
    const d = new Date(currentMonthDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentMonthDate(d);
    if (viewMode === 'day') {
      setSelectedDate(d.toISOString().split('T')[0]);
    }
  };

  // Month calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Selected date bookings
  const dayBookings = bookings.filter(b => b.serviceDate === selectedDate && b.jobStatus !== 'Cancelled');

  // Month grid days
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateBookings = bookings.filter(b => b.serviceDate === dateStr && b.jobStatus !== 'Cancelled');
    calendarCells.push({
      dateStr,
      dayNum: day,
      count: dateBookings.length,
      bookings: dateBookings
    });
  }

  // Week days for week view
  const getWeekDays = () => {
    const curr = new Date(selectedDate || currentMonthDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(curr.setDate(diff));

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      const str = nextDay.toISOString().split('T')[0];
      weekDays.push({
        dateStr: str,
        dayName: nextDay.toLocaleDateString('default', { weekday: 'short' }),
        dayNum: nextDay.getDate(),
        bookings: bookings.filter(b => b.serviceDate === str && b.jobStatus !== 'Cancelled')
      });
    }
    return weekDays;
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* View Mode & Month Navigator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Navigation title */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 min-w-44 text-center">
            {viewMode === 'month' ? monthName : formatDateDMY(selectedDate)}
          </h2>

          <button
            type="button"
            onClick={handleNext}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentMonthDate(new Date());
              setSelectedDate(todayStr);
            }}
            className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors ml-1"
          >
            Today
          </button>
        </div>

        {/* Mode Switcher: Month / Week / Day */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-semibold self-start sm:self-center">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'month' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'week' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'day' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Day
          </button>
        </div>

      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Weekday headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return (
                  <div 
                    key={`empty-${idx}`} 
                    className="min-h-[76px] sm:min-h-[96px] bg-slate-50/40 border-r border-b border-slate-100 p-1"
                  />
                );
              }

              const isSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[76px] sm:min-h-[96px] p-1.5 sm:p-2 border-r border-b border-slate-100 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-blue-50/90 ring-2 ring-blue-600 ring-inset z-10' 
                      : isToday 
                      ? 'bg-amber-50/40' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-blue-600 text-white' : isSelected ? 'text-blue-900 font-extrabold' : 'text-slate-700'
                    }`}>
                      {cell.dayNum}
                    </span>

                    {/* Bookings Count Badge (Section 5 requirement) */}
                    {cell.count > 0 && (
                      <span className={`text-[10px] sm:text-[11px] font-bold px-1.5 py-0.2 rounded-full border ${
                        cell.count >= 12
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : cell.count >= 6
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {cell.count} {cell.count === 1 ? 'Job' : 'Jobs'}
                      </span>
                    )}
                  </div>

                  {/* Slot dots or mini badges for desktop */}
                  <div className="mt-1 space-y-0.5">
                    {cell.bookings.slice(0, 2).map((b) => (
                      <div 
                        key={b.id} 
                        className="hidden sm:block text-[10px] truncate px-1 py-0.5 rounded bg-white/90 border border-slate-200 text-slate-700 font-medium"
                      >
                        <span className="font-bold text-blue-700">{b.assignedStaff}:</span> {b.customerName}
                      </div>
                    ))}
                    {cell.count > 2 && (
                      <div className="hidden sm:block text-[9px] text-slate-400 font-semibold pl-1">
                        +{cell.count - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[650px]">
            {getWeekDays().map((day) => {
              const isSelected = day.dateStr === selectedDate;
              const isToday = day.dateStr === todayStr;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                      : isToday
                      ? 'border-amber-300 bg-amber-50/40'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center pb-2 border-b border-slate-200">
                    <div className="text-xs font-semibold text-slate-500">{day.dayName}</div>
                    <div className="text-base font-bold text-slate-900">{day.dayNum}</div>
                    <div className="text-[11px] font-bold text-blue-600 mt-0.5">
                      {day.bookings.length} Bookings
                    </div>
                  </div>

                  <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto">
                    {day.bookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBooking(b);
                        }}
                        className="text-[10px] p-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 shadow-2xs"
                      >
                        <div className="font-bold text-slate-800 truncate">{b.customerName}</div>
                        <div className="text-slate-500 truncate">{b.timeSlot}</div>
                        <div className="font-semibold text-blue-600">{b.assignedStaff}</div>
                      </div>
                    ))}
                    {day.bookings.length === 0 && (
                      <div className="text-[11px] text-slate-400 text-center py-4 italic">
                        Free
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW & SELECTED DATE DETAILS (Section 5 Requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                Bookings for {formatDateDMY(selectedDate)}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {dayBookings.length} {dayBookings.length === 1 ? 'Job' : 'Jobs'} Scheduled • Tap a booking for WhatsApp or Edit
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenNewBookingWithPrefill({ serviceDate: selectedDate })}
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Book on this Date</span>
          </button>
        </div>

        {/* Slots Grouped Breakdown */}
        {dayBookings.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-700">No Bookings Scheduled</div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              All 5 Jodis are fully available for Morning, Afternoon, and Evening slots on this date.
            </p>
            <button
              type="button"
              onClick={() => onOpenNewBookingWithPrefill({ serviceDate: selectedDate })}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Booking</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {TIME_SLOTS.map((slot) => {
              const slotBookings = dayBookings.filter(b => b.timeSlot === slot);
              const hours = TIME_SLOT_HOURS[slot];

              return (
                <div key={slot} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-b border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{slot}</span>
                      <span className="text-slate-500">({hours.time})</span>
                    </div>
                    <span className="font-semibold text-slate-600">
                      {slotBookings.length} / {jodis.filter(j => j.active).length} Jodis Booked
                    </span>
                  </div>

                  {slotBookings.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 italic bg-white text-center">
                      Slot is empty. All Jodis available.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 bg-white">
                      {slotBookings.map((b) => {
                        const statusColor = STATUS_COLORS[b.jobStatus] || STATUS_COLORS['Confirmed'];

                        return (
                          <div 
                            key={b.id}
                            className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => onSelectBooking(b)}
                            >
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                  {b.refNo}
                                </span>
                                <h4 className="font-bold text-sm text-slate-900">
                                  {b.customerName}
                                </h4>
                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                                  <Users className="w-3 h-3" />
                                  {b.assignedStaff}
                                </span>
                              </div>

                              <div className="text-xs text-slate-600 line-clamp-1 mb-1.5">
                                <strong className="text-slate-800">{b.services}</strong> • {b.address}
                              </div>

                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>Amount: <strong className="text-slate-800">{formatAmountDisplay(b.amount)}</strong></span>
                                <span className={`px-2 py-0.2 rounded-full font-semibold border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                                  {b.jobStatus}
                                </span>
                              </div>
                            </div>

                            {/* WhatsApp & Call shortcuts */}
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => onOpenWhatsAppModal(b)}
                                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>

                              <a
                                href={`tel:${b.customerCell}`}
                                className="p-2 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
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
