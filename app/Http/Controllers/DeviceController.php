<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppDevice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DeviceController extends Controller
{
    protected string $gatewayUrl;
    protected int $port;
    protected int $timeout;
    protected string $sessionPrefix;

    public function __construct()
    {
        $this->gatewayUrl = rtrim(config('whatsapp.gateway_url', 'http://127.0.0.1:3001'), '/');
        $this->port = (int) config('whatsapp.port', 3001);
        $this->timeout = (int) config('whatsapp.timeout', 30);
        $this->sessionPrefix = config('whatsapp.session_prefix', 'user_');
    }

    /**
     * Get or create default device for user if none exists
     */
    protected function ensureUserHasDevice($user): void
    {
        if ($user->devices()->count() === 0) {
            $user->devices()->create([
                'name' => 'WhatsApp 1 (Utama)',
                'session_id' => $this->sessionPrefix . $user->id,
                'is_default' => true,
                'status' => 'disconnected',
            ]);
        }
    }

    /**
     * Resolve target WhatsApp device for user
     */
    protected function resolveDevice(Request $request, $id = null): ?WhatsAppDevice
    {
        $user = $request->user();
        $this->ensureUserHasDevice($user);

        if ($id) {
            return $user->devices()->where('id', $id)->first();
        }

        if ($reqId = $request->input('device_id') ?? $request->query('device_id')) {
            return $user->devices()->where('id', $reqId)->first();
        }

        if ($reqSession = $request->input('session_id') ?? $request->query('session_id')) {
            return $user->devices()->where('session_id', $reqSession)->first();
        }

        return $user->devices()->where('is_default', true)->first()
            ?? $user->devices()->orderBy('id')->first();
    }

    /**
     * List all user devices with live gateway sync
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->ensureUserHasDevice($user);

        $devices = $user->devices()->orderBy('id')->get();

        // Fetch live sessions status from Node.js Gateway
        try {
            $res = Http::timeout(3)->get("{$this->gatewayUrl}/api/wa/sessions");
            if ($res->successful()) {
                $liveSessions = $res->json('sessions', []);
                foreach ($devices as $dev) {
                    if (isset($liveSessions[$dev->session_id])) {
                        $info = $liveSessions[$dev->session_id];
                        $changed = false;
                        if ($dev->status !== $info['status']) {
                            $dev->status = $info['status'];
                            $changed = true;
                        }
                        if (!empty($info['phone']) && $dev->phone !== $info['phone']) {
                            $dev->phone = $info['phone'];
                            $changed = true;
                        }
                        if (!empty($info['pushName']) && $dev->push_name !== $info['pushName']) {
                            $dev->push_name = $info['pushName'];
                            $changed = true;
                        }
                        if ($changed) {
                            $dev->save();
                        }
                        $dev->qrCode = $info['qrCode'] ?? null;
                        $dev->pairingCode = $info['pairingCode'] ?? null;
                    }
                }
            }
        } catch (\Throwable $e) {
            // Gateway might be restarting or offline
        }

        return response()->json([
            'ok' => true,
            'devices' => $devices,
        ]);
    }

    /**
     * Create a new WhatsApp device slot
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();
        $this->ensureUserHasDevice($user);

        $count = $user->devices()->count();
        $name = trim($request->input('name') ?? '') ?: ('WhatsApp ' . ($count + 1));
        $sessionId = $this->sessionPrefix . $user->id . '_dev_' . substr(bin2hex(random_bytes(4)), 0, 8);

        $device = $user->devices()->create([
            'name' => $name,
            'session_id' => $sessionId,
            'status' => 'disconnected',
            'is_default' => false,
        ]);

        return response()->json([
            'ok' => true,
            'device' => $device,
            'message' => "Slot perangkat '{$name}' berhasil ditambahkan.",
        ]);
    }

    /**
     * Rename or update device
     */
    public function update(Request $request, $id): JsonResponse
    {
        $device = $request->user()->devices()->findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $device->update([
            'name' => $request->input('name'),
        ]);

        return response()->json([
            'ok' => true,
            'device' => $device,
        ]);
    }

    /**
     * Delete device and remove its session from gateway
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $device = $request->user()->devices()->findOrFail($id);

        // Tell gateway to logout and wipe directory
        try {
            Http::timeout(5)->delete("{$this->gatewayUrl}/api/wa/session/{$device->session_id}");
        } catch (\Throwable $e) {}

        $device->delete();

        return response()->json([
            'ok' => true,
            'message' => 'Perangkat WhatsApp berhasil dihapus.',
        ]);
    }

    /**
     * Get connection and QR code status for a device
     */
    public function status(Request $request, $id = null): JsonResponse
    {
        $device = $this->resolveDevice($request, $id);
        if (!$device) {
            return response()->json(['ok' => false, 'error' => 'Perangkat tidak ditemukan'], 404);
        }

        try {
            $response = Http::timeout(3)->get("{$this->gatewayUrl}/api/wa/status/{$device->session_id}");

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['status'])) {
                    $device->status = $data['status'];
                    if (!empty($data['phone'])) $device->phone = $data['phone'];
                    if (!empty($data['pushName'])) $device->push_name = $data['pushName'];
                    $device->save();
                }

                $data['device'] = $device;
                return response()->json($data);
            }

            return response()->json([
                'ok' => false,
                'status' => 'disconnected',
                'device' => $device,
                'message' => 'Gagal mengambil status perangkat dari gateway',
            ], 500);
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'status' => 'gateway_offline',
                'device' => $device,
                'message' => "Layanan background WhatsApp Gateway (wa-server.js) belum aktif di port {$this->port}.",
            ]);
        }
    }

    /**
     * Request connection and generate QR code for a device
     */
    public function connect(Request $request, $id = null): JsonResponse
    {
        $device = $this->resolveDevice($request, $id);
        if (!$device) {
            return response()->json(['ok' => false, 'error' => 'Perangkat tidak ditemukan'], 404);
        }

        try {
            $response = Http::timeout(15)->post("{$this->gatewayUrl}/api/wa/connect/{$device->session_id}", [
                'phone' => $request->input('phone'),
            ]);

            $data = $response->json();
            $data['device'] = $device;
            return response()->json($data);
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'error' => 'Tidak dapat terhubung ke server WhatsApp Gateway: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Request pairing code with phone number for a device
     */
    public function pairingCode(Request $request, $id = null): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
        ]);

        $device = $this->resolveDevice($request, $id);
        if (!$device) {
            return response()->json(['ok' => false, 'error' => 'Perangkat tidak ditemukan'], 404);
        }

        try {
            $response = Http::timeout($this->timeout)->post("{$this->gatewayUrl}/api/wa/pairing-code/{$device->session_id}", [
                'phone' => $request->input('phone'),
            ]);

            $data = $response->json();
            $data['device'] = $device;
            return response()->json($data, $response->status());
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'error' => 'Gagal meminta kode pairing: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Disconnect / Logout WhatsApp session for a device
     */
    public function disconnect(Request $request, $id = null): JsonResponse
    {
        $device = $this->resolveDevice($request, $id);
        if (!$device) {
            return response()->json(['ok' => false, 'error' => 'Perangkat tidak ditemukan'], 404);
        }

        try {
            $response = Http::timeout(5)->post("{$this->gatewayUrl}/api/wa/disconnect/{$device->session_id}");
            $device->update(['status' => 'disconnected', 'phone' => null, 'push_name' => null]);
            return response()->json($response->json());
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'error' => 'Gagal memutuskan koneksi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send actual WhatsApp message through linked device (or auto round-robin if specified)
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
            'message' => ['required', 'string'],
            'device_id' => ['nullable'],
        ]);

        $user = $request->user();
        $targetDeviceId = $request->input('device_id');

        $device = null;
        if ($targetDeviceId && is_numeric($targetDeviceId)) {
            $device = $user->devices()->where('id', $targetDeviceId)->first();
        }

        // If not specified or round-robin, pick a connected device
        if (!$device) {
            $connectedDevices = $user->devices()->where('status', 'connected')->get();
            if ($connectedDevices->isNotEmpty()) {
                // Round-robin or random among connected devices
                $device = $connectedDevices->random();
            } else {
                $device = $this->resolveDevice($request);
            }
        }

        if (!$device) {
            return response()->json(['ok' => false, 'error' => 'Tidak ada perangkat WhatsApp yang aktif'], 400);
        }

        try {
            $response = Http::timeout($this->timeout)->post("{$this->gatewayUrl}/api/wa/send-message", [
                'sessionId' => $device->session_id,
                'phone' => $request->input('phone'),
                'message' => $request->input('message'),
            ]);

            $resData = $response->json();
            $resData['used_device'] = [
                'id' => $device->id,
                'name' => $device->name,
                'phone' => $device->phone,
            ];

            return response()->json($resData, $response->status());
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'error' => 'Gagal mengirim pesan WhatsApp: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Proxy WhatsApp profile picture fetch from any connected device
     */
    public function profilePicture(Request $request): JsonResponse
    {
        $phone = $request->query('phone');
        if (!$phone) {
            return response()->json(['ok' => false, 'error' => 'Nomor HP diperlukan'], 400);
        }

        $user = $request->user();
        // Use any connected device
        $device = $user->devices()->where('status', 'connected')->first()
            ?? $this->resolveDevice($request);

        if (!$device) {
            return response()->json(['ok' => false, 'error' => 'Device not available']);
        }

        try {
            $response = Http::timeout(6)->get("{$this->gatewayUrl}/api/wa/profile-picture/{$device->session_id}/{$phone}");
            return response()->json($response->json());
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()]);
        }
    }
}
