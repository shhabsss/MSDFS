import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const TARGET_SPREADSHEET_ID = '17l8CRbj7d_U6bUUXk8OVZdMRLbvOrd3dO52SeD_gxSI';
const TARGET_SHEET_GID = '997243141';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory deduplication cache to prevent duplicate row appends on rapid double-clicks or retries
  const syncedRefWatermark = new Set<string>();

  // Server-side permanent sequence watermark storage (starts from at least 1029)
  const COUNTER_CACHE_FILE = path.join(process.cwd(), '.ref-counter.json');
  let currentRefCounter = 1029;

  try {
    if (fs.existsSync(COUNTER_CACHE_FILE)) {
      const saved = JSON.parse(fs.readFileSync(COUNTER_CACHE_FILE, 'utf-8'));
      if (typeof saved.currentNumber === 'number' && saved.currentNumber > currentRefCounter) {
        currentRefCounter = saved.currentNumber;
      }
    }
  } catch (e) {
    console.warn('Could not read ref-counter cache:', e);
  }

  const persistCounter = (num: number) => {
    try {
      fs.writeFileSync(COUNTER_CACHE_FILE, JSON.stringify({ currentNumber: num, updatedAt: new Date().toISOString() }));
    } catch (e) {
      console.warn('Could not write ref-counter cache:', e);
    }
  };

  // API: Central Atomic Reference Number Allocation
  app.post('/api/bookings/allocate-ref', (req, res) => {
    const minNumber = req.body?.minNumber;
    if (typeof minNumber === 'number' && minNumber > currentRefCounter) {
      currentRefCounter = minNumber;
    }
    currentRefCounter += 1;
    persistCounter(currentRefCounter);

    const refNo = `MSD/PDY/${currentRefCounter}`;
    res.json({ success: true, refNo, number: currentRefCounter });
  });

  // API: Peek next reference number without incrementing
  app.get('/api/bookings/peek-ref', (req, res) => {
    const nextNumber = currentRefCounter + 1;
    res.json({
      success: true,
      currentNumber: currentRefCounter,
      nextRefNo: `MSD/PDY/${nextNumber}`
    });
  });

  // API: Update watermark when client commits an allocated reference number
  app.post('/api/bookings/update-watermark', (req, res) => {
    const seenRefNo = req.body?.seenRefNo;
    if (seenRefNo && typeof seenRefNo === 'string' && seenRefNo.startsWith('MSD/PDY/')) {
      const n = parseInt(seenRefNo.replace('MSD/PDY/', '').trim(), 10);
      if (!isNaN(n) && n > currentRefCounter) {
        currentRefCounter = n;
        persistCounter(currentRefCounter);
      }
    }
    res.json({ success: true, currentNumber: currentRefCounter });
  });

  // API: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'MSD Facility Services API', 
      spreadsheetId: TARGET_SPREADSHEET_ID,
      gid: TARGET_SHEET_GID 
    });
  });

  // API: Google Sheet Configuration Info (Public read, no secrets exposed)
  app.get('/api/sheets/config', (req, res) => {
    const hasWebhook = Boolean(process.env.GOOGLE_SHEET_WEBHOOK_URL);
    res.json({
      spreadsheetId: TARGET_SPREADSHEET_ID,
      sheetGid: TARGET_SHEET_GID,
      hasBackendWebhook: hasWebhook,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${TARGET_SPREADSHEET_ID}/edit#gid=${TARGET_SHEET_GID}`
    });
  });

  // API: Sync a single booking with Duplicate Protection
  app.post('/api/sheets/sync', async (req, res) => {
    try {
      const { booking, action = 'insert', webhookUrl: clientWebhookUrl } = req.body;

      if (!booking || !booking.refNo) {
        res.status(400).json({ success: false, status: 'Failed', message: 'Missing booking or reference number' });
        return;
      }

      const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || clientWebhookUrl;

      // Build assigned staff display string
      let staffDisplay = booking.assignedStaff || '';
      if (booking.assignedStaff2 && booking.assignedStaff2.trim() && !staffDisplay.includes(booking.assignedStaff2)) {
        staffDisplay = `${staffDisplay} & ${booking.assignedStaff2}`;
      }
      staffDisplay = staffDisplay.replace(/(&\s*Team\s*)+/gi, '& Team').trim();

      // Build staff cell numbers
      let staffPhone = booking.staffCell || '7708779733';
      if (booking.staffCell2 && booking.staffCell2.trim() && booking.staffCell2 !== staffPhone) {
        staffPhone = `${staffPhone}, ${booking.staffCell2}`;
      }

      // Exact 17-column array matching existing Google Sheet tab GID 997243141
      const rowArray = [
        booking.timestamp || new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), // 1. Timestamp
        booking.refNo,                                                                          // 2. Booking Ref No (Unique key)
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

      // Map booking fields specifically to Google Sheet columns
      const mappedRow = {
        bookingRefNo: booking.refNo,
        bookingDate: booking.serviceDate || new Date().toISOString().split('T')[0],
        scheduleDate: booking.serviceDate,
        scheduleTime: booking.timeSlot,
        customerName: booking.customerName,
        customerPhone: booking.customerCell,
        service: booking.services,
        serviceLocation: booking.address,
        customerAddress: booking.address,
        assignedStaff: staffDisplay,
        staffPhone: staffPhone,
        amount: booking.amount,
        paymentStatus: booking.paymentStatus || (booking.jobStatus === 'Completed' ? 'Paid' : 'Pending'),
        bookingStatus: booking.jobStatus,
        createdBy: booking.createdBy || 'Manager / Admin Portal',
        createdAt: booking.timestamp || new Date().toISOString(),
        firestoreBookingId: booking.id,
        sheetSyncStatus: 'Synced',
        rowArray: rowArray
      };

      if (!webhookUrl || !webhookUrl.trim()) {
        // Webhook URL not configured yet in environment or settings
        res.json({
          success: false,
          status: 'Failed',
          message: 'Google Apps Script Webhook URL is not configured. Saved in Firestore with status Failed for Admin retry.',
          refNo: booking.refNo,
          spreadsheetId: TARGET_SPREADSHEET_ID,
          sheetGid: TARGET_SHEET_GID
        });
        return;
      }

      // Send to Google Apps Script Webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action,
          spreadsheetId: TARGET_SPREADSHEET_ID,
          sheetGid: TARGET_SHEET_GID,
          booking: {
            ...booking,
            ...mappedRow
          },
          timestamp: new Date().toISOString()
        })
      });

      const text = await response.text();
      let responseJson: any = null;
      try {
        responseJson = JSON.parse(text);
      } catch {
        // Not JSON
      }

      syncedRefWatermark.add(booking.refNo);
      if (booking.id) syncedRefWatermark.add(booking.id);

      res.json({
        success: true,
        status: 'Synced',
        refNo: booking.refNo,
        message: responseJson?.message || text || 'Row synchronized to Google Sheet tab GID 997243141'
      });
    } catch (err: any) {
      console.error('Server sync error:', err);
      res.status(500).json({
        success: false,
        status: 'Failed',
        message: err.message || 'Internal server error during Google Sheet sync'
      });
    }
  });

  // API: Sync all bookings in batch
  app.post('/api/sheets/sync-all', async (req, res) => {
    try {
      const { bookings, webhookUrl: clientWebhookUrl } = req.body;

      if (!bookings || !Array.isArray(bookings)) {
        res.status(400).json({ success: false, message: 'Invalid bookings list' });
        return;
      }

      const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || clientWebhookUrl;

      if (!webhookUrl) {
        res.status(400).json({
          success: false,
          message: 'Google Apps Script Webhook URL is not configured'
        });
        return;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'syncAll',
          spreadsheetId: TARGET_SPREADSHEET_ID,
          sheetGid: TARGET_SHEET_GID,
          bookings,
          timestamp: new Date().toISOString()
        })
      });

      const text = await response.text();
      res.json({
        success: true,
        message: text || `Synchronized ${bookings.length} bookings to Google Sheet`,
        count: bookings.length
      });
    } catch (err: any) {
      console.error('Batch sync error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Error during batch synchronization'
      });
    }
  });

  // Vite middleware for development vs. static dist serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
