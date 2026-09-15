import { Booking, Jodi, TimeSlot, JobStatus } from '../types';

export const BUSINESS_INFO = {
  name: 'MSD Facility Services',
  tagline: 'Professional Home & Office Cleaning Services',
  location: 'Puducherry',
  primaryPhone: '9042233122',
  secondaryPhone: '7708779733',
  email: 'msdfacilityservices@gmail.com',
  website: 'https://msdfs.in/',
  address: 'Heritage Town & Lawspet, Puducherry - 605001'
};

export const TIME_SLOTS: TimeSlot[] = [
  'Morning Slot',
  'Afternoon Slot',
  'Evening Slot'
];

export const TIME_SLOT_HOURS: Record<TimeSlot, { label: string; time: string; badgeColor: string }> = {
  'Morning Slot': { label: 'Morning Slot', time: '08:00 AM - 12:00 PM', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  'Afternoon Slot': { label: 'Afternoon Slot', time: '01:00 PM - 04:30 PM', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Evening Slot': { label: 'Evening Slot', time: '05:00 PM - 08:30 PM', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' }
};

export const POPULAR_SERVICES = [
  'Full Home Deep Cleaning',
  'Kitchen Deep Cleaning',
  'Bathroom Scrubbing & Sanitization',
  'Sofa & Carpet Shampooing',
  'Commercial Office Cleaning',
  'Move-In / Move-Out Cleaning',
  'Villa & Heritage Home Cleaning',
  'Floor Polishing & Scrubbing',
  'Window & Balcony Cleaning',
  'After Party Cleaning'
];

/**
 * Complete list of services available for selection in the dropdown
 * Preserves all existing services without renaming or deletion.
 */
export const ALL_SERVICES = [
  'Full Home Deep Cleaning',
  'Kitchen Deep Cleaning',
  'Bathroom Scrubbing & Sanitization',
  '3 Bathrooms Cleaning',
  'Bathroom Acid Scrubbing',
  'Sofa & Carpet Shampooing',
  'Sofa & Carpet Cleaning',
  'Commercial Office Cleaning',
  'Office / Commercial Care',
  'Move-In / Move-Out Cleaning',
  'Villa & Heritage Home Cleaning',
  'Floor Polishing & Scrubbing',
  'Window & Balcony Cleaning',
  'After Party Cleaning',
  '1 BHK Cleaning',
  '2 BHK Cleaning',
  '3 BHK Cleaning',
  'Water Tank Cleaning'
];

/**
 * Existing pricing map associated with services.
 * When a service is chosen in the dropdown, the corresponding price is populated.
 */
export const SERVICE_DEFAULT_PRICES: Record<string, string> = {
  'Full Home Deep Cleaning': '2400',
  'Kitchen Deep Cleaning': '1800',
  'Bathroom Scrubbing & Sanitization': '800',
  '3 Bathrooms Cleaning': '1800',
  'Bathroom Acid Scrubbing': '800',
  'Sofa & Carpet Shampooing': '1600',
  'Sofa & Carpet Cleaning': '1600',
  'Commercial Office Cleaning': '3500',
  'Office / Commercial Care': '3500',
  'Move-In / Move-Out Cleaning': '4200',
  'Villa & Heritage Home Cleaning': '3200',
  'Floor Polishing & Scrubbing': '2200',
  'Window & Balcony Cleaning': '1200',
  'After Party Cleaning': '2500',
  '1 BHK Cleaning': '3000',
  '2 BHK Cleaning': '4000',
  '3 BHK Cleaning': '5000',
  'Water Tank Cleaning': 'After Visit'
};

export const STATUS_COLORS: Record<JobStatus, { bg: string; text: string; border: string; dot: string }> = {
  'New': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  'Confirmed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Assigned': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Completed': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  'Cancelled': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  'Postponed': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  'Rescheduled': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' }
};

/**
 * Format date as DD-MM-YYYY
 */
