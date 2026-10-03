import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    ArrowUpRight,
    AtSign,
    BarChart3,
    Battery,
    Calendar,
    Camera,
    Check,
    CheckCheck,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Copy,
    Download,
    ExternalLink,
    FileSpreadsheet,
    FileText,
    Flame,
    Image as ImageIcon,
    KeyRound,
    Loader2,
    Lock,
    LogOut,
    MessageSquare,
    MessageSquareText,
    Mic,
    Moon,
    MoreVertical,
    Paperclip,
    Phone,
    Pin,
    Play,
    Plus,
    QrCode,
    Radio,
    RefreshCw,
    Search,
    Send,
    Shield,
    ShieldCheck,
    Smartphone,
    Smile,
    Sparkles,
    Trash2,
    User as UserIcon,
    Users,
    Video,
    Wifi,
    X,
    Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Campaign {
    id: string;
    title: string;
    targetGroup: string;
    totalContacts: number;
    sentCount: number;
    successCount: number;
    failedCount: number;
    device: string;
    status: 'completed' | 'running' | 'scheduled' | 'failed';
    createdAt: string;
}

interface Device {
    id: string;
    name: string;
    number: string;
    battery: number;
    status: 'online' | 'connecting' | 'disconnected';
    sessionUptime: string;
    sentToday: number;
}

const INITIAL_CAMPAIGNS: Campaign[] = [
    {
        id: 'CMP-001',
        title: 'Promo Flash Sale 10.10 Double Date',
        targetGroup: 'Pelanggan VIP & Member',
        totalContacts: 3500,
        sentCount: 3500,
        successCount: 3465,
        failedCount: 35,
        device: 'CS Utama (+62 812-8899-0011)',
        status: 'completed',
        createdAt: 'Hari ini, 09:30',
    },
    {
        id: 'CMP-002',
        title: 'Pengingat Invoice & Tagihan Jatuh Tempo',
        targetGroup: 'Leads Belum Bayar',
        totalContacts: 1250,
        sentCount: 980,
        successCount: 968,
        failedCount: 12,
        device: 'Finance (+62 858-4455-6677)',
        status: 'running',
        createdAt: 'Hari ini, 13:15',
    },
    {
        id: 'CMP-003',
        title: 'Undangan Webinar Digital Marketing Masterclass',
        targetGroup: 'Database Reseller Seluruh Indonesia',
        totalContacts: 4800,
        sentCount: 0,
        successCount: 0,
        failedCount: 0,
        device: 'Marketing (+62 877-2233-4455)',
        status: 'scheduled',
        createdAt: 'Besok, 10:00',
    },
    {
        id: 'CMP-004',
        title: 'Follow Up Keranjang Belanja Abandoned Cart',
        targetGroup: 'Pengunjung Web Tertarik',
        totalContacts: 850,
        sentCount: 850,
        successCount: 841,
        failedCount: 9,
        device: 'CS Utama (+62 812-8899-0011)',
        status: 'completed',
        createdAt: 'Kemarin, 16:45',
    },
];

const INITIAL_DEVICES: Device[] = [
    {
        id: 'dev-1',
        name: 'CS Utama Official',
        number: '+62 812-8899-0011',
        battery: 92,
        status: 'online',
        sessionUptime: '99.8% (14 hari)',
        sentToday: 4210,
    },
    {
        id: 'dev-2',
        name: 'Sales & Marketing',
        number: '+62 858-4455-6677',
        battery: 84,
        status: 'online',
        sessionUptime: '98.5% (6 hari)',
        sentToday: 2650,
    },
    {
        id: 'dev-3',
        name: 'Notifikasi & Bot CS',
        number: '+62 877-2233-4455',
        battery: 76,
        status: 'online',
        sessionUptime: '99.1% (9 hari)',
        sentToday: 1560,
    },
];

interface ScheduledCampaignItem {
    id: number;
    title: string;
    target_audience: string;
    total_recipients: number;
    sent_count?: number;
    failed_count?: number;
    message: string;
    device: string | null;
    scheduled_date: string;
    scheduled_time: string;
    scheduled_at: string;
    status: 'scheduled' | 'running' | 'completed' | 'cancelled';
    created_at: string;
}

interface ContactItem {
    id: number;
    name: string;
    phone: string;
    group?: string;
}

interface ReportData {
    id: string | number;
    title: string;
    targetGroup: string;
    totalContacts: number;
    sentCount: number;
    message: string;
    time: string;
    date: string;
    device?: string;
}

export interface WhatsAppDeviceItem {
    id: number;
    name: string;
    session_id: string;
    phone: string | null;
    push_name: string | null;
    status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected' | 'gateway_offline';
    is_default: boolean;
    qrCode?: string | null;
    pairingCode?: string | null;
    lastUpdated?: string | null;
    message?: string;
}

interface DashboardProps {
    totalContactsCount?: number;
    contactGroups?: { group: string; count: number }[];
    userTemplates?: { id: number; name: string; category: string; content: string }[];
    scheduledCampaigns?: ScheduledCampaignItem[];
    recentContacts?: ContactItem[];
    whatsappDevices?: WhatsAppDeviceItem[];
}

