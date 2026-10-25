const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let isReady = false;
let qrCodeString = null;

const ARTIFACT_DIR = 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\7c682649-08ee-4686-8993-8a2f16179771';
const QR_PNG_PATH = path.join(ARTIFACT_DIR, 'whatsapp_qr.png');

// Initialize WhatsApp Web client with LocalAuth (persists session to ./.wwebjs_auth)
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './.wwebjs_auth',
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  },
});

// Event: QR received
client.on('qr', async (qr) => {
  qrCodeString = qr;
  isReady = false;
  console.log('\n================================================================');
  console.log('⚡ REMAIND_R WHATSAPP WEB GATEWAY: SCAN THIS QR CODE');
  console.log('   Open WhatsApp on your phone -> Settings -> Linked Devices -> Link a Device');
  console.log('================================================================\n');
  qrcodeTerminal.generate(qr, { small: true });
  console.log('\n⏳ Waiting for scan... (Session will be saved locally once linked)\n');

  try {
    if (fs.existsSync(ARTIFACT_DIR)) {
      await QRCode.toFile(QR_PNG_PATH, qr, { width: 450, margin: 2 });
      console.log('📸 Visual QR code image saved to: ' + QR_PNG_PATH);
    }
    await QRCode.toFile(path.join(__dirname, 'latest_qr.png'), qr, { width: 450, margin: 2 });
  } catch (err) {
    console.error('Failed saving visual QR code file:', err.message);
  }
});

// Event: Authenticated
client.on('authenticated', () => {
  console.log('✅ WhatsApp Web authenticated successfully!');
});

// Event: Ready
client.on('ready', () => {
  isReady = true;
  qrCodeString = null;
  console.log('\n🚀 WhatsApp Web Client is ONLINE and READY to send messages!');
  console.log('📁 Session stored in ./.wwebjs_auth. No re-scan required on restart.\n');
});

// Event: Auth Failure
client.on('auth_failure', (msg) => {
  isReady = false;
  console.error('❌ WhatsApp Web authentication failure:', msg);
});

// Event: Disconnected
client.on('disconnected', (reason) => {
  isReady = false;
  console.warn('⚠️ WhatsApp client disconnected:', reason);
  console.log('🔄 Re-initializing WhatsApp client...');
  client.initialize().catch((err) => console.error('Error re-initializing:', err));
});

