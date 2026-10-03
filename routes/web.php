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

        return Inertia::render('dashboard', [
            'totalContactsCount' => $user->contacts()->count(),
            'contactGroups' => $contactGroups,
            'userTemplates' => $templates,
            'scheduledCampaigns' => $scheduledCampaigns,
            'recentContacts' => $recentContacts,
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

    // WhatsApp Real Device Connection Routes
    Route::prefix('device')->name('device.')->group(function () {
        Route::get('status', [DeviceController::class, 'status'])->name('status');
        Route::post('connect', [DeviceController::class, 'connect'])->name('connect');
        Route::post('pairing-code', [DeviceController::class, 'pairingCode'])->name('pairing-code');
        Route::post('disconnect', [DeviceController::class, 'disconnect'])->name('disconnect');
        Route::post('send-message', [DeviceController::class, 'sendMessage'])->name('send-message');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
