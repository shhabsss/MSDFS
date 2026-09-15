import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X,
  FileSpreadsheet,
  ArrowUpDown,
  Send,
  CalendarClock,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Booking, Jodi, TimeSlot, JobStatus } from '../types';
import { 
  TIME_SLOTS, 
  TIME_SLOT_HOURS, 
  STATUS_COLORS, 
  formatDateDMY, 
  getTodayDateString, 
  getDateOffsetString,
  formatAmountDisplay 
} from '../utils/bookingUtils';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface BookingManagementProps {
  bookings: Booking[];
  jodis: Jodi[];
  onOpenNewBooking: () => void;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (bookingId: string) => void;
  onUpdateStatus: (bookingId: string, newStatus: JobStatus) => void;
  onOpenWhatsAppModal: (booking: Booking, initialTab?: 'customer' | 'staff' | 'cancelled' | 'rescheduled') => void;
  onDeleteAllBookings?: () => void;
  onRequestDelete?: (booking: Booking) => void;
  onRetrySheetSync?: (bookingId: string) => void;
}

export const BookingManagement: React.FC<BookingManagementProps> = ({
  bookings,
  jodis,
  onOpenNewBooking,
  onEditBooking,
  onDeleteBooking,
  onUpdateStatus,
  onOpenWhatsAppModal,
  onDeleteAllBookings,
  onRequestDelete,
  onRetrySheetSync
}) => {
  const today = getTodayDateString();
  const tomorrow = getDateOffsetString(1);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'week' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');
  const [slotFilter, setSlotFilter] = useState<string>('all');
  const [jodiFilter, setJodiFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Modal state for deleting a single booking
  const [bookingPendingDelete, setBookingPendingDelete] = useState<Booking | null>(null);
  const [deleteSuccessNotice, setDeleteSuccessNotice] = useState<string | null>(null);

  // Filter logic
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Text search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches = 
          b.refNo.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.customerCell.includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.services.toLowerCase().includes(q) ||
          (b.serviceDescription && b.serviceDescription.toLowerCase().includes(q)) ||
          b.assignedStaff.toLowerCase().includes(q) ||
          (b.assignedStaff2 && b.assignedStaff2.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Date filter
      if (dateFilter === 'today' && b.serviceDate !== today) return false;
      if (dateFilter === 'tomorrow' && b.serviceDate !== tomorrow) return false;
      if (dateFilter === 'custom' && customDate && b.serviceDate !== customDate) return false;
      if (dateFilter === 'week') {
        const d = new Date(b.serviceDate);
        const t = new Date(today);
        const diffDays = Math.round((d.getTime() - t.getTime()) / (1000 * 3600 * 24));
        if (diffDays < 0 || diffDays > 7) return false;
      }

      // Slot filter
      if (slotFilter !== 'all' && b.timeSlot !== slotFilter) return false;

      // Jodi filter
      if (jodiFilter !== 'all' && b.assignedStaff.toLowerCase() !== jodiFilter.toLowerCase()) return false;

      // Status filter
      if (statusFilter !== 'all' && b.jobStatus !== statusFilter) return false;

      return true;
    });
  }, [bookings, searchTerm, dateFilter, customDate, slotFilter, jodiFilter, statusFilter, today, tomorrow]);

  // Sort descending by date, then time slot
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      if (a.serviceDate !== b.serviceDate) {
        return b.serviceDate.localeCompare(a.serviceDate);
      }
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  }, [filteredBookings]);

  const activeFilterCount = 
    (dateFilter !== 'all' ? 1 : 0) +
    (slotFilter !== 'all' ? 1 : 0) +
    (jodiFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0);

  const handleTriggerDelete = (b: Booking) => {
    if (onRequestDelete) {
      onRequestDelete(b);
    } else {
      setBookingPendingDelete(b);
    }
  };

  const handleConfirmInternalDelete = (bookingId: string) => {
    onDeleteBooking(bookingId);
    setBookingPendingDelete(null);
    setDeleteSuccessNotice('Booking deleted successfully.');
    setTimeout(() => {
      setDeleteSuccessNotice(null);
    }, 4000);
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Success Notification Alert */}
      {deleteSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-sm font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{deleteSuccessNotice}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setDeleteSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Top Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Ref No (e.g. MSD/PDY/1030), Customer, Mobile, Area, Staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter toggle & Add button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                showFilters || activeFilterCount > 0
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenNewBooking}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add Booking</span>
            </button>
          </div>

        </div>

        {/* Expandable Filter Drawer */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {/* Date Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Date</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium outline-none cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today ({formatDateDMY(today)})</option>
                <option value="tomorrow">Tomorrow ({formatDateDMY(tomorrow)})</option>
                <option value="week">Next 7 Days</option>
                <option value="custom">Custom Date</option>
              </select>
              {dateFilter === 'custom' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 text-[11px]"
                />
              )}
            </div>

            {/* Time Slot Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Time Slot (3 Available)</label>
              <select
                value={slotFilter}
                onChange={(e) => setSlotFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium outline-none cursor-pointer"
              >
                <option value="all">All 3 Slots</option>
                {TIME_SLOTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Staff / Jodi Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Staff Member</label>
              <select
                value={jodiFilter}
                onChange={(e) => setJodiFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium outline-none cursor-pointer"
              >
                <option value="all">All Staff</option>
                {jodis.map(j => (
                  <option key={j.id} value={j.name}>{j.name} ({j.members})</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Job Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="New">New</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Postponed">Postponed</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <div className="col-span-2 sm:col-span-4 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('all');
                    setSlotFilter('all');
                    setJodiFilter('all');
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Bookings Count Summary Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
        <span>Showing <strong>{sortedBookings.length}</strong> of {bookings.length} Bookings</span>
        <span className="font-mono text-[11px]">Sequential Ref: MSD/PDY/1030+</span>
      </div>

      {/* Bookings Cards List */}
      {sortedBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500 text-sm font-semibold">No bookings found matching your search.</p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setDateFilter('all');
              setSlotFilter('all');
              setJodiFilter('all');
              setStatusFilter('all');
            }}
            className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedBookings.map((b) => {
            const statusStyle = STATUS_COLORS[b.jobStatus] || STATUS_COLORS['Confirmed'];
            const hours = TIME_SLOT_HOURS[b.timeSlot] || { time: '' };
            const isCancelled = b.jobStatus === 'Cancelled';
            const isRescheduled = b.jobStatus === 'Postponed' || b.jobStatus === 'Rescheduled';

            return (
              <div 
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:border-blue-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  
                  {/* Left info column */}
                  <div className="space-y-2 flex-1">
                    
                    {/* Ref No, Date, and Slot badges */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-mono font-black text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                        {b.refNo}
                      </span>

                      <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDateDMY(b.serviceDate)}
                      </span>

                      <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {b.timeSlot} ({hours.time})
                      </span>

                      <span className={`font-bold px-2 py-0.5 rounded-full border text-[11px] ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        {b.jobStatus}
                      </span>

                      {/* Small Google Sheet Sync Status Badge */}
                      <span 
                        className={`font-semibold px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 border ${
                          b.sheetSyncStatus === 'Synced'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : b.sheetSyncStatus === 'Failed'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                        title={b.sheetSyncError ? `Error: ${b.sheetSyncError}` : (b.sheetSyncStatus === 'Synced' ? 'Synced to Google Sheet tab GID 997243141' : 'Pending Google Sheet sync')}
                      >
                        <span className="text-slate-600">Google Sheet:</span>
                        {b.sheetSyncStatus === 'Synced' ? (
                          <span className="font-bold text-emerald-700">✓ Synced</span>
                        ) : b.sheetSyncStatus === 'Failed' ? (
                          <span className="font-bold text-rose-700 flex items-center gap-1">
                            ⚠ Sync Failed
                            {onRetrySheetSync && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRetrySheetSync(b.id);
                                }}
                                className="ml-1 underline font-bold hover:text-rose-900 cursor-pointer"
                                title="Retry syncing to Google Sheet"
                              >
                                Retry
                              </button>
                            )}
                          </span>
                        ) : (
                          <span className="font-bold text-amber-700">⏳ Pending</span>
                        )}
                      </span>
                    </div>

                    {/* Customer details */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        {b.customerName}
                        <a
                          href={`tel:${b.customerCell}`}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1"
                          title="Call Customer"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{b.customerCell}</span>
                        </a>
                      </h3>
                      <p className="text-xs text-slate-600 flex items-start gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{b.address}</span>
                      </p>
                    </div>

                    {/* Service & Staff Info */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Service: </span>
                        <strong className="text-slate-900">{b.services}</strong>
                      </div>

                      <div className="flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                        <Users className="w-3.5 h-3.5" />
                        <span>{b.assignedStaff}</span>
                        {b.assignedStaff2 && (
                          <span className="text-emerald-700 font-bold">
                            + {b.assignedStaff2}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-500">Amount: </span>
                        <strong className="text-slate-900 text-sm font-black">{formatAmountDisplay(b.amount)}</strong>
                      </div>

                      {b.serviceDescription && (
                        <div className="w-full pt-2 border-t border-slate-200/80 text-xs">
                          <span className="text-slate-500 font-medium">Service Description: </span>
                          <span className="text-slate-800 font-semibold">{b.serviceDescription}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Alert Banners if Cancelled or Postponed */}
                    {isCancelled && (
                      <div className="text-[11px] text-rose-800 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Booking is Cancelled. Slot is released.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenWhatsAppModal(b, 'cancelled')}
                          className="font-bold text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send Cancel MSG</span>
                        </button>
                      </div>
                    )}

                    {isRescheduled && (
                      <div className="text-[11px] text-violet-800 bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CalendarClock className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                          <span>Booking is Postponed / Rescheduled.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenWhatsAppModal(b, 'rescheduled')}
                          className="font-bold text-violet-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send Reschedule MSG</span>
                        </button>
                      </div>
                    )}

                    {b.notes && (
                      <div className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-200/60">
                        Note: {b.notes}
                      </div>
                    )}
                  </div>

                  {/* Right Actions column */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    
                    {/* Status quick select with all 8 statuses */}
                    <select
                      value={b.jobStatus}
                      onChange={(e) => onUpdateStatus(b.id, e.target.value as JobStatus)}
                      className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                    >
                      <option value="New">New</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Postponed">Postponed</option>
                      <option value="Rescheduled">Rescheduled</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      {/* Send WhatsApp & SMS */}
                      <button
                        type="button"
                        onClick={() => onOpenWhatsAppModal(b)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                        title="Open WhatsApp & SMS Messages"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEditBooking(b)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                        title="Edit Booking"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete with safe confirmation modal */}
                      <button
                        type="button"
                        onClick={() => handleTriggerDelete(b)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                        title="Delete Booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bookingPendingDelete && (
        <DeleteConfirmationModal
          isOpen={!!bookingPendingDelete}
          onClose={() => setBookingPendingDelete(null)}
          booking={bookingPendingDelete}
          onConfirmDelete={handleConfirmInternalDelete}
        />
      )}

    </div>
  );
};
