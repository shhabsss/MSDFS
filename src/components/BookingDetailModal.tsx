import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  DollarSign, 
  MessageCircle, 
  Edit3, 
  Trash2,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Send
} from 'lucide-react';
import { Booking, Jodi, JobStatus } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { 
  formatDateDMY, 
  formatAmountDisplay, 
  STATUS_COLORS, 
  TIME_SLOT_HOURS 
} from '../utils/bookingUtils';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onEdit: (booking: Booking) => void;
  onOpenWhatsAppModal: (booking: Booking, initialTab?: 'customer' | 'staff' | 'cancelled' | 'rescheduled') => void;
  onUpdateStatus: (bookingId: string, status: JobStatus) => void;
  onRequestDelete: (booking: Booking) => void;
  onRetrySheetSync?: (bookingId: string) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  isOpen,
  onClose,
  booking,
  onEdit,
  onOpenWhatsAppModal,
  onUpdateStatus,
  onRequestDelete,
  onRetrySheetSync
}) => {
  if (!isOpen || !booking) return null;

  const statusStyle = STATUS_COLORS[booking.jobStatus] || STATUS_COLORS['Confirmed'];
  const hours = TIME_SLOT_HOURS[booking.timeSlot];

  const isCancelled = booking.jobStatus === 'Cancelled';
  const isRescheduledOrPostponed = booking.jobStatus === 'Postponed' || booking.jobStatus === 'Rescheduled';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Company Logo */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <CompanyLogo size="md" className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-600/40">
                  {booking.refNo}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                  {booking.jobStatus}
                </span>
              </div>
              <h3 className="font-black text-base sm:text-lg text-white mt-1">
                {booking.customerName}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Status and Quick Action */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block">Change Status:</span>
              <span className="text-xs font-medium text-slate-700">
                Current: <strong>{booking.jobStatus}</strong>
              </span>
            </div>

            <select
              value={booking.jobStatus}
              onChange={(e) => onUpdateStatus(booking.id, e.target.value as JobStatus)}
              className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
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
          </div>

          {/* Cancellation Notice Banner & Trigger */}
          {isCancelled && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <div className="font-bold text-xs text-rose-900">Booking is Cancelled</div>
                  <div className="text-[11px] text-rose-700">Slot has been freed. Notify the customer.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWhatsAppModal(booking, 'cancelled');
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Send Cancellation</span>
              </button>
            </div>
          )}

          {/* Rescheduled / Postponed Notice Banner & Trigger */}
          {isRescheduledOrPostponed && (
            <div className="bg-violet-50 border border-violet-200 p-3.5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CalendarClock className="w-5 h-5 text-violet-600 shrink-0" />
                <div>
                  <div className="font-bold text-xs text-violet-900">Booking Postponed / Rescheduled</div>
                  <div className="text-[11px] text-violet-700">Ref No is retained. Send updated schedule.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWhatsAppModal(booking, 'rescheduled');
                }}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Send Reschedule MSG</span>
              </button>
            </div>
          )}

          {/* Customer & Location */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer & Location</h4>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mobile Phone:</span>
                <a
                  href={`tel:${booking.customerCell}`}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>{booking.customerCell}</span>
                </a>
              </div>
              <div>
                <span className="text-slate-500 block">Address:</span>
                <span className="font-semibold text-slate-800">{booking.address}</span>
              </div>
            </div>
          </div>

          {/* Schedule & Staff */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Schedule & Staff Assignment</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Service Date</span>
                <strong className="text-slate-900 font-bold">{formatDateDMY(booking.serviceDate)}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Time Slot</span>
                <strong className="text-slate-900 font-bold">{booking.timeSlot}</strong>
                <span className="text-[10px] text-slate-400 block">{hours?.time}</span>
              </div>
            </div>

            <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-indigo-800 block text-[11px] font-semibold">Assigned Staff</span>
                <strong className="text-indigo-950 font-bold text-sm">
                  {booking.assignedStaff} {booking.assignedStaff2 ? `& ${booking.assignedStaff2}` : ''}
                </strong>
              </div>
              <span className="text-indigo-700 font-mono text-xs">{booking.staffCell}</span>
            </div>
          </div>

          {/* Service & Price */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Service & Payment</h4>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Service</span>
                <strong className="text-slate-900 font-bold">{booking.services}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Amount</span>
                <strong className="text-slate-900 font-black text-base">{formatAmountDisplay(booking.amount)}</strong>
              </div>
            </div>

            {booking.serviceDescription && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block text-[11px] font-semibold mb-0.5">Service Description</span>
                <p className="text-slate-800 font-medium whitespace-pre-wrap">{booking.serviceDescription}</p>
              </div>
            )}
          </div>

          {booking.notes && (
            <div className="text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
              <strong>Notes:</strong> {booking.notes}
            </div>
          )}

          {/* Google Sheet Sync Info */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold">Google Sheet (Tab GID: 997243141)</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-slate-700 font-medium">Status:</span>
                {booking.sheetSyncStatus === 'Synced' ? (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    ✓ Synced
                  </span>
                ) : booking.sheetSyncStatus === 'Failed' ? (
                  <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                    ⚠ Sync Failed
                  </span>
                ) : (
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                    ⏳ Pending
                  </span>
                )}
              </div>
            </div>

            {onRetrySheetSync && (
              <button
                type="button"
                onClick={() => onRetrySheetSync(booking.id)}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Sync Now
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWhatsAppModal(booking);
              }}
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp / SMS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(booking);
              }}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onRequestDelete(booking);
              }}
              className="py-2.5 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs sm:text-sm rounded-xl border border-rose-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Delete this booking permanently"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
