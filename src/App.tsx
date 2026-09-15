import React, { useState, useEffect } from 'react';
import { Booking, Jodi, Customer, ActiveTab, UserRole, JobStatus, TimeSlot, SavedLocation } from './types';
import { 
  INITIAL_JODIS, 
  INITIAL_CUSTOMERS, 
  INITIAL_SAVED_LOCATIONS 
} from './data/initialData';
import { 
  getTodayDateString, 
  getDateOffsetString, 
  generateCustomerMessage, 
  generateStaffMessage 
} from './utils/bookingUtils';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { BookingCalendarView } from './components/BookingCalendarView';
import { DailyStaffScheduleView } from './components/DailyStaffScheduleView';
import { DailyScheduleMatrix } from './components/DailyScheduleMatrix';
import { BookingManagement } from './components/BookingManagement';
import { CustomerDatabase } from './components/CustomerDatabase';
import { StaffManagement } from './components/StaffManagement';
import { ReportsView } from './components/ReportsView';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { StaffPortal } from './components/StaffPortal';
import { BookingModal } from './components/BookingModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { BookingDetailModal } from './components/BookingDetailModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { SavedLocationsManagement } from './components/SavedLocationsManagement';
import { 
  subscribeToBookings, 
  subscribeToLocations, 
  subscribeToSyncConfig,
  saveBookingToFirestore, 
  deleteBookingFromFirestore, 
  saveLocationToFirestore, 
  deleteLocationFromFirestore,
  sendToGoogleSheetWebhook,
  syncBookingViaBackend,
  GoogleSheetsSyncConfig,
  DEFAULT_SYNC_CONFIG
} from './lib/firebase';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  ClipboardList, 
  MapPin, 
  Users, 
  UserCheck, 
  BarChart3, 
  FileSpreadsheet 
} from 'lucide-react';

