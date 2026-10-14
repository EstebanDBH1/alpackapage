import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getCachedPromptsList, fetchPromptsList } from '../lib/promptsList';
import { hasLibraryAccess } from '../lib/access';
import { AI_TOOLS, getAiToolMeta } from '../lib/aiTools';
import { isNewPrompt } from '../lib/utils';
import GeneratorCallout from '../components/GeneratorCallout';
import { Prompt } from '../types';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Shield, Search, ChevronDown, Sparkles, Check, X, Lock, ArrowRight, SlidersHorizontal, ChevronRight,
} from 'lucide-react';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, AMBER, GREEN, SANS, MONO,
    LandingStyles, CategoryBadge, AI_BADGE_DARK, HEADER_H, getCategoryStyle,
} from '../components/darkKit';

// Cuántas cards se pintan de entrada y cuántas añade "Ver más"
const PAGE_SIZE = 24;
// Alto de la barra de herramientas fija (sidebar y scroll se colocan debajo)
const BAR_H = 64;

// Subtítulos por categoría
const CATEGORY_SUBTITLES: Record<string, string> = {
    marketing: 'Optimiza tus campañas, automatiza tu copywriting y eleva tu estrategia SEO con prompts validados por expertos en marketing digital.',
    desarrollo: 'Acelera tu flujo de trabajo, refactoriza código complejo y diseña sistemas robustos con IA siguiendo buenas prácticas.',
    escritura: 'Mejora tu redacción, corrige textos técnicos y crea ganchos irresistibles con ingeniería de prompts avanzada.',
};

const DEFAULT_SUBTITLE = 'Todos los prompts están escritos para que puedas adaptarlos fácilmente a tu propio flujo de trabajo.';

type Tier = 'todos' | 'gratis' | 'premium';
type Sort = 'destacados' | 'recientes' | 'az';

const TIERS: { value: Tier; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'gratis', label: 'Gratis' },
    { value: 'premium', label: 'Premium' },
];

const SORTS: { value: Sort; label: string }[] = [
    { value: 'destacados', label: 'Destacados' },
    { value: 'recientes', label: 'Más recientes' },
    { value: 'az', label: 'A–Z' },
];

// Búsqueda sin tildes ni mayúsculas: "redaccion" encuentra "Redacción"
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Estilos propios de la página: hovers y focus en CSS en vez de handlers JS
const PageStyles: React.FC = () => (
    <style>{`
    .pp-card { transition: border-color .18s, background-color .18s, transform .18s; }
    .pp-card:hover { border-color: #3a3a3a; background-color: ${PANEL}; transform: translateY(-2px); }
    .pp-card:focus-visible, .pp-btn:focus-visible, .pp-input:focus-visible { outline: 2px solid ${TEXT}; outline-offset: 2px; }
    .pp-card .pp-arrow { transition: transform .18s, color .18s; }
    .pp-card:hover .pp-arrow { transform: translateX(3px); color: ${TEXT}; }
    .pp-row { transition: background-color .12s, color .12s; }
    .pp-row:hover { background-color: ${PANEL}; color: ${TEXT}; }
    .pp-ghost:hover { color: ${TEXT}; border-color: #3a3a3a; }
    .pp-input::placeholder { color: ${DIM}; }
    .pp-input:focus { border-color: #3a3a3a; background-color: ${PANEL}; }
    .pp-noscroll::-webkit-scrollbar { display: none; }
    .pp-noscroll { scrollbar-width: none; }
    @keyframes ppSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes ppFade { from { opacity: 0; } to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) {
      .pp-card, .pp-card .pp-arrow { transition: none; }
      .pp-card:hover { transform: none; }
    }
  `}</style>
);

