export type TimeSlot = 'Morning Slot' | 'Afternoon Slot' | 'Evening Slot';

export type JobStatus = 
  | 'New' 
  | 'Confirmed' 
  | 'Assigned' 
  | 'In Progress' 
  | 'Completed' 
  | 'Cancelled' 
  | 'Postponed' 
  | 'Rescheduled';

export interface Booking {
  id: string;
  timestamp: string;      // 1. Timestamp / Created Date-Time
  refNo: string;          // 2. Booking Ref No (e.g. MSD/PDY/1009)
  customerName: string;   // 3. Customer Name
  customerCell: string;   // 4. Customer Cell No
  address: string;        // 5. Address/Location
  locationId?: string;    // Reference to SavedLocation if selected
  serviceDate: string;    // 6. Service Date (YYYY-MM-DD)
  timeSlot: TimeSlot;     // 7. Time Slot (Morning / Afternoon / Evening)
  services: string;       // 8. Services
  serviceDescription?: string; // 9. Service Description
  assignedStaff: string;  // 10. Assigned Staff 1 or Team Leader
  staffCell: string;      // 11. Staff 1 Cell No
  assignedStaff2?: string; // 12. Assigned Staff 2 (Second Staff Column)
  staffCell2?: string;    // 13. Staff 2 Cell No
  teamLeader?: string;    // Optional explicit leader name
  teamMembers?: string[]; // All assigned team member names
  amount: string;         // 14. Amount (e.g. "1800", "After Visit", "1800 to 2100")
  jobStatus: JobStatus;   // 15. Job Status
  customerMsg: string;    // 16. Customer MSG
  staffMsg: string;       // 17. Staff MSG
  notes?: string;
  completedAt?: string;
  
  // Google Sheets & Audit Fields
  sheetSyncStatus?: 'Synced' | 'Pending' | 'Failed';
  sheetSyncedAt?: string;
  sheetSyncError?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Advance Paid' | 'Unpaid';
  createdBy?: string;
}

export interface SavedLocation {
  id: string;
  name: string;              // Location Name, e.g. "White Town French Quarter"
  fullAddress: string;       // Complete Address with Pincode
  areaName?: string;         // Customer/Area Name (e.g. "White Town", "Moolakulam")
  mapsUrl?: string;          // Google Maps Link (optional)
  notes?: string;            // Notes / Landmark / Gate directions
  createdAt: string;
}

export interface Jodi {
  id: string;
  name: string;          // e.g. "Murugan" or "Staff 1"
  members?: string;      // e.g. "Murugan (Lead)"
  phone: string;         // e.g. "9842112233"
  role?: string;         // e.g. "Lead Deep Cleaner"
  active: boolean;
  maxServicesPerDay?: number; // 1 staff can do up to 3 services in a day
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalBookings: number;
  totalSpent: number | string;
  lastServiceDate: string;
  notes?: string;
  createdAt: string;
}

export interface SlotCapacity {
  slot: TimeSlot;
  bookedCount: number;
  maxCount: number;
  isFull: boolean;
  bookings: Booking[];
}

export interface DailyScheduleMatrix {
  date: string;
  jodis: {
    jodi: Jodi;
    slots: {
      slot: TimeSlot;
      booking: Booking | null;
    }[];
  }[];
}

export type ActiveTab = 
  | 'dashboard' 
  | 'calendar' 
  | 'staff-schedule'
  | 'schedule' 
  | 'bookings' 
  | 'customers' 
  | 'staff' 
  | 'locations' 
  | 'messages' 
  | 'reports' 
  | 'sheets' 
  | 'settings';
export type UserRole = 'admin' | 'staff';