export default function App() {
  // Persistent state initialized from localStorage
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const savedV5 = localStorage.getItem('msd_facility_bookings_v5');
      if (savedV5) {
        return JSON.parse(savedV5);
      }
      localStorage.removeItem('msd_facility_bookings_v4');
      localStorage.removeItem('msd_facility_bookings_v3');
      localStorage.removeItem('msd_facility_bookings_v2');
      localStorage.removeItem('msd_facility_bookings');
      localStorage.setItem('msd_facility_bookings_v5', JSON.stringify([]));
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  const [jodis, setJodis] = useState<Jodi[]>(() => {
    try {
      const savedV4 = localStorage.getItem('msd_facility_staff_v4');
      if (savedV4) {
        return JSON.parse(savedV4);
      }
      const saved = localStorage.getItem('msd_facility_jodis_v2');
      if (saved) {
        const parsed: Jodi[] = JSON.parse(saved);
        if (parsed.some(j => j.name.toLowerCase().includes('jodi')) || parsed.length < 6) {
          return INITIAL_JODIS;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_JODIS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('msd_facility_customers_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CUSTOMERS;
  });

  // Saved locations persistent state
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(() => {
    try {
      const saved = localStorage.getItem('msd_facility_saved_locations_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SAVED_LOCATIONS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('msd_facility_bookings_v5', JSON.stringify(bookings));
      localStorage.setItem('msd_facility_bookings_v4', JSON.stringify(bookings));
    } catch (e) {
      console.error(e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem('msd_facility_staff_v4', JSON.stringify(jodis));
      localStorage.setItem('msd_facility_jodis_v2', JSON.stringify(jodis));
    } catch (e) {
      console.error(e);
    }
  }, [jodis]);

  useEffect(() => {
    try {
      localStorage.setItem('msd_facility_customers_v2', JSON.stringify(customers));
    } catch (e) {
      console.error(e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem('msd_facility_saved_locations_v1', JSON.stringify(savedLocations));
    } catch (e) {
      console.error(e);
    }
  }, [savedLocations]);

  // Google Sheets Live Sync Configuration
  const [syncConfig, setSyncConfig] = useState<GoogleSheetsSyncConfig>(() => {
    try {
      const saved = localStorage.getItem('msd_facility_sync_config_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SYNC_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem('msd_facility_sync_config_v1', JSON.stringify(syncConfig));
    } catch (e) {
      console.error(e);
    }
  }, [syncConfig]);

  const [isCloudConnected, setIsCloudConnected] = useState(true);

  // Real-time Firestore sync & cloud listener
  useEffect(() => {
    // 1. Subscribe to Firestore Bookings
    const unsubBookings = subscribeToBookings((remoteBookings) => {
      setIsCloudConnected(true);
      if (remoteBookings && remoteBookings.length > 0) {
        setBookings(remoteBookings);
      }
    }, () => {
      setIsCloudConnected(false);
    });

    // 2. Subscribe to Saved Locations
    const unsubLocations = subscribeToLocations((remoteLocs) => {
      if (remoteLocs && remoteLocs.length > 0) {
        setSavedLocations(remoteLocs);
      }
    });

    // 3. Subscribe to Sync Config
    const unsubSync = subscribeToSyncConfig((remoteConfig) => {
      if (remoteConfig && remoteConfig.webhookUrl) {
        setSyncConfig(remoteConfig);
      }
    });

    return () => {
      unsubBookings();
      unsubLocations();
      unsubSync();
    };
  }, []);

  // Navigation & Role states
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [selectedStaffJodiId, setSelectedStaffJodiId] = useState<string>('jodi-1');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  const [bookingPrefill, setBookingPrefill] = useState<{
    serviceDate?: string;
    timeSlot?: TimeSlot;
    assignedStaff?: string;
  } | null>(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppBooking, setWhatsAppBooking] = useState<Booking | null>(null);
  const [whatsAppInitialTab, setWhatsAppInitialTab] = useState<'customer' | 'staff' | 'cancelled' | 'rescheduled'>('customer');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<Booking | null>(null);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingPendingDelete, setBookingPendingDelete] = useState<Booking | null>(null);

  // Success Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Location Management Handlers
  const handleAddLocation = (newLoc: Omit<SavedLocation, 'id' | 'createdAt'>) => {
    const loc: SavedLocation = {
      ...newLoc,
      id: `loc-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setSavedLocations(prev => [loc, ...prev]);
    saveLocationToFirestore(loc).catch(console.error);
    showToast(`Location "${loc.name}" added successfully!`);
  };

  const handleUpdateLocation = (updatedLoc: SavedLocation) => {
    setSavedLocations(prev => prev.map(l => l.id === updatedLoc.id ? updatedLoc : l));
    saveLocationToFirestore(updatedLoc).catch(console.error);
    showToast(`Location "${updatedLoc.name}" updated.`);
  };

  const handleDeleteLocation = (locationId: string) => {
    setSavedLocations(prev => prev.filter(l => l.id !== locationId));
    deleteLocationFromFirestore(locationId).catch(console.error);
    showToast('Location removed from saved list.');
  };

  const handleQuickSaveLocation = (newLoc: Omit<SavedLocation, 'id' | 'createdAt'>) => {
    handleAddLocation(newLoc);
  };

  const handleOpenWhatsAppModal = (
    b: Booking, 
    tab: 'customer' | 'staff' | 'cancelled' | 'rescheduled' = 'customer'
  ) => {
    setWhatsAppBooking(b);
    setWhatsAppInitialTab(tab);
    setIsWhatsAppModalOpen(true);
  };

  const handleRequestDelete = (booking: Booking) => {
    setBookingPendingDelete(booking);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (bookingId: string) => {
    setBookings(prev => {
      const updated = prev.filter(b => b.id !== bookingId);
      try {
        localStorage.setItem('msd_facility_bookings_v5', JSON.stringify(updated));
        localStorage.setItem('msd_facility_bookings_v4', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    // Delete from Firestore
    deleteBookingFromFirestore(bookingId).catch(console.error);
    setIsDeleteModalOpen(false);
    setBookingPendingDelete(null);
    if (selectedDetailBooking?.id === bookingId) {
      setIsDetailModalOpen(false);
      setSelectedDetailBooking(null);
    }
    showToast('Booking deleted successfully.');
  };

  // Handler: Save Booking (New or Edit)
  const handleSaveBooking = (booking: Booking, isEdit: boolean) => {
    if (isEdit) {
      setBookings(prev => prev.map(b => b.id === booking.id ? booking : b));
      showToast(`Booking ${booking.refNo} updated successfully!`);
    } else {
      setBookings(prev => [booking, ...prev]);
      showToast(`New booking ${booking.refNo} created!`);

      // Update or add customer profile
      setCustomers(prev => {
        const existingIdx = prev.findIndex(c => c.phone === booking.customerCell);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            name: booking.customerName,
            address: booking.address,
            totalBookings: updated[existingIdx].totalBookings + 1,
            lastServiceDate: booking.serviceDate
          };
          return updated;
        } else {
          const newCust: Customer = {
            id: `cust-${Date.now()}`,
            name: booking.customerName,
            phone: booking.customerCell,
            address: booking.address,
            totalBookings: 1,
            totalSpent: booking.amount,
            lastServiceDate: booking.serviceDate,
            createdAt: new Date().toISOString(),
            notes: ''
          };
          return [newCust, ...prev];
        }
      });
    }

    // 1. Prepare booking with sheetSyncStatus and createdBy metadata
    const bookingToSave: Booking = {
      ...booking,
      sheetSyncStatus: booking.sheetSyncStatus || 'Pending',
      createdBy: booking.createdBy || (userRole === 'admin' ? 'Admin Portal' : 'Manager (Mobile Portal)')
    };

    // 2. Persist to Firestore Database in real time
    saveBookingToFirestore(bookingToSave).catch(err => {
      console.error('Failed to sync booking to Firestore:', err);
    });

    // 3. Automatically push to Google Sheet via Central Backend Server
    syncBookingViaBackend(bookingToSave, isEdit ? 'update' : 'insert', syncConfig.webhookUrl)
      .then(res => {
        const isSuccess = res.success;
        const finalStatus = isSuccess ? 'Synced' : 'Failed';
        const updatedWithSync: Booking = {
          ...bookingToSave,
          sheetSyncStatus: finalStatus,
          sheetSyncedAt: isSuccess ? new Date().toISOString() : undefined,
          sheetSyncError: isSuccess ? undefined : res.message
        };

        setBookings(prev => prev.map(b => b.id === booking.id ? updatedWithSync : b));
        saveBookingToFirestore(updatedWithSync).catch(console.error);

        if (isSuccess) {
          showToast(`Google Sheet: ✓ Synced (${booking.refNo})`);
        } else {
          showToast(`Saved to Cloud. Sheet sync pending (Admin can retry).`);
        }
      })
      .catch(err => {
        console.error('Google Sheet background sync error:', err);
      });

    setIsBookingModalOpen(false);
    setBookingToEdit(null);
    setBookingPrefill(null);

    // Prompt user to send WhatsApp confirmation
    setWhatsAppBooking(bookingToSave);
    setWhatsAppInitialTab('customer');
    setIsWhatsAppModalOpen(true);
  };

  // Handler: Delete Single Booking (from list)
  const handleDeleteBooking = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      handleRequestDelete(booking);
    }
  };

  // Handler: Delete All Bookings
  const handleDeleteAllBookings = () => {
    setBookings([]);
    try {
      localStorage.setItem('msd_facility_bookings_v5', JSON.stringify([]));
      localStorage.setItem('msd_facility_bookings_v4', JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
    showToast('All bookings deleted.');
  };

  // Handler: Update Job Status
  const handleUpdateStatus = (id: string, newStatus: JobStatus, note?: string) => {
    let updatedBooking: Booking | null = null;
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        updatedBooking = {
          ...b,
          jobStatus: newStatus,
          notes: note ? `${b.notes ? b.notes + ' • ' : ''}${note}` : b.notes,
          completedAt: newStatus === 'Completed' ? new Date().toISOString() : b.completedAt
        };
        return updatedBooking;
      }
      return b;
    }));

    if (updatedBooking) {
      saveBookingToFirestore(updatedBooking).catch(console.error);
      // Automatically update existing row in Google Sheet in place
      syncBookingViaBackend(updatedBooking, 'update', syncConfig.webhookUrl)
        .then(res => {
          if (res.success) {
            const synced: Booking = { ...updatedBooking!, sheetSyncStatus: 'Synced', sheetSyncedAt: new Date().toISOString() };
            setBookings(prev => prev.map(b => b.id === id ? synced : b));
            saveBookingToFirestore(synced).catch(console.error);
          }
        })
        .catch(console.error);
    }

    showToast(`Status updated to ${newStatus}`);
  };

  // Handler: Retry Google Sheet Sync
  const handleRetrySheetSync = async (bookingId: string) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    showToast(`Retrying Google Sheet sync for ${targetBooking.refNo}...`);
    try {
      // 1. If Google OAuth token is cached, attempt direct Google Sheets API sync
      const cachedToken = (await import('./lib/googleSheetsService')).getCachedAccessToken();
      if (cachedToken) {
        const { syncBookingToGoogleSheetDirect } = await import('./lib/googleSheetsService');
        const directRes = await syncBookingToGoogleSheetDirect(cachedToken, targetBooking);
        if (directRes.success) {
          const updated: Booking = {
            ...targetBooking,
            sheetSyncStatus: 'Synced',
            sheetSyncedAt: new Date().toISOString(),
            sheetSyncError: undefined
          };
          setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
          await saveBookingToFirestore(updated);
          showToast(`Google Sheets API: ✓ Synced (${targetBooking.refNo})`);
          return;
        }
      }

      // 2. Fallback to backend server / webhook
      const res = await syncBookingViaBackend(targetBooking, 'update', syncConfig.webhookUrl);
      const isSuccess = res.success;
      const updated: Booking = {
        ...targetBooking,
        sheetSyncStatus: isSuccess ? 'Synced' : 'Failed',
        sheetSyncedAt: isSuccess ? new Date().toISOString() : undefined,
        sheetSyncError: isSuccess ? undefined : res.message
      };

      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
      await saveBookingToFirestore(updated);

      if (isSuccess) {
        showToast(`Google Sheet: ✓ Synced (${targetBooking.refNo})`);
      } else {
        showToast(`Sync failed: ${res.message || 'Check connection or sign in'}`);
      }
    } catch (e: any) {
      showToast(`Error connecting: ${e?.message || 'Network error'}`);
    }
  };

  // Handler: Add Jodi / Staff
  const handleAddJodi = (newJodi: Jodi) => {
    setJodis(prev => [...prev, newJodi]);
    showToast(`${newJodi.name} added to staff roster.`);
  };

  // Handler: Update Jodi / Staff
  const handleUpdateJodi = (updatedJodi: Jodi) => {
    setJodis(prev => prev.map(j => j.id === updatedJodi.id ? updatedJodi : j));
    showToast(`${updatedJodi.name} details updated.`);
  };

  // Handler: Import Bookings from Google Sheets
  const handleImportBookings = (importedBookings: Booking[]) => {
    setBookings(prev => {
      const map = new Map<string, Booking>();
      prev.forEach(b => map.set(b.refNo, b));
      importedBookings.forEach(b => map.set(b.refNo, b));
      return Array.from(map.values());
    });

    // Write all imported bookings to Firestore
    importedBookings.forEach(b => {
      saveBookingToFirestore(b).catch(console.error);
    });

    showToast(`${importedBookings.length} records synchronized from Google Sheets!`);
  };

  // Current Jodi for staff portal
  const currentStaffJodi = jodis.find(j => j.id === selectedStaffJodiId) || jodis[0] || INITIAL_JODIS[0];

  const pendingBookingsCount = bookings.filter(b => ['New', 'Assigned', 'In Progress'].includes(b.jobStatus)).length;

  // Desktop navigation items
  const adminNavTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar' as ActiveTab, label: 'Calendar', icon: Calendar },
    { id: 'staff-schedule' as ActiveTab, label: 'Staff Schedule', icon: Clock },
    { id: 'bookings' as ActiveTab, label: 'Bookings', icon: ClipboardList, count: pendingBookingsCount },
    { id: 'locations' as ActiveTab, label: 'Locations', icon: MapPin },
    { id: 'customers' as ActiveTab, label: 'Customers', icon: Users },
    { id: 'staff' as ActiveTab, label: 'Staff Roster', icon: UserCheck },
    { id: 'reports' as ActiveTab, label: 'Reports', icon: BarChart3 },
    { id: 'sheets' as ActiveTab, label: 'Google Sheets', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col antialiased selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-amber-300 border border-amber-500/40 px-5 py-2.5 rounded-xl text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        userRole={userRole}
        setUserRole={setUserRole}
        selectedStaffJodiId={selectedStaffJodiId}
        setSelectedStaffJodiId={setSelectedStaffJodiId}
        jodis={jodis}
        isCloudConnected={isCloudConnected}
        onOpenNewBooking={() => {
          setBookingToEdit(null);
          setBookingPrefill(null);
          setIsBookingModalOpen(true);
        }}
      />

      {/* Desktop Navigation Tabs Bar (Admin view) */}
      {userRole === 'admin' && (
        <div className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/90 shadow-xs dark:shadow-sm sticky top-[61px] z-20 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none">
            {adminNavTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        
        {/* If Staff Role is Active */}
        {userRole === 'staff' ? (
          <StaffPortal
            currentJodi={currentStaffJodi}
            bookings={bookings}
            onUpdateJobStatus={handleUpdateStatus}
            onOpenWhatsAppModal={(b) => {
              setWhatsAppBooking(b);
              setIsWhatsAppModalOpen(true);
            }}
          />
        ) : (
          /* Admin View Switcher */
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                bookings={bookings}
                jodis={jodis}
                onOpenNewBooking={() => {
                  setBookingToEdit(null);
                  setBookingPrefill(null);
                  setIsBookingModalOpen(true);
                }}
                onSelectBooking={(b) => {
                  setSelectedDetailBooking(b);
                  setIsDetailModalOpen(true);
                }}
                onOpenWhatsAppModal={(b) => {
                  setWhatsAppBooking(b);
                  setIsWhatsAppModalOpen(true);
                }}
                setActiveTab={setActiveTab}
                setSelectedDate={setSelectedDate}
              />
            )}

            {activeTab === 'calendar' && (
              <BookingCalendarView
                bookings={bookings}
                staffList={jodis}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onSelectBooking={(b) => {
                  setSelectedDetailBooking(b);
                  setIsDetailModalOpen(true);
                }}
                onOpenWhatsAppModal={(b) => {
                  setWhatsAppBooking(b);
                  setIsWhatsAppModalOpen(true);
                }}
                onNewBookingForDate={(date) => {
                  setBookingToEdit(null);
                  setBookingPrefill({ serviceDate: date });
                  setIsBookingModalOpen(true);
                }}
              />
            )}

            {activeTab === 'staff-schedule' && (
              <DailyStaffScheduleView
                staffList={jodis}
                bookings={bookings}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onSelectBooking={(b) => {
                  setSelectedDetailBooking(b);
                  setIsDetailModalOpen(true);
                }}
                onOpenWhatsAppModal={(b) => {
                  setWhatsAppBooking(b);
                  setIsWhatsAppModalOpen(true);
                }}
                onOpenNewBookingWithPrefill={(prefill) => {
                  setBookingToEdit(null);
                  setBookingPrefill(prefill);
                  setIsBookingModalOpen(true);
                }}
              />
            )}

            {activeTab === 'schedule' && (
              <DailyScheduleMatrix
                bookings={bookings}
                jodis={jodis}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onOpenNewBookingWithPrefill={(prefill) => {
                  setBookingToEdit(null);
                  setBookingPrefill(prefill);
                  setIsBookingModalOpen(true);
                }}
                onSelectBooking={(b) => {
                  setSelectedDetailBooking(b);
                  setIsDetailModalOpen(true);
                }}
                onOpenWhatsAppModal={(b) => {
                  setWhatsAppBooking(b);
                  setIsWhatsAppModalOpen(true);
                }}
              />
            )}

            {activeTab === 'locations' && (
              <SavedLocationsManagement
                locations={savedLocations}
                onAddLocation={handleAddLocation}
                onUpdateLocation={handleUpdateLocation}
                onDeleteLocation={handleDeleteLocation}
              />
            )}

            {activeTab === 'bookings' && (
              <BookingManagement
                bookings={bookings}
                jodis={jodis}
                onOpenNewBooking={() => {
                  setBookingToEdit(null);
                  setBookingPrefill(null);
                  setIsBookingModalOpen(true);
                }}
                onEditBooking={(b) => {
                  setBookingToEdit(b);
                  setBookingPrefill(null);
                  setIsBookingModalOpen(true);
                }}
                onDeleteBooking={handleDeleteBooking}
                onRequestDelete={handleRequestDelete}
                onDeleteAllBookings={handleDeleteAllBookings}
                onUpdateStatus={handleUpdateStatus}
                onOpenWhatsAppModal={handleOpenWhatsAppModal}
                onRetrySheetSync={handleRetrySheetSync}
              />
            )}

            {activeTab === 'customers' && (
              <CustomerDatabase
                customers={customers}
                bookings={bookings}
                onOpenNewBookingForCustomer={(cust) => {
                  setBookingToEdit(null);
                  setBookingPrefill(null);
                  setIsBookingModalOpen(true);
                }}
                onSelectBooking={(b) => {
                  setSelectedDetailBooking(b);
                  setIsDetailModalOpen(true);
                }}
              />
            )}

            {activeTab === 'staff' && (
              <StaffManagement
                jodis={jodis}
                bookings={bookings}
                onAddJodi={handleAddJodi}
                onUpdateJodi={handleUpdateJodi}
                setActiveTab={setActiveTab}
                setSelectedDate={setSelectedDate}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                bookings={bookings}
                jodis={jodis}
              />
            )}

            {activeTab === 'sheets' && (
              <GoogleSheetSyncModal
                bookings={bookings}
                jodis={jodis}
                onImportBookings={handleImportBookings}
                syncConfig={syncConfig}
                onUpdateSyncConfig={setSyncConfig}
                onUpdateBooking={(updatedB) => {
                  setBookings(prev => prev.map(b => b.id === updatedB.id ? updatedB : b));
                }}
              />
            )}
          </>
        )}

      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        pendingCount={pendingBookingsCount}
      />

      {/* Modals */}
      {isBookingModalOpen && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setBookingToEdit(null);
            setBookingPrefill(null);
          }}
          onSave={handleSaveBooking}
          bookingToEdit={bookingToEdit}
          existingBookings={bookings}
          jodis={jodis}
          customers={customers}
          initialPrefill={bookingPrefill}
          savedLocations={savedLocations}
          onQuickSaveLocation={handleQuickSaveLocation}
        />
      )}

      {isWhatsAppModalOpen && (
        <WhatsAppModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => {
            setIsWhatsAppModalOpen(false);
            setWhatsAppBooking(null);
          }}
          booking={whatsAppBooking}
          initialTab={whatsAppInitialTab}
        />
      )}

      {isDetailModalOpen && (
        <BookingDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedDetailBooking(null);
          }}
          booking={selectedDetailBooking}
          onEdit={(b) => {
            setIsDetailModalOpen(false);
            setBookingToEdit(b);
            setIsBookingModalOpen(true);
          }}
          onOpenWhatsAppModal={(b, tab) => {
            setIsDetailModalOpen(false);
            handleOpenWhatsAppModal(b, tab);
          }}
          onUpdateStatus={handleUpdateStatus}
          onRequestDelete={handleRequestDelete}
          onRetrySheetSync={handleRetrySheetSync}
        />
      )}

      {isDeleteModalOpen && bookingPendingDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setBookingPendingDelete(null);
          }}
          booking={bookingPendingDelete}
          onConfirmDelete={handleConfirmDelete}
        />
      )}

    </div>
  );
}