const Prompts: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { category: categoryParam } = useParams<{ category?: string }>();
    const selectedCategory = categoryParam ?? 'todas';

    // Filtros en la URL: se pueden compartir y sobreviven al botón "atrás"
    const [searchParams, setSearchParams] = useSearchParams();
    const tierParam = searchParams.get('acceso');
    const selectedTier: Tier = tierParam === 'gratis' || tierParam === 'premium' ? tierParam : 'todos';
    const toolParam = searchParams.get('ia');
    const selectedTool = AI_TOOLS.some(t => t.value === toolParam) ? toolParam! : 'todas';
    const sortParam = searchParams.get('orden');
    const selectedSort: Sort = sortParam === 'recientes' || sortParam === 'az' ? sortParam : 'destacados';

    const setParam = useCallback((key: string, value: string | null) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value) next.set(key, value); else next.delete(key);
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    // El buscador del header navega a /prompts?q=…: la búsqueda arranca desde
    // la URL, y lo que se teclea aquí se escribe de vuelta (con debounce). El
    // ref evita que esa escritura pise lo que la persona sigue tecleando.
    const queryParam = searchParams.get('q') ?? '';
    const [searchQuery, setSearchQuery] = useState(queryParam);
    const lastWrittenQ = useRef(queryParam);
    useEffect(() => {
        if (queryParam !== lastWrittenQ.current) {
            lastWrittenQ.current = queryParam;
            setSearchQuery(queryParam);
        }
    }, [queryParam]);

    const [debouncedSearch, setDebouncedSearch] = useState(() => fold(queryParam.trim()));
    useEffect(() => {
        const t = setTimeout(() => {
            const trimmed = searchQuery.trim();
            setDebouncedSearch(fold(trimmed));
            if (trimmed !== lastWrittenQ.current) {
                lastWrittenQ.current = trimmed;
                setParam('q', trimmed || null);
            }
        }, 200);
        return () => clearTimeout(t);
    }, [searchQuery, setParam]);
    const searchTokens = useMemo(() => debouncedSearch.split(/\s+/).filter(Boolean), [debouncedSearch]);

    // Arranca con la caché si existe: el grid se pinta en el primer render
    const [prompts, setPrompts] = useState<Prompt[]>(() => getCachedPromptsList() ?? []);
    const [loading, setLoading] = useState(() => !getCachedPromptsList());
    const [user, setUser] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [visible, setVisible] = useState(PAGE_SIZE);
    const [sheetOpen, setSheetOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

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
                if (hasLibraryAccess(sub?.subscription_status)) {
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

    // "/" enfoca el buscador desde cualquier parte de la página
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
            const el = e.target as HTMLElement;
            if (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
            e.preventDefault();
            searchRef.current?.focus();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    // ── Filtrado con facetas ───────────────────────────────────────────────────
    // Texto indexable precalculado una vez por lista (no en cada pulsación)
    const indexed = useMemo(() => prompts.map((p, i) => ({
        p,
        order: i,
        cat: (p.category || '').toLowerCase(),
        tool: getAiToolMeta(p.ai_tool).value,
        text: fold(`${p.title || ''} ${p.description || ''} ${p.category || ''}`),
    })), [prompts]);

    const matchSearch = (text: string) => searchTokens.every(t => text.includes(t));
    const matchTier = (p: Prompt) =>
        selectedTier === 'todos' || (selectedTier === 'gratis' ? !p.is_premium : !!p.is_premium);
    // Un prompt para "cualquier modelo" también sirve en ChatGPT, Claude o Gemini
    const matchTool = (tool: string) =>
        selectedTool === 'todas' || tool === selectedTool || tool === 'cualquier-modelo';
    const matchCat = (cat: string) => selectedCategory === 'todas' || cat === selectedCategory;

    // Nombre original de cada categoría (respeta "SEO", "IA", etc.)
    const categoryNames = useMemo(() => {
        const names = new Map<string, string>();
        for (const { p, cat } of indexed) if (cat && !names.has(cat)) names.set(cat, p.category.trim());
        return names;
    }, [indexed]);

    // Cada faceta cuenta aplicando todos los filtros menos el suyo
    const categoryFacets = useMemo(() => {
        const counts = new Map<string, number>();
        let total = 0;
        for (const it of indexed) {
            if (!matchSearch(it.text) || !matchTier(it.p) || !matchTool(it.tool)) continue;
            total++;
            if (it.cat) counts.set(it.cat, (counts.get(it.cat) ?? 0) + 1);
        }
        const list = [...categoryNames.entries()]
            .map(([value, label]) => ({ value, label, count: counts.get(value) ?? 0 }))
            .sort((a, b) => a.label.localeCompare(b.label, 'es'));
        return { total, list };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indexed, categoryNames, searchTokens, selectedTier, selectedTool]);

    const tierCounts = useMemo(() => {
        const c = { todos: 0, gratis: 0, premium: 0 };
        for (const it of indexed) {
            if (!matchSearch(it.text) || !matchCat(it.cat) || !matchTool(it.tool)) continue;
            c.todos++;
            if (it.p.is_premium) c.premium++; else c.gratis++;
        }
        return c;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indexed, searchTokens, selectedCategory, selectedTool]);

    const filteredPrompts = useMemo(() => {
        const list = indexed.filter(it =>
            matchCat(it.cat) && matchSearch(it.text) && matchTier(it.p) && matchTool(it.tool));
        if (selectedSort === 'recientes') {
            list.sort((a, b) => (b.p.created_at || '').localeCompare(a.p.created_at || ''));
        } else if (selectedSort === 'az') {
            list.sort((a, b) => (a.p.title || '').localeCompare(b.p.title || '', 'es'));
        }
        return list.map(it => it.p);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indexed, selectedCategory, searchTokens, selectedTier, selectedTool, selectedSort]);

    // Al cambiar cualquier filtro: volver a la primera tanda y, si la persona
    // está más abajo, subir hasta el inicio de los resultados.
    const filterKey = `${selectedCategory}|${selectedTier}|${selectedTool}|${selectedSort}|${debouncedSearch}`;
    const firstFilterRun = useRef(true);
    useEffect(() => {
        setVisible(PAGE_SIZE);
        if (firstFilterRun.current) { firstFilterRun.current = false; return; }
        const el = resultsRef.current;
        if (!el) return;
        const offset = HEADER_H + BAR_H + 12;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    }, [filterKey]);

    const handleCategorySelect = (cat: string) => {
        // Conserva búsqueda, acceso, IA y orden al cambiar de categoría
        const pathname = cat === 'todas' ? '/prompts' : `/prompts/categoria/${encodeURIComponent(cat)}`;
        navigate({ pathname, search: location.search });
    };

    const clearAll = () => {
        setSearchQuery('');
        setDebouncedSearch('');
        lastWrittenQ.current = '';
        navigate('/prompts');
    };

    const shownPrompts = filteredPrompts.slice(0, visible);
    const remaining = filteredPrompts.length - shownPrompts.length;

    // El pago vive en /checkout (Paddle embebido dentro de la app)
    const handleSubscribe = () => {
        if (!user) return navigate('/login?redirect=/checkout');
        navigate('/checkout');
    };

    // ── Filtros activos (chips) ─────────────────────────────────────────────────
    const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
    if (selectedCategory !== 'todas') activeChips.push({
        key: 'cat', label: categoryNames.get(selectedCategory) ?? titleCase(selectedCategory),
        onRemove: () => handleCategorySelect('todas'),
    });
    if (selectedTier !== 'todos') activeChips.push({
        key: 'tier', label: titleCase(selectedTier), onRemove: () => setParam('acceso', null),
    });
    if (selectedTool !== 'todas') activeChips.push({
        key: 'tool', label: getAiToolMeta(selectedTool).label, onRemove: () => setParam('ia', null),
    });
    if (debouncedSearch) activeChips.push({
        key: 'q', label: `«${searchQuery.trim()}»`, onRemove: () => setSearchQuery(''),
    });
    const sheetFilterCount = activeChips.filter(c => c.key !== 'q').length;

    // ── Título y subtítulo dinámicos ────────────────────────────────────────────
    const categoryLabel = categoryNames.get(selectedCategory) ?? titleCase(selectedCategory);
    const heroSubtitle = selectedCategory === 'todas'
        ? DEFAULT_SUBTITLE
        : (CATEGORY_SUBTITLES[selectedCategory] ?? DEFAULT_SUBTITLE);

    const freeCount = useMemo(() => prompts.filter(p => !p.is_premium).length, [prompts]);

    const filtersProps: FiltersPanelProps = {
        categories: categoryFacets.list,
        total: categoryFacets.total,
        selectedCategory, onCategory: handleCategorySelect,
        selectedTier, tierCounts, onTier: t => setParam('acceso', t === 'todos' ? null : t),
        selectedTool, onTool: t => setParam('ia', t === 'todas' ? null : t),
        loading,
    };

    return (
        <div className="bp-scope" style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: SANS }}>
            <LandingStyles />
            <PageStyles />

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <header className="relative overflow-hidden" style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
                {/* Retícula de fondo que se desvanece hacia abajo */}
                <div
                    aria-hidden
                    style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        backgroundImage: `linear-gradient(${BORDER_SOFT} 1px, transparent 1px), linear-gradient(90deg, ${BORDER_SOFT} 1px, transparent 1px)`,
                        backgroundSize: '44px 44px',
                        maskImage: 'radial-gradient(ellipse 70% 90% at 50% 0%, #000 30%, transparent 75%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 70% 90% at 50% 0%, #000 30%, transparent 75%)',
                    }}
                />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-8 pt-10 pb-9 sm:pt-14 sm:pb-11">
                    {/* Migas: siempre hay un camino de vuelta al catálogo completo */}
                    <nav aria-label="Ruta" className="flex items-center gap-1.5 mb-5" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        <Link to="/prompts" style={{ color: selectedCategory === 'todas' ? MUTED : DIM, textDecoration: 'none' }}>
                            Librería
                        </Link>
                        {selectedCategory !== 'todas' && (
                            <>
                                <ChevronRight size={12} style={{ color: DIM }} />
                                <span style={{ color: MUTED }}>{categoryLabel}</span>
                            </>
                        )}
                    </nav>

                    <h1
                        key={selectedCategory}
                        className="animate-fade-up"
                        style={{
                            fontWeight: 600, fontSize: 'clamp(1.9rem, 4.2vw, 3rem)', lineHeight: 1.05,
                            letterSpacing: '-0.035em', color: TEXT, maxWidth: 940, marginBottom: 14,
                        }}
                    >
                        {selectedCategory === 'todas'
                            ? <>Encuentra un prompt. <span style={{ color: DIM }}>Cópialo. Hazlo tuyo.</span></>
                            : categoryLabel}
                    </h1>

                    <p
                        key={heroSubtitle}
                        className="animate-fade-up"
                        style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, maxWidth: 600, animationDelay: '0.08s' }}
                    >
                        {heroSubtitle}
                    </p>

                    {!loading && prompts.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-7" style={{ fontFamily: MONO, fontSize: 12, color: DIM }}>
                            <Stat value={prompts.length} label="prompts" />
                            <Stat value={categoryNames.size} label="categorías" />
                            <Stat value={freeCount} label="gratis" color={GREEN} />
                        </div>
                    )}
                </div>
            </header>

            {/* ── Barra de herramientas (fija bajo el header) ────────────────── */}
            <div
                style={{
                    position: 'sticky', top: HEADER_H, zIndex: 40, height: BAR_H,
                    backgroundColor: 'rgba(0,0,0,0.82)',
                    backdropFilter: 'blur(14px) saturate(140%)', WebkitBackdropFilter: 'blur(14px) saturate(140%)',
                    borderBottom: `1px solid ${BORDER}`,
                }}
            >
                <div className="mx-auto max-w-7xl h-full px-4 sm:px-8 flex items-center gap-2.5">
                    {/* Búsqueda */}
                    <div className="relative flex-1 min-w-0" style={{ maxWidth: 560 }}>
                        <Search
                            size={15}
                            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: DIM, pointerEvents: 'none' }}
                        />
                        <input
                            ref={searchRef}
                            type="search"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Escape') { setSearchQuery(''); e.currentTarget.blur(); } }}
                            placeholder="Buscar por tema, tarea o herramienta…"
                            aria-label="Buscar prompts"
                            className="pp-input"
                            style={{
                                width: '100%', height: 40, backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
                                padding: '0 40px 0 38px', fontSize: 14, color: TEXT, outline: 'none',
                                transition: 'border-color .15s, background-color .15s', WebkitAppearance: 'none',
                            }}
                        />
                        <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
                                    aria-label="Borrar búsqueda"
                                    className="pp-btn flex items-center justify-center"
                                    style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: PANEL, color: MUTED, cursor: 'pointer' }}
                                >
                                    <X size={13} />
                                </button>
                            ) : (
                                <kbd
                                    className="hidden sm:flex items-center justify-center"
                                    style={{ minWidth: 22, height: 22, borderRadius: 5, border: `1px solid ${BORDER}`, fontSize: 11, color: DIM, background: PANEL }}
                                >
                                    /
                                </kbd>
                            )}
                        </div>
                    </div>

                    {/* Escritorio: acceso + orden a la vista */}
                    <div className="hidden lg:flex items-center gap-2.5 ml-auto">
                        <Segmented
                            options={TIERS.map(t => ({ ...t, count: loading ? undefined : tierCounts[t.value] }))}
                            value={selectedTier}
                            onChange={t => setParam('acceso', t === 'todos' ? null : t)}
                        />
                        <SortSelect value={selectedSort} onChange={s => setParam('orden', s === 'destacados' ? null : s)} />
                    </div>

                    {/* Móvil/tablet: todo lo demás en el panel de filtros */}
                    <button
                        type="button"
                        onClick={() => setSheetOpen(true)}
                        aria-label="Abrir filtros"
                        className="pp-btn pp-ghost lg:hidden flex items-center gap-2 flex-shrink-0"
                        style={{
                            height: 40, padding: '0 14px', borderRadius: 10, border: `1px solid ${BORDER}`,
                            backgroundColor: CARD, color: MUTED, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        <SlidersHorizontal size={14} />
                        <span className="hidden sm:inline">Filtros</span>
                        {sheetFilterCount > 0 && (
                            <span style={{
                                fontFamily: MONO, fontSize: 10.5, fontWeight: 700, color: '#000', backgroundColor: TEXT,
                                borderRadius: 100, minWidth: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                            }}>
                                {sheetFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-7 pb-20 lg:grid lg:gap-10" style={{ gridTemplateColumns: '232px minmax(0,1fr)' }}>

                {/* ── Sidebar (escritorio) ──────────────────────────────────── */}
                <aside className="hidden lg:block">
                    <div
                        className="subtle-scrollbar"
                        style={{
                            position: 'sticky', top: HEADER_H + BAR_H + 24,
                            maxHeight: `calc(100vh - ${HEADER_H + BAR_H + 48}px)`, overflowY: 'auto', paddingRight: 6,
                        }}
                    >
                        <FiltersPanel {...filtersProps} showTier={false} />
                    </div>
                </aside>

                {/* ── Resultados ─────────────────────────────────────────────── */}
                <main ref={resultsRef} style={{ scrollMarginTop: HEADER_H + BAR_H + 12 }}>
                    {/* Resumen + filtros activos */}
                    <div className="flex flex-wrap items-center gap-2 mb-5" style={{ minHeight: 30 }}>
                        <span style={{ fontFamily: MONO, fontSize: 12, color: DIM, marginRight: 4 }}>
                            {loading
                                ? 'Cargando…'
                                : <><span style={{ color: TEXT }}>{filteredPrompts.length}</span> {filteredPrompts.length === 1 ? 'resultado' : 'resultados'}</>}
                        </span>
                        {activeChips.map(chip => (
                            <button
                                key={chip.key}
                                type="button"
                                onClick={chip.onRemove}
                                className="pp-btn pp-ghost inline-flex items-center gap-1.5"
                                aria-label={`Quitar filtro ${chip.label}`}
                                style={{
                                    height: 28, padding: '0 8px 0 11px', borderRadius: 100, border: `1px solid ${BORDER}`,
                                    backgroundColor: PANEL, color: MUTED, fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                                    maxWidth: 240,
                                }}
                            >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chip.label}</span>
                                <X size={12} style={{ flexShrink: 0 }} />
                            </button>
                        ))}
                        {activeChips.length > 1 && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="pp-btn"
                                style={{ background: 'none', border: 'none', color: DIM, fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
                            >
                                Limpiar todo
                            </button>
                        )}
                        <div className="lg:hidden ml-auto">
                            <SortSelect value={selectedSort} onChange={s => setParam('orden', s === 'destacados' ? null : s)} compact />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {loading && Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}

                        {!loading && shownPrompts.map((prompt, i) => (
                            <PromptCard
                                key={prompt.id}
                                prompt={prompt}
                                tokens={searchTokens}
                                // Solo la tanda nueva entra animada (y con un retardo corto)
                                delay={i >= visible - PAGE_SIZE ? Math.min(i % PAGE_SIZE, 8) * 0.03 : 0}
                            />
                        ))}
                    </div>

                    {/* Ver más */}
                    {!loading && remaining > 0 && (
                        <div className="flex flex-col items-center gap-3 mt-10">
                            <div style={{ width: 180, height: 2, borderRadius: 2, backgroundColor: BORDER, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', backgroundColor: MUTED,
                                    width: `${(shownPrompts.length / filteredPrompts.length) * 100}%`, transition: 'width .3s',
                                }} />
                            </div>
                            <span style={{ fontFamily: MONO, fontSize: 11.5, color: DIM }}>
                                {shownPrompts.length} de {filteredPrompts.length}
                            </span>
                            <button
                                type="button"
                                onClick={() => setVisible(v => v + PAGE_SIZE)}
                                className="pp-btn pp-ghost"
                                style={{
                                    marginTop: 4, height: 42, padding: '0 22px', borderRadius: 10, border: `1px solid ${BORDER}`,
                                    backgroundColor: CARD, color: TEXT, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                Ver {Math.min(remaining, PAGE_SIZE)} más
                            </button>
                        </div>
                    )}

                    {/* Estado vacío. Una búsqueda sin resultados es el mejor momento
                        para ofrecer el generador: la intención ya está ahí y lo que
                        falta es exactamente lo que hace. */}
                    {!loading && filteredPrompts.length === 0 && (
                        <div style={{ padding: '24px 0 8px' }}>
                            <div className="mx-auto" style={{ maxWidth: 520 }}>
                                <GeneratorCallout variant="search" query={searchQuery.trim() || undefined} from="busqueda-vacia" />
                                <div className="text-center" style={{ marginTop: 22 }}>
                                    <button
                                        onClick={clearAll}
                                        className="pp-btn"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, color: MUTED, textDecoration: 'underline', textUnderlineOffset: 3 }}
                                    >
                                        o ver todos los prompts
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── CTA Premium ──────────────────────────────────────── */}
                    {!isSubscribed && !loading && <PremiumCta onSubscribe={handleSubscribe} />}
                </main>
            </div>

            {/* ── Panel de filtros (móvil) ───────────────────────────────────── */}
            {sheetOpen && (
                <FilterSheet
                    onClose={() => setSheetOpen(false)}
                    resultCount={filteredPrompts.length}
                    onClear={sheetFilterCount > 0 ? () => navigate({ pathname: '/prompts', search: searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : '' }) : undefined}
                >
                    <FiltersPanel {...filtersProps} showTier />
                </FilterSheet>
            )}
        </div>
    );
};

// ── Piezas pequeñas ─────────────────────────────────────────────────────────

const Stat: React.FC<{ value: number; label: string; color?: string }> = ({ value, label, color }) => (
    <span className="inline-flex items-center gap-1.5">
        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: color ?? DIM }} />
        <span style={{ color: TEXT }}>{value.toLocaleString('es')}</span> {label}
    </span>
);

const Count: React.FC<{ n?: number; active?: boolean }> = ({ n, active }) =>
    n === undefined ? null : (
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: active ? MUTED : DIM, fontWeight: 500 }}>{n}</span>
    );

