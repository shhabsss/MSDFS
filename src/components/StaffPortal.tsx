import React, { useState } from 'react';
import { 
  Users, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  FileText, 
  MessageCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Booking, Jodi, JobStatus } from '../types';
import { formatDateDMY, getTodayDateString, STATUS_COLORS, formatAmountDisplay, TIME_SLOT_HOURS } from '../utils/bookingUtils';

interface StaffPortalProps {
  currentJodi: Jodi;
  bookings: Booking[];
  onUpdateJobStatus: (bookingId: string, status: JobStatus, note?: string) => void;
  onOpenWhatsAppModal: (booking: Booking) => void;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({
  currentJodi,
  bookings,
  onUpdateJobStatus,
  onOpenWhatsAppModal
}) => {
  const today = getTodayDateString();

  // Filter jobs assigned to this Jodi
  const jodiBookings = bookings.filter(
    b => b.assignedStaff.trim().toLowerCase() === currentJodi.name.trim().toLowerCase()
  );

  const todayJobs = jodiBookings.filter(b => b.serviceDate === today);
  const upcomingJobs = jodiBookings.filter(b => b.serviceDate > today);
  const completedJobs = jodiBookings.filter(b => b.jobStatus === 'Completed');

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'history'>('today');
  const [jobNoteText, setJobNoteText] = useState<Record<string, string>>({});

  const displayedJobs = activeTab === 'today' ? todayJobs : activeTab === 'upcoming' ? upcomingJobs : completedJobs;

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto">
      
      {/* Staff Jodi Profile Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
              Field Technician Mode
            </span>
            <h2 className="text-xl font-black mt-1 text-white">
              {currentJodi.name}
            </h2>
            <p className="text-xs text-slate-400">
              Team: <strong className="text-white">{currentJodi.members}</strong> • Phone: {currentJodi.phone}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-3 gap-1 bg-slate-800/90 rounded-xl p-1 mt-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`py-2 rounded-lg text-center transition-all ${
              activeTab === 'today' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Today ({todayJobs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 rounded-lg text-center transition-all ${
              activeTab === 'upcoming' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingJobs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 rounded-lg text-center transition-all ${
              activeTab === 'history' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({completedJobs.length})
          </button>
        </div>
      </div>

      {/* Jobs List for Technician */}
      {displayedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No Jobs Assigned</h3>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'today' 
              ? 'You have no scheduled cleanings for today. Check with admin if needed.' 
              : 'No jobs found in this section.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedJobs.map((b) => {
            const statusStyle = STATUS_COLORS[b.jobStatus] || STATUS_COLORS['Confirmed'];
            const hours = TIME_SLOT_HOURS[b.timeSlot];

            return (
              <div 
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {b.refNo}
                    </span>
                    <span className="ml-2 font-bold text-xs text-slate-800">
                      {b.timeSlot}
                    </span>
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                    {b.jobStatus}
                  </span>
                </div>

                {/* Customer Details & Tap to Call */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-slate-900">{b.customerName}</h3>
                    <a
                      href={`tel:${b.customerCell}`}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Customer</span>
                    </a>
                  </div>

                  {/* Address with Google Maps button */}
                  <div className="mt-2 text-xs text-slate-600 flex items-start justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-start gap-1.5 flex-1">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{b.address}</span>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address + ' Puducherry')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs"
                    >
                      <Navigation className="w-3 h-3 text-blue-600" />
                      <span>Navigate</span>
                    </a>
                  </div>
                </div>

                {/* Service & Amount Info */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Service</span>
                    <strong className="text-slate-900 font-bold">{b.services}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Amount to Collect</span>
                    <strong className="text-slate-900 font-black text-sm">{formatAmountDisplay(b.amount)}</strong>
                  </div>
                </div>

                {b.serviceDescription && (
                  <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] font-semibold">Service Description / Scope:</span>
                    <p className="text-slate-800 font-medium whitespace-pre-wrap mt-0.5">{b.serviceDescription}</p>
                  </div>
                )}

                {/* Status action buttons */}
                <div className="pt-1 flex items-center gap-2">
                  {b.jobStatus !== 'In Progress' && b.jobStatus !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => onUpdateJobStatus(b.id, 'In Progress')}
                      className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-xl transition-all"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {b.jobStatus !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => onUpdateJobStatus(b.id, 'Completed')}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                    >
                      Mark Completed
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenWhatsAppModal(b)}
                    className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl"
                    title="View Assignment MSG"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
