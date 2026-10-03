import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm">
                <AppLogoIcon className="size-8" />
            </div>
            <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tracking-tight text-foreground">WABlast</span>
                    <span className="rounded bg-emerald-500/10 px-1 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        PRO
                    </span>
                </div>
                <span className="text-[11px] leading-none text-muted-foreground">Broadcast Engine</span>
            </div>
        </div>
    );
}
