import { Jodi, Booking, Customer, SavedLocation } from '../types';
import { generateCustomerMessage, generateStaffMessage, getTodayDateString, getDateOffsetString } from '../utils/bookingUtils';

export const INITIAL_JODIS: Jodi[] = [
  {
    id: 'staff-1',
    name: 'Farhad',
    members: 'Farhad (Supervisor & Lead)',
    phone: '9395065024',
    role: 'Supervisor & Team Leader',
    active: true,
    maxServicesPerDay: 3
  },
  {
    id: 'staff-2',
    name: 'Bahar',
    members: 'Bahar (Senior Specialist)',
    phone: '9042233122',
    role: 'Senior Deep Cleaner',
    active: true,
    maxServicesPerDay: 3
  },
  {
    id: 'staff-3',
    name: 'Murugan',
    members: 'Murugan (Lead)',
    phone: '9842112233',
    role: 'Lead Deep Cleaner',
    active: true,
    maxServicesPerDay: 3
  },
  {
    id: 'staff-4',
    name: 'Selvi',
    members: 'Selvi (Specialist)',
    phone: '9842112234',
    role: 'Deep Cleaning Specialist',
    active: true,
    maxServicesPerDay: 3
  },
  {
    id: 'staff-5',
    name: 'Kumar',
    members: 'Kumar (Senior)',
    phone: '9443224455',
    role: 'Senior Cleaner',
    active: true,
    maxServicesPerDay: 3
  },
  {
    id: 'staff-6',
    name: 'Priya',
    members: 'Priya (Specialist)',
    phone: '9443224456',
    role: 'Kitchen & Sanitization Specialist',
    active: true,
    maxServicesPerDay: 3
  }
];

export const INITIAL_SAVED_LOCATIONS: SavedLocation[] = [
  {
    id: 'loc-1',
    name: 'Moolakulam Main Residence',
    fullAddress: 'No. 24, Mariamman Koil Street, Moolakulam, Puducherry - 605010',
    areaName: 'Moolakulam',
    mapsUrl: 'https://maps.google.com/?q=Moolakulam+Puducherry',
    notes: 'Near Mariamman Temple, Ground floor parking available',
    createdAt: '2026-09-01'
  },
  {
    id: 'loc-2',
    name: 'White Town Heritage Villa',
    fullAddress: 'No. 14, Suffren Street, White Town, Puducherry - 605001',
    areaName: 'White Town',
    mapsUrl: 'https://maps.google.com/?q=Suffren+Street+White+Town+Puducherry',
    notes: 'French quarter villa, wooden flooring upstairs',
    createdAt: '2026-09-02'
  },
  {
    id: 'loc-3',
    name: 'Lawspet Airport Enclave',
    fullAddress: 'Flat 302, Airport Road, Lawspet, Puducherry - 605008',
    areaName: 'Lawspet',
    mapsUrl: 'https://maps.google.com/?q=Lawspet+Puducherry',
    notes: 'Lift available, gate security code required',
    createdAt: '2026-09-03'
  },
  {
    id: 'loc-4',
    name: 'Reddiarpalayam Commercial Complex',
    fullAddress: 'No. 88, Villianur Main Road, Reddiarpalayam, Puducherry - 605005',
    areaName: 'Reddiarpalayam',
    mapsUrl: 'https://maps.google.com/?q=Reddiarpalayam+Puducherry',
    notes: 'First floor office space with glass facade',
    createdAt: '2026-09-04'
  },
  {
    id: 'loc-5',
    name: 'Muthialpet Sea Breeze Villa',
    fullAddress: 'No. 5, Salai Street, Muthialpet, Puducherry - 605003',
    areaName: 'Muthialpet',
    mapsUrl: 'https://maps.google.com/?q=Muthialpet+Puducherry',
    notes: 'Near Clock Tower',
    createdAt: '2026-09-05'
  },
  {
    id: 'loc-6',
    name: 'Saram Residency',
    fullAddress: 'No. 42, Kamaraj Salai, Saram, Puducherry - 605013',
    areaName: 'Saram',
    mapsUrl: 'https://maps.google.com/?q=Saram+Puducherry',
    notes: 'Opposite Government Higher Secondary School',
    createdAt: '2026-09-06'
  }
];

