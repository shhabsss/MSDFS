import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  Calendar, 
  Plus, 
  DollarSign, 
  Clock, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';
import { Customer, Booking } from '../types';
import { formatDateDMY, formatAmountDisplay } from '../utils/bookingUtils';

interface CustomerDatabaseProps {
  customers: Customer[];
  bookings: Booking[];
  onOpenNewBookingForCustomer: (customer: Customer) => void;
  onSelectBooking: (booking: Booking) => void;
}

export const CustomerDatabase: React.FC<CustomerDatabaseProps> = ({
  customers,
  bookings,
  onOpenNewBookingForCustomer,
  onSelectBooking
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Customer Database ({customers.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Previous bookings, addresses, and service histories for Puducherry clients
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by customer name, phone number, or Puducherry address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Customer Directory */}
      <div className="space-y-3">
        {filteredCustomers.map((c) => {
          const customerBookings = bookings.filter(
            b => b.customerCell.trim() === c.phone.trim() || b.customerName.toLowerCase() === c.name.toLowerCase()
          );
          const isExpanded = expandedCustomerId === c.id;

          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:border-blue-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                
                {/* Profile info */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900">{c.name}</h3>
                    <a
                      href={`tel:${c.phone}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 hover:bg-blue-100"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{c.phone}</span>
                    </a>
                  </div>

                  <p className="text-xs text-slate-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{c.address}</span>
                  </p>

                  {/* Summary badges */}
                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 flex-wrap">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {customerBookings.length || c.totalBookings} Total Bookings
                    </span>
                    <span>
                      Last Service: <strong className="text-slate-800">{formatDateDMY(c.lastServiceDate)}</strong>
                    </span>
                    <span>
                      Total Spent: <strong className="text-slate-800">{c.totalSpent}</strong>
                    </span>
                  </div>

                  {c.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                      Note: {c.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onOpenNewBookingForCustomer(c)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>+ New Booking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedCustomerId(isExpanded ? null : c.id)}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-2 rounded-xl border border-slate-200 transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>History ({customerBookings.length})</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

              </div>

              {/* History Accordion */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Service History ({c.name})
                  </div>

                  {customerBookings.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-2">
                      No past booking records found for this phone number.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {customerBookings.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => onSelectBooking(b)}
                          className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                              <span className="font-mono text-blue-700">{b.refNo}</span>
                              <span>•</span>
                              <span>{formatDateDMY(b.serviceDate)}</span>
                              <span>({b.timeSlot})</span>
                            </div>
                            <div className="text-slate-600 text-[11px]">
                              {b.services} • Assigned: <strong className="text-indigo-700">{b.assignedStaff}</strong>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-black text-slate-800">{formatAmountDisplay(b.amount)}</div>
                            <div className="text-[10px] font-bold text-slate-500">{b.jobStatus}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
