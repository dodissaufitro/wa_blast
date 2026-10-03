import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.WA_PORT || 3001;

// Global process error catchers to keep daemon alive 24/7
process.on('uncaughtException', (err) => {
    console.error('[WA Gateway] Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('[WA Gateway] Unhandled Rejection:', reason);
});

app.use(cors());
app.use(express.json());

const SESSIONS_DIR = path.resolve('storage/wa_sessions');
if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// In-memory sessions store
const sessions = new Map();

/**
 * Get or initialize session state holder
 */
function getSessionData(sessionId) {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
            id: sessionId,
            socket: null,
            status: 'disconnected', // 'disconnected' | 'connecting' | 'qr_ready' | 'connected'
            qrCode: null,
            pairingCode: null,
            phone: null,
            pushName: null,
            lastUpdated: new Date().toISOString(),
        });
    }
    return sessions.get(sessionId);
}

/**
 * Initialize / Connect WhatsApp Socket
 */
async function connectToWhatsApp(sessionId, targetPhone = null) {
    const session = getSessionData(sessionId);
    const sessionPath = path.join(SESSIONS_DIR, sessionId);

    if (session.socket && session.status === 'connected') {
        return session;
    }

    session.status = 'connecting';
    session.lastUpdated = new Date().toISOString();

    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const logger = pino({ level: 'silent' });

        const sock = makeWASocket({
            auth: state,
            logger,
            printQRInTerminal: false,
            browser: Browsers.macOS('WABlast Pro'),
            generateHighQualityLinkPreview: true,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 25000,
        });

        session.socket = sock;

        // Credentials save handler
        sock.ev.on('creds.update', saveCreds);

        // Connection update handler (QR generation & connection state)
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                try {
                    const qrDataUrl = await QRCode.toDataURL(qr, {
                        width: 320,
                        margin: 2,
                        color: {
                            dark: '#075E54',
                            light: '#ffffff',
                        },
                    });
                    session.qrCode = qrDataUrl;
                    session.status = 'qr_ready';
                    session.lastUpdated = new Date().toISOString();
                    console.log(`[WA Gateway] QR generated successfully for: ${sessionId}`);
                } catch (qrErr) {
                    console.error('[WA Gateway] QR conversion error:', qrErr);
                }
            }

            if (connection === 'open') {
                session.status = 'connected';
                session.qrCode = null;
                session.pairingCode = null;

                const jid = sock.user?.id || '';
                const phone = jid.split(':')[0] || jid.split('@')[0];
                session.phone = phone;
                session.pushName = sock.user?.name || 'Nomor WhatsApp Anda';
                session.lastUpdated = new Date().toISOString();

                console.log(`[WA Gateway] >>> SUCCESS! Connected session: ${sessionId} (+${phone}) <<<`);
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                console.log(`[WA Gateway] Session ${sessionId} closed. Reason: ${statusCode}. Reconnecting: ${shouldReconnect}`);

                if (statusCode === DisconnectReason.loggedOut) {
                    session.status = 'disconnected';
                    session.phone = null;
                    session.qrCode = null;
                    session.pairingCode = null;
                    session.socket = null;
                    try {
                        fs.rmSync(sessionPath, { recursive: true, force: true });
                    } catch (e) {}
                } else {
                    session.status = 'connecting';
                    setTimeout(() => connectToWhatsApp(sessionId), 4000);
                }
            }
        });

        // Optional pairing code request (alternative to QR code)
        if (targetPhone && !sock.authState.creds.registered) {
            setTimeout(async () => {
                try {
                    let cleaned = targetPhone.replace(/[^0-9]/g, '');
                    if (cleaned.startsWith('0')) {
                        cleaned = '62' + cleaned.slice(1);
                    } else if (!cleaned.startsWith('62') && cleaned.startsWith('8')) {
                        cleaned = '62' + cleaned;
                    }
                    const code = await sock.requestPairingCode(cleaned);
                    session.pairingCode = code;
                    session.lastUpdated = new Date().toISOString();
                    console.log(`[WA Gateway] Pairing code for +${cleaned}: ${code}`);
                } catch (pairErr) {
                    console.error('[WA Gateway] Pairing code error:', pairErr.message);
                }
            }, 2500);
        }

        return session;
    } catch (err) {
        console.error('[WA Gateway] Connection initialization error:', err);
        session.status = 'disconnected';
        throw err;
    }
}

/**
 * Auto-restore any previously connected sessions on server boot
 */
