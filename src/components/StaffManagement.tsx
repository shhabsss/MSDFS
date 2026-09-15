import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Phone, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  TrendingUp, 
  Check, 
  X,
  Sparkles,
  History,
  Briefcase
} from 'lucide-react';
import { Jodi, Booking, ActiveTab } from '../types';
import { formatDateDMY, formatAmountDisplay, getTodayDateString } from '../utils/bookingUtils';

interface StaffManagementProps {
  jodis: Jodi[];
  bookings: Booking[];
  onAddJodi: (jodi: Jodi) => void;
  onUpdateJodi: (jodi: Jodi) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedDate: (date: string) => void;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({
  jodis,
  bookings,
  onAddJodi,
  onUpdateJodi,
  setActiveTab,
  setSelectedDate
}) => {
  const today = getTodayDateString();

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Jodi | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [maxServices, setMaxServices] = useState(3);
  const [active, setActive] = useState(true);

  // Expanded work history state
  const [expandedStaffName, setExpandedStaffName] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingStaff(null);
    setName('');
    setRole('Cleaner & Specialist');
    setPhone('');
    setMaxServices(3);
    setActive(true);
    setShowModal(true);
  };

  const openEditModal = (staff: Jodi) => {
    setEditingStaff(staff);
    setName(staff.name);
    setRole(staff.role || staff.members);
    setPhone(staff.phone);
    setMaxServices(staff.maxServicesPerDay || 3);
    setActive(staff.active);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStaff) {
      onUpdateJodi({
        ...editingStaff,
        name: name.trim(),
        role: role.trim() || 'Staff Member',
        members: role.trim() || name.trim(),
        phone: phone.trim() || '9842112233',
        maxServicesPerDay: maxServices || 3,
        active
      });
    } else {
      const newStaff: Jodi = {
        id: `staff-${Date.now()}`,
        name: name.trim(),
        role: role.trim() || 'Staff Member',
        members: role.trim() || name.trim(),
        phone: phone.trim() || '9842112233',
        maxServicesPerDay: maxServices || 3,
        active
      };
      onAddJodi(newStaff);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              6-Staff Roster & Capacity
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            6 Individual Staff Members • <strong>1 staff can do maximum 3 services per day</strong> (Morning, Afternoon, Evening)
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Staff Member</span>
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {jodis.map((staff) => {
          const staffNameLower = staff.name.trim().toLowerCase();
          const staffBookings = bookings.filter(
            b => b.assignedStaff.trim().toLowerCase() === staffNameLower ||
                 (b.assignedStaff2 && b.assignedStaff2.trim().toLowerCase() === staffNameLower)
          );
          const completedJobs = staffBookings.filter(b => b.jobStatus === 'Completed');
          const todayJobs = staffBookings.filter(b => b.serviceDate === today && b.jobStatus !== 'Cancelled');
          
          let revenueCollected = 0;
          completedJobs.forEach(b => {
            const m = b.amount.match(/\d+/);
            if (m) revenueCollected += parseInt(m[0], 10);
          });

          const maxServicesLimit = staff.maxServicesPerDay || 3;
          const isFullToday = todayJobs.length >= maxServicesLimit;
          const isExpanded = expandedStaffName === staff.name;

          return (
            <div
              key={staff.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between ${
                staff.active ? 'border-slate-200 hover:border-blue-300' : 'border-slate-200 bg-slate-50/50 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">{staff.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          staff.active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {staff.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {staff.role || staff.members || 'Staff Member'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditModal(staff)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit staff details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Contact info */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mobile: <strong className="text-slate-800">{staff.phone}</strong></span>
                  <a
                    href={`tel:${staff.phone}`}
                    className="text-blue-600 hover:underline font-bold text-[11px] ml-1"
                  >
                    Call
                  </a>
                </div>

                {/* Performance & Capacity Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-center text-xs mb-3">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Today's Load</div>
                    <div className={`text-sm font-black ${isFullToday ? 'text-rose-600' : 'text-blue-700'}`}>
                      {todayJobs.length} / {maxServicesLimit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Completed</div>
                    <div className="text-sm font-black text-emerald-700">
                      {completedJobs.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Total Rev</div>
                    <div className="text-sm font-black text-slate-900">
                      ₹{revenueCollected.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* 3-Dot Daily Workload Meter */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Daily Capacity (Max 3)</span>
                    <span className="font-semibold">
                      {isFullToday ? 'Full Today' : `${maxServicesLimit - todayJobs.length} slots free`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((idx) => (
                      <div 
                        key={idx}
                        className={`h-2 flex-1 rounded-full ${
                          idx < todayJobs.length 
                            ? isFullToday ? 'bg-rose-500' : 'bg-blue-500' 
                            : 'bg-slate-200'
                        }`}
                        title={`Service ${idx + 1} of 3`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions & History Button */}
              <div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(today);
                      setActiveTab('schedule');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View Matrix</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedStaffName(isExpanded ? null : staff.name)}
                    className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isExpanded ? 'Hide' : `History (${staffBookings.length})`}</span>
                  </button>
                </div>

                {/* Work History Accordion */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 max-h-48 overflow-y-auto">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Bookings for {staff.name}
                    </div>
                    {staffBookings.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-1">No bookings recorded yet.</div>
                    ) : (
                      staffBookings.map((b) => (
                        <div key={b.id} className="p-2 bg-slate-50 rounded-lg text-xs flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-800">{b.customerName}</div>
                            <div className="text-[10px] text-slate-500">
                              {formatDateDMY(b.serviceDate)} • {b.timeSlot}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-700">{formatAmountDisplay(b.amount)}</div>
                            <div className="text-[9px] font-semibold text-slate-400">{b.jobStatus}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingStaff ? `Edit Staff: ${editingStaff.name}` : 'Add Staff Member'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff Member Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Murugan, Selvi, Farhad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role / Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Cleaner, Sofa Specialist"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9842112233"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Services Allowed Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={maxServices}
                  onChange={(e) => setMaxServices(parseInt(e.target.value, 10) || 3)}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">Default is 3 services per day (Morning, Afternoon, Evening).</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="activeToggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Active for Schedule & Bookings
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
