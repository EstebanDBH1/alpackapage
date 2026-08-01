import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AlertCircle, ArrowRight, Check, ChevronDown, Copy, Lock, Sparkles, Wand2 } from 'lucide-react';
import {
    BG, BG_WARM, TEXT, TEXT_MED, TEXT_DIM, BORDER, ACCENT, YELLOW, GREEN, FONT,
    useEuclidFont, LandingStyles,
} from '../components/landingKit';

// Estado de acceso: se resuelve una vez al montar (getSession es local, la
// suscripción es un solo round-trip a Supabase).
type Access = 'loading' | 'anonymous' | 'unsubscribed' | 'subscribed';

const IDEA_MAX = 1000;
// Debe coincidir con GENERATOR_DAILY_LIMIT de la Edge Function (el límite
// real se aplica en el servidor; esto es solo para pintar el contador).
const DAILY_LIMIT = 10;

const STEPS = [
    {
        emoji: '💬',
        title: 'Describe tu objetivo',
        text: 'Cuéntanos qué necesitas con tus palabras — un post para LinkedIn, keywords SEO, una imagen, lo que sea.',
    },
    {
        emoji: '✍️',
        title: 'Añade contexto',
        text: 'Opcional. Indica el tono, el público o el formato que buscas y moldeamos el prompt alrededor de eso.',
    },
    {
        emoji: '💎',
        title: 'Hazte premium',
        text: 'Por 7 USD/mes desbloqueas el generador — hasta 10 prompts al día — y los +1.000 prompts del banco.',
    },
    {
        emoji: '⚡',
        title: 'Recibe tu mega-prompt',
        text: 'Te devolvemos un prompt de ingeniería listo para copiar y pegar en ChatGPT, Claude, Gemini y más.',
    },
];

// Ejemplos: al tocar uno se coloca en la caja para ajustarlo antes de generar.
const EXAMPLES = [
    'Esquema de un post de LinkedIn para destacar mi último logro profesional.',
    'Keywords SEO para un blog dirigido a solopreneurs.',
    'Un call-to-action para mi anuncio de Facebook de captación de leads.',
    'Un email en frío para el fundador de una SaaS que admiro.',
];

// Vista previa de 3 mega-prompts generados (estructura real, calidad real).
const PREVIEWS = [
    {
        emoji: '📈',
        title: 'Creador de estrategia de marketing',
        features: [
            'Rol + encuadre de audiencia',
            'Posicionamiento + diferenciación',
            'Plan de canales con cadencia semanal',
            'Métricas de éxito incluidas',
        ],
        sample: `Adopta el rol de un estratega de growth senior con más de 10 años lanzando productos digitales. A partir de [INSERTAR PRODUCTO], [INSERTAR AUDIENCIA] y [INSERTAR OBJETIVO], crea un plan de 90 días con: (1) posicionamiento, (2) top 3 canales con cadencia semanal, (3) pilares de contenido, (4) métricas objetivo, (5) tareas de la semana 1.`,
    },
    {
        emoji: '🧲',
        title: 'Generador de ideas de lead magnet',
        features: [
            'Dirigido por audiencia y oferta',
            'Formato + título provisional',
            'Esquema con secciones',
            'Gancho para la landing page',
        ],
        sample: `Actúa como un copywriter de conversión. Para [INSERTAR AUDIENCIA] y [INSERTAR OFERTA], genera 5 ideas de lead magnet. Para cada una: (1) formato, (2) título provisional, (3) esquema de 5 secciones, (4) gancho para la landing, (5) la objeción que desactiva.`,
    },
    {
        emoji: '🖋️',
        title: 'Creador de plantillas de estilo',
        features: [
            'Calibración de voz y tono',
            'Ritmo y cadencia de frase',
            'Vocabulario a usar y a evitar',
            'Preámbulo de estilo reutilizable',
        ],
        sample: `Eres un extractor de estilo de escritura. A partir de estas muestras: [INSERTAR TEXTOS], deriva una guía reutilizable con: (1) descriptores de voz, (2) reglas de ritmo de frase, (3) vocabulario a favorecer y a evitar, (4) un preámbulo que pueda pegar en cualquier prompt futuro.`,
    },
];

