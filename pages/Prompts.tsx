import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getCachedPromptsList, fetchPromptsList } from '../lib/promptsList';
import { getAiToolMeta } from '../lib/aiTools';
import { isNewPrompt } from '../lib/utils';
import { Prompt } from '../types';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Shield, Search, ChevronDown, Sparkles, Check } from 'lucide-react';
import {
    BG, BG_WARM, TEXT, TEXT_MED, TEXT_DIM, BORDER, ACCENT, YELLOW, GREEN, FONT,
    useEuclidFont, LandingStyles,
} from '../components/landingKit';

const PAGE_SIZE = 12;

// Subtítulos por categoría
const CATEGORY_SUBTITLES: Record<string, string> = {
    marketing: 'Optimiza tus campañas, automatiza tu copywriting y eleva tu estrategia SEO con prompts validados por expertos en marketing digital.',
    desarrollo: 'Acelera tu flujo de trabajo, refactoriza código complejo y diseña sistemas robustos con IA siguiendo buenas prácticas.',
    escritura: 'Mejora tu redacción, corrige textos técnicos y crea ganchos irresistibles con ingeniería de prompts avanzada.',
};

const DEFAULT_SUBTITLE = 'Todos los prompts están escritos para que puedas adaptarlos fácilmente a tu propio flujo de trabajo.';

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Badges de herramienta IA en versión clara (los de lib/aiTools son para el tema oscuro)
const AI_BADGE: Record<string, { bg: string; bd: string; fg: string }> = {
    'cualquier-modelo': { bg: BG_WARM,   bd: BORDER,    fg: TEXT_MED },
    chatgpt:            { bg: '#eefbf2', bd: '#c3ecd1', fg: '#0f8a44' },
    claude:             { bg: '#fff4ea', bd: '#fbdcc0', fg: '#c2620d' },
    gemini:             { bg: '#eff6ff', bd: '#cfe0fd', fg: '#2563eb' },
};

