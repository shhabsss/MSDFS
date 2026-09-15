import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Code2,
  Database,
  Smartphone,
  ArrowRight,
  Zap,
  LogIn,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Table
} from 'lucide-react';
import { Booking, Jodi } from '../types';
import { exportBookingsToCSV, parseGoogleSheetCSV, getTodayDateString } from '../utils/bookingUtils';
import { 
  GoogleSheetsSyncConfig, 
  saveSyncConfigToFirestore, 
  sendToGoogleSheetWebhook,
  saveBookingToFirestore
} from '../lib/firebase';
import {
  signInWithGoogle,
  signOutGoogle,
  getCachedAccessToken,
  initGoogleAuth,
  syncBookingToGoogleSheetDirect,
  syncAllBookingsToGoogleSheetDirect,
  readGoogleSheetRows,
  SPREADSHEET_ID,
  SHEET_GID
} from '../lib/googleSheetsService';
import { User } from 'firebase/auth';

interface GoogleSheetSyncModalProps {
  bookings: Booking[];
  jodis: Jodi[];
  onImportBookings: (newBookings: Booking[]) => void;
  syncConfig: GoogleSheetsSyncConfig;
  onUpdateSyncConfig: (config: GoogleSheetsSyncConfig) => void;
  onUpdateBooking?: (booking: Booking) => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  bookings,
  jodis,
  onImportBookings,
  syncConfig,
  onUpdateSyncConfig,
  onUpdateBooking
}) => {
  // Google OAuth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(getCachedAccessToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [directSyncProgress, setDirectSyncProgress] = useState<{ active: boolean; message: string; success?: boolean } | null>(null);
  const [sheetPreviewRows, setSheetPreviewRows] = useState<string[][] | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Webhook and CSV state
  const [copiedCode, setCopiedCode] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [liveSyncResult, setLiveSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const [webhookUrlInput, setWebhookUrlInput] = useState(syncConfig.webhookUrl || '');
  const [sheetUrlInput, setSheetUrlInput] = useState(syncConfig.sheetUrl || `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${SHEET_GID}`);
  const [autoSyncInput, setAutoSyncInput] = useState(syncConfig.autoSyncOnSave ?? true);

  const today = getTodayDateString();

  // Listen to Google Auth state
  useEffect(() => {
    const unsub = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsub();
  }, []);

  // Handler: Sign in with Google (OAuth)
  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setDirectSyncProgress(null);
      const res = await signInWithGoogle();
      setGoogleUser(res.user);
      setGoogleToken(res.accessToken);
      setDirectSyncProgress({
        active: false,
        success: true,
        message: `Connected Google Account (${res.user.email || res.user.displayName}). Google Sheets API is ready!`
      });
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setDirectSyncProgress({
        active: false,
        success: false,
        message: err.message || 'Google Sign-in failed. Please try again.'
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handler: Disconnect Google Account
  const handleGoogleSignOut = async () => {
    await signOutGoogle();
    setGoogleUser(null);
    setGoogleToken(null);
    setSheetPreviewRows(null);
    setDirectSyncProgress({
      active: false,
      success: true,
      message: 'Signed out of Google Sheets API'
    });
  };

  // Handler: Direct Sync via Google Sheets REST API
  const handleDirectSyncAll = async () => {
    if (!googleToken) {
      await handleGoogleSignIn();
      return;
    }

    setDirectSyncProgress({
      active: true,
      message: `Directly syncing ${bookings.length} bookings to Google Sheet tab GID ${SHEET_GID}...`
    });

    try {
      const result = await syncAllBookingsToGoogleSheetDirect(googleToken, bookings, SPREADSHEET_ID, SHEET_GID);
      
      // Update local & firestore sync metadata
      const updatedConfig: GoogleSheetsSyncConfig = {
        ...syncConfig,
        lastSyncedAt: new Date().toISOString(),
        lastSyncStatus: 'success',
        lastSyncError: undefined,
        totalSyncedCount: bookings.length
      };
      onUpdateSyncConfig(updatedConfig);
      await saveSyncConfigToFirestore(updatedConfig);

      // Update all bookings locally to Synced
      const now = new Date().toISOString();
      for (const b of bookings) {
        const syncedB: Booking = {
          ...b,
          sheetSyncStatus: 'Synced',
          sheetSyncedAt: now,
          sheetSyncError: undefined
        };
        if (onUpdateBooking) onUpdateBooking(syncedB);
        saveBookingToFirestore(syncedB).catch(console.error);
      }

      setDirectSyncProgress({
        active: false,
        success: true,
        message: `✓ Direct Google Sheets API Sync Complete! Processed ${result.total} records (${result.updated} updated, ${result.appended} appended).`
      });
    } catch (err: any) {
      console.error('Direct sync failed:', err);
      setDirectSyncProgress({
        active: false,
        success: false,
        message: err.message || 'Failed to sync with Google Sheets API'
      });
    }
  };

  // Handler: Preview Google Sheet Rows via API
  const handleFetchSheetPreview = async () => {
    if (!googleToken) {
      await handleGoogleSignIn();
      return;
    }

    setIsLoadingPreview(true);
    try {
      const res = await readGoogleSheetRows(googleToken, SPREADSHEET_ID, SHEET_GID);
      setSheetPreviewRows(res.rows);
    } catch (err: any) {
      console.error('Failed to preview sheet:', err);
      setDirectSyncProgress({
        active: false,
        success: false,
        message: `Could not fetch sheet rows: ${err.message}`
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Handler: Save Webhook / URL settings
  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: GoogleSheetsSyncConfig = {
      ...syncConfig,
      webhookUrl: webhookUrlInput.trim(),
      sheetUrl: sheetUrlInput.trim(),
      autoSyncOnSave: autoSyncInput
    };
    onUpdateSyncConfig(updated);
    await saveSyncConfigToFirestore(updated);
    setLiveSyncResult({ success: true, message: 'Google Sheets sync settings saved successfully!' });
  };

  // Handler: Trigger Webhook Sync (Secondary pipeline)
  const handleTriggerLiveSync = async () => {
    if (!webhookUrlInput.trim()) {
      setLiveSyncResult({ 
        success: false, 
        message: 'Please provide your Google Apps Script Web App URL first, or use the Direct Google Sign-In above.' 
      });
      return;
    }

    setIsSyncingLive(true);
    setLiveSyncResult(null);

    try {
      const res = await sendToGoogleSheetWebhook(webhookUrlInput.trim(), 'syncAll', {
        bookings
      });

      const updated: GoogleSheetsSyncConfig = {
        ...syncConfig,
        webhookUrl: webhookUrlInput.trim(),
        sheetUrl: sheetUrlInput.trim(),
        autoSyncOnSave: autoSyncInput,
        lastSyncedAt: new Date().toISOString(),
        lastSyncStatus: res.success ? 'success' : 'failed',
        lastSyncError: res.success ? undefined : res.message,
        totalSyncedCount: bookings.length
      };

      onUpdateSyncConfig(updated);
      await saveSyncConfigToFirestore(updated);

      if (res.success) {
        setLiveSyncResult({ 
          success: true, 
          message: `Live Webhook Sync Successful! All ${bookings.length} bookings pushed to your Google Sheet.` 
        });
      } else {
        setLiveSyncResult({ 
          success: false, 
          message: `Sync failed: ${res.message}` 
        });
      }
    } catch (err: any) {
      setLiveSyncResult({ 
        success: false, 
        message: err.message || 'Connection error with Google Sheet Webhook' 
      });
    } finally {
      setIsSyncingLive(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = exportBookingsToCSV(bookings);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MSD_Google_Sheets_Sync_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        processCSVText(text);
      }
    };
    reader.readAsText(file);
  };

  const processCSVText = (csvString: string) => {
    try {
      const parsed = parseGoogleSheetCSV(csvString, jodis);
      if (parsed.length === 0) {
        setImportStatus('No valid booking rows found in CSV.');
        return;
      }

      onImportBookings(parsed);
      setImportStatus(`Successfully synced and imported ${parsed.length} bookings from Google Sheet!`);
      setImportText('');
    } catch (err) {
      console.error(err);
      setImportStatus('Failed to parse CSV format. Please verify the 17 columns.');
    }
  };

  const googleAppsScriptCode = `/**
 * =========================================================================
 * MSD FACILITY SERVICES - REAL-TIME GOOGLE SHEETS SYNC SCRIPT
 * Target Sheet: ${SPREADSHEET_ID}
 * Target Tab GID: ${SHEET_GID}
 * =========================================================================
 */
var TARGET_SPREADSHEET_ID = "${SPREADSHEET_ID}";
var TARGET_GID = "${SHEET_GID}";

function getTargetSheet() {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
    }
  } catch(e) {
    ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
  }
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId().toString() === TARGET_GID) {
      return sheets[i];
    }
  }
  return ss.getActiveSheet();
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var sheet = getTargetSheet();

    if (data.action === 'syncAll' && data.bookings) {
      for (var i = 0; i < data.bookings.length; i++) {
        upsertBooking(sheet, data.bookings[i]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: data.bookings.length }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (data.booking) {
      var result = upsertBooking(sheet, data.booking);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", action: result.action, row: result.row, refNo: data.booking.refNo }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "ignored" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function upsertBooking(sheet, b) {
  var lastRow = sheet.getLastRow();
  var rowIndex = -1;

  if (lastRow > 1) {
    var refColumnValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (var r = 0; r < refColumnValues.length; r++) {
      var cellVal = (refColumnValues[r][0] || "").toString().trim();
      if (cellVal && cellVal.toLowerCase() === (b.refNo || "").toString().trim().toLowerCase()) {
        rowIndex = r + 2;
        break;
      }
    }
  }

  var staffDisplay = b.assignedStaff || "";
  if (b.assignedStaff2 && b.assignedStaff2.trim() && staffDisplay.indexOf(b.assignedStaff2) === -1) {
    staffDisplay = staffDisplay + " & " + b.assignedStaff2;
  }
  staffDisplay = staffDisplay.replace(/(&\\s*Team\\s*)+/gi, '& Team').trim();

  var staffPhone = b.staffCell || "7708779733";
  if (b.staffCell2 && b.staffCell2.trim() && b.staffCell2 !== staffPhone) {
    staffPhone = staffPhone + ", " + b.staffCell2;
  }

  var rowData = [
    b.timestamp || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "M/d/yyyy H:mm:ss"),
    b.refNo,
    b.customerName,
    b.customerCell,
    b.address,
    b.serviceDate,
    b.timeSlot,
    b.services + (b.serviceDescription ? " (" + b.serviceDescription + ")" : ""),
    staffDisplay,
    staffPhone,
    b.amount,
    b.jobStatus,
    b.customerMsg || "WhatsApp Customer",
    b.staffMsg || "WhatsApp Staff",
    "",
    "",
    ""
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, 14).setValues([rowData.slice(0, 14)]);
    return { action: "updated", row: rowIndex };
  } else {
    sheet.appendRow(rowData);
    return { action: "inserted", row: sheet.getLastRow() };
  }
}`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 text-slate-100">
      
      {/* Header card with Architecture Pipeline */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full mb-1 border border-emerald-500/30 font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Google Sheets API Integration</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Google Sheets Synchronization Hub
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${SHEET_GID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>Open Spreadsheet</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* GOOGLE SHEETS API AUTHENTICATION & DIRECT SYNC (PRIMARY) */}
        <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">
                  Google Workspace Direct API Access
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Authorized with OAuth scope <code className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded text-[11px]">https://www.googleapis.com/auth/spreadsheets</code>
              </p>
            </div>

            {/* Google Sign In / Out Button */}
            {googleToken ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected: {googleUser?.email || 'Google Account'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleGoogleSignOut}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Disconnect Google Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="gsi-material-button inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span>{isAuthenticating ? 'Connecting...' : 'Sign in with Google to Sync'}</span>
              </button>
            )}
          </div>

          {/* Sync actions using direct API */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleDirectSyncAll}
              disabled={directSyncProgress?.active}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${directSyncProgress?.active ? 'animate-spin' : ''}`} />
              <span>
                {directSyncProgress?.active 
                  ? 'Syncing to Google Sheets...' 
                  : `Sync All ${bookings.length} Bookings to Google Sheet (Tab GID: ${SHEET_GID})`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleFetchSheetPreview}
              disabled={isLoadingPreview || !googleToken}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Table className="w-4 h-4 text-emerald-400" />
              <span>{isLoadingPreview ? 'Reading Sheet...' : 'Inspect Live Sheet Data'}</span>
            </button>
          </div>

          {/* Direct Sync Status Message */}
          {directSyncProgress && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
              directSyncProgress.success 
                ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300' 
                : directSyncProgress.active
                ? 'bg-sky-950/80 border-sky-800/60 text-sky-300'
                : 'bg-rose-950/80 border-rose-800/60 text-rose-300'
            }`}>
              {directSyncProgress.active ? (
                <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-sky-400" />
              ) : directSyncProgress.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{directSyncProgress.message}</span>
            </div>
          )}

          {/* Live Sheet Data Table Preview */}
          {sheetPreviewRows && sheetPreviewRows.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Live Rows Found in Sheet ({sheetPreviewRows.length} total rows):</span>
                <button
                  type="button"
                  onClick={() => setSheetPreviewRows(null)}
                  className="text-slate-400 hover:text-white underline cursor-pointer text-[11px]"
                >
                  Hide Table
                </button>
              </div>
              <div className="overflow-x-auto max-h-60 border border-slate-800 rounded-xl scrollbar-thin bg-slate-900/90">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-950 text-slate-300 sticky top-0 border-b border-slate-800">
                    <tr>
                      {sheetPreviewRows[0]?.slice(0, 14).map((colName, idx) => (
                        <th key={idx} className="p-2 font-bold whitespace-nowrap border-r border-slate-800/50">
                          {colName || `Col ${idx + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                    {sheetPreviewRows.slice(1, 11).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/50">
                        {row.slice(0, 14).map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 whitespace-nowrap border-r border-slate-800/30">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sheetPreviewRows.length > 11 && (
                <p className="text-[10px] text-slate-500 italic">
                  Showing top 10 rows of {sheetPreviewRows.length - 1} data rows.
                </p>
              )}
            </div>
          )}
        </div>

        {/* VISUAL ARCHITECTURE PIPELINE */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Active Data Flow Architecture
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-center">
            {/* 1. Manager Mobile */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center space-y-1">
              <Smartphone className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-xs text-white">Manager Mobile</span>
              <span className="text-[10px] text-slate-400">Puducherry Hub</span>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center text-slate-600">
              <ArrowRight className="w-5 h-5 text-amber-400/70" />
            </div>

            {/* 2. Booking App & Firestore */}
            <div className="bg-slate-900 border border-amber-500/30 p-3 rounded-xl flex flex-col items-center justify-center space-y-1">
              <Database className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-xs text-white">Firestore DB</span>
              <span className="text-[10px] text-emerald-400 font-mono">Live Real-time</span>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center text-slate-600">
              <ArrowRight className="w-5 h-5 text-amber-400/70" />
            </div>

            {/* 3. Existing Google Sheet */}
            <div className="bg-slate-900 border border-emerald-500/30 p-3 rounded-xl flex flex-col items-center justify-center space-y-1">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-xs text-white">Your Google Sheet</span>
              <span className="text-[10px] text-slate-400">17 Columns Auto-Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* OPTIONAL WEBHOOK CONFIGURATION CARD */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Google Sheet Webhook (Optional Background Script)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Optionally configure an Apps Script Webhook to allow server-to-sheet background triggers when staff update statuses offline
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Google Apps Script Web App URL:
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={webhookUrlInput}
              onChange={(e) => setWebhookUrlInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSyncInput}
                onChange={(e) => setAutoSyncInput(e.target.checked)}
                className="w-4 h-4 rounded text-amber-400 bg-slate-950 border-slate-800 focus:ring-amber-400"
              />
              <span>Automatically push to Google Sheet when booking is added or updated</span>
            </label>
          </div>

          {liveSyncResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              liveSyncResult.success 
                ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300' 
                : 'bg-rose-950/80 border-rose-800/60 text-rose-300'
            }`}>
              {liveSyncResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{liveSyncResult.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              Save Webhook Settings
            </button>

            <button
              type="button"
              disabled={isSyncingLive || !webhookUrlInput.trim()}
              onClick={handleTriggerLiveSync}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin' : ''}`} />
              <span>{isSyncingLive ? 'Syncing...' : 'Test Webhook Push'}</span>
            </button>

            {syncConfig.lastSyncedAt && (
              <span className="text-[11px] text-slate-400 ml-auto">
                Last Synced: <strong>{new Date(syncConfig.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> ({syncConfig.totalSyncedCount || 0} rows)
              </span>
            )}
          </div>
        </form>
      </div>

      {/* APPS SCRIPT SETUP INSTRUCTIONS CARD */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">
              Google Apps Script Code (Optional Webhook Backup)
            </h3>
          </div>

          <button
            type="button"
            onClick={copyScriptToClipboard}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied Code!' : 'Copy Script'}</span>
          </button>
        </div>

        <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">
          <li>Open your existing Google Sheet (Spreadsheet ID: {SPREADSHEET_ID}).</li>
          <li>Click on <strong>Extensions &gt; Apps Script</strong> in the top menu.</li>
          <li>Paste this script, click <strong>Deploy &gt; New deployment</strong>, select type <strong>Web app</strong>.</li>
          <li>Set <em>Execute as</em>: <strong>Me</strong>, and <em>Who has access</em>: <strong>Anyone</strong>.</li>
          <li>Click <strong>Deploy</strong> and copy the Web App URL into the box above.</li>
        </ol>

        <div className="relative">
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-56 scrollbar-thin">
            {googleAppsScriptCode}
          </pre>
        </div>
      </div>

      {/* MANUAL CSV EXPORT & IMPORT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Export to Google Sheet */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm sm:text-base">
              Manual CSV Export to Google Sheet
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Download all {bookings.length} bookings as a clean CSV matching the 17 sheet columns.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Google Sheet CSV ({bookings.length} Rows)</span>
          </button>
        </div>

        {/* Import from Google Sheet */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 border border-blue-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm sm:text-base">
              Import Existing Google Sheet CSV
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload an exported CSV from your existing sheet to populate or merge your bookings.
            </p>
          </div>

          <label className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-center border border-slate-700">
            <Upload className="w-4 h-4" />
            <span>Choose CSV File to Import</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

      </div>

      {/* Paste CSV Directly */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
        <h3 className="font-bold text-sm text-white">
          Or Paste Existing Google Sheet Rows
        </h3>

        <textarea
          rows={3}
          placeholder="Paste rows copied from your Google Sheet here..."
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none text-white focus:border-amber-400"
        />

        {importStatus && (
          <div className="p-3 bg-slate-950 border border-emerald-800/60 text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!importText.trim()}
            onClick={() => processCSVText(importText)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
          >
            Import Pasted Records
          </button>
        </div>
      </div>

    </div>
  );
};
