<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    /**
     * Display a listing of message templates with search, filters, and stats.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $user = $request->user();
        $query = $user->templates()->latest();

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($category = $request->input('category')) {
            if ($category !== 'all') {
                $query->where('category', $category);
            }
        }

        // If requested as JSON (e.g. for composer dropdown or API)
        if ($request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'templates' => $query->get(),
            ]);
        }

        $templates = $query->paginate(12)->withQueryString();

        // Distinct available categories for this user
        $categories = $user->templates()
            ->select('category')
            ->distinct()
            ->whereNotNull('category')
            ->pluck('category')
            ->values();

        // Statistics
        $stats = [
            'total' => $user->templates()->count(),
            'promosi' => $user->templates()->where('category', 'Promosi')->count(),
            'notifikasi' => $user->templates()->where('category', 'Notifikasi')->count(),
            'follow_up' => $user->templates()->where('category', 'Follow Up')->count(),
        ];

        return Inertia::render('templates/index', [
            'templates' => $templates,
            'categories' => $categories,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', 'all'),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created template in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'content' => ['required', 'string'],
        ], [
            'name.required' => 'Judul template wajib diisi.',
            'category.required' => 'Kategori template wajib dipilih.',
            'content.required' => 'Isi pesan template wajib diisi.',
        ]);

        $request->user()->templates()->create($validated);

        return back()->with('success', 'Template pesan baru berhasil disimpan.');
    }

    /**
     * Update the specified template in storage.
     */
    public function update(Request $request, Template $template): RedirectResponse
    {
        // Authorize ownership
        if ($template->user_id !== $request->user()->id) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'content' => ['required', 'string'],
        ], [
            'name.required' => 'Judul template wajib diisi.',
            'category.required' => 'Kategori template wajib dipilih.',
            'content.required' => 'Isi pesan template wajib diisi.',
        ]);

        $template->update($validated);

        return back()->with('success', 'Template pesan berhasil diperbarui.');
    }

    /**
     * Remove the specified template from storage.
     */
    public function destroy(Request $request, Template $template): RedirectResponse
    {
        // Authorize ownership
        if ($template->user_id !== $request->user()->id) {
            abort(403, 'Akses ditolak.');
        }

        $template->delete();

        return back()->with('success', 'Template pesan berhasil dihapus.');
    }
}
