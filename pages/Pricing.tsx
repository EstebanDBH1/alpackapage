import React, { useEffect, useState } from 'react';
import {
    ArrowRight, Bookmark, Check, Copy, Infinity as InfinityIcon, Library, Lock, Plus, RefreshCw, Search, Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { hasLibraryAccess } from '../lib/access';
import { fetchPromptsList, getCachedPromptsList } from '../lib/promptsList';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, GREEN, AMBER, SANS, MONO,
} from '../components/darkKit';

/* Precios — los dos planes dan exactamente lo mismo; solo cambia la forma
   de pagar. Por eso las tarjetas muestran únicamente precio y condiciones,
   y lo incluido va una sola vez debajo, común a ambos. */

const MONTHLY_PRICE = 7;
const LIFETIME_PRICE = 47.99;

const usd = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

type Plan = {
    id: 'monthly' | 'lifetime';
    tag: string;
    name: string;
    price: string;
    unit: string;
    note: string;
    terms: string[];
    cta: string;
    featured: boolean;
};

const PLANS: Plan[] = [
    {
        id: 'monthly',
        tag: 'Suscripción',
        name: 'Mensual',
        price: usd(MONTHLY_PRICE),
        unit: 'USD / mes',
        note: 'Para probar sin compromiso. Menos de $0,24 al día.',
        terms: ['Cancela con un clic, sin permanencia', 'Mantienes el acceso hasta fin de mes'],
        cta: 'Suscribirme',
        featured: false,
    },
    {
        id: 'lifetime',
        tag: 'Pago único',
        name: 'Vitalicio',
        price: usd(LIFETIME_PRICE),
        unit: 'USD una sola vez',
        note: 'Lo que cuestan 7 meses de suscripción, para siempre.',
        terms: ['Un solo pago, no se renueva nunca', 'Todas las actualizaciones futuras incluidas'],
        cta: 'Comprar acceso vitalicio',
        featured: true,
    },
];

/* Lo que pagas con cada plan según cuánto tiempo te quedes. */
const HORIZONS = [3, 6, 12, 24];
const BREAK_EVEN = Math.ceil(LIFETIME_PRICE / MONTHLY_PRICE);

const FAQ_DATA = [
    { question: '¿Cuál es la diferencia entre los dos planes?', answer: `Ninguna en cuanto a lo que recibes: los dos dan el catálogo completo, el generador con IA y las actualizaciones. Solo cambia cómo pagas: la mensual son ${usd(MONTHLY_PRICE)} al mes y la cancelas cuando quieras; el vitalicio es un único pago de ${usd(LIFETIME_PRICE)} y no vuelves a pagar. Si piensas quedarte ${BREAK_EVEN} meses o más, sale a cuenta el vitalicio.` },
    { question: '¿Realmente funcionan estos prompts?', answer: 'No son frases sueltas: cada uno tiene un rol, una tarea con los datos de tu caso, la estructura exacta de la respuesta y unas restricciones. Esa estructura es lo que hace que la IA entregue un resultado útil desde el primer intento.' },
    { question: '¿Con qué modelos de IA puedo usarlos?', answer: 'Con cualquier modelo de chat actual: ChatGPT, Claude, Gemini y similares. Los de la categoría Imagen están pensados para generadores de imagen como Midjourney.' },
    { question: '¿Qué es el generador de prompts?', answer: 'Le describes en una frase lo que quieres lograr y te escribe un prompt a medida, con la misma estructura que los del catálogo. Puedes generar hasta 10 al día y está incluido en los dos planes.' },
    { question: '¿Puedo cancelar la suscripción?', answer: 'Sí, con un clic desde tu cuenta y en cualquier momento. Sigues teniendo acceso premium hasta que termine el mes pagado. El plan vitalicio no hace falta cancelarlo: no se renueva.' },
    { question: '¿Cada cuánto se añaden prompts?', answer: 'Cada semana entran prompts nuevos, y a menudo categorías enteras. Están incluidos en tu plan sin pagar nada más.' },
    { question: '¿Puedo pedir un prompt que no esté?', answer: 'Sí. Escuchamos a los suscriptores: si necesitas un prompt concreto, escríbenos y lo tendremos en cuenta para las próximas actualizaciones.' },
];

/* Cifras del catálogo en vivo: salen del listado cacheado que comparte la
   web (el footer ya lo carga), así que nunca se quedan desactualizadas. */
