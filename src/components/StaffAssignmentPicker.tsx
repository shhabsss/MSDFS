import React from 'react';
import { 
  Users, 
  Crown, 
  Check, 
  AlertTriangle, 
  Phone, 
  Clock, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Jodi, Booking, TimeSlot } from '../types';
import { checkStaffConflict, formatStaffNameWithTitle } from '../utils/bookingUtils';

interface StaffAssignmentPickerProps {
  staffList: Jodi[];
  existingBookings: Booking[];
  serviceDate: string;
  timeSlot: TimeSlot;
  currentBookingId?: string;
  selectedStaffNames: string[];
  leaderStaffName: string;
  onChange: (selectedNames: string[], leaderName: string) => void;
}

export const StaffAssignmentPicker: React.FC<StaffAssignmentPickerProps> = ({
  staffList,
  existingBookings,
  serviceDate,
  timeSlot,
  currentBookingId,
  selectedStaffNames,
  leaderStaffName,
  onChange
}) => {
  const activeStaff = staffList.filter(s => s.active);

  // Toggle selection for a staff member
  const handleToggleStaff = (staffName: string) => {
    let newSelected: string[];
    let newLeader = leaderStaffName;

    if (selectedStaffNames.includes(staffName)) {
      // Unselect
      newSelected = selectedStaffNames.filter(name => name !== staffName);
      if (newLeader === staffName) {
        newLeader = newSelected.length > 0 ? newSelected[0] : '';
      }
    } else {
      // Select
      newSelected = [...selectedStaffNames, staffName];
      if (!newLeader || newSelected.length === 1) {
        newLeader = staffName;
      }
    }

    onChange(newSelected, newLeader);
  };

  const handleSetLeader = (staffName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedStaffNames.includes(staffName)) {
      onChange([...selectedStaffNames, staffName], staffName);
    } else {
      onChange(selectedStaffNames, staffName);
    }
  };

  // Find all conflicts for currently selected staff
  const conflicts = selectedStaffNames.map(staffName => {
    const result = checkStaffConflict(
      existingBookings,
      staffName,
      serviceDate,
      timeSlot,
      currentBookingId
    );
    return {
      staffName,
      hasConflict: result.hasConflict,
      conflictingBooking: result.conflictingBooking
    };
  }).filter(c => c.hasConflict && c.conflictingBooking);

  return (
    <div className="space-y-3.5">
      {/* Header & Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-4 h-4 text-amber-400" />
          <span>Staff Team Assignment (6 Staff Members) *</span>
        </label>

        <span className="text-[11px] text-slate-400 font-medium">
          {selectedStaffNames.length === 0 ? (
            <span className="text-rose-400 font-bold">Select at least 1 staff member</span>
          ) : selectedStaffNames.length === 1 ? (
            <span className="text-emerald-400 font-semibold">1 Staff Assigned: {selectedStaffNames[0]}</span>
          ) : (
            <span className="text-amber-300 font-semibold">
              Team of {selectedStaffNames.length} • Leader: {leaderStaffName || selectedStaffNames[0]}
            </span>
          )}
        </span>
      </div>

      {/* Selected Team Banner */}
      {selectedStaffNames.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium">Assigned:</span>
            {selectedStaffNames.map(name => {
              const isLeader = name === leaderStaffName || (selectedStaffNames.length === 1 && !leaderStaffName);
              return (
                <span
                  key={name}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition-all ${
                    isLeader
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  {isLeader && <Crown className="w-3 h-3 text-amber-400 fill-amber-400/30" />}
                  <span>{formatStaffNameWithTitle(name)}</span>
                  {isLeader && <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider">(Leader)</span>}
                </span>
              );
            })}
          </div>

          {selectedStaffNames.length > 1 && (
            <span className="text-[11px] text-slate-400 italic shrink-0">
              Click crown on card to change leader
            </span>
          )}
        </div>
      )}

      {/* Conflict Warning Box */}
      {conflicts.length > 0 && (
        <div className="bg-rose-950/80 border border-rose-600/70 rounded-xl p-3.5 space-y-2 text-xs text-rose-200 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-rose-300 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>⚠️ Schedule Conflict Warning Detected</span>
          </div>
          {conflicts.map(({ staffName, conflictingBooking }) => (
            <div key={staffName} className="pl-6 text-[11px] text-rose-200 space-y-0.5">
              <p>
                <strong>Mr. {staffName}</strong> already has a booking during this slot:
              </p>
              <p className="font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded inline-block border border-rose-800/40">
                {conflictingBooking?.refNo} • {conflictingBooking?.timeSlot} — {conflictingBooking?.address}
              </p>
            </div>
          ))}
          <p className="pl-6 text-[10px] text-rose-300/80 italic">
            You can still confirm this assignment if the staff is multi-tasking or handling this with team support.
          </p>
        </div>
      )}

      {/* 6 Staff Selectable Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {activeStaff.map(staff => {
          const isSelected = selectedStaffNames.includes(staff.name);
          const isLeader = isSelected && (staff.name === leaderStaffName || (selectedStaffNames.length === 1 && !leaderStaffName));
          
          // Conflict check for this staff
          const conflict = checkStaffConflict(
            existingBookings,
            staff.name,
            serviceDate,
            timeSlot,
            currentBookingId
          );

          // Count jobs today for this staff
          const staffLower = staff.name.trim().toLowerCase();
          const dayBookings = existingBookings.filter(b => {
            if (b.serviceDate !== serviceDate || b.jobStatus === 'Cancelled' || b.jobStatus === 'Postponed') return false;
            if (currentBookingId && b.id === currentBookingId) return false;
            return (
              (b.assignedStaff && b.assignedStaff.trim().toLowerCase() === staffLower) ||
              (b.assignedStaff2 && b.assignedStaff2.trim().toLowerCase() === staffLower) ||
              (b.teamLeader && b.teamLeader.trim().toLowerCase() === staffLower) ||
              (b.teamMembers && Array.isArray(b.teamMembers) && b.teamMembers.some(m => m.trim().toLowerCase() === staffLower))
            );
          });
          const jobsTodayCount = dayBookings.length;

          return (
            <div
              key={staff.id}
              id={`staff-picker-card-${staff.id}`}
              onClick={() => handleToggleStaff(staff.name)}
              className={`relative cursor-pointer rounded-xl p-3 border transition-all select-none ${
                isSelected
                  ? isLeader
                    ? 'bg-slate-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-900 border-blue-500/70 shadow-md ring-1 ring-blue-500/30'
                  : 'bg-slate-950/70 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Selection Checkbox */}
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-slate-700 bg-slate-900'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border ${
                    isSelected
                      ? isLeader 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {staff.name.charAt(0)}
                  </div>

                  {/* Staff Details */}
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs truncate flex items-center gap-1">
                      <span>Mr. {staff.name}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-slate-500" />
                      <span>{staff.phone}</span>
                    </p>
                  </div>
                </div>

                {/* Leader Button / Badge */}
                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => handleSetLeader(staff.name, e)}
                    className={`p-1 rounded-lg transition-all ${
                      isLeader
                        ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40 shadow-xs'
                        : 'text-slate-500 hover:text-amber-300 bg-slate-800 hover:bg-slate-700 border border-slate-700'
                    }`}
                    title={isLeader ? 'Current Leader' : 'Set as Team Leader'}
                  >
                    <Crown className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status pill & Workload */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                {conflict.hasConflict ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Busy at this slot</span>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Available</span>
                  </span>
                )}

                <span className="text-slate-400 font-medium">
                  {jobsTodayCount} / {staff.maxServicesPerDay || 3} today
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
