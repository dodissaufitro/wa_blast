<?php

namespace App\Http\Controllers;

use App\Models\ScheduledCampaign;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ScheduledCampaignController extends Controller
{
    /**
     * Check if a specific date or time slot is already booked in the queue.
     */
    public function checkSlot(Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date'],
            'time' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $date = $request->input('date');
        $time = $request->input('time');

        $query = $user->scheduledCampaigns()
            ->whereDate('scheduled_date', $date)
            ->where('status', 'scheduled');

        $dayCampaigns = $query->get(['id', 'title', 'scheduled_date', 'scheduled_time', 'total_recipients', 'target_audience']);
        $bookedTimes = $dayCampaigns->pluck('scheduled_time')->toArray();

        $isBooked = false;
        $conflict = null;

        if ($time) {
            $conflict = $dayCampaigns->firstWhere('scheduled_time', $time);
            $isBooked = !is_null($conflict);
        }

        return response()->json([
            'ok' => true,
            'date' => $date,
            'time' => $time,
            'isBooked' => $isBooked,
            'conflict' => $conflict,
            'bookedTimes' => $bookedTimes,
            'dayCampaigns' => $dayCampaigns,
        ]);
    }

    /**
     * Store a newly scheduled blast campaign.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'target_audience' => ['required', 'string'],
            'message' => ['required', 'string'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:today'],
            'scheduled_time' => ['required', 'string', 'max:10'],
            'device' => ['nullable', 'string'],
        ], [
            'title.required' => 'Nama kampanye wajib diisi untuk antrean jadwal.',
            'message.required' => 'Isi pesan WhatsApp tidak boleh kosong.',
            'scheduled_date.required' => 'Pilih tanggal / hari antrean.',
            'scheduled_date.after_or_equal' => 'Tanggal jadwal tidak boleh tanggal yang sudah lewat.',
            'scheduled_time.required' => 'Pilih jam waktu antrean.',
        ]);

        $user = $request->user();
        $date = $validated['scheduled_date'];
        $time = $validated['scheduled_time'];

        // Strict Conflict Check: Cannot book if another campaign is already in queue for this user at the same date & time
        $existing = $user->scheduledCampaigns()
            ->whereDate('scheduled_date', $date)
            ->where('scheduled_time', $time)
            ->where('status', 'scheduled')
            ->first();

        if ($existing) {
            return back()->withErrors([
                'scheduled_time' => "Waktu ini sudah terisi oleh antrean: \"{$existing->title}\". Silakan pilih jam atau hari lain.",
            ]);
        }

        // Calculate recipient count from contacts
        $recipientsCount = 0;
        if ($validated['target_audience'] === 'all') {
            $recipientsCount = $user->contacts()->count();
        } else {
            $recipientsCount = $user->contacts()->where('group', $validated['target_audience'])->count();
        }

        $scheduledAt = Carbon::parse("{$date} {$time}");

        $user->scheduledCampaigns()->create([
            'title' => $validated['title'],
            'target_audience' => $validated['target_audience'],
            'total_recipients' => $recipientsCount,
            'message' => $validated['message'],
            'device' => $validated['device'] ?? 'WhatsApp Anda',
            'scheduled_date' => $date,
            'scheduled_time' => $time,
            'scheduled_at' => $scheduledAt,
            'status' => 'scheduled',
        ]);

        return back()->with('success', "Kampanye \"{$validated['title']}\" berhasil dijadwalkan pada {$date} pukul {$time}!");
    }

    /**
     * Cancel / Delete a scheduled campaign.
     */
    public function destroy(Request $request, ScheduledCampaign $scheduledCampaign): RedirectResponse
    {
        if ($scheduledCampaign->user_id !== $request->user()->id) {
            abort(403, 'Akses ditolak.');
        }

        $title = $scheduledCampaign->title;
        $scheduledCampaign->delete();

        return back()->with('success', "Jadwal antrean kampanye \"{$title}\" berhasil dibatalkan.");
    }

    /**
     * Record an instant blast campaign execution.
     */
    public function recordInstant(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string'],
            'target_audience' => ['required', 'string'],
            'total_recipients' => ['required', 'integer'],
            'sent_count' => ['required', 'integer'],
            'failed_count' => ['required', 'integer'],
            'message' => ['required', 'string'],
            'device' => ['nullable', 'string'],
            'status' => ['required', 'string'],
        ]);

        $user = $request->user();
        $now = Carbon::now();

        $campaign = $user->scheduledCampaigns()->create([
            'title' => $validated['title'],
            'target_audience' => $validated['target_audience'],
            'total_recipients' => $validated['total_recipients'],
            'sent_count' => $validated['sent_count'],
            'failed_count' => $validated['failed_count'],
            'message' => $validated['message'],
            'device' => $validated['device'] ?? 'WhatsApp Anda',
            'scheduled_date' => $now->toDateString(),
            'scheduled_time' => $now->format('H:i'),
            'scheduled_at' => $now,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'ok' => true,
            'campaign' => $campaign,
        ]);
    }
}
