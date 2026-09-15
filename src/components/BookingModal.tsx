import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  DollarSign, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  Search,
  Sparkles,
  ShieldAlert,
  Zap,
  Check,
  UserPlus,
  Loader2
} from 'lucide-react';
import { Booking, Jodi, TimeSlot, JobStatus, Customer, SavedLocation } from '../types';
import { 
  TIME_SLOTS, 
  ALL_SERVICES,
  SERVICE_DEFAULT_PRICES,
  POPULAR_SERVICES, 
  TIME_SLOT_HOURS,
  getTodayDateString, 
  getDateOffsetString,
  generateNextRefNo,
  commitRefNoUsed,
  generateCustomerMessage, 
  generateStaffMessage,
  formatStaffNameWithTitle,
  BUSINESS_INFO
} from '../utils/bookingUtils';
import { allocateNextBookingRefNoCentral, peekNextBookingRefNoCentral } from '../lib/firebase';
import { CompanyLogo } from './CompanyLogo';
import { LocationSelectDropdown } from './LocationSelectDropdown';
import { StaffAssignmentPicker } from './StaffAssignmentPicker';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking, isEdit: boolean) => void;
  bookingToEdit?: Booking | null;
  existingBookings: Booking[];
  jodis: Jodi[];
  customers: Customer[];
  savedLocations: SavedLocation[];
  onQuickSaveLocation?: (location: Omit<SavedLocation, 'id' | 'createdAt'>) => void;
  initialPrefill?: {
    serviceDate?: string;
    timeSlot?: TimeSlot;
    assignedStaff?: string;
  } | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  bookingToEdit,
  existingBookings,
  jodis,
  customers,
  savedLocations,
  onQuickSaveLocation,
  initialPrefill
}) => {
  const isEdit = !!bookingToEdit;

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerCell, setCustomerCell] = useState('');
  const [address, setAddress] = useState('');
  const [locationId, setLocationId] = useState<string | undefined>(undefined);
  const [serviceDate, setServiceDate] = useState(getTodayDateString());
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('Morning Slot');
  const [services, setServices] = useState('Full Home Deep Cleaning');
  const [serviceDescription, setServiceDescription] = useState('');
  
  // Staff Selection States (Leader + Team)
  const [selectedStaffNames, setSelectedStaffNames] = useState<string[]>([]);
  const [leaderStaffName, setLeaderStaffName] = useState<string>('');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [staffCell, setStaffCell] = useState('');
  const [assignedStaff2, setAssignedStaff2] = useState('');
  const [staffCell2, setStaffCell2] = useState('');

  const [amount, setAmount] = useState('1800');
  const [jobStatus, setJobStatus] = useState<JobStatus>('Confirmed');
  const [notes, setNotes] = useState('');

  // Customer auto-search state
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewRefNo, setPreviewRefNo] = useState<string>('');

  // Handle service selection change and populate corresponding price
  const handleServiceChange = (selectedSvc: string) => {
    setServices(selectedSvc);
    const matchedPrice = SERVICE_DEFAULT_PRICES[selectedSvc];
    if (matchedPrice) {
      setAmount(matchedPrice);
    }
  };

  // Helper to get phone for a staff name
  const getStaffPhone = (name: string): string => {
    const match = jodis.find(s => s.name.trim().toLowerCase() === name.trim().toLowerCase());
    return match ? match.phone : BUSINESS_INFO.primaryPhone;
  };

  // Load preview reference number centrally from database / server
  useEffect(() => {
    if (!isOpen) return;

    if (bookingToEdit?.refNo) {
      setPreviewRefNo(bookingToEdit.refNo);
      return;
    }

    let isMounted = true;
    peekNextBookingRefNoCentral(existingBookings)
      .then((nextRef) => {
        if (isMounted && nextRef) {
          setPreviewRefNo(nextRef);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPreviewRefNo(generateNextRefNo(existingBookings));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, bookingToEdit, existingBookings]);

  // Prepopulate when editing or opening with prefill
  useEffect(() => {
    if (bookingToEdit) {
      setCustomerName(bookingToEdit.customerName);
      setCustomerCell(bookingToEdit.customerCell);
      setAddress(bookingToEdit.address);
      setLocationId(bookingToEdit.locationId);
      setServiceDate(bookingToEdit.serviceDate);
      setTimeSlot(bookingToEdit.timeSlot);
      setServices(bookingToEdit.services);
      setServiceDescription(bookingToEdit.serviceDescription || '');

      const initialLeader = bookingToEdit.teamLeader || bookingToEdit.assignedStaff || '';
      const initialMembers = (bookingToEdit.teamMembers && bookingToEdit.teamMembers.length > 0)
        ? bookingToEdit.teamMembers
        : [bookingToEdit.assignedStaff, bookingToEdit.assignedStaff2].filter(Boolean) as string[];

      setSelectedStaffNames(initialMembers);
      setLeaderStaffName(initialLeader);
      setAssignedStaff(bookingToEdit.assignedStaff || initialLeader);
      setStaffCell(bookingToEdit.staffCell || getStaffPhone(initialLeader));
      setAssignedStaff2(bookingToEdit.assignedStaff2 || '');
      setStaffCell2(bookingToEdit.staffCell2 || '');

      setAmount(bookingToEdit.amount);
      setJobStatus(bookingToEdit.jobStatus);
      setNotes(bookingToEdit.notes || '');
    } else {
      // New booking defaults
      setCustomerName('');
      setCustomerCell('');
      setAddress('');
      setLocationId(undefined);
      setServiceDate(initialPrefill?.serviceDate || getTodayDateString());
      setTimeSlot(initialPrefill?.timeSlot || 'Morning Slot');
      setServices('Full Home Deep Cleaning');
      setServiceDescription('');
      
      const defaultLeader = initialPrefill?.assignedStaff || (jodis.find(s => s.active)?.name || 'Farhad');
      setSelectedStaffNames([defaultLeader]);
      setLeaderStaffName(defaultLeader);
      setAssignedStaff(defaultLeader);
      setStaffCell(getStaffPhone(defaultLeader));
      setAssignedStaff2('');
      setStaffCell2('');

      setAmount('1800');
      setJobStatus('Confirmed');
      setNotes('');
    }
    setErrorMessage('');
  }, [bookingToEdit, initialPrefill, isOpen, jodis]);

  // Handle Staff Picker Changes (Leader + Team Members)
  const handleStaffChange = (names: string[], leader: string) => {
    setSelectedStaffNames(names);
    setLeaderStaffName(leader);

    const primary = leader || names[0] || '';
    const second = names.filter(n => n !== primary)[0] || '';

    setAssignedStaff(primary);
    setAssignedStaff2(second);

    if (primary) {
      setStaffCell(getStaffPhone(primary));
    } else {
      setStaffCell('');
    }

    if (second) {
      setStaffCell2(getStaffPhone(second));
    } else {
      setStaffCell2('');
    }
  };

  // Display Ref No calculation (Sequential starting from MSD/PDY/1030)
  const displayRefNo = useMemo(() => {
    if (isEdit && bookingToEdit?.refNo) return bookingToEdit.refNo;
    if (previewRefNo) return previewRefNo;
    return generateNextRefNo(existingBookings);
  }, [isEdit, bookingToEdit?.refNo, previewRefNo, existingBookings]);

  // Customer search suggestions
  const customerMatches = customerCell.trim().length >= 3
    ? customers.filter(c => c.phone.includes(customerCell.trim()) || c.name.toLowerCase().includes(customerCell.toLowerCase()))
    : [];

  const handleSelectExistingCustomer = (cust: Customer) => {
    setCustomerName(cust.name);
    setCustomerCell(cust.phone);
    setAddress(cust.address);
    setShowCustomerDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter the customer name.');
      return;
    }
    if (!customerCell.trim()) {
      setErrorMessage('Please enter the customer mobile number.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please select or enter the service location/address in Puducherry.');
      return;
    }
    if (selectedStaffNames.length === 0 && !assignedStaff.trim()) {
      setErrorMessage('Please select at least one staff member.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalAssignedStaff = leaderStaffName || assignedStaff || selectedStaffNames[0] || 'Farhad';
      const finalStaffCell1 = staffCell || getStaffPhone(finalAssignedStaff);
      const finalStaffCell2 = staffCell2 || (assignedStaff2 ? getStaffPhone(assignedStaff2) : undefined);

      let refNo = isEdit && bookingToEdit?.refNo ? bookingToEdit.refNo : '';
      if (!refNo) {
        // Atomic multi-user sequential allocator from central database / server
        // NEVER reuses reference numbers even after a booking is deleted
        refNo = await allocateNextBookingRefNoCentral(existingBookings);
      }

      // Commit watermark to local fallback storage as well
      commitRefNoUsed(refNo);

      const timestamp = isEdit && bookingToEdit?.timestamp 
        ? bookingToEdit.timestamp 
        : `${getTodayDateString()} ${new Date().toLocaleTimeString('en-US', { hour12: false })}`;

      const newBooking: Booking = {
        id: isEdit ? bookingToEdit!.id : `booking-${Date.now()}`,
        timestamp,
        refNo,
        customerName: customerName.trim(),
        customerCell: customerCell.trim(),
        address: address.trim(),
        locationId: locationId || undefined,
        serviceDate,
        timeSlot,
        services: services.trim(),
        serviceDescription: serviceDescription.trim(),
        assignedStaff: finalAssignedStaff,
        staffCell: finalStaffCell1,
        assignedStaff2: assignedStaff2.trim() || undefined,
        staffCell2: finalStaffCell2 || undefined,
        teamLeader: finalAssignedStaff,
        teamMembers: selectedStaffNames.length > 0 ? selectedStaffNames : [finalAssignedStaff],
        amount: amount.trim() || '1800',
        jobStatus,
        notes: notes.trim(),
        customerMsg: generateCustomerMessage({
          customerName: customerName.trim(),
          refNo,
          services: services.trim(),
          serviceDescription: serviceDescription.trim(),
          serviceDate,
          timeSlot,
          address: address.trim(),
          assignedStaff: finalAssignedStaff,
          staffCell: finalStaffCell1,
          assignedStaff2: assignedStaff2.trim() || undefined,
          staffCell2: finalStaffCell2 || undefined,
          teamLeader: finalAssignedStaff,
          teamMembers: selectedStaffNames.length > 0 ? selectedStaffNames : [finalAssignedStaff],
          amount: amount.trim() || '1800'
        }),
        staffMsg: generateStaffMessage({
          refNo,
          customerName: customerName.trim(),
          customerCell: customerCell.trim(),
          address: address.trim(),
          services: services.trim(),
          serviceDescription: serviceDescription.trim(),
          serviceDate,
          timeSlot,
          amount: amount.trim() || '1800',
          assignedStaff: finalAssignedStaff,
          assignedStaff2: assignedStaff2.trim() || undefined,
          teamLeader: finalAssignedStaff,
          teamMembers: selectedStaffNames.length > 0 ? selectedStaffNames : [finalAssignedStaff]
        })
      };

      onSave(newBooking, isEdit);
    } catch (err: any) {
      console.error('Error allocating booking reference:', err);
      setErrorMessage(err.message || 'Failed to allocate unique booking reference. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header with Company Logo & Ref No */}
        <div className="bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <CompanyLogo size="md" className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white tracking-tight">
                  {isEdit ? `Edit Booking` : 'New Booking Registration'}
                </h3>
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                  {displayRefNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                MSD Facility Services • Puducherry Booking Portal
              </p>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-950/90 border border-rose-600 text-rose-200 p-3 rounded-xl text-xs flex items-start gap-2.5 shadow-xs">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* Sequential Ref No Indicator Banner */}
          <div className="bg-slate-950 text-white p-3 sm:p-3.5 rounded-xl border border-slate-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Reference Number {isEdit ? '(Locked)' : '(Sequential Starting MSD/PDY/1030)'}
                </span>
                <span className="font-mono text-base font-black text-amber-300 tracking-wide">
                  {displayRefNo}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-600/50">
                Auto-Increment Active
              </span>
            </div>
          </div>

          {/* Section 1: Customer Information with Auto-Search */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Customer Information
              </span>
              <span className="text-[11px] text-blue-400 font-medium bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-800/50">
                Auto-matches saved clients
              </span>
            </div>

            {/* Cell No & Auto-Search */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Customer Mobile Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="e.g. 9840112244"
                  value={customerCell}
                  onChange={(e) => {
                    setCustomerCell(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  className="w-full text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 pl-9 font-medium text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                  required
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              {/* Customer Auto-Search Results Dropdown */}
              {showCustomerDropdown && customerMatches.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-800">
                  <div className="p-2 bg-slate-950 text-blue-400 text-[11px] font-bold flex items-center justify-between">
                    <span>Existing Customer Found (Tap to auto-fill)</span>
                    <button
                      type="button"
                      onClick={() => setShowCustomerDropdown(false)}
                      className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  {customerMatches.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectExistingCustomer(c)}
                      className="p-2.5 hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                    >
                      <div className="font-bold text-white">{c.name} • {c.phone}</div>
                      <div className="text-slate-400 text-[11px] truncate">{c.address}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Customer Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Full name of customer or organization (e.g. Mr. Bahar)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 font-medium text-white outline-none focus:border-blue-500 shadow-inner"
                required
              />
            </div>

            {/* Service Location / Address Searchable Dropdown */}
            <div className="pt-1 border-t border-slate-800/80">
              <LocationSelectDropdown
                value={address}
                onChange={(addr, locId) => {
                  setAddress(addr);
                  if (locId) setLocationId(locId);
                }}
                savedLocations={savedLocations}
                onQuickSaveLocation={onQuickSaveLocation}
              />
            </div>
          </div>

          {/* Section 2: Date & Slot Selection */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90 space-y-3.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Schedule Date & Time Slot
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Service Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Service Date <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 pl-9 font-medium text-white outline-none focus:border-blue-500 shadow-inner"
                    required
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {/* Quick Date Chips */}
                <div className="flex gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setServiceDate(getTodayDateString())}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      serviceDate === getTodayDateString()
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-700'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceDate(getDateOffsetString(1))}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      serviceDate === getDateOffsetString(1)
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-700'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              {/* Time Slot Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Time Slot <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = timeSlot === slot;
                    const slotInfo = TIME_SLOT_HOURS[slot];
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`text-left p-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm ring-1 ring-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-700/80 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        <div className="font-bold text-[11px] truncate">
                          {slot === 'Morning Slot' ? '🌅 Morning' : slot === 'Afternoon Slot' ? '☀️ Afternoon' : '🌆 Evening'}
                        </div>
                        <div className={`text-[9px] mt-0.5 font-medium ${isSelected ? 'text-amber-200' : 'text-slate-500'}`}>
                          {slotInfo.time.split(' - ')[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-900 p-1.5 rounded-lg border border-slate-800 mt-2 text-center font-medium">
                  Service Window: <strong className="text-white">{TIME_SLOT_HOURS[timeSlot].time}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Staff Team Assignment (Leader + Team Members with Conflict Checks) */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90">
            <StaffAssignmentPicker
              staffList={jodis}
              existingBookings={existingBookings}
              serviceDate={serviceDate}
              timeSlot={timeSlot}
              currentBookingId={bookingToEdit?.id}
              selectedStaffNames={selectedStaffNames}
              leaderStaffName={leaderStaffName}
              onChange={handleStaffChange}
            />
          </div>

          {/* Section 4: Services & Amount */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90 space-y-3.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Service & Pricing
            </span>
            
            {/* Service selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Service <span className="text-rose-400">*</span>
              </label>
              <select
                value={services}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 font-medium text-white outline-none focus:border-blue-500 shadow-inner cursor-pointer"
              >
                {ALL_SERVICES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Service Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Service Description / Specific Scope
              </label>
              <textarea
                rows={2}
                placeholder="Detailed scope (e.g. 3 Bathrooms acid scrub, kitchen grease removal, balcony wash)"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl p-2.5 font-medium text-white outline-none focus:border-blue-500 resize-none shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount (₹) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 1800, 2200, After Visit"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 font-bold text-amber-300 outline-none focus:border-blue-500 shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Job Status
                </label>
                <select
                  value={jobStatus}
                  onChange={(e) => setJobStatus(e.target.value as JobStatus)}
                  className="w-full text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-medium text-white outline-none focus:border-blue-500 cursor-pointer shadow-inner"
                >
                  <option value="Confirmed">Confirmed (Default)</option>
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Postponed">Postponed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Internal Notes / Special Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Call before arrival, parking available in cellar"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-medium text-white outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          {/* Live Booking Summary Ticket Preview */}
          <div className="bg-slate-950 p-4 rounded-2xl text-white shadow-md border border-slate-800">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <CompanyLogo size="sm" />
                <span className="font-bold text-slate-200">Booking Summary Preview</span>
              </div>
              <span className="font-mono font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-500/40">
                {displayRefNo}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Customer:</span>
                <strong className="text-white truncate block">{customerName || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Date & Slot:</span>
                <strong className="text-white truncate block">{serviceDate} • {timeSlot.replace(' Slot', '')}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Staff Assigned:</span>
                <strong className="text-emerald-400 truncate block">
                  {selectedStaffNames.length > 0 
                    ? formatStaffNameWithTitle(leaderStaffName || selectedStaffNames[0]) + (selectedStaffNames.length > 1 ? ' & Team' : '')
                    : 'Unassigned'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Amount:</span>
                <strong className="text-amber-300 block">{amount ? (amount.startsWith('₹') ? amount : `₹${amount}`) : '—'}</strong>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEdit ? 'Save Changes' : 'Confirm Booking & Create Messages'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
