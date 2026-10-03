<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

use App\Http\Controllers\ContactController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\ScheduledCampaignController;
use App\Http\Controllers\TemplateController;
use Illuminate\Support\Facades\DB;

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function (\Illuminate\Http\Request $request) {
        $user = $request->user();

        $contactGroups = $user->contacts()
            ->select('group', DB::raw('count(*) as count'))
            ->whereNotNull('group')
            ->groupBy('group')
            ->get();

        $templates = $user->templates()
            ->latest()
            ->get(['id', 'name', 'category', 'content']);

        $scheduledCampaigns = $user->scheduledCampaigns()
            ->latest('scheduled_at')
            ->get();

        $recentContacts = $user->contacts()
            ->where('status', '!=', 'inactive')
            ->latest()
            ->take(25)
            ->get(['id', 'name', 'phone', 'group']);

        $devices = $user->devices()->orderBy('id')->get();
        if ($devices->isEmpty()) {
            $defaultDev = $user->devices()->create([
                'name' => 'WhatsApp 1 (Utama)',
                'session_id' => 'user_' . $user->id,
                'is_default' => true,
                'status' => 'disconnected',
            ]);
            $devices = collect([$defaultDev]);
        }

        return Inertia::render('dashboard', [
            'totalContactsCount' => $user->contacts()->count(),
            'contactGroups' => $contactGroups,
            'userTemplates' => $templates,
            'scheduledCampaigns' => $scheduledCampaigns,
            'recentContacts' => $recentContacts,
            'whatsappDevices' => $devices,
        ]);
    })->name('dashboard');

    Route::post('contacts/bulk-delete', [ContactController::class, 'bulkDelete'])->name('contacts.bulk-delete');
    Route::post('contacts/import', [ContactController::class, 'import'])->name('contacts.import');
    Route::post('contacts/blast-recipients', [ContactController::class, 'blastRecipients'])->name('contacts.blast-recipients');
    Route::resource('contacts', ContactController::class)->except(['create', 'edit', 'show']);

    // Message Templates CRUD
    Route::resource('templates', TemplateController::class)->except(['create', 'edit', 'show']);

    // Scheduled Campaigns Antrean & Instant Blast History
    Route::post('scheduled-campaigns/check-slot', [ScheduledCampaignController::class, 'checkSlot'])->name('scheduled-campaigns.check-slot');
    Route::post('campaigns/record-instant', [ScheduledCampaignController::class, 'recordInstant'])->name('campaigns.record-instant');
    Route::resource('scheduled-campaigns', ScheduledCampaignController::class)->only(['store', 'destroy']);

    // WhatsApp Multi-Device Connection Routes
    Route::prefix('device')->name('device.')->group(function () {
        Route::get('list', [DeviceController::class, 'index'])->name('list');
        Route::post('create', [DeviceController::class, 'store'])->name('store');
        Route::get('profile-picture', [DeviceController::class, 'profilePicture'])->name('profile-picture');
        Route::post('send-message', [DeviceController::class, 'sendMessage'])->name('send-message');

        // Parameterized routes for specific devices
        Route::get('{id}/status', [DeviceController::class, 'status'])->name('device-status');
        Route::post('{id}/connect', [DeviceController::class, 'connect'])->name('device-connect');
        Route::post('{id}/pairing-code', [DeviceController::class, 'pairingCode'])->name('device-pairing');
        Route::post('{id}/disconnect', [DeviceController::class, 'disconnect'])->name('device-disconnect');
        Route::put('{id}', [DeviceController::class, 'update'])->name('device-update');
        Route::delete('{id}', [DeviceController::class, 'destroy'])->name('device-destroy');

        // Fallback default device routes (backward compatibility)
        Route::get('status', [DeviceController::class, 'status'])->name('status');
        Route::post('connect', [DeviceController::class, 'connect'])->name('connect');
        Route::post('pairing-code', [DeviceController::class, 'pairingCode'])->name('pairing-code');
        Route::post('disconnect', [DeviceController::class, 'disconnect'])->name('disconnect');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