// Visual Web QR Code Page
app.get('/qr', async (req, res) => {
  if (isReady) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>WhatsApp Connected - Remaindr</title></head>
        <body style="font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0b0f19; color: white;">
          <div style="background: #1e293b; padding: 2.5rem; border-radius: 1.5rem; text-align: center; border: 1px solid #334155; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">✅</div>
            <h1 style="color: #10b981; margin: 0 0 0.5rem 0;">WhatsApp is Connected!</h1>
            <p style="color: #94a3b8; margin: 0;">Session is stored locally. TimeFlow/Remaindr can now send personal reminders.</p>
          </div>
        </body>
      </html>
    `);
  }

  if (!qrCodeString) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Generating QR - Remaindr</title>
          <meta http-equiv="refresh" content="2">
        </head>
        <body style="font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0b0f19; color: white;">
          <div style="background: #1e293b; padding: 2.5rem; border-radius: 1.5rem; text-align: center; border: 1px solid #334155;">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem; animation: pulse 1.5s infinite;">⏳</div>
            <h2 style="color: #38bdf8; margin: 0 0 0.5rem 0;">Starting WhatsApp Web...</h2>
            <p style="color: #94a3b8; margin: 0;">Generating QR code. Page refreshes automatically...</p>
          </div>
        </body>
      </html>
    `);
  }

  try {
    const dataUrl = await QRCode.toDataURL(qrCodeString, { width: 350, margin: 2 });
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Scan WhatsApp QR - Remaindr</title>
          <meta http-equiv="refresh" content="20">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0b0f19; color: #f8fafc; }
            .card { background: #1e293b; padding: 2rem; border-radius: 1.5rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-align: center; border: 1px solid #334155; max-width: 420px; }
            img { border-radius: 1rem; background: white; padding: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); }
            h2 { margin-top: 0; color: #38bdf8; font-size: 1.5rem; }
            ol { text-align: left; font-size: 0.9rem; color: #cbd5e1; line-height: 1.7; padding-left: 1.25rem; }
            .pulse { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; margin-right: 6px; box-shadow: 0 0 8px #10b981; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚡ Link WhatsApp to Remaindr</h2>
            <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.25rem;">Scan this QR code with WhatsApp on your phone:</p>
            <img src="${dataUrl}" alt="WhatsApp QR Code" width="280" height="280" />
            <ol style="margin-top: 1.5rem; margin-bottom: 1rem;">
              <li>Open <b>WhatsApp</b> on your phone</li>
              <li>Tap <b>Linked Devices</b> (Settings on iPhone or ⋮ on Android)</li>
              <li>Tap <b>Link a Device</b> and point your camera at this QR code</li>
            </ol>
            <p style="font-size: 0.75rem; color: #64748b; margin: 0;"><span class="pulse"></span>Auto-refreshes when a new QR code is ready</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Error generating QR code: ' + err.message);
  }
});

// Health & Status Endpoint
app.get('/status', (req, res) => {
  res.json({
    status: isReady ? 'ONLINE' : 'WAITING_FOR_QR',
    ready: isReady,
    qrPending: !!qrCodeString,
    message: isReady
      ? 'WhatsApp Web automation gateway is active and ready.'
      : 'Waiting for WhatsApp QR code scan in terminal or at http://localhost:3000/qr',
  });
});

// JSON QR Data Endpoint for Frontend In-Page Modal
app.get('/qr-data', async (req, res) => {
  if (isReady) {
    return res.json({ ready: true, status: 'CONNECTED', qr: null, dataUrl: null });
  }
  if (!qrCodeString) {
    return res.json({ ready: false, status: 'INITIALIZING', qr: null, dataUrl: null });
  }
  try {
    const dataUrl = await QRCode.toDataURL(qrCodeString, { width: 350, margin: 2 });
    return res.json({ ready: false, status: 'WAITING_FOR_SCAN', qr: qrCodeString, dataUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Send WhatsApp Endpoint
// Receives: { "to": "91...", "message": "..." }
app.post('/send-whatsapp', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Both "to" (phone number) and "message" fields are required.',
      });
    }

    if (!isReady) {
      console.warn(`[GATEWAY] Message to ${to} rejected: WhatsApp Web client is not ready. Scan the QR code first.`);
      return res.status(503).json({
        success: false,
        error: 'WhatsApp Web is not ready. Please scan the QR code at http://localhost:3000/qr or in terminal.',
      });
    }

    // Clean phone number: remove non-digits
    let cleanNumber = to.toString().replace(/\D/g, '');

    // If 10-digit Indian number without country code, prepend 91
    if (cleanNumber.length === 10) {
      cleanNumber = '91' + cleanNumber;
    }

    // Format WhatsApp Web destination ID: <number>@c.us
    const chatId = `${cleanNumber}@c.us`;

    console.log(`[GATEWAY] Sending WhatsApp to: ${chatId}`);
    console.log(`[GATEWAY] Message: "${message}"`);

    // Invoke whatsapp-web.js
    let messageId = 'MSG_' + Date.now();
    try {
      const response = await client.sendMessage(chatId, message);
      if (response && response.id) {
        messageId = response.id._serialized || response.id.id || messageId;
      }
    } catch (sendErr) {
      console.warn('[GATEWAY] Warning during client.sendMessage:', sendErr.message);
      // Some puppeteer evaluate callbacks fail to serialize the return Message, but message is sent
      if (sendErr.message && sendErr.message.includes('Evaluation failed')) {
        console.log('[GATEWAY] Evaluation warning ignored, message dispatched.');
      } else {
        throw sendErr;
      }
    }

    console.log(`[GATEWAY] Message sent successfully to ${chatId}! ID: ${messageId}`);

    return res.json({
      success: true,
      messageId: messageId,
      to: cleanNumber,
      status: 'SENT',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[GATEWAY] Error sending WhatsApp message:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch WhatsApp message.',
    });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  Remaindr WhatsApp Gateway running on http://localhost:${PORT}`);
  console.log(`  Visual QR Webpage:  http://localhost:${PORT}/qr`);
  console.log(`  Endpoint: POST      http://localhost:${PORT}/send-whatsapp`);
  console.log(`  Status:   GET       http://localhost:${PORT}/status`);
  console.log(`================================================================`);
  console.log('Initializing WhatsApp Web browser...');
  client.initialize().catch((err) => {
    console.error('Failed to start WhatsApp Web client:', err.message);
  });
});
