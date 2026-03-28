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
        <div className="min-h-screen pb-24" style={{ backgroundColor: '#FAF9F5' }}>
            <div className="border-b" style={{ backgroundColor: 'white', borderColor: '#E3DCD3' }}>
                <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
                    <div className="h-8 w-40 rounded-xl animate-pulse mb-2" style={{ backgroundColor: '#F0EAE1' }} />
                    <div className="h-4 w-28 rounded-lg animate-pulse" style={{ backgroundColor: '#F0EAE1' }} />
                </div>
            </div>
            <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="space-y-4">
                        <div className="h-52 rounded-2xl animate-pulse" style={{ backgroundColor: '#F0EAE1' }} />
                        <div className="h-40 rounded-2xl animate-pulse" style={{ backgroundColor: '#F0EAE1' }} />
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-72 rounded-2xl animate-pulse" style={{ backgroundColor: '#F0EAE1' }} />
                        <div className="h-52 rounded-2xl animate-pulse" style={{ backgroundColor: '#F0EAE1' }} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: '#FAF9F5' }}>

            {/* ── Page header ─────────────────────────────────────────────────── */}
            <div className="border-b" style={{ backgroundColor: 'white', borderColor: '#E3DCD3' }}>
                <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8 md:py-10">
                    <div className="flex items-center justify-between gap-4">

                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-bold text-base flex-shrink-0"
                                style={{ backgroundColor: '#1A1410', color: 'rgba(255,255,255,0.7)' }}
                            >
                                {initials}
                            </div>
                            <div>
                                <h1 className="font-display font-bold text-2xl md:text-3xl leading-tight" style={{ color: '#1D1B18' }}>
                                    Hola, {firstName}
                                </h1>
                                <p className="text-sm mt-0.5" style={{ color: '#8B7E74' }}>
                                    Gestiona tu acceso y suscripción
                                </p>
                            </div>
                        </div>

                        {/* Status badge */}
                        <span
                            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full font-mono text-[11px] font-bold tracking-wider flex-shrink-0"
                            style={isActive
                                ? { backgroundColor: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }
                                : { backgroundColor: '#F0EAE1', color: '#8B7E74', border: '1px solid #E3DCD3' }
                            }
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: isActive ? '#22c55e' : '#C8BEB5' }}
                            />
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
                        <div
                            className="rounded-2xl p-7 relative overflow-hidden"
                            style={{ backgroundColor: '#1A1410' }}
                        >
                            <div
                                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                                style={{ backgroundImage: 'radial-gradient(circle, #C96A3C 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                            />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <span className="font-display font-semibold text-base" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                        alpacka.ai
                                    </span>
                                    <span
                                        className="font-mono text-[9px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase"
                                        style={isActive
                                            ? { backgroundColor: 'rgba(201,106,60,0.15)', color: '#C96A3C', border: '1px solid rgba(201,106,60,0.2)' }
                                            : { backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.06)' }
                                        }
                                    >
                                        {isActive ? '★ premium' : 'free'}
                                    </span>
                                </div>

                                <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: '#3D352E' }}>miembro</p>
                                <p className="font-semibold text-sm mb-6 truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                    {user?.user_metadata?.full_name || user?.email}
                                </p>

                                <div className="flex justify-between font-mono text-[10px]" style={{ color: '#3D352E' }}>
                                    <span>#{user?.id.slice(0, 8)}</span>
                                    <span>{new Date(user?.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile card */}
                        <div
                            className="rounded-2xl p-6 border"
                            style={{ backgroundColor: 'white', borderColor: '#E3DCD3' }}
                        >
                            <h3
                                className="font-mono text-[10px] font-bold uppercase tracking-widest mb-5 flex items-center gap-2"
                                style={{ color: '#8B7E74' }}
                            >
                                <User size={12} /> perfil
                            </h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: '#C8BEB5' }}>email</p>
                                    <p className="text-sm font-medium break-all" style={{ color: '#1D1B18' }}>{user?.email}</p>
                                </div>
                                <div>
                                    <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: '#C8BEB5' }}>proveedor</p>
                                    <p className="text-sm" style={{ color: '#8B7E74' }}>Google OAuth</p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full py-2.5 text-sm font-medium rounded-xl border transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                style={{ borderColor: '#E3DCD3', color: '#8B7E74', backgroundColor: 'transparent' }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#C96A3C';
                                    (e.currentTarget as HTMLElement).style.color = '#C96A3C';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#E3DCD3';
                                    (e.currentTarget as HTMLElement).style.color = '#8B7E74';
                                }}
                            >
                                <LogOut size={13} /> Cerrar sesión
                            </button>
                        </div>
                    </div>

                    {/* ── Main content ──────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Subscription card */}
                        <div
                            className="rounded-2xl p-7 md:p-8 border"
                            style={{ backgroundColor: 'white', borderColor: '#E3DCD3' }}
                        >
                            {/* Header row */}
                            <div
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7 pb-7 gap-4"
                                style={{ borderBottom: '1px solid #F0EAE1' }}
                            >
                                <div>
                                    <h2 className="font-display font-semibold text-lg mb-1" style={{ color: '#1D1B18' }}>
                                        Tu suscripción
                                    </h2>
                                    <p className="text-sm" style={{ color: '#8B7E74' }}>
                                        {isActive ? 'Gestiona tu facturación y estado.' : 'No tienes una suscripción activa.'}
                                    </p>
                                </div>
                                {isActive && (
                                    <div
                                        className="flex items-baseline gap-1 px-4 py-2 rounded-xl flex-shrink-0"
                                        style={{ backgroundColor: '#FAF9F5', border: '1px solid #E3DCD3' }}
                                    >
                                        <span className="font-display font-bold text-2xl leading-none" style={{ color: '#1D1B18' }}>$4</span>
                                        <span className="font-mono text-[10px]" style={{ color: '#8B7E74' }}>/mes</span>
                                    </div>
                                )}
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-7">
                                <div>
                                    <p className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: '#C8BEB5' }}>
                                        próxima factura
                                    </p>
                                    <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: '#1D1B18' }}>
                                        <Clock size={13} style={{ color: '#8B7E74' }} />
                                        {isActive && subscription?.current_period_end
                                            ? new Date(subscription.current_period_end).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : '—'}
                                    </div>
                                    {isActive && !subscription?.cancel_at_period_end && (
                                        <p className="text-xs mt-1.5" style={{ color: '#8B7E74' }}>Renovación automática.</p>
                                    )}
                                </div>
                                <div>
                                    <p className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: '#C8BEB5' }}>
                                        método de pago
                                    </p>
                                    <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: '#1D1B18' }}>
                                        <CreditCard size={13} style={{ color: '#8B7E74' }} />
                                        {isActive ? 'Paddle' : '—'}
                                    </div>
                                    <p className="text-xs mt-1.5" style={{ color: '#8B7E74' }}>Checkout seguro encriptado</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {isActive ? (
                                    <>
                                        <button
                                            onClick={handleManageSubscription}
                                            disabled={updating}
                                            className="flex-1 py-3 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-0.5"
                                            style={{ backgroundColor: '#1A1410', color: 'white' }}
                                            onMouseEnter={e => !updating && ((e.currentTarget as HTMLElement).style.backgroundColor = '#2D2520')}
                                            onMouseLeave={e => !updating && ((e.currentTarget as HTMLElement).style.backgroundColor = '#1A1410')}
                                        >
                                            <Settings size={13} />
                                            {updating ? 'procesando...' : 'gestionar suscripción'}
                                        </button>
                                        <button
                                            onClick={handleCancelSubscription}
                                            disabled={updating}
                                            className="flex-1 py-3 font-semibold text-sm rounded-xl border transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            style={{ backgroundColor: 'white', borderColor: '#FCA5A5', color: '#ef4444' }}
                                            onMouseEnter={e => !updating && ((e.currentTarget as HTMLElement).style.backgroundColor = '#fef2f2')}
                                            onMouseLeave={e => !updating && ((e.currentTarget as HTMLElement).style.backgroundColor = 'white')}
                                        >
                                            <AlertTriangle size={13} />
                                            {updating ? 'procesando...' : 'cancelar'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        className="flex-1 py-3 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                        style={{ backgroundColor: '#C96A3C', color: 'white' }}
                                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#AF5A30')}
                                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#C96A3C')}
                                    >
                                        <Zap size={13} fill="currentColor" />
                                        Suscribirse ahora
                                        <ArrowRight size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Cancellation warning */}
                            {subscription?.cancel_at_period_end && (
                                <div
                                    className="mt-5 p-4 rounded-xl text-sm flex items-start gap-3"
                                    style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#b45309' }}
                                >
                                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                                    <p>
                                        Cancelación programada. Mantendrás el acceso hasta{' '}
                                        <strong>{new Date(subscription.current_period_end!).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</strong>.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── Saved prompts preview ──────────────────────────── */}
                        <div
                            className="rounded-2xl p-7 md:p-8 border"
                            style={{ backgroundColor: 'white', borderColor: '#E3DCD3' }}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-semibold text-lg" style={{ color: '#1D1B18' }}>
                                    Prompts guardados
                                </h3>
                                <Link
                                    to="/guardados"
                                    className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5"
                                    style={{ color: '#C96A3C' }}
                                >
                                    ver todos <ArrowRight size={12} />
                                </Link>
                            </div>
                            <p className="text-sm mt-2" style={{ color: '#8B7E74' }}>
                                Accede a tu colección completa de prompts favoritos.
                            </p>
                        </div>

                        {/* Billing history — coming soon */}
                        <div
                            className="rounded-2xl p-6 border"
                            style={{ backgroundColor: 'white', borderColor: '#E3DCD3', opacity: 0.4, pointerEvents: 'none' }}
                        >
                            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: '#8B7E74' }}>
                                <FileText size={12} /> historial de facturas
                                <span className="font-normal ml-1" style={{ color: '#C8BEB5' }}>— próximamente</span>
                            </h3>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
