import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// Load .env file into process.env if present
try {
    const envPath = path.resolve('.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach((line) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx !== -1) {
                    const key = trimmed.substring(0, eqIdx).trim();
                    let val = trimmed.substring(eqIdx + 1).trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.substring(1, val.length - 1);
                    }
                    if (process.env[key] === undefined) {
                        process.env[key] = val;
                    }
                }
            }
        });
    }
} catch (e) {
    console.warn('[WA Gateway] Could not load .env:', e.message);
}

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
async function connectToWhatsApp(sessionId, targetPhone = null, forceFresh = false) {
    const session = getSessionData(sessionId);
    const sessionPath = path.join(SESSIONS_DIR, sessionId);

    if (!forceFresh && session.socket && session.status === 'connected') {
        return session;
    }

    // Clean up any running socket before creating a new one
    if (session.socket) {
        try {
            session.socket.end(undefined);
        } catch (e) {}
        session.socket = null;
    }

    // Only wipe directory when explicitly requested by user (forceFresh = true)
    // NEVER wipe when forceFresh is false (such as on 515 restartRequired during pairing)!
    if (forceFresh) {
        try {
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
            }
        } catch (e) {
            console.error('[WA Gateway] Failed to reset session directory:', e.message);
        }
    }

    session.status = 'connecting';
    if (forceFresh) {
        session.qrCode = null;
        session.pairingCode = null;
    }
    session.lastUpdated = new Date().toISOString();

    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();
        const logger = pino({ level: 'silent' });

        const sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            logger,
            printQRInTerminal: false,
            browser: Browsers.ubuntu('Chrome'),
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            markOnlineOnConnect: true,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 25000,
            retryRequestDelayMs: 250,
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
                const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403;
                const isRestartRequired = statusCode === DisconnectReason.restartRequired || statusCode === 515;

                console.log(`[WA Gateway] Session ${sessionId} closed. Reason: ${statusCode}`);

                if (isLoggedOut) {
                    session.status = 'disconnected';
                    session.phone = null;
                    session.qrCode = null;
                    session.pairingCode = null;
                    session.socket = null;
                    try {
                        if (fs.existsSync(sessionPath)) {
                            fs.rmSync(sessionPath, { recursive: true, force: true });
                        }
                    } catch (e) {}
                } else if (isRestartRequired) {
                    // CRITICAL: When scanning QR, WhatsApp sends 515 (restartRequired) to complete key handshake!
                    // We must reconnect IMMEDIATELY with the same auth state (forceFresh = false)!
                    console.log(`[WA Gateway] Restart required (code 515) during pairing for ${sessionId}. Reconnecting immediately to finish link...`);
                    session.status = 'connecting';
                    setTimeout(() => connectToWhatsApp(sessionId, null, false), 500);
                } else if (session.status === 'connected' || session.phone) {
                    // Reconnect for active authenticated sessions
                    session.status = 'connecting';
                    setTimeout(() => connectToWhatsApp(sessionId, null, false), 3000);
                } else {
                    // Timeout or cancellation before scan
                    session.status = 'disconnected';
                    session.socket = null;
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
                    try {
                        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
                        if (creds.registered) {
                            console.log(`[WA Gateway] Restoring saved session: ${entry.name}...`);
                            await connectToWhatsApp(entry.name);
                        } else {
                            // Clean up unregistered stale files
                            fs.rmSync(path.join(SESSIONS_DIR, entry.name), { recursive: true, force: true });
                        }
                    } catch (e) {
                        try {
                            fs.rmSync(path.join(SESSIONS_DIR, entry.name), { recursive: true, force: true });
                        } catch (err) {}
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
 * Get all active sessions in memory
 */
app.get('/api/wa/sessions', (req, res) => {
    const list = {};
    for (const [id, session] of sessions.entries()) {
        list[id] = {
            id,
            status: session.status,
            phone: session.phone,
            pushName: session.pushName,
            qrCode: session.qrCode,
            pairingCode: session.pairingCode,
            lastUpdated: session.lastUpdated,
        };
    }
    res.json({
        ok: true,
        sessions: list,
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
    const { phone, forceFresh } = req.body || {};

    try {
        const session = await connectToWhatsApp(sessionId, phone, forceFresh !== undefined ? forceFresh : true);

        // Wait up to 3500ms for QR code or connected status so response contains qrCode directly
        let waited = 0;
        while (!session.qrCode && session.status !== 'connected' && waited < 3500) {
            await new Promise((r) => setTimeout(r, 200));
            waited += 200;
        }

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
 * Request Pairing Code with clean session reset if switching number
 */
async function requestPairingCodeForSession(sessionId, targetPhone) {
    const session = await connectToWhatsApp(sessionId, targetPhone, true);

    let waited = 0;
    while (!session.pairingCode && session.status !== 'connected' && waited < 7500) {
        await new Promise((r) => setTimeout(r, 250));
        waited += 250;
    }

    if (!session.pairingCode && session.status !== 'connected') {
        throw new Error('Gagal meminta kode pairing dari WhatsApp. Silakan periksa format nomor dan coba lagi.');
    }

    return session.pairingCode;
}

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
        const code = await requestPairingCodeForSession(sessionId, phone);
        res.json({
            ok: true,
            sessionId,
            status: 'pairing_ready',
            pairingCode: code,
        });
    } catch (err) {
        console.error('[WA Gateway] Pairing code error:', err.message);
        res.status(500).json({ ok: false, error: 'Gagal meminta kode pairing: ' + err.message });
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
 * Remove session entirely
 */
app.delete('/api/wa/session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        if (sessions.has(sessionId)) {
            const session = sessions.get(sessionId);
            if (session.socket) {
                try {
                    await session.socket.logout();
                } catch (e) {}
                session.socket = null;
            }
            sessions.delete(sessionId);
        }
        const sessionPath = path.join(SESSIONS_DIR, sessionId);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
        res.json({ ok: true, message: 'Session removed' });
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
