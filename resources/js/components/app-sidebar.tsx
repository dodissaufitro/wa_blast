import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Bot,
    Clock,
    FileCode2,
    HelpCircle,
    LayoutGrid,
    MessageSquareText,
    Send,
    Smartphone,
    Users,
    Zap,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Kirim Blast',
        url: '/dashboard#blast',
        icon: Send,
    },
    {
        title: 'Device Manager',
        url: '/dashboard#devices',
        icon: Smartphone,
    },
    {
        title: 'Buku Kontak',
        url: '/contacts',
        icon: Users,
    },
    {
        title: 'Template Pesan',
        url: '/templates',
        icon: MessageSquareText,
    },
    {
        title: 'Pesan Terjadwal',
        url: '/dashboard#scheduled',
        icon: Clock,
    },
    {
        title: 'Auto Responder',
        url: '/dashboard#bot',
        icon: Bot,
    },
    {
        title: 'Log Pengiriman',
        url: '/dashboard#logs',
        icon: BarChart3,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Dokumentasi API',
        url: '#api-docs',
        icon: FileCode2,
    },
    {
        title: 'Pusat Bantuan',
        url: '#support',
        icon: HelpCircle,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border/40 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/40 pt-3">
                {/* Active device pill */}
                <div className="mx-2 mb-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs group-data-[collapsible=icon]:hidden dark:bg-emerald-500/10">
                    <div className="flex items-center justify-between font-medium">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            </span>
                            Device Connected
                        </span>
                        <span className="font-semibold text-foreground">98% Uptime</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>WA Business (0812)</span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Zap className="h-3 w-3" /> Ready
                        </span>
                    </div>
                </div>

                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