const Segmented = <T extends string>({ options, value, onChange, full }: {
    options: { value: T; label: string; count?: number }[];
    value: T;
    onChange: (v: T) => void;
    full?: boolean;
}) => (
    <div
        role="radiogroup"
        className="flex items-center"
        style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 3, height: 40, width: full ? '100%' : undefined }}
    >
        {options.map(opt => {
            const active = value === opt.value;
            return (
                <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange(opt.value)}
                    className="pp-btn flex items-center justify-center gap-1.5"
                    style={{
                        flex: full ? 1 : undefined, height: '100%',
                        border: 'none', cursor: 'pointer', borderRadius: 7, padding: '0 12px',
                        backgroundColor: active ? '#1f1f1f' : 'transparent',
                        color: active ? TEXT : MUTED,
                        boxShadow: active ? 'inset 0 0 0 1px #2e2e2e' : 'none',
                        fontSize: 13, fontWeight: 600, transition: 'background .15s, color .15s',
                    }}
                >
                    {opt.value === 'premium' && <Lock size={11} style={{ color: active ? AMBER : DIM }} />}
                    {opt.label}
                    <Count n={opt.count} active={active} />
                </button>
            );
        })}
    </div>
);

const SortSelect: React.FC<{ value: Sort; onChange: (s: Sort) => void; compact?: boolean }> = ({ value, onChange, compact }) => (
    <label className="relative flex items-center" style={{ height: compact ? 30 : 40 }}>
        <span className="sr-only">Ordenar por</span>
        <select
            value={value}
            onChange={e => onChange(e.target.value as Sort)}
            className="pp-input"
            style={{
                height: '100%', appearance: 'none', WebkitAppearance: 'none',
                backgroundColor: compact ? 'transparent' : CARD, border: `1px solid ${compact ? 'transparent' : BORDER}`,
                borderRadius: 10, padding: compact ? '0 22px 0 6px' : '0 32px 0 13px',
                fontSize: compact ? 12.5 : 13, fontWeight: 600, color: compact ? MUTED : TEXT, cursor: 'pointer', outline: 'none',
            }}
        >
            {SORTS.map(s => <option key={s.value} value={s.value} style={{ backgroundColor: PANEL }}>{s.label}</option>)}
        </select>
        <ChevronDown size={13} strokeWidth={2.5} style={{ position: 'absolute', right: compact ? 4 : 11, color: DIM, pointerEvents: 'none' }} />
    </label>
);

