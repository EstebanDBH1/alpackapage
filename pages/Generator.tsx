import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AlertCircle, ArrowRight, Check, ChevronDown, Copy, Lock, Sparkles, Wand2 } from 'lucide-react';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, GREEN, AMBER, MONO,
} from '../components/darkKit';

/* Generador — mismo lenguaje visual oscuro estilo skills.sh que la home
   y el detalle (ver public/reference-new-app/reference.png). */

// Estado de acceso: se resuelve una vez al montar (getSession es local, la
// suscripción es un solo round-trip a Supabase).
type Access = 'loading' | 'anonymous' | 'unsubscribed' | 'subscribed';

const IDEA_MAX = 1000;
// Debe coincidir con GENERATOR_DAILY_LIMIT de la Edge Function (el límite
// real se aplica en el servidor; esto es solo para pintar el contador).
const DAILY_LIMIT = 10;

const RED = '#ff7a70';

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
        color: RED,
        title: 'Deja de perder tiempo con prueba y error',
        text: 'La mayoría de los prompts fallan en silencio: salidas vagas, tono genérico, restricciones que faltan. Iteras durante horas y aun así te conformas.',
    },
    {
        kicker: 'El oficio',
        color: '#b39dff',
        title: 'Cada mega-prompt está construido con intención',
        text: 'Rol, audiencia, restricciones, formato de salida y guardarraíles — codificados tal y como los escriben los mejores prompt engineers.',
    },
    {
        kicker: 'El atajo',
        color: AMBER,
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
                    fontFamily: MONO,
                    backgroundColor: active ? 'rgba(255,178,36,0.08)' : PANEL,
                    border: `1px solid ${active ? 'rgba(255,178,36,0.28)' : BORDER}`,
                    color: active ? AMBER : MUTED,
                    borderRadius: 100, padding: '6px 12px',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
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
                        minWidth: 180, backgroundColor: PANEL, border: `1px solid ${BORDER}`, borderRadius: 12,
                        boxShadow: '0 14px 34px rgba(0,0,0,0.5)', padding: 5,
                    }}
                >
                    {value !== null && (
                        <li>
                            <button
                                type="button"
                                onClick={() => { onChange(null); setOpen(false); }}
                                style={{
                                    width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer',
                                    fontFamily: MONO, borderRadius: 8, padding: '8px 11px', fontSize: 12.5, color: DIM,
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
                                    fontFamily: MONO,
                                    backgroundColor: opt === value ? BORDER_SOFT : 'transparent',
                                    color: opt === value ? TEXT : MUTED,
                                    borderRadius: 8, padding: '8px 11px',
                                    fontSize: 12.5, fontWeight: opt === value ? 600 : 500,
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
        <p
            style={{
                fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: DIM, marginBottom: 12,
            }}
        >
            {kicker}
        </p>
        <h2 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 'clamp(1.3rem, 2.6vw, 1.7rem)', letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 10, color: TEXT }}>
            {title}
        </h2>
        <p style={{ fontFamily: MONO, color: MUTED, fontSize: 13.5, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>{text}</p>
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
        <div style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: MONO }}>
            <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 space-y-5">
                {[44, 20, 280].map((h, i) => (
                    <div
                        key={i}
                        className="animate-pulse"
                        style={{
                            height: h, borderRadius: h > 100 ? 12 : 8, width: i === 0 ? '70%' : '100%',
                            backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`,
                        }}
                    />
                ))}
            </div>
        </div>
    );

    const cardStyle: React.CSSProperties = {
        backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 12, overflow: 'hidden',
    };

    const boxHeader: React.CSSProperties = {
        padding: '11px 16px', backgroundColor: PANEL, borderBottom: `1px solid ${BORDER_SOFT}`,
    };

    const ctaStyle: React.CSSProperties = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        fontFamily: MONO, backgroundColor: TEXT, color: '#000', border: 'none',
        fontWeight: 700, fontSize: 14, padding: '14px 26px', borderRadius: 10,
        textDecoration: 'none', cursor: 'pointer',
    };

    return (
        <div style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: MONO }}>
            <main className="mx-auto max-w-3xl px-5 sm:px-8 py-12 md:py-14">

                {/* ── Hero ────────────────────────────────────────────────── */}
                <div className="mb-9 text-center">
                    <div
                        className="inline-flex items-center gap-2 rounded-full"
                        style={{
                            backgroundColor: 'rgba(255,178,36,0.08)', border: '1px solid rgba(255,178,36,0.28)',
                            padding: '5px 13px', marginBottom: 18,
                        }}
                    >
                        <Sparkles size={11} style={{ color: AMBER }} />
                        <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: AMBER }}>
                            Exclusivo suscriptores
                        </span>
                    </div>

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
                        Genera tus prompts de IA
                        <span style={{ display: 'block', color: AMBER }}>en un solo clic</span>
                    </h1>
                    <p style={{ fontFamily: MONO, color: MUTED, fontSize: 14.5, lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
                        Consigue prompts potentes sin esfuerzo — describe tu objetivo como si hablaras con un amigo
                        y nosotros nos encargamos del resto.
                    </p>
                </div>

                {/* ── Formulario: barra de prompt ─────────────────────────── */}
                <div ref={formRef} className="mb-4">
                    <div
                        style={{
                            backgroundColor: CARD,
                            border: `1px solid ${focused ? '#3a3a3a' : BORDER_SOFT}`,
                            borderRadius: 14,
                            padding: '14px 16px 12px',
                            transition: 'border-color .15s',
                        }}
                    >
                        {/* Fila 1: $ + idea */}
                        <div className="flex items-start gap-3">
                            <span
                                aria-hidden="true"
                                style={{
                                    width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 2,
                                    backgroundColor: PANEL, border: `1px solid ${BORDER}`, color: MUTED,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: MONO, fontSize: 14, fontWeight: 600,
                                }}
                            >
                                $
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
                                    fontFamily: MONO, fontSize: 14.5, lineHeight: 1.6, color: TEXT,
                                }}
                            />
                        </div>

                        {/* Fila 2: paso opcional + acción */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3" style={{ paddingLeft: 42 }}>
                            <div className="flex flex-wrap items-center gap-2">
                                <span style={{ fontFamily: MONO, fontSize: 11, color: DIM, marginRight: 2 }}>Opcional:</span>
                                <ChipSelect label="Tono" options={TONES} value={tone} onChange={setTone} />
                                <ChipSelect label="Formato" options={FORMATS} value={format} onChange={setFormat} />
                            </div>

                            <div className="flex items-center gap-3 ml-auto">
                                <span style={{ fontFamily: MONO, fontSize: 11, color: DIM }}>{idea.length}/{IDEA_MAX}</span>

                                {access === 'subscribed' ? (
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating || idea.trim().length < 10 || remaining === 0}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            fontFamily: MONO, backgroundColor: TEXT, color: '#000', border: 'none',
                                            fontWeight: 700, fontSize: 13.5, padding: '10px 18px', borderRadius: 9,
                                            opacity: (generating || idea.trim().length < 10 || remaining === 0) ? 0.4 : 1,
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
                                                        border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000',
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
                                            fontFamily: MONO, backgroundColor: TEXT, color: '#000',
                                            fontWeight: 700, fontSize: 13.5, padding: '10px 18px', borderRadius: 9,
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
                                    <p style={{ fontFamily: MONO, fontSize: 12, color: DIM }}>
                                        Construyendo tu mega-prompt… puede tardar unos segundos.
                                    </p>
                                )}
                                {remaining !== null && !generating && (
                                    <p style={{ fontFamily: MONO, fontSize: 12, color: remaining === 0 ? RED : DIM }}>
                                        {remaining === 0
                                            ? 'Límite diario alcanzado — vuelve mañana'
                                            : `Te quedan ${remaining} de ${DAILY_LIMIT} generaciones hoy`}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <p style={{ maxWidth: 460, textAlign: 'center', fontFamily: MONO, fontSize: 12.5, lineHeight: 1.7, color: MUTED }}>
                                    El generador está incluido en la suscripción premium: hasta {DAILY_LIMIT} prompts al día,
                                    más acceso total al banco. Son 7 USD/mes y cancelas cuando quieras.
                                </p>
                                {access === 'anonymous' && (
                                    <Link to="/login?redirect=/generador" style={{ fontFamily: MONO, fontSize: 12.5, color: MUTED, textDecoration: 'none' }}>
                                        Ya tengo cuenta
                                    </Link>
                                )}
                            </>
                        )}

                        {error && (
                            <div
                                className="flex w-full items-start gap-2.5"
                                style={{
                                    backgroundColor: 'rgba(224,70,63,0.08)', border: '1px solid rgba(224,70,63,0.3)',
                                    borderRadius: 10, padding: '12px 14px', marginTop: 4,
                                }}
                            >
                                <AlertCircle size={15} style={{ color: RED, flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: RED }}>{error}</p>
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
                                <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED }}>
                                    Tu prompt
                                </span>
                            </div>
                            <button
                                onClick={handleCopy}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    fontFamily: MONO,
                                    backgroundColor: copied ? 'rgba(63,207,142,0.1)' : TEXT,
                                    border: `1px solid ${copied ? 'rgba(63,207,142,0.35)' : TEXT}`,
                                    color: copied ? GREEN : '#000',
                                    borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                                {copied ? '¡Copiado!' : 'Copiar'}
                            </button>
                        </div>
                        <div style={{ padding: '22px 20px', overflowX: 'auto' }}>
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', userSelect: 'all', fontFamily: MONO, fontSize: 13.5, lineHeight: 1.85, color: TEXT }}>
                                {result}
                            </pre>
                        </div>
                    </div>
                )}

                {result && (
                    <p className="mb-8 text-center" style={{ fontFamily: MONO, fontSize: 12.5, color: MUTED, lineHeight: 1.7 }}>
                        Reemplaza los campos{' '}
                        <code style={{ backgroundColor: PANEL, border: `1px solid ${BORDER}`, borderRadius: 5, padding: '1px 6px', fontSize: 12, color: TEXT }}>
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
                            <div key={step.title} style={{ backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 12, padding: '20px 18px' }}>
                                <div className="mb-4 flex items-center gap-3">
                                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: DIM }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <span style={{ flex: 1, height: 1, backgroundColor: BORDER_SOFT }} />
                                    <span style={{ fontSize: 20 }} aria-hidden="true">{step.emoji}</span>
                                </div>
                                <h3 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: TEXT, marginBottom: 7, letterSpacing: '-0.01em' }}>
                                    {step.title}
                                </h3>
                                <p style={{ fontFamily: MONO, color: MUTED, fontSize: 12.5, lineHeight: 1.65 }}>{step.text}</p>
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
                                    backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 10,
                                    padding: '14px 16px', cursor: 'pointer',
                                    transition: 'border-color .15s, background-color .15s',
                                }}
                                onMouseEnter={e => {
                                    const el = e.currentTarget as HTMLElement;
                                    el.style.borderColor = '#3a3a3a';
                                    el.style.backgroundColor = PANEL;
                                }}
                                onMouseLeave={e => {
                                    const el = e.currentTarget as HTMLElement;
                                    el.style.borderColor = BORDER_SOFT;
                                    el.style.backgroundColor = CARD;
                                }}
                            >
                                <span style={{ fontFamily: MONO, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{ex}</span>
                                <ArrowRight size={15} style={{ color: DIM, flexShrink: 0 }} />
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
                            <div key={preview.title} style={{ backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 12, overflow: 'hidden' }}>
                                <div style={{ padding: '20px 18px' }}>
                                    <div className="mb-4 flex items-center gap-3">
                                        <span style={{ fontSize: 20 }} aria-hidden="true">{preview.emoji}</span>
                                        <h3 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: TEXT, letterSpacing: '-0.01em' }}>
                                            {preview.title}
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {preview.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-2.5">
                                                <Check size={13} strokeWidth={3} style={{ color: GREEN, flexShrink: 0, marginTop: 3 }} />
                                                <span style={{ fontFamily: MONO, fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ borderTop: `1px solid ${BORDER_SOFT}`, backgroundColor: PANEL, padding: '15px 18px' }}>
                                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: MONO, fontSize: 12, lineHeight: 1.75, color: MUTED }}>
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
                            <div key={prop.kicker} style={{ backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 12, padding: '20px 18px' }}>
                                <span
                                    style={{
                                        display: 'block', fontFamily: MONO, fontSize: 10.5, fontWeight: 700,
                                        letterSpacing: '0.16em', textTransform: 'uppercase',
                                        color: prop.color, marginBottom: 10,
                                    }}
                                >
                                    {prop.kicker}
                                </span>
                                <h3 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: TEXT, marginBottom: 7, letterSpacing: '-0.01em', lineHeight: 1.35 }}>
                                    {prop.title}
                                </h3>
                                <p style={{ fontFamily: MONO, color: MUTED, fontSize: 12.5, lineHeight: 1.65 }}>{prop.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-9 text-center">
                        <button onClick={scrollToForm} style={ctaStyle}>
                            <Wand2 size={16} />
                            Generar mi prompt
                        </button>
                        <p style={{ marginTop: 16, fontFamily: MONO, fontSize: 12.5, color: MUTED }}>
                            ¿Prefieres uno ya probado?{' '}
                            <Link to="/" style={{ color: TEXT, fontWeight: 600, textDecoration: 'none' }}>
                                Explora el directorio →
                            </Link>
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Generator;
