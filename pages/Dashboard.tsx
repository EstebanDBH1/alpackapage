import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, CreditCard, LogOut, AlertTriangle,
    Clock, FileText, Zap, ArrowRight, Bookmark, Wand2,
} from 'lucide-react';
import { supabase, isAdminUser } from '../lib/supabase';
import { Subscription } from '../types';
import {
    BG, BG_WARM, BG_INK, TEXT, TEXT_MED, TEXT_DIM, BORDER, YELLOW, GREEN, FONT,
    useEuclidFont, LandingStyles,
} from '../components/landingKit';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEuclidFont();

    useEffect(() => {
        const fetchUser = async () => {
            // getSession lee del almacenamiento local (sin round-trip al servidor de auth)
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user ?? null;
            if (!user) { navigate('/login'); return; }
            // El admin no tiene suscripción que gestionar: su panel es /admin.
            if (isAdminUser(user)) { navigate('/admin', { replace: true }); return; }
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
            // La función identifica al usuario por su JWT y busca la suscripción
            // en la DB; no acepta IDs del cliente.
            const { error: cancelError } = await supabase.functions.invoke('cancel-paddle-subscription', {
                body: {}
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
    // Precio lanzamiento ($4) para suscriptores anclados; $7 para el resto
    const GRANDFATHERED_PRICE_ID = 'pri_01kjneczae0gfxdwde1q1h0app';
    const monthlyPrice = subscription?.price_id === GRANDFATHERED_PRICE_ID ? '$4' : '$7';
    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario';
    const initials = (user?.user_metadata?.full_name || user?.email || 'U')
        .split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

    // ── Loading skeleton ─────────────────────────────────────────────────────────
    if (loading) return (
        <div className="bp-scope" style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: FONT }}>
            <LandingStyles />
            <div style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8 space-y-3">
                    <div className="animate-pulse" style={{ height: 30, width: 180, borderRadius: 10, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }} />
                    <div className="animate-pulse" style={{ height: 14, width: 120, borderRadius: 7, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }} />
                </div>
            </div>
            <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-4">
                    {[200, 170].map((h, i) => (
                        <div key={i} className="animate-pulse" style={{ height: h, borderRadius: 20, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }} />
                    ))}
                </div>
                <div className="lg:col-span-2 space-y-4">
                    {[290, 200].map((h, i) => (
                        <div key={i} className="animate-pulse" style={{ height: h, borderRadius: 20, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }} />
                    ))}
                </div>
            </div>
        </div>
    );

    const label: React.CSSProperties = {
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: TEXT_DIM, marginBottom: 7,
    };

    const card: React.CSSProperties = {
        backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 20,
    };

    return (
        <div className="bp-scope" style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: FONT, paddingBottom: 60 }}>
            <LandingStyles />

            {/* ── Cabecera ─────────────────────────────────────────────────── */}
            <div style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: BG_WARM }}>
                <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8 md:py-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            style={{
                                width: 46, height: 46, borderRadius: 15, flexShrink: 0,
                                backgroundColor: BG, border: `1px solid ${BORDER}`, color: TEXT,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, fontWeight: 600,
                            }}
                        >
                            {initials}
                        </div>
                        <div>
                            <h1 style={{ fontWeight: 600, fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                                Hola, {firstName}
                            </h1>
                            <p style={{ color: TEXT_MED, fontSize: 14, marginTop: 3 }}>
                                Gestiona tu acceso y suscripción
                            </p>
                        </div>
                    </div>

                    <span
                        className="hidden sm:inline-flex items-center gap-2"
                        style={{
                            flexShrink: 0, borderRadius: 100, padding: '6px 13px',
                            backgroundColor: isActive ? '#eefbf2' : BG,
                            border: `1px solid ${isActive ? '#c3ecd1' : BORDER}`,
                            color: isActive ? GREEN : TEXT_MED,
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                        }}
                    >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isActive ? GREEN : TEXT_DIM }} />
                        {isActive ? 'Premium activo' : 'Sin suscripción'}
                    </span>
                </div>
            </div>

            {/* ── Cuerpo ───────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* ── Columna izquierda ─────────────────────────────── */}
                    <div className="space-y-4">

                        {/* Carnet de miembro */}
                        <div
                            className="relative overflow-hidden"
                            style={{ backgroundColor: BG_INK, borderRadius: 20, padding: '24px 22px' }}
                        >
                            <div
                                className="pointer-events-none absolute inset-0"
                                style={{
                                    opacity: 0.5,
                                    backgroundImage: 'radial-gradient(circle, rgba(255,201,62,0.14) 1px, transparent 1px)',
                                    backgroundSize: '18px 18px',
                                }}
                            />
                            <div className="relative">
                                <div className="mb-7 flex items-start justify-between gap-3">
                                    <span style={{ fontSize: 14.5, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>alpacka.ai</span>
                                    <span
                                        style={{
                                            borderRadius: 100, padding: '3px 10px',
                                            fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                                            backgroundColor: isActive ? 'rgba(255,201,62,0.14)' : 'rgba(255,255,255,0.07)',
                                            border: `1px solid ${isActive ? 'rgba(255,201,62,0.35)' : 'rgba(255,255,255,0.12)'}`,
                                            color: isActive ? YELLOW : 'rgba(255,255,255,0.45)',
                                        }}
                                    >
                                        {isActive ? '★ premium' : 'free'}
                                    </span>
                                </div>

                                <p style={{ ...label, color: 'rgba(255,255,255,0.35)' }}>Miembro</p>
                                <p className="truncate" style={{ fontSize: 14.5, fontWeight: 600, color: '#fff', marginBottom: 24 }}>
                                    {user?.user_metadata?.full_name || user?.email}
                                </p>

                                <div className="flex justify-between" style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>
                                    <span>#{user?.id.slice(0, 8)}</span>
                                    <span>{new Date(user?.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Perfil */}
                        <div style={{ ...card, padding: '22px 20px' }}>
                            <h3 className="flex items-center gap-2" style={{ ...label, marginBottom: 18 }}>
                                <User size={12} /> Perfil
                            </h3>

                            <div className="space-y-4 mb-5">
                                <div>
                                    <p style={label}>Email</p>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: TEXT, wordBreak: 'break-all' }}>{user?.email}</p>
                                </div>
                                <div>
                                    <p style={label}>Proveedor</p>
                                    <p style={{ fontSize: 14, color: TEXT_MED }}>Google OAuth</p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 11,
                                    padding: '11px 16px', fontSize: 14, fontWeight: 600, color: TEXT_MED, cursor: 'pointer',
                                }}
                            >
                                <LogOut size={14} /> Cerrar sesión
                            </button>
                        </div>

                        {/* Accesos rápidos */}
                        <div style={{ ...card, padding: '22px 20px' }}>
                            <h3 style={{ ...label, marginBottom: 14 }}>Accesos rápidos</h3>
                            <div className="flex flex-col gap-2">
                                {[
                                    { to: '/prompts', icon: <FileText size={14} />, label: 'Banco de prompts' },
                                    { to: '/generador', icon: <Wand2 size={14} />, label: 'Generador con IA' },
                                    { to: '/guardados', icon: <Bookmark size={14} />, label: 'Mis guardados' },
                                ].map(l => (
                                    <Link
                                        key={l.to}
                                        to={l.to}
                                        className="flex items-center justify-between gap-3"
                                        style={{
                                            backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 11,
                                            padding: '11px 14px', fontSize: 14, fontWeight: 500, color: TEXT, textDecoration: 'none',
                                        }}
                                    >
                                        <span className="flex items-center gap-2.5">{l.icon} {l.label}</span>
                                        <ArrowRight size={13} style={{ color: TEXT_DIM }} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Columna principal ─────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Suscripción */}
                        <div style={{ ...card, padding: '26px 24px' }}>
                            <div
                                className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
                                style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 22 }}
                            >
                                <div>
                                    <h2 style={{ fontWeight: 600, fontSize: 17.5, letterSpacing: '-0.02em', marginBottom: 5 }}>
                                        Tu suscripción
                                    </h2>
                                    <p style={{ color: TEXT_MED, fontSize: 14 }}>
                                        {isActive ? 'Gestiona tu facturación y estado.' : 'No tienes una suscripción activa.'}
                                    </p>
                                </div>
                                {isActive && (
                                    <div
                                        className="flex flex-shrink-0 items-baseline gap-1.5"
                                        style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '9px 16px' }}
                                    >
                                        <span style={{ fontSize: 24, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', color: TEXT }}>
                                            {monthlyPrice}
                                        </span>
                                        <span style={{ fontSize: 12, color: TEXT_MED }}>/mes</span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <p style={label}>Próxima factura</p>
                                    <div className="flex items-center gap-2" style={{ fontSize: 14.5, fontWeight: 600, color: TEXT }}>
                                        <Clock size={14} style={{ color: TEXT_MED }} />
                                        {isActive && subscription?.current_period_end
                                            ? new Date(subscription.current_period_end).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : '—'}
                                    </div>
                                    {isActive && !subscription?.cancel_at_period_end && (
                                        <p style={{ fontSize: 12.5, color: TEXT_DIM, marginTop: 5 }}>Renovación automática.</p>
                                    )}
                                </div>
                                <div>
                                    <p style={label}>Método de pago</p>
                                    <div className="flex items-center gap-2" style={{ fontSize: 14.5, fontWeight: 600, color: TEXT }}>
                                        <CreditCard size={14} style={{ color: TEXT_MED }} />
                                        {isActive ? 'Paddle' : '—'}
                                    </div>
                                    <p style={{ fontSize: 12.5, color: TEXT_DIM, marginTop: 5 }}>Checkout seguro encriptado</p>
                                </div>
                            </div>

                            {/* Acciones */}
                            {isActive ? (
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={updating}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        backgroundColor: BG, border: '1px solid #fbcfcf', borderRadius: 12,
                                        padding: '13px 20px', fontSize: 14.5, fontWeight: 600, color: '#c8332c',
                                        cursor: updating ? 'default' : 'pointer', opacity: updating ? 0.6 : 1,
                                    }}
                                >
                                    <AlertTriangle size={14} />
                                    {updating ? 'Procesando…' : 'Cancelar suscripción'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/pricing')}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                                        backgroundColor: YELLOW, border: 'none', borderRadius: 12,
                                        padding: '14px 22px', fontSize: 15, fontWeight: 600, color: '#1a1500', cursor: 'pointer',
                                    }}
                                >
                                    <Zap size={15} fill="currentColor" />
                                    Suscribirme ahora
                                    <ArrowRight size={15} />
                                </button>
                            )}

                            {/* Aviso de cancelación */}
                            {subscription?.cancel_at_period_end && (
                                <div
                                    className="mt-4 flex items-start gap-3"
                                    style={{ backgroundColor: '#fff7e8', border: '1px solid #fbe3b0', borderRadius: 13, padding: '14px 16px' }}
                                >
                                    <AlertTriangle size={15} style={{ color: '#c98200', flexShrink: 0, marginTop: 2 }} />
                                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#8a5b00' }}>
                                        Cancelación programada. Mantendrás el acceso hasta{' '}
                                        <strong style={{ fontWeight: 700 }}>
                                            {new Date(subscription.current_period_end!).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                        </strong>.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Prompts guardados */}
                        <div style={{ ...card, padding: '26px 24px' }}>
                            <div className="flex items-center justify-between gap-3">
                                <h3 style={{ fontWeight: 600, fontSize: 17.5, letterSpacing: '-0.02em' }}>
                                    Prompts guardados
                                </h3>
                                <Link
                                    to="/guardados"
                                    className="inline-flex items-center gap-1.5"
                                    style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, textDecoration: 'none' }}
                                >
                                    Ver todos <ArrowRight size={13} />
                                </Link>
                            </div>
                            <p style={{ color: TEXT_MED, fontSize: 14, marginTop: 8, lineHeight: 1.7 }}>
                                Accede a tu colección completa de prompts favoritos.
                            </p>
                        </div>

                        {/* Historial de facturas — próximamente */}
                        <div style={{ ...card, backgroundColor: BG_WARM, padding: '20px 24px', opacity: 0.65, pointerEvents: 'none' }}>
                            <h3 className="flex flex-wrap items-center gap-2" style={{ ...label, marginBottom: 0 }}>
                                <FileText size={12} /> Historial de facturas
                                <span style={{ fontWeight: 500, letterSpacing: 0, textTransform: 'none', color: TEXT_DIM }}>
                                    — próximamente
                                </span>
                            </h3>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
