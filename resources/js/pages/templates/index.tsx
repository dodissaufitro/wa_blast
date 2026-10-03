import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Check,
    CheckCircle2,
    Copy,
    Filter,
    Flame,
    Layers,
    LoaderCircle,
    MessageSquareText,
    Pencil,
    Plus,
    Radio,
    Search,
    Send,
    Sparkles,
    Tag,
    Trash2,
    Zap,
} from 'lucide-react';
import React, { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Template Pesan',
        href: '/templates',
    },
];

interface TemplateItem {
    id: number;
    name: string;
    category: string;
    content: string;
    created_at: string;
    updated_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedTemplates {
    data: TemplateItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface TemplatesIndexProps {
    templates: PaginatedTemplates;
    categories: string[];
    filters: {
        search: string;
        category: string;
    };
    stats: {
        total: number;
        promosi: number;
        notifikasi: number;
        follow_up: number;
    };
}

const DEFAULT_CATEGORIES = ['Promosi', 'Notifikasi', 'Follow Up', 'Eksklusif', 'Informasi'];

const DYNAMIC_VARIABLES = [
    { tag: 'nama', label: '{nama}', desc: 'Nama lengkap kontak' },
    { tag: 'nomor', label: '{nomor}', desc: 'Nomor WhatsApp kontak' },
    { tag: 'kode_promo', label: '{kode_promo}', desc: 'Kode kupon / diskon' },
    { tag: 'invoice', label: '{invoice}', desc: 'No. invoice / tagihan' },
    { tag: 'tanggal', label: '{tanggal}', desc: 'Tanggal berlaku' },
    { tag: 'produk', label: '{produk}', desc: 'Nama barang / layanan' },
];

export default function TemplatesIndex({
    templates,
    categories,
    filters,
    stats,
}: TemplatesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToEdit, setTemplateToEdit] = useState<TemplateItem | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<TemplateItem | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // Form create / edit
    const {
        data: formData,
        setData: setFormData,
        post,
        put,
        processing: formProcessing,
        errors: formErrors,
        reset: resetForm,
        clearErrors,
    } = useForm<{
        name: string;
        category: string;
        content: string;
        [key: string]: any;
    }>({
        name: '',
        category: 'Promosi',
        content: '',
    });

    // Delete form
    const { delete: destroyTemplate, processing: deleteProcessing } = useForm();

    // Search and filter submission
    const applyFilters = (newCategory?: string) => {
        router.get(
            '/templates',
            {
                search: search,
                category: newCategory !== undefined ? newCategory : selectedCategory,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    // Open Create Modal
    const handleOpenCreate = () => {
        clearErrors();
        setFormData({
            name: '',
            category: 'Promosi',
            content: '',
        });
        setIsCreateModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (template: TemplateItem) => {
        clearErrors();
        setTemplateToEdit(template);
        setFormData({
            name: template.name,
            category: template.category,
            content: template.content,
        });
        setIsEditModalOpen(true);
    };

    // Insert dynamic tag into textarea
    const insertTag = (tag: string) => {
        setFormData('content', formData.content + ` {${tag}}`);
    };

    // Submit Create
    const handleSubmitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/templates', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetForm();
            },
        });
    };

    // Submit Edit
    const handleSubmitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!templateToEdit) return;
        put(`/templates/${templateToEdit.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setTemplateToEdit(null);
                resetForm();
            },
        });
    };

    // Submit Delete
    const handleConfirmDelete = () => {
        if (!templateToDelete) return;
        destroyTemplate(`/templates/${templateToDelete.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setTemplateToDelete(null);
            },
        });
    };

    // Copy template content to clipboard
    const handleCopyContent = (template: TemplateItem) => {
        navigator.clipboard.writeText(template.content);
        setCopiedId(template.id);
        setTimeout(() => setCopiedId(null), 2500);
    };

    // Generate simulated preview text
    const getPreviewText = (text: string) => {
        return text
            .replace(/\{nama\}/g, 'Bpk. Hendra Gunawan')
            .replace(/\{nomor\}/g, '+62 812-3456-7890')
            .replace(/\{kode_promo\}/g, 'VIP35HEMAT')
            .replace(/\{invoice\}/g, 'INV-2026-8891')
            .replace(/\{tanggal\}/g, '04 Okt 2026')
            .replace(/\{produk\}/g, 'Paket Pro Cloud');
    };

    // Category badge color
    const getCategoryBadge = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('promo')) {
            return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
        }
        if (cat.includes('notif') || cat.includes('tagihan')) {
            return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30';
        }
        if (cat.includes('follow')) {
            return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
        }
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Template Pesan WhatsApp - WABlast Pro" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* 1. Header Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-6 text-white shadow-xl">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute left-1/3 -bottom-16 h-48 w-48 rounded-full bg-teal-500/15 blur-2xl" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                                <MessageSquareText className="h-3.5 w-3.5" />
                                Manajemen Template Broadcast
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Template Pesan WhatsApp 📝
                            </h1>
                            <p className="text-sm text-slate-300 max-w-2xl">
                                Susun template pesan promosi, invoice, dan follow up dengan format rapi dan variabel personalisasi dinamis otomatis.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                onClick={handleOpenCreate}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-md shadow-emerald-500/20 cursor-pointer"
                            >
                                <Plus className="mr-1.5 h-4 w-4" /> + Buat Template Baru
                            </Button>
                            <Link href="/dashboard">
                                <Button
                                    variant="outline"
                                    className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white cursor-pointer"
                                >
                                    <Send className="mr-1.5 h-4 w-4 text-emerald-400" /> Buka Blast Studio
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Key Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Total Template</CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Layers className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">Tersedia untuk pengiriman blast</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Template Promosi</CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Flame className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.promosi}</div>
                            <p className="text-xs text-muted-foreground mt-1">Diskon, flash sale, voucher</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Template Notifikasi</CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                                <Radio className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.notifikasi}</div>
                            <p className="text-xs text-muted-foreground mt-1">Tagihan invoice & pengingat</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Template Follow Up</CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Zap className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.follow_up}</div>
                            <p className="text-xs text-muted-foreground mt-1">Keranjang belanja & leads</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Search & Category Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/80 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari judul atau isi template pesan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 text-xs w-full"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedCategory('all');
                                applyFilters('all');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                                selectedCategory === 'all'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Semua ({stats.total})
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    applyFilters(cat);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                                    selectedCategory === cat
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Templates Grid */}
                {templates.data.length === 0 ? (
                    <Card className="border-border/80 shadow-xs text-center p-12">
                        <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                            <MessageSquareText className="h-7 w-7" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">Belum Ada Template Pesan</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                            Buat template pesan pertama Anda untuk mempermudah blast promosi massal tanpa mengetik ulang.
                        </p>
                        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Buat Template Sekarang
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {templates.data.map((tmpl) => (
                            <Card
                                key={tmpl.id}
                                className="border-border/80 shadow-xs hover:border-emerald-500/40 transition flex flex-col justify-between group relative overflow-hidden"
                            >
                                <CardHeader className="pb-3 border-b border-border/60">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] font-semibold border ${getCategoryBadge(
                                                    tmpl.category
                                                )}`}
                                            >
                                                {tmpl.category}
                                            </Badge>
                                            <CardTitle className="text-sm font-bold text-foreground leading-snug">
                                                {tmpl.name}
                                            </CardTitle>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(tmpl)}
                                                className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
                                                title="Edit Template"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTemplateToDelete(tmpl);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="h-7 w-7 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 flex items-center justify-center cursor-pointer"
                                                title="Hapus Template"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-3 pb-4 flex-1 flex flex-col justify-between space-y-3">
                                    {/* Content preview with WhatsApp-like bubble */}
                                    <div className="rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-foreground/90 font-sans whitespace-pre-line border border-border/60 max-h-48 overflow-y-auto">
                                        {tmpl.content}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCopyContent(tmpl)}
                                            className="h-8 text-xs flex-1 cursor-pointer"
                                        >
                                            {copiedId === tmpl.id ? (
                                                <>
                                                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Tersalin!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Salin Teks
                                                </>
                                            )}
                                        </Button>
                                        <Link
                                            href={`/dashboard?template_id=${tmpl.id}`}
                                            className="flex-1"
                                        >
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                            >
                                                <Send className="h-3.5 w-3.5 mr-1" /> Pakai di Blast
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* 5. Pagination */}
                {templates.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
                        <div>
                            Menampilkan <b>{templates.from || 0}</b> - <b>{templates.to || 0}</b> dari{' '}
                            <b>{templates.total}</b> template
                        </div>
                        <div className="flex items-center gap-1">
                            {templates.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                                        link.active
                                            ? 'bg-emerald-600 text-white'
                                            : !link.url
                                            ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                                            : 'bg-muted/40 hover:bg-muted text-foreground'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. Modal Create Template */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                                <Plus className="h-5 w-5 text-emerald-500" /> Buat Template Pesan Baru
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Masukkan judul, kategori, dan isi pesan WhatsApp dengan variabel dinamis.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmitCreate} className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="create-name" className="text-xs font-semibold">
                                        Judul Template <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="create-name"
                                        placeholder="Contoh: Promo Flash Sale 10.10"
                                        value={formData.name}
                                        onChange={(e) => setFormData('name', e.target.value)}
                                        className="h-9 text-xs"
                                        required
                                    />
                                    <InputError message={formErrors.name} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="create-category" className="text-xs font-semibold">
                                        Kategori Template <span className="text-rose-500">*</span>
                                    </Label>
                                    <select
                                        id="create-category"
                                        value={formData.category}
                                        onChange={(e) => setFormData('category', e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                    >
                                        {DEFAULT_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={formErrors.category} />
                                </div>
                            </div>

                            {/* Variable Insertion Pills */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold flex items-center justify-between">
                                    <span>Sisipkan Variabel Personalisasi Otomatis</span>
                                    <span className="text-[11px] text-muted-foreground font-normal">
                                        Klik untuk menyisipkan
                                    </span>
                                </Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {DYNAMIC_VARIABLES.map((v) => (
                                        <button
                                            key={v.tag}
                                            type="button"
                                            onClick={() => insertTag(v.tag)}
                                            className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
                                            title={v.desc}
                                        >
                                            +{v.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content Textarea */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="create-content" className="text-xs font-semibold">
                                        Isi Pesan WhatsApp <span className="text-rose-500">*</span>
                                    </Label>
                                    <span className="text-[11px] text-muted-foreground">
                                        {formData.content.length} karakter
                                    </span>
                                </div>
                                <textarea
                                    id="create-content"
                                    rows={5}
                                    placeholder="Halo {nama}! Kami punya kabar gembira khusus untuk Anda hari ini..."
                                    value={formData.content}
                                    onChange={(e) => setFormData('content', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs leading-relaxed shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                    required
                                />
                                <InputError message={formErrors.content} />
                                <p className="text-[10px] text-muted-foreground">
                                    Gunakan *tebal*, _miring_, dan ~coret~ untuk format teks WhatsApp.
                                </p>
                            </div>

                            {/* Live Preview Box */}
                            {formData.content.trim() && (
                                <div className="rounded-xl bg-muted/40 p-3 border border-border/60 space-y-1.5">
                                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Contoh Hasil Tampilan WhatsApp:
                                    </span>
                                    <div className="rounded-lg bg-[#d9fdd3] dark:bg-[#005c4b] p-2.5 text-[11px] text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed shadow-xs">
                                        {getPreviewText(formData.content)}
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="text-xs cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={formProcessing}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer"
                                >
                                    {formProcessing ? (
                                        <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Check className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    Simpan Template
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* 7. Modal Edit Template */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                                <Pencil className="h-5 w-5 text-emerald-500" /> Edit Template Pesan
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Perbarui judul, kategori, atau teks pesan template.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmitEdit} className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-name" className="text-xs font-semibold">
                                        Judul Template <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="edit-name"
                                        value={formData.name}
                                        onChange={(e) => setFormData('name', e.target.value)}
                                        className="h-9 text-xs"
                                        required
                                    />
                                    <InputError message={formErrors.name} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-category" className="text-xs font-semibold">
                                        Kategori Template <span className="text-rose-500">*</span>
                                    </Label>
                                    <select
                                        id="edit-category"
                                        value={formData.category}
                                        onChange={(e) => setFormData('category', e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                    >
                                        {DEFAULT_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={formErrors.category} />
                                </div>
                            </div>

                            {/* Variable Insertion Pills */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold flex items-center justify-between">
                                    <span>Sisipkan Variabel Personalisasi</span>
                                    <span className="text-[11px] text-muted-foreground font-normal">
                                        Klik untuk menyisipkan
                                    </span>
                                </Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {DYNAMIC_VARIABLES.map((v) => (
                                        <button
                                            key={v.tag}
                                            type="button"
                                            onClick={() => insertTag(v.tag)}
                                            className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
                                        >
                                            +{v.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content Textarea */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="edit-content" className="text-xs font-semibold">
                                        Isi Pesan WhatsApp <span className="text-rose-500">*</span>
                                    </Label>
                                    <span className="text-[11px] text-muted-foreground">
                                        {formData.content.length} karakter
                                    </span>
                                </div>
                                <textarea
                                    id="edit-content"
                                    rows={5}
                                    value={formData.content}
                                    onChange={(e) => setFormData('content', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs leading-relaxed shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                    required
                                />
                                <InputError message={formErrors.content} />
                            </div>

                            {/* Live Preview Box */}
                            {formData.content.trim() && (
                                <div className="rounded-xl bg-muted/40 p-3 border border-border/60 space-y-1.5">
                                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Contoh Tampilan WhatsApp:
                                    </span>
                                    <div className="rounded-lg bg-[#d9fdd3] dark:bg-[#005c4b] p-2.5 text-[11px] text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed shadow-xs">
                                        {getPreviewText(formData.content)}
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-xs cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={formProcessing}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer"
                                >
                                    {formProcessing ? (
                                        <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Check className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    Perbarui Template
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* 8. Modal Delete Confirmation */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-500">
                                <Trash2 className="h-5 w-5" /> Hapus Template Pesan?
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Template <b>{templateToDelete?.name}</b> akan dihapus secara permanen dari akun Anda.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground border border-border/60">
                            Tindakan ini tidak dapat dibatalkan. Pastikan Anda tidak lagi memerlukan template ini untuk blast masa mendatang.
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="text-xs cursor-pointer"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={deleteProcessing}
                                className="bg-rose-600 hover:bg-rose-500 text-white text-xs cursor-pointer"
                            >
                                {deleteProcessing ? (
                                    <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                Ya, Hapus Sekarang
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
