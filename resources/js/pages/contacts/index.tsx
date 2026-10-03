import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
    AlertCircle,
    Check,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Filter,
    LoaderCircle,
    Mail,
    MessageCircle,
    Pencil,
    Phone,
    Plus,
    Search,
    Tag,
    Trash2,
    Upload,
    User,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Buku Kontak',
        href: '/contacts',
    },
];

interface ContactItem {
    id: number;
    name: string;
    phone: string;
    group: string;
    email: string | null;
    notes: string | null;
    status: 'active' | 'unsubscribed' | 'invalid';
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedContacts {
    data: ContactItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface ContactsPageProps {
    contacts: PaginatedContacts;
    groups: string[];
    filters: {
        search: string;
        group: string;
        status: string;
    };
    stats: {
        total: number;
        active: number;
        vip: number;
        groupsCount: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

interface ContactFormData {
    name: string;
    phone: string;
    group: string;
    email: string;
    notes: string;
    status: string;
    [key: string]: any;
}

export default function ContactsIndex({ contacts, groups, filters, stats }: ContactsPageProps) {
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedGroup, setSelectedGroup] = useState(filters.group || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    // Selection state for bulk operations
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Modals state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<ContactItem | null>(null);
    const [deletingContact, setDeletingContact] = useState<ContactItem | null>(null);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importText, setImportText] = useState('');
    const [importGroup, setImportGroup] = useState('Pelanggan Baru');
    const [isImporting, setIsImporting] = useState(false);

    // Form for create/edit
    const {
        data: formData,
        setData: setFormData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<ContactFormData>({
        name: '',
        phone: '',
        group: 'Umum',
        email: '',
        notes: '',
        status: 'active',
    });

    // Handle Search & Filter trigger
    const handleFilterChange = (newSearch?: string, newGroup?: string, newStatus?: string) => {
        router.get(
            route('contacts.index'),
            {
                search: newSearch !== undefined ? newSearch : searchTerm,
                group: newGroup !== undefined ? newGroup : selectedGroup,
                status: newStatus !== undefined ? newStatus : selectedStatus,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // Open create modal
    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingContact(null);
        setIsCreateOpen(true);
    };

    // Open edit modal
    const openEditModal = (contact: ContactItem) => {
        clearErrors();
        setEditingContact(contact);
        setFormData({
            name: contact.name,
            phone: contact.phone,
            group: contact.group || 'Umum',
            email: contact.email || '',
            notes: contact.notes || '',
            status: contact.status || 'active',
        });
        setIsCreateOpen(true);
    };

    // Save contact (Create or Update)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingContact) {
            put(route('contacts.update', editingContact.id), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    setEditingContact(null);
                    reset();
                },
            });
        } else {
            post(route('contacts.store'), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    reset();
                },
            });
        }
    };

    // Delete single contact
    const handleDeleteConfirm = () => {
        if (!deletingContact) return;

        router.delete(route('contacts.destroy', deletingContact.id), {
            onSuccess: () => {
                setDeletingContact(null);
            },
        });
    };

