import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Copy, 
  Check, 
  User, 
  Users, 
  Send,
  RotateCcw,
  MessageSquare,
  XCircle,
  CalendarClock
} from 'lucide-react';
import { Booking } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { 
  getWhatsAppUrl, 
  getSMSUrl,
  generateCustomerMessage, 
  generateStaffMessage,
  generateCancellationMessage,
  generateRescheduledMessage
} from '../utils/bookingUtils';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  initialTab?: 'customer' | 'staff' | 'cancelled' | 'rescheduled';
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  booking,
  initialTab = 'customer'
}) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'staff' | 'cancelled' | 'rescheduled'>(initialTab);
  const [copied, setCopied] = useState(false);
  const [customerText, setCustomerText] = useState('');
  const [staffText, setStaffText] = useState('');
  const [cancelledText, setCancelledText] = useState('');
  const [rescheduledText, setRescheduledText] = useState('');

  // Synchronize initial tab when opened
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      } else if (booking?.jobStatus === 'Cancelled') {
        setActiveTab('cancelled');
      } else if (booking?.jobStatus === 'Postponed' || booking?.jobStatus === 'Rescheduled') {
        setActiveTab('rescheduled');
      } else {
        setActiveTab('customer');
      }
    }
  }, [isOpen, initialTab, booking?.jobStatus]);

  // Update messages whenever booking changes
  useEffect(() => {
    if (booking) {
      const freshCustomer = generateCustomerMessage({
        customerName: booking.customerName,
        refNo: booking.refNo,
        services: booking.services,
        serviceDescription: booking.serviceDescription,
        serviceDate: booking.serviceDate,
        timeSlot: booking.timeSlot,
        address: booking.address,
        assignedStaff: booking.assignedStaff,
        staffCell: booking.staffCell,
        assignedStaff2: booking.assignedStaff2,
        staffCell2: booking.staffCell2,
        teamLeader: booking.teamLeader,
        teamMembers: booking.teamMembers,
        amount: booking.amount
      });

      const freshStaff = generateStaffMessage({
        refNo: booking.refNo,
        customerName: booking.customerName,
        customerCell: booking.customerCell,
        address: booking.address,
        services: booking.services,
        serviceDescription: booking.serviceDescription,
        serviceDate: booking.serviceDate,
        timeSlot: booking.timeSlot,
        amount: booking.amount
      });

      const freshCancelled = generateCancellationMessage({
        customerName: booking.customerName,
        refNo: booking.refNo,
        services: booking.services,
        serviceDescription: booking.serviceDescription,
        serviceDate: booking.serviceDate,
        timeSlot: booking.timeSlot,
        address: booking.address
      });

      const freshRescheduled = generateRescheduledMessage({
        customerName: booking.customerName,
        refNo: booking.refNo,
        services: booking.services,
        serviceDescription: booking.serviceDescription,
        serviceDate: booking.serviceDate,
        timeSlot: booking.timeSlot,
        address: booking.address,
        assignedStaff: booking.assignedStaff,
        staffCell: booking.staffCell,
        assignedStaff2: booking.assignedStaff2,
        staffCell2: booking.staffCell2
      });

      setCustomerText(freshCustomer);
      setStaffText(freshStaff);
      setCancelledText(freshCancelled);
      setRescheduledText(freshRescheduled);
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  let currentMsg = customerText;
  if (activeTab === 'staff') currentMsg = staffText;
  else if (activeTab === 'cancelled') currentMsg = cancelledText;
  else if (activeTab === 'rescheduled') currentMsg = rescheduledText;

  const isCustomerRecipient = activeTab !== 'staff';
  const currentPhone = isCustomerRecipient ? booking.customerCell : booking.staffCell;
  const targetLabel = isCustomerRecipient 
    ? booking.customerName 
    : `${booking.assignedStaff} (${booking.staffCell})`;

  const handleResetToTemplate = () => {
    if (activeTab === 'customer') {
      setCustomerText(generateCustomerMessage({
        customerName: booking.customerName,
        refNo: booking.refNo,
        services: booking.services,
        serviceDescription: booking.serviceDescription,
        serviceDate: booking.serviceDate,
        timeSlot: booking.timeSlot,
        address: booking.address,
        assignedStaff: booking.assignedStaff,
        staffCell: booking.staffCell,
        assignedStaff2: booking.assignedStaff2,
        staffCell2: booking.staffCell2,
        teamLeader: booking.teamLeader,
        teamMembers: booking.teamMembers,
        amount: booking.amount
      }));
    } else if (activeTab === 'staff') {
      setStaffText(generateStaffMessage({
        refNo: booking.refNo,
        customerName: booking.customerName,
        customerCell: booking.customerCell,
        address: booking.address,
        services: booking.services,
        serviceDescription: booking.serviceDescription,
        serviceDate: booking.serviceDate,
        timeSlot: booking.timeSlot,
        amount: booking.amount
      }));
    } else if (activeTab === 'cancelled') {
      setCancelledText(generateCancellationMessage({
        customerName: booking.customerName,
        refNo: booking.refNo,
        services: booking.services,
        serviceDescription: booking.serviceDescription,
        serviceDate: booking.serviceDate,
        timeSlot: booking.timeSlot,
        address: booking.address
      }));
    } else if (activeTab === 'rescheduled') {
      setRescheduledText(generateRescheduledMessage({
        customerName: booking.customerName,
        refNo: booking.refNo,
        services: booking.services,
        serviceDescription: booking.serviceDescription,
        serviceDate: booking.serviceDate,
        timeSlot: booking.timeSlot,
        address: booking.address,
        assignedStaff: booking.assignedStaff,
        staffCell: booking.staffCell,
        assignedStaff2: booking.assignedStaff2,
        staffCell2: booking.staffCell2
      }));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentMsg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSendWhatsApp = () => {
    const url = getWhatsAppUrl(currentPhone, currentMsg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendSMSFallback = () => {
    const url = getSMSUrl(currentPhone, currentMsg);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with Company Logo */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-emerald-800 shadow-md">
          <div className="flex items-center gap-3">
            <CompanyLogo size="sm" className="shrink-0" />
            <div>
              <h3 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                <span>WhatsApp & SMS Messages</span>
              </h3>
              <p className="text-[11px] text-emerald-300">
                Booking: <span className="font-mono font-bold text-white bg-emerald-800/80 px-1.5 py-0.5 rounded">{booking.refNo}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: 4 message types */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'customer'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Reminder</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'staff'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Staff Job</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rescheduled')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'rescheduled'
                ? 'bg-white text-violet-800 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5 shrink-0 text-violet-600" />
            <span className="truncate">Rescheduled</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'cancelled'
                ? 'bg-white text-rose-800 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
            <span className="truncate">Cancelled</span>
          </button>
        </div>

        {/* Recipient info bar */}
        <div className="px-5 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-500">Recipient:</span>
            <strong className="text-slate-800 truncate">{targetLabel}</strong>
          </div>
          <span className="font-mono font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 shrink-0">
            {currentPhone || 'No Phone'}
          </span>
        </div>

        {/* Message Preview Box */}
        <div className="p-4 sm:p-5">
          {/* Company Brand Preview Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 p-2.5 rounded-xl border border-emerald-200/80 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CompanyLogo size="sm" />
              <div>
                <span className="text-[11px] font-black text-emerald-950 uppercase tracking-wide block">
                  MSD Facility Services
                </span>
                <span className="text-[10px] text-emerald-800">
                  Official Puducherry Client Dispatch Message
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300">
              Verified
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {activeTab === 'customer' && 'Customer Upcoming Reminder Message'}
              {activeTab === 'staff' && 'Staff New Job Assignment Message'}
              {activeTab === 'cancelled' && 'Customer Booking Cancellation Notice'}
              {activeTab === 'rescheduled' && 'Customer Postponed/Rescheduled Notice'}
            </span>
            <button
              type="button"
              onClick={handleResetToTemplate}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              value={currentMsg}
              onChange={(e) => {
                if (activeTab === 'customer') setCustomerText(e.target.value);
                else if (activeTab === 'staff') setStaffText(e.target.value);
                else if (activeTab === 'cancelled') setCancelledText(e.target.value);
                else if (activeTab === 'rescheduled') setRescheduledText(e.target.value);
              }}
              rows={12}
              className="w-full bg-slate-900 text-slate-100 p-3.5 sm:p-4 rounded-xl text-xs font-mono whitespace-pre-wrap border border-slate-800 leading-relaxed shadow-inner focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            
            {/* Direct Send WhatsApp */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Send WhatsApp</span>
            </button>

            {/* SMS Fallback Button */}
            <button
              type="button"
              onClick={handleSendSMSFallback}
              title="Send via normal SMS if recipient is not registered on WhatsApp"
              className="py-2.5 px-3.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>SMS Fallback</span>
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>Copy</span>
                </>
              )}
            </button>

          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>💡 If customer is not on WhatsApp, use <strong>SMS Fallback</strong></span>
            <span className="font-mono">MSD Facility Services</span>
          </div>
        </div>

      </div>
    </div>
  );
};