const VALUE_PROPS = [
    {
        kicker: 'El problema',
        color: '#e0463f',
        title: 'Deja de perder tiempo con prueba y error',
        text: 'La mayoría de los prompts fallan en silencio: salidas vagas, tono genérico, restricciones que faltan. Iteras durante horas y aun así te conformas.',
    },
    {
        kicker: 'El oficio',
        color: '#8b5cf6',
        title: 'Cada mega-prompt está construido con intención',
        text: 'Rol, audiencia, restricciones, formato de salida y guardarraíles — codificados tal y como los escriben los mejores prompt engineers.',
    },
    {
        kicker: 'El atajo',
        color: '#c98200',
        title: 'Sáltate un proceso de ingeniería de 3.000 $+',
        text: 'Las agencias cobran miles por una especificación de prompt así. Tú consigues la misma estructura en segundos, incluida en tu suscripción.',
    },
    {
        kicker: 'La ventaja',
        color: GREEN,
        title: 'Convierte tareas en tu ventaja con IA',
        text: 'Convierte cada tarea repetible — posts, briefs, outreach, imágenes — en un activo reutilizable que tu yo del futuro agradecerá.',
    },
];

// Paso 2 opcional: tono y formato. No son campos nuevos de la API — se añaden
// al final de la idea antes de mandarla a la Edge Function.
const TONES = ['Profesional', 'Cercano', 'Persuasivo', 'Didáctico', 'Directo', 'Creativo'];
const FORMATS = ['Texto', 'Lista', 'Paso a paso', 'Tabla', 'Guion de vídeo', 'Email', 'Hilo para redes'];

