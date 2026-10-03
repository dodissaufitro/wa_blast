import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    MessageSquare,
    Radio,
    ShieldCheck,
    Smartphone,
    Users,
    Zap,
} from 'lucide-react';
import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full flex-col lg:grid lg:grid-cols-12 bg-background">
            {/* Left Column: Visual Showcase (WhatsApp Blast Branding) */}
            <div className="relative hidden lg:col-span-6 xl:col-span-7 lg:flex flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white border-r border-slate-800/80">
                {/* Ambient glowing orbs */}
                <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
                <div className="pointer-events-none absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-teal-500/15 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-emerald-600/20 blur-[130px]" />

                {/* Subtle Grid Pattern Overlay */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px',
                    }}
                />

                {/* Top: Logo & Version */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <AppLogoIcon className="size-10 transition-transform duration-300 group-hover:scale-105" />
                            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold tracking-tight text-white">WABlast</span>
                                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                                    PRO v2.5
                                </span>
                            </div>
                            <span className="text-xs text-slate-400">WhatsApp Broadcast & Automation Suite</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-slate-300 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        </span>
                        <span>API Server: <b>Normal (12ms)</b></span>
                    </div>
                </div>

                {/* Middle: Feature Highlights & Interactive-style Glass Preview */}
                <div className="relative z-10 my-auto py-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20 mb-6">
                        <Zap className="h-3.5 w-3.5" /> Solusi Blast Terpercaya 2026
                    </div>

                    <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
                        Kirim Jutaan Pesan WhatsApp <br className="hidden xl:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-300">
                            Cepat, Aman & Anti-Banned
                        </span>
                    </h1>

                    <p className="mt-4 text-base text-slate-300/90 max-w-lg leading-relaxed">
                        Tingkatkan penjualan, konfirmasi pesanan, dan follow-up prospek secara otomatis dengan sistem multi-device, smart spintax delay, dan analitik real-time.
                    </p>

                    {/* Interactive Showcase Mockup Card */}
                    <div className="mt-8 grid gap-3 max-w-lg">
                        {/* Mock Broadcast Progress */}
                        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-900/80 shadow-lg">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                                        <Radio className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Campaign: Promo Super Sale 10.10</p>
                                        <p className="text-[11px] text-slate-400">Target: 5.400 Kontak Terverifikasi</p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                                    Sedang Berjalan
                                </span>
                            </div>
                            <div className="mt-3">
                                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                                    <span>Terkirim: <b>5.292</b> / 5.400</span>
                                    <span className="text-emerald-400 font-semibold">98.0% Sukses</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: '98%' }} />
                                </div>
                            </div>
                        </div>

                        {/* Feature Badges Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2.5 rounded-lg border border-slate-800/70 bg-slate-900/40 p-3 backdrop-blur-sm">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-500/15 text-teal-400">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-semibold text-white leading-tight">Anti-Banned System</h2>
                                    <p className="text-[10px] text-slate-400">Smart human delay & spintax</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-lg border border-slate-800/70 bg-slate-900/40 p-3 backdrop-blur-sm">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
                                    <Smartphone className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-semibold text-white leading-tight">Multi-Device QR</h2>
                                    <p className="text-[10px] text-slate-400">Scan via WhatsApp Web</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom: Trust & Stats */}
                <div className="relative z-10 border-t border-slate-800/60 pt-6">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <span>Tingkat Keterkiriman <b>99.8%</b></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-teal-400" />
                            <span><b>5.000+</b> Bisnis Aktif</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-emerald-400" />
                            <span><b>12.5M+</b> Pesan Terkirim</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Auth Form */}
            <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:col-span-6 xl:col-span-5 lg:px-12 bg-background">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile Logo Header */}
                    <div className="mb-8 flex flex-col items-center text-center lg:hidden">
                        <Link href="/" className="mb-3 flex items-center gap-2">
                            <AppLogoIcon className="size-10" />
                            <span className="text-2xl font-bold tracking-tight text-foreground">WABlast</span>
                            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                PRO
                            </span>
                        </Link>
                        <p className="text-xs text-muted-foreground">WhatsApp Broadcast & Marketing Platform</p>
                    </div>

                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 mb-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Portal Aplikasi WABlast
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                    </div>

                    {/* Form Container */}
                    <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm dark:shadow-none">
                        {children}
                    </div>

                    {/* Footer note */}
                    <div className="mt-8 text-center text-xs text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} WABlast Pro. Seluruh hak cipta dilindungi.</p>
                        <p className="mt-1 text-[11px] opacity-75">Platform aman dengan enkripsi SSL 256-bit.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
