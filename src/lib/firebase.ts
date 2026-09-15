import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  writeBatch,
  query,
  orderBy,
  Unsubscribe,
  runTransaction,
  getDoc
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { Booking, Jodi, Customer, SavedLocation } from '../types';

export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  firestoreDatabaseId: (firebaseConfigJson as any).firestoreDatabaseId || '(default)'
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);

// Attempt anonymous sign-in if available
if (typeof window !== 'undefined') {
  signInAnonymously(auth).catch(() => {
    // Non-fatal if project allows direct unauthenticated client read/write
  });
}

export const db: Firestore = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export interface GoogleSheetsSyncConfig {
  id: string;
  spreadsheetId: string;   // 17l8CRbj7d_U6bUUXk8OVZdMRLbvOrd3dO52SeD_gxSI
  sheetGid: string;        // 997243141
  webhookUrl: string;       // Google Apps Script Web App URL
  sheetUrl?: string;        // Google Sheet URL or direct link
  autoSyncOnSave: boolean;  // Automatically trigger sync when booking created/updated
  lastSyncedAt?: string;
  lastSyncStatus?: 'success' | 'failed' | 'idle';
  lastSyncError?: string;
  totalSyncedCount?: number;
}

export const DEFAULT_SYNC_CONFIG: GoogleSheetsSyncConfig = {
  id: 'default-config',
  spreadsheetId: '17l8CRbj7d_U6bUUXk8OVZdMRLbvOrd3dO52SeD_gxSI',
  sheetGid: '997243141',
  webhookUrl: '',
  sheetUrl: 'https://docs.google.com/spreadsheets/d/17l8CRbj7d_U6bUUXk8OVZdMRLbvOrd3dO52SeD_gxSI/edit#gid=997243141',
  autoSyncOnSave: true,
  lastSyncStatus: 'idle',
  totalSyncedCount: 0
};

// Firestore Collections Constants
export const COLLECTIONS = {
  BOOKINGS: 'bookings',
  CUSTOMERS: 'customers',
  STAFF: 'staff',
  LOCATIONS: 'savedLocations',
  SYNC_CONFIG: 'syncConfig',
  COUNTERS: 'counters'
};

// Firestore Realtime Subscriptions
export function subscribeToBookings(
  onUpdate: (bookings: Booking[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.BOOKINGS);
  return onSnapshot(colRef, (snapshot) => {
    const list: Booking[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Booking);
    });
    // Sort by timestamp desc or serviceDate desc
    list.sort((a, b) => (b.timestamp || b.serviceDate).localeCompare(a.timestamp || a.serviceDate));
    onUpdate(list);
  }, (err) => {
    console.warn('Firestore bookings subscription notice:', err.message);
    if (onError) onError(err);
  });
}

export function subscribeToLocations(
  onUpdate: (locations: SavedLocation[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.LOCATIONS);
  return onSnapshot(colRef, (snapshot) => {
    const list: SavedLocation[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as SavedLocation);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Firestore locations subscription notice:', err.message);
    if (onError) onError(err);
  });
}

export function subscribeToStaff(
  onUpdate: (staff: Jodi[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.STAFF);
  return onSnapshot(colRef, (snapshot) => {
    const list: Jodi[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Jodi);
    });
    if (list.length > 0) {
      onUpdate(list);
    }
  }, (err) => {
    console.warn('Firestore staff subscription notice:', err.message);
    if (onError) onError(err);
  });
}

export function subscribeToSyncConfig(
  onUpdate: (config: GoogleSheetsSyncConfig) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docRef = doc(db, COLLECTIONS.SYNC_CONFIG, 'default-config');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as GoogleSheetsSyncConfig);
    }
  }, (err) => {
    console.warn('Firestore sync config subscription notice:', err.message);
    if (onError) onError(err);
  });
}

