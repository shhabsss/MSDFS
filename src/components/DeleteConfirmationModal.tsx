import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Booking } from '../types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onConfirmDelete: (bookingId: string) => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  booking,
  onClose,
  onConfirmDelete
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-rose-100 max-w-md w-full p-5 sm:p-6 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs border border-rose-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold text-slate-900">
            Delete Booking?
          </h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Are you sure you want to permanently delete booking <strong className="font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{booking.refNo}</strong> for <strong className="text-slate-900">{booking.customerName}</strong>?
          </p>

          <div className="mt-3.5 bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 space-y-1">
            <p className="font-medium flex items-center gap-1.5">
              <span>⚠️</span>
              <span>This booking will be permanently removed from all schedules and dashboard views.</span>
            </p>
            <p className="text-amber-700 text-[11px]">
              Note: Reference number <span className="font-mono font-bold">{booking.refNo}</span> will NOT be reused. Sequential numbering continues forward.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirmDelete(booking.id)}
            className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
