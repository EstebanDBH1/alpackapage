import React, { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Lock, Copy, Check } from 'lucide-react';
import { getCachedPromptsList, fetchPromptsList } from '../lib/promptsList';
import { getAiToolMeta } from '../lib/aiTools';
import { isNewPrompt } from '../lib/utils';
import { Prompt } from '../types';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, GREEN, AMBER, MONO,
    CategoryBadge,
} from '../components/darkKit';
import { OpenAILogo, ClaudeLogo, GeminiLogo, GrokLogo, DeepSeekLogo } from '../components/AiLogos';

/* ══════════════════════════════════════════════════════════════
   Home — directorio de prompts en modo oscuro, calcado de skills.sh
   (ver public/reference-new-app/reference.png): fondo negro, mono,
   hero ASCII a dos columnas, búsqueda subrayada + tabs sticky bajo
   el header, y el catálogo completo en cards con carga progresiva.
   ══════════════════════════════════════════════════════════════ */

const CHUNK = 60; // cards que se revelan por cada "página" de scroll

type Tab = 'todos' | 'gratis' | 'premium' | 'nuevos';

const ASCII = `█▀█ █▀█ █▀█ █▀▄▀█ █▀█ ▀█▀ █▀
█▀▀ █▀▄ █▄█ █ ▀ █ █▀▀  █  ▄█`;

const AI_TOOLS: { name: string; logo: React.ReactNode }[] = [
    { name: 'ChatGPT', logo: <OpenAILogo /> },
    { name: 'Claude', logo: <ClaudeLogo /> },
    { name: 'Gemini', logo: <GeminiLogo /> },
    { name: 'DeepSeek', logo: <DeepSeekLogo /> },
    { name: 'Grok', logo: <GrokLogo /> },
];