// Single item writers
export async function saveBookingToFirestore(booking: Booking): Promise<void> {
  const docRef = doc(db, COLLECTIONS.BOOKINGS, booking.id || booking.refNo);
  await setDoc(docRef, booking, { merge: true });
}

export async function deleteBookingFromFirestore(bookingId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
  await deleteDoc(docRef);
}

export async function saveLocationToFirestore(location: SavedLocation): Promise<void> {
  const docRef = doc(db, COLLECTIONS.LOCATIONS, location.id);
  await setDoc(docRef, location, { merge: true });
}

export async function deleteLocationFromFirestore(locationId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.LOCATIONS, locationId);
  await deleteDoc(docRef);
}

export async function saveStaffRosterToFirestore(staffList: Jodi[]): Promise<void> {
  const batch = writeBatch(db);
  staffList.forEach((s) => {
    const docRef = doc(db, COLLECTIONS.STAFF, s.id);
    batch.set(docRef, s, { merge: true });
  });
  await batch.commit();
}

export async function saveSyncConfigToFirestore(config: GoogleSheetsSyncConfig): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SYNC_CONFIG, 'default-config');
  await setDoc(docRef, config, { merge: true });
}

/**
 * Sends booking payload directly to user's Google Sheet via Google Apps Script Webhook.
 */
export async function sendToGoogleSheetWebhook(
  webhookUrl: string, 
  action: 'insert' | 'update' | 'syncAll', 
  payload: { booking?: Booking; bookings?: Booking[] }
): Promise<{ success: boolean; message?: string }> {
  if (!webhookUrl || !webhookUrl.trim()) {
    return { success: false, message: 'Google Apps Script Webhook URL is not configured' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // Standard CORS-safe header for Google Apps Script Web Apps
      },
      body: JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
        ...payload
      })
    });

    const text = await response.text();
    return { success: true, message: text || 'Sync triggered successfully' };
  } catch (error: any) {
    console.error('Google Sheet Webhook sync error:', error);
    return { success: false, message: error?.message || 'Network error connecting to Google Sheet Webhook' };
  }
}

/**
 * Sends booking payload to backend server or Google Sheet webhook.
 * Pipeline: Manager Mobile -> Booking App -> Firestore -> Backend Server -> Google Sheet
 */
export async function syncBookingViaBackend(
  booking: Booking,
  action: 'insert' | 'update' | 'retry' = 'insert',
  fallbackWebhookUrl?: string
): Promise<{ success: boolean; status: 'Synced' | 'Failed'; message?: string }> {
  try {
    const res = await fetch('/api/sheets/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        booking,
        webhookUrl: fallbackWebhookUrl
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: data.success ?? true,
        status: data.status === 'Synced' ? 'Synced' : (data.success ? 'Synced' : 'Failed'),
        message: data.message || 'Synced to Google Sheet'
      };
    }
  } catch (err: any) {
    console.warn('Backend sheets sync endpoint warning:', err.message);
  }

  // Fallback to direct client webhook if backend server is starting or direct webhook configured
  if (fallbackWebhookUrl && fallbackWebhookUrl.trim()) {
    const directRes = await sendToGoogleSheetWebhook(fallbackWebhookUrl, action === 'update' ? 'update' : 'insert', { booking });
    return {
      success: directRes.success,
      status: directRes.success ? 'Synced' : 'Failed',
      message: directRes.message
    };
  }

  return {
    success: false,
    status: 'Failed',
    message: 'Backend Google Sheets service unreachable and no webhook configured'
  };
}

export async function syncAllBookingsViaBackend(
  bookings: Booking[],
  fallbackWebhookUrl?: string
): Promise<{ success: boolean; message?: string; count?: number }> {
  try {
    const res = await fetch('/api/sheets/sync-all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookings,
        webhookUrl: fallbackWebhookUrl
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: data.success ?? true,
        message: data.message,
        count: data.count || bookings.length
      };
    }
  } catch (err: any) {
    console.warn('Backend sync-all warning:', err.message);
  }

  if (fallbackWebhookUrl && fallbackWebhookUrl.trim()) {
    const directRes = await sendToGoogleSheetWebhook(fallbackWebhookUrl, 'syncAll', { bookings });
    return {
      success: directRes.success,
      message: directRes.message,
      count: bookings.length
    };
  }

  return {
    success: false,
    message: 'Google Sheet Webhook not configured'
  };
}

