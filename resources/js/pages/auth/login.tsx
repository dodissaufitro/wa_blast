import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle, Lock, Mail, Sparkles } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: any;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Helper to autofill dummy credentials
    const fillAccount = (usernameOrEmail: string, pass: string = 'password123') => {
        setData({
            email: usernameOrEmail,
            password: pass,
            remember: true,
        });
    };

    return (
        <AuthLayout
            title="Masuk ke Akun Anda"
            description="Silakan masukkan username atau email beserta kata sandi untuk mengakses dashboard"
        >
            <Head title="Masuk - WABlast Pro" />

            {status && (
                <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            {/* Quick Dummy Account Selector Card */}
            <div className="mb-6 rounded-xl border border-emerald-500/25 bg-emerald-50/70 p-3.5 dark:border-emerald-500/20 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Pilih Akun Dummy Siap Pakai:
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">Pass: password123</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                    <button
                        type="button"
                        onClick={() => fillAccount('admin')}
                        className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1.5 text-left text-xs transition hover:border-emerald-500 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/60 active:scale-[0.98] cursor-pointer"
                    >
                        <div>
                            <p className="font-semibold text-foreground leading-tight">Admin</p>
                            <p className="text-[10px] text-muted-foreground font-mono">admin</p>
                        </div>
                        <KeyRound className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </button>

                    <button
                        type="button"
                        onClick={() => fillAccount('cs_blast')}
                        className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1.5 text-left text-xs transition hover:border-emerald-500 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/60 active:scale-[0.98] cursor-pointer"
                    >
                        <div>
                            <p className="font-semibold text-foreground leading-tight">CS WhatsApp</p>
                            <p className="text-[10px] text-muted-foreground font-mono">cs_blast</p>
                        </div>
                        <KeyRound className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </button>

                    <button
                        type="button"
                        onClick={() => fillAccount('marketing')}
                        className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1.5 text-left text-xs transition hover:border-emerald-500 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/60 active:scale-[0.98] cursor-pointer"
                    >
                        <div>
                            <p className="font-semibold text-foreground leading-tight">Marketing</p>
                            <p className="text-[10px] text-muted-foreground font-mono">marketing</p>
                        </div>
                        <KeyRound className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </button>

                    <button
                        type="button"
                        onClick={() => fillAccount('demo')}
                        className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1.5 text-left text-xs transition hover:border-emerald-500 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/60 active:scale-[0.98] cursor-pointer"
                    >
                        <div>
                            <p className="font-semibold text-foreground leading-tight">User Demo</p>
                            <p className="text-[10px] text-muted-foreground font-mono">demo</p>
                        </div>
                        <KeyRound className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </button>
                </div>
            </div>

            <form className="flex flex-col gap-5" onSubmit={submit}>
                {/* Email / Username Field */}
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                        Username atau Alamat Email
                    </Label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                        </div>
                        <Input
                            id="email"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="username"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="admin atau admin@wablast.com"
                            className="pl-10 h-10 transition-colors focus-visible:ring-emerald-500"
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                            Kata Sandi
                        </Label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline"
                                tabIndex={5}
                            >
                                Lupa kata sandi?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="pl-10 pr-10 h-10 transition-colors focus-visible:ring-emerald-500"
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', !!checked)}
                            tabIndex={3}
                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <Label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">
                            Ingat saya di perangkat ini
                        </Label>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="mt-2 w-full h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99] cursor-pointer"
                    tabIndex={4}
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Memproses Masuk...
                        </>
                    ) : (
                        <>
                            Masuk ke Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                        </>
                    )}
                </Button>

                {/* Register Link */}
                <div className="mt-4 pt-4 border-t border-border/60 text-center text-xs text-muted-foreground">
                    Belum memiliki akun WABlast?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline inline-flex items-center gap-1"
                        tabIndex={6}
                    >
                        Daftar sekarang gratis
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