export function formatDateDMY(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

/**
 * Get standard today date string in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get date offset from today (e.g. +1 for tomorrow, -1 for yesterday)
 */
export function getDateOffsetString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Compare date relative to today (today, tomorrow, or other)
 */
export function getDateRelativeLabel(dateStr: string): 'today' | 'tomorrow' | 'past' | 'future' {
  const today = getTodayDateString();
  const tomorrow = getDateOffsetString(1);
  if (dateStr === today) return 'today';
  if (dateStr === tomorrow) return 'tomorrow';
  if (dateStr < today) return 'past';
  return 'future';
}

const STARTING_REF_INDEX = 1029; // Next ref number starts from MSD/PDY/1030
const STORAGE_KEY_HIGHEST_REF = 'msd_highest_ref_num_v1';

/**
 * Gets the current highest reference number across localStorage watermark and active bookings
 */
export function getHighestRefNum(existingBookings: Booking[]): number {
  let highest = STARTING_REF_INDEX;

  try {
    const saved = localStorage.getItem(STORAGE_KEY_HIGHEST_REF);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > highest) {
        highest = parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }

  const prefix = 'MSD/PDY/';
  for (const b of existingBookings) {
    if (b.refNo && b.refNo.startsWith(prefix)) {
      const numStr = b.refNo.replace(prefix, '').trim();
      const n = parseInt(numStr, 10);
      if (!isNaN(n) && n > highest) {
        highest = n;
      }
    }
  }

  return highest;
}

/**
 * Generates next auto-incremented Reference number starting from MSD/PDY/1030.
 * If bookings are deleted, the number sequence continues forward and is NEVER reused.
 */
export function generateNextRefNo(existingBookings: Booking[]): string {
  const highest = getHighestRefNum(existingBookings);
  const nextNum = highest + 1;
  return `MSD/PDY/${nextNum}`;
}

/**
 * Records that a reference number has been assigned so that even if deleted, it is never reused.
 */
export function commitRefNoUsed(refNo: string): void {
  const prefix = 'MSD/PDY/';
  if (refNo && refNo.startsWith(prefix)) {
    const numStr = refNo.replace(prefix, '').trim();
    const n = parseInt(numStr, 10);
    if (!isNaN(n)) {
      try {
        const currentSaved = localStorage.getItem(STORAGE_KEY_HIGHEST_REF);
        const current = currentSaved ? parseInt(currentSaved, 10) : STARTING_REF_INDEX;
        if (isNaN(current) || n > current) {
          localStorage.setItem(STORAGE_KEY_HIGHEST_REF, n.toString());
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}

/**
 * Formats amount cleanly (e.g. preserves "After Visit" or "1800 to 2100" or adds ₹ if pure number)
 */
export function formatAmountDisplay(amount: string): string {
  if (!amount) return '₹0';
  const trimmed = amount.trim();
  if (trimmed.startsWith('₹')) return trimmed;
  // If numeric or range with numbers
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return `₹${trimmed}`;
  }
  return trimmed;
}

/**
 * Automatically generates the customer reminder/confirmation WhatsApp message matching exact specification:
 * 
 * Hello [Customer Name],
 * 
 * This is a quick friendly reminder from MSD Facility Services regarding your upcoming service scheduled for tomorrow ([Date]). 🛠️
 * 
 * 📌 Ref No: [Booking Ref No]
 * 🧹 Service: [Services]
 * 
 * 📅 Date & Time: [DD-MM-YYYY] | [Time Slot]
 * 
 * 📍 Location: [Address/Location]
 * 
 * 👤 Assigned Staff: [Assigned Staff]
 * 
 * 📞 Staff Phone: [Staff Cell No]
 * 
 * 💰 Total Amount: ₹[Amount]
 * 
 * Our team will arrive at your location on time tomorrow. If you need any assistance or have any questions, feel free to reach out to us.
 * 
 * Thank you for choosing MSD Facility Services!
 * 
 * MSD Facility Services
 * 
 * 📞 9042233122
 * 
 * 📧 msdfacilityservices@gmail.com
 * 
 * 🌐 https://msdfs.in/
 */
/**
 * Format a person name with polite honorific "Mr." / "Ms." if not already present
 */
export function formatStaffNameWithTitle(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (/^(mr\.|mrs\.|ms\.)/i.test(trimmed)) {
    return trimmed;
  }
  return `Mr. ${trimmed}`;
}

/**
 * Automatically generates the customer reminder/confirmation WhatsApp message matching exact specification:
 * 
 * 🔷 MSD FACILITY SERVICES
 * Booking Confirmation
 * 
 * Dear Mr. [Customer Name],
 * 
 * We are pleased to confirm your service booking with MSD Facility Services. Please find the booking details below:
 * 
 * 📌 Booking Reference: [Booking Ref No]
 * 🛠️ Service: [Services]
 * 📅 Schedule: [Date] | [Time Slot]
 * 📍 Location: [Location]
 * 👤 Assigned Staff: [Assigned Staff / Leader & Team]
 * 📞 Staff Contact: [Staff Contact]
 * 💰 Total Amount: [Amount]
 * 
 * ━━━━━━━━━━━━━━━━━━
 * 
 * Thank you for choosing MSD Facility Services.
 * We look forward to serving you.
 * 
 * MSD Facility Services
 * 📞 9042233122
 * 📧 msdfacilityservices@gmail.com
 * 🌐 msdfs.in
 */
export function generateCustomerMessage(booking: {
  customerName: string;
  refNo: string;
  services: string;
  serviceDescription?: string;
  serviceDate: string;
  timeSlot: TimeSlot;
  address: string;
  assignedStaff: string;
  staffCell: string;
  assignedStaff2?: string;
  staffCell2?: string;
  teamLeader?: string;
  teamMembers?: string[];
  amount: string;
}): string {
  const rawCustomerName = booking.customerName?.trim() || 'Valued Customer';
  const customerName = rawCustomerName.replace(/^(Dear\s+)?(Mr\.?|Ms\.?|Mrs\.?)\s*/i, '').trim() || rawCustomerName;

  const serviceDisplay = booking.serviceDescription?.trim()
    ? `${booking.services.trim()} (${booking.serviceDescription.trim()})`
    : booking.services.trim();

  // Assigned Staff Names: e.g. "Murugan & Selvi" or "Saidul & Team"
  let staffDisplay = '';
  if (booking.teamMembers && booking.teamMembers.length > 0) {
    staffDisplay = booking.teamMembers.map(m => m.trim()).filter(Boolean).join(' & ');
  } else if (booking.assignedStaff && booking.assignedStaff2 && booking.assignedStaff2.trim()) {
    staffDisplay = `${booking.assignedStaff.trim()} & ${booking.assignedStaff2.trim()}`;
  } else {
    staffDisplay = booking.assignedStaff?.trim() || 'Staff 1';
  }
  // Ensure no repeated "Team & Team"
  staffDisplay = staffDisplay.replace(/(&\s*Team\s*)+/gi, '& Team').trim();

  // Staff Phone Numbers: e.g. "9842112233, 9842112234"
  let staffPhone = booking.staffCell?.trim() || '7708779733';
  if (booking.staffCell2 && booking.staffCell2.trim() && booking.staffCell2.trim() !== staffPhone) {
    staffPhone = `${staffPhone}, ${booking.staffCell2.trim()}`;
  }

  // Total Amount: e.g. ₹1800
  const rawAmount = (booking.amount || '1800').trim();
  const cleanAmount = rawAmount.replace(/^(₹|Rs\.?|INR)\s*/i, '');
  const amountDisplay = cleanAmount.startsWith('₹') ? cleanAmount : `₹${cleanAmount}`;

  return `Hello ${customerName}, Your booking with MSD Facility Services has been confirmed successfully.

📍 Ref No: ${booking.refNo}
📅 Service: ${serviceDisplay}
⏰ Date & Time: ${booking.serviceDate} | ${booking.timeSlot}
📍 Location: ${booking.address}
👤 Assigned Staff: ${staffDisplay}
📞 Staff Phone: ${staffPhone}
💰 Total Amount: ${amountDisplay}

Thank you for choosing MSD Facility Services!

---

MSD Facility Services
📞 7708779733
📧 msdfacilityservices@gmail.com
🌐 https://msdfs.in/`;
}

/**
 * Automatically generates the staff assignment WhatsApp message matching exact specification:
 * 
 * If 1 staff:
 * Assigned Staff: Mr. Farhad
 * 
 * If multiple staff members:
 * Team Leader: Mr. Farhad
 * Team Members: Mr. Bahar & Staff 3
 */
export function generateStaffMessage(booking: {
  refNo: string;
  customerName: string;
  customerCell: string;
  address: string;
  services: string;
  serviceDescription?: string;
  serviceDate: string;
  timeSlot: TimeSlot;
  amount: string;
  assignedStaff?: string;
  assignedStaff2?: string;
  teamLeader?: string;
  teamMembers?: string[];
}): string {
  const amtFormatted = formatAmountDisplay(booking.amount);
  const serviceDisplay = booking.serviceDescription?.trim()
    ? `${booking.services} (${booking.serviceDescription.trim()})`
    : booking.services;

  const dateFormatted = formatDateDMY(booking.serviceDate);

  // Calculate members and leader
  const members = (booking.teamMembers && booking.teamMembers.length > 0)
    ? booking.teamMembers
    : [booking.assignedStaff, booking.assignedStaff2].filter(Boolean) as string[];

  const leader = booking.teamLeader?.trim() || booking.assignedStaff?.trim() || 'Farhad';

  let staffSection = '';
  if (members.length > 1) {
    const otherMembers = members.filter(m => m.trim().toLowerCase() !== leader.trim().toLowerCase());
    const formattedOthers = otherMembers.map(m => formatStaffNameWithTitle(m)).join(' & ');
    staffSection = `👑 Team Leader: ${formatStaffNameWithTitle(leader)}\n👥 Team Members: ${formattedOthers || 'Full Team'}`;
  } else {
    staffSection = `👤 Assigned Staff: ${formatStaffNameWithTitle(leader)}`;
  }

  return `🔷 MSD FACILITY SERVICES
Staff Job Assignment

📌 Booking Reference: ${booking.refNo}
👤 Customer: ${booking.customerName}
📞 Phone: ${booking.customerCell}
📍 Location: ${booking.address}
🛠️ Service: ${serviceDisplay}
📅 Schedule: ${dateFormatted} | ${booking.timeSlot}
${staffSection}
💰 Amount to Collect: ${amtFormatted}

Please reach the location on time!

━━━━━━━━━━━━━━━━━━
MSD Facility Services
📞 9042233122
📧 msdfacilityservices@gmail.com
🌐 msdfs.in`;
}

/**
 * Automatically generates the cancelled booking update message for the customer
 */
export function generateCancellationMessage(booking: {
  customerName: string;
  refNo: string;
  services: string;
  serviceDescription?: string;
  serviceDate: string;
  timeSlot: TimeSlot;
  address: string;
}): string {
  const customerName = booking.customerName?.trim() || 'Customer';
  const serviceDisplay = booking.serviceDescription?.trim()
    ? `${booking.services} (${booking.serviceDescription.trim()})`
    : booking.services;
  const dateFormatted = formatDateDMY(booking.serviceDate);

  return `Hello ${customerName},

Greetings from MSD Facility Services.

Your booking has been cancelled as requested.

📌 Ref No: ${booking.refNo}
🧹 Service: ${serviceDisplay}
📅 Scheduled Date: ${dateFormatted}
⏰ Time Slot: ${booking.timeSlot}

📍 Location: ${booking.address}

Booking Status: ❌ Cancelled

If you would like to book our service again in the future, please feel free to contact us.

Thank you for choosing MSD Facility Services!

MSD Facility Services

📞 9042233122
📧 msdfacilityservices@gmail.com
🌐 https://msdfs.in/`;
}

/**
 * Automatically generates the postponed / rescheduled update message for the customer
 */
export function generateRescheduledMessage(booking: {
  customerName: string;
  refNo: string;
  services: string;
  serviceDescription?: string;
  serviceDate: string;
  timeSlot: TimeSlot;
  address: string;
  assignedStaff: string;
  staffCell: string;
  assignedStaff2?: string;
  staffCell2?: string;
}): string {
  const customerName = booking.customerName?.trim() || 'Customer';
  const serviceDisplay = booking.serviceDescription?.trim()
    ? `${booking.services} (${booking.serviceDescription.trim()})`
    : booking.services;
  const dateFormatted = formatDateDMY(booking.serviceDate);

  let staffName = booking.assignedStaff?.trim() || 'Murugan';
  if (booking.assignedStaff2?.trim()) {
    staffName = `${staffName} & ${booking.assignedStaff2.trim()}`;
  }

  let staffPhone = booking.staffCell?.trim() || BUSINESS_INFO.primaryPhone;
  if (booking.staffCell2?.trim() && booking.staffCell2.trim() !== staffPhone) {
    staffPhone = `${staffPhone}, ${booking.staffCell2.trim()}`;
  }

  return `Hello ${customerName},

Greetings from MSD Facility Services.

Your service booking has been postponed/rescheduled as requested.

📌 Ref No: ${booking.refNo}
🧹 Service: ${serviceDisplay}

📅 New Date: ${dateFormatted}
⏰ New Time Slot: ${booking.timeSlot}

📍 Location: ${booking.address}

👤 Assigned Staff: ${staffName}

📞 Staff Phone: ${staffPhone}

Booking Status: 🔄 Rescheduled

Our team will arrive at the updated date and time.

If you need any further assistance, please feel free to contact us.

Thank you for choosing MSD Facility Services!

MSD Facility Services

📞 9042233122
📧 msdfacilityservices@gmail.com
🌐 https://msdfs.in/`;
}

/**
 * Cleans phone number for Indian WhatsApp link (+91)
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  if (!phone) return '#';
  // Remove non-digit chars
  let cleaned = phone.replace(/\D/g, '');
  // If 10 digits, prefix 91
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = `91${cleaned.substring(1)}`;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

/**
 * Universal SMS link helper (compatible with Android and iOS)
 */
export function getSMSUrl(phone: string, message: string): string {
  if (!phone) return '#';
  const cleaned = phone.replace(/\D/g, '');
  return `sms:${cleaned}?body=${encodeURIComponent(message)}`;
}

/**
 * Checks if a staff member or Jodi has a conflicting booking on the same date and same time slot
 */
export function checkStaffConflict(
  existingBookings: Booking[],
  staffName: string,
  serviceDate: string,
  timeSlot: TimeSlot,
  excludeBookingId?: string
): { hasConflict: boolean; conflictingBooking?: Booking } {
  if (!staffName || !serviceDate || !timeSlot) {
    return { hasConflict: false };
  }

  const targetLower = staffName.trim().toLowerCase();

  const conflict = existingBookings.find(b => {
    if (excludeBookingId && b.id === excludeBookingId) return false;
    // Don't count cancelled or postponed jobs as conflicts
    if (b.jobStatus === 'Cancelled' || b.jobStatus === 'Postponed') return false;
    if (b.serviceDate !== serviceDate || b.timeSlot !== timeSlot) return false;

    // Check primary assigned
    if (b.assignedStaff && b.assignedStaff.trim().toLowerCase() === targetLower) return true;
    // Check second staff
    if (b.assignedStaff2 && b.assignedStaff2.trim().toLowerCase() === targetLower) return true;
    // Check leader
    if (b.teamLeader && b.teamLeader.trim().toLowerCase() === targetLower) return true;
    // Check team members list
    if (b.teamMembers && Array.isArray(b.teamMembers) && b.teamMembers.some(m => m.trim().toLowerCase() === targetLower)) return true;

    return false;
  });

  return {
    hasConflict: !!conflict,
    conflictingBooking: conflict
  };
}

export const checkJodiConflict = checkStaffConflict;

/**
 * Get available vs booked Jodis for a given date and time slot
 */
export function getJodiAvailability(
  allJodis: Jodi[],
  existingBookings: Booking[],
  serviceDate: string,
  timeSlot: TimeSlot,
  excludeBookingId?: string
): {
  availableJodis: Jodi[];
  bookedJodis: { jodi: Jodi; booking: Booking }[];
  isFullyBooked: boolean;
} {
  const availableJodis: Jodi[] = [];
  const bookedJodis: { jodi: Jodi; booking: Booking }[] = [];

  const activeJodis = allJodis.filter(j => j.active);

  for (const jodi of activeJodis) {
    const conflictResult = checkJodiConflict(
      existingBookings,
      jodi.name,
      serviceDate,
      timeSlot,
      excludeBookingId
    );

    if (conflictResult.hasConflict && conflictResult.conflictingBooking) {
      bookedJodis.push({ jodi, booking: conflictResult.conflictingBooking });
    } else {
      availableJodis.push(jodi);
    }
  }

  return {
    availableJodis,
    bookedJodis,
    isFullyBooked: activeJodis.length > 0 && availableJodis.length === 0
  };
}

/**
 * Calculates slot capacities for a given date
 */
export function getSlotCapacities(
  existingBookings: Booking[],
  allJodis: Jodi[],
  dateStr: string
): Record<TimeSlot, { bookedCount: number; maxCount: number; isFull: boolean; bookings: Booking[] }> {
  const activeStaffCount = allJodis.filter(j => j.active).length || 6;

  const result: Record<TimeSlot, { bookedCount: number; maxCount: number; isFull: boolean; bookings: Booking[] }> = {
    'Morning Slot': { bookedCount: 0, maxCount: activeStaffCount, isFull: false, bookings: [] },
    'Afternoon Slot': { bookedCount: 0, maxCount: activeStaffCount, isFull: false, bookings: [] },
    'Evening Slot': { bookedCount: 0, maxCount: activeStaffCount, isFull: false, bookings: [] }
  };

  const dayBookings = existingBookings.filter(
    b => b.serviceDate === dateStr && b.jobStatus !== 'Cancelled' && b.jobStatus !== 'Postponed'
  );

  for (const slot of TIME_SLOTS) {
    const slotBookings = dayBookings.filter(b => b.timeSlot === slot);
    result[slot].bookedCount = slotBookings.length;
    result[slot].bookings = slotBookings;
    result[slot].isFull = slotBookings.length >= activeStaffCount;
  }

  return result;
}

/**
 * 6 Staff Members workload tracking:
 * 1 staff can do up to 3 services in a day (Morning, Afternoon, Evening)
 */
export interface StaffDayWorkload {
  staff: Jodi;
  totalServicesToday: number;
  maxServices: number;
  remainingServices: number;
  isFullForDay: boolean;
  isBusyInSlot: boolean;
  slotBooking: Booking | null;
  slotsBooked: Record<TimeSlot, Booking | null>;
}

export function getStaffDailyWorkloadList(
  staffList: Jodi[],
  existingBookings: Booking[],
  serviceDate: string,
  timeSlot: TimeSlot,
  excludeBookingId?: string
): StaffDayWorkload[] {
  const activeStaff = staffList.filter(s => s.active);
  const dayBookings = existingBookings.filter(
    b => b.serviceDate === serviceDate && b.jobStatus !== 'Cancelled' && b.jobStatus !== 'Postponed' && (!excludeBookingId || b.id !== excludeBookingId)
  );

  return activeStaff.map(staff => {
    const staffNameLower = staff.name.trim().toLowerCase();
    
    // Check bookings where this staff is assignedStaff OR assignedStaff2
    const staffBookings = dayBookings.filter(b => 
      b.assignedStaff.trim().toLowerCase() === staffNameLower ||
      (b.assignedStaff2 && b.assignedStaff2.trim().toLowerCase() === staffNameLower)
    );

    const slotsBooked: Record<TimeSlot, Booking | null> = {
      'Morning Slot': staffBookings.find(b => b.timeSlot === 'Morning Slot') || null,
      'Afternoon Slot': staffBookings.find(b => b.timeSlot === 'Afternoon Slot') || null,
      'Evening Slot': staffBookings.find(b => b.timeSlot === 'Evening Slot') || null
    };

    const slotBooking = slotsBooked[timeSlot] || null;
    const isBusyInSlot = slotBooking !== null;
    const maxServices = staff.maxServicesPerDay || 3;
    const totalServicesToday = staffBookings.length;
    const remainingServices = Math.max(0, maxServices - totalServicesToday);
    const isFullForDay = totalServicesToday >= maxServices;

    return {
      staff,
      totalServicesToday,
      maxServices,
      remainingServices,
      isFullForDay,
      isBusyInSlot,
      slotBooking,
      slotsBooked
    };
  });
}

/**
 * Auto-recommend the best staff member:
 * Free in the given slot + least busy today (0/3 or 1/3)
 */
export function findBestAvailableStaff(
  workloads: StaffDayWorkload[]
): StaffDayWorkload | null {
  const freeForSlot = workloads.filter(w => !w.isBusyInSlot && !w.isFullForDay);
  if (freeForSlot.length === 0) return null;
  // Sort by fewest jobs today
  freeForSlot.sort((a, b) => a.totalServicesToday - b.totalServicesToday);
  return freeForSlot[0];
}

/**
 * Converts bookings array to Google Sheet CSV matching the 14 columns
 */
export function exportBookingsToCSV(bookings: Booking[]): string {
  const headers = [
    'Timestamp',
    'Booking Ref No',
    'Customer Name',
    'Customer Cell No',
    'Address/Location',
    'Service Date',
    'Time Slot',
    'Services',
    'Service Description',
    'Assigned Staff 1',
    'Staff 1 Cell No',
    'Assigned Staff 2',
    'Staff 2 Cell No',
    'Amount',
    'Job Status',
    'Customer MSG',
    'Staff MSG'
  ];

  const escapeCSV = (val: string | undefined): string => {
    if (!val) return '""';
    const escaped = val.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = bookings.map(b => [
    escapeCSV(b.timestamp),
    escapeCSV(b.refNo),
    escapeCSV(b.customerName),
    escapeCSV(b.customerCell),
    escapeCSV(b.address),
    escapeCSV(b.serviceDate),
    escapeCSV(b.timeSlot),
    escapeCSV(b.services),
    escapeCSV(b.serviceDescription || ''),
    escapeCSV(b.assignedStaff),
    escapeCSV(b.staffCell),
    escapeCSV(b.assignedStaff2 || ''),
    escapeCSV(b.staffCell2 || ''),
    escapeCSV(b.amount),
    escapeCSV(b.jobStatus),
    escapeCSV(b.customerMsg),
    escapeCSV(b.staffMsg)
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Parse Google Sheets CSV format back into Booking array
 * Supports 17-column (with Staff 1 & 2), 15-column (with Service Description), and legacy 14-column formats
 */
export function parseGoogleSheetCSV(csvText: string, defaultJodis: Jodi[]): Booking[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headerRow = parseCSVRow(lines[0]);
  const is17Col = headerRow.length >= 17 || headerRow.some(h => h.toLowerCase().includes('staff 2'));
  const hasDescColumn = is17Col || headerRow.some(h => h.toLowerCase().includes('description')) || headerRow.length >= 15;

  const bookings: Booking[] = [];
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    if (row.length >= 7) {
      const refNo = row[1]?.trim() || `MSD/PDY/${1000 + i}`;
      const customerName = row[2]?.trim() || 'Valued Customer';
      const customerCell = row[3]?.trim() || '';
      const address = row[4]?.trim() || 'Puducherry';
      const serviceDate = row[5]?.trim() || getTodayDateString();
      
      let timeSlot: TimeSlot = 'Morning Slot';
      const rawSlot = row[6]?.toLowerCase() || '';
      if (rawSlot.includes('afternoon')) timeSlot = 'Afternoon Slot';
      else if (rawSlot.includes('evening')) timeSlot = 'Evening Slot';

      const services = row[7]?.trim() || 'Full Home Deep Cleaning';
      
      let serviceDescription = '';
      let assignedStaff = 'Staff 1';
      let staffCell = '';
      let assignedStaff2 = '';
      let staffCell2 = '';
      let amount = '1800';
      let rawStatus = 'Confirmed';
      let customerMsgRaw = '';
      let staffMsgRaw = '';

      if (is17Col) {
        serviceDescription = row[8]?.trim() || '';
        assignedStaff = row[9]?.trim() || 'Staff 1';
        staffCell = row[10]?.trim() || '';
        assignedStaff2 = row[11]?.trim() || '';
        staffCell2 = row[12]?.trim() || '';
        amount = row[13]?.trim() || '1800';
        rawStatus = row[14]?.trim() || 'Confirmed';
        customerMsgRaw = row[15]?.trim() || '';
        staffMsgRaw = row[16]?.trim() || '';
      } else if (hasDescColumn) {
        serviceDescription = row[8]?.trim() || '';
        assignedStaff = row[9]?.trim() || 'Staff 1';
        const matchingJodi = defaultJodis.find(j => j.name.toLowerCase() === assignedStaff.toLowerCase());
        staffCell = row[10]?.trim() || matchingJodi?.phone || BUSINESS_INFO.primaryPhone;
        amount = row[11]?.trim() || '1800';
        rawStatus = row[12]?.trim() || 'Confirmed';
        customerMsgRaw = row[13]?.trim() || '';
        staffMsgRaw = row[14]?.trim() || '';
      } else {
        // Legacy 14-column format
        assignedStaff = row[8]?.trim() || 'Staff 1';
        const matchingJodi = defaultJodis.find(j => j.name.toLowerCase() === assignedStaff.toLowerCase());
        staffCell = row[9]?.trim() || matchingJodi?.phone || BUSINESS_INFO.primaryPhone;
        amount = row[10]?.trim() || '1800';
        rawStatus = row[11]?.trim() || 'Confirmed';
        customerMsgRaw = row[12]?.trim() || '';
        staffMsgRaw = row[13]?.trim() || '';
      }

      let jobStatus: JobStatus = 'Confirmed';
      const validStatuses: JobStatus[] = ['New', 'Confirmed', 'Assigned', 'In Progress', 'Completed', 'Cancelled', 'Postponed', 'Rescheduled'];
      if (validStatuses.includes(rawStatus as JobStatus)) {
        jobStatus = rawStatus as JobStatus;
      }

      const customerMsg = customerMsgRaw || generateCustomerMessage({
        customerName,
        refNo,
        services,
        serviceDescription,
        serviceDate,
        timeSlot,
        address,
        assignedStaff,
        staffCell,
        assignedStaff2,
        staffCell2,
        amount
      });

      const staffMsg = staffMsgRaw || generateStaffMessage({
        refNo,
        customerName,
        customerCell,
        address,
        services,
        serviceDescription,
        serviceDate,
        timeSlot,
        amount
      });

      bookings.push({
        id: `csv-${i}-${Date.now()}`,
        timestamp: row[0]?.trim() || new Date().toISOString(),
        refNo,
        customerName,
        customerCell,
        address,
        serviceDate,
        timeSlot,
        services,
        serviceDescription,
        assignedStaff,
        staffCell,
        assignedStaff2: assignedStaff2 || undefined,
        staffCell2: staffCell2 || undefined,
        amount,
        jobStatus,
        customerMsg,
        staffMsg
      });
    }
  }
  return bookings;
}

function parseCSVRow(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        result.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
  }
  result.push(cur);
  return result;
}