/**
 * Global permanent atomic booking reference sequence.
 * 
 * NEVER reuses a reference number even if a booking is deleted.
 * Atomic across multi-user concurrent requests between Admin and Manager portals.
 * Sequence strictly increases forward (MSD/PDY/1030, MSD/PDY/1031, etc.)
 */
export async function allocateNextBookingRefNoCentral(existingBookings?: Booking[]): Promise<string> {
  const STARTING_INDEX = 1029; // Starts from MSD/PDY/1030
  let maxFromExisting = STARTING_INDEX;
  
  if (existingBookings && existingBookings.length > 0) {
    for (const b of existingBookings) {
      if (b.refNo && b.refNo.startsWith('MSD/PDY/')) {
        const num = parseInt(b.refNo.replace('MSD/PDY/', '').trim(), 10);
        if (!isNaN(num) && num > maxFromExisting) {
          maxFromExisting = num;
        }
      }
    }
  }

  // 1. Try atomic Firestore transaction on central database
  try {
    const counterDocRef = doc(db, COLLECTIONS.COUNTERS, 'bookingRef');
    const allocatedRefNo = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(counterDocRef);
      let currentNumber = maxFromExisting;

      if (snap.exists()) {
        const data = snap.data();
        if (typeof data.currentNumber === 'number' && data.currentNumber > currentNumber) {
          currentNumber = data.currentNumber;
        }
      }

      const nextNumber = currentNumber + 1;
      transaction.set(counterDocRef, {
        currentNumber: nextNumber,
        prefix: 'MSD/PDY/',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return `MSD/PDY/${nextNumber}`;
    });

    // Also update server counter watermark in background
    fetch('/api/bookings/update-watermark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seenRefNo: allocatedRefNo })
    }).catch(() => {});

    return allocatedRefNo;
  } catch (err) {
    console.warn('Firestore transaction note (switching to server allocator):', err);
  }

  // 2. Try Central Server API allocator
  try {
    const res = await fetch('/api/bookings/allocate-ref', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minNumber: maxFromExisting })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.refNo) {
        return data.refNo;
      }
    }
  } catch (err) {
    console.error('Server allocator fallback error:', err);
  }

  // 3. Fallback to monotonically advancing sequence
  const fallbackNum = maxFromExisting + 1;
  return `MSD/PDY/${fallbackNum}`;
}

export async function peekNextBookingRefNoCentral(existingBookings?: Booking[]): Promise<string> {
  const STARTING_INDEX = 1029;
  let maxFromExisting = STARTING_INDEX;
  
  if (existingBookings && existingBookings.length > 0) {
    for (const b of existingBookings) {
      if (b.refNo && b.refNo.startsWith('MSD/PDY/')) {
        const num = parseInt(b.refNo.replace('MSD/PDY/', '').trim(), 10);
        if (!isNaN(num) && num > maxFromExisting) {
          maxFromExisting = num;
        }
      }
    }
  }

  try {
    const counterDocRef = doc(db, COLLECTIONS.COUNTERS, 'bookingRef');
    const snap = await getDoc(counterDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (typeof data.currentNumber === 'number') {
        const highest = Math.max(data.currentNumber, maxFromExisting);
        return `MSD/PDY/${highest + 1}`;
      }
    }
  } catch (e) {}

  try {
    const res = await fetch('/api/bookings/peek-ref');
    if (res.ok) {
      const data = await res.json();
      if (data.nextRefNo) {
        return data.nextRefNo;
      }
    }
  } catch (e) {}

  return `MSD/PDY/${maxFromExisting + 1}`;
}