    // Bulk Delete
    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Hapus ${selectedIds.length} kontak terpilih?`)) return;

        router.post(
            route('contacts.bulk-delete'),
            { ids: selectedIds },
            {
                onSuccess: () => {
                    setSelectedIds([]);
                },
            }
        );
    };

    // Toggle Select All on Page
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(contacts.data.map((c) => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    // Toggle single contact selection
    const handleSelectRow = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((item) => item !== id));
        }
    };

    // Process Raw Phone Numbers Import
    const handleImportSubmit = () => {
        if (!importText.trim()) return;

        setIsImporting(true);

        router.post(
            route('contacts.import'),
            {
                raw_numbers: importText,
                group: importGroup || 'Leads Baru',
                name_prefix: 'Kontak WA',
            },
            {
                onSuccess: () => {
                    setIsImportOpen(false);
                    setImportText('');
                    setIsImporting(false);
                },
                onError: () => {
                    setIsImporting(false);
                },
            }
        );
    };

    // Export contacts to CSV
    const exportToCSV = () => {
        if (contacts.data.length === 0) {
            alert('Tidak ada data kontak untuk di-export.');
            return;
        }

        const headers = ['Nama', 'Nomor WhatsApp', 'Grup/Kategori', 'Email', 'Catatan', 'Status'];
        const rows = contacts.data.map((c) => [
            `"${c.name.replace(/"/g, '""')}"`,
            `"${c.phone}"`,
            `"${c.group}"`,
            `"${c.email || ''}"`,
            `"${(c.notes || '').replace(/"/g, '""')}"`,
            `"${c.status}"`,
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `kontak_wablast_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get color variant for group badge
    const getGroupBadgeClass = (groupName: string) => {
        const lower = groupName.toLowerCase();
        if (lower.includes('vip')) {
            return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
        }
        if (lower.includes('reseller')) {
            return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30';
        }
        if (lower.includes('leads') || lower.includes('promo')) {
            return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
        }
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buku Kontak WhatsApp - WABlast Pro" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* 1. Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2 border border-emerald-500/20">
                            <Users className="h-3.5 w-3.5" /> Manajemen Nomor & Kontak WhatsApp
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Buku Kontak Pelanggan
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Kelola daftar nomor telepon, segmentasi grup, dan data kontak untuk kebutuhan blast promosi.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                            onClick={openCreateModal}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                            <Plus className="mr-1.5 h-4 w-4" /> + Tambah Kontak Baru
                        </Button>
                        <Button
                            onClick={() => setIsImportOpen(true)}
                            variant="outline"
                            className="text-xs cursor-pointer"
                        >
                            <Upload className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Import Kontak
                        </Button>
                        <Button
                            onClick={exportToCSV}
                            variant="outline"
                            className="text-xs cursor-pointer"
                        >
                            <Download className="mr-1.5 h-3.5 w-3.5 text-teal-600 dark:text-teal-400" /> Export CSV
                        </Button>
                    </div>
                </div>

                {/* 2. Top Summary Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Total Nomor Kontak</CardTitle>
                            <Users className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()}</div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Tersimpan di database</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Kontak Aktif</CardTitle>
                            <UserCheck className="h-4 w-4 text-teal-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {stats.active.toLocaleString()}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Siap menerima blast pesan</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Pelanggan VIP</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {stats.vip.toLocaleString()}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Segmentasi prioritas tinggi</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Kategori Grup</CardTitle>
                            <Tag className="h-4 w-4 text-sky-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.groupsCount} Grup</div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Segmen audiens kampanye</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Filter & Search Action Bar */}
                <Card className="border-border/80 shadow-xs">
                    <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleFilterChange(e.currentTarget.value);
                                    }}
                                    placeholder="Cari nama, nomor WhatsApp, email..."
                                    className="pl-9 h-9 text-xs"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('');
                                            handleFilterChange('');
                                        }}
                                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Group Filter Dropdown */}
                            <select
                                value={selectedGroup}
                                onChange={(e) => {
                                    setSelectedGroup(e.target.value);
                                    handleFilterChange(undefined, e.target.value);
                                }}
                                className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="all">Semua Kategori Grup</option>
                                {groups.map((grp) => (
                                    <option key={grp} value={grp}>
                                        {grp}
                                    </option>
                                ))}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilterChange(undefined, undefined, e.target.value);
                                }}
                                className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            >
                                <option value="all">Semua Status</option>
                                <option value="active">🟢 Aktif</option>
                                <option value="unsubscribed">🔴 Tidak Berlangganan</option>
                                <option value="invalid">⚪ Tidak Valid</option>
                            </select>

                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleFilterChange()}
                                className="h-9 text-xs cursor-pointer"
                            >
                                <Filter className="mr-1 h-3.5 w-3.5" /> Terapkan Filter
                            </Button>
                        </div>

                        {/* Bulk Action Controls */}
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-1.5 border border-emerald-500/30">
                                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 px-2">
                                    {selectedIds.length} Kontak Terpilih
                                </span>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleBulkDelete}
                                    className="h-7 text-xs cursor-pointer"
                                >
                                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Hapus Terpilih
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 4. Contacts Table */}
                <Card className="border-border/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/60">
                                <tr>
                                    <th className="w-10 px-4 py-3 text-center">
                                        <Checkbox
                                            checked={
                                                contacts.data.length > 0 &&
                                                selectedIds.length === contacts.data.length
                                            }
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        />
                                    </th>
                                    <th className="px-4 py-3">Nama Kontak</th>
                                    <th className="px-4 py-3">Nomor WhatsApp</th>
                                    <th className="px-4 py-3">Grup / Kategori</th>
                                    <th className="px-4 py-3">Email & Catatan</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {contacts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Users className="h-10 w-10 text-muted-foreground/50" />
                                                <p className="font-semibold text-foreground">Tidak Ada Kontak Ditemukan</p>
                                                <p className="text-xs">
                                                    Silakan tambah kontak baru atau sesuaikan kata kunci pencarian Anda.
                                                </p>
                                                <Button size="sm" onClick={openCreateModal} className="mt-2 text-xs">
                                                    + Tambah Kontak Pertama
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    contacts.data.map((contact) => (
                                        <tr key={contact.id} className="hover:bg-muted/30 transition">
                                            <td className="w-10 px-4 py-3 text-center">
                                                <Checkbox
                                                    checked={selectedIds.includes(contact.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectRow(contact.id, !!checked)
                                                    }
                                                />
                                            </td>

                                            {/* Name & Avatar */}
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-8 w-8 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
                                                        {contact.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-foreground">{contact.name}</div>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            Ditambahkan: {new Date(contact.created_at).toLocaleDateString('id-ID')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* WhatsApp Phone */}
                                            <td className="px-4 py-3 font-mono">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-foreground">+{contact.phone}</span>
                                                    <a
                                                        href={`https://wa.me/${contact.phone}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400 cursor-pointer transition"
                                                        title="Buka Chat WhatsApp Web"
                                                    >
                                                        <MessageCircle className="h-3 w-3" /> Chat
                                                    </a>
                                                </div>
                                            </td>

                                            {/* Group Badge */}
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] font-semibold border ${getGroupBadgeClass(
                                                        contact.group
                                                    )}`}
                                                >
                                                    {contact.group}
                                                </Badge>
                                            </td>

                                            {/* Email & Notes */}
                                            <td className="px-4 py-3 text-muted-foreground max-w-xs">
                                                {contact.email && (
                                                    <div className="flex items-center gap-1 text-[11px] text-foreground">
                                                        <Mail className="h-3 w-3 text-muted-foreground" /> {contact.email}
                                                    </div>
                                                )}
                                                {contact.notes ? (
                                                    <p className="text-[11px] truncate opacity-90">{contact.notes}</p>
                                                ) : (
                                                    !contact.email && <span className="text-[11px] opacity-40">-</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                {contact.status === 'active' && (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                        Aktif
                                                    </span>
                                                )}
                                                {contact.status === 'unsubscribed' && (
                                                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                                        Unsubscribed
                                                    </span>
                                                )}
                                                {contact.status === 'invalid' && (
                                                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                                        Tidak Valid
                                                    </span>
                                                )}
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditModal(contact)}
                                                        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                                                        title="Edit Kontak"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeletingContact(contact)}
                                                        className="h-7 w-7 text-muted-foreground hover:text-red-600 cursor-pointer"
                                                        title="Hapus Kontak"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {contacts.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs">
                            <span className="text-muted-foreground">
                                Menampilkan {(contacts.current_page - 1) * contacts.per_page + 1} -{' '}
                                {Math.min(contacts.current_page * contacts.per_page, contacts.total)} dari{' '}
                                {contacts.total} total kontak
                            </span>

                            <div className="flex items-center gap-1">
                                {contacts.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`rounded px-2.5 py-1 text-xs transition ${
                                            link.active
                                                ? 'bg-emerald-600 text-white font-semibold'
                                                : link.url
                                                ? 'bg-muted text-foreground hover:bg-muted/80'
                                                : 'text-muted-foreground opacity-50 pointer-events-none'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* 5. Create / Edit Contact Modal Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                                {editingContact ? (
                                    <>
                                        <Pencil className="h-4 w-4 text-emerald-500" /> Edit Data Kontak
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 text-emerald-500" /> Tambah Kontak Baru
                                    </>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Masukkan nama dan nomor WhatsApp pelanggan untuk database blast Anda.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                            {/* Name */}
                            <div className="space-y-1">
                                <Label htmlFor="cName" className="text-xs font-semibold">
                                    Nama Lengkap Pelanggan *
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="cName"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData('name', e.target.value)}
                                        placeholder="Contoh: Budi Santoso"
                                        className="pl-9 h-9 text-xs"
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                                <Label htmlFor="cPhone" className="text-xs font-semibold">
                                    Nomor WhatsApp *
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="cPhone"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData('phone', e.target.value)}
                                        placeholder="Contoh: 08123456789 atau 628123456789"
                                        className="pl-9 h-9 text-xs font-mono"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Otomatis dikonversi ke format internasional (628xx).
                                </p>
                                <InputError message={errors.phone} />
                            </div>

                            {/* Group / Category */}
                            <div className="space-y-1">
                                <Label htmlFor="cGroup" className="text-xs font-semibold">
                                    Kategori Grup / Segmen
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="cGroup"
                                        value={formData.group}
                                        onChange={(e) => setFormData('group', e.target.value)}
                                        placeholder="Contoh: Pelanggan VIP, Reseller, Leads"
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {['Pelanggan VIP', 'Reseller Resmi', 'Leads Promo', 'Umum'].map((g) => (
                                        <button
                                            type="button"
                                            key={g}
                                            onClick={() => setFormData('group', g)}
                                            className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted cursor-pointer"
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                                <InputError message={errors.group} />
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <Label htmlFor="cEmail" className="text-xs font-semibold">
                                    Alamat Email (Opsional)
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="cEmail"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData('email', e.target.value)}
                                        placeholder="email@pelanggan.com"
                                        className="pl-9 h-9 text-xs"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Notes */}
                            <div className="space-y-1">
                                <Label htmlFor="cNotes" className="text-xs font-semibold">
                                    Catatan Tambahan (Opsional)
                                </Label>
                                <textarea
                                    id="cNotes"
                                    rows={2}
                                    value={formData.notes}
                                    onChange={(e) => setFormData('notes', e.target.value)}
                                    placeholder="Contoh: Suka order produk gamis, domisili Surabaya"
                                    className="w-full rounded-md border border-input bg-background p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                />
                                <InputError message={errors.notes} />
                            </div>

                            {/* Status */}
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Status Kontak</Label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData('status', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                >
                                    <option value="active">🟢 Aktif (Menerima Pesan)</option>
                                    <option value="unsubscribed">🔴 Tidak Berlangganan (Dikeluarkan dari Blast)</option>
                                    <option value="invalid">⚪ Tidak Valid</option>
                                </select>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                                >
                                    {processing ? (
                                        <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Check className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    {editingContact ? 'Simpan Perubahan' : 'Tambahkan Kontak'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* 6. Delete Confirmation Modal Dialog */}
                <Dialog open={!!deletingContact} onOpenChange={(open) => !open && setDeletingContact(null)}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold text-red-600">
                                <AlertCircle className="h-5 w-5" /> Hapus Kontak?
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Apakah Anda yakin ingin menghapus kontak <b>{deletingContact?.name}</b> (+{deletingContact?.phone})? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="pt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingContact(null)}
                                className="text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteConfirm}
                                className="text-xs"
                            >
                                Hapus Sekarang
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 7. Fast Raw Phone Numbers Import Modal Dialog */}
                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                                <FileSpreadsheet className="h-5 w-5 text-emerald-500" /> Import Daftar Nomor WhatsApp
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Cukup tempelkan (*paste*) daftar nomor WhatsApp Anda. Sistem otomatis memformat ke +62 dan membersihkan duplikat.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-2">
                            {/* Group selection */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold">Kategori Grup / Segmen Tujuan</Label>
                                    <span className="text-[11px] text-muted-foreground">Pilih atau ketik grup baru</span>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        value={importGroup}
                                        onChange={(e) => setImportGroup(e.target.value)}
                                        placeholder="Contoh: Leads Baru, Database Promo, Reseller"
                                        className="h-8 text-xs flex-1"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {['Leads Baru', 'Pelanggan VIP', 'Reseller Resmi', 'Database Promo'].map((g) => (
                                        <button
                                            type="button"
                                            key={g}
                                            onClick={() => setImportGroup(g)}
                                            className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted cursor-pointer"
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Textarea for numbers */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold">
                                        Tempel Nomor WhatsApp (1 Nomor per Baris)
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setImportText(
                                                `81806190974\n81806190974\n83198315086\n83878042290\n81281070740\n81281070740\n89689189351\n82362782288\n8119566999\n85157311788\n85955105435\n881025331117\n85952817988\n89634003671\n82318229893\n81323445868\n881010857802\n82135963036\n83161589919\n81807136584`
                                            )
                                        }
                                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                    >
                                        + Isi Contoh Nomor
                                    </button>
                                </div>
                                <textarea
                                    rows={8}
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    placeholder={`81806190974\n83198315086\n83878042290\n81281070740\n08123456789\n6285811223344`}
                                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs font-mono leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Live parsing counter badges */}
                            {importText.trim().length > 0 && (() => {
                                const lines = importText.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
                                const rawCount = lines.length;
                                const uniqueMap = new Map<string, boolean>();
                                lines.forEach((line) => {
                                    let phone = line;
                                    if (line.includes(',') || line.includes(';')) {
                                        const parts = line.split(/[,;]/);
                                        phone = (parts[1] || parts[0]).trim();
                                    }
                                    let cleaned = phone.replace(/[^0-9]/g, '');
                                    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
                                    else if (cleaned.startsWith('8')) cleaned = '62' + cleaned;
                                    if (cleaned.length >= 9) {
                                        uniqueMap.set(cleaned, true);
                                    }
                                });
                                const uniqueCount = uniqueMap.size;
                                const duplicateCount = rawCount - uniqueCount;

                                return (
                                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/40 p-3 text-xs space-y-1">
                                        <div className="flex items-center justify-between font-semibold text-emerald-900 dark:text-emerald-300">
                                            <span>📊 Analisis Daftar Nomor:</span>
                                            <span className="text-emerald-600 dark:text-emerald-400">
                                                {uniqueCount} Nomor Siap Import
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground pt-1">
                                            <span>• Total Baris: <b>{rawCount}</b></span>
                                            <span>• Nomor Unik: <b>{uniqueCount}</b></span>
                                            {duplicateCount > 0 && (
                                                <span className="text-amber-600 dark:text-amber-400">
                                                    • Duplikat Dibersihkan: <b>{duplicateCount}</b>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            <DialogFooter className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsImportOpen(false);
                                        setImportText('');
                                    }}
                                    className="text-xs cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleImportSubmit}
                                    disabled={isImporting || !importText.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer"
                                >
                                    {isImporting ? (
                                        <>
                                            <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            Mengimport Nomor...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-1.5 h-3.5 w-3.5" />
                                            Import Sekarang
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