const Home: React.FC = () => {
    const [prompts, setPrompts] = useState<Prompt[]>(() => getCachedPromptsList() ?? []);
    const [loading, setLoading] = useState(() => !getCachedPromptsList());
    const [tab, setTab] = useState<Tab>('todos');
    const [category, setCategory] = useState('todas');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [visibleCount, setVisibleCount] = useState(CHUNK);
    const [copied, setCopied] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const marqueeGroupRef = useRef<HTMLDivElement>(null);
    const [marqueeWidth, setMarqueeWidth] = useState<number | null>(null);

    useEffect(() => {
        document.title = 'Alpacka.ai · Directorio de prompts para ChatGPT, Claude y Gemini';
    }, []);

    // El ancho natural del grupo del marquee cae en una fracción de píxel, y
    // entonces la segunda copia se rasteriza con otra fase subpíxel: al cerrar
    // el bucle todo el texto se corre un poco y se ve como un parpadeo. Fijamos
    // un ancho entero para que las dos copias caigan exactamente en la misma rejilla.
    useLayoutEffect(() => {
        const group = marqueeGroupRef.current;
        if (!group) return;

        const measure = () => {
            const natural = Array.from(group.children).reduce<number>((total, child) => {
                const el = child as HTMLElement;
                return total + el.getBoundingClientRect().width + parseFloat(getComputedStyle(el).marginRight || '0');
            }, 0);
            if (natural > 0) setMarqueeWidth(Math.ceil(natural));
        };

        measure();
        // Las fuentes pueden llegar después del primer render y cambiar el ancho
        document.fonts?.ready.then(measure).catch(() => { });
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    // Atajo "/" para saltar a la búsqueda (como en skills.sh)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    // Debounce de la búsqueda
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery.trim().toLowerCase()), 200);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Stale-while-revalidate sobre el listado ligero compartido
    useEffect(() => {
        let cancelled = false;
        fetchPromptsList().then(fresh => {
            if (cancelled) return;
            if (fresh) setPrompts(fresh);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, []);

    const categories = useMemo(() => {
        const unique = Array.from(new Set(prompts.map(p => p.category?.toLowerCase()).filter(Boolean))) as string[];
        return ['todas', ...unique.sort()];
    }, [prompts]);

    const counts = useMemo(() => ({
        todos: prompts.length,
        gratis: prompts.filter(p => !p.is_premium).length,
        premium: prompts.filter(p => p.is_premium).length,
        nuevos: prompts.filter(p => isNewPrompt(p.created_at)).length,
    }), [prompts]);

    const filtered = useMemo(() => {
        let list = prompts.filter(p => {
            if (category !== 'todas' && p.category?.toLowerCase() !== category) return false;
            if (tab === 'gratis' && p.is_premium) return false;
            if (tab === 'premium' && !p.is_premium) return false;
            if (tab === 'nuevos' && !isNewPrompt(p.created_at)) return false;
            if (debouncedSearch) {
                const haystack = `${p.title} ${p.description} ${p.category}`.toLowerCase();
                if (!haystack.includes(debouncedSearch)) return false;
            }
            return true;
        });
        if (tab === 'nuevos') {
            list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        return list;
    }, [prompts, tab, category, debouncedSearch]);

    // Al cambiar cualquier filtro, la lista visible vuelve al primer bloque
    useEffect(() => { setVisibleCount(CHUNK); }, [tab, category, debouncedSearch]);

    // Carga progresiva: al acercarse al final se revela el siguiente bloque
    const loadMore = useCallback(() => {
        setVisibleCount(v => (v < filtered.length ? v + CHUNK : v));
    }, [filtered.length]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            entries => { if (entries[0].isIntersecting) loadMore(); },
            { rootMargin: '900px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore]);

    const visible = filtered.slice(0, visibleCount);

    const handleCopy = () => {
        navigator.clipboard?.writeText('https://www.alpackaai.xyz').catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const tabs: { key: Tab; label: string }[] = [
        { key: 'todos', label: 'Todos' },
        { key: 'gratis', label: 'Gratis' },
        { key: 'premium', label: 'Premium' },
        { key: 'nuevos', label: 'Nuevos' },
    ];

    const sectionLabel: React.CSSProperties = {
        fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: TEXT, marginBottom: 14,
    };

    return (
        <div style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: MONO }}>

            <style>{`
                /* Marquee de dos grupos idénticos: cada uno se desplaza -100% de su
                   PROPIO ancho, así que al terminar el ciclo el segundo grupo cae
                   exactamente donde empezó el primero. Traducir un % del ancho total
                   (la técnica habitual) deja un desfase subpíxel y produce el parpadeo. */
                .alp-marquee-group {
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                    animation: alpMarquee 62s linear infinite;
                    will-change: transform;
                    backface-visibility: hidden;
                }
                @keyframes alpMarquee {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-100%); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .alp-marquee-group { animation: none; }
                }
            `}</style>

            {/* ── Hero: ASCII + descripción (dos columnas) ─────────── */}
            <div className="mx-auto max-w-6xl px-5 sm:px-8" style={{ paddingTop: 56, paddingBottom: 48 }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                    <div>
                        <pre
                            aria-hidden="true"
                            style={{
                                fontFamily: MONO, fontSize: 'clamp(15px, 3vw, 27px)', lineHeight: 1.22,
                                color: TEXT, userSelect: 'none', marginBottom: 16, letterSpacing: '0.02em',
                            }}
                        >{ASCII}</pre>
                        <h1
                            style={{
                                fontFamily: MONO, fontSize: 13, fontWeight: 600, letterSpacing: '0.18em',
                                textTransform: 'uppercase', color: TEXT,
                            }}
                        >
                            El directorio de prompts de Alpacka
                        </h1>
                    </div>

                    <p style={{ fontFamily: MONO, fontSize: 'clamp(16px, 2vw, 21px)', lineHeight: 1.55, color: MUTED }}>
                        Los prompts son instrucciones listas para tu IA. Copia el que
                        necesitas, pégalo en ChatGPT, Claude o Gemini y obtén resultados
                        de nivel experto sin escribir nada desde cero.
                    </p>
                </div>

                {/* Try it now + IAs compatibles */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16" style={{ marginTop: 44 }}>
                    <div>
                        <p style={sectionLabel}>Pruébalo ahora</p>
                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-between w-full"
                            style={{
                                backgroundColor: PANEL, border: `1px solid ${BORDER}`, borderRadius: 10,
                                padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
                            }}
                        >
                            <span style={{ fontFamily: MONO, fontSize: 13.5, color: TEXT }}>
                                <span style={{ color: DIM }}>$ </span>
                                copia un prompt <span style={{ color: DIM }}>→</span> pégalo en tu IA
                            </span>
                            {copied
                                ? <Check size={15} style={{ color: GREEN, flexShrink: 0 }} />
                                : <Copy size={15} style={{ color: DIM, flexShrink: 0 }} />}
                        </button>
                    </div>

                    <div className="min-w-0">
                        <p style={sectionLabel}>Funciona con estas IAs</p>
                        {/* El espaciado va como margen de cada item (no como `gap` del
                            contenedor): así el ancho del grupo incluye el hueco final y
                            la costura entre las dos copias queda igual que el resto. */}
                        <div className="marquee-mask" style={{ overflow: 'hidden', paddingTop: 6 }}>
                            <div className="flex" style={{ width: 'max-content' }}>
                                {[0, 1].map(copy => (
                                    <div
                                        className="alp-marquee-group"
                                        key={copy}
                                        ref={copy === 0 ? marqueeGroupRef : undefined}
                                        aria-hidden={copy === 1}
                                        style={marqueeWidth ? { width: marqueeWidth } : undefined}
                                    >
                                        {AI_TOOLS.map(tool => (
                                            <span
                                                key={tool.name}
                                                className="inline-flex items-center"
                                                style={{ gap: 10, flexShrink: 0, color: TEXT, marginRight: 34 }}
                                            >
                                                {tool.logo}
                                                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: MUTED, whiteSpace: 'nowrap' }}>
                                                    {tool.name}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Directorio ───────────────────────────────────────── */}
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <p style={{ ...sectionLabel, marginBottom: 0, paddingBottom: 14 }}>Directorio de prompts</p>
            </div>

            {/* Búsqueda + tabs + categoría: sticky arriba al hacer scroll
                (el header es estático y se desplaza con la página) */}
            <div
                style={{
                    position: 'sticky', top: 0, zIndex: 40,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: `1px solid ${BORDER_SOFT}`,
                }}
            >
                <div className="mx-auto max-w-6xl px-5 sm:px-8" style={{ paddingTop: 10 }}>
                    {/* Búsqueda subrayada estilo skills.sh, con atajo "/" */}
                    <div className="relative" style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <Search
                            size={15}
                            style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)', color: DIM, pointerEvents: 'none' }}
                        />
                        <input
                            ref={searchRef}
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar prompts…"
                            style={{
                                width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none',
                                padding: '12px 40px 12px 28px', fontSize: 14, color: TEXT, fontFamily: MONO,
                            }}
                        />
                        <kbd
                            style={{
                                position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)',
                                fontFamily: MONO, fontSize: 11, color: DIM,
                                border: `1px solid ${BORDER}`, borderRadius: 5, padding: '2px 7px',
                            }}
                        >
                            /
                        </kbd>
                    </div>

                    {/* Tabs + categoría */}
                    <div className="flex flex-wrap items-center justify-between gap-x-3">
                        <div className="flex items-center" style={{ gap: 2, overflowX: 'auto' }}>
                            {tabs.map(t => {
                                const active = tab === t.key;
                                return (
                                    <button
                                        key={t.key}
                                        onClick={() => setTab(t.key)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            fontFamily: MONO, fontSize: 13, whiteSpace: 'nowrap',
                                            color: active ? TEXT : DIM, fontWeight: active ? 600 : 400,
                                            padding: '10px 10px 12px',
                                            borderBottom: `2px solid ${active ? TEXT : 'transparent'}`,
                                            marginBottom: -1, transition: 'color .15s',
                                        }}
                                    >
                                        {t.label}{' '}
                                        <span style={{ color: DIM, fontSize: 12 }}>
                                            ({counts[t.key].toLocaleString('es')})
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            aria-label="Filtrar por categoría"
                            style={{
                                fontFamily: MONO, fontSize: 12.5, color: MUTED,
                                backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 7,
                                padding: '5px 9px', outline: 'none', cursor: 'pointer',
                            }}
                        >
                            {categories.map(c => (
                                <option key={c} value={c}>
                                    {c === 'todas' ? 'categoria: todas' : c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Cards ────────────────────────────────────────────── */}
            <div className="mx-auto max-w-6xl px-5 sm:px-8" style={{ paddingTop: 24, paddingBottom: 90 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {loading && Array.from({ length: 9 }).map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse"
                            style={{ height: 150, borderRadius: 12, border: `1px solid ${BORDER_SOFT}`, backgroundColor: CARD }}
                        />
                    ))}

                    {!loading && visible.map(prompt => (
                        <PromptCard key={prompt.id} prompt={prompt} />
                    ))}
                </div>

                {/* Estado vacío */}
                {!loading && filtered.length === 0 && (
                    <div className="text-center" style={{ padding: '64px 20px' }}>
                        <p style={{ color: MUTED, fontSize: 14, marginBottom: 20, fontFamily: MONO }}>
                            Ningún prompt coincide con tu búsqueda.
                        </p>
                        <button
                            onClick={() => { setTab('todos'); setCategory('todas'); setSearchQuery(''); }}
                            style={{
                                fontFamily: MONO, backgroundColor: PANEL, border: `1px solid ${BORDER}`,
                                borderRadius: 8, padding: '9px 18px', fontSize: 13, color: TEXT, cursor: 'pointer',
                            }}
                        >
                            Ver todos
                        </button>
                    </div>
                )}

                {/* Sentinel de scroll + contador */}
                <div ref={sentinelRef} />
                {!loading && filtered.length > 0 && (
                    <p className="text-center" style={{ color: DIM, fontSize: 12, marginTop: 22, fontFamily: MONO }}>
                        {visibleCount < filtered.length
                            ? `${Math.min(visibleCount, filtered.length).toLocaleString('es')} de ${filtered.length.toLocaleString('es')} prompts`
                            : `${filtered.length.toLocaleString('es')} prompts`}
                    </p>
                )}
            </div>

        </div>
    );
};

/* ── Card de prompt (oscura, estilo Geist) ─────────────────────── */
const PromptCard: React.FC<{ prompt: Prompt }> = ({ prompt }) => {
    const tool = getAiToolMeta(prompt.ai_tool);

    return (
        <Link
            to={`/prompts/${prompt.id}`}
            className="flex flex-col"
            style={{
                backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 12,
                padding: '18px 18px 16px', textDecoration: 'none',
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
            {/* Categoría */}
            <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 12 }}>
                <CategoryBadge category={prompt.category} />
                {isNewPrompt(prompt.created_at) && (
                    <span
                        style={{
                            flexShrink: 0, fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                            color: GREEN, backgroundColor: 'rgba(63,207,142,0.09)',
                            border: '1px solid rgba(63,207,142,0.3)', borderRadius: 5, padding: '2px 6px',
                        }}
                    >
                        NEW
                    </span>
                )}
            </div>

            {/* Título + descripción */}
            <h3
                className="line-clamp-1"
                style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 7 }}
            >
                {prompt.title}
            </h3>
            <p
                className="line-clamp-2 flex-1"
                style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.6, color: MUTED, marginBottom: 14 }}
            >
                {prompt.description}
            </p>

            {/* Metadata inferior */}
            <div className="flex items-center justify-between gap-2">
                <span
                    style={{
                        fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: MUTED, backgroundColor: PANEL, border: `1px solid ${BORDER}`,
                        borderRadius: 6, padding: '3px 8px',
                    }}
                >
                    {tool.label}
                </span>
                {prompt.is_premium ? (
                    <span
                        className="flex items-center gap-1.5"
                        style={{
                            fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: AMBER, backgroundColor: 'rgba(255,178,36,0.08)',
                            border: '1px solid rgba(255,178,36,0.28)', borderRadius: 6, padding: '3px 8px',
                        }}
                    >
                        <Lock size={9} strokeWidth={2.5} />
                        Premium
                    </span>
                ) : (
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREEN }}>
                        Gratis
                    </span>
                )}
            </div>
        </Link>
    );
};

export default Home;
