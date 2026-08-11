import React, { useEffect, useState } from 'react';
import { Check, Lock, Plus, Shield, Sparkles, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, GREEN, AMBER, MONO,
} from '../components/darkKit';

/* Precios — mismo lenguaje visual oscuro estilo skills.sh que el resto de la app. */

const FEATURES = [
    'Acceso ilimitado a más de 1.000 prompts',
    'Generador de prompts con IA — hasta 10 prompts al día',
    'Actualizaciones constantes con los últimos modelos',
    'Búsqueda técnica avanzada por categoría',
    'Guarda tus prompts favoritos',
    'Soporte prioritario',
    'Cancela cuando quieras, sin ataduras',
];

const FAQ_DATA = [
    { question: '¿Cuál es el costo y qué incluye?', answer: 'Por solo $7 USD al mes, desbloqueas el acceso total a nuestra librería y el generador de prompts con IA (hasta 10 prompts a medida al día). No hay letras chiquitas: tienes todos los prompts premium, las actualizaciones semanales y las nuevas categorías sin pagar un centavo más.' },
    { question: '¿Realmente funcionan estos prompts?', answer: 'Totalmente. No son frases al azar; cada uno ha sido testeado con ingeniería de prompts para asegurar que la IA te entregue resultados profesionales, estructurados y útiles desde el primer intento.' },
    { question: '¿Con qué modelos de IA puedo usarlos?', answer: 'Están diseñados para brillar en los modelos más potentes como GPT-5, Claude y Gemini. También tenemos secciones dedicadas para herramientas de imagen como Midjourney y DALL-E.' },
    { question: '¿Puedo cancelar si ya no los necesito?', answer: 'Claro, aquí mandas tú. Puedes cancelar tu suscripción con un solo clic desde tu perfil en cualquier momento. Seguirás teniendo acceso premium hasta que termine tu mes pagado.' },
    { question: '¿Actualizan el banco de prompts?', answer: '¡Cada semana! Nuestro equipo de expertos añade nuevos prompts basados en las tendencias del mercado y las peticiones de nuestra comunidad para que nunca te quedes atrás.' },
    { question: '¿Puedo sugerir un prompt que no esté?', answer: '¡Nos encantaría! Aunque nuestra curaduría es interna para mantener la calidad premium, escuchamos a nuestros suscriptores. Si necesitas un prompt específico, escríbenos y nuestro equipo lo diseñará para la próxima actualización.' },
];

const TRUST = [
    {
        icon: <Sparkles size={17} style={{ color: AMBER }} />,
        chipBg: 'rgba(255,178,36,0.08)', chipBd: 'rgba(255,178,36,0.28)',
        title: 'Sin tasas ocultas', desc: 'El precio es final. Sin créditos, sin recargas, sin sorpresas en tu factura.',
    },
    {
        icon: <Wand2 size={17} style={{ color: '#b39dff' }} />,
        chipBg: 'rgba(139,92,246,0.1)', chipBd: 'rgba(139,92,246,0.3)',
        title: 'Flexibilidad total', desc: 'Cancela con un clic. Mantienes el acceso hasta que termine tu periodo.',
    },
    {
        icon: <Lock size={17} style={{ color: GREEN }} />,
        chipBg: 'rgba(63,207,142,0.08)', chipBd: 'rgba(63,207,142,0.3)',
        title: 'Pago seguro', desc: 'Checkout encriptado vía Paddle. Tus datos nunca tocan nuestros servidores.',
    },
];