export default function Dashboard({
    totalContactsCount = 0,
    contactGroups = [],
    userTemplates = [],
    scheduledCampaigns = [],
    recentContacts = [],
    whatsappDevices = [],
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;

    // Chat Recipient Detail definition
    interface ChatRecipientDetail {
        name: string;
        phone: string;
        time: string;
        message: string;
        avatarInitial: string;
        avatarBg: string;
        avatarType?: 'mecha' | 'photo' | 'initial';
        avatarUrl?: string | null;
        ticks: 'blue' | 'double' | 'single' | 'clock';
    }

    // Report modal states
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
    const [selectedChatRecipient, setSelectedChatRecipient] = useState<ChatRecipientDetail | null>(null);

    // Live WhatsApp profile picture query from connected WA device
    useEffect(() => {
        if (!selectedChatRecipient || !selectedChatRecipient.phone) return;
        let isMounted = true;
        const cleanPhone = selectedChatRecipient.phone.replace(/[^0-9]/g, '');
        if (!cleanPhone || cleanPhone.length < 8) return;

        fetch(`/device/profile-picture?phone=${cleanPhone}`)
            .then((res) => res.json())
            .then((data) => {
                if (isMounted && data?.ok && data?.url) {
                    setSelectedChatRecipient((prev) => {
                        if (!prev || prev.phone !== selectedChatRecipient.phone) return prev;
                        return { ...prev, avatarUrl: data.url, avatarType: 'photo' };
                    });
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, [selectedChatRecipient?.phone]);

    // Composer state
    const [selectedDevice, setSelectedDevice] = useState('real');
    const [targetAudience, setTargetAudience] = useState('all');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [campaignName, setCampaignName] = useState('');
    const [messageText, setMessageText] = useState('');
    const [delaySeconds, setDelaySeconds] = useState(5);
    const [useSpintax, setUseSpintax] = useState(true);
    const [hasAttachment, setHasAttachment] = useState(false);

    // Real WhatsApp Blast sending state
    const [blastStatusText, setBlastStatusText] = useState('');
    const [blastStats, setBlastStats] = useState<{
        total: number;
        sent: number;
        failed: number;
        currentRecipient: string | null;
    }>({
        total: 0,
        sent: 0,
        failed: 0,
        currentRecipient: null,
    });

    // Helper for local YYYY-MM-DD
    const getLocalDateString = (offsetDays = 0) => {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const normalizeTime = (t: string) => (t ? t.slice(0, 5) : '');

    // Scheduling modal & anti-conflict state
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [scheduleDate, setScheduleDate] = useState(() => getLocalDateString(1)); // default tomorrow
    const [scheduleTime, setScheduleTime] = useState('10:00');
    const [dayBookedSlots, setDayBookedSlots] = useState<string[]>([]);
    const [isSlotConflict, setIsSlotConflict] = useState(false);
    const [conflictCampaign, setConflictCampaign] = useState<ScheduledCampaignItem | null>(null);
    const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
    const [scheduleSuccessAlert, setScheduleSuccessAlert] = useState<string | null>(null);

    // Live slot conflict check
    const checkSlotAvailability = (targetDate: string, targetTime: string) => {
        const booked = scheduledCampaigns
            .filter((c) => c.scheduled_date === targetDate && c.status === 'scheduled')
            .map((c) => normalizeTime(c.scheduled_time));

        setDayBookedSlots(booked);

        const conflict = scheduledCampaigns.find(
            (c) =>
                c.scheduled_date === targetDate &&
                normalizeTime(c.scheduled_time) === normalizeTime(targetTime) &&
                c.status === 'scheduled'
        );

        if (conflict) {
            setIsSlotConflict(true);
            setConflictCampaign(conflict);
        } else {
            setIsSlotConflict(false);
            setConflictCampaign(null);
        }
    };

    // Re-check on change
    useEffect(() => {
        checkSlotAvailability(scheduleDate, scheduleTime);
    }, [scheduleDate, scheduleTime, scheduledCampaigns]);

    // Open schedule modal with validation
    const handleOpenScheduleModal = () => {
        if (!messageText.trim()) {
            alert('Silakan tulis isi pesan WhatsApp terlebih dahulu sebelum menjadwalkan.');
            return;
        }
        checkSlotAvailability(scheduleDate, scheduleTime);
        setIsScheduleModalOpen(true);
    };

    // Submit schedule to backend
    const handleConfirmSchedule = () => {
        if (!messageText.trim()) {
            alert('Isi pesan tidak boleh kosong.');
            return;
        }
        if (!scheduleDate || !scheduleTime) {
            alert('Pilih tanggal dan jam antrean terlebih dahulu.');
            return;
        }
        if (isSlotConflict) {
            alert('Waktu ini sudah terisi oleh antrean lain! Silakan pilih jam atau hari lain yang masih kosong.');
            return;
        }

        setIsSubmittingSchedule(true);
        router.post(
            '/scheduled-campaigns',
            {
                title: campaignName.trim() || 'WhatsApp Blast Kampanye',
                target_audience: targetAudience,
                message: messageText,
                scheduled_date: scheduleDate,
                scheduled_time: scheduleTime,
                device: selectedDevice === 'real' && deviceState.phone ? `+${deviceState.phone}` : selectedDevice,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsScheduleModalOpen(false);
                    setIsSubmittingSchedule(false);
                    setScheduleSuccessAlert(`Jadwal blast "${campaignName || 'Kampanye'}" berhasil disimpan pada ${scheduleDate} pukul ${scheduleTime}!`);
                    setTimeout(() => setScheduleSuccessAlert(null), 6000);
                },
                onError: (errs) => {
                    setIsSubmittingSchedule(false);
                    alert(errs.scheduled_time || errs.scheduled_date || 'Gagal menjadwalkan.');
                },
            }
        );
    };

    // Cancel schedule
    const handleCancelSchedule = (id: number) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan jadwal antrean blast ini?')) return;
        router.delete(`/scheduled-campaigns/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Antrean jadwal berhasil dibatalkan.');
            },
        });
    };

    // Helper to format exact times for WhatsApp status bar and chat list based on report time
    const getFormattedReportTimes = (timeStr: string) => {
        let [hStr, mStr] = (timeStr || '09:06').split(':');
        let h = parseInt(hStr || '9', 10);
        let m = parseInt(mStr || '6', 10);
        if (isNaN(h)) h = 9;
        if (isNaN(m)) m = 6;

        const statusTime = `${h}:${String(m).padStart(2, '0')}`;
        const t0 = `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
        const t1 = `${String(h).padStart(2, '0')}.${String(Math.max(0, m - 1)).padStart(2, '0')}`;
        const t2 = `${String(h).padStart(2, '0')}.${String(Math.max(0, m - 2)).padStart(2, '0')}`;

        return { statusTime, t0, t1, t2 };
    };

    // Build chat list for the report matching the user's screenshot
    const getReportChatList = (report: ReportData, contacts: ContactItem[]) => {
        const { t0, t1, t2 } = getFormattedReportTimes(report.time);

        const formatPhone = (raw: string) => {
            let cleaned = (raw || '').replace(/[^0-9]/g, '');
            if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
            else if (cleaned.startsWith('8')) cleaned = '62' + cleaned;

            if (cleaned.startsWith('62')) {
                const p1 = cleaned.slice(2, 5);
                const p2 = cleaned.slice(5, 9);
                const p3 = cleaned.slice(9);
                return `+62 ${p1}-${p2}-${p3}`;
            }
            return `+${cleaned}`;
        };

        const selfNumber = deviceState.phone ? formatPhone(deviceState.phone) : '+62 823-6487-1530';

        const defaultList = [
            {
                id: 'self',
                name: `${selfNumber} (Anda)`,
                phone: deviceState.phone || '6282364871530',
                messageSnippet: '81288002572 85240755067 811900...',
                time: t2,
                isPinned: true,
                ticks: 'blue' as const,
                avatarText: '👤',
                avatarBg: 'bg-[#8d3b34]',
                avatarType: 'photo' as const,
                avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
            },
            {
                id: 'rec-1',
                name: '+62 877-8231-1301',
                phone: '6287782311301',
                messageSnippet: `"${report.message.slice(0, 36)}..."`,
                time: t0,
                isPinned: false,
                ticks: 'single' as const,
                avatarText: '🤖',
                avatarBg: 'bg-[#1f3a52]',
                avatarType: 'mecha' as const,
                avatarUrl: null,
            },
            {
                id: 'rec-2',
                name: '+62 896-0193-5221',
                phone: '6289601935221',
                messageSnippet: `"${report.message.slice(0, 36)}..."`,
                time: t1,
                isPinned: false,
                ticks: 'double' as const,
                avatarText: 'N',
                avatarBg: 'bg-[#66462c]',
                avatarType: 'photo' as const,
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            },
            {
                id: 'rec-3',
                name: '+62 818-0646-8289',
                phone: '6281806468289',
                messageSnippet: `"${report.message.slice(0, 36)}..."`,
                time: t1,
                isPinned: false,
                ticks: 'blue' as const,
                avatarText: '👤',
                avatarBg: 'bg-[#785618]',
                avatarType: 'photo' as const,
                avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
            },
            {
                id: 'rec-4',
                name: '+62 878-1267-0079',
                phone: '6287812670079',
                messageSnippet: `"${report.message.slice(0, 36)}..."`,
                time: t1,
                isPinned: false,
                ticks: 'double' as const,
                avatarText: '👩',
                avatarBg: 'bg-[#6b2f42]',
                avatarType: 'photo' as const,
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
            },
            {
                id: 'rec-5',
                name: '+62 895-6200-74926',
                phone: '62895620074926',
                messageSnippet: `"${report.message.slice(0, 36)}..."`,
                time: t1,
                isPinned: false,
                ticks: 'single' as const,
                avatarText: '👤',
                avatarBg: 'bg-[#37326b]',
                avatarType: 'photo' as const,
                avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
            },
        ];

        // When real contacts exist in DB, show only their formatted phone numbers!
        if (contacts && contacts.length > 0) {
            const bgColors = ['bg-[#66462c]', 'bg-[#1f3a52]', 'bg-[#785618]', 'bg-[#6b2f42]', 'bg-[#37326b]', 'bg-[#2b593f]'];
            const avatarIcons = ['🤖', 'N', '👤', '👩', '👤', 'X'];
            const samplePhotos = [
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
            ];
            const tickChoices: ('blue' | 'double' | 'single')[] = ['blue', 'double', 'single', 'double', 'blue'];

            const fromDb = contacts.slice(0, 8).map((c, idx) => {
                const phoneOnly = formatPhone(c.phone);
                const chosenTicks = tickChoices[idx % tickChoices.length];
                return {
                    id: `contact-${c.id}`,
                    name: phoneOnly, // Only phone number is displayed
                    phone: c.phone,
                    messageSnippet: `"${report.message.slice(0, 36)}..."`,
                    time: idx === 0 ? t0 : idx % 2 === 0 ? t1 : t2,
                    isPinned: false,
                    ticks: chosenTicks,
                    avatarText: avatarIcons[idx % avatarIcons.length],
                    avatarBg: bgColors[idx % bgColors.length],
                    avatarType: (idx === 0 ? 'mecha' : 'photo') as 'mecha' | 'photo',
                    avatarUrl: idx === 0 ? null : samplePhotos[idx % samplePhotos.length],
                };
            });

            return [defaultList[0], ...fromDb];
        }

        return defaultList;
    };

    // Open WhatsApp Report Modal
    const handleOpenReport = (campaign: any, openDirectDetail = false) => {
        let timeStr = '09:06';
        if (campaign.scheduled_time) {
            timeStr = campaign.scheduled_time.slice(0, 5);
        } else if (campaign.createdAt) {
            const match = campaign.createdAt.match(/\d{1,2}[:.]\d{2}/);
            if (match) timeStr = match[0].replace('.', ':');
        } else if (campaign.created_at) {
            const d = new Date(campaign.created_at);
            timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }

        const dateStr = campaign.scheduled_date || (campaign.createdAt ? campaign.createdAt.split(',')[0] : 'Hari ini');
        const target = campaign.targetGroup || (campaign.target_audience === 'all' ? 'Semua Kontak' : campaign.target_audience) || 'Pelanggan VIP';
        const total = campaign.totalContacts ?? campaign.total_recipients ?? 50;
        const sent = campaign.sentCount ?? campaign.sent_count ?? total;
        const defaultScreenshotMsg = `"Selamat Pagi Bapak/Ibu Nasabah KSP Artha Niaga\n\nKami ingin menginformasikan bahwa tagihan bapak/ibu telah memasuki Jatuh Tempo Mohon segera dilakukan pembayaran agar data bapak/ibu tercatat baik dengan keuntungan limit score credit yang lebih besar Dan dapatkan diskon 1,5% pada setiap pembayaran pelunasan.\n\nHindari Pembayaran Restrukturisasi/ perpanjangan. Karena hal tersebut Tidak mengurangi Jumlah Tagihan sama sekali. Lakukan pembayaran Pelunasan/ Tenor untuk dapat melakukan pengajuan kembali & kenaikan Limit\n\nEmail: support@ksparthaniagacom\n\n( Dea)\n03 Oktober 2026\nKSP Artha Niaga"`;

        const msg = campaign.message || defaultScreenshotMsg;

        const newReport: ReportData = {
            id: campaign.id,
            title: campaign.title,
            targetGroup: target,
            totalContacts: total,
            sentCount: sent,
            message: msg,
            time: timeStr,
            date: dateStr,
            device: campaign.device || 'WhatsApp Anda',
        };

        setSelectedReport(newReport);

        if (openDirectDetail) {
            const list = getReportChatList(newReport, recentContacts);
            const targetRecipient = list.find((c) => c.id === 'rec-1') || list.find((c) => c.id !== 'self') || list[0];
            setSelectedChatRecipient({
                name: targetRecipient.name,
                phone: targetRecipient.phone,
                time: targetRecipient.time,
                message: msg,
                avatarInitial: targetRecipient.avatarText,
                avatarBg: targetRecipient.avatarBg,
                avatarType: targetRecipient.avatarType,
                avatarUrl: targetRecipient.avatarUrl,
                ticks: targetRecipient.ticks,
            });
        } else {
            setSelectedChatRecipient(null);
        }
        setIsReportModalOpen(true);
    };

    // Auto load template if selected
    const handleSelectTemplate = (templateId: string) => {
        setSelectedTemplateId(templateId);
        if (!templateId) return;
        const found = userTemplates.find((t) => t.id.toString() === templateId);
        if (found) {
            setMessageText(found.content);
            setCampaignName(found.name);
        }
    };

    // Auto-select template from URL if passed from /templates
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const urlParams = new URLSearchParams(window.location.search);
        const tmplId = urlParams.get('template_id');
        if (tmplId && userTemplates.length > 0) {
            const found = userTemplates.find((t) => t.id.toString() === tmplId);
            if (found) {
                setSelectedTemplateId(found.id.toString());
                setMessageText(found.content);
                setCampaignName(found.name);
                const studio = document.getElementById('blast-studio');
                studio?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [userTemplates]);

    // Blast simulation state
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState(0);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // Multi-Device WhatsApp State
    const [devices, setDevices] = useState<WhatsAppDeviceItem[]>(whatsappDevices || []);
    const [activeTargetDevice, setActiveTargetDevice] = useState<WhatsAppDeviceItem | null>(null);
    const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
    const [newDeviceName, setNewDeviceName] = useState('');
    const [isCreatingDevice, setIsCreatingDevice] = useState(false);

    // QR & Import modal state
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Real WhatsApp Gateway Device State (kept synced for preview & compat)
    const [deviceState, setDeviceState] = useState<{
        status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected' | 'gateway_offline';
        phone: string | null;
        pushName: string | null;
        qrCode: string | null;
        pairingCode: string | null;
        lastUpdated?: string | null;
        message?: string;
    }>({
        status: 'disconnected',
        phone: null,
        pushName: null,
        qrCode: null,
        pairingCode: null,
    });
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [qrTab, setQrTab] = useState<'qr' | 'pairing'>('qr');
    const [pairingInputPhone, setPairingInputPhone] = useState('');
    const [isRequestingPairing, setIsRequestingPairing] = useState(false);
    const [copiedPairingCode, setCopiedPairingCode] = useState(false);

    // Test message state
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState('Halo! Ini pesan tes verifikasi koneksi dari WABlast Pro 🚀');
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

    // Fetch all devices status from Laravel & Gateway
    const fetchDevices = async () => {
        try {
            const res = await fetch('/device/list', {
                headers: { 'Accept': 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                if (data.ok && Array.isArray(data.devices)) {
                    setDevices(data.devices);
                    setActiveTargetDevice((prev) => {
                        if (!prev) return data.devices[0] || null;
                        return data.devices.find((d: WhatsAppDeviceItem) => d.id === prev.id) || prev;
                    });
                    const primary = data.devices.find((d: WhatsAppDeviceItem) => d.status === 'connected') || data.devices[0];
                    if (primary) {
                        setDeviceState({
                            status: primary.status,
                            phone: primary.phone,
                            pushName: primary.push_name,
                            qrCode: primary.qrCode || null,
                            pairingCode: primary.pairingCode || null,
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching devices:', err);
        }
    };

    // Open QR / Pairing connect modal for specific device
    const handleOpenConnect = (dev: WhatsAppDeviceItem) => {
        setActiveTargetDevice(dev);
        setIsQrModalOpen(true);
        handleConnectSpecificDevice(dev);
    };

    // Connect specific device
    const handleConnectSpecificDevice = async (dev: WhatsAppDeviceItem) => {
        setIsConnecting(true);
        try {
            const res = await fetch(`/device/${dev.id}/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            const data = await res.json();
            if (data.ok) {
                setDeviceState((prev) => ({
                    ...prev,
                    status: data.status,
                    qrCode: data.qrCode || prev.qrCode,
                    phone: data.phone,
                    pairingCode: data.pairingCode,
                }));
                setDevices((prev) =>
                    prev.map((d) =>
                        d.id === dev.id
                            ? {
                                  ...d,
                                  status: data.status,
                                  qrCode: data.qrCode || d.qrCode,
                                  phone: data.phone || d.phone,
                                  pairingCode: data.pairingCode || d.pairingCode,
                              }
                            : d
                    )
                );
                setActiveTargetDevice((prev) =>
                    prev && prev.id === dev.id
                        ? {
                              ...prev,
                              status: data.status,
                              qrCode: data.qrCode || prev.qrCode,
                              phone: data.phone || prev.phone,
                              pairingCode: data.pairingCode || prev.pairingCode,
                          }
                        : prev
                );
            }
        } catch (err) {
            console.error('Error requesting connect:', err);
        } finally {
            setIsConnecting(false);
        }
    };

    // Request pairing code for active target device
    const handleRequestPairingCode = async () => {
        if (!pairingInputPhone.trim()) return;
        const target = activeTargetDevice || devices[0];
        if (!target) return;

        setIsRequestingPairing(true);
        try {
            const res = await fetch(`/device/${target.id}/pairing-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ phone: pairingInputPhone }),
            });
            const data = await res.json();
            if (data.ok && data.pairingCode) {
                setDeviceState((prev) => ({
                    ...prev,
                    pairingCode: data.pairingCode,
                    status: data.status,
                }));
                setDevices((prev) =>
                    prev.map((d) =>
                        d.id === target.id
                            ? { ...d, pairingCode: data.pairingCode, status: data.status }
                            : d
                    )
                );
                setActiveTargetDevice((prev) =>
                    prev ? { ...prev, pairingCode: data.pairingCode, status: data.status } : null
                );
            } else {
                alert(data.error || 'Gagal meminta kode pairing. Pastikan nomor diawali 08 atau 628.');
            }
        } catch (err) {
            console.error('Pairing error:', err);
        } finally {
            setIsRequestingPairing(false);
        }
    };

    // Disconnect specific device
    const handleDisconnectSpecificDevice = async (dev: WhatsAppDeviceItem) => {
        if (!confirm(`Apakah Anda yakin ingin memutuskan koneksi WhatsApp "${dev.name}"? Session akan dihapus dan perlu di-scan ulang.`)) {
            return;
        }
        setIsDisconnecting(true);
        try {
            const res = await fetch(`/device/${dev.id}/disconnect`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
            });
            const data = await res.json();
            if (data.ok) {
                setDevices((prev) =>
                    prev.map((d) =>
                        d.id === dev.id
                            ? { ...d, status: 'disconnected', phone: null, push_name: null, qrCode: null, pairingCode: null }
                            : d
                    )
                );
                if (activeTargetDevice?.id === dev.id) {
                    setActiveTargetDevice((prev) =>
                        prev ? { ...prev, status: 'disconnected', phone: null, push_name: null, qrCode: null, pairingCode: null } : null
                    );
                }
                setDeviceState({
                    status: 'disconnected',
                    phone: null,
                    pushName: null,
                    qrCode: null,
                    pairingCode: null,
                });
            }
        } catch (err) {
            console.error('Disconnect error:', err);
        } finally {
            setIsDisconnecting(false);
        }
    };

    // Delete a device slot
    const handleDeleteDevice = async (dev: WhatsAppDeviceItem) => {
        if (!confirm(`Hapus slot perangkat "${dev.name}"? Koneksi akan diputus dan data sesi dibersihkan.`)) {
            return;
        }
        try {
            const res = await fetch(`/device/${dev.id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' },
            });
            const data = await res.json();
            if (data.ok) {
                setDevices((prev) => prev.filter((d) => d.id !== dev.id));
                if (activeTargetDevice?.id === dev.id) {
                    setActiveTargetDevice(null);
                    setIsQrModalOpen(false);
                }
            }
        } catch (err) {
            console.error('Error deleting device:', err);
        }
    };

    // Create a new WhatsApp device slot
    const handleCreateDevice = async () => {
        if (!newDeviceName.trim()) return;
        setIsCreatingDevice(true);
        try {
            const res = await fetch('/device/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ name: newDeviceName.trim() }),
            });
            const data = await res.json();
            if (data.ok && data.device) {
                const newDev = data.device;
                setDevices((prev) => [...prev, newDev]);
                setIsAddDeviceModalOpen(false);
                setNewDeviceName('');
                handleOpenConnect(newDev);
            }
        } catch (err) {
            console.error('Error creating device:', err);
        } finally {
            setIsCreatingDevice(false);
        }
    };

    // Send Test Message
    const handleSendTestMessage = async () => {
        if (!testPhone.trim() || !testMessage.trim()) return;
        setIsSendingTest(true);
        setTestResult(null);
        const target = activeTargetDevice || devices.find((d) => d.status === 'connected') || devices[0];
        try {
            const res = await fetch('/device/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    phone: testPhone,
                    message: testMessage,
                    device_id: target?.id,
                }),
            });
            const data = await res.json();
            if (data.ok) {
                setTestResult({
                    ok: true,
                    message: `Pesan sukses terkirim via ${target?.name || 'WA'} ke +${data.to || testPhone}! (ID: ${data.messageId})`,
                });
            } else {
                setTestResult({
                    ok: false,
                    message: data.error || 'Gagal mengirim pesan WhatsApp.',
                });
            }
        } catch (err: any) {
            setTestResult({
                ok: false,
                message: err?.message || 'Terjadi kesalahan jaringan saat mengirim pesan.',
            });
        } finally {
            setIsSendingTest(false);
        }
    };

    // Check devices on page load
    useEffect(() => {
        fetchDevices();
    }, []);

    // Polling when QR modal is open
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isQrModalOpen && activeTargetDevice) {
            const targetId = activeTargetDevice.id;
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/device/${targetId}/status`, {
                        headers: { 'Accept': 'application/json' },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status) {
                            setDevices((prev) =>
                                prev.map((d) =>
                                    d.id === targetId
                                        ? {
                                              ...d,
                                              status: data.status,
                                              phone: data.phone || d.phone,
                                              push_name: data.pushName || d.push_name,
                                              qrCode: data.qrCode || d.qrCode,
                                              pairingCode: data.pairingCode || d.pairingCode,
                                          }
                                        : d
                                )
                            );
                            setActiveTargetDevice((prev) =>
                                prev && prev.id === targetId
                                    ? {
                                          ...prev,
                                          status: data.status,
                                          phone: data.phone || prev.phone,
                                          push_name: data.pushName || prev.push_name,
                                          qrCode: data.qrCode || prev.qrCode,
                                          pairingCode: data.pairingCode || prev.pairingCode,
                                      }
                                    : prev
                            );
                            setDeviceState({
                                status: data.status,
                                phone: data.phone || null,
                                pushName: data.pushName || null,
                                qrCode: data.qrCode || null,
                                pairingCode: data.pairingCode || null,
                            });
                        }
                    }
                } catch (e) {
                    console.warn('Status poll error:', e);
                }
            }, 2500);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isQrModalOpen, activeTargetDevice?.id, activeTargetDevice?.status]);

    // Insert dynamic tag
    const insertTag = (tag: string) => {
        setMessageText((prev) => prev + ` {${tag}}`);
    };

    // Helper to evaluate Spintax {Halo|Hai|Selamat Pagi}
    const parseSpintax = (text: string): string => {
        const spintaxRegex = /\{([^{}]+)\}/g;
        let matches;
        let output = text;
        while ((matches = spintaxRegex.exec(output)) !== null) {
            const options = matches[1].split('|');
            if (options.length > 1) {
                const choice = options[Math.floor(Math.random() * options.length)];
                output = output.replace(matches[0], choice);
                spintaxRegex.lastIndex = 0;
            }
        }
        return output;
    };

    // Helper to personalize placeholders
    const personalizeMessage = (
        template: string,
        contact: { name: string; phone: string; group?: string; custom_fields?: Record<string, any> }
    ): string => {
        let msg = template;
        if (useSpintax) {
            msg = parseSpintax(msg);
        }
        msg = msg.replace(/\{nama\}/gi, contact.name || 'Pelanggan');
        msg = msg.replace(/\{nomor\}/gi, contact.phone || '');
        msg = msg.replace(/\{group\}/gi, contact.group || '');

        if (contact.custom_fields && typeof contact.custom_fields === 'object') {
            for (const [key, val] of Object.entries(contact.custom_fields)) {
                const regex = new RegExp(`\\{${key}\\}`, 'gi');
                msg = msg.replace(regex, String(val ?? ''));
            }
        }
        return msg;
    };

    // Trigger Real WhatsApp Blast
    const handleSendBlast = async () => {
        if (!messageText.trim()) {
            alert('Silakan tulis isi pesan WhatsApp terlebih dahulu sebelum mengirim blast.');
            return;
        }

        const connectedDevices = devices.filter((d) => d.status === 'connected');
        if (connectedDevices.length === 0) {
            alert('⚠️ Belum ada akun WhatsApp yang terhubung! Silakan klik "Hubungkan Nomor Baru" atau scan QR perangkat Anda terlebih dahulu.');
            if (devices.length > 0) {
                handleOpenConnect(devices[0]);
            } else {
                setIsAddDeviceModalOpen(true);
            }
            return;
        }

        setIsSending(true);
        setSendProgress(5);
        setShowSuccessAlert(false);
        setBlastStatusText('Mengambil daftar kontak penerima dari Buku Kontak...');

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/contacts/blast-recipients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ group: targetAudience }),
            });
            const data = await res.json();
            const recipients: Array<{ id: number; name: string; phone: string; group?: string; custom_fields?: Record<string, any> }> =
                data.recipients || [];

            if (!recipients.length) {
                alert('Tidak ada kontak aktif dengan nomor telepon valid pada target penerima yang dipilih.');
                setIsSending(false);
                setSendProgress(0);
                return;
            }

            const targetLabel = targetAudience === 'all' ? 'Semua Kontak' : `Kelompok ${targetAudience}`;
            const devInfo = selectedDevice === 'rotation'
                ? `Rotasi Otomatis (${connectedDevices.length} Nomor WA Aktif)`
                : (connectedDevices.find((d) => String(d.id) === selectedDevice)?.name || 'WhatsApp');
            const confirmMsg = `Kirim WhatsApp Blast sekarang ke ${recipients.length} kontak (${targetLabel})\nMenggunakan: ${devInfo}\nDengan delay ${delaySeconds} - ${delaySeconds + 3} detik?`;
            if (!confirm(confirmMsg)) {
                setIsSending(false);
                setSendProgress(0);
                return;
            }

            setBlastStats({
                total: recipients.length,
                sent: 0,
                failed: 0,
                currentRecipient: null,
            });

            let sentCount = 0;
            let failedCount = 0;

            for (let i = 0; i < recipients.length; i++) {
                const contact = recipients[i];
                const personalizedMsg = personalizeMessage(messageText, contact);

                const targetDev = selectedDevice === 'rotation'
                    ? connectedDevices[i % connectedDevices.length]
                    : connectedDevices.find((d) => String(d.id) === selectedDevice) || connectedDevices[0];

                setBlastStatusText(`Mengirim ke ${contact.name} via ${targetDev?.name || 'WA'} (+${contact.phone}) [${i + 1}/${recipients.length}]...`);
                setBlastStats({
                    total: recipients.length,
                    sent: sentCount,
                    failed: failedCount,
                    currentRecipient: `${contact.name} (+${contact.phone})`,
                });

                try {
                    const sendRes = await fetch('/device/send-message', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                        },
                        body: JSON.stringify({
                            phone: contact.phone,
                            message: personalizedMsg,
                            device_id: targetDev?.id,
                        }),
                    });
                    const sendData = await sendRes.json();

                    if (sendData.ok) {
                        sentCount++;
                    } else {
                        console.warn(`Gagal mengirim ke ${contact.phone}:`, sendData.error);
                        failedCount++;
                    }
                } catch (err) {
                    console.error(`Error sending to ${contact.phone}:`, err);
                    failedCount++;
                }

                const progress = Math.round(((i + 1) / recipients.length) * 100);
                setSendProgress(progress);
                setBlastStats({
                    total: recipients.length,
                    sent: sentCount,
                    failed: failedCount,
                    currentRecipient: `${contact.name} (+${contact.phone})`,
                });

                // Anti-banned delay jitter between messages
                if (i < recipients.length - 1) {
                    const jitter = Math.floor(Math.random() * 3);
                    const waitTime = Math.max(1, delaySeconds + jitter);
                    setBlastStatusText(`Pesan ke-${i + 1} berhasil terkirim via ${targetDev?.name || 'WA'}. Jeda anti-banned (${waitTime} detik)...`);
                    await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
                }
            }

            const usedDeviceLabel = selectedDevice === 'rotation'
                ? `Rotasi (${connectedDevices.length} WA)`
                : (connectedDevices.find((d) => String(d.id) === selectedDevice)?.name
                    ? `${connectedDevices.find((d) => String(d.id) === selectedDevice)?.name} (+${connectedDevices.find((d) => String(d.id) === selectedDevice)?.phone || ''})`
                    : (deviceState.phone ? `+${deviceState.phone}` : 'WhatsApp Anda'));

            // Save campaign execution record to DB
            try {
                await fetch('/campaigns/record-instant', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        title: campaignName.trim() || `WhatsApp Blast (${recipients.length} Kontak)`,
                        target_audience: targetAudience,
                        total_recipients: recipients.length,
                        sent_count: sentCount,
                        failed_count: failedCount,
                        message: messageText,
                        device: usedDeviceLabel,
                        status: 'completed',
                    }),
                });
            } catch (recErr) {
                console.error('Failed to record campaign history:', recErr);
            }

            setIsSending(false);
            setShowSuccessAlert(true);
            setBlastStatusText(`Selesai! ${sentCount} berhasil dikirim, ${failedCount} gagal.`);
            setTimeout(() => setShowSuccessAlert(false), 9000);

            // Refresh scheduledCampaigns prop to show in table
            router.reload({ only: ['scheduledCampaigns'] });

        } catch (err: any) {
            console.error('Blast process error:', err);
            alert('Terjadi kesalahan saat memproses blast: ' + (err?.message || err));
            setIsSending(false);
            setSendProgress(0);
        }
    };

    // Render formatted preview text with simulated tags replaced
    const getPreviewText = () => {
        return messageText
            .replace(/\{nama\}/g, 'Bpk. Hendra Gunawan')
            .replace(/\{kode_promo\}/g, 'VIP35HEMAT')
            .replace(/\{invoice\}/g, 'INV-2026-8891')
            .replace(/\{tanggal\}/g, '04 Okt 2026')
            .replace(/\{nomor\}/g, '+62 812-3456-7890');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard WhatsApp Blast - WABlast Pro" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* 1. Header Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-6 text-white shadow-xl">
                    {/* Ambient Glow */}
                    <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute left-1/3 -bottom-16 h-48 w-48 rounded-full bg-teal-500/15 blur-2xl" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                </span>
                                Instance Server WhatsApp Aktif & Stabil
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Selamat Datang kembali, {auth?.user?.name || 'Admin WABlast'}! 👋
                            </h1>
                            <p className="text-sm text-slate-300 max-w-2xl">
                                Kelola kampanye blast promosi, pantau status multi-device, dan kirim ribuan pesan WhatsApp dengan fitur perlindungan anti-banned cerdas.
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                onClick={() => {
                                    const studio = document.getElementById('blast-studio');
                                    studio?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-md shadow-emerald-500/20 cursor-pointer"
                            >
                                <Zap className="mr-1.5 h-4 w-4" /> + Buat Blast Baru
                            </Button>
                            <Button
                                onClick={() => setIsQrModalOpen(true)}
                                variant="outline"
                                className={`cursor-pointer ${
                                    deviceState.status === 'connected'
                                        ? 'border-emerald-500/60 bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900/80 hover:text-white'
                                        : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white'
                                }`}
                            >
                                {deviceState.status === 'connected' ? (
                                    <>
                                        <span className="relative flex h-2 w-2 mr-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                        </span>
                                        +{deviceState.phone} (Terhubung)
                                    </>
                                ) : (
                                    <>
                                        <QrCode className="mr-1.5 h-4 w-4 text-emerald-400" /> Scan QR Device
                                    </>
                                )}
                            </Button>
                            <Link href="/contacts">
                                <Button
                                    variant="outline"
                                    className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white cursor-pointer"
                                >
                                    <Users className="mr-1.5 h-4 w-4 text-teal-400" /> Buku Kontak
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Schedule Success Notification Banner */}
                {scheduleSuccessAlert && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                            <span className="text-sm font-medium">{scheduleSuccessAlert}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setScheduleSuccessAlert(null)}
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        >
                            Tutup
                        </Button>
                    </div>
                )}

                {/* 2. Key Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Sent */}
                    <Card className="border-border/80 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Total Pesan Terkirim</CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Send className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">142.850</div>
                            <div className="mt-1 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                                <span className="font-semibold">+12.4%</span>
                                <span className="text-muted-foreground ml-1.5">dari minggu lalu</span>
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: Delivery Success Rate */}
                    <Card className="border-border/80 shadow-xs relative overflow-hidden group hover:border-teal-500/40 transition">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Tingkat Keberhasilan</CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">98.6%</div>
                            <div className="mt-1 flex items-center text-xs text-muted-foreground">
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1">140.845 Berhasil</span>
                                <span>• 2.005 Gagal</span>
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500 rounded-full" style={{ width: '98.6%' }}></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3: Today's Remaining Quota */}
                    <Card className="border-border/80 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Sisa Kuota Hari Ini</CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Flame className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">8.420</div>
                            <div className="mt-1 flex items-center text-xs text-muted-foreground">
                                <span>Kapasitas: <b>10.000</b> pesan / hari</span>
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: '84%' }}></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 4: Connected Devices */}
                    <Card className="border-border/80 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Device Terhubung</CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Smartphone className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">3 / 4 Aktif</div>
                            <div className="mt-1 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                                <span className="relative flex h-1.5 w-1.5 mr-1.5">
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                </span>
                                <span>Multi-Session Siap</span>
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Success Notification Alert */}
                {showSuccessAlert && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-200 flex items-center justify-between animate-in fade-in">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                                ✓
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Kampanye WhatsApp Blast Berhasil Diluncurkan!</h4>
                                <p className="text-xs opacity-90">Pesan sedang dikirim secara bertahap dengan delay anti-banned 5 detik.</p>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setShowSuccessAlert(false)}>
                            Tutup
                        </Button>
                    </div>
                )}

                {/* Schedule Success Alert */}
                {scheduleSuccessAlert && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-200 flex items-center justify-between animate-in fade-in">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                                ✓
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Jadwal Antrean Blast Berhasil Disimpan! ⏰</h4>
                                <p className="text-xs opacity-90">{scheduleSuccessAlert}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setScheduleSuccessAlert(null)}>
                            Tutup
                        </Button>
                    </div>
                )}

                {/* 3. Main Blast Composer & Live Phone Mockup */}
                <div id="blast-studio" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Side: Campaign Composer (7 cols) */}
                    <Card className="lg:col-span-7 border-border/80 shadow-xs flex flex-col justify-between">
                        <CardHeader className="border-b border-border/60 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                                        <Radio className="h-5 w-5 text-emerald-500" />
                                        WhatsApp Blast Studio
                                    </CardTitle>
                                    <CardDescription>
                                        Tulis pesan, atur variabel dinamis, dan jadwalkan blast massal dengan aman.
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    Anti-Banned v2.5
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6 space-y-5">
                            {/* Device & Target Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Pilih Device Pengirim</Label>
                                    <select
                                        value={selectedDevice}
                                        onChange={(e) => setSelectedDevice(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                    >
                                        {devices.filter((d) => d.status === 'connected').length > 1 && (
                                            <option value="rotation">
                                                🔀 Rotasi Otomatis ({devices.filter((d) => d.status === 'connected').length} WhatsApp Bergantian - Anti-Banned)
                                            </option>
                                        )}
                                        {devices
                                            .filter((d) => d.status === 'connected')
                                            .map((dev) => (
                                                <option key={dev.id} value={String(dev.id)}>
                                                    🟢 {dev.name} (+{dev.phone}) - AKTIF
                                                </option>
                                            ))}
                                        {devices
                                            .filter((d) => d.status !== 'connected')
                                            .map((dev) => (
                                                <option key={dev.id} value={String(dev.id)} disabled>
                                                    ⚠️ {dev.name} (Belum Terhubung - Klik Scan QR)
                                                </option>
                                            ))}
                                        {devices.length === 0 && (
                                            <option value="none" disabled>
                                                ⚠️ Belum ada WhatsApp yang ditambahkan
                                            </option>
                                        )}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold">Target Penerima (Buku Kontak)</Label>
                                        <Link href="/contacts" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline">
                                            + Kelola Kontak
                                        </Link>
                                    </div>
                                    <select
                                        value={targetAudience}
                                        onChange={(e) => setTargetAudience(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="all">
                                            👥 Semua Kontak di Buku Kontak ({totalContactsCount} Kontak)
                                        </option>
                                        {contactGroups && contactGroups.length > 0 &&
                                            contactGroups.map((g) => (
                                                <option key={g.group} value={g.group}>
                                                    🏷️ Grup: {g.group} ({g.count} Kontak)
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            {/* Campaign Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="campaignName" className="text-xs font-semibold">
                                    Nama Kampanye
                                </Label>
                                <Input
                                    id="campaignName"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    placeholder="Contoh: Flash Sale 10.10 Promo"
                                    className="h-9 text-xs"
                                />
                            </div>

                            {/* Message Template Selector */}
                            <div className="space-y-1.5 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <MessageSquareText className="h-3.5 w-3.5 text-emerald-500" />
                                        Ambil Isi Pesan dari Template
                                    </Label>
                                    <Link href="/templates" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium">
                                        + Kelola Template Pesan
                                    </Link>
                                </div>
                                <select
                                    value={selectedTemplateId}
                                    onChange={(e) => handleSelectTemplate(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                >
                                    <option value="">-- Pilih Template Tersimpan (Klik untuk Memuat Otomatis) --</option>
                                    {userTemplates && userTemplates.length > 0 ? (
                                        userTemplates.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                [{t.category}] {t.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Belum ada template tersimpan</option>
                                    )}
                                </select>
                            </div>

                            {/* Dynamic Tag Variable Pills */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <Label className="text-xs font-semibold">Variabel Personalisasi Cepat</Label>
                                    <span className="text-[11px] text-muted-foreground">Klik untuk menyisipkan ke pesan</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => insertTag('nama')}
                                        className="rounded-md border border-emerald-500/30 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer transition"
                                    >
                                        + {'{nama}'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertTag('kode_promo')}
                                        className="rounded-md border border-teal-500/30 bg-teal-50 px-2 py-1 text-[11px] font-medium text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300 cursor-pointer transition"
                                    >
                                        + {'{kode_promo}'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertTag('invoice')}
                                        className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer transition"
                                    >
                                        + {'{invoice}'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertTag('tanggal')}
                                        className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer transition"
                                    >
                                        + {'{tanggal}'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertTag('nomor')}
                                        className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer transition"
                                    >
                                        + {'{nomor}'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertTag('produk')}
                                        className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer transition"
                                    >
                                        + {'{produk}'}
                                    </button>
                                </div>
                            </div>

                            {/* Message Textarea */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="messageText" className="text-xs font-semibold">
                                        Isi Pesan WhatsApp
                                    </Label>
                                    <span className="text-[11px] text-muted-foreground">
                                        {messageText.length} karakter • {messageText.split(/\s+/).filter(Boolean).length} kata
                                    </span>
                                </div>
                                <textarea
                                    id="messageText"
                                    rows={6}
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background p-3 text-xs leading-relaxed shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-sans"
                                    placeholder="Tulis pesan blast Anda di sini..."
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    💡 Gunakan bintang (*) untuk <b>tebal</b>, garis bawah (_) untuk <i>miring</i>, dan tilde (~) untuk <del>coret</del>.
                                </p>
                            </div>

                            {/* Anti-Banned & Attachment Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border/80 bg-muted/30 p-3.5">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                            <Shield className="h-3.5 w-3.5 text-emerald-500" />
                                            Delay Acak Anti-Banned:
                                        </span>
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                            {delaySeconds} - {delaySeconds + 3} Detik
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={2}
                                        max={15}
                                        value={delaySeconds}
                                        onChange={(e) => setDelaySeconds(Number(e.target.value))}
                                        className="w-full accent-emerald-500 cursor-pointer"
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                        Delay menyerupai jeda ketik manusia untuk mencegah blokir WA.
                                    </span>
                                </div>

                                <div className="flex flex-col justify-center space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hasAttachment}
                                            onChange={(e) => setHasAttachment(e.target.checked)}
                                            className="rounded accent-emerald-600"
                                        />
                                        <span className="flex items-center gap-1">
                                            <ImageIcon className="h-3.5 w-3.5 text-teal-500" /> Sertakan Gambar Brosur Promo
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useSpintax}
                                            onChange={(e) => setUseSpintax(e.target.checked)}
                                            className="rounded accent-emerald-600"
                                        />
                                        <span className="flex items-center gap-1">
                                            <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Spintax Otomatis {'{Halo|Hai}'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Sending Progress Bar with Live Contact Status */}
                            {isSending && (
                                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 space-y-2 animate-in fade-in">
                                    <div className="flex justify-between items-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                        <span className="flex items-center gap-1.5 truncate max-w-[80%]">
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            {blastStatusText || 'Sedang Mengirim Pesan WhatsApp...'}
                                        </span>
                                        <span className="font-mono">{sendProgress}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                                            style={{ width: `${sendProgress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                                        <span>
                                            Progres:{' '}
                                            <b className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                {blastStats.sent}
                                            </b>{' '}
                                            / {blastStats.total} Terkirim
                                            {blastStats.failed > 0 && (
                                                <span className="text-rose-500 ml-1.5 font-semibold">
                                                    ({blastStats.failed} Gagal)
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3" /> Anti-Banned Active
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Success Alert Banner in Studio */}
                            {showSuccessAlert && (
                                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3.5 text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in fade-in">
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <div className="text-xs">
                                            <span className="font-bold">WhatsApp Blast Berhasil Terkirim! 🚀</span>
                                            <p className="text-[11px] opacity-90 mt-0.5">
                                                Pesan telah sukses dikirim ke nomor WhatsApp penerima. Riwayat kampanye telah disimpan di tabel di bawah.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowSuccessAlert(false)}
                                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Tutup
                                    </Button>
                                </div>
                            )}

                            {/* Submit Button Bar */}
                            <div className="flex items-center justify-between pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isSending}
                                    onClick={() => {
                                        setMessageText('');
                                        setCampaignName('');
                                        setSelectedTemplateId('');
                                    }}
                                    className="text-xs cursor-pointer"
                                >
                                    <Trash2 className="mr-1 h-3.5 w-3.5 text-muted-foreground" /> Reset Form
                                </Button>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isSending}
                                        onClick={handleOpenScheduleModal}
                                        className="text-xs cursor-pointer"
                                    >
                                        <Clock className="mr-1 h-3.5 w-3.5 text-muted-foreground" /> Jadwalkan
                                    </Button>
                                    <Button
                                        onClick={handleSendBlast}
                                        disabled={isSending || !messageText.trim()}
                                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                                    >
                                        {isSending ? (
                                            <>
                                                <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                Sedang Mengirim Blast...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-1.5 h-3.5 w-3.5" />
                                                Kirim Blast Sekarang 🚀
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Side: Realistic Phone Mockup Preview (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        <div className="w-full max-w-sm rounded-[36px] border-[6px] border-slate-800 bg-slate-950 p-2 shadow-2xl relative overflow-hidden">
                            {/* Phone Speaker Notch */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 h-3.5 w-24 rounded-full bg-slate-800 z-20" />

                            {/* Phone Screen Container */}
                            <div className="rounded-[28px] overflow-hidden bg-[#efeae2] dark:bg-[#0b141a] flex flex-col h-[560px] text-slate-900 dark:text-slate-100 relative">
                                {/* WhatsApp Header Bar */}
                                <div className="bg-[#075E54] dark:bg-[#202c33] px-3.5 pt-6 pb-2.5 text-white flex items-center justify-between shrink-0 shadow-sm z-10">
                                    <div className="flex items-center gap-2.5">
                                        <div className="relative">
                                            <div className="h-9 w-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white uppercase ring-1 ring-white/30">
                                                CS
                                            </div>
                                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-1 ring-[#075E54]" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold leading-tight flex items-center gap-1">
                                                Toko Resmi WABlast
                                                <Badge className="h-3.5 px-1 text-[8px] bg-emerald-400 text-slate-950 font-bold">
                                                    Official
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] text-emerald-200 dark:text-slate-300">Online</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-80">
                                        <MoreVertical className="h-4 w-4" />
                                    </div>
                                </div>

                                {/* Chat Wallpaper Pattern Area */}
                                <div
                                    className="flex-1 p-3 overflow-y-auto space-y-3 relative"
                                    style={{
                                        backgroundImage: `radial-gradient(circle at 10px 10px, rgba(0,0,0,0.03) 2px, transparent 0)`,
                                        backgroundSize: '16px 16px',
                                    }}
                                >
                                    {/* Security notification bubble */}
                                    <div className="mx-auto my-2 max-w-[240px] rounded-lg bg-[#ffeecd] dark:bg-[#182229] p-1.5 text-center text-[9px] text-[#54656f] dark:text-[#8696a0] shadow-xs">
                                        🔒 Pesan ini terenkripsi secara end-to-end. Tidak ada pihak luar yang dapat membaca.
                                    </div>

                                    {/* Outgoing Message Bubble (WhatsApp Style) */}
                                    <div className="flex flex-col items-end">
                                        <div className="max-w-[85%] rounded-xl rounded-tr-none bg-[#d9fdd3] dark:bg-[#005c4b] p-2.5 text-xs text-slate-800 dark:text-slate-100 shadow-xs relative">
                                            {/* Media image preview if toggled */}
                                            {hasAttachment && (
                                                <div className="mb-2 rounded-lg overflow-hidden border border-emerald-600/20 bg-emerald-900/10">
                                                    <div className="h-32 bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-400 flex flex-col items-center justify-center text-white text-center p-2">
                                                        <Sparkles className="h-7 w-7 mb-1" />
                                                        <span className="font-bold text-xs uppercase tracking-wide">
                                                            DISKON 35% FLASH SALE
                                                        </span>
                                                        <span className="text-[10px] opacity-90">Spesial Pelanggan WABlast</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Formatted Text Preview */}
                                            <div className="whitespace-pre-line leading-relaxed text-[11px]">
                                                {getPreviewText() || 'Ketik pesan pada form di sebelah kiri untuk melihat live preview...'}
                                            </div>

                                            {/* Timestamp & Double Blue Ticks */}
                                            <div className="mt-1.5 flex items-center justify-end gap-1 text-[9px] text-slate-500 dark:text-slate-300">
                                                <span>14:32</span>
                                                <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mock WhatsApp Bottom Input Bar */}
                                <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-2 flex items-center gap-2 shrink-0 border-t border-slate-200 dark:border-slate-800">
                                    <Smile className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0" />
                                    <Paperclip className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0" />
                                    <div className="flex-1 rounded-full bg-white dark:bg-[#2a3942] px-3 py-1.5 text-[11px] text-slate-400">
                                        Ketik pesan...
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0 shadow-sm">
                                        <Send className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <span className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                            <Smartphone className="h-3.5 w-3.5 text-emerald-500" /> Real-time WhatsApp Device Preview
                        </span>
                    </div>
                </div>

                {/* 4. WhatsApp Multi-Device Cards */}
                <div id="devices" className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-emerald-500" />
                                Status Perangkat WhatsApp (Multi-Device Aktif)
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Hubungkan beberapa nomor WhatsApp sekaligus untuk rotasi pesan cerdas & perlindungan anti-banned.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={fetchDevices}
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs cursor-pointer border-border hover:bg-muted"
                                title="Perbarui status koneksi semua nomor"
                            >
                                <RefreshCw className="mr-1 h-3.5 w-3.5 text-emerald-500" /> Refresh
                            </Button>
                            <Button
                                onClick={() => {
                                    setNewDeviceName(`WhatsApp ${devices.length + 1}`);
                                    setIsAddDeviceModalOpen(true);
                                }}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer h-8"
                            >
                                <Plus className="mr-1 h-3.5 w-3.5" /> + Hubungkan Nomor Baru
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {devices.map((dev, idx) => (
                            <Card
                                key={dev.id}
                                className={`shadow-xs relative overflow-hidden transition ${
                                    dev.status === 'connected'
                                        ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 to-background ring-1 ring-emerald-500/30'
                                        : dev.status === 'qr_ready' || dev.status === 'connecting'
                                        ? 'border-amber-500/50 bg-amber-950/10'
                                        : 'border-border/80'
                                }`}
                            >
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold ${
                                                    dev.status === 'connected'
                                                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/40'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                <Smartphone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                                    {dev.name}
                                                    {dev.is_default ? (
                                                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-emerald-500/40 text-emerald-500">
                                                            Utama
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-slate-500/40 text-muted-foreground">
                                                            Slot #{idx + 1}
                                                        </Badge>
                                                    )}
                                                </h3>
                                                <p className="text-xs font-mono text-muted-foreground">
                                                    {dev.phone ? `+${dev.phone}` : 'Belum Terhubung'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {dev.status === 'connected' && (
                                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border-emerald-500/30">
                                                    🟢 Terhubung
                                                </Badge>
                                            )}
                                            {(dev.status === 'qr_ready' || dev.status === 'connecting') && (
                                                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-semibold border-amber-500/30 animate-pulse">
                                                    🟡 Siap Scan
                                                </Badge>
                                            )}
                                            {dev.status !== 'connected' && dev.status !== 'qr_ready' && dev.status !== 'connecting' && (
                                                <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                                    ⚪ Belum Konek
                                                </Badge>
                                            )}

                                            {devices.length > 1 && (
                                                <button
                                                    onClick={() => handleDeleteDevice(dev)}
                                                    className="text-muted-foreground hover:text-rose-500 p-1 rounded-md transition cursor-pointer"
                                                    title="Hapus Slot WhatsApp"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/60">
                                        <div>
                                            <span className="text-muted-foreground">Nama Akun:</span>
                                            <p className="font-semibold text-foreground truncate">
                                                {dev.push_name || (dev.status === 'connected' ? 'WhatsApp Terhubung' : '-')}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Status Sesi:</span>
                                            <p className="font-semibold text-foreground">
                                                {dev.status === 'connected' ? 'Aktif & Siap Blast' : 'Menunggu Scan QR'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                                        {dev.status === 'connected' ? (
                                            <>
                                                <Button
                                                    onClick={() => {
                                                        setActiveTargetDevice(dev);
                                                        setIsTestModalOpen(true);
                                                    }}
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer flex-1"
                                                >
                                                    <Send className="mr-1 h-3 w-3" /> Tes Kirim
                                                </Button>
                                                <Button
                                                    onClick={() => handleDisconnectSpecificDevice(dev)}
                                                    size="sm"
                                                    variant="ghost"
                                                    disabled={isDisconnecting}
                                                    className="h-7 text-xs text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                                                >
                                                    <LogOut className="h-3 w-3 mr-1" /> Putuskan
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                onClick={() => handleOpenConnect(dev)}
                                                size="sm"
                                                className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                            >
                                                <QrCode className="mr-1.5 h-3.5 w-3.5" /> Scan QR / Pairing
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* 5. Recent Broadcast Campaigns Table */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="border-b border-border/60 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                                    Riwayat Kampanye WhatsApp Blast
                                </CardTitle>
                                <CardDescription>Daftar pengiriman pesan massal terakhir dan persentase keberhasilan.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input placeholder="Cari kampanye..." className="pl-8 h-8 text-xs w-44 sm:w-56" />
                                </div>
                                <Button size="sm" variant="outline" className="h-8 text-xs">
                                    <Download className="mr-1 h-3.5 w-3.5" /> Export CSV
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/60">
                                    <tr>
                                        <th className="px-4 py-3">Nama Kampanye</th>
                                        <th className="px-4 py-3">Kelompok Target</th>
                                        <th className="px-4 py-3">Device Pengirim</th>
                                        <th className="px-4 py-3">Keterkiriman</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Waktu</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {/* Real Campaigns from Database */}
                                    {scheduledCampaigns.map((sc) => {
                                        const isCompleted = sc.status === 'completed';
                                        const sentTotal = isCompleted ? (sc.sent_count ?? sc.total_recipients) : 0;
                                        const pct = sc.total_recipients > 0 ? Math.round((sentTotal / sc.total_recipients) * 100) : 100;

                                        return (
                                            <tr key={`sched-${sc.id}`} className="hover:bg-muted/30 transition bg-sky-500/[0.02]">
                                                <td className="px-4 py-3.5 font-medium text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{sc.title}</span>
                                                        <Badge
                                                            className={`text-[9px] px-1.5 py-0 h-4 font-medium ${
                                                                isCompleted
                                                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                                    : 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30'
                                                            }`}
                                                        >
                                                            {isCompleted ? 'Blast Selesai' : 'Antrean'}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        CAMP-{String(sc.id).padStart(4, '0')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-muted-foreground">
                                                    {sc.target_audience === 'all' ? 'Semua Kontak' : sc.target_audience}
                                                </td>
                                                <td className="px-4 py-3.5 text-muted-foreground text-[11px] font-mono">
                                                    {sc.device || 'WhatsApp CS'}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="space-y-1 w-32">
                                                        <div className="flex justify-between text-[10px]">
                                                            <span className="font-semibold text-foreground">
                                                                {sentTotal} / {sc.total_recipients}
                                                            </span>
                                                            <span
                                                                className={`font-semibold ${
                                                                    isCompleted
                                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                                        : 'text-sky-600 dark:text-sky-400'
                                                                }`}
                                                            >
                                                                {isCompleted ? `${pct}%` : 'Menunggu'}
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    isCompleted
                                                                        ? 'bg-emerald-500'
                                                                        : 'bg-sky-500/50 animate-pulse'
                                                                }`}
                                                                style={{ width: `${isCompleted ? pct : 15}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {isCompleted ? (
                                                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                                                            ✓ Selesai
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 text-[10px] font-medium flex items-center gap-1 w-fit">
                                                            <Clock className="h-3 w-3" /> Terjadwal ({sc.scheduled_time})
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-muted-foreground">
                                                    <div className="text-xs font-medium text-foreground">{sc.scheduled_date}</div>
                                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5" /> Pukul {sc.scheduled_time} WIB
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    {isCompleted ? (
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleOpenReport(sc, false)}
                                                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                                                title="Lihat Daftar Laporan Chat"
                                                            >
                                                                Laporan
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleOpenReport(sc, true)}
                                                                className="h-7 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/10 cursor-pointer font-medium border border-emerald-500/30 rounded-md"
                                                                title="Lihat Detail Percakapan WhatsApp"
                                                            >
                                                                Lihat Detail
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleCancelSchedule(sc.id)}
                                                            className="h-7 px-2 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Batalkan
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {INITIAL_CAMPAIGNS.map((camp) => (
                                        <tr key={camp.id} className="hover:bg-muted/30 transition">
                                            <td className="px-4 py-3.5 font-medium text-foreground">
                                                <div>{camp.title}</div>
                                                <span className="text-[10px] text-muted-foreground font-mono">{camp.id}</span>
                                            </td>
                                            <td className="px-4 py-3.5 text-muted-foreground">{camp.targetGroup}</td>
                                            <td className="px-4 py-3.5 text-muted-foreground text-[11px] font-mono">{camp.device}</td>
                                            <td className="px-4 py-3.5">
                                                <div className="space-y-1 w-32">
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="font-semibold text-foreground">
                                                            {camp.sentCount} / {camp.totalContacts}
                                                        </span>
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                            {Math.round((camp.sentCount / (camp.totalContacts || 1)) * 100)}%
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            style={{
                                                                width: `${(camp.sentCount / (camp.totalContacts || 1)) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {camp.status === 'completed' && (
                                                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                                                        ✓ Selesai
                                                    </Badge>
                                                )}
                                                {camp.status === 'running' && (
                                                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] animate-pulse">
                                                        ⏳ Sedang Berjalan
                                                    </Badge>
                                                )}
                                                {camp.status === 'scheduled' && (
                                                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                                        ⏰ Terjadwal
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-muted-foreground">{camp.createdAt}</td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleOpenReport(camp, false)}
                                                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                                        title="Lihat Daftar Laporan Chat"
                                                    >
                                                        Laporan
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleOpenReport(camp, true)}
                                                        className="h-7 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/10 cursor-pointer font-medium border border-emerald-500/30 rounded-md"
                                                        title="Lihat Detail Percakapan WhatsApp"
                                                    >
                                                        Lihat Detail
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Modal: Scan QR Code & Device Link Dialog */}
                <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
                    <DialogContent className="max-w-md p-6">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                                <QrCode className="h-5 w-5 text-emerald-500" /> Hubungkan WhatsApp: {activeTargetDevice?.name || 'Perangkat'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Tautkan nomor WhatsApp Anda dengan aman menggunakan QR Code atau Kode Pairing Multi-Device.
                            </DialogDescription>
                        </DialogHeader>

                        {/* State 1: Already Connected */}
                        {activeTargetDevice?.status === 'connected' || (deviceState.status === 'connected' && (!activeTargetDevice || activeTargetDevice.id === devices[0]?.id)) ? (
                            <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center animate-in fade-in zoom-in-95">
                                <div className="relative">
                                    <div className="h-20 w-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20">
                                        <CheckCheck className="h-10 w-10 text-emerald-500" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-background text-[10px]">
                                        ✓
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-foreground">
                                        WhatsApp Berhasil Terhubung! 🎉
                                    </h3>
                                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                        +{activeTargetDevice?.phone || deviceState.phone}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Nama Akun: <b>{activeTargetDevice?.push_name || deviceState.pushName || activeTargetDevice?.name || 'WhatsApp Anda'}</b>
                                    </p>
                                </div>

                                <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-200">
                                    Perangkat <b>{activeTargetDevice?.name || 'ini'}</b> siap digunakan untuk rotasi kirim pesan blast massal.
                                </div>

                                <div className="grid grid-cols-2 gap-2 w-full pt-2">
                                    <Button
                                        onClick={() => {
                                            setIsQrModalOpen(false);
                                            setIsTestModalOpen(true);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer"
                                    >
                                        <Send className="mr-1.5 h-3.5 w-3.5" /> Kirim Pesan Tes
                                    </Button>
                                    <Button
                                        onClick={() => activeTargetDevice && handleDisconnectSpecificDevice(activeTargetDevice)}
                                        disabled={isDisconnecting}
                                        variant="outline"
                                        className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs cursor-pointer"
                                    >
                                        {isDisconnecting ? (
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <LogOut className="mr-1.5 h-3.5 w-3.5" />
                                        )}
                                        Putuskan Koneksi
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* State 2: Not Connected (QR Scanner / Pairing Code) */
                            <div className="space-y-4 pt-2">
                                {/* Tab Switcher */}
                                <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-lg text-xs font-medium border border-border/60">
                                    <button
                                        type="button"
                                        onClick={() => setQrTab('qr')}
                                        className={`py-1.5 rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                            qrTab === 'qr'
                                                ? 'bg-background shadow-xs text-foreground font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <QrCode className="h-3.5 w-3.5 text-emerald-500" />
                                        Scan QR Code
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setQrTab('pairing')}
                                        className={`py-1.5 rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                            qrTab === 'pairing'
                                                ? 'bg-background shadow-xs text-foreground font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <KeyRound className="h-3.5 w-3.5 text-teal-500" />
                                        Kode Pairing (No HP)
                                    </button>
                                </div>

                                {qrTab === 'qr' ? (
                                    /* QR CODE VIEW */
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="relative p-3 rounded-2xl border-2 border-emerald-500/40 bg-white shadow-xl flex flex-col items-center">
                                            {activeTargetDevice?.qrCode || deviceState.qrCode ? (
                                                <div className="relative overflow-hidden rounded-xl bg-white p-2">
                                                    <img
                                                        src={activeTargetDevice?.qrCode || deviceState.qrCode || ''}
                                                        alt="WhatsApp QR Code"
                                                        className="h-60 w-60 object-contain rounded-lg"
                                                    />
                                                    {/* Animated Laser Scan Bar */}
                                                    <div className="pointer-events-none absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_12px_#10b981] animate-pulse" />
                                                </div>
                                            ) : (
                                                <div className="h-60 w-60 bg-slate-900/10 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                                                    <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-3" />
                                                    <p className="text-xs font-semibold text-foreground">
                                                        Membuat QR Code WhatsApp...
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground mt-1">
                                                        Menghubungkan ke WhatsApp Web Socket
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-2 flex items-center justify-between w-full px-2 text-[11px] text-muted-foreground">
                                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                                    </span>
                                                    Menunggu scan HP...
                                                </span>
                                                <button
                                                    onClick={() => activeTargetDevice && handleConnectSpecificDevice(activeTargetDevice)}
                                                    disabled={isConnecting}
                                                    className="inline-flex items-center gap-1 hover:text-foreground cursor-pointer underline text-[11px]"
                                                >
                                                    <RefreshCw className={`h-3 w-3 ${isConnecting ? 'animate-spin' : ''}`} />
                                                    Refresh QR
                                                </button>
                                            </div>
                                        </div>

                                        {/* Steps to Scan */}
                                        <div className="w-full text-xs text-muted-foreground space-y-2 bg-muted/40 p-3.5 rounded-xl border border-border/60">
                                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                                                <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                                                Cara Menghubungkan di HP:
                                            </p>
                                            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                                                <li>Buka aplikasi <b>WhatsApp</b> di HP Anda.</li>
                                                <li>Ketuk <b>Menu (⋮)</b> (Android) atau <b>Setelan</b> (iPhone).</li>
                                                <li>Pilih <b>Perangkat Tertaut (Linked Devices)</b>.</li>
                                                <li>Ketuk <b>Tautkan Perangkat</b> dan arahkan kamera ke QR di atas.</li>
                                            </ol>
                                        </div>
                                    </div>
                                ) : (
                                    /* PAIRING CODE VIEW */
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="pairingPhone" className="text-xs font-semibold">
                                                Nomor WhatsApp HP Anda
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="pairingPhone"
                                                    placeholder="Contoh: 081806190974 atau 62818..."
                                                    value={pairingInputPhone}
                                                    onChange={(e) => setPairingInputPhone(e.target.value)}
                                                    className="h-9 text-xs"
                                                />
                                                <Button
                                                    onClick={handleRequestPairingCode}
                                                    disabled={isRequestingPairing || !pairingInputPhone.trim()}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs whitespace-nowrap cursor-pointer"
                                                >
                                                    {isRequestingPairing ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        'Minta Kode'
                                                    )}
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                Masukkan nomor yang sedang aktif di WhatsApp pada HP Anda.
                                            </p>
                                        </div>

                                        {(activeTargetDevice?.pairingCode || deviceState.pairingCode) ? (
                                            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-center space-y-2">
                                                <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                                                    KODE PAIRING 8-DIGIT ANDA:
                                                </span>
                                                <div className="text-2xl font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 bg-background/80 py-2 rounded-lg border border-emerald-500/20 flex items-center justify-center gap-3">
                                                    <span>{activeTargetDevice?.pairingCode || deviceState.pairingCode}</span>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(activeTargetDevice?.pairingCode || deviceState.pairingCode || '');
                                                            setCopiedPairingCode(true);
                                                            setTimeout(() => setCopiedPairingCode(false), 2500);
                                                        }}
                                                        className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                                        title="Salin Kode"
                                                    >
                                                        {copiedPairingCode ? (
                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Buka notifikasi di HP WhatsApp Anda atau masuk ke <b>Perangkat Tertaut</b> &gt; <b>Tautkan dengan nomor telepon saja</b> lalu ketik kode di atas.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-xl border border-dashed border-border/80 text-center text-xs text-muted-foreground">
                                                Ketik nomor HP Anda lalu klik <b>Minta Kode</b> untuk mendapatkan 8 digit kode pairing.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Modal: Tambah Slot Nomor WhatsApp Baru */}
                <Dialog open={isAddDeviceModalOpen} onOpenChange={setIsAddDeviceModalOpen}>
                    <DialogContent className="max-w-sm p-6">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                                <Plus className="h-5 w-5 text-emerald-500" /> Tambah Akun WhatsApp
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Tambahkan nomor WhatsApp baru untuk rotasi blast atau multi-admin CS.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Nama / Label Akun WhatsApp</Label>
                                <Input
                                    value={newDeviceName}
                                    onChange={(e) => setNewDeviceName(e.target.value)}
                                    placeholder="Contoh: CS Marketing 2"
                                    className="h-9 text-xs"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleCreateDevice();
                                        }
                                    }}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Label ini untuk membedakan nomor pengirim saat blast atau penjadwalan pesan.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsAddDeviceModalOpen(false)}
                                    className="text-xs cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleCreateDevice}
                                    disabled={isCreatingDevice || !newDeviceName.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer"
                                >
                                    {isCreatingDevice ? (
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <QrCode className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    Buat & Scan QR
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 7. Modal: Kirim Pesan Uji Coba WhatsApp */}
                <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                                <Send className="h-5 w-5 text-emerald-500" /> Kirim Pesan Uji Coba (Test Send)
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Pastikan nomor WhatsApp Anda sudah benar-benar terhubung dan bisa mengirim pesan secara langsung.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-2">
                            {testResult && (
                                <div
                                    className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                                        testResult.ok
                                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30'
                                            : 'bg-rose-500/10 text-rose-800 dark:text-rose-200 border border-rose-500/30'
                                    }`}
                                >
                                    {testResult.ok ? (
                                        <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                                    )}
                                    <div className="flex-1 break-words">{testResult.message}</div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="testPhone" className="text-xs font-semibold">
                                    Nomor Tujuan (HP Penerima)
                                </Label>
                                <Input
                                    id="testPhone"
                                    placeholder="Contoh: 081806190974 atau 62818..."
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    className="h-9 text-xs"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Bisa masukkan nomor Anda sendiri atau rekan untuk menguji keterkiriman.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="testMessage" className="text-xs font-semibold">
                                    Isi Pesan WhatsApp
                                </Label>
                                <textarea
                                    id="testMessage"
                                    rows={3}
                                    value={testMessage}
                                    onChange={(e) => setTestMessage(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsTestModalOpen(false)}
                                    className="text-xs cursor-pointer"
                                >
                                    Tutup
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSendTestMessage}
                                    disabled={isSendingTest || !testPhone.trim() || !testMessage.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer"
                                >
                                    {isSendingTest ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Mengirim Pesan...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-1.5 h-3.5 w-3.5" /> Kirim Sekarang
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 8. Modal: Import Contacts */}
                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold">
                                <FileSpreadsheet className="h-5 w-5 text-teal-500" /> Import Kontak dari Excel / CSV
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Upload file spreadsheet dengan format kolom: Nama, Nomor WA, Tagihan, Kota, dll.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-2">
                            <div className="border-2 border-dashed border-border/80 rounded-xl p-6 text-center hover:border-emerald-500 transition cursor-pointer bg-muted/20">
                                <FileSpreadsheet className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                                <p className="text-xs font-semibold text-foreground">Tarik & Lepaskan File Excel Di Sini</p>
                                <p className="text-[11px] text-muted-foreground mt-1">Mendukung .xlsx, .xls, .csv hingga 50.000 kontak</p>
                                <Button size="sm" variant="outline" className="mt-3 text-xs">
                                    Pilih Berkas Komputer
                                </Button>
                            </div>

                            <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg flex items-center justify-between">
                                <span>Butuh contoh format file?</span>
                                <a href="#" className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                                    Unduh Template Excel
                                </a>
                            </div>

                            <Button
                                onClick={() => {
                                    setIsImportModalOpen(false);
                                    alert('Kontak berhasil di-import ke Buku Kontak!');
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                            >
                                Mulai Proses Import
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 9. Modal: Jadwalkan Antrean WhatsApp Blast (Anti-Conflict Queue) */}
                <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold">
                                <Clock className="h-5 w-5 text-emerald-500" /> Atur Jadwal & Antrean WhatsApp Blast
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Tentukan tanggal dan jam antrean untuk pengiriman otomatis. Sistem secara otomatis mengunci slot waktu yang sudah terisi agar tidak terjadi bentrokan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-1">
                            {/* Campaign Summary Box */}
                            <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Kampanye:</span>
                                    <span className="font-semibold text-foreground truncate max-w-[280px]">
                                        {campaignName.trim() || 'WhatsApp Blast Kampanye'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Target Penerima:</span>
                                    <Badge variant="outline" className="text-[11px] font-medium">
                                        {targetAudience === 'all' ? 'Semua Kontak' : targetAudience}
                                    </Badge>
                                </div>
                                <div className="text-[11px] text-muted-foreground bg-background/70 p-2 rounded border border-border/50 line-clamp-2">
                                    <span className="font-medium text-foreground">Isi Pesan: </span>
                                    {messageText}
                                </div>
                            </div>

                            {/* Date Picker Section */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-emerald-500" /> 1. Pilih Hari / Tanggal Antrean
                                    </Label>
                                    <span className="text-[11px] text-muted-foreground">
                                        {scheduledCampaigns.filter((c) => c.scheduled_date === scheduleDate && c.status === 'scheduled').length} antrean pada tanggal ini
                                    </span>
                                </div>

                                {/* Quick Date Chips */}
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { label: 'Hari Ini', days: 0 },
                                        { label: 'Besok', days: 1 },
                                        { label: 'Lusa', days: 2 },
                                        { label: '+3 Hari', days: 3 },
                                    ].map((preset) => {
                                        const dStr = getLocalDateString(preset.days);
                                        const isSelected = scheduleDate === dStr;
                                        return (
                                            <button
                                                key={preset.days}
                                                type="button"
                                                onClick={() => setScheduleDate(dStr)}
                                                className={`text-xs px-2.5 py-1 rounded-md border font-medium transition cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                        : 'bg-card border-border hover:border-emerald-500/50 text-foreground'
                                                }`}
                                            >
                                                {preset.label} ({dStr.slice(5)})
                                            </button>
                                        );
                                    })}
                                </div>

                                <Input
                                    type="date"
                                    min={getLocalDateString(0)}
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            {/* Time Slot Picker Section */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <Clock className="h-4 w-4 text-emerald-500" /> 2. Pilih Jam Antrean (Slot Waktu)
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground">
                                        Waktu Indonesia Barat (WIB)
                                    </span>
                                </div>

                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {[
                                        '08:00', '09:00', '10:00', '11:00',
                                        '13:00', '14:00', '15:00', '16:00',
                                        '17:00', '19:00', '20:00', '21:00',
                                    ].map((slot) => {
                                        const bookedItem = scheduledCampaigns.find(
                                            (c) =>
                                                c.scheduled_date === scheduleDate &&
                                                c.status === 'scheduled' &&
                                                normalizeTime(c.scheduled_time) === slot
                                        );
                                        const isBooked = !!bookedItem;
                                        const isSelected = normalizeTime(scheduleTime) === slot;

                                        if (isBooked) {
                                            return (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    disabled={true}
                                                    title={`Slot ${slot} SUDAH TERISI oleh antrean: "${bookedItem.title}". Tidak bisa dipilih.`}
                                                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-500/80 cursor-not-allowed select-none opacity-75 relative group transition"
                                                >
                                                    <span className="flex items-center gap-1 font-semibold text-xs line-through">
                                                        <Lock className="h-3 w-3 text-rose-500" /> {slot}
                                                    </span>
                                                    <span className="text-[9px] text-rose-600 dark:text-rose-400 font-bold truncate max-w-[65px]">
                                                        Penuh
                                                    </span>
                                                </button>
                                            );
                                        }

                                        if (isSelected) {
                                            return (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => setScheduleTime(slot)}
                                                    className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs ring-2 ring-emerald-500/20 cursor-pointer shadow-xs transition"
                                                >
                                                    <span className="flex items-center gap-1">
                                                        <Check className="h-3 w-3 text-emerald-500" /> {slot}
                                                    </span>
                                                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-normal">
                                                        Dipilih
                                                    </span>
                                                </button>
                                            );
                                        }

                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setScheduleTime(slot)}
                                                className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/80 bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 text-foreground text-xs cursor-pointer transition"
                                            >
                                                <span className="font-medium">{slot}</span>
                                                <span className="text-[9px] text-muted-foreground">Kosong</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom Time Picker */}
                                <div className="pt-1 flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Atau masukkan jam spesifik:</span>
                                    <Input
                                        type="time"
                                        value={scheduleTime}
                                        onChange={(e) => setScheduleTime(e.target.value)}
                                        className="h-8 w-32 text-xs font-mono"
                                    />
                                    <span className="text-[11px] text-muted-foreground">WIB</span>
                                </div>
                            </div>

                            {/* Anti-Conflict Validation Status Box */}
                            {isSlotConflict ? (
                                <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-3.5 flex items-start gap-3 animate-in fade-in">
                                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                                    <div className="text-xs space-y-1">
                                        <p className="font-bold text-rose-600 dark:text-rose-400">
                                            Slot Waktu Sudah Terisi / Tidak Tersedia!
                                        </p>
                                        <p className="text-rose-700/90 dark:text-rose-300 leading-relaxed">
                                            Jam <b>{scheduleTime}</b> pada tanggal <b>{scheduleDate}</b> sudah ada antrean blast:
                                            <br />
                                            <span className="font-semibold underline">"{conflictCampaign?.title}"</span> ({conflictCampaign?.total_recipients} kontak).
                                        </p>
                                        <p className="text-[11px] text-muted-foreground font-medium">
                                            ⛔ Anda <b>tidak bisa</b> menjadwalkan pada waktu ini untuk mencegah bentrok pesan. Silakan pilih jam atau hari lain yang masih berstatus <b>Kosong</b>.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <div>
                                        <span className="font-semibold">Slot Tersedia: </span>
                                        <span>Siap dijadwalkan pada <b>{scheduleDate}</b> pukul <b>{scheduleTime} WIB</b>.</span>
                                    </div>
                                </div>
                            )}

                            {/* Existing Campaigns on this Date */}
                            {scheduledCampaigns.filter((c) => c.scheduled_date === scheduleDate && c.status === 'scheduled').length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                    <Label className="text-[11px] text-muted-foreground flex items-center gap-1 font-semibold">
                                        <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                                        Daftar Antrean Lain Pada Tanggal Ini ({scheduleDate}):
                                    </Label>
                                    <div className="max-h-24 overflow-y-auto space-y-1 rounded-lg border border-border/60 bg-muted/20 p-2 text-xs">
                                        {scheduledCampaigns
                                            .filter((c) => c.scheduled_date === scheduleDate && c.status === 'scheduled')
                                            .map((sc) => (
                                                <div key={sc.id} className="flex items-center justify-between py-1 px-2 rounded bg-background/60 border border-border/40 text-[11px]">
                                                    <span className="font-medium text-foreground flex items-center gap-1.5">
                                                        <Clock className="h-3 w-3 text-sky-500" />
                                                        Pukul {sc.scheduled_time} WIB - <b>{sc.title}</b>
                                                    </span>
                                                    <Badge variant="outline" className="text-[9px] text-muted-foreground">
                                                        {sc.total_recipients} Kontak
                                                    </Badge>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsScheduleModalOpen(false)}
                                    className="text-xs cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={isSlotConflict || !scheduleTime || !scheduleDate || isSubmittingSchedule}
                                    onClick={handleConfirmSchedule}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmittingSchedule ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            Menyimpan Jadwal...
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="mr-1.5 h-3.5 w-3.5" />
                                            {isSlotConflict ? 'Pilih Jam Lain (Slot Penuh)' : 'Konfirmasi Jadwalkan Antrean'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 10. Modal: Realistic WhatsApp Chat Report (Sesuai Screenshot User) */}
                <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                    <DialogContent className="max-w-md p-0 overflow-hidden bg-slate-950 border-slate-800 text-slate-100 rounded-[36px] shadow-2xl">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Laporan WhatsApp Blast Kampanye</DialogTitle>
                            <DialogDescription>Tampilan percakapan WhatsApp real-time</DialogDescription>
                        </DialogHeader>

                        {selectedReport && (() => {
                            const { statusTime } = getFormattedReportTimes(selectedReport.time);
                            const chatList = getReportChatList(selectedReport, recentContacts);

                            return (
                                <div className="flex flex-col h-[740px] max-h-[92vh] bg-[#0b141a] text-[#e9edef] select-none relative overflow-hidden font-sans">
                                    {/* Top Control Bar with Close & Info */}
                                    <div className="bg-[#111b21] px-4 py-2 flex items-center justify-between border-b border-[#1f2c34] text-xs shrink-0 z-30">
                                        <div className="flex items-center gap-2 truncate max-w-[280px]">
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] px-1.5 py-0 h-4">
                                                ✓ Selesai
                                            </Badge>
                                            <span className="font-semibold truncate text-[#e9edef]">{selectedReport.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsReportModalOpen(false)}
                                                className="text-[#8696a0] hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
                                                title="Tutup"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* IF A SPECIFIC CHAT IS CLICKED -> DISPLAY CONVERSATION DETAIL (MATCHES USER SCREENSHOT EXACTLY) */}
                                    {selectedChatRecipient ? (
                                        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#0b141a]">
                                            {/* 1. Android Status Bar (Exact to Screenshot) */}
                                            <div className="flex items-center justify-between px-5 pt-3 pb-1 text-xs text-[#8696a0] font-medium tracking-tight bg-[#202c33]/40 shrink-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-[#e9edef] text-[13px]">{statusTime}</span>
                                                    <span className="text-[10px]">↗</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px]">
                                                    <Moon className="h-3 w-3 text-[#8696a0]" />
                                                    <span className="text-[10px] font-bold text-[#e9edef]">4G+</span>
                                                    <div className="flex items-center gap-0.5">
                                                        <span className="inline-block w-1 h-2 bg-[#e9edef] rounded-xs" />
                                                        <span className="inline-block w-1 h-2.5 bg-[#e9edef] rounded-xs" />
                                                        <span className="inline-block w-1 h-3 bg-[#e9edef] rounded-xs" />
                                                        <span className="inline-block w-1 h-3.5 bg-[#e9edef] rounded-xs" />
                                                    </div>
                                                    <Wifi className="h-3.5 w-3.5 text-[#e9edef]" />
                                                    <div className="flex items-center border border-[#8696a0] rounded-sm px-1 py-0.2 text-[9px] text-[#e9edef] font-mono">
                                                        74
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. Top WhatsApp Header (Back, Recipient Profile Photo / Avatar, Number, Video, Call, More) */}
                                            <div className="bg-[#202c33] px-3 py-2.5 text-white flex items-center justify-between shrink-0 shadow-md z-10">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedChatRecipient(null)}
                                                        className="text-[#e9edef] hover:text-white p-1 -ml-1 cursor-pointer transition"
                                                        title="Kembali ke Daftar Chat"
                                                    >
                                                        <ArrowLeft className="h-5 w-5" />
                                                    </button>
                                                    {/* Recipient Profile Photo / Avatar */}
                                                    <div className="h-9 w-9 rounded-full overflow-hidden bg-[#182229] border border-white/10 shrink-0 flex items-center justify-center shadow-inner relative">
                                                        {selectedChatRecipient.avatarUrl ? (
                                                            <img
                                                                src={selectedChatRecipient.avatarUrl}
                                                                alt={selectedChatRecipient.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : selectedChatRecipient.avatarType === 'mecha' ? (
                                                            <svg viewBox="0 0 64 64" className="w-full h-full object-cover">
                                                                <rect width="64" height="64" fill="#0d1419" />
                                                                <path d="M8 56 L18 42 L46 42 L56 56 Z" fill="#1e293b" />
                                                                <path d="M22 42 L26 50 L38 50 L42 42 Z" fill="#334155" />
                                                                <rect x="29" y="44" width="6" height="5" fill="#f97316" />
                                                                <polygon points="32,10 48,22 44,40 32,46 20,40 16,22" fill="#24303c" stroke="#475569" strokeWidth="1.5" />
                                                                <polygon points="16,22 8,14 14,28" fill="#3b82f6" />
                                                                <polygon points="48,22 56,14 50,28" fill="#3b82f6" />
                                                                <polygon points="24,26 40,26 38,36 32,40 26,36" fill="#0f172a" />
                                                                <path d="M25 28 L39 28 L36 32 L28 32 Z" fill="#f97316" />
                                                                <circle cx="32" cy="30" r="1.5" fill="#fff" />
                                                                <polygon points="32,12 36,18 32,22 28,18" fill="#f97316" />
                                                                <rect x="31" y="14" width="2" height="6" fill="#fff" opacity="0.7" />
                                                            </svg>
                                                        ) : (
                                                            <div className={`h-full w-full ${selectedChatRecipient.avatarBg} flex items-center justify-center font-bold text-xs text-white uppercase`}>
                                                                {selectedChatRecipient.avatarInitial}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="leading-tight truncate">
                                                        <h4 className="text-[15px] font-medium text-[#e9edef] tracking-tight truncate">
                                                            {selectedChatRecipient.name}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-[#e9edef]">
                                                    <Video className="h-5 w-5 cursor-pointer hover:text-white transition" />
                                                    <Phone className="h-5 w-5 cursor-pointer hover:text-white transition" />
                                                    <MoreVertical className="h-5 w-5 cursor-pointer hover:text-white transition" />
                                                </div>
                                            </div>

                                            {/* 3. Chat Messages Body with WhatsApp Doodle Background */}
                                            <div
                                                className="flex-1 p-3 overflow-y-auto space-y-2.5 relative flex flex-col justify-start"
                                                style={{
                                                    backgroundColor: '#0b141a',
                                                    backgroundImage: `radial-gradient(circle at 12px 12px, rgba(255,255,255,0.04) 1.5px, transparent 0)`,
                                                    backgroundSize: '24px 24px',
                                                }}
                                            >
                                                {/* Floating Date Pill: Hari ini */}
                                                <div className="mx-auto my-0.5">
                                                    <span className="bg-[#182229] text-[#8696a0] text-[11px] font-medium px-3.5 py-1 rounded-lg shadow-sm border border-white/5 inline-block">
                                                        Hari ini
                                                    </span>
                                                </div>

                                                {/* End-to-end Encryption Yellow-Gold Notice Banner */}
                                                <div className="mx-2 my-0.5 rounded-xl bg-[#182229] px-3.5 py-2 text-center shadow-xs border border-white/5 max-w-[390px] self-center">
                                                    <p className="text-[#ffd279] text-[10.5px] leading-relaxed">
                                                        <span className="inline-block mr-1">🔒</span>
                                                        Pesan dan telepon terenkripsi secara end-to-end. Hanya orang di obrolan ini yang bisa membaca, mendengarkan, atau membagikannya.{' '}
                                                        <span className="font-semibold underline cursor-pointer hover:text-amber-200">
                                                            Pelajari selengkapnya.
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Interactive Delivery Status Badge */}
                                                <div className="flex items-center justify-center my-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const nextTicks =
                                                                selectedChatRecipient.ticks === 'single'
                                                                    ? 'double'
                                                                    : selectedChatRecipient.ticks === 'double'
                                                                    ? 'blue'
                                                                    : 'single';
                                                            setSelectedChatRecipient({ ...selectedChatRecipient, ticks: nextTicks });
                                                        }}
                                                        className="flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-[#182229] border border-white/10 hover:border-emerald-500/40 text-[#8696a0] transition cursor-pointer"
                                                        title="Klik untuk mengubah simulasi status kirim"
                                                    >
                                                        <span>Status Kirim:</span>
                                                        {selectedChatRecipient.ticks === 'blue' && (
                                                            <span className="flex items-center gap-1 text-sky-400 font-medium">
                                                                <CheckCheck className="h-3 w-3" /> Dibaca
                                                            </span>
                                                        )}
                                                        {selectedChatRecipient.ticks === 'double' && (
                                                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                                                <CheckCheck className="h-3 w-3" /> Diterima
                                                            </span>
                                                        )}
                                                        {selectedChatRecipient.ticks === 'single' && (
                                                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                                                                <Check className="h-3 w-3" /> Terkirim
                                                            </span>
                                                        )}
                                                        {selectedChatRecipient.ticks === 'clock' && (
                                                            <span className="flex items-center gap-1 text-amber-400 font-medium">
                                                                <Clock className="h-3 w-3" /> Antrean
                                                            </span>
                                                        )}
                                                        <span className="text-[9px] text-[#8696a0]/50 ml-0.5 hover:text-white">⇄ ganti</span>
                                                    </button>
                                                </div>

                                                {/* Outgoing Message Bubble (Right-aligned WhatsApp Dark Green) */}
                                                <div className="flex justify-end pt-1 pr-1.5 pl-3">
                                                    <div className="relative max-w-[92%] sm:max-w-[86%] rounded-2xl rounded-tr-xs bg-[#005c4b] p-3.5 text-[#e9edef] shadow-md">
                                                        {/* WhatsApp Speech Bubble Tail */}
                                                        <svg
                                                            className="absolute -top-0 -right-2 text-[#005c4b] h-3 w-2.5 fill-current"
                                                            viewBox="0 0 10 12"
                                                        >
                                                            <path d="M0 0 L10 0 C4 3 2 7 0 12 Z" />
                                                        </svg>

                                                        {/* Message Text with line breaks */}
                                                        <div className="whitespace-pre-line text-[12.5px] leading-[1.5] text-[#e9edef] font-normal tracking-wide">
                                                            {selectedChatRecipient.message}
                                                        </div>

                                                        {/* Bottom timestamp and dynamic check tick matching recipient */}
                                                        <div className="mt-1 flex items-center justify-end gap-1 text-[11px]">
                                                            <span className="text-[11px] text-[#8696a0] font-normal">
                                                                {selectedChatRecipient.time || statusTime.replace(':', '.')}
                                                            </span>
                                                            {selectedChatRecipient.ticks === 'blue' && (
                                                                <span title="Dibaca oleh penerima" className="flex items-center">
                                                                    <CheckCheck className="h-3.5 w-3.5 text-sky-400 stroke-[2.2]" />
                                                                </span>
                                                            )}
                                                            {selectedChatRecipient.ticks === 'double' && (
                                                                <span title="Tersampaikan ke HP penerima" className="flex items-center">
                                                                    <CheckCheck className="h-3.5 w-3.5 text-[#8696a0] stroke-[2.2]" />
                                                                </span>
                                                            )}
                                                            {selectedChatRecipient.ticks === 'single' && (
                                                                <span title="Terkirim ke server WhatsApp" className="flex items-center">
                                                                    <Check className="h-3.5 w-3.5 text-[#8696a0] stroke-[2.2]" />
                                                                </span>
                                                            )}
                                                            {selectedChatRecipient.ticks === 'clock' && (
                                                                <span title="Menunggu pengiriman" className="flex items-center">
                                                                    <Clock className="h-3 w-3 text-[#8696a0]" />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 4. Chat Bottom Input & Mic Bar */}
                                            <div className="bg-[#0b141a] px-2 py-2 flex items-center gap-1.5 shrink-0 z-10 border-t border-[#1f2c34]/20">
                                                <div className="flex-1 bg-[#202c33] rounded-full px-3 py-2 flex items-center gap-2.5 text-[#8696a0]">
                                                    <Smile className="h-6 w-6 text-[#8696a0] hover:text-white cursor-pointer shrink-0" />
                                                    <span className="flex-1 text-[14.5px] text-[#8696a0] select-none">Ketik pesan</span>
                                                    <Paperclip className="h-5 w-5 text-[#8696a0] -rotate-45 hover:text-white cursor-pointer shrink-0" />
                                                    <Camera className="h-5 w-5 text-[#8696a0] hover:text-white cursor-pointer shrink-0" />
                                                </div>
                                                <div className="h-11 w-11 rounded-full bg-[#00a884] flex items-center justify-center text-[#0b141a] shrink-0 shadow-lg cursor-pointer hover:bg-[#00c298] transition">
                                                    <Mic className="h-5 w-5 text-[#0b141a] fill-current" />
                                                </div>
                                            </div>

                                            {/* 5. Android Navigation Gesture Indicator */}
                                            <div className="bg-[#0b141a] pb-2 pt-0.5">
                                                <div className="w-32 h-1 bg-white/70 rounded-full mx-auto" />
                                            </div>
                                        </div>
                                    ) : (
                                        /* MAIN WHATSAPP HOME / CHAT LIST (EXACT USER SCREENSHOT) */
                                        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                                            {/* 1. Android Status Bar with Dynamic Time */}
                                            <div className="flex items-center justify-between px-5 pt-3 pb-1 text-xs text-[#8696a0] font-medium tracking-tight">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-[#e9edef] text-[13px]">{statusTime}</span>
                                                    <span className="text-[10px]">↗</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px]">
                                                    <Moon className="h-3 w-3 text-[#8696a0]" />
                                                    <span className="text-[10px] font-bold text-[#e9edef]">4G+</span>
                                                    <div className="flex items-center gap-0.5">
                                                        <span className="inline-block w-1 h-2 bg-[#e9edef] rounded-xs" />
                                                        <span className="inline-block w-1 h-2.5 bg-[#e9edef] rounded-xs" />
                                                        <span className="inline-block w-1 h-3 bg-[#e9edef] rounded-xs" />
                                                        <span className="inline-block w-1 h-3.5 bg-[#e9edef] rounded-xs" />
                                                    </div>
                                                    <Wifi className="h-3.5 w-3.5 text-[#e9edef]" />
                                                    <div className="flex items-center border border-[#8696a0] rounded-sm px-1 py-0.2 text-[9px] text-[#e9edef]">
                                                        74
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. WhatsApp Header Title */}
                                            <div className="flex items-center justify-between px-4 py-2">
                                                <span className="text-xl font-bold text-[#e9edef] tracking-tight">WhatsApp</span>
                                                <div className="flex items-center gap-4 text-[#8696a0]">
                                                    <Camera className="h-5 w-5 hover:text-white cursor-pointer" />
                                                    <MoreVertical className="h-5 w-5 hover:text-white cursor-pointer" />
                                                </div>
                                            </div>

                                            {/* 3. Search Bar: "Tanya Meta AI atau cari" */}
                                            <div className="px-3.5 py-1">
                                                <div className="flex items-center gap-3 bg-[#202c33] rounded-full px-4 py-2.5 text-[#8696a0] cursor-pointer hover:bg-[#202c33]/80 transition">
                                                    <Search className="h-4 w-4 text-[#8696a0] shrink-0" />
                                                    <span className="text-xs text-[#8696a0]">Tanya Meta AI atau cari</span>
                                                </div>
                                            </div>

                                            {/* 4. Notice Banner (Username Coming Soon) */}
                                            <div className="mx-3.5 my-2 p-3 rounded-2xl bg-[#00271c] border border-emerald-900/40 flex items-start gap-3 relative">
                                                <div className="h-9 w-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-lg ring-1 ring-emerald-500/30 shrink-0">
                                                    <AtSign className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 pr-4">
                                                    <h5 className="text-xs font-semibold text-white leading-tight">Nama pengguna akan segera hadir</h5>
                                                    <p className="text-[11px] text-[#8696a0] mt-0.5 leading-snug">
                                                        Jaga agar nomor telepon tetap privat dengan nama pengguna.{' '}
                                                        <span className="text-[#25d366] font-medium hover:underline cursor-pointer">
                                                            Pesan nama pengguna Anda
                                                        </span>
                                                    </p>
                                                </div>
                                                <button className="absolute top-2.5 right-2.5 text-[#8696a0] hover:text-white p-0.5">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            {/* 5. Scrollable Chat List */}
                                            <div className="flex-1 overflow-y-auto divide-y divide-[#1f2c34]/30 px-1">
                                                {chatList.map((chat) => (
                                                    <div
                                                        key={chat.id}
                                                        onClick={() =>
                                                            setSelectedChatRecipient({
                                                                name: chat.name,
                                                                phone: chat.phone,
                                                                time: chat.time,
                                                                message: selectedReport.message,
                                                                avatarInitial: chat.avatarText,
                                                                avatarBg: chat.avatarBg,
                                                                avatarType: chat.avatarType,
                                                                avatarUrl: chat.avatarUrl,
                                                                ticks: chat.ticks,
                                                            })
                                                        }
                                                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33]/40 cursor-pointer transition rounded-xl"
                                                    >
                                                        {/* Avatar */}
                                                        <div className="h-11 w-11 rounded-full overflow-hidden shrink-0 shadow-xs flex items-center justify-center bg-[#182229] border border-white/10">
                                                            {chat.avatarUrl ? (
                                                                <img src={chat.avatarUrl} alt={chat.name} className="h-full w-full object-cover" />
                                                            ) : chat.avatarType === 'mecha' ? (
                                                                <svg viewBox="0 0 64 64" className="w-full h-full object-cover">
                                                                    <rect width="64" height="64" fill="#0d1419" />
                                                                    <path d="M8 56 L18 42 L46 42 L56 56 Z" fill="#1e293b" />
                                                                    <path d="M22 42 L26 50 L38 50 L42 42 Z" fill="#334155" />
                                                                    <rect x="29" y="44" width="6" height="5" fill="#f97316" />
                                                                    <polygon points="32,10 48,22 44,40 32,46 20,40 16,22" fill="#24303c" stroke="#475569" strokeWidth="1.5" />
                                                                    <polygon points="16,22 8,14 14,28" fill="#3b82f6" />
                                                                    <polygon points="48,22 56,14 50,28" fill="#3b82f6" />
                                                                    <polygon points="24,26 40,26 38,36 32,40 26,36" fill="#0f172a" />
                                                                    <path d="M25 28 L39 28 L36 32 L28 32 Z" fill="#f97316" />
                                                                    <circle cx="32" cy="30" r="1.5" fill="#fff" />
                                                                    <polygon points="32,12 36,18 32,22 28,18" fill="#f97316" />
                                                                    <rect x="31" y="14" width="2" height="6" fill="#fff" opacity="0.7" />
                                                                </svg>
                                                            ) : (
                                                                <div className={`h-full w-full ${chat.avatarBg} flex items-center justify-center font-bold text-sm text-white`}>
                                                                    {chat.avatarText}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-xs font-semibold text-[#e9edef] truncate">{chat.name}</h4>
                                                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                                    <span className="text-[10px] text-[#8696a0] font-mono">{chat.time}</span>
                                                                    <span className="text-[9px] text-emerald-400 font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition">
                                                                        Detail
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-0.5">
                                                                <div className="flex items-center gap-1 text-[11px] text-[#8696a0] truncate max-w-[210px]">
                                                                    {chat.ticks === 'blue' && (
                                                                        <CheckCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                                                                    )}
                                                                    {chat.ticks === 'double' && (
                                                                        <CheckCheck className="h-3.5 w-3.5 text-[#8696a0] shrink-0" />
                                                                    )}
                                                                    {chat.ticks === 'single' && (
                                                                        <Check className="h-3.5 w-3.5 text-[#8696a0] shrink-0" />
                                                                    )}
                                                                    <span className="truncate">{chat.messageSnippet}</span>
                                                                </div>
                                                                {chat.isPinned && (
                                                                    <Pin className="h-3.5 w-3.5 text-[#8696a0] shrink-0 ml-1.5 rotate-45" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Security Footer Notice */}
                                                <div className="py-4 text-center text-[10px] text-[#8696a0] flex items-center justify-center gap-1">
                                                    <span>🔒 Pesan pribadi Anda</span>
                                                    <span className="text-[#25d366]">terenkripsi secara end-to-end</span>
                                                </div>
                                            </div>

                                            {/* 6. Floating Action Buttons (Meta AI & WhatsApp FAB) */}
                                            <div className="absolute bottom-20 right-4 flex flex-col items-center gap-2.5 z-20">
                                                {/* Purple Meta AI Button */}
                                                <button
                                                    type="button"
                                                    className="h-10 w-10 rounded-full bg-[#1f2c34] p-0.5 shadow-lg border border-purple-500/40 flex items-center justify-center cursor-pointer hover:scale-105 transition"
                                                >
                                                    <div className="h-full w-full rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                                                        <Sparkles className="h-4 w-4 text-white" />
                                                    </div>
                                                </button>

                                                {/* Green WhatsApp Square-Round FAB */}
                                                <button
                                                    type="button"
                                                    className="h-13 w-13 rounded-2xl bg-[#25d366] text-[#0b141a] flex items-center justify-center shadow-xl hover:bg-[#20ba59] transition cursor-pointer"
                                                >
                                                    <Plus className="h-6 w-6 stroke-[3]" />
                                                </button>
                                            </div>

                                            {/* 7. Bottom Navigation Bar */}
                                            <div className="bg-[#0b141a] border-t border-[#1f2c34] px-3 pt-2 pb-1 shrink-0 z-10">
                                                <div className="flex items-center justify-around text-center text-[11px]">
                                                    {/* Tab 1: Chat (Active) */}
                                                    <div className="flex flex-col items-center cursor-pointer">
                                                        <div className="px-4 py-0.5 rounded-full bg-[#103629] text-[#25d366]">
                                                            <MessageSquare className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold text-[#25d366] text-[10px] mt-0.5">Chat</span>
                                                    </div>

                                                    {/* Tab 2: Pembaruan */}
                                                    <div className="flex flex-col items-center text-[#8696a0] hover:text-[#e9edef] cursor-pointer">
                                                        <div className="px-4 py-0.5">
                                                            <RefreshCw className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-[10px] mt-0.5">Pembaruan</span>
                                                    </div>

                                                    {/* Tab 3: Komunitas */}
                                                    <div className="flex flex-col items-center text-[#8696a0] hover:text-[#e9edef] cursor-pointer">
                                                        <div className="px-4 py-0.5">
                                                            <Users className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-[10px] mt-0.5">Komunitas</span>
                                                    </div>

                                                    {/* Tab 4: Panggilan */}
                                                    <div className="flex flex-col items-center text-[#8696a0] hover:text-[#e9edef] cursor-pointer">
                                                        <div className="px-4 py-0.5">
                                                            <Phone className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-[10px] mt-0.5">Panggilan</span>
                                                    </div>
                                                </div>

                                                {/* Android Gesture Bar */}
                                                <div className="w-28 h-1 bg-[#8696a0]/40 rounded-full mx-auto mt-2 mb-0.5" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
