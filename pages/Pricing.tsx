import React, { useEffect, useState } from 'react';
import { Check, Lock, Plus, Shield, Sparkles, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    BG, BG_WARM, TEXT, TEXT_MED, TEXT_DIM, BORDER, ACCENT, YELLOW, GREEN, FONT,
    useEuclidFont, LandingStyles,
} from '../components/landingKit';

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
    { icon: <Sparkles size={18} style={{ color: '#c98200' }} />, bg: '#fff7e8', bd: '#fbe3b0', title: 'Sin tasas ocultas', desc: 'El precio es final. Sin créditos, sin recargas, sin sorpresas en tu factura.' },
    { icon: <Wand2 size={18} style={{ color: '#8b5cf6' }} />,   bg: '#f7f2ff', bd: '#e2d5fb', title: 'Flexibilidad total', desc: 'Cancela con un clic. Mantienes el acceso hasta que termine tu periodo.' },
    { icon: <Lock size={18} style={{ color: GREEN }} />,        bg: '#eefbf2', bd: '#c3ecd1', title: 'Pago seguro', desc: 'Checkout encriptado vía Paddle. Tus datos nunca tocan nuestros servidores.' },
];

const Pricing: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useEuclidFont();

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
        <div className="bp-scope" style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: FONT }}>
            <LandingStyles />

            <main className="mx-auto max-w-3xl px-5 sm:px-8 py-14 md:py-18">

                {/* ── Hero ─────────────────────────────────────────────── */}
                <div className="mb-10 text-center">
                    <div
                        className="inline-flex items-center gap-2 rounded-full"
                        style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, padding: '5px 13px', marginBottom: 18 }}
                    >
                        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: ACCENT }} />
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: TEXT_MED }}>
                            Membresía premium
                        </span>
                    </div>

                    <h1
                        style={{
                            fontWeight: 600,
                            fontSize: 'clamp(1.9rem, 4vw, 2.8rem)',
                            lineHeight: 1.1,
                            letterSpacing: '-0.035em',
                            marginBottom: 14,
                        }}
                    >
                        Un plan. <span style={{ color: ACCENT }}>Acceso total.</span>
                    </h1>
                    <p style={{ color: TEXT_MED, fontSize: 16.5, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
                        Desbloquea todo el banco de prompts y el generador con IA por lo que cuesta un café al mes.
                    </p>
                </div>

                {/* ── Card de precio ───────────────────────────────────── */}
                <div className="mx-auto mb-16" style={{ maxWidth: 560 }}>
                    <div
                        style={{
                            border: `1px solid ${BORDER}`, borderRadius: 22, overflow: 'hidden',
                            backgroundColor: BG, boxShadow: '0 14px 44px rgba(0,0,0,0.06)',
                        }}
                    >
                        <div style={{ padding: '30px 28px' }}>
                            <div
                                className="inline-flex items-center gap-2 rounded-full"
                                style={{ backgroundColor: '#fff7e8', border: '1px solid #fbe3b0', padding: '5px 13px', marginBottom: 18 }}
                            >
                                <Sparkles size={11} style={{ color: '#c98200' }} />
                                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a86a00' }}>
                                    Membresía pro
                                </span>
                            </div>

                            <div className="flex items-end gap-2.5 mb-1">
                                <span style={{ fontWeight: 600, fontSize: 52, lineHeight: 1, letterSpacing: '-0.045em', color: TEXT }}>7 USD</span>
                                <span style={{ fontSize: 16, color: TEXT_MED, paddingBottom: 6 }}>/ mes</span>
                            </div>
                            <p style={{ color: TEXT_DIM, fontSize: 13.5, marginBottom: 24 }}>
                                Facturación mensual · cancela cuando quieras, sin dramas.
                            </p>

                            <div className="flex flex-col gap-2.5 mb-8">
                                {FEATURES.map(feature => (
                                    <div key={feature} className="flex items-start gap-2.5">
                                        <Check size={14} strokeWidth={3} style={{ color: GREEN, flexShrink: 0, marginTop: 3 }} />
                                        <span style={{ fontSize: 14.5, color: TEXT_MED, lineHeight: 1.55 }}>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleJoinClick}
                                disabled={isSubscribed}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                                    backgroundColor: isSubscribed ? BG_WARM : YELLOW,
                                    border: isSubscribed ? `1px solid ${BORDER}` : 'none',
                                    color: isSubscribed ? TEXT_MED : '#1a1500',
                                    fontWeight: 600, fontSize: 16, padding: '16px 26px', borderRadius: 12,
                                    cursor: isSubscribed ? 'default' : 'pointer',
                                    boxShadow: isSubscribed ? 'none' : '0 6px 20px rgba(255,201,62,0.38)',
                                }}
                            >
                                {isSubscribed ? 'Plan actual' : (user ? 'Suscribirme ahora' : 'Unirme al banco')}
                            </button>
                        </div>

                        <div
                            className="flex items-center justify-center gap-2"
                            style={{ backgroundColor: BG_WARM, borderTop: `1px solid ${BORDER}`, padding: '13px 26px' }}
                        >
                            <Shield size={13} style={{ color: TEXT_DIM }} />
                            <span style={{ fontSize: 12.5, color: TEXT_MED }}>Pago seguro vía Paddle · SSL 256-bit</span>
                        </div>
                    </div>
                </div>

                {/* ── Garantías ────────────────────────────────────────── */}
                <div className="mb-16 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {TRUST.map(t => (
                        <div key={t.title} style={{ backgroundColor: t.bg, border: `1px solid ${t.bd}`, borderRadius: 18, padding: '22px 20px' }}>
                            <div
                                style={{
                                    width: 40, height: 40, borderRadius: 13, marginBottom: 14,
                                    backgroundColor: 'rgba(255,255,255,0.75)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                }}
                            >
                                {t.icon}
                            </div>
                            <p style={{ fontWeight: 600, fontSize: 15, color: TEXT, marginBottom: 6, letterSpacing: '-0.01em' }}>{t.title}</p>
                            <p style={{ color: TEXT_MED, fontSize: 13.5, lineHeight: 1.65 }}>{t.desc}</p>
                        </div>
                    ))}
                </div>

                {/* ── FAQ ──────────────────────────────────────────────── */}
                <div>
                    <div className="mb-8 text-center">
                        <div
                            className="inline-flex items-center gap-2 rounded-full"
                            style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, padding: '5px 13px', marginBottom: 18 }}
                        >
                            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: TEXT_MED }} />
                            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: TEXT_MED }}>
                                Preguntas frecuentes
                            </span>
                        </div>
                        <h2 style={{ fontWeight: 600, fontSize: 'clamp(1.55rem, 3vw, 2.1rem)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                            Todo lo que necesitas saber.
                        </h2>
                    </div>

                    <div style={{ backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden' }}>
                        {FAQ_DATA.map((item, index) => {
                            const open = openIndex === index;
                            const last = index === FAQ_DATA.length - 1;
                            return (
                                <div key={index} style={{ borderBottom: last ? 'none' : `1px solid ${BORDER}` }}>
                                    <button
                                        onClick={() => setOpenIndex(open ? null : index)}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            gap: 16, padding: '17px 20px', background: 'none', border: 'none',
                                            cursor: 'pointer', textAlign: 'left',
                                        }}
                                    >
                                        <span style={{ fontSize: 15, fontWeight: 500, color: TEXT, lineHeight: 1.5 }}>{item.question}</span>
                                        <Plus
                                            size={16}
                                            style={{
                                                color: TEXT_DIM, flexShrink: 0,
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
                                            <p style={{ padding: '0 20px 18px', color: TEXT_MED, fontSize: 14.5, lineHeight: 1.75 }}>
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
