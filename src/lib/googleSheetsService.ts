import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut,
  Auth 
} from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { Booking } from '../types';

export const SPREADSHEET_ID = '17l8CRbj7d_U6bUUXk8OVZdMRLbvOrd3dO52SeD_gxSI';
export const SHEET_GID = '997243141';
export const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Initialize Firebase App
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp({
    apiKey: firebaseConfigJson.apiKey,
    authDomain: firebaseConfigJson.authDomain,
    projectId: firebaseConfigJson.projectId,
    storageBucket: firebaseConfigJson.storageBucket,
    messagingSenderId: firebaseConfigJson.messagingSenderId,
    appId: firebaseConfigJson.appId,
  });
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'consent'
});

// In-memory token cache (Do NOT store in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Initialize Auth State listener
 */
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * Trigger Google Sign In Popup with Sheets scopes
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google did not return an access token for Sheets');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get in-memory access token
 */
export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Sign out and clear in-memory token
 */
export const signOutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Format booking to exact 17-column row representation
 */
export function formatBookingTo17Row(booking: Booking): (string | number)[] {
  let staffDisplay = booking.assignedStaff || '';
  if (booking.assignedStaff2 && booking.assignedStaff2.trim() && !staffDisplay.includes(booking.assignedStaff2)) {
    staffDisplay = `${staffDisplay} & ${booking.assignedStaff2}`;
  }
  staffDisplay = staffDisplay.replace(/(&\s*Team\s*)+/gi, '& Team').trim();

  let staffPhone = booking.staffCell || '7708779733';
  if (booking.staffCell2 && booking.staffCell2.trim() && booking.staffCell2 !== staffPhone) {
    staffPhone = `${staffPhone}, ${booking.staffCell2}`;
  }

  return [
    booking.timestamp || new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), // 1. Timestamp
    booking.refNo,                                                                          // 2. Booking Ref No (Unique deduplication key)
    booking.customerName,                                                                   // 3. Customer Name
    booking.customerCell,                                                                   // 4. Customer Cell No
    booking.address,                                                                        // 5. Address/Location
    booking.serviceDate,                                                                    // 6. Service Date
    booking.timeSlot,                                                                       // 7. Time Slot
    booking.services + (booking.serviceDescription ? ` (${booking.serviceDescription})` : ''), // 8. Services
    staffDisplay,                                                                           // 9. Assigned Staff
    staffPhone,                                                                             // 10. Staff Cell No
    booking.amount,                                                                         // 11. Amount
    booking.jobStatus,                                                                      // 12. Job Status
    booking.customerMsg || 'WhatsApp Customer',                                             // 13. Customer MSG
    booking.staffMsg || 'WhatsApp Staff',                                                   // 14. Staff MSG
    '',                                                                                     // 15. Column 22
    '',                                                                                     // 16. Column 16
    ''                                                                                      // 17. Column 17
  ];
}

/**
 * Find the sheet name / title corresponding to sheetId (GID)
 */
export async function getSheetTitleByGid(accessToken: string, spreadsheetId: string, gid: string): Promise<string> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch spreadsheet metadata (${res.status})`);
  }

  const data = await res.json();
  const sheets = data.sheets || [];
  const targetSheet = sheets.find((s: any) => String(s.properties?.sheetId) === String(gid));

  if (targetSheet && targetSheet.properties?.title) {
    return targetSheet.properties.title;
  }
  return sheets[0]?.properties?.title || 'Sheet1';
}

/**
 * Read all rows from the Google Sheet tab using the Google Sheets REST API
 */
export async function readGoogleSheetRows(
  accessToken: string,
  spreadsheetId: string = SPREADSHEET_ID,
  gid: string = SHEET_GID
): Promise<{ title: string; rows: string[][] }> {
  const sheetTitle = await getSheetTitleByGid(accessToken, spreadsheetId, gid);
  const range = `'${sheetTitle}'!A:Q`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueRenderOption=FORMATTED_VALUE`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to read sheet data (${res.status})`);
  }

  const data = await res.json();
  return {
    title: sheetTitle,
    rows: data.values || []
  };
}

/**
 * Sync a single booking directly to the user's Google Sheet via Google Sheets REST API
 * Handles deduplication: if Ref No already exists, updates row in place; otherwise appends.
 */
export async function syncBookingToGoogleSheetDirect(
  accessToken: string,
  booking: Booking,
  spreadsheetId: string = SPREADSHEET_ID,
  gid: string = SHEET_GID
): Promise<{ success: boolean; action: 'updated' | 'appended'; rowNumber: number; message: string }> {
  const sheetTitle = await getSheetTitleByGid(accessToken, spreadsheetId, gid);
  
  // 1. Fetch Column B (Ref No) to check if row already exists
  const refRange = `'${sheetTitle}'!B:B`;
  const refUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(refRange)}`;
  
  const refRes = await fetch(refUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let existingRowIndex = -1; // 1-indexed in Sheets
  if (refRes.ok) {
    const refData = await refRes.json();
    const values: string[][] = refData.values || [];
    for (let i = 0; i < values.length; i++) {
      const cellVal = (values[i][0] || '').toString().trim().toLowerCase();
      if (cellVal && cellVal === booking.refNo.trim().toLowerCase()) {
        existingRowIndex = i + 1;
        break;
      }
    }
  }

  const rowValues = formatBookingTo17Row(booking);

  if (existingRowIndex > 1) {
    // 2. Update existing row in place (A to N or Q)
    const updateRange = `'${sheetTitle}'!A${existingRowIndex}:Q${existingRowIndex}`;
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(updateRange)}?valueInputOption=USER_ENTERED`;
    
    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: updateRange,
        majorDimension: 'ROWS',
        values: [rowValues]
      })
    });

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to update row in sheet (${updateRes.status})`);
    }

    return {
      success: true,
      action: 'updated',
      rowNumber: existingRowIndex,
      message: `Updated existing row ${existingRowIndex} for ${booking.refNo} in Google Sheet tab "${sheetTitle}"`
    };
  } else {
    // 3. Append as new row
    const appendRange = `'${sheetTitle}'!A:Q`;
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(appendRange)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const appendRes = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: appendRange,
        majorDimension: 'ROWS',
        values: [rowValues]
      })
    });

    if (!appendRes.ok) {
      const err = await appendRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to append row in sheet (${appendRes.status})`);
    }

    const appendData = await appendRes.json();
    return {
      success: true,
      action: 'appended',
      rowNumber: appendData.updates?.updatedRows || 1,
      message: `Successfully appended ${booking.refNo} to Google Sheet tab "${sheetTitle}"`
    };
  }
}

/**
 * Bulk sync all bookings to the Google Sheet via REST API
 */
export async function syncAllBookingsToGoogleSheetDirect(
  accessToken: string,
  bookings: Booking[],
  spreadsheetId: string = SPREADSHEET_ID,
  gid: string = SHEET_GID
): Promise<{ success: boolean; total: number; updated: number; appended: number }> {
  let updated = 0;
  let appended = 0;

  for (const booking of bookings) {
    try {
      const res = await syncBookingToGoogleSheetDirect(accessToken, booking, spreadsheetId, gid);
      if (res.action === 'updated') updated++;
      else appended++;
    } catch (e) {
      console.warn(`Error syncing booking ${booking.refNo}:`, e);
    }
  }

  return {
    success: true,
    total: bookings.length,
    updated,
    appended
  };
}