const Pricing: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            // getSession lee del almacenamiento local (sin round-trip al servidor de auth)
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user ?? null;
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

    // El pago vive en /checkout (Paddle embebido dentro de la app)
    const handleJoinClick = () => {
        if (isSubscribed) return;
        if (!user) return navigate('/login?redirect=/checkout');
        navigate('/checkout');
    };

    return (
        <div style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: MONO }}>

            <main className="mx-auto max-w-3xl px-5 sm:px-8 py-14 md:py-16">

                {/* ── Hero ─────────────────────────────────────────────── */}
                <div className="mb-10 text-center">
                    <p
                        style={{
                            fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
                            textTransform: 'uppercase', color: DIM, marginBottom: 14,
                        }}
                    >
                        Membresía premium
                    </p>

                    <h1
                        style={{
                            fontFamily: MONO,
                            fontWeight: 700,
                            fontSize: 'clamp(1.7rem, 3.6vw, 2.5rem)',
                            lineHeight: 1.15,
                            letterSpacing: '-0.02em',
                            marginBottom: 14,
                            color: TEXT,
                        }}
                    >
                        Un plan. <span style={{ color: AMBER }}>Acceso total.</span>
                    </h1>
                    <p style={{ fontFamily: MONO, color: MUTED, fontSize: 14.5, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
                        Desbloquea todo el directorio de prompts y el generador con IA por lo que cuesta un café al mes.
                    </p>
                </div>

                {/* ── Card de precio ───────────────────────────────────── */}
                <div className="relative mx-auto mb-16" style={{ maxWidth: 560 }}>

                    {/* Halo ambiental detrás de la card */}
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute', inset: '-70px -40px', pointerEvents: 'none', zIndex: 0,
                            background: 'radial-gradient(60% 45% at 50% 0%, rgba(255,178,36,0.13), transparent 72%)',
                        }}
                    />

                    {/* Borde degradado: wrapper de 1px que envuelve la card */}
                    <div
                        className="relative"
                        style={{
                            zIndex: 1, padding: 1, borderRadius: 18,
                            background: 'linear-gradient(160deg, rgba(255,178,36,0.55), rgba(255,178,36,0.12) 30%, #262626 62%, #1a1a1a)',
                            boxShadow: '0 24px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)',
                        }}
                    >
                        <div style={{ borderRadius: 17, overflow: 'hidden', backgroundColor: CARD }}>

                            {/* Cabecera: rejilla sutil + etiqueta */}
                            <div
                                className="relative"
                                style={{
                                    padding: '26px 26px 24px',
                                    borderBottom: `1px solid ${BORDER_SOFT}`,
                                    background: `
                                        linear-gradient(180deg, rgba(255,178,36,0.05), transparent 85%),
                                        repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(255,255,255,0.022) 23px, rgba(255,255,255,0.022) 24px),
                                        repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(255,255,255,0.022) 23px, rgba(255,255,255,0.022) 24px)
                                    `,
                                }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div
                                        className="inline-flex items-center gap-2 rounded-full"
                                        style={{
                                            backgroundColor: 'rgba(255,178,36,0.09)', border: '1px solid rgba(255,178,36,0.32)',
                                            padding: '5px 13px',
                                        }}
                                    >
                                        <Sparkles size={11} style={{ color: AMBER }} />
                                        <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: AMBER }}>
                                            Membresía pro
                                        </span>
                                    </div>

                                    <span
                                        style={{
                                            fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
                                            textTransform: 'uppercase', color: DIM, whiteSpace: 'nowrap', paddingTop: 6,
                                        }}
                                    >
                                        Plan único
                                    </span>
                                </div>

                                {/* Precio */}
                                <div className="flex items-end gap-3" style={{ marginTop: 22, marginBottom: 8 }}>
                                    <span
                                        style={{
                                            fontFamily: MONO, fontWeight: 700, fontSize: 62, lineHeight: 0.95,
                                            letterSpacing: '-0.045em',
                                            background: 'linear-gradient(165deg, #ffffff 25%, #9a9a9a)',
                                            WebkitBackgroundClip: 'text', backgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        $7
                                    </span>
                                    <span className="flex flex-col" style={{ paddingBottom: 5 }}>
                                        <span style={{ fontFamily: MONO, fontSize: 13.5, color: MUTED, lineHeight: 1.3 }}>USD / mes</span>
                                        <span style={{ fontFamily: MONO, fontSize: 11.5, color: DIM, lineHeight: 1.3 }}>menos de $0,24 al día</span>
                                    </span>
                                </div>

                                <p style={{ fontFamily: MONO, color: DIM, fontSize: 12, lineHeight: 1.6 }}>
                                    Facturación mensual · cancela cuando quieras, sin dramas.
                                </p>
                            </div>

                            {/* Cuerpo: qué incluye */}
                            <div style={{ padding: '24px 26px 26px' }}>
                                <p
                                    style={{
                                        fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                                        textTransform: 'uppercase', color: DIM, marginBottom: 16,
                                    }}
                                >
                                    Incluido
                                </p>

                                <div className="flex flex-col gap-3 mb-7">
                                    {FEATURES.map(feature => (
                                        <div key={feature} className="flex items-start gap-3">
                                            <span
                                                style={{
                                                    width: 17, height: 17, borderRadius: 5, flexShrink: 0, marginTop: 1,
                                                    backgroundColor: 'rgba(63,207,142,0.1)', border: '1px solid rgba(63,207,142,0.3)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >
                                                <Check size={10} strokeWidth={3.2} style={{ color: GREEN }} />
                                            </span>
                                            <span style={{ fontFamily: MONO, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleJoinClick}
                                    disabled={isSubscribed}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                                        fontFamily: MONO,
                                        background: isSubscribed ? PANEL : 'linear-gradient(180deg, #ffffff, #d8d8d8)',
                                        border: isSubscribed ? `1px solid ${BORDER}` : '1px solid rgba(255,255,255,0.9)',
                                        color: isSubscribed ? MUTED : '#000',
                                        fontWeight: 700, fontSize: 14.5, padding: '15px 24px', borderRadius: 10,
                                        cursor: isSubscribed ? 'default' : 'pointer',
                                        boxShadow: isSubscribed ? 'none' : '0 8px 26px rgba(255,255,255,0.12)',
                                        transition: 'transform .15s, box-shadow .15s',
                                    }}
                                    onMouseEnter={e => {
                                        if (isSubscribed) return;
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.transform = 'translateY(-1px)';
                                        el.style.boxShadow = '0 12px 34px rgba(255,255,255,0.2)';
                                    }}
                                    onMouseLeave={e => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.transform = 'translateY(0)';
                                        el.style.boxShadow = isSubscribed ? 'none' : '0 8px 26px rgba(255,255,255,0.12)';
                                    }}
                                >
                                    {isSubscribed ? 'Plan actual' : (user ? 'Suscribirme ahora' : 'Unirme al directorio')}
                                </button>
                            </div>

                            {/* Pie: pago seguro */}
                            <div
                                className="flex items-center justify-center gap-2"
                                style={{ backgroundColor: PANEL, borderTop: `1px solid ${BORDER_SOFT}`, padding: '12px 24px' }}
                            >
                                <Shield size={13} style={{ color: DIM }} />
                                <span style={{ fontFamily: MONO, fontSize: 11.5, color: MUTED }}>Pago seguro vía Paddle · SSL 256-bit</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Garantías ────────────────────────────────────────── */}
                <div className="mb-16 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {TRUST.map(t => (
                        <div key={t.title} style={{ backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 12, padding: '20px 18px' }}>
                            <div
                                style={{
                                    width: 38, height: 38, borderRadius: 11, marginBottom: 14,
                                    backgroundColor: t.chipBg, border: `1px solid ${t.chipBd}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                {t.icon}
                            </div>
                            <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13.5, color: TEXT, marginBottom: 6, letterSpacing: '-0.01em' }}>{t.title}</p>
                            <p style={{ fontFamily: MONO, color: MUTED, fontSize: 12, lineHeight: 1.65 }}>{t.desc}</p>
                        </div>
                    ))}
                </div>

                {/* ── FAQ ──────────────────────────────────────────────── */}
                <div>
                    <div className="mb-8 text-center">
                        <p
                            style={{
                                fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
                                textTransform: 'uppercase', color: DIM, marginBottom: 12,
                            }}
                        >
                            Preguntas frecuentes
                        </p>
                        <h2 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 'clamp(1.3rem, 2.6vw, 1.7rem)', letterSpacing: '-0.02em', lineHeight: 1.25, color: TEXT }}>
                            Todo lo que necesitas saber.
                        </h2>
                    </div>

                    <div style={{ backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 12, overflow: 'hidden' }}>
                        {FAQ_DATA.map((item, index) => {
                            const open = openIndex === index;
                            const last = index === FAQ_DATA.length - 1;
                            return (
                                <div key={index} style={{ borderBottom: last ? 'none' : `1px solid ${BORDER_SOFT}` }}>
                                    <button
                                        onClick={() => setOpenIndex(open ? null : index)}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            gap: 16, padding: '16px 18px', background: 'none', border: 'none',
                                            cursor: 'pointer', textAlign: 'left',
                                        }}
                                    >
                                        <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 600, color: TEXT, lineHeight: 1.5 }}>{item.question}</span>
                                        <Plus
                                            size={16}
                                            style={{
                                                color: DIM, flexShrink: 0,
                                                transition: 'transform .25s',
                                                transform: open ? 'rotate(45deg)' : 'none',
                                            }}
                                        />
                                    </button>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateRows: open ? '1fr' : '0fr',
                                            transition: 'grid-template-rows .25s ease',
                                        }}
                                    >
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ padding: '0 18px 17px', fontFamily: MONO, color: MUTED, fontSize: 13, lineHeight: 1.75 }}>
                                                {item.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Pricing;
