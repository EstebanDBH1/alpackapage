import React, { useEffect, useState } from 'react';
import { Check, Infinity as InfinityIcon, Lock, Plus, RefreshCw, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { hasLibraryAccess } from '../lib/access';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, GREEN, AMBER, SANS, MONO,
} from '../components/darkKit';

/* Precios — dos planes con el mismo peso visual. Antes la mensual tenía
   halo, borde degradado y precio gigante mientras el pago único era una
   franja gris debajo: parecían de dos categorías distintas cuando en
   realidad dan exactamente lo mismo y solo cambia la forma de pagar. */

/* Los dos planes incluyen el mismo contenido: la diferencia está abajo,
   en las condiciones. Se describe sin cifras de catálogo para que el
   texto no caduque cada vez que crece la biblioteca. */
const INCLUDED = [
    'Todo el catálogo de prompts premium',
    'Generador de prompts con IA — 10 al día',
    'Prompts nuevos cada semana',
    'Búsqueda y filtros por categoría',
    'Guarda tus prompts favoritos',
];

type Plan = {
    id: 'monthly' | 'lifetime';
    tag: string;
    name: string;
    price: string;
    unit: string;
    note: string;
    perks: string[];
    cta: string;
    featured: boolean;
    ribbon?: string;
};

const PLANS: Plan[] = [
    {
        id: 'monthly',
        tag: 'Suscripción',
        name: 'Mensual',
        price: '$7',
        unit: 'USD / mes',
        note: 'Menos de $0,24 al día. Cancela cuando quieras.',
        perks: ['Cancela con un clic, sin permanencia', 'Mantienes el acceso hasta fin de mes'],
        cta: 'Suscribirme',
        featured: false,
    },
    {
        id: 'lifetime',
        tag: 'Pago único',
        name: 'Vitalicio',
        price: '$47.99',
        unit: 'USD una sola vez',
        note: 'Lo que cuestan 7 meses de suscripción, y es para siempre.',
        perks: ['Un solo pago, nunca vuelves a pagar', 'Todas las actualizaciones futuras incluidas'],
        cta: 'Comprar acceso vitalicio',
        featured: true,
        ribbon: 'Mejor valor',
    },
];

const FAQ_DATA = [
    { question: '¿Cuál es la diferencia entre los dos planes?', answer: 'Ninguna en cuanto a lo que recibes: los dos dan el catálogo completo, el generador con IA y las actualizaciones. La única diferencia es cómo pagas. La mensual son $7 al mes y la cancelas cuando quieras; el vitalicio es un único pago de $47.99 y ya no vuelves a pagar nunca. Si piensas quedarte más de siete meses, sale a cuenta el vitalicio.' },
    { question: '¿Realmente funcionan estos prompts?', answer: 'Totalmente. No son frases al azar; cada uno ha sido testeado con ingeniería de prompts para asegurar que la IA te entregue resultados profesionales, estructurados y útiles desde el primer intento.' },
    { question: '¿Con qué modelos de IA puedo usarlos?', answer: 'Están diseñados para brillar en los modelos más potentes como GPT-5, Claude y Gemini. También tenemos secciones dedicadas para herramientas de imagen como Midjourney y DALL-E.' },
    { question: '¿Qué es el generador de prompts?', answer: 'Le describes en una frase lo que quieres lograr y te escribe un prompt a medida, con la misma estructura que los del catálogo. Puedes generar hasta 10 al día, y entra en los dos planes.' },
    { question: '¿Puedo cancelar si ya no los necesito?', answer: 'Claro, aquí mandas tú. Puedes cancelar tu suscripción con un solo clic desde tu perfil en cualquier momento. Seguirás teniendo acceso premium hasta que termine tu mes pagado. El plan vitalicio no hace falta cancelarlo: no se renueva.' },
    { question: '¿Actualizan el banco de prompts?', answer: '¡Cada semana! Nuestro equipo de expertos añade nuevos prompts basados en las tendencias del mercado y las peticiones de nuestra comunidad para que nunca te quedes atrás.' },
    { question: '¿Puedo sugerir un prompt que no esté?', answer: '¡Nos encantaría! Aunque nuestra curaduría es interna para mantener la calidad premium, escuchamos a nuestros suscriptores. Si necesitas un prompt específico, escríbenos y nuestro equipo lo diseñará para la próxima actualización.' },
];

