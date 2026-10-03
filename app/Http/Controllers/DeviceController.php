<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DeviceController extends Controller
{
    protected string $gatewayUrl;

    public function __construct()
    {
        $this->gatewayUrl = env('WA_GATEWAY_URL', 'http://127.0.0.1:3001');
    }

    /**
     * Get unique session identifier for the authenticated user
     */
    protected function getSessionId(Request $request): string
    {
        return 'user_' . $request->user()->id;
    }

    /**
     * Get connection and QR code status
     */
    public function status(Request $request): JsonResponse
    {
        $sessionId = $this->getSessionId($request);

        try {
            $response = Http::timeout(3)->get("{$this->gatewayUrl}/api/wa/status/{$sessionId}");

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'ok' => false,
                'status' => 'disconnected',
                'message' => 'Gagal mengambil status perangkat dari gateway',
            ], 500);
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'status' => 'gateway_offline',
                'message' => 'Layanan background WhatsApp Gateway (wa-server.js) belum aktif di port 3001.',
            ]);
        }
    }

    /**
     * Request connection and generate QR code
     */
    public function connect(Request $request): JsonResponse
    {
        $sessionId = $this->getSessionId($request);

        try {
            $response = Http::timeout(6)->post("{$this->gatewayUrl}/api/wa/connect/{$sessionId}", [
                'phone' => $request->input('phone'),
            ]);

            return response()->json($response->json());
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'error' => 'Tidak dapat terhubung ke server WhatsApp Gateway: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Request pairing code with phone number
     */
    public function pairingCode(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
        ]);

        $sessionId = $this->getSessionId($request);

        try {
            $response = Http::timeout(8)->post("{$this->gatewayUrl}/api/wa/pairing-code/{$sessionId}", [
                'phone' => $request->input('phone'),
            ]);

            return response()->json($response->json());
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'error' => 'Gagal meminta kode pairing: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Disconnect / Logout WhatsApp session
     */
    public function disconnect(Request $request): JsonResponse
    {
        $sessionId = $this->getSessionId($request);

        try {
            $response = Http::timeout(5)->post("{$this->gatewayUrl}/api/wa/disconnect/{$sessionId}");
            return response()->json($response->json());
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'error' => 'Gagal memutuskan koneksi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send actual WhatsApp message through linked device
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
            'message' => ['required', 'string'],
        ]);

        $sessionId = $this->getSessionId($request);

        try {
            $response = Http::timeout(10)->post("{$this->gatewayUrl}/api/wa/send-message", [
                'sessionId' => $sessionId,
                'phone' => $request->input('phone'),
                'message' => $request->input('message'),
            ]);

            return response()->json($response->json(), $response->status());
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'error' => 'Gagal mengirim pesan WhatsApp: ' . $e->getMessage(),
            ], 500);
        }
    }
}