// ── Panel de filtros (sidebar en escritorio, hoja inferior en móvil) ─────────
type FiltersPanelProps = {
    categories: { value: string; label: string; count: number }[];
    total: number;
    selectedCategory: string;
    onCategory: (c: string) => void;
    selectedTier: Tier;
    tierCounts: Record<Tier, number>;
    onTier: (t: Tier) => void;
    selectedTool: string;
    onTool: (t: string) => void;
    loading: boolean;
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: DIM, margin: '0 0 10px 10px' }}>
        {children}
    </p>
);

const FiltersPanel: React.FC<FiltersPanelProps & { showTier: boolean }> = ({
    categories, total, selectedCategory, onCategory, selectedTier, tierCounts, onTier,
    selectedTool, onTool, loading, showTier,
}) => {
    const rows = [{ value: 'todas', label: 'Todas', count: total }, ...categories];
    return (
        <div className="flex flex-col gap-7">
            {showTier && (
                <div>
                    <SectionTitle>Acceso</SectionTitle>
                    <Segmented
                        full
                        options={TIERS.map(t => ({ ...t, count: loading ? undefined : tierCounts[t.value] }))}
                        value={selectedTier}
                        onChange={onTier}
                    />
                </div>
            )}

            <div>
                <SectionTitle>Compatible con</SectionTitle>
                <div className="flex flex-wrap gap-1.5" style={{ paddingLeft: 4 }}>
                    {[{ value: 'todas', label: 'Todas' }, ...AI_TOOLS.filter(t => t.value !== 'cualquier-modelo')].map(t => {
                        const active = selectedTool === t.value;
                        const c = AI_BADGE_DARK[t.value];
                        return (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => onTool(t.value)}
                                aria-pressed={active}
                                className="pp-btn pp-ghost inline-flex items-center gap-1.5"
                                style={{
                                    height: 30, padding: '0 11px', borderRadius: 100, cursor: 'pointer',
                                    border: `1px solid ${active ? (c?.bd ?? '#3a3a3a') : BORDER}`,
                                    backgroundColor: active ? (c?.bg ?? '#1f1f1f') : 'transparent',
                                    color: active ? (c?.fg ?? TEXT) : MUTED, fontSize: 12.5, fontWeight: 600,
                                }}
                            >
                                {c && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: c.fg }} />}
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <SectionTitle>Categorías</SectionTitle>
                <ul className="flex flex-col gap-px">
                    {loading && Array.from({ length: 8 }).map((_, i) => (
                        <li key={i} className="animate-pulse" style={{ height: 32, borderRadius: 8, backgroundColor: CARD, marginBottom: 2 }} />
                    ))}
                    {!loading && rows.map(row => {
                        const active = row.value === selectedCategory;
                        const empty = row.count === 0 && !active;
                        const dot = row.value === 'todas' ? MUTED : getCategoryStyle(row.label).fg;
                        return (
                            <li key={row.value}>
                                <button
                                    type="button"
                                    onClick={() => onCategory(row.value)}
                                    aria-current={active ? 'page' : undefined}
                                    className={`pp-btn ${active ? '' : 'pp-row'} w-full flex items-center gap-2.5 text-left`}
                                    style={{
                                        height: 34, padding: '0 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                        backgroundColor: active ? '#1a1a1a' : 'transparent',
                                        boxShadow: active ? 'inset 0 0 0 1px #2a2a2a' : 'none',
                                        color: active ? TEXT : empty ? '#4a4a4a' : MUTED,
                                        fontSize: 13.5, fontWeight: active ? 600 : 500,
                                    }}
                                >
                                    <span style={{ width: 6, height: 6, borderRadius: 2, flexShrink: 0, backgroundColor: dot, opacity: empty ? 0.35 : active ? 1 : 0.7 }} />
                                    <span className="flex-1 truncate">{row.label}</span>
                                    <Count n={row.count} active={active} />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

const FilterSheet: React.FC<{
    onClose: () => void;
    onClear?: () => void;
    resultCount: number;
    children: React.ReactNode;
}> = ({ onClose, onClear, resultCount, children }) => {
    // Bloquea el scroll del fondo y cierra con Escape
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
    }, [onClose]);

    return (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 100 }} role="dialog" aria-modal="true" aria-label="Filtros">
            <div
                onClick={onClose}
                style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', animation: 'ppFade .2s ease-out' }}
            />
            <div
                className="flex flex-col"
                style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '86vh',
                    backgroundColor: CARD, borderTop: `1px solid ${BORDER}`, borderRadius: '18px 18px 0 0',
                    animation: 'ppSheet .28s cubic-bezier(.2,.8,.2,1)',
                }}
            >
                <div className="flex items-center justify-between" style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${BORDER_SOFT}` }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>Filtros</span>
                    <div className="flex items-center gap-1">
                        {onClear && (
                            <button type="button" onClick={onClear} className="pp-btn" style={{ background: 'none', border: 'none', color: MUTED, fontSize: 13, cursor: 'pointer', padding: '6px 8px' }}>
                                Limpiar
                            </button>
                        )}
                        <button
                            type="button" onClick={onClose} aria-label="Cerrar"
                            className="pp-btn flex items-center justify-center"
                            style={{ width: 34, height: 34, borderRadius: 8, border: 'none', backgroundColor: PANEL, color: MUTED, cursor: 'pointer' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="subtle-scrollbar flex-1 overflow-y-auto" style={{ padding: '18px 16px' }}>
                    {children}
                </div>

                <div style={{ padding: '12px 16px calc(12px + env(safe-area-inset-bottom))', borderTop: `1px solid ${BORDER_SOFT}` }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="pp-btn"
                        style={{
                            width: '100%', height: 46, borderRadius: 11, border: 'none', cursor: 'pointer',
                            backgroundColor: TEXT, color: '#000', fontSize: 15, fontWeight: 600,
                        }}
                    >
                        Ver {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Resaltado de coincidencias (insensible a tildes) ────────────────────────
const Highlight: React.FC<{ text: string; tokens: string[] }> = ({ text, tokens }) => {
    if (!tokens.length || !text) return <>{text}</>;
    const folded = fold(text);
    // Si plegar cambia la longitud (caracteres raros) no se puede alinear: sin resaltado
    if (folded.length !== text.length) return <>{text}</>;

    const ranges: [number, number][] = [];
    for (const t of tokens) {
        let i = folded.indexOf(t);
        while (i !== -1) { ranges.push([i, i + t.length]); i = folded.indexOf(t, i + t.length); }
    }
    if (!ranges.length) return <>{text}</>;
    ranges.sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];
    for (const r of ranges) {
        const last = merged[merged.length - 1];
        if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]); else merged.push([...r]);
    }

    const out: React.ReactNode[] = [];
    let pos = 0;
    merged.forEach(([s, e], k) => {
        if (s > pos) out.push(text.slice(pos, s));
        out.push(
            <mark key={k} style={{ backgroundColor: 'rgba(255,178,36,0.2)', color: TEXT, borderRadius: 3, padding: '0 1px' }}>
                {text.slice(s, e)}
            </mark>,
        );
        pos = e;
    });
    if (pos < text.length) out.push(text.slice(pos));
    return <>{out}</>;
};

// ── Card de prompt ──────────────────────────────────────────────────────────
const PromptCard: React.FC<{ prompt: Prompt; tokens: string[]; delay: number }> = ({ prompt, tokens, delay }) => {
    const tool = getAiToolMeta(prompt.ai_tool);
    const badge = AI_BADGE_DARK[tool.value] ?? AI_BADGE_DARK['cualquier-modelo'];
    const isNew = isNewPrompt(prompt.created_at);

    return (
        <Link
            to={`/prompts/${prompt.id}`}
            className="pp-card animate-fade-up relative flex flex-col"
            style={{
                backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
                padding: '18px 18px 0', textDecoration: 'none', minHeight: 196,
                animationDelay: `${delay}s`,
            }}
        >
            <div className="flex items-center justify-between gap-2 mb-3.5">
                <div className="flex items-center gap-1.5 min-w-0">
                    <CategoryBadge category={prompt.category} />
                    {isNew && (
                        <span style={{
                            fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: AMBER, backgroundColor: 'rgba(255,178,36,0.1)', border: '1px solid rgba(255,178,36,0.3)',
                            borderRadius: 100, padding: '1px 6px', lineHeight: 1.5, flexShrink: 0,
                        }}>
                            Nuevo
                        </span>
                    )}
                </div>
                {prompt.is_premium ? (
                    <span className="inline-flex items-center gap-1 flex-shrink-0" style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: AMBER }}>
                        <Lock size={10} /> Premium
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 flex-shrink-0" style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREEN }}>
                        Gratis
                    </span>
                )}
            </div>

            <h3 className="line-clamp-2" style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.35, color: TEXT, marginBottom: 7, letterSpacing: '-0.012em' }}>
                <Highlight text={prompt.title || ''} tokens={tokens} />
            </h3>
            <p className="line-clamp-3" style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.6, marginBottom: 16 }}>
                <Highlight text={prompt.description || ''} tokens={tokens} />
            </p>

            <div className="flex items-center justify-between" style={{ borderTop: `1px solid ${BORDER_SOFT}`, margin: 'auto -18px 0', padding: '11px 18px' }}>
                <span className="inline-flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: badge.fg }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: badge.fg, opacity: 0.85 }} />
                    {tool.label}
                </span>
                <span className="pp-arrow inline-flex items-center gap-1" style={{ fontSize: 12.5, fontWeight: 600, color: DIM }}>
                    Ver prompt <ArrowRight size={13} />
                </span>
            </div>
        </Link>
    );
};

const CardSkeleton: React.FC = () => (
    <div className="animate-pulse" style={{ height: 196, borderRadius: 14, border: `1px solid ${BORDER_SOFT}`, backgroundColor: CARD, padding: 18 }}>
        <div style={{ width: 90, height: 16, borderRadius: 5, backgroundColor: PANEL, marginBottom: 18 }} />
        <div style={{ width: '80%', height: 14, borderRadius: 4, backgroundColor: PANEL, marginBottom: 10 }} />
        <div style={{ width: '95%', height: 10, borderRadius: 4, backgroundColor: PANEL, marginBottom: 7 }} />
        <div style={{ width: '70%', height: 10, borderRadius: 4, backgroundColor: PANEL }} />
    </div>
);

// ── CTA Premium ─────────────────────────────────────────────────────────────
const PremiumCta: React.FC<{ onSubscribe: () => void }> = ({ onSubscribe }) => (
    <section
        className="relative overflow-hidden mt-16"
        style={{ border: `1px solid ${BORDER}`, borderRadius: 18, backgroundColor: CARD }}
    >
        <div
            aria-hidden
            style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 60% 120% at 100% 0%, rgba(255,178,36,0.09), transparent 60%)',
            }}
        />
        <div className="relative grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center" style={{ padding: 'clamp(22px, 4vw, 36px)' }}>
            <div>
                <div
                    className="inline-flex items-center gap-2 rounded-full"
                    style={{ backgroundColor: 'rgba(255,178,36,0.08)', border: '1px solid rgba(255,178,36,0.3)', padding: '4px 12px', marginBottom: 16 }}
                >
                    <Sparkles size={11} style={{ color: AMBER }} />
                    <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: AMBER }}>
                        Acceso total
                    </span>
                </div>
                <h2 style={{ fontWeight: 600, fontSize: 'clamp(1.4rem, 2.6vw, 1.85rem)', lineHeight: 1.15, letterSpacing: '-0.03em', color: TEXT, marginBottom: 12 }}>
                    Desbloquea el banco completo.
                </h2>
                <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, maxWidth: 460 }}>
                    +1.000 prompts probados, el generador con IA y todos los prompts nuevos que se añaden cada semana.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-5 mt-5">
                    {[
                        '+1.000 prompts, +20 categorías',
                        'Generador con IA (10 al día)',
                        'ChatGPT, Claude y Gemini',
                        'Prompts nuevos cada semana',
                    ].map(t => (
                        <div key={t} className="flex items-start gap-2.5">
                            <Check size={13} strokeWidth={3} style={{ color: GREEN, flexShrink: 0, marginTop: 3 }} />
                            <span style={{ fontSize: 14, color: MUTED, lineHeight: 1.5 }}>{t}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14, backgroundColor: BG, padding: 22 }}>
                <div className="flex items-end gap-2 mb-5">
                    <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 40, lineHeight: 1, letterSpacing: '-0.04em', color: TEXT }}>7 USD</span>
                    <span style={{ fontSize: 14, color: MUTED, paddingBottom: 4 }}>/ mes</span>
                </div>
                <button
                    type="button"
                    onClick={onSubscribe}
                    className="pp-btn"
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        backgroundColor: TEXT, color: '#000', border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: 15, height: 48, borderRadius: 11,
                    }}
                >
                    Suscribirme ahora <ArrowRight size={15} />
                </button>
                <div className="flex items-center justify-center gap-2 mt-3.5">
                    <Shield size={12} style={{ color: DIM }} />
                    <span style={{ fontSize: 12.5, color: DIM }}>Pago seguro · Cancela cuando quieras</span>
                </div>
            </div>
        </div>
    </section>
);

export default Prompts;