const Prompts: React.FC = () => {
    const navigate = useNavigate();
    const { category: categoryParam } = useParams<{ category?: string }>();
    const selectedCategory = categoryParam ?? 'todas';
    const [selectedTier, setSelectedTier] = useState<'todos' | 'gratis' | 'premium'>('todos');
    const [searchQuery, setSearchQuery] = useState('');
    // Debounce: filtramos 200ms después de que el usuario deja de teclear,
    // en vez de recalcular el filtro en cada pulsación.
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery.trim().toLowerCase()), 200);
        return () => clearTimeout(t);
    }, [searchQuery]);
    // Arranca con la caché si existe: el grid se pinta en el primer render
    const [prompts, setPrompts] = useState<Prompt[]>(() => getCachedPromptsList() ?? []);
    const [loading, setLoading] = useState(() => !getCachedPromptsList());
    const [user, setUser] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const gridRef = useRef<HTMLDivElement>(null);

    useEuclidFont();

    // ── Sesión + suscripción ───────────────────────────────────────────────────
    useEffect(() => {
        const checkUser = async () => {
            // getSession lee del almacenamiento local (sin round-trip al servidor de auth)
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user ?? null;
            setUser(user);
            if (user) {
                const { data: sub } = await supabase
                    .from('subscriptions').select('subscription_status')
                    .eq('customer_id', user.id).maybeSingle();
                if (sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing')) {
                    setIsSubscribed(true);
                }
            }
        };
        checkUser();
    }, []);

    // ── Prompts ────────────────────────────────────────────────────────────────
    // Stale-while-revalidate: si hubo caché ya se pintó; aquí refrescamos en
    // segundo plano con el listado ligero (sin `content`, ~10x menos payload).
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
        const uniqueCats = Array.from(new Set(prompts.map(p => p.category).filter(Boolean)));
        return ['todas', ...uniqueCats.map(c => String(c).toLowerCase()).sort()];
    }, [prompts]);

    const filteredPrompts = useMemo(() => prompts.filter(prompt => {
        const matchesCategory = selectedCategory === 'todas' || prompt.category?.toLowerCase() === selectedCategory;
        const matchesSearch = !debouncedSearch ||
            (prompt.title || '').toLowerCase().includes(debouncedSearch) ||
            (prompt.description || '').toLowerCase().includes(debouncedSearch) ||
            (prompt.category || '').toLowerCase().includes(debouncedSearch);
        let matchesTier = true;
        if (selectedTier === 'gratis') matchesTier = !prompt.is_premium;
        if (selectedTier === 'premium') matchesTier = !!prompt.is_premium;
        return matchesCategory && matchesSearch && matchesTier;
    }), [prompts, selectedCategory, selectedTier, debouncedSearch]);

    const handleCategorySelect = (cat: string) => {
        setCurrentPage(1);
        if (cat === 'todas') navigate('/prompts');
        else navigate(`/prompts/categoria/${encodeURIComponent(cat)}`);
    };

    useEffect(() => { setCurrentPage(1); }, [selectedCategory, selectedTier, debouncedSearch]);

    const totalPages = Math.ceil(filteredPrompts.length / PAGE_SIZE);
    const paginatedPrompts = filteredPrompts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // El grid reaparece con un fade al cambiar filtro/página (la key fuerza el remontaje)
    const cardsKey = useMemo(() => paginatedPrompts.map(p => p.id).join(','), [paginatedPrompts]);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // El pago vive en /checkout (Paddle embebido dentro de la app)
    const handleSubscribe = () => {
        if (!user) return navigate('/login?redirect=/checkout');
        navigate('/checkout');
    };

    // ── Título y subtítulo dinámicos ────────────────────────────────────────────
    const heroTitle = useMemo(() => {
        if (selectedCategory === 'todas') return 'Encuentra un prompt. Cópialo. Hazlo tuyo.';
        const count = filteredPrompts.length;
        const noun = count === 1 ? 'prompt seleccionado' : 'prompts seleccionados';
        return `${count} ${noun} para ${titleCase(selectedCategory)}.`;
    }, [selectedCategory, filteredPrompts.length]);

    const heroSubtitle = selectedCategory === 'todas'
        ? DEFAULT_SUBTITLE
        : (CATEGORY_SUBTITLES[selectedCategory] ?? DEFAULT_SUBTITLE);

    return (
        <div className="bp-scope" style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: FONT }}>
            <LandingStyles />

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className="px-5 sm:px-8 pt-12 pb-9 text-center">
                <div className="mx-auto" style={{ maxWidth: 720 }}>
                    <div
                        className="inline-flex items-center gap-2 rounded-full"
                        style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, padding: '5px 13px', marginBottom: 18 }}
                    >
                        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: ACCENT }} />
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: TEXT_MED }}>
                            Librería de prompts
                        </span>
                    </div>

                    <h1
                        key={heroTitle}
                        className="animate-fade-up"
                        style={{
                            fontWeight: 600,
                            fontSize: 'clamp(1.75rem, 3.6vw, 2.6rem)',
                            lineHeight: 1.12,
                            letterSpacing: '-0.03em',
                            color: TEXT,
                            marginBottom: 14,
                        }}
                    >
                        {heroTitle}
                    </h1>

                    <p
                        key={heroSubtitle}
                        className="animate-fade-up"
                        style={{ color: TEXT_MED, fontSize: 16, lineHeight: 1.75, maxWidth: 620, margin: '0 auto', animationDelay: '0.15s' }}
                    >
                        {heroSubtitle}
                    </p>
                </div>
            </div>

            {/* ── Barra de filtros (sticky bajo el navbar) ───────────────────── */}
            <div
                style={{
                    position: 'sticky', top: 60, zIndex: 40,
                    backgroundColor: 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                    borderTop: `1px solid ${BORDER}`,
                    borderBottom: `1px solid ${BORDER}`,
                }}
            >
                <div className="mx-auto max-w-4xl px-5 sm:px-8 py-3.5 flex flex-col items-center gap-3.5">

                    {/* Búsqueda */}
                    <div className="relative w-full" style={{ maxWidth: 560 }}>
                        <Search
                            size={15}
                            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: TEXT_DIM, pointerEvents: 'none' }}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar un prompt…"
                            style={{
                                width: '100%', backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 12,
                                padding: '11px 18px 11px 42px', fontSize: 14, color: TEXT, outline: 'none',
                                transition: 'border-color .15s, box-shadow .15s',
                            }}
                            onFocus={e => {
                                e.currentTarget.style.borderColor = '#c9c9c2';
                                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
                            }}
                            onBlur={e => {
                                e.currentTarget.style.borderColor = BORDER;
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {/* Categoría + acceso */}
                    <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
                        <FilterSelect
                            label="Categoría"
                            options={categories.map(c => ({ value: c, label: c === 'todas' ? 'Todas' : titleCase(c) }))}
                            selected={selectedCategory}
                            onSelect={handleCategorySelect}
                        />

                        {/* Filtro de acceso: segmentado */}
                        <div
                            className="flex items-center"
                            style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 11, padding: 3 }}
                        >
                            {(['todos', 'gratis', 'premium'] as const).map(tier => {
                                const active = selectedTier === tier;
                                return (
                                    <button
                                        key={tier}
                                        onClick={() => setSelectedTier(tier)}
                                        style={{
                                            border: 'none', cursor: 'pointer',
                                            backgroundColor: active ? BG : 'transparent',
                                            color: active ? TEXT : TEXT_MED,
                                            boxShadow: active ? '0 1px 4px rgba(0,0,0,0.07)' : 'none',
                                            borderRadius: 9, padding: '7px 15px',
                                            fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                                            transition: 'background .15s, color .15s',
                                        }}
                                    >
                                        {tier}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-5 sm:px-8 pt-10 pb-20">

                {/* ── Grid de prompts ──────────────────────────────────── */}
                <div
                    ref={gridRef}
                    key={cardsKey}
                    className="animate-fade-in grid w-full grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
                >
                    {loading && Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse"
                            style={{ height: 178, borderRadius: 18, border: `1px solid ${BORDER}`, backgroundColor: BG_WARM }}
                        />
                    ))}

                    {!loading && paginatedPrompts.map(prompt => (
                        <PromptCard key={prompt.id} prompt={prompt} />
                    ))}
                </div>

                {/* Estado vacío */}
                {!loading && filteredPrompts.length === 0 && (
                    <div className="text-center" style={{ padding: '48px 0' }}>
                        <p style={{ color: TEXT_MED, fontSize: 15, marginBottom: 20 }}>
                            Ningún prompt coincide con tu búsqueda.
                        </p>
                        <button
                            onClick={() => { handleCategorySelect('todas'); setSelectedTier('todos'); setSearchQuery(''); }}
                            style={{
                                backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 12,
                                padding: '11px 20px', fontSize: 14, fontWeight: 600, color: TEXT, cursor: 'pointer',
                            }}
                        >
                            Ver todos los prompts
                        </button>
                    </div>
                )}

                {/* Paginación */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-10">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 10,
                                padding: '9px 16px', fontSize: 13, fontWeight: 600,
                                color: currentPage === 1 ? TEXT_DIM : TEXT,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                opacity: currentPage === 1 ? 0.5 : 1,
                            }}
                        >
                            ← Anterior
                        </button>
                        <span style={{ fontSize: 13, color: TEXT_MED, minWidth: 66, textAlign: 'center' }}>
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                                backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 10,
                                padding: '9px 16px', fontSize: 13, fontWeight: 600,
                                color: currentPage === totalPages ? TEXT_DIM : TEXT,
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                opacity: currentPage === totalPages ? 0.5 : 1,
                            }}
                        >
                            Siguiente →
                        </button>
                    </div>
                )}

                {/* ── CTA Premium ──────────────────────────────────────── */}
                {!isSubscribed && (
                    <div className="mx-auto mt-16" style={{ maxWidth: 640 }}>
                        <div
                            style={{
                                border: `1px solid ${BORDER}`, borderRadius: 22, overflow: 'hidden',
                                boxShadow: '0 14px 44px rgba(0,0,0,0.06)', backgroundColor: BG,
                            }}
                        >
                            <div style={{ padding: '30px 28px' }}>
                                <div
                                    className="inline-flex items-center gap-2 rounded-full"
                                    style={{ backgroundColor: '#fff7e8', border: '1px solid #fbe3b0', padding: '5px 13px', marginBottom: 18 }}
                                >
                                    <Sparkles size={11} style={{ color: '#c98200' }} />
                                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a86a00' }}>
                                        Acceso total
                                    </span>
                                </div>

                                <div className="flex items-end gap-2.5 mb-1">
                                    <span style={{ fontWeight: 600, fontSize: 42, lineHeight: 1, letterSpacing: '-0.04em', color: TEXT }}>7 USD</span>
                                    <span style={{ fontSize: 15, color: TEXT_MED, paddingBottom: 4 }}>/ mes</span>
                                </div>
                                <p style={{ color: TEXT_MED, fontSize: 15, lineHeight: 1.7, margin: '14px 0 20px' }}>
                                    Desbloquea el banco completo: +1.000 prompts probados, el generador con IA y todos los
                                    prompts nuevos que se añaden cada semana.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-5 mb-7">
                                    {[
                                        '+1.000 prompts, +20 categorías',
                                        'Generador con IA (10 al día)',
                                        'ChatGPT, Claude y Gemini',
                                        'Prompts nuevos cada semana',
                                    ].map(t => (
                                        <div key={t} className="flex items-start gap-2.5">
                                            <Check size={13} strokeWidth={3} style={{ color: GREEN, flexShrink: 0, marginTop: 3 }} />
                                            <span style={{ fontSize: 14, color: TEXT_MED, lineHeight: 1.5 }}>{t}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSubscribe}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                                        backgroundColor: YELLOW, color: '#1a1500', border: 'none', cursor: 'pointer',
                                        fontWeight: 600, fontSize: 16, padding: '16px 26px', borderRadius: 12,
                                    }}
                                >
                                    Suscribirme ahora
                                </button>
                            </div>

                            <div
                                className="flex items-center justify-center gap-2"
                                style={{ backgroundColor: BG_WARM, borderTop: `1px solid ${BORDER}`, padding: '13px 26px' }}
                            >
                                <Shield size={13} style={{ color: TEXT_DIM }} />
                                <span style={{ fontSize: 12.5, color: TEXT_MED }}>Pago seguro · Cancela cuando quieras</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

// ── Dropdown de filtro genérico (categoría, herramienta IA, …) ───────────────
const FilterSelect: React.FC<{
    label: string;
    options: { value: string; label: string }[];
    selected: string;
    onSelect: (value: string) => void;
}> = ({ label, options, selected, onSelect }) => {
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

    const currentLabel = options.find(o => o.value === selected)?.label ?? '';

    return (
        <div ref={ref} className="relative w-full sm:w-64">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: BG, border: `1px solid ${open ? '#c9c9c2' : BORDER}`, borderRadius: 11,
                    padding: '10px 15px', cursor: 'pointer', outline: 'none',
                }}
            >
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: TEXT_DIM }}>
                    {label}
                </span>
                <span className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
                    {currentLabel}
                    <ChevronDown
                        size={14}
                        strokeWidth={2.5}
                        style={{ color: TEXT_DIM, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}
                    />
                </span>
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="subtle-scrollbar"
                    style={{
                        position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 50, marginTop: 6,
                        maxHeight: 288, overflowY: 'auto',
                        backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 14,
                        boxShadow: '0 14px 34px rgba(0,0,0,0.1)', padding: 5,
                    }}
                >
                    {options.map(opt => {
                        const active = opt.value === selected;
                        return (
                            <li key={opt.value} role="option" aria-selected={active}>
                                <button
                                    type="button"
                                    onClick={() => { onSelect(opt.value); setOpen(false); }}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        backgroundColor: active ? BG_WARM : 'transparent',
                                        color: active ? TEXT : TEXT_MED,
                                        border: 'none', cursor: 'pointer', borderRadius: 9,
                                        padding: '9px 12px', fontSize: 13, fontWeight: active ? 600 : 500, textAlign: 'left',
                                    }}
                                >
                                    {opt.label}
                                    {active && <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: ACCENT }} />}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

// ── Card de prompt ──────────────────────────────────────────────────────────
const PromptCard: React.FC<{ prompt: Prompt }> = ({ prompt }) => {
    const tool = getAiToolMeta(prompt.ai_tool);
    const badge = AI_BADGE[tool.value] ?? AI_BADGE['cualquier-modelo'];

    return (
        <Link
            to={`/prompts/${prompt.id}`}
            className="relative flex flex-col"
            style={{
                backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 18,
                padding: '22px 22px 20px', textDecoration: 'none',
                transition: 'transform .15s, box-shadow .15s, border-color .15s',
            }}
            onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.06)';
                el.style.borderColor = '#d8d8d2';
            }}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
                el.style.borderColor = BORDER;
            }}
        >
            {isNewPrompt(prompt.created_at) && (
                <span
                    style={{
                        position: 'absolute', top: -8, right: -6,
                        backgroundColor: ACCENT, color: '#fff',
                        borderRadius: 100, padding: '3px 9px',
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                        boxShadow: '0 4px 12px rgba(245,50,79,0.35)',
                    }}
                >
                    New
                </span>
            )}

            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span
                        style={{
                            backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 7,
                            padding: '3px 8px', fontSize: 10, fontWeight: 600,
                            letterSpacing: '0.12em', textTransform: 'uppercase', color: TEXT_MED,
                        }}
                    >
                        {prompt.category || 'General'}
                    </span>
                    <span
                        style={{
                            backgroundColor: badge.bg, border: `1px solid ${badge.bd}`, borderRadius: 7,
                            padding: '3px 8px', fontSize: 10, fontWeight: 600,
                            letterSpacing: '0.12em', textTransform: 'uppercase', color: badge.fg,
                        }}
                    >
                        {tool.label}
                    </span>
                </div>
                {prompt.is_premium && (
                    <span
                        style={{
                            backgroundColor: '#fff7e8', border: '1px solid #fbe3b0', borderRadius: 7,
                            padding: '3px 8px', fontSize: 10, fontWeight: 700,
                            letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a86a00',
                        }}
                    >
                        Premium
                    </span>
                )}
            </div>

            <h3 style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.35, color: TEXT, marginBottom: 8, letterSpacing: '-0.01em' }}>
                {prompt.title}
            </h3>
            <p className="line-clamp-3" style={{ color: TEXT_MED, fontSize: 14, lineHeight: 1.65 }}>
                {prompt.description}
            </p>
        </Link>
    );
};

export default Prompts;
