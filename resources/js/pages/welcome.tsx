import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    MessageSquare,
    Radio,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Users,
    Zap,
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
            <Head title="WABlast Pro - WhatsApp Broadcast & Automation Platform" />

            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-emerald-500/15 blur-[150px]" />
            <div className="pointer-events-none absolute top-96 -left-40 h-[400px] w-[500px] rounded-full bg-teal-500/10 blur-[140px]" />
            <div className="pointer-events-none absolute bottom-20 -right-40 h-[400px] w-[500px] rounded-full bg-emerald-600/10 blur-[140px]" />

            {/* Subtle Grid Overlay */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '32px 32px',
                }}
            />

            {/* Navigation Bar */}
            <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-3">
                        <AppLogoIcon className="size-9" />
                        <div className="flex items-center gap-1.5">
                            <span className="text-xl font-bold tracking-tight text-white">WABlast</span>
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                                PRO
                            </span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
                        <a href="#fitur" className="hover:text-emerald-400 transition">Fitur Utama</a>
                        <a href="#keunggulan" className="hover:text-emerald-400 transition">Anti-Banned</a>
                        <a href="#statistik" className="hover:text-emerald-400 transition">Statistik</a>
                    </div>

                    <div className="flex items-center gap-3">
                        {auth?.user ? (
                            <Link href={route('dashboard')}>
                                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer shadow-md shadow-emerald-600/20">
                                    Buka Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')}>
                                    <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer">
                                        Masuk
                                    </Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium cursor-pointer shadow-md shadow-emerald-600/25">
                                        Daftar Gratis <ArrowRight className="ml-1.5 h-4 w-4" />
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-8 backdrop-blur-md">
                    <Sparkles className="h-4 w-4" /> Solusi Blast WhatsApp Terandal No. 1 di Indonesia
                </div>

                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
                    Kirim Broadcast WhatsApp Massal, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-300">
                        Cepat, Tepat & Anti-Banned
                    </span>
                </h1>

                <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Tingkatkan omzet penjualan hingga 300% dengan kampanye promosi otomatis, personalisasi pesan nama pelanggan, import Excel, dan delay cerdas.
                </p>

                {/* Call To Actions */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href={auth?.user ? route('dashboard') : route('register')}>
                        <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 cursor-pointer">
                            Mulai Blast Sekarang Gratis <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href={route('login')}>
                        <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 cursor-pointer">
                            Masuk ke Dashboard Demo
                        </Button>
                    </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Multi-Device Scan QR
                    </span>
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Smart Spintax Delay Anti-Blokir
                    </span>
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Import Excel / CSV Sekali Klik
                    </span>
                </div>

                {/* Dashboard Preview Mockup */}
                <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:p-5 shadow-2xl backdrop-blur-xl max-w-5xl mx-auto">
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950 p-4 sm:p-6 text-left">
                        {/* Mock header bar */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                                <span className="ml-2 text-xs text-slate-400 font-mono">dashboard.wablast.pro</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                                <span className="text-xs text-emerald-400 font-semibold">Instance Online (+62 812-8899-XXXX)</span>
                            </div>
                        </div>

                        {/* Mock Metric Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                                <p className="text-xs text-slate-400">Pesan Terkirim</p>
                                <p className="text-xl font-bold text-white mt-1">142.850</p>
                                <span className="text-[11px] text-emerald-400 font-medium">↑ 98.4% sukses</span>
                            </div>
                            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                                <p className="text-xs text-slate-400">Tingkat Baca</p>
                                <p className="text-xl font-bold text-white mt-1">92.7%</p>
                                <span className="text-[11px] text-teal-400 font-medium">✓✓ Blue ticks</span>
                            </div>
                            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                                <p className="text-xs text-slate-400">Sisa Kuota Hari Ini</p>
                                <p className="text-xl font-bold text-white mt-1">8.420</p>
                                <span className="text-[11px] text-slate-400">dari 10.000 / hari</span>
                            </div>
                            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                                <p className="text-xs text-slate-400">Device Aktif</p>
                                <p className="text-xl font-bold text-white mt-1">4 / 4</p>
                                <span className="text-[11px] text-emerald-400 font-medium">WhatsApp Web OK</span>
                            </div>
                        </div>

                        {/* Mock Live Blast Progress */}
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                        <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                                        Kampanye Aktif: Promo Akhir Bulan Pelanggan VIP
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Delay: 4-8 Detik (Human Simulation) • Spintax Aktif</p>
                                </div>
                                <span className="self-start sm:self-center rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                                    3.420 / 3.500 Terkirim (97.7%)
                                </span>
                            </div>
                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '97.7%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="fitur" className="relative z-10 border-t border-slate-800/80 bg-slate-900/30 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Fitur Dirancang Untuk Hasil Nyata</span>
                        <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Semua Kebutuhan Broadcast WhatsApp Ada Di Sini</h2>
                        <p className="mt-3 text-base text-slate-400">Tanpa biaya langganan resmi per-pesan yang mahal, cukup hubungkan WhatsApp Anda dan mulai kirim.</p>
                    </div>

                    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 hover:border-emerald-500/40 transition">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 mb-4">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Multi-Device WhatsApp</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                Scan QR langsung dari WhatsApp HP Anda tanpa perantara rumit. Dukungan multi-nomor untuk pembagian beban blast.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 hover:border-emerald-500/40 transition">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400 mb-4">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Smart Anti-Banned & Delay</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                Algoritma delay acak menyerupai ketikan manusia dan spintax otomatis agar pesan tidak terdeteksi sebagai spam.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 hover:border-emerald-500/40 transition">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 mb-4">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Import Excel & Google Sheet</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                Upload ribuan nomor kontak lengkap dengan kolom kustom seperti nama, nominal tagihan, nomor faktur, dan kode unik.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 hover:border-emerald-500/40 transition">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400 mb-4">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Pesan Dinamis & Personalisasi</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                Sisipkan tag variabel otomatis seperti <code className="text-emerald-400">{'{nama}'}</code> dan <code className="text-emerald-400">{'{tagihan}'}</code> agar pesan terasa sangat personal.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 hover:border-emerald-500/40 transition">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 mb-4">
                                <Clock className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Jadwal Pengiriman Otomatis</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                Atur waktu blast di jam-jam prime time saat calon pembeli paling aktif membuka pesan WhatsApp mereka.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 hover:border-emerald-500/40 transition">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400 mb-4">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Laporan & Analisis Real-Time</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                Pantau status centang satu, centang dua, dan terbaca secara akurat untuk setiap nomor penerima.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA Banner */}
            <section className="relative z-10 border-t border-slate-800 py-16 text-center">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <h2 className="text-3xl font-extrabold text-white">Siap Melipatgandakan Omzet Anda Lewat WhatsApp?</h2>
                    <p className="mt-3 text-slate-400">Daftar sekarang dan nikmati 500 kuota blast gratis tanpa syarat kartu kredit.</p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link href={route('register')}>
                            <Button size="lg" className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold cursor-pointer">
                                Daftar Gratis Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
                <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <AppLogoIcon className="size-6" />
                        <span className="font-semibold text-slate-300">WABlast Pro</span>
                        <span>&copy; {new Date().getFullYear()} Hak Cipta Dilindungi.</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                        <a href="#" className="hover:text-emerald-400">Kebijakan Privasi</a>
                        <a href="#" className="hover:text-emerald-400">Syarat Ketentuan</a>
                        <a href="#" className="hover:text-emerald-400">Bantuan WhatsApp</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