const useCatalogStats = () => {
    const summarize = (list: { category?: string | null }[] | null) => list && list.length
        ? { prompts: list.length, categories: new Set(list.map(p => p.category).filter(Boolean)).size }
        : null;
    const [stats, setStats] = useState(() => summarize(getCachedPromptsList()));
    useEffect(() => {
        if (stats) return;
        let cancelled = false;
        fetchPromptsList().then(list => { if (!cancelled) setStats(summarize(list)); });
        return () => { cancelled = true; };
    }, [stats]);
    return stats;
};

const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = DIM }) => (
    <p style={{
        fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
        textTransform: 'uppercase', color, marginBottom: 12,
    }}>
        {children}
    </p>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 style={{
        fontWeight: 700, fontSize: 'clamp(1.35rem, 2.6vw, 1.75rem)', letterSpacing: '-0.025em',
        lineHeight: 1.2, textWrap: 'balance',
    }}>
        {children}
    </h2>
);

const Pricing: React.FC = () => {
    const navigate = useNavigate();
    const stats = useCatalogStats();
    const [user, setUser] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

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

    const INCLUDED = [
        {
            icon: <Library size={17} />, title: 'La biblioteca completa',
            desc: stats
                ? `Los ${stats.prompts.toLocaleString('es')} prompts del catálogo, en ${stats.categories} categorías.`
                : 'Todos los prompts premium del catálogo, en todas las categorías.',
        },
        { icon: <Sparkles size={17} />, title: 'Generador con IA', desc: 'Describe lo que necesitas y te escribe el prompt. Hasta 10 al día.' },
        { icon: <RefreshCw size={17} />, title: 'Prompts nuevos cada semana', desc: 'El catálogo crece y tu plan lo incluye sin pagar más.' },
        { icon: <Copy size={17} />, title: 'Listos para copiar y pegar', desc: 'Funcionan en ChatGPT, Claude, Gemini y cualquier modelo actual.' },
        { icon: <Search size={17} />, title: 'Búsqueda y categorías', desc: 'Encuentra el prompt que necesitas por tema en segundos.' },
        { icon: <Bookmark size={17} />, title: 'Tus guardados', desc: 'Marca tus favoritos y tenlos siempre a mano.' },
    ];

    return (
        <div style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: SANS }}>
            <style>{`
                .pr-btn { transition: transform .15s, border-color .15s, box-shadow .15s; }
                .pr-btn:not(:disabled):hover { transform: translateY(-1px); }
                .pr-btn-ghost:not(:disabled):hover { border-color: #3d3d3d !important; }
                .pr-btn-solid:not(:disabled):hover { box-shadow: 0 10px 30px rgba(255,255,255,0.14); }
                .pr-btn:focus-visible, .pr-faq:focus-visible { outline: 2px solid ${AMBER}; outline-offset: 2px; }
                .pr-faq:hover .pr-faq-q { color: #fff; }
            `}</style>

            <main className="mx-auto max-w-5xl px-4 sm:px-8 py-14 md:py-20">

                {/* ── Hero ─────────────────────────────────────────────── */}
                <header className="mx-auto mb-12 text-center" style={{ maxWidth: 620 }}>
                    <Eyebrow>Precios</Eyebrow>
                    <h1 style={{
                        fontWeight: 700, fontSize: 'clamp(1.9rem, 4.2vw, 2.8rem)',
                        lineHeight: 1.1, letterSpacing: '-0.035em', marginBottom: 16, textWrap: 'balance',
                    }}>
                        Mismo acceso. <span style={{ color: AMBER }}>Tú eliges cómo pagarlo.</span>
                    </h1>
                    <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.65, textWrap: 'pretty' }}>
                        Los dos planes incluyen el catálogo completo y el generador con IA.
                        Paga cada mes o una sola vez.
                    </p>
                </header>

                {/* ── Ya suscrito ─────────────────────────────────────── */}
                {isSubscribed && (
                    <div
                        className="mx-auto mb-6 flex flex-wrap items-center justify-between gap-3"
                        style={{
                            maxWidth: 880, padding: '12px 16px', borderRadius: 12,
                            backgroundColor: 'rgba(63,207,142,0.06)', border: '1px solid rgba(63,207,142,0.25)',
                        }}
                    >
                        <span className="flex items-center gap-2" style={{ fontSize: 14, color: TEXT }}>
                            <Check size={15} strokeWidth={3} style={{ color: GREEN }} />
                            Ya tienes acceso premium.
                        </span>
                        <Link to="/dashboard" className="flex items-center gap-1.5" style={{ fontSize: 14, fontWeight: 600, color: GREEN, textDecoration: 'none' }}>
                            Ir a mi cuenta <ArrowRight size={14} />
                        </Link>
                    </div>
                )}

                {/* ── Los dos planes ───────────────────────────────────── */}
                <div className="mx-auto grid gap-4 md:grid-cols-2" style={{ maxWidth: 880 }}>
                    {PLANS.map(plan => (
                        <section
                            key={plan.id}
                            aria-label={`Plan ${plan.name}`}
                            className="relative flex flex-col"
                            style={{
                                borderRadius: 16, padding: 'clamp(22px, 3vw, 30px)',
                                backgroundColor: CARD,
                                border: `1px solid ${plan.featured ? 'rgba(255,178,36,0.45)' : BORDER}`,
                                boxShadow: plan.featured
                                    ? '0 0 0 4px rgba(255,178,36,0.05), 0 24px 60px rgba(0,0,0,0.55)'
                                    : 'none',
                                backgroundImage: plan.featured
                                    ? 'radial-gradient(120% 60% at 100% 0%, rgba(255,178,36,0.08), transparent 60%)'
                                    : 'none',
                            }}
                        >
                            <div className="flex items-center justify-between gap-3" style={{ marginBottom: 20 }}>
                                <span style={{
                                    fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                                    textTransform: 'uppercase', color: plan.featured ? AMBER : DIM,
                                }}>
                                    {plan.tag}
                                </span>
                                {plan.featured && (
                                    <span
                                        className="inline-flex items-center gap-1.5"
                                        style={{
                                            backgroundColor: 'rgba(255,178,36,0.1)', border: '1px solid rgba(255,178,36,0.32)',
                                            borderRadius: 100, padding: '4px 11px',
                                            fontFamily: MONO, fontSize: 10, fontWeight: 700,
                                            letterSpacing: '0.12em', textTransform: 'uppercase', color: AMBER,
                                        }}
                                    >
                                        <InfinityIcon size={11} /> Mejor valor
                                    </span>
                                )}
                            </div>

                            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 12 }}>
                                {plan.name}
                            </h2>

                            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1" style={{ marginBottom: 10 }}>
                                <span style={{
                                    fontFamily: MONO, fontWeight: 700, fontSize: 'clamp(2.5rem, 5vw, 3rem)',
                                    lineHeight: 1, letterSpacing: '-0.045em', color: TEXT,
                                }}>
                                    {plan.price}
                                </span>
                                <span style={{ fontFamily: MONO, fontSize: 13, color: MUTED }}>{plan.unit}</span>
                            </div>

                            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 22 }}>
                                {plan.note}
                            </p>

                            <ul className="flex flex-col gap-3" style={{ borderTop: `1px solid ${BORDER_SOFT}`, paddingTop: 20, marginBottom: 26 }}>
                                {plan.terms.map(term => (
                                    <li key={term} className="flex items-start gap-2.5" style={{ fontSize: 14, color: TEXT, lineHeight: 1.5 }}>
                                        <Check size={16} strokeWidth={2.6} style={{ color: plan.featured ? AMBER : GREEN, flexShrink: 0, marginTop: 2 }} />
                                        {term}
                                    </li>
                                ))}
                                <li className="flex items-start gap-2.5" style={{ fontSize: 14, color: MUTED, lineHeight: 1.5 }}>
                                    <Check size={16} strokeWidth={2.6} style={{ color: DIM, flexShrink: 0, marginTop: 2 }} />
                                    Incluye todo lo de abajo
                                </li>
                            </ul>

                            <button
                                onClick={() => goToCheckout(plan.id)}
                                disabled={isSubscribed}
                                className={`pr-btn mt-auto w-full ${plan.featured ? 'pr-btn-solid' : 'pr-btn-ghost'}`}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    fontFamily: SANS, fontWeight: 700, fontSize: 15,
                                    padding: '14px 22px', borderRadius: 10,
                                    cursor: isSubscribed ? 'default' : 'pointer',
                                    ...(isSubscribed
                                        ? { background: PANEL, border: `1px solid ${BORDER}`, color: MUTED }
                                        : plan.featured
                                            ? { background: 'linear-gradient(180deg, #ffffff, #dcdcdc)', border: '1px solid #fff', color: '#000' }
                                            : { background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT }),
                                }}
                            >
                                {isSubscribed ? 'Ya tienes acceso' : <>{plan.cta} <ArrowRight size={16} /></>}
                            </button>
                        </section>
                    ))}
                </div>

                {/* Garantías, en una línea */}
                <ul
                    className="mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
                    style={{ marginTop: 22, marginBottom: 88, fontSize: 13, color: MUTED }}
                >
                    <li className="flex items-center gap-2"><Lock size={14} style={{ color: DIM }} /> Pago seguro con Paddle</li>
                    <li className="flex items-center gap-2"><RefreshCw size={14} style={{ color: DIM }} /> Cancela cuando quieras</li>
                    <li className="flex items-center gap-2"><Sparkles size={14} style={{ color: DIM }} /> Sin créditos ni cargos ocultos</li>
                </ul>

                {/* ── Incluido en los dos planes ───────────────────────── */}
                <section style={{ marginBottom: 88 }}>
                    <div className="mb-8 text-center">
                        <Eyebrow>Incluido en los dos planes</Eyebrow>
                        <SectionTitle>Todo lo que desbloqueas.</SectionTitle>
                    </div>

                    <div
                        className="grid sm:grid-cols-2 lg:grid-cols-3"
                        style={{ gap: 1, backgroundColor: BORDER_SOFT, border: `1px solid ${BORDER_SOFT}`, borderRadius: 14, overflow: 'hidden' }}
                    >
                        {INCLUDED.map(item => (
                            <div key={item.title} style={{ backgroundColor: CARD, padding: '22px 22px 24px' }}>
                                <span style={{
                                    width: 36, height: 36, borderRadius: 9, marginBottom: 14,
                                    border: `1px solid ${BORDER}`, backgroundColor: PANEL, color: TEXT,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {item.icon}
                                </span>
                                <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, letterSpacing: '-0.01em' }}>{item.title}</p>
                                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Cuánto pagas con el tiempo ──────────────────────── */}
                <section className="grid items-center gap-8 md:grid-cols-2" style={{ marginBottom: 88 }}>
                    <div>
                        <Eyebrow>Haz la cuenta</Eyebrow>
                        <SectionTitle>A partir del mes {BREAK_EVEN}, el vitalicio sale más barato.</SectionTitle>
                        <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, marginTop: 14, maxWidth: 420 }}>
                            Si solo quieres probar, empieza con la mensual. Si sabes que vas a usar
                            la biblioteca, el pago único te ahorra dinero a la larga.
                        </p>
                    </div>

                    <div style={{ backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 14, overflow: 'hidden' }}>
                        <table className="w-full" style={{ borderCollapse: 'collapse', fontFamily: MONO, fontSize: 14 }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
                                    {['Tiempo', 'Mensual', 'Vitalicio'].map((h, i) => (
                                        <th key={h} scope="col" style={{
                                            padding: '13px 18px', textAlign: i ? 'right' : 'left',
                                            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em',
                                            textTransform: 'uppercase', color: DIM,
                                        }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {HORIZONS.map((months, i) => {
                                    const monthly = months * MONTHLY_PRICE;
                                    const lifetimeWins = LIFETIME_PRICE < monthly;
                                    return (
                                        <tr key={months} style={{ borderBottom: i === HORIZONS.length - 1 ? 'none' : `1px solid ${BORDER_SOFT}` }}>
                                            <th scope="row" style={{ padding: '13px 18px', textAlign: 'left', fontWeight: 500, color: MUTED }}>
                                                {months} meses
                                            </th>
                                            <td style={{ padding: '13px 18px', textAlign: 'right', color: lifetimeWins ? DIM : TEXT }}>
                                                {usd(monthly)}
                                            </td>
                                            <td style={{ padding: '13px 18px', textAlign: 'right', color: lifetimeWins ? GREEN : DIM, fontWeight: lifetimeWins ? 700 : 400 }}>
                                                {usd(LIFETIME_PRICE)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── FAQ ──────────────────────────────────────────────── */}
                <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
                    <div>
                        <Eyebrow>Preguntas frecuentes</Eyebrow>
                        <SectionTitle>Lo que suelen preguntarnos.</SectionTitle>
                    </div>

                    <div style={{ borderTop: `1px solid ${BORDER_SOFT}` }}>
                        {FAQ_DATA.map((item, index) => {
                            const open = openIndex === index;
                            return (
                                <div key={item.question} style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
                                    <button
                                        onClick={() => setOpenIndex(open ? null : index)}
                                        aria-expanded={open}
                                        className="pr-faq"
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            gap: 16, padding: '18px 2px', background: 'none', border: 'none',
                                            cursor: 'pointer', textAlign: 'left',
                                        }}
                                    >
                                        <span className="pr-faq-q" style={{ fontSize: 15, fontWeight: 600, color: TEXT, lineHeight: 1.5, transition: 'color .15s' }}>
                                            {item.question}
                                        </span>
                                        <Plus
                                            size={17}
                                            style={{ color: DIM, flexShrink: 0, transition: 'transform .25s', transform: open ? 'rotate(45deg)' : 'none' }}
                                        />
                                    </button>
                                    <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .25s ease' }}>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ padding: '0 2px 20px', color: MUTED, fontSize: 14.5, lineHeight: 1.75, maxWidth: 620 }}>
                                                {item.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default Pricing;
