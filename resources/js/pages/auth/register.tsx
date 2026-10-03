import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Gift, LoaderCircle, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    terms: boolean;
    [key: string]: any;
}

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Daftar Akun Baru"
            description="Mulai kirim broadcast WhatsApp massal dengan mudah, cepat, dan aman"
        >
            <Head title="Daftar Akun - WABlast Pro" />

            {/* Free Trial Perk Badge */}
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-50/70 p-3.5 dark:border-emerald-500/20 dark:bg-emerald-950/30">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Gift className="h-4 w-4" />
                </div>
                <div className="text-xs">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                        Bonus Kuota Uji Coba Gratis!
                    </span>
                    <p className="mt-0.5 text-muted-foreground">
                        Dapatkan 500 kuota blast gratis dan fitur multi-device lengkap setelah verifikasi.
                    </p>
                </div>
            </div>

            <form className="flex flex-col gap-4" onSubmit={submit}>
                {/* Full Name */}
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                        Nama Lengkap / Nama Bisnis
                    </Label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                            <User className="h-4 w-4" />
                        </div>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Contoh: Budi Santoso (Toko Maju)"
                            className="pl-10 h-10 transition-colors focus-visible:ring-emerald-500"
                        />
                    </div>
                    <InputError message={errors.name} />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                        Alamat Email Bisnis
                    </Label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                        </div>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="nama@bisnisanda.com"
                            className="pl-10 h-10 transition-colors focus-visible:ring-emerald-500"
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                        Kata Sandi
                    </Label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Minimal 8 karakter"
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

                {/* Confirm Password */}
                <div className="space-y-1.5">
                    <Label htmlFor="password_confirmation" className="text-xs font-semibold text-foreground">
                        Konfirmasi Kata Sandi
                    </Label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <Input
                            id="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Ulangi kata sandi"
                            className="pl-10 pr-10 h-10 transition-colors focus-visible:ring-emerald-500"
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} />
                </div>

                {/* Terms agreement */}
                <div className="flex items-start space-x-2 pt-1">
                    <Checkbox
                        id="terms"
                        checked={data.terms}
                        onCheckedChange={(checked) => setData('terms', !!checked)}
                        className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        required
                    />
                    <Label htmlFor="terms" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                        Saya menyetujui <span className="text-foreground underline">Ketentuan Layanan</span> dan{' '}
                        <span className="text-foreground underline">Kebijakan Privasi</span> WABlast Pro.
                    </Label>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="mt-2 w-full h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99] cursor-pointer"
                    tabIndex={5}
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Mendaftarkan Akun...
                        </>
                    ) : (
                        <>
                            Daftar Sekarang <ArrowRight className="ml-1.5 h-4 w-4" />
                        </>
                    )}
                </Button>

                {/* Trust mini list */}
                <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Tanpa Kartu Kredit
                    </span>
                    <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Garansi Anti-Banned
                    </span>
                </div>

                {/* Login Link */}
                <div className="mt-4 pt-4 border-t border-border/60 text-center text-xs text-muted-foreground">
                    Sudah memiliki akun WABlast?{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline"
                        tabIndex={6}
                    >
                        Masuk di sini
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