const TRUST = [
    {
        icon: <Sparkles size={16} style={{ color: AMBER }} />,
        chipBg: 'rgba(255,178,36,0.08)', chipBd: 'rgba(255,178,36,0.28)',
        title: 'Sin tasas ocultas', desc: 'El precio es final. Sin créditos, sin recargas, sin sorpresas en tu factura.',
    },
    {
        icon: <RefreshCw size={16} style={{ color: '#b39dff' }} />,
        chipBg: 'rgba(139,92,246,0.1)', chipBd: 'rgba(139,92,246,0.3)',
        title: 'Flexibilidad total', desc: 'Cancela con un clic. Mantienes el acceso hasta que termine tu periodo.',
    },
    {
        icon: <Lock size={16} style={{ color: GREEN }} />,
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
                setIsSubscribed(hasLibraryAccess(sub?.subscription_status));
            }
        };
        checkUser();
    }, []);

    // El pago vive en /checkout (Paddle embebido dentro de la app).
    // `plan=lifetime` abre el pago único; sin parámetro, la mensual.
    const goToCheckout = (plan: Plan['id']) => {
        if (isSubscribed) return;
        const target = plan === 'lifetime' ? '/checkout?plan=lifetime' : '/checkout';
        if (!user) return navigate(`/login?redirect=${encodeURIComponent(target)}`);
        navigate(target);
    };

    return (
        <div style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: SANS }}>
            <main className="mx-auto max-w-5xl px-5 sm:px-8 py-14 md:py-16">

                {/* ── Hero ─────────────────────────────────────────────── */}
                <div className="mb-11 text-center">
                    <p style={{
                        fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
                        textTransform: 'uppercase', color: DIM, marginBottom: 14,
                    }}>
                        Membresía premium
                    </p>
                    <h1 style={{
                        fontWeight: 700, fontSize: 'clamp(1.8rem, 3.8vw, 2.6rem)',
                        lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: 14,
                        textWrap: 'balance',
                    }}>
                        Mismo acceso. <span style={{ color: AMBER }}>Tú eliges cómo pagarlo.</span>
                    </h1>
                    <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
                        Los dos planes incluyen exactamente lo mismo: el catálogo completo y el generador
                        con IA. La única diferencia es si prefieres pagar cada mes o una sola vez.
                    </p>
                </div>

                {/* ── Los dos planes ───────────────────────────────────── */}
                <div className="grid gap-4 md:grid-cols-2" style={{ marginBottom: 22 }}>
                    {PLANS.map(plan => (
                        <div
                            key={plan.id}
                            className="relative flex flex-col"
                            style={{
                                borderRadius: 18,
                                padding: 1,
                                background: plan.featured
                                    ? 'linear-gradient(160deg, rgba(255,178,36,0.5), rgba(255,178,36,0.12) 34%, #232323 66%, #1a1a1a)'
                                    : BORDER_SOFT,
                                boxShadow: plan.featured ? '0 20px 56px rgba(0,0,0,0.5)' : 'none',
                            }}
                        >
                            <div
                                className="flex flex-1 flex-col"
                                style={{ borderRadius: 17, backgroundColor: CARD, overflow: 'hidden' }}
                            >
                                {/* Cabecera */}
                                <div style={{ padding: '24px 24px 22px', borderBottom: `1px solid ${BORDER_SOFT}` }}>
                                    <div className="flex items-center justify-between gap-3" style={{ marginBottom: 18 }}>
                                        <span style={{
                                            fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                                            textTransform: 'uppercase',
                                            color: plan.featured ? AMBER : DIM,
                                        }}>
                                            {plan.tag}
                                        </span>
                                        {plan.ribbon && (
                                            <span
                                                className="inline-flex items-center gap-1.5"
                                                style={{
                                                    backgroundColor: 'rgba(255,178,36,0.1)',
                                                    border: '1px solid rgba(255,178,36,0.32)',
                                                    borderRadius: 100, padding: '4px 11px',
                                                    fontFamily: MONO, fontSize: 9.5, fontWeight: 700,
                                                    letterSpacing: '0.12em', textTransform: 'uppercase', color: AMBER,
                                                }}
                                            >
                                                <InfinityIcon size={10} /> {plan.ribbon}
                                            </span>
                                        )}
                                    </div>

                                    <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 10 }}>
                                        {plan.name}
                                    </p>

                                    <div className="flex items-end gap-2.5" style={{ marginBottom: 10 }}>
                                        <span style={{
                                            fontFamily: MONO, fontWeight: 700, fontSize: 46, lineHeight: 0.95,
                                            letterSpacing: '-0.04em', color: TEXT,
                                        }}>
                                            {plan.price}
                                        </span>
                                        <span style={{ fontFamily: MONO, fontSize: 12.5, color: MUTED, paddingBottom: 4 }}>
                                            {plan.unit}
                                        </span>
                                    </div>

                                    <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.6, minHeight: 34 }}>
                                        {plan.note}
                                    </p>
                                </div>

                                {/* Incluido */}
                                <div className="flex flex-1 flex-col" style={{ padding: '22px 24px 24px' }}>
                                    <p style={{
                                        fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em',
                                        textTransform: 'uppercase', color: DIM, marginBottom: 15,
                                    }}>
                                        Incluido
                                    </p>

                                    <div className="flex flex-col gap-2.5" style={{ marginBottom: 16 }}>
                                        {INCLUDED.map(item => (
                                            <div key={item} className="flex items-start gap-2.5">
                                                <span style={{
                                                    width: 16, height: 16, borderRadius: 5, flexShrink: 0, marginTop: 1,
                                                    backgroundColor: 'rgba(63,207,142,0.1)',
                                                    border: '1px solid rgba(63,207,142,0.3)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Check size={9} strokeWidth={3.2} style={{ color: GREEN }} />
                                                </span>
                                                <span style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>{item}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Lo propio de cada plan */}
                                    <div
                                        className="flex flex-col gap-2.5"
                                        style={{ borderTop: `1px solid ${BORDER_SOFT}`, paddingTop: 16, marginBottom: 22 }}
                                    >
                                        {plan.perks.map(perk => (
                                            <div key={perk} className="flex items-start gap-2.5">
                                                <span style={{
                                                    width: 16, height: 16, borderRadius: 5, flexShrink: 0, marginTop: 1,
                                                    backgroundColor: 'rgba(255,178,36,0.09)',
                                                    border: '1px solid rgba(255,178,36,0.28)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Check size={9} strokeWidth={3.2} style={{ color: AMBER }} />
                                                </span>
                                                <span style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5, fontWeight: 500 }}>
                                                    {perk}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* El botón queda abajo del todo en las dos tarjetas */}
                                    <button
                                        onClick={() => goToCheckout(plan.id)}
                                        disabled={isSubscribed}
                                        className="mt-auto w-full"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontFamily: SANS, fontWeight: 700, fontSize: 14,
                                            padding: '14px 22px', borderRadius: 10,
                                            cursor: isSubscribed ? 'default' : 'pointer',
                                            transition: 'transform .15s, box-shadow .15s, opacity .15s',
                                            ...(isSubscribed
                                                ? { background: PANEL, border: `1px solid ${BORDER}`, color: MUTED }
                                                : plan.featured
                                                    ? { background: 'linear-gradient(180deg, #ffffff, #d8d8d8)', border: '1px solid rgba(255,255,255,0.9)', color: '#000', boxShadow: '0 8px 26px rgba(255,255,255,0.1)' }
                                                    : { background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT }),
                                        }}
                                        onMouseEnter={e => {
                                            if (isSubscribed) return;
                                            const el = e.currentTarget as HTMLElement;
                                            el.style.transform = 'translateY(-1px)';
                                            if (!plan.featured) el.style.borderColor = '#3a3a3a';
                                        }}
                                        onMouseLeave={e => {
                                            const el = e.currentTarget as HTMLElement;
                                            el.style.transform = 'translateY(0)';
                                            if (!plan.featured) el.style.borderColor = BORDER;
                                        }}
                                    >
                                        {isSubscribed ? 'Ya tienes acceso' : plan.cta}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pago seguro */}
                <div className="flex items-center justify-center gap-2" style={{ marginBottom: 56 }}>
                    <Shield size={13} style={{ color: DIM }} />
                    <span style={{ fontSize: 11.5, color: MUTED }}>
                        Pago seguro vía Paddle · SSL 256-bit · Sin renovaciones ocultas
                    </span>
                </div>

                {/* ── Garantías ────────────────────────────────────────── */}
                <div className="mb-16 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {TRUST.map(t => (
                        <div key={t.title} style={{ backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 12, padding: '20px 18px' }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 11, marginBottom: 14,
                                backgroundColor: t.chipBg, border: `1px solid ${t.chipBd}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {t.icon}
                            </div>
                            <p style={{ fontWeight: 700, fontSize: 13.5, color: TEXT, marginBottom: 6, letterSpacing: '-0.01em' }}>{t.title}</p>
                            <p style={{ color: MUTED, fontSize: 12, lineHeight: 1.65 }}>{t.desc}</p>
                        </div>
                    ))}
                </div>

                {/* ── FAQ ──────────────────────────────────────────────── */}
                <div>
                    <div className="mb-8 text-center">
                        <p style={{
                            fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
                            textTransform: 'uppercase', color: DIM, marginBottom: 12,
                        }}>
                            Preguntas frecuentes
                        </p>
                        <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.3rem, 2.6vw, 1.7rem)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
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
                                        aria-expanded={open}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            gap: 16, padding: '16px 18px', background: 'none', border: 'none',
                                            cursor: 'pointer', textAlign: 'left',
                                        }}
                                    >
                                        <span style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, lineHeight: 1.5 }}>{item.question}</span>
                                        <Plus
                                            size={16}
                                            style={{ color: DIM, flexShrink: 0, transition: 'transform .25s', transform: open ? 'rotate(45deg)' : 'none' }}
                                        />
                                    </button>
                                    <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .25s ease' }}>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ padding: '0 18px 17px', color: MUTED, fontSize: 13, lineHeight: 1.75 }}>
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
