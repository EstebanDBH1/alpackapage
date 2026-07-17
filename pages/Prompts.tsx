import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { isNewPrompt } from '../lib/utils';
import { Prompt } from '../types';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Shield, Search, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 12;

// Subtítulos por categoría
const CATEGORY_SUBTITLES: Record<string, string> = {
    marketing: 'Optimiza tus campañas, automatiza tu copywriting y eleva tu estrategia SEO con prompts validados por expertos en marketing digital.',
    desarrollo: 'Acelera tu flujo de trabajo, refactoriza código complejo y diseña sistemas robustos con IA siguiendo buenas prácticas.',
    escritura: 'Mejora tu redacción, corrige textos técnicos y crea ganchos irresistibles con ingeniería de prompts avanzada.',
};

const DEFAULT_SUBTITLE = 'Prompts gratuitos y seleccionados para IA compatibles con ChatGPT, Claude, Gemini, Midjourney y los principales modelos del mercado.';

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ── Entrada sutil del texto del hero (CSS, respeta prefers-reduced-motion) ───
const AnimatedText: React.FC<{ text: string; className?: string; delay?: number; stagger?: number }> = ({
    text, className = '', delay = 0,
}) => (
    <span key={text} className={`animate-fade-up inline-block ${className}`} style={{ animationDelay: `${delay}s` }}>
        {text}
    </span>
);

// ── Aparición suave (la key re-dispara la animación al cambiar de categoría) ──
const FadeIn: React.FC<{ children: React.ReactNode; className?: string; delay?: number; replayKey?: unknown }> = ({
    children, className = '', delay = 0, replayKey,
}) => (
    <p key={String(replayKey ?? '')} className={`animate-fade-up ${className}`} style={{ animationDelay: `${delay}s` }}>
        {children}
    </p>
);