async function autoRestoreSavedSessions() {
    try {
        if (!fs.existsSync(SESSIONS_DIR)) return;
        const entries = fs.readdirSync(SESSIONS_DIR, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const credsPath = path.join(SESSIONS_DIR, entry.name, 'creds.json');
                if (fs.existsSync(credsPath)) {
                    console.log(`[WA Gateway] Restoring saved session: ${entry.name}...`);
                    try {
                        await connectToWhatsApp(entry.name);
                    } catch (e) {
                        console.error(`[WA Gateway] Failed to restore session ${entry.name}:`, e.message);
                    }
                }
            }
        }
    } catch (err) {
        console.error('[WA Gateway] Error during auto-restore:', err.message);
    }
}
autoRestoreSavedSessions();

// ----------------- API ROUTES ----------------- //

/**
 * Health check
 */
app.get('/api/wa/health', (req, res) => {
    res.json({
        ok: true,
        service: 'WABlast Pro WhatsApp Gateway',
        activeSessions: sessions.size,
        timestamp: new Date().toISOString(),
    });
});

/**
 * Get device/session status
 */
app.get('/api/wa/status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = getSessionData(sessionId);

    res.json({
        ok: true,
        sessionId: session.id,
        status: session.status,
        phone: session.phone,
        pushName: session.pushName,
        qrCode: session.qrCode,
        pairingCode: session.pairingCode,
        lastUpdated: session.lastUpdated,
    });
});

/**
 * Start connecting session and generate QR Code
 */
app.post('/api/wa/connect/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const { phone } = req.body || {};

    try {
        const session = await connectToWhatsApp(sessionId, phone);
        res.json({
            ok: true,
            sessionId: session.id,
            status: session.status,
            qrCode: session.qrCode,
            phone: session.phone,
            pairingCode: session.pairingCode,
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/**
 * Request Pairing Code by Phone Number
 */
app.post('/api/wa/pairing-code/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const { phone } = req.body || {};

    if (!phone) {
        return res.status(400).json({ ok: false, error: 'Nomor WhatsApp wajib diisi' });
    }

    try {
        const session = await connectToWhatsApp(sessionId, phone);
        res.json({
            ok: true,
            sessionId: session.id,
            status: session.status,
            pairingCode: session.pairingCode,
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/**
 * Disconnect / Logout
 */
app.post('/api/wa/disconnect/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const session = getSessionData(sessionId);

    try {
        if (session.socket) {
            await session.socket.logout();
        }
        session.status = 'disconnected';
        session.phone = null;
        session.qrCode = null;
        session.pairingCode = null;
        session.socket = null;

        const sessionPath = path.join(SESSIONS_DIR, sessionId);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }

        res.json({ ok: true, message: 'Session disconnected successfully' });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/**
 * Send real WhatsApp message
 */
app.post('/api/wa/send-message', async (req, res) => {
    const { sessionId, phone, message } = req.body;

    if (!sessionId || !phone || !message) {
        return res.status(400).json({ ok: false, error: 'sessionId, phone, dan message wajib diisi.' });
    }

    const session = getSessionData(sessionId);
    if (!session.socket || session.status !== 'connected') {
        return res.status(400).json({ ok: false, error: 'Device WhatsApp belum terhubung. Silakan scan QR terlebih dahulu.' });
    }

    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
    else if (cleaned.startsWith('8')) cleaned = '62' + cleaned;

    const jid = `${cleaned}@s.whatsapp.net`;

    try {
        const sent = await session.socket.sendMessage(jid, { text: message });
        res.json({
            ok: true,
            messageId: sent.key.id,
            status: 'sent',
            to: cleaned,
        });
    } catch (err) {
        console.error('[WA Gateway] Failed to send message:', err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

/**
 * Get real WhatsApp profile picture of a recipient
 */
app.get('/api/wa/profile-picture/:sessionId/:phone', async (req, res) => {
    const { sessionId, phone } = req.params;
    const session = getSessionData(sessionId);

    if (!session.socket || session.status !== 'connected') {
        return res.status(400).json({ ok: false, error: 'Device not connected' });
    }

    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
    else if (cleaned.startsWith('8')) cleaned = '62' + cleaned;

    const jid = `${cleaned}@s.whatsapp.net`;

    try {
        const ppUrl = await session.socket.profilePictureUrl(jid, 'image');
        res.json({ ok: true, phone: cleaned, url: ppUrl });
    } catch (err) {
        res.json({ ok: false, phone: cleaned, error: err?.message || 'Profile picture not available' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[WA Gateway] WABlast Pro WhatsApp Multi-Device Gateway running on http://localhost:${PORT}`);
});
