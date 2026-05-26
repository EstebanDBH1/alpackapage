import React, { useEffect, useState } from 'react';
import { Check, Zap, ShieldCheck, Clock, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PricingCard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim();
        const initPaddle = () => {
            if (!window.Paddle || !clientToken) return;
            const isSandbox = clientToken.startsWith('test_');
            if (isSandbox) window.Paddle.Environment.set('sandbox');
            window.Paddle.Initialize({ token: clientToken });
            setScriptLoaded(true);
        };
        if (window.Paddle) { initPaddle(); return; }
        const script = document.createElement('script');
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.async = true;
        script.onload = initPaddle;
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('subscription_status')
                    .eq('customer_id', user.id)
                    .maybeSingle();
                if (sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing')) {
                    setIsSubscribed(true);
                }
            }
        };
        checkUser();
    }, []);

    const handleJoinClick = () => {
        if (isSubscribed) return;
        if (!user) return navigate('/login?redirect=/pricing');
        if (!scriptLoaded || !window.Paddle) return;
        setLoading(true);
        const priceId = import.meta.env.VITE_PADDLE_PRICE_ID?.trim();
        window.Paddle.Checkout.open({
            settings: { displayMode: 'overlay', theme: 'light', locale: 'es', successUrl: `${window.location.origin}/payment-success` },
            items: [{ priceId: priceId, quantity: 1 }],
            customer: { email: user.email },
            customData: { supabase_user_id: String(user.id) },
            eventCallback: () => setLoading(false),
        });
    };

    const features = [
        'acceso ilimitado a 150+ prompts',
        'actualizaciones semanales garantizadas',
        'búsqueda avanzada por categoría',
        'guarda tus prompts favoritos',
        'cancela cuando quieras, sin drama',
    ];

    return (
        <section className="py-20 md:py-28 relative overflow-hidden" style={{ backgroundColor: '#f7f6f3', borderTop: '1px solid #e4e4e1' }}>
            <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">

                {/* Section header */}
                <div className="mb-14 md:mb-16">
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        backgroundColor: '#ffffff', border: '1px solid #e4e4e1',
                        borderRadius: 100, padding: '4px 12px', marginBottom: 16,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#787774', letterSpacing: '0.1em', textTransform: 'uppercase' }}>precio</span>
                    </div>
                    <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                        Acceso completo.<br />
                        <span>Un solo precio. Sin sorpresas.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* ── Pricing card ── */}
                    <div
                        className="rounded-3xl p-10 relative overflow-hidden"
                        style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e1', boxShadow: '0 8px 32px rgba(0,0,0,0.07)' }}
                    >
                        {/* Purple top accent */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #667eea, #a78bfa, #f0abfc)' }} />

                        {/* Top row */}
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="font-display font-bold text-lg mb-0.5" style={{ color: '#1a1a1a' }}>
                                    membresía pro
                                </h3>
                                <p className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: '#a8a5a1' }}>
                                    acceso completo
                                </p>
                            </div>
                            <span
                                className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider"
                                style={{ backgroundColor: '#f0f0ff', color: '#6366f1', border: '1px solid #c7d2fe' }}
                            >
                                precio de lanzamiento
                            </span>
                        </div>

                        {/* Price */}
                        <div className="pb-8 mb-8" style={{ borderBottom: '1px solid #f0efec' }}>
                            <div className="flex items-start gap-1 mb-2">
                                <span className="font-display text-xl font-medium mt-3" style={{ color: '#a8a5a1' }}>$</span>
                                <span className="font-display font-bold leading-none tracking-tight" style={{ fontSize: '4.5rem', color: '#1a1a1a' }}>4</span>
                                <span className="font-display text-sm font-medium mt-auto mb-2" style={{ color: '#a8a5a1' }}>/mes</span>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-mono text-[10px] tracking-wider" style={{ color: '#a8a5a1' }}>
                                    = $0.13/día · menos que un café
                                </span>
                                <span
                                    className="font-mono text-[9px] font-bold px-2 py-0.5 rounded"
                                    style={{ backgroundColor: '#f7f6f3', color: '#c4c2bf', textDecoration: 'line-through' }}
                                >
                                    vs $80/hr freelancer
                                </span>
                            </div>
                        </div>

                        {/* Features */}
                        <ul className="space-y-4 mb-10">
                            {features.map((feat, i) => (
                                <li key={i} className="flex items-center gap-3.5 text-sm">
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: '#f0f0ff', border: '1px solid #c7d2fe' }}
                                    >
                                        <Check size={10} style={{ color: '#6366f1' }} strokeWidth={3} />
                                    </div>
                                    <span style={{ color: '#787774' }}>{feat}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <button
                            onClick={handleJoinClick}
                            disabled={isSubscribed || loading}
                            className="w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2.5 hover:-translate-y-0.5"
                            style={isSubscribed
                                ? { backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', cursor: 'default' }
                                : { backgroundColor: '#000', color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }
                            }
                            onMouseEnter={e => !isSubscribed && !loading && ((e.currentTarget as HTMLElement).style.backgroundColor = '#222')}
                            onMouseLeave={e => !isSubscribed && !loading && ((e.currentTarget as HTMLElement).style.backgroundColor = '#000')}
                        >
                            {isSubscribed ? (
                                <><Check size={14} strokeWidth={2.5} /> plan activo</>
                            ) : loading ? (
                                <span style={{ opacity: 0.6 }}>cargando...</span>
                            ) : (
                                <><Zap size={13} fill="currentColor" /> {user ? 'suscribirme ahora' : 'quiero acceso completo'} <ArrowRight size={13} /></>
                            )}
                        </button>

                        <p className="text-center font-mono text-[10px] tracking-widest mt-4" style={{ color: '#c4c2bf' }}>
                            pago seguro · cancela en un clic · sin preguntas
                        </p>
                    </div>

                    {/* ── Right: trust + value anchoring ── */}
                    <div className="space-y-4">

                        {/* Value anchoring card */}
                        <div
                            className="p-7 rounded-2xl"
                            style={{ backgroundColor: 'white', border: '1px solid #e4e4e1', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                        >
                            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: '#a8a5a1' }}>
                                calcula tu roi
                            </p>
                            <div className="space-y-3">
                                {[
                                    { label: '1 email de ventas con freelancer', cost: '~$80', muted: true },
                                    { label: '1 estrategia de marketing', cost: '~$200', muted: true },
                                    { label: '1 mes de alpacka.ai (150 prompts)', cost: '$4', muted: false },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between gap-4">
                                        <span className="text-sm" style={{ color: item.muted ? '#c4c2bf' : '#1a1a1a', textDecoration: item.muted ? 'line-through' : 'none' }}>
                                            {item.label}
                                        </span>
                                        <span
                                            className="font-mono font-bold text-sm flex-shrink-0"
                                            style={{ color: item.muted ? '#e4e4e1' : '#6366f1' }}
                                        >
                                            {item.cost}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 pt-5" style={{ borderTop: '1px solid #f0efec' }}>
                                <p className="text-xs leading-relaxed" style={{ color: '#787774' }}>
                                    con un solo prompt que funcione, <strong style={{ color: '#1a1a1a' }}>ya recuperaste la inversión del mes.</strong>
                                </p>
                            </div>
                        </div>

                        {[
                            { icon: Lock, bg: '#f0fdf4', border: '#bbf7d0', iconColor: '#22c55e', title: 'sin riesgo', desc: 'Cancelas cuando quieres, sin formularios, sin emails de retención. Tu decisión, tu timing.' },
                            { icon: ShieldCheck, bg: '#eff6ff', border: '#bfdbfe', iconColor: '#3b82f6', title: 'precio que no varía', desc: '$4 es $4. Sin créditos que vencen, sin tiers, sin asteriscos. Acceso completo desde el primer día.' },
                            { icon: Clock, bg: '#fff7ed', border: '#fed7aa', iconColor: '#f97316', title: 'el precio puede subir', desc: 'El precio de lanzamiento no es permanente. Quienes entren ahora lo mantienen bloqueado para siempre.' },
                        ].map(({ icon: Icon, bg, border, iconColor, title, desc }) => (
                            <div
                                key={title}
                                className="flex gap-5 p-6 rounded-2xl transition-all hover:-translate-y-0.5 cursor-default"
                                style={{ backgroundColor: 'white', border: '1px solid #e4e4e1', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: bg, border: `1px solid ${border}` }}
                                >
                                    <Icon size={15} style={{ color: iconColor }} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1" style={{ color: '#1a1a1a' }}>{title}</h4>
                                    <p className="text-xs leading-relaxed" style={{ color: '#787774' }}>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingCard;