const Prompts: React.FC = () => {
    const navigate = useNavigate();
    const { category: categoryParam } = useParams<{ category?: string }>();
    const selectedCategory = categoryParam ?? 'todas';
    const [selectedTier, setSelectedTier] = useState<'todos' | 'gratis' | 'premium'>('todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const gridRef = useRef<HTMLDivElement>(null);

    // ── Sesión + suscripción ───────────────────────────────────────────────────
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
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
    useEffect(() => {
        supabase.rpc('get_public_prompts').then(({ data, error }) => {
            if (!error && data) setPrompts(data as Prompt[]);
            setLoading(false);
        });
    }, []);

    const categories = useMemo(() => {
        const uniqueCats = Array.from(new Set(prompts.map(p => p.category).filter(Boolean)));
        return ['todas', ...uniqueCats.map(c => String(c).toLowerCase()).sort()];
    }, [prompts]);

    const filteredPrompts = useMemo(() => prompts.filter(prompt => {
        const matchesCategory = selectedCategory === 'todas' || prompt.category?.toLowerCase() === selectedCategory;
        const matchesSearch = (prompt.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (prompt.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        let matchesTier = true;
        if (selectedTier === 'gratis') matchesTier = !prompt.is_premium;
        if (selectedTier === 'premium') matchesTier = !!prompt.is_premium;
        return matchesCategory && matchesSearch && matchesTier;
    }), [prompts, selectedCategory, selectedTier, searchQuery]);

    const handleCategorySelect = (cat: string) => {
        setCurrentPage(1);
        if (cat === 'todas') navigate('/prompts');
        else navigate(`/prompts/categoria/${encodeURIComponent(cat)}`);
    };

    useEffect(() => { setCurrentPage(1); }, [selectedCategory, selectedTier, searchQuery]);

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
        if (selectedCategory === 'todas') return 'La biblioteca de prompts #1 de todo internet.';
        const count = filteredPrompts.length;
        const noun = count === 1 ? 'prompt seleccionado' : 'prompts seleccionados';
        return `${count} ${noun} para ${titleCase(selectedCategory)}.`;
    }, [selectedCategory, filteredPrompts.length]);

    const heroSubtitle = selectedCategory === 'todas'
        ? DEFAULT_SUBTITLE
        : (CATEGORY_SUBTITLES[selectedCategory] ?? DEFAULT_SUBTITLE);

    return (
        <div className="relative min-h-screen overflow-x-clip bg-background bg-radial-glow font-space text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

            <div className="relative">
                {/* ── Hero ──────────────────────────────────────────────────────── */}
                <div className="px-4 pt-14 pb-10 text-center sm:px-8">
                    <div className="mx-auto max-w-3xl">

                        {/* Badge */}
                        <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]"></span>
                            <span>Librería de Prompts</span>
                        </div>

                        <h1 className="mt-6 mb-5 text-balance text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.6rem]">
                            <AnimatedText text={heroTitle} />
                        </h1>
                        <FadeIn
                            replayKey={heroSubtitle}
                            delay={0.25}
                            className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground"
                        >
                            {heroSubtitle}
                        </FadeIn>
                    </div>
                </div>

                {/* ── Barra de filtros (sticky) ──────────────────────────────────── */}
                <div className="sticky top-[70px] z-40 border-b border-border/60 bg-background/80 backdrop-blur">
                    <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-4 sm:px-6">

                        {/* Búsqueda */}
                        <div className="relative w-full max-w-xl">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar un prompt..."
                                className="w-full rounded-full border border-border/60 bg-card/60 py-2.5 pl-11 pr-5 text-sm text-foreground placeholder-muted-foreground/60 backdrop-blur transition focus:border-primary/40 focus:outline-none"
                            />
                        </div>

                        {/* Categoría + acceso */}
                        <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">

                            {/* Selector de categoría */}
                            <CategorySelect
                                categories={categories}
                                selected={selectedCategory}
                                onSelect={handleCategorySelect}
                            />

                            {/* Filtro de acceso */}
                            <div className="flex items-center justify-center gap-5">
                                {(['todos', 'gratis', 'premium'] as const).map(tier => {
                                    const active = selectedTier === tier;
                                    return (
                                        <button
                                            key={tier}
                                            onClick={() => setSelectedTier(tier)}
                                            className={`border-b pb-1 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                                                active
                                                    ? 'border-accent text-accent'
                                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {tier}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <main className="flex flex-col items-center px-4 pt-12 pb-16 sm:px-8">
                    <div className="flex w-full flex-col items-center">

                        {/* ── Grid de prompts ──────────────────────────────────── */}
                        <div
                            ref={gridRef}
                            key={cardsKey}
                            className="animate-fade-in mb-24 grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                        >
                            {loading && Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-44 animate-pulse rounded-2xl border border-border/70 bg-card p-6" />
                            ))}

                            {!loading && paginatedPrompts.map(prompt => (
                                <PromptCard key={prompt.id} prompt={prompt} />
                            ))}
                        </div>

                        {/* Estado vacío */}
                        {!loading && filteredPrompts.length === 0 && (
                            <div className="-mt-16 mb-24 w-full max-w-3xl text-center">
                                <p className="mb-6 text-sm text-muted-foreground">
                                    Ningún prompt coincide con tu búsqueda.
                                </p>
                                <button
                                    onClick={() => { handleCategorySelect('todas'); setSelectedTier('todos'); setSearchQuery(''); }}
                                    className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 hover:bg-secondary"
                                >
                                    Ver todos los prompts
                                </button>
                            </div>
                        )}

                        {/* Paginación */}
                        {!loading && totalPages > 1 && (
                            <div className="-mt-16 mb-24 flex items-center justify-center gap-6">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    ← Anterior
                                </button>
                                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}

                        {/* Divisor */}
                        <div className="mb-16 h-px w-full max-w-3xl bg-border/60" />

                        {/* ── CTA Premium ──────────────────────────────────────── */}
                        {!isSubscribed && (
                            <div className="relative w-full max-w-xl">
                                <div className="absolute -inset-10 -z-10 rounded-full bg-accent/5 blur-3xl"></div>

                                <div className="rounded-3xl border border-primary/30 bg-card px-8 py-10 text-center shadow-[0_0_80px_oklch(0.86_0.09_90_/_0.08)]">
                                    <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-accent/40 bg-secondary px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-accent">
                                        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]"></span>
                                        <span>Membresía Premium</span>
                                    </div>

                                    <h2 className="mt-6 mb-4 text-balance text-2xl font-medium leading-tight tracking-tight text-foreground sm:text-3xl">
                                        Acceso total por <em className="not-italic text-primary/90">4 USD/mes</em>
                                    </h2>

                                    <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
                                        Desbloquea más de 500 prompts avanzados de nivel senior y
                                        actualizaciones constantes con los últimos modelos.
                                    </p>

                                    <button
                                        onClick={handleSubscribe}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90 sm:w-auto"
                                    >
                                        Suscribirse ahora
                                    </button>

                                    <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <Shield size={13} />
                                        Pago seguro · Cancela cuando quieras
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

// ── Dropdown de categoría personalizado ──────────────────────────────────────
const CategorySelect: React.FC<{
    categories: string[];
    selected: string;
    onSelect: (cat: string) => void;
}> = ({ categories, selected, onSelect }) => {
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

    const label = selected === 'todas' ? 'Todas' : titleCase(selected);

    return (
        <div ref={ref} className="relative w-full sm:w-60">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={`flex w-full items-center justify-between rounded-full border bg-card/60 px-5 py-2.5 text-xs backdrop-blur transition-colors focus:outline-none ${
                    open ? 'border-primary/40' : 'border-border/60 hover:border-border'
                }`}
            >
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Categoría</span>
                <span className="flex items-center gap-2 font-medium text-foreground">
                    {label}
                    <ChevronDown
                        size={14}
                        className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        strokeWidth={2.5}
                    />
                </span>
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 overflow-auto rounded-2xl border border-border/70 bg-card py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                >
                    {categories.map(cat => {
                        const active = cat === selected;
                        return (
                            <li key={cat} role="option" aria-selected={active}>
                                <button
                                    type="button"
                                    onClick={() => { onSelect(cat); setOpen(false); }}
                                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-medium transition-colors ${
                                        active
                                            ? 'bg-secondary text-accent'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                                >
                                    {cat === 'todas' ? 'Todas' : titleCase(cat)}
                                    {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
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
const PromptCard: React.FC<{ prompt: Prompt }> = ({ prompt }) => (
    <Link
        to={`/prompts/${prompt.id}`}
        className="prompt-card group relative flex cursor-pointer flex-col rounded-2xl border border-border/70 bg-card p-6 transition hover:border-primary/40"
    >
        {isNewPrompt(prompt.created_at) && (
            <span className="absolute -top-2 -right-2 rounded-full bg-accent px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-background shadow-[0_0_14px_oklch(0.72_0.16_40_/_0.45)]">
                New
            </span>
        )}
        <div className="mb-4 flex items-center justify-between">
            <span className="inline-block rounded-md border border-border/50 bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {prompt.category || 'General'}
            </span>
            {prompt.is_premium && (
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent">
                    Premium
                </span>
            )}
        </div>
        <h3 className="mb-2 text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary">{prompt.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{prompt.description}</p>
    </Link>
);

export default Prompts;
