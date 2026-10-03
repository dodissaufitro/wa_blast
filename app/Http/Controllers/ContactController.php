<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Display a listing of the contacts with search, filters, and stats.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = $user->contacts()->latest();

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        // Group filter
        if ($group = $request->input('group')) {
            if ($group !== 'all') {
                $query->where('group', $group);
            }
        }

        // Status filter
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $contacts = $query->paginate(15)->withQueryString();

        // Distinct available groups for this user
        $groups = $user->contacts()
            ->select('group')
            ->distinct()
            ->whereNotNull('group')
            ->pluck('group')
            ->values();

        // High-level statistics
        $stats = [
            'total' => $user->contacts()->count(),
            'active' => $user->contacts()->where('status', 'active')->count(),
            'vip' => $user->contacts()->where('group', 'like', '%VIP%')->count(),
            'groupsCount' => $groups->count(),
        ];

        return Inertia::render('contacts/index', [
            'contacts' => $contacts,
            'groups' => $groups,
            'filters' => [
                'search' => $request->input('search', ''),
                'group' => $request->input('group', 'all'),
                'status' => $request->input('status', 'all'),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created contact.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'group' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'string', 'in:active,unsubscribed,invalid'],
        ]);

        $validated['phone'] = Contact::formatPhone($validated['phone']);
        $validated['group'] = !empty($validated['group']) ? $validated['group'] : 'Umum';
        $validated['status'] = $validated['status'] ?? 'active';

        $request->user()->contacts()->create($validated);

        return redirect()->back()->with('success', 'Kontak WhatsApp berhasil ditambahkan!');
    }

    /**
     * Update the specified contact.
     */
    public function update(Request $request, Contact $contact): RedirectResponse
    {
        abort_if($contact->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'group' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'string', 'in:active,unsubscribed,invalid'],
        ]);

        $validated['phone'] = Contact::formatPhone($validated['phone']);
        $validated['group'] = !empty($validated['group']) ? $validated['group'] : 'Umum';
        $validated['status'] = $validated['status'] ?? 'active';

        $contact->update($validated);

        return redirect()->back()->with('success', 'Data kontak berhasil diperbarui!');
    }

    /**
     * Remove the specified contact.
     */
    public function destroy(Request $request, Contact $contact): RedirectResponse
    {
        abort_if($contact->user_id !== $request->user()->id, 403);

        $contact->delete();

        return redirect()->back()->with('success', 'Kontak berhasil dihapus!');
    }

    /**
     * Delete multiple selected contacts.
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        $deleted = $request->user()->contacts()
            ->whereIn('id', $validated['ids'])
            ->delete();

        return redirect()->back()->with('success', "{$deleted} kontak terpilih berhasil dihapus!");
    }

    /**
     * Batch import contacts from raw numbers or array data.
     */
    public function import(Request $request): RedirectResponse
    {
        $user = $request->user();
        $group = $request->input('group', 'Leads Baru') ?: 'Leads Baru';
        $defaultPrefix = $request->input('name_prefix', 'Kontak');

        $phoneList = [];

        // 1. Raw numbers text (e.g. pasted directly line by line like "81806190974\n83198315086...")
        if ($rawNumbers = $request->input('raw_numbers')) {
            $lines = preg_split('/[\r\n]+/', $rawNumbers);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line)) {
                    continue;
                }

                // Check if formatted like "Name, Phone"
                if (str_contains($line, ';') || (str_contains($line, ',') && !preg_match('/^[0-9, ]+$/', $line))) {
                    $parts = preg_split('/[;,]/', $line);
                    $name = trim($parts[0]);
                    $phone = trim($parts[1] ?? $parts[0]);
                } else {
                    $phone = $line;
                    $name = null;
                }

                $cleaned = Contact::formatPhone($phone);
                if (strlen($cleaned) >= 9) {
                    $phoneList[$cleaned] = $name ?: ($defaultPrefix . ' ' . substr($cleaned, -4));
                }
            }
        }
        // 2. Structured contacts array
        elseif ($contacts = $request->input('contacts')) {
            foreach ($contacts as $item) {
                $phone = $item['phone'] ?? $item['number'] ?? '';
                if (empty($phone)) {
                    continue;
                }

                $cleaned = Contact::formatPhone($phone);
                if (strlen($cleaned) >= 9) {
                    $name = !empty($item['name']) ? $item['name'] : ($defaultPrefix . ' ' . substr($cleaned, -4));
                    $phoneList[$cleaned] = $name;
                }
            }
        }

        if (empty($phoneList)) {
            return redirect()->back()->withErrors(['raw_numbers' => 'Tidak ada nomor WhatsApp yang valid ditemukan.']);
        }

        $importedCount = 0;
        foreach ($phoneList as $phone => $name) {
            $user->contacts()->updateOrCreate(
                ['phone' => $phone],
                [
                    'name' => $name,
                    'group' => $group,
                    'status' => 'active',
                ]
            );
            $importedCount++;
        }

        return redirect()->back()->with('success', "Berhasil mengimpor {$importedCount} nomor kontak WhatsApp!");
    }

    /**
     * Get recipients for blast targeting
     */
    public function blastRecipients(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $group = $request->input('group', 'all');

        $query = $user->contacts()->where('status', '!=', 'inactive');

        if ($group && $group !== 'all') {
            $query->where('group', $group);
        }

        $contacts = $query->get(['id', 'name', 'phone', 'group', 'custom_fields']);

        $recipients = $contacts->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'phone' => Contact::formatPhone($c->phone),
                'group' => $c->group,
                'custom_fields' => $c->custom_fields,
            ];
        })->filter(function ($c) {
            return !empty($c['phone']);
        })->values();

        return response()->json([
            'ok' => true,
            'recipients' => $recipients,
            'total' => $recipients->count(),
        ]);
    }
}

