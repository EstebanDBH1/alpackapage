import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, CreditCard, LogOut, Settings, AlertTriangle,
    Clock, FileText, Zap, ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Subscription } from '../types';
import SavedPrompts from '../components/SavedPrompts';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }
            setUser(user);

            const { data: sub } = await supabase
                .from('subscriptions').select('*').eq('customer_id', user.id).maybeSingle();
            if (sub) setSubscription(sub);

            setLoading(false);
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    useEffect(() => {
        if (!window.Paddle) {
            const scriptId = 'paddle-js-sdk-dash';
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
                script.async = true;
                script.onload = () => {
                    const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim();
                    const envFromToken = clientToken?.startsWith('test_') ? 'sandbox' : 'production';
                    const env = import.meta.env.VITE_PADDLE_ENVIRONMENT || import.meta.env.VITE_PADDLE_ENV || envFromToken;
                    if (window.Paddle && clientToken) {
                        window.Paddle.Environment.set(env);
                        window.Paddle.Initialize({ token: clientToken });
                    }
                };
                document.body.appendChild(script);
            }
        }
    }, []);

    const handleManageSubscription = async () => {
        if (!subscription) return;
        setUpdating(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-portal-session', { body: {} });
            if (error) {
                if (error.context) {
                    try {
                        const errorBody = await error.context.json();
                        if (errorBody?.debug) { alert('Error debug: ' + JSON.stringify(errorBody.debug, null, 2)); return; }
                    } catch (e) {}
                }
                throw error;
            }
            if (data?.urls?.general?.overview) {
                window.open(data.urls.general.overview, '_blank');
            } else {
                throw new Error('No se recibió la URL del portal');
            }
        } catch (err: any) {
            alert('Error: ' + (err.message || 'No se pudo abrir el portal. Por favor contacta soporte@alpackaai.xyz'));
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!subscription) return;
        if (!window.confirm('¿Estás seguro de que quieres cancelar?')) return;
        setUpdating(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-portal-session', { body: {} });
            if (!error && data?.urls?.subscriptions) {
                const subInfo = data.urls.subscriptions.find((s: any) => s.id === subscription.subscription_id);
                if (subInfo?.cancel_subscription) { window.open(subInfo.cancel_subscription, '_blank'); return; }
            }
            if (!error && data?.urls?.general?.overview) { window.open(data.urls.general.overview, '_blank'); return; }
            const { error: cancelError } = await supabase.functions.invoke('cancel-paddle-subscription', {
                body: { subscriptionID: subscription.subscription_id, userID: user.id }
            });
            if (cancelError) throw cancelError;
            alert('Tu suscripción ha sido programada para cancelarse al final del periodo actual.');
            window.location.reload();
        } catch (err: any) {
            alert('No pudimos procesar la cancelación. Por favor contacta soporte@alpackaai.xyz');
        } finally {
            setUpdating(false);
        }
    };

    const isActive = subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing';
    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario';
    const initials = (user?.user_metadata?.full_name || user?.email || 'U')
        .split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

    // ── Loading skeleton ─────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-background bg-radial-glow pb-24 font-space">
            <div className="border-b border-border/60">
                <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
                    <div className="mb-2 h-8 w-40 animate-pulse rounded-xl bg-card" />
                    <div className="h-4 w-28 animate-pulse rounded-lg bg-card" />
                </div>
            </div>
            <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="space-y-4">
                        <div className="h-52 animate-pulse rounded-2xl bg-card" />
                        <div className="h-40 animate-pulse rounded-2xl bg-card" />
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-72 animate-pulse rounded-2xl bg-card" />
                        <div className="h-52 animate-pulse rounded-2xl bg-card" />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen overflow-x-clip bg-background bg-radial-glow pb-20 font-space text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

            <div className="relative">
            {/* ── Page header ─────────────────────────────────────────────────── */}
            <div className="border-b border-border/60">
                <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8 md:py-10">
                    <div className="flex items-center justify-between gap-4">

                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary text-base font-medium text-foreground">
                                {initials}
                            </div>
                            <div>
                                <h1 className="text-xl font-medium leading-tight tracking-tight text-foreground md:text-2xl">
                                    Hola, {firstName}
                                </h1>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Gestiona tu acceso y suscripción
                                </p>
                            </div>
                        </div>

                        {/* Status badge */}
                        <span
                            className={`hidden flex-shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] sm:inline-flex ${
                                isActive
                                    ? 'border-accent/40 bg-secondary text-accent'
                                    : 'border-border/60 bg-card text-muted-foreground'
                            }`}
                        >
                            <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${isActive ? 'bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]' : 'bg-muted-foreground/50'}`} />
                            {isActive ? 'premium activo' : 'sin suscripción'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Body ────────────────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* ── Sidebar ───────────────────────────────────────────── */}
                    <div className="space-y-4">

                        {/* Membership card */}
                        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-7 shadow-[0_0_60px_oklch(0.86_0.09_90_/_0.06)]">
                            <div
                                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                                style={{ backgroundImage: 'radial-gradient(circle, oklch(0.72 0.16 40) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                            />
                            <div className="relative z-10">
                                <div className="mb-8 flex items-start justify-between">
                                    <span className="text-base font-medium text-muted-foreground/60">
                                        alpacka.ai
                                    </span>
                                    <span
                                        className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] ${
                                            isActive
                                                ? 'border-accent/40 bg-secondary text-accent'
                                                : 'border-border/60 bg-secondary text-muted-foreground'
                                        }`}
                                    >
                                        {isActive ? '★ premium' : 'free'}
                                    </span>
                                </div>

                                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">miembro</p>
                                <p className="mb-6 truncate text-sm font-medium text-foreground/90">
                                    {user?.user_metadata?.full_name || user?.email}
                                </p>

                                <div className="flex justify-between font-mono text-[10px] text-muted-foreground/60">
                                    <span>#{user?.id.slice(0, 8)}</span>
                                    <span>{new Date(user?.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile card */}
                        <div className="rounded-2xl border border-border/70 bg-card p-6">
                            <h3 className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                <User size={12} /> perfil
                            </h3>

                            <div className="mb-6 space-y-4">
                                <div>
                                    <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">email</p>
                                    <p className="break-all text-sm font-medium text-foreground">{user?.email}</p>
                                </div>
                                <div>
                                    <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">proveedor</p>
                                    <p className="text-sm text-muted-foreground">Google OAuth</p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-medium text-muted-foreground transition hover:border-accent/50 hover:text-accent"
                            >
                                <LogOut size={13} /> Cerrar sesión
                            </button>
                        </div>
                    </div>

                    {/* ── Main content ──────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Subscription card */}
                        <div className="rounded-2xl border border-border/70 bg-card p-7 md:p-8">
                            {/* Header row */}
                            <div className="mb-7 flex flex-col items-start justify-between gap-4 border-b border-border/60 pb-7 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="mb-1 text-lg font-medium tracking-tight text-foreground">
                                        Tu suscripción
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {isActive ? 'Gestiona tu facturación y estado.' : 'No tienes una suscripción activa.'}
                                    </p>
                                </div>
                                {isActive && (
                                    <div className="flex flex-shrink-0 items-baseline gap-1 rounded-xl border border-border/60 bg-secondary px-4 py-2">
                                        <span className="text-2xl font-medium leading-none text-foreground">$4</span>
                                        <span className="font-mono text-[10px] text-muted-foreground">/mes</span>
                                    </div>
                                )}
                            </div>

                            {/* Info grid */}
                            <div className="mb-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                                        próxima factura
                                    </p>
                                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                        <Clock size={13} className="text-muted-foreground" />
                                        {isActive && subscription?.current_period_end
                                            ? new Date(subscription.current_period_end).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : '—'}
                                    </div>
                                    {isActive && !subscription?.cancel_at_period_end && (
                                        <p className="mt-1.5 text-xs text-muted-foreground">Renovación automática.</p>
                                    )}
                                </div>
                                <div>
                                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                                        método de pago
                                    </p>
                                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                        <CreditCard size={13} className="text-muted-foreground" />
                                        {isActive ? 'Paddle' : '—'}
                                    </div>
                                    <p className="mt-1.5 text-xs text-muted-foreground">Checkout seguro encriptado</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 sm:flex-row">
                                {isActive ? (
                                    <>
                                        <button
                                            onClick={handleManageSubscription}
                                            disabled={updating}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                                        >
                                            <Settings size={13} />
                                            {updating ? 'procesando...' : 'gestionar suscripción'}
                                        </button>
                                        <button
                                            onClick={handleCancelSubscription}
                                            disabled={updating}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-accent/40 py-3 text-sm font-medium text-accent transition hover:bg-accent/10 disabled:opacity-50"
                                        >
                                            <AlertTriangle size={13} />
                                            {updating ? 'procesando...' : 'cancelar'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90"
                                    >
                                        <Zap size={13} fill="currentColor" />
                                        Suscribirse ahora
                                        <ArrowRight size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Cancellation warning */}
                            {subscription?.cancel_at_period_end && (
                                <div className="mt-5 flex items-start gap-3 rounded-xl border border-accent/40 bg-secondary p-4 text-sm text-foreground/90">
                                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-accent" />
                                    <p>
                                        Cancelación programada. Mantendrás el acceso hasta{' '}
                                        <strong className="font-medium text-foreground">{new Date(subscription.current_period_end!).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</strong>.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── Saved prompts preview ──────────────────────────── */}
                        <div className="rounded-2xl border border-border/70 bg-card p-7 md:p-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium tracking-tight text-foreground">
                                    Prompts guardados
                                </h3>
                                <Link
                                    to="/guardados"
                                    className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-accent transition hover:opacity-80"
                                >
                                    ver todos <ArrowRight size={12} />
                                </Link>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Accede a tu colección completa de prompts favoritos.
                            </p>
                        </div>

                        {/* Billing history — coming soon */}
                        <div className="pointer-events-none rounded-2xl border border-border/70 bg-card p-6 opacity-40">
                            <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                <FileText size={12} /> historial de facturas
                                <span className="ml-1 font-normal text-muted-foreground/60">— próximamente</span>
                            </h3>
                        </div>

                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Dashboard;