export function generateInitialBookings(): Booking[] {
  const today = getTodayDateString();
  const tomorrow = getDateOffsetString(1);
  const yesterday = getDateOffsetString(-1);
  const dayAfterTomorrow = getDateOffsetString(2);

  const rawSeed = [
    // Yesterday completed jobs
    {
      id: 'b-1001',
      timestamp: `${yesterday} 08:30:00`,
      refNo: 'MSD/PDY/1001',
      customerName: 'Sanjay Ramanathan',
      customerCell: '9840112244',
      address: 'No. 24, Romain Rolland St, White Town, Puducherry',
      serviceDate: yesterday,
      timeSlot: 'Morning Slot' as const,
      services: 'Full Home Deep Cleaning',
      assignedStaff: 'Murugan',
      staffCell: '9842112233',
      assignedStaff2: 'Selvi',
      staffCell2: '9842112234',
      amount: '2400',
      jobStatus: 'Completed' as const,
    },
    {
      id: 'b-1002',
      timestamp: `${yesterday} 11:15:00`,
      refNo: 'MSD/PDY/1002',
      customerName: 'Dr. Anandhi Krishnan',
      customerCell: '9443056789',
      address: 'Plot 45, 5th Cross, Anna Nagar, Puducherry',
      serviceDate: yesterday,
      timeSlot: 'Afternoon Slot' as const,
      services: 'Kitchen Deep Cleaning & Chimney',
      assignedStaff: 'Kumar',
      staffCell: '9443224455',
      amount: '1800',
      jobStatus: 'Completed' as const,
    },

    // TODAY Bookings (2026-09-13)
    // Morning Slot: Murugan (+Selvi), Rajesh, Priya
    {
      id: 'b-1009',
      timestamp: `${today} 07:15:00`,
      refNo: 'MSD/PDY/1009',
      customerName: 'Jean-Pierre Laurent',
      customerCell: '9894012345',
      address: 'Villa Coromandel, 14 Suffren Street, White Town, Puducherry',
      serviceDate: today,
      timeSlot: 'Morning Slot' as const,
      services: 'Villa & Heritage Home Cleaning',
      assignedStaff: 'Murugan',
      staffCell: '9842112233',
      amount: '3200',
      jobStatus: 'In Progress' as const,
    },
    {
      id: 'b-1010',
      timestamp: `${today} 07:45:00`,
      refNo: 'MSD/PDY/1010',
      customerName: 'Meenakshi Sundaram',
      customerCell: '9789456123',
      address: '18, Kamaraj Salai, Near Rajiv Gandhi Statue, Lawspet, Puducherry',
      serviceDate: today,
      timeSlot: 'Morning Slot' as const,
      services: 'Bathroom Scrubbing & Sanitization',
      assignedStaff: 'Rajesh',
      staffCell: '9789335566',
      amount: '800',
      jobStatus: 'In Progress' as const,
    },
    {
      id: 'b-1011',
      timestamp: `${today} 08:00:00`,
      refNo: 'MSD/PDY/1011',
      customerName: 'Aravind Swamy & Co',
      customerCell: '9944123890',
      address: 'Flat 3B, Sri Aurobindo Square, Bussy St, Puducherry',
      serviceDate: today,
      timeSlot: 'Morning Slot' as const,
      services: 'Commercial Office Cleaning',
      assignedStaff: 'Priya',
      staffCell: '9443224456',
      amount: '2100',
      jobStatus: 'Confirmed' as const,
    },
    // Afternoon Slot: Kumar, Selvi
    {
      id: 'b-1012',
      timestamp: `${today} 09:30:00`,
      refNo: 'MSD/PDY/1012',
      customerName: 'Kavitha Radhakrishnan',
      customerCell: '9442678123',
      address: 'No. 8, 3rd Main Road, Rainbow Nagar, Puducherry',
      serviceDate: today,
      timeSlot: 'Afternoon Slot' as const,
      services: 'Sofa & Carpet Shampooing',
      assignedStaff: 'Kumar',
      staffCell: '9443224455',
      amount: '1800 to 2100',
      jobStatus: 'Confirmed' as const,
    },
    {
      id: 'b-1013',
      timestamp: `${today} 10:15:00`,
      refNo: 'MSD/PDY/1013',
      customerName: 'David Christopher',
      customerCell: '9790432109',
      address: 'Plot 112, ECR Road, Kottakuppam border, Puducherry',
      serviceDate: today,
      timeSlot: 'Afternoon Slot' as const,
      services: 'Full Home Deep Cleaning',
      assignedStaff: 'Selvi',
      staffCell: '9842112234',
      amount: 'After Visit',
      jobStatus: 'Confirmed' as const,
    },
    // Evening Slot: Murugan (2nd job today for Murugan -> 2/3)
    {
      id: 'b-1014',
      timestamp: `${today} 11:00:00`,
      refNo: 'MSD/PDY/1014',
      customerName: 'Priya Govindaraj',
      customerCell: '9841890234',
      address: 'Flat 204, Oceanic Apartments, Goubert Avenue, Puducherry',
      serviceDate: today,
      timeSlot: 'Evening Slot' as const,
      services: 'Kitchen Deep Cleaning',
      assignedStaff: 'Murugan',
      staffCell: '9842112233',
      amount: '1500',
      jobStatus: 'Confirmed' as const,
    },

    // Tomorrow Bookings
    {
      id: 'b-1015',
      timestamp: `${today} 11:30:00`,
      refNo: 'MSD/PDY/1015',
      customerName: 'Balaji Narayanan',
      customerCell: '9677334411',
      address: '77, Mission Street, Heritage Town, Puducherry',
      serviceDate: tomorrow,
      timeSlot: 'Morning Slot' as const,
      services: 'Full Home Deep Cleaning',
      assignedStaff: 'Kumar',
      staffCell: '9443224455',
      amount: '2500',
      jobStatus: 'Confirmed' as const,
    },
    {
      id: 'b-1016',
      timestamp: `${today} 12:00:00`,
      refNo: 'MSD/PDY/1016',
      customerName: 'Sangeetha Murugesan',
      customerCell: '9894556677',
      address: '14, Cross St, Navarkulam, Lawspet, Puducherry',
      serviceDate: tomorrow,
      timeSlot: 'Morning Slot' as const,
      services: 'Bathroom Scrubbing & Sanitization',
      assignedStaff: 'Selvi',
      staffCell: '9842112234',
      amount: '800',
      jobStatus: 'Confirmed' as const,
    },
    {
      id: 'b-1017',
      timestamp: `${today} 12:45:00`,
      refNo: 'MSD/PDY/1017',
      customerName: 'Farookh Ahmed',
      customerCell: '9443889900',
      address: 'Shop 12, JN Street Commercial Complex, Puducherry',
      serviceDate: tomorrow,
      timeSlot: 'Afternoon Slot' as const,
      services: 'Commercial Office Cleaning',
      assignedStaff: 'Rajesh',
      staffCell: '9789335566',
      amount: '2200',
      jobStatus: 'Confirmed' as const,
    },
    {
      id: 'b-1018',
      timestamp: `${today} 13:10:00`,
      refNo: 'MSD/PDY/1018',
      customerName: 'Dr. Subramanian',
      customerCell: '9840223344',
      address: '32, Vazhudavur Road, Muthialpet, Puducherry',
      serviceDate: dayAfterTomorrow,
      timeSlot: 'Morning Slot' as const,
      services: 'Sofa & Carpet Shampooing',
      assignedStaff: 'Murugan',
      staffCell: '9842112233',
      amount: '1800',
      jobStatus: 'Confirmed' as const,
    }
  ];

  return rawSeed.map(b => ({
    ...b,
    customerMsg: generateCustomerMessage({
      customerName: b.customerName,
      refNo: b.refNo,
      services: b.services,
      serviceDescription: (b as any).serviceDescription,
      serviceDate: b.serviceDate,
      timeSlot: b.timeSlot,
      address: b.address,
      assignedStaff: b.assignedStaff,
      staffCell: b.staffCell,
      amount: b.amount
    }),
    staffMsg: generateStaffMessage({
      refNo: b.refNo,
      customerName: b.customerName,
      customerCell: b.customerCell,
      address: b.address,
      services: b.services,
      serviceDescription: (b as any).serviceDescription,
      serviceDate: b.serviceDate,
      timeSlot: b.timeSlot,
      amount: b.amount
    })
  }));
}

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Jean-Pierre Laurent',
    phone: '9894012345',
    address: 'Villa Coromandel, 14 Suffren Street, White Town, Puducherry',
    totalBookings: 4,
    totalSpent: '₹12,400',
    lastServiceDate: getTodayDateString(),
    notes: 'Prefers French-speaking or polite senior technicians. High-end wooden furniture.',
    createdAt: '2026-06-10'
  },
  {
    id: 'cust-2',
    name: 'Meenakshi Sundaram',
    phone: '9789456123',
    address: '18, Kamaraj Salai, Near Rajiv Gandhi Statue, Lawspet, Puducherry',
    totalBookings: 2,
    totalSpent: '₹1,600',
    lastServiceDate: getTodayDateString(),
    notes: 'Regular monthly bathroom maintenance.',
    createdAt: '2026-07-15'
  },
  {
    id: 'cust-3',
    name: 'Aravind Swamy & Co',
    phone: '9944123890',
    address: 'Flat 3B, Sri Aurobindo Square, Bussy St, Puducherry',
    totalBookings: 6,
    totalSpent: '₹12,600',
    lastServiceDate: getTodayDateString(),
    notes: 'Corporate IT office. Needs cleaning bill/receipt with GST details.',
    createdAt: '2026-05-02'
  },
  {
    id: 'cust-4',
    name: 'Kavitha Radhakrishnan',
    phone: '9442678123',
    address: 'No. 8, 3rd Main Road, Rainbow Nagar, Puducherry',
    totalBookings: 3,
    totalSpent: '₹5,700',
    lastServiceDate: getTodayDateString(),
    notes: 'Has 2 pet cats; extra care with vacuuming pet hair from sofa fabric.',
    createdAt: '2026-06-25'
  },
  {
    id: 'cust-5',
    name: 'David Christopher',
    phone: '9790432109',
    address: 'Plot 112, ECR Road, Kottakuppam border, Puducherry',
    totalBookings: 1,
    totalSpent: 'After Visit',
    lastServiceDate: getTodayDateString(),
    notes: 'First time booking, bungalow deep cleaning assessment.',
    createdAt: '2026-09-12'
  },
  {
    id: 'cust-6',
    name: 'Balaji Narayanan',
    phone: '9677334411',
    address: '77, Mission Street, Heritage Town, Puducherry',
    totalBookings: 5,
    totalSpent: '₹11,500',
    lastServiceDate: getDateOffsetString(1),
    notes: 'Key handover with watchman if client is not available in morning.',
    createdAt: '2026-04-18'
  }
];