/* Selector compacto tipo chip (tono / formato) */
const ChipSelect: React.FC<{
    label: string;
    options: string[];
    value: string | null;
    onChange: (v: string | null) => void;
}> = ({ label, options, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const active = value !== null;

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    backgroundColor: active ? '#fff7e8' : BG_WARM,
                    border: `1px solid ${active ? '#fbe3b0' : BORDER}`,
                    color: active ? '#a86a00' : TEXT_MED,
                    borderRadius: 100, padding: '6px 12px',
                    fontSize: 12.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
            >
                {value ?? label}
                <ChevronDown size={13} style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </button>

            {open && (
                <ul
                    role="listbox"
                    style={{
                        position: 'absolute', left: 0, bottom: '100%', marginBottom: 8, zIndex: 30,
                        minWidth: 180, backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 14,
                        boxShadow: '0 14px 34px rgba(0,0,0,0.12)', padding: 5,
                    }}
                >
                    {value !== null && (
                        <li>
                            <button
                                type="button"
                                onClick={() => { onChange(null); setOpen(false); }}
                                style={{
                                    width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer',
                                    borderRadius: 9, padding: '8px 11px', fontSize: 13, color: TEXT_DIM,
                                }}
                            >
                                Sin especificar
                            </button>
                        </li>
                    )}
                    {options.map(opt => (
                        <li key={opt} role="option" aria-selected={opt === value}>
                            <button
                                type="button"
                                onClick={() => { onChange(opt); setOpen(false); }}
                                style={{
                                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                                    backgroundColor: opt === value ? BG_WARM : 'transparent',
                                    color: opt === value ? TEXT : TEXT_MED,
                                    borderRadius: 9, padding: '8px 11px',
                                    fontSize: 13, fontWeight: opt === value ? 600 : 500,
                                }}
                            >
                                {opt}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

/* Cabecera de sección reutilizable */
const SectionHead: React.FC<{ kicker: string; title: string; text: string }> = ({ kicker, title, text }) => (
    <div className="mb-8 text-center">
        <div
            className="inline-flex items-center gap-2 rounded-full"
            style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, padding: '5px 13px', marginBottom: 16 }}
        >
            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: ACCENT }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: TEXT_MED }}>
                {kicker}
            </span>
        </div>
        <h2 style={{ fontWeight: 600, fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 10 }}>
            {title}
        </h2>
        <p style={{ color: TEXT_MED, fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>{text}</p>
    </div>
);

const Generator: React.FC = () => {
    const [access, setAccess] = useState<Access>('loading');
    const [idea, setIdea] = useState('');
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [remaining, setRemaining] = useState<number | null>(null);
    const [tone, setTone] = useState<string | null>(null);
    const [format, setFormat] = useState<string | null>(null);
    const [focused, setFocused] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);
    const ideaRef = useRef<HTMLTextAreaElement>(null);

    useEuclidFont();

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user ?? null;
            if (!user) return setAccess('anonymous');

            // El día del rate limit se cuenta en UTC (current_date en Postgres).
            const todayUtc = new Date().toISOString().slice(0, 10);
            const [{ data: sub }, { data: usage }] = await Promise.all([
                supabase
                    .from('subscriptions')
                    .select('subscription_status')
                    .eq('customer_id', user.id)
                    .maybeSingle(),
                supabase
                    .from('generator_usage')
                    .select('count')
                    .eq('user_id', user.id)
                    .eq('day', todayUtc)
                    .maybeSingle(),
            ]);

            const subscribed = !!(sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing'));
            setRemaining(Math.max(DAILY_LIMIT - (usage?.count ?? 0), 0));
            setAccess(subscribed ? 'subscribed' : 'unsubscribed');
        };
        checkAccess();
    }, []);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const useExample = (text: string) => {
        setIdea(text);
        scrollToForm();
        ideaRef.current?.focus();
    };

    const handleGenerate = async () => {
        if (generating || idea.trim().length < 10 || remaining === 0) return;
        setGenerating(true);
        setError(null);
        setResult(null);
        try {
            // Tono y formato viajan dentro de la idea: la Edge Function solo recibe `idea`.
            const extras = [
                tone ? `Tono: ${tone}.` : null,
                format ? `Formato de salida: ${format}.` : null,
            ].filter(Boolean).join(' ');
            const fullIdea = extras ? `${idea.trim()}\n\n${extras}` : idea.trim();

            const { data, error: fnError } = await supabase.functions.invoke('generate-prompt', {
                body: { idea: fullIdea },
            });
            if (fnError) {
                // El servidor responde con el motivo real (límite diario, validación...).
                let msg = 'No se pudo generar el prompt. Inténtalo de nuevo en unos segundos.';
                if (fnError instanceof FunctionsHttpError) {
                    try {
                        const body = await fnError.context.json();
                        if (body?.error) msg = body.error;
                        if (typeof body?.remaining === 'number') setRemaining(body.remaining);
                    } catch { /* cuerpo no-JSON: mensaje genérico */ }
                }
                throw new Error(msg);
            }
            if (data?.error) throw new Error(data.error);
            if (!data?.content) throw new Error('Respuesta vacía del generador.');
            if (typeof data.remaining === 'number') setRemaining(data.remaining);
            setResult(data.content);
        } catch (e: any) {
            setError(e.message || 'Error inesperado. Inténtalo de nuevo.');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (access === 'loading') return (
        <div className="bp-scope" style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: FONT }}>
            <LandingStyles />
            <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 space-y-5">
                {[44, 20, 280].map((h, i) => (
                    <div
                        key={i}
                        className="animate-pulse"
                        style={{
                            height: h, borderRadius: h > 100 ? 18 : 10, width: i === 0 ? '70%' : '100%',
                            backgroundColor: BG_WARM, border: `1px solid ${BORDER}`,
                        }}
                    />
                ))}
            </div>
        </div>
    );

    const cardStyle: React.CSSProperties = {
        backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
    };

    const boxHeader: React.CSSProperties = {
        padding: '12px 18px', backgroundColor: BG_WARM, borderBottom: `1px solid ${BORDER}`,
    };

    const ctaStyle: React.CSSProperties = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        backgroundColor: YELLOW, color: '#1a1500', border: 'none',
        fontWeight: 600, fontSize: 15.5, padding: '15px 28px', borderRadius: 12,
        textDecoration: 'none', cursor: 'pointer',
    };

    return (
        <div className="bp-scope" style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: FONT }}>
            <LandingStyles />

            <main className="mx-auto max-w-3xl px-5 sm:px-8 py-12 md:py-16">

                {/* ── Hero ────────────────────────────────────────────────── */}
                <div className="mb-9 text-center">
                    <div
                        className="inline-flex items-center gap-2 rounded-full"
                        style={{ backgroundColor: '#fff7e8', border: '1px solid #fbe3b0', padding: '5px 13px', marginBottom: 18 }}
                    >
                        <Sparkles size={11} style={{ color: '#c98200' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a86a00' }}>
                            Exclusivo suscriptores
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
                        Genera tus prompts de IA
                        <span style={{ display: 'block', color: ACCENT }}>en un solo clic</span>
                    </h1>
                    <p style={{ color: TEXT_MED, fontSize: 16.5, lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
                        Consigue prompts potentes sin esfuerzo — describe tu objetivo como si hablaras con un amigo
                        y nosotros nos encargamos del resto.
                    </p>
                </div>

                {/* ── Formulario: barra de prompt ─────────────────────────── */}
                <div ref={formRef} className="mb-4">
                    <div
                        style={{
                            backgroundColor: BG,
                            border: `1px solid ${focused ? '#c9c9c2' : BORDER}`,
                            borderRadius: 22,
                            padding: '14px 16px 12px',
                            boxShadow: focused ? '0 14px 44px rgba(0,0,0,0.09)' : '0 10px 34px rgba(0,0,0,0.05)',
                            transition: 'border-color .15s, box-shadow .15s',
                        }}
                    >
                        {/* Fila 1: @ + idea */}
                        <div className="flex items-start gap-3">
                            <span
                                aria-hidden="true"
                                style={{
                                    width: 30, height: 30, borderRadius: 10, flexShrink: 0, marginTop: 2,
                                    backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, color: TEXT_MED,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 600,
                                }}
                            >
                                @
                            </span>

                            <textarea
                                id="idea"
                                ref={ideaRef}
                                value={idea}
                                onChange={(e) => setIdea(e.target.value.slice(0, IDEA_MAX))}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                onKeyDown={(e) => {
                                    // Enter genera; Shift+Enter hace salto de línea.
                                    if (e.key === 'Enter' && !e.shiftKey && access === 'subscribed') {
                                        e.preventDefault();
                                        handleGenerate();
                                    }
                                }}
                                rows={2}
                                aria-label="¿Cuál es tu objetivo?"
                                placeholder="¿Cuál es tu objetivo? Un post de LinkedIn, keywords SEO, un email en frío, una imagen…"
                                style={{
                                    flex: 1, minWidth: 0, resize: 'none', background: 'transparent',
                                    border: 'none', outline: 'none', padding: '5px 0',
                                    fontSize: 16, lineHeight: 1.6, color: TEXT,
                                }}
                            />
                        </div>

                        {/* Fila 2: paso opcional + acción */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3" style={{ paddingLeft: 42 }}>
                            <div className="flex flex-wrap items-center gap-2">
                                <span style={{ fontSize: 11.5, color: TEXT_DIM, marginRight: 2 }}>Opcional:</span>
                                <ChipSelect label="Tono" options={TONES} value={tone} onChange={setTone} />
                                <ChipSelect label="Formato" options={FORMATS} value={format} onChange={setFormat} />
                            </div>

                            <div className="flex items-center gap-3 ml-auto">
                                <span style={{ fontSize: 11.5, color: TEXT_DIM }}>{idea.length}/{IDEA_MAX}</span>

                                {access === 'subscribed' ? (
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating || idea.trim().length < 10 || remaining === 0}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            backgroundColor: YELLOW, color: '#1a1500', border: 'none',
                                            fontWeight: 600, fontSize: 14.5, padding: '11px 20px', borderRadius: 12,
                                            opacity: (generating || idea.trim().length < 10 || remaining === 0) ? 0.45 : 1,
                                            cursor: (generating || idea.trim().length < 10 || remaining === 0) ? 'not-allowed' : 'pointer',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {generating ? (
                                            <>
                                                <span
                                                    className="animate-spin"
                                                    style={{
                                                        width: 13, height: 13, borderRadius: '50%',
                                                        border: '2px solid rgba(26,21,0,0.25)', borderTopColor: '#1a1500',
                                                    }}
                                                />
                                                Generando…
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 size={15} />
                                                Generar
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <Link
                                        to="/pricing"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 8,
                                            backgroundColor: YELLOW, color: '#1a1500',
                                            fontWeight: 600, fontSize: 14.5, padding: '11px 20px', borderRadius: 12,
                                            textDecoration: 'none',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <Lock size={14} />
                                        Desbloquear
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pie de la barra */}
                    <div className="mt-3 flex flex-col items-center gap-2">
                        {access === 'subscribed' ? (
                            <>
                                {generating && (
                                    <p style={{ fontSize: 12.5, color: TEXT_DIM }}>
                                        Construyendo tu mega-prompt… puede tardar unos segundos.
                                    </p>
                                )}
                                {remaining !== null && !generating && (
                                    <p style={{ fontSize: 12.5, color: remaining === 0 ? ACCENT : TEXT_DIM }}>
                                        {remaining === 0
                                            ? 'Límite diario alcanzado — vuelve mañana'
                                            : `Te quedan ${remaining} de ${DAILY_LIMIT} generaciones hoy`}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <p style={{ maxWidth: 460, textAlign: 'center', fontSize: 13, lineHeight: 1.7, color: TEXT_MED }}>
                                    El generador está incluido en la suscripción premium: hasta {DAILY_LIMIT} prompts al día,
                                    más acceso total al banco. Son 7 USD/mes y cancelas cuando quieras.
                                </p>
                                {access === 'anonymous' && (
                                    <Link to="/login?redirect=/generador" style={{ fontSize: 13, color: TEXT_MED, textDecoration: 'none' }}>
                                        Ya tengo cuenta
                                    </Link>
                                )}
                            </>
                        )}

                        {error && (
                            <div
                                className="flex w-full items-start gap-2.5"
                                style={{ backgroundColor: '#fef1f1', border: '1px solid #fbcfcf', borderRadius: 13, padding: '13px 15px', marginTop: 4 }}
                            >
                                <AlertCircle size={15} style={{ color: '#e0463f', flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#a52f2a' }}>{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Resultado ───────────────────────────────────────────── */}
                {result && (
                    <div className="animate-fade-in mb-4" style={cardStyle}>
                        <div className="flex items-center justify-between gap-3" style={boxHeader}>
                            <div className="flex items-center gap-2.5">
                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: GREEN }} />
                                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: TEXT_MED }}>
                                    Tu prompt
                                </span>
                            </div>
                            <button
                                onClick={handleCopy}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    backgroundColor: copied ? '#eefbf2' : BG,
                                    border: `1px solid ${copied ? '#c3ecd1' : BORDER}`,
                                    color: copied ? GREEN : TEXT,
                                    borderRadius: 9, padding: '7px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                                {copied ? '¡Copiado!' : 'Copiar'}
                            </button>
                        </div>
                        <div style={{ padding: '24px 22px', overflowX: 'auto' }}>
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', userSelect: 'all', fontSize: 14.5, lineHeight: 1.85, color: TEXT }}>
                                {result}
                            </pre>
                        </div>
                    </div>
                )}

                {result && (
                    <p className="mb-8 text-center" style={{ fontSize: 13, color: TEXT_MED, lineHeight: 1.7 }}>
                        Reemplaza los campos{' '}
                        <code style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '1px 6px', fontSize: 12.5, color: TEXT }}>
                            [INSERTAR …]
                        </code>{' '}
                        con tus datos antes de usarlo.
                    </p>
                )}

                {/* ── Cómo funciona ───────────────────────────────────────── */}
                <section className="mt-16">
                    <SectionHead
                        kicker="Cómo funciona"
                        title="Cómo usar el generador de prompts"
                        text="Cuatro pasos. Sin tecnicismos ni configuración."
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {STEPS.map((step, i) => (
                            <div key={step.title} style={{ backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '22px 20px' }}>
                                <div className="mb-4 flex items-center gap-3">
                                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: TEXT_DIM }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <span style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
                                    <span style={{ fontSize: 20 }} aria-hidden="true">{step.emoji}</span>
                                </div>
                                <h3 style={{ fontWeight: 600, fontSize: 15.5, color: TEXT, marginBottom: 7, letterSpacing: '-0.01em' }}>
                                    {step.title}
                                </h3>
                                <p style={{ color: TEXT_MED, fontSize: 13.5, lineHeight: 1.65 }}>{step.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Empieza desde un ejemplo ────────────────────────────── */}
                <section className="mt-16">
                    <SectionHead
                        kicker="Pruébalo ahora"
                        title="Empieza desde un ejemplo"
                        text="Toca cualquier idea — se coloca en la caja de arriba para que la ajustes antes de generar."
                    />
                    <div className="flex flex-col gap-2.5">
                        {EXAMPLES.map((ex) => (
                            <button
                                key={ex}
                                onClick={() => useExample(ex)}
                                className="group flex items-center justify-between gap-4 text-left"
                                style={{
                                    backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 14,
                                    padding: '15px 18px', cursor: 'pointer',
                                }}
                            >
                                <span style={{ fontSize: 14.5, color: TEXT_MED, lineHeight: 1.6 }}>{ex}</span>
                                <ArrowRight size={15} style={{ color: TEXT_DIM, flexShrink: 0 }} />
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Qué incluye: vista previa de mega-prompts ───────────── */}
                <section className="mt-16">
                    <SectionHead
                        kicker="¿Qué incluye?"
                        title="Vista previa de 3 mega-prompts generados"
                        text="Estructura real, restricciones reales, calidad de salida real."
                    />
                    <div className="flex flex-col gap-4">
                        {PREVIEWS.map((preview) => (
                            <div key={preview.title} style={{ backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden' }}>
                                <div style={{ padding: '22px 20px' }}>
                                    <div className="mb-4 flex items-center gap-3">
                                        <span style={{ fontSize: 20 }} aria-hidden="true">{preview.emoji}</span>
                                        <h3 style={{ fontWeight: 600, fontSize: 15.5, color: TEXT, letterSpacing: '-0.01em' }}>
                                            {preview.title}
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {preview.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-2.5">
                                                <Check size={13} strokeWidth={3} style={{ color: GREEN, flexShrink: 0, marginTop: 3 }} />
                                                <span style={{ fontSize: 13.5, color: TEXT_MED, lineHeight: 1.5 }}>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: BG_WARM, padding: '16px 20px' }}>
                                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12.5, lineHeight: 1.75, color: TEXT_MED }}>
                                        {preview.sample}
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-7 text-center">
                        <button onClick={scrollToForm} style={ctaStyle}>
                            <Wand2 size={16} />
                            Generar mi prompt
                        </button>
                    </div>
                </section>

                {/* ── Propuesta de valor ──────────────────────────────────── */}
                <section className="mt-16">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {VALUE_PROPS.map((prop) => (
                            <div key={prop.kicker} style={{ backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '22px 20px' }}>
                                <span
                                    style={{
                                        display: 'block', fontSize: 10.5, fontWeight: 700,
                                        letterSpacing: '0.16em', textTransform: 'uppercase',
                                        color: prop.color, marginBottom: 10,
                                    }}
                                >
                                    {prop.kicker}
                                </span>
                                <h3 style={{ fontWeight: 600, fontSize: 15.5, color: TEXT, marginBottom: 7, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                                    {prop.title}
                                </h3>
                                <p style={{ color: TEXT_MED, fontSize: 13.5, lineHeight: 1.65 }}>{prop.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-9 text-center">
                        <button onClick={scrollToForm} style={ctaStyle}>
                            <Wand2 size={16} />
                            Generar mi prompt
                        </button>
                        <p style={{ marginTop: 16, fontSize: 13.5, color: TEXT_MED }}>
                            ¿Prefieres uno ya probado?{' '}
                            <Link to="/prompts" style={{ color: TEXT, fontWeight: 600, textDecoration: 'none' }}>
                                Explora el banco →
                            </Link>
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Generator;
