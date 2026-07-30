import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ArrowRight, Check, Copy, Lock, Sparkles, Wand2 } from 'lucide-react';

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
        text: 'Por 7 USD/mes desbloqueas el generador — hasta 10 prompts al día — y los 150+ prompts de la librería.',
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
        title: 'Deja de perder tiempo con prueba y error',
        text: 'La mayoría de los prompts fallan en silencio: salidas vagas, tono genérico, restricciones que faltan. Iteras durante horas y aun así te conformas.',
    },
    {
        kicker: 'El oficio',
        title: 'Cada mega-prompt está construido con intención',
        text: 'Rol, audiencia, restricciones, formato de salida y guardarraíles — codificados tal y como los escriben los mejores prompt engineers.',
    },
    {
        kicker: 'El atajo',
        title: 'Sáltate un proceso de ingeniería de 3.000 $+',
        text: 'Las agencias cobran miles por una especificación de prompt así. Tú consigues la misma estructura en segundos, incluida en tu suscripción.',
    },
    {
        kicker: 'La ventaja',
        title: 'Convierte tareas en tu ventaja con IA',
        text: 'Convierte cada tarea repetible — posts, briefs, outreach, imágenes — en un activo reutilizable que tu yo del futuro agradecerá.',
    },
];

const Generator: React.FC = () => {
    const [access, setAccess] = useState<Access>('loading');
    const [idea, setIdea] = useState('');
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [remaining, setRemaining] = useState<number | null>(null);
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
            const { data, error: fnError } = await supabase.functions.invoke('generate-prompt', {
                body: { idea: idea.trim() },
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
        <div className="min-h-screen bg-background bg-radial-glow font-space">
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6">
                <div className="h-10 w-2/3 animate-pulse rounded-xl bg-card" />
                <div className="h-5 w-full animate-pulse rounded-lg bg-card" />
                <div className="mt-8 h-64 w-full animate-pulse rounded-2xl bg-card" />
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen overflow-x-clip bg-background bg-radial-glow font-space text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

            <main className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">

                {/* ── Hero ────────────────────────────────────────────────── */}
                <div className="mb-10 text-center">
                    <span className="mb-4 inline-flex items-center gap-2 rounded-md border border-accent/40 bg-secondary px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
                        <Sparkles size={10} /> Exclusivo suscriptores
                    </span>
                    <h1 className="mb-4 text-balance text-3xl font-medium leading-tight tracking-tight md:text-4xl">
                        Genera tus prompts de IA
                        <span className="block text-accent">en un solo clic</span>
                    </h1>
                    <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground">
                        Consigue prompts de IA potentes sin esfuerzo — describe tu objetivo
                        como si hablaras con un amigo y nosotros nos encargamos del resto.
                    </p>
                </div>

                {/* ── Formulario ──────────────────────────────────────────── */}
                <div ref={formRef} className="mb-8 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_0_60px_oklch(0.86_0.09_90_/_0.06)]">
                    <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3.5">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            GENERADOR.exe
                        </span>
                    </div>

                    <div className="flex flex-col gap-5 p-6 md:p-8">
                        <div>
                            <label htmlFor="idea" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                ¿Cuál es tu objetivo?
                            </label>
                            <textarea
                                id="idea"
                                ref={ideaRef}
                                value={idea}
                                onChange={(e) => setIdea(e.target.value.slice(0, IDEA_MAX))}
                                rows={4}
                                placeholder="Describe qué quieres lograr — un post de LinkedIn, keywords SEO, un email en frío, una imagen, lo que sea…"
                                className="w-full resize-none rounded-xl border border-border bg-secondary px-4 py-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
                            />
                            <div className="mt-1 text-right">
                                <span className="font-mono text-[10px] text-muted-foreground">
                                    {idea.length}/{IDEA_MAX}
                                </span>
                            </div>
                        </div>

                        {access === 'subscribed' ? (
                            <>
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating || idea.trim().length < 10 || remaining === 0}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {generating ? (
                                        <>
                                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                            Generando... puede tardar unos segundos
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={15} />
                                            Generar prompt
                                        </>
                                    )}
                                </button>

                                {remaining !== null && (
                                    <p className={`text-center font-mono text-[11px] uppercase tracking-[0.2em] ${remaining === 0 ? 'text-accent' : 'text-muted-foreground'}`}>
                                        {remaining === 0
                                            ? 'Límite diario alcanzado — vuelve mañana'
                                            : `Te quedan ${remaining} de ${DAILY_LIMIT} generaciones hoy`}
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <Link
                                    to="/pricing"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90"
                                >
                                    <Lock size={14} />
                                    Hazte premium — 7 USD/mes
                                    <ArrowRight size={14} />
                                </Link>
                                <p className="max-w-sm text-center text-xs leading-relaxed text-muted-foreground">
                                    El generador está incluido en la suscripción premium: hasta {DAILY_LIMIT} prompts
                                    al día, más acceso total a la librería. El resultado aparece aquí mismo,
                                    listo para copiar.
                                </p>
                                {access === 'anonymous' && (
                                    <Link
                                        to="/login?redirect=/generador"
                                        className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Ya tengo cuenta
                                    </Link>
                                )}
                            </div>
                        )}

                        {error && (
                            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Resultado ───────────────────────────────────────────── */}
                {result && (
                    <div className="animate-fade-in mb-8 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_0_60px_oklch(0.86_0.09_90_/_0.06)]">
                        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
                            <div className="flex items-center gap-3">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                    PROMPT_GENERADO.txt
                                </span>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none ${
                                    copied
                                        ? 'border-accent/50 bg-secondary text-accent'
                                        : 'border-border bg-secondary text-foreground hover:border-primary/40'
                                }`}
                            >
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto p-6 md:p-8">
                            <pre className="select-all whitespace-pre-wrap break-words font-mono text-sm leading-[1.8] text-foreground/90">
                                {result}
                            </pre>
                        </div>
                    </div>
                )}

                {result && (
                    <p className="mb-8 text-center text-xs leading-relaxed text-muted-foreground">
                        Reemplaza los campos <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-primary">[INSERTAR ...]</code> con
                        tus datos antes de usarlo.
                    </p>
                )}

                {/* ── Cómo funciona ───────────────────────────────────────── */}
                <section className="mt-20">
                    <div className="mb-10 text-center">
                        <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                            Cómo funciona
                        </span>
                        <h2 className="mb-3 text-balance text-2xl font-medium tracking-tight md:text-3xl">
                            Cómo usar el generador de prompts
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Cuatro pasos. Sin tecnicismos ni configuración.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {STEPS.map((step, i) => (
                            <div
                                key={step.title}
                                className="rounded-2xl border border-border/70 bg-card p-6 transition hover:border-primary/30"
                            >
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <span className="h-px flex-1 bg-border/60" />
                                    <span className="text-xl" aria-hidden="true">{step.emoji}</span>
                                </div>
                                <h3 className="mb-2 text-base font-medium tracking-tight text-foreground">
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {step.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Empieza desde un ejemplo ────────────────────────────── */}
                <section className="mt-20">
                    <div className="mb-8 text-center">
                        <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                            Pruébalo ahora
                        </span>
                        <h2 className="mb-3 text-balance text-2xl font-medium tracking-tight md:text-3xl">
                            Empieza desde un ejemplo
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Toca cualquier idea — se coloca en la caja de arriba para que la ajustes antes de generar.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        {EXAMPLES.map((ex) => (
                            <button
                                key={ex}
                                onClick={() => useExample(ex)}
                                className="group flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-5 py-4 text-left transition hover:border-primary/40"
                            >
                                <span className="text-sm leading-relaxed text-muted-foreground transition group-hover:text-foreground">
                                    {ex}
                                </span>
                                <ArrowRight size={14} className="flex-shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Qué incluye: vista previa de mega-prompts ───────────── */}
                <section className="mt-20">
                    <div className="mb-10 text-center">
                        <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                            ¿Qué incluye?
                        </span>
                        <h2 className="mb-3 text-balance text-2xl font-medium tracking-tight md:text-3xl">
                            Vista previa de 3 mega-prompts generados
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Estructura real, restricciones reales, calidad de salida real.
                        </p>
                    </div>
                    <div className="flex flex-col gap-5">
                        {PREVIEWS.map((preview) => (
                            <div
                                key={preview.title}
                                className="overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:border-primary/30"
                            >
                                <div className="p-6">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="text-xl" aria-hidden="true">{preview.emoji}</span>
                                        <h3 className="text-base font-medium tracking-tight text-foreground">
                                            {preview.title}
                                        </h3>
                                    </div>
                                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {preview.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Check size={13} className="flex-shrink-0 text-accent" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="border-t border-border/60 bg-secondary/40 p-5">
                                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground/70">
                                        {preview.sample}
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <button
                            onClick={scrollToForm}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90"
                        >
                            <Wand2 size={15} />
                            Generar mi prompt
                        </button>
                    </div>
                </section>

                {/* ── Propuesta de valor ──────────────────────────────────── */}
                <section className="mt-20">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {VALUE_PROPS.map((prop) => (
                            <div key={prop.kicker} className="rounded-2xl border border-border/70 bg-card p-6">
                                <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                                    {prop.kicker}
                                </span>
                                <h3 className="mb-2 text-base font-medium tracking-tight text-foreground">
                                    {prop.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {prop.text}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 text-center">
                        <button
                            onClick={scrollToForm}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90"
                        >
                            <Wand2 size={15} />
                            Generar mi prompt
                        </button>
                        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                            ¿Prefieres uno ya probado?{' '}
                            <Link to="/prompts" className="underline transition hover:text-foreground">Explora la librería</Link>.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Generator;
