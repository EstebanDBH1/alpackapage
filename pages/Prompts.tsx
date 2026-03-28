import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Prompt } from '../types';
import { Lock, Search, Sparkles, ArrowRight, Zap, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PAGE_SIZE = 12;

const CATEGORY_EMOJIS: Record<string, string> = {
    todas: '✦',
    marketing: '📣',
    copywriting: '✍️',
    ventas: '💰',
    productividad: '⚡',
    estrategia: '♟️',
    redes: '📱',
    email: '📧',
    negocio: '💼',
    contenido: '🎨',
    datos: '📊',
    'ideas de negocio': '💡',
    finanzas: '📈',
};

function getCategoryEmoji(cat: string): string {
    return CATEGORY_EMOJIS[cat.toLowerCase()] ?? '•';
}

const Prompts: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('todas');
    const [selectedTier, setSelectedTier] = useState('todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const gridRef = useRef<HTMLDivElement>(null);
    const pillsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim();
        const initPaddle = () => {
            if (!window.Paddle || !clientToken) return;
            const isSandbox = clientToken.startsWith('test_');
            if (isSandbox) window.Paddle.Environment.set('sandbox');
            window.Paddle.Initialize({ token: clientToken });
            setScriptLoaded(true);
        };
        if (window.Paddle) { initPaddle(); return; }
        const script = document.createElement('script');
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.async = true;
        script.onload = initPaddle;
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
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

    useEffect(() => {
        const fetchPrompts = async () => {
            const { data, error } = await supabase.rpc('get_public_prompts');
            if (!error && data) setPrompts(data as Prompt[]);
            setLoading(false);
        };
        fetchPrompts();
    }, []);

    const categories = useMemo(() => {
        const uniqueCats = Array.from(new Set(prompts.map(p => p.category).filter(Boolean)));
        return ['todas', ...uniqueCats.map(c => String(c).toLowerCase()).sort()];
    }, [prompts]);

    const filteredPrompts = useMemo(() => {
        return prompts.filter(prompt => {
            const matchesCategory = selectedCategory === 'todas' || prompt.category?.toLowerCase() === selectedCategory;
            const matchesSearch = (prompt.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (prompt.description || '').toLowerCase().includes(searchQuery.toLowerCase());
            let matchesTier = true;
            if (selectedTier === 'gratis') matchesTier = prompt.is_premium === false;
            if (selectedTier === 'premium') matchesTier = prompt.is_premium === true;
            return matchesCategory && matchesSearch && matchesTier;
        });
    }, [prompts, selectedCategory, selectedTier, searchQuery]);

    useEffect(() => { setCurrentPage(1); }, [selectedCategory, selectedTier, searchQuery]);

    const totalPages = Math.ceil(filteredPrompts.length / PAGE_SIZE);
    const paginatedPrompts = filteredPrompts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleSubscribe = () => {
        if (!user) return navigate('/login?redirect=/prompts');
        if (!scriptLoaded || !window.Paddle) return;
        setCheckoutLoading(true);
        const priceId = import.meta.env.VITE_PADDLE_PRICE_ID?.trim();
        window.Paddle.Checkout.open({
            settings: { displayMode: 'overlay', theme: 'light', locale: 'es', successUrl: `${window.location.origin}/payment-success` },
            items: [{ priceId: priceId, quantity: 1 }],
            customer: { email: user.email },
            customData: { supabase_user_id: String(user.id) },
            eventCallback: () => setCheckoutLoading(false),
        });
    };

    const firstBatch = paginatedPrompts.slice(0, 6);
    const secondBatch = paginatedPrompts.slice(6);
    const showUpsell = !isSubscribed && !loading && filteredPrompts.length > 0 && currentPage === 1;

    const scrollPills = (dir: 'left' | 'right') => {
        if (!pillsRef.current) return;
        pillsRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen pb-32" style={{ backgroundColor: '#FAF9F5', color: '#1D1B18' }}>
            <Helmet>
                <title>Biblioteca de Prompts | alpacka.ai</title>
                <meta name="description" content="150+ prompts probados para marketing, ventas y productividad. Resultados profesionales desde el primer intento. $4/mes." />
            </Helmet>

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <section className="pt-20 pb-16 border-b border-brand-border">
                <div className="max-w-5xl mx-auto px-6 sm:px-8">

                    {/* Label */}
                    <p className="font-mono text-[11px] text-brand-muted tracking-[0.18em] uppercase mb-7 flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        biblioteca actualizada hoy
                    </p>

                    {/* Headline */}
                    <h1 className="font-display text-5xl sm:text-6xl md:text-[68px] leading-[1.02] tracking-tight text-brand-text mb-6 max-w-3xl">
                        El arsenal de prompts que convierte IA en{' '}
                        <em className="not-italic text-brand-accent">resultados.</em>
                    </h1>

                    <p className="text-brand-muted text-lg max-w-xl leading-relaxed mb-10">
                        Más de <strong className="text-brand-text font-semibold">150 estructuras probadas</strong> para
                        marketing, ventas y productividad. Copia, pega, ejecuta.
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap items-center gap-6 mb-10">
                        {[
                            { value: '150+', label: 'prompts' },
                            { value: '12', label: 'categorías' },
                            { value: '$4', label: '/mes acceso total' },
                        ].map(stat => (
                            <div key={stat.label} className="flex items-baseline gap-2">
                                <span className="font-display text-3xl font-semibold text-brand-text">{stat.value}</span>
                                <span className="font-mono text-[11px] text-brand-muted tracking-widest uppercase">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="max-w-2xl">
                        <div
                            className="flex items-center gap-3 px-5 py-1 rounded-2xl border border-brand-border bg-white focus-within:border-brand-accent/60 transition-colors shadow-sm"
                        >
                            <Search size={16} className="text-brand-muted flex-shrink-0" />
                            <input
                                type="text"
                                placeholder='busca: "email de ventas", "análisis de datos"…'
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none py-4 text-sm focus:ring-0 outline-none placeholder:text-brand-muted/50 text-brand-text"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="flex-shrink-0 text-brand-muted hover:text-brand-text transition-colors">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FILTER BAR ────────────────────────────────────────────────── */}
            <div className="sticky top-16 z-40 border-b border-brand-border backdrop-blur-md" style={{ backgroundColor: 'rgba(250,249,245,0.92)' }}>
                <div className="max-w-7xl mx-auto px-6 sm:px-8 py-3 flex items-center gap-3">

                    {/* Tier toggle */}
                    <div className="flex-shrink-0 flex items-center gap-0.5 bg-brand-surface rounded-xl p-1">
                        {(['todos', 'gratis', 'premium'] as const).map(tier => (
                            <button
                                key={tier}
                                onClick={() => setSelectedTier(tier)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-wide transition-all whitespace-nowrap ${
                                    selectedTier === tier
                                        ? 'bg-white text-brand-text shadow-sm'
                                        : 'text-brand-muted hover:text-brand-text'
                                }`}
                            >
                                {tier}
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-5 bg-brand-border flex-shrink-0" />

                    {/* Category select */}
                    <div className="relative flex-shrink-0">
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="appearance-none font-mono text-[11px] font-bold pr-7 pl-3 py-2 rounded-xl border border-brand-border bg-white text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer transition-colors hover:border-brand-accent"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {getCategoryEmoji(cat)} {cat}
                                </option>
                            ))}
                        </select>
                        <ChevronRight size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none rotate-90" />
                    </div>

                    {/* Divider */}
                    <div className="w-px h-5 bg-brand-border flex-shrink-0" />

                    {/* Category pills */}
                    <button
                        onClick={() => scrollPills('left')}
                        className="flex-shrink-0 hidden sm:flex items-center justify-center w-6 h-6 rounded-full border border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent transition-colors"
                    >
                        <ChevronLeft size={12} />
                    </button>

                    <div ref={pillsRef} className="flex items-center gap-2 overflow-x-auto flex-1 py-0.5" style={{ scrollbarWidth: 'none' }}>
                        {categories.map(cat => {
                            const isActive = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold transition-all whitespace-nowrap ${
                                        isActive
                                            ? 'bg-brand-text text-white'
                                            : 'border border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent'
                                    }`}
                                >
                                    <span className="text-sm leading-none">{getCategoryEmoji(cat)}</span>
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => scrollPills('right')}
                        className="flex-shrink-0 hidden sm:flex items-center justify-center w-6 h-6 rounded-full border border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent transition-colors"
                    >
                        <ChevronRight size={12} />
                    </button>

                    {/* Desktop premium CTA */}
                    {!isSubscribed && !loading && (
                        <button
                            onClick={handleSubscribe}
                            className="ml-auto hidden md:flex items-center gap-2 text-[11px] font-mono font-bold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
                            style={{ backgroundColor: '#C96A3C', color: 'white' }}
                        >
                            <Sparkles size={11} />
                            premium · $4/mes
                            <ArrowRight size={11} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── GRID ──────────────────────────────────────────────────────── */}
            <div ref={gridRef} className="max-w-7xl mx-auto px-6 sm:px-8 py-10">

                {/* Results header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="font-mono text-[10px] text-brand-muted tracking-[0.2em] uppercase mb-1">
                            {filteredPrompts.length} prompts · pág. {currentPage}/{totalPages || 1}
                        </p>
                        <h2 className="font-display text-2xl text-brand-text">
                            {searchQuery
                                ? <>resultados para <em className="text-brand-muted not-italic">"{searchQuery}"</em></>
                                : selectedCategory === 'todas' ? 'todos los prompts' : selectedCategory
                            }
                        </h2>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="rounded-2xl h-56 animate-pulse" style={{ backgroundColor: '#F0EAE1' }} />
                        ))}
                    </div>
                ) : filteredPrompts.length > 0 ? (
                    <>
                        {/* First batch */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                            {firstBatch.map((prompt, i) => (
                                <PromptCard
                                    key={prompt.id}
                                    prompt={prompt}
                                    index={(currentPage - 1) * PAGE_SIZE + i}
                                />
                            ))}
                        </div>

                        {/* Upsell banner between batches */}
                        {showUpsell && (
                            <div
                                className="my-8 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden"
                                style={{ backgroundColor: '#1A1410' }}
                            >
                                {/* Subtle texture */}
                                <div className="absolute inset-0 opacity-[0.04]" style={{
                                    backgroundImage: 'radial-gradient(circle, #C96A3C 1px, transparent 1px)',
                                    backgroundSize: '32px 32px'
                                }} />

                                <div className="flex-1 relative z-10 text-center md:text-left">
                                    <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-5 flex items-center gap-2 justify-center md:justify-start" style={{ color: '#8B7E74' }}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        membresía activa en segundos
                                    </p>
                                    <h3 className="font-display text-3xl md:text-4xl leading-tight text-white mb-4">
                                        Desbloquea cada prompt.<br />
                                        <em className="not-italic" style={{ color: '#C96A3C' }}>Cero límites.</em>
                                    </h3>
                                    <ul className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start mb-8">
                                        {[
                                            'acceso a 150+ prompts',
                                            'actualizaciones semanales',
                                            'cancela con un clic',
                                        ].map(item => (
                                            <li key={item} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#C8BEB5' }}>
                                                <Check size={11} className="text-emerald-400" strokeWidth={3} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                        <button
                                            onClick={handleSubscribe}
                                            disabled={checkoutLoading}
                                            className="group inline-flex items-center justify-center gap-2 font-bold text-sm px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl"
                                            style={{ backgroundColor: '#C96A3C', color: 'white' }}
                                        >
                                            <Zap size={14} fill="currentColor" />
                                            {checkoutLoading ? 'cargando...' : (user ? 'suscribirme ahora' : 'hazte premium')}
                                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        {!user && (
                                            <Link
                                                to="/login?redirect=/prompts"
                                                className="inline-flex items-center justify-center gap-2 border font-bold text-sm px-6 py-4 rounded-2xl transition-all"
                                                style={{ borderColor: '#3D352E', color: '#8B7E74' }}
                                                onMouseEnter={e => {
                                                    (e.currentTarget as HTMLElement).style.borderColor = '#C96A3C';
                                                    (e.currentTarget as HTMLElement).style.color = '#C96A3C';
                                                }}
                                                onMouseLeave={e => {
                                                    (e.currentTarget as HTMLElement).style.borderColor = '#3D352E';
                                                    (e.currentTarget as HTMLElement).style.color = '#8B7E74';
                                                }}
                                            >
                                                ya tengo cuenta →
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Price block */}
                                <div className="flex-shrink-0 relative z-10">
                                    <div
                                        className="rounded-3xl p-8 text-center w-52"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                                    >
                                        <p className="font-mono text-[10px] tracking-widest mb-2 uppercase" style={{ color: '#8B7E74' }}>precio mensual</p>
                                        <span className="font-display text-6xl text-white">$4</span>
                                        <p className="font-mono text-[10px] mt-1 mb-4" style={{ color: '#8B7E74' }}>/mes · cancela cuando quieras</p>
                                        <div className="h-px mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
                                        <p className="text-xs" style={{ color: '#8B7E74' }}>
                                            equivale a <span className="text-white font-semibold">$0.13/día</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Second batch */}
                        {secondBatch.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {secondBatch.map((prompt, i) => (
                                    <PromptCard
                                        key={prompt.id}
                                        prompt={prompt}
                                        index={(currentPage - 1) * PAGE_SIZE + 6 + i}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24 rounded-3xl" style={{ backgroundColor: '#F0EAE1' }}>
                        <Search className="mx-auto mb-5" size={36} style={{ color: '#C8BEB5' }} />
                        <h3 className="font-display text-2xl text-brand-text mb-2">ningún prompt coincide</h3>
                        <p className="text-sm text-brand-muted mb-7 max-w-xs mx-auto leading-relaxed">
                            prueba con palabras más generales o explora todas las categorías.
                        </p>
                        <button
                            onClick={() => { setSelectedCategory('todas'); setSelectedTier('todos'); setSearchQuery(''); }}
                            className="font-mono text-xs font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
                            style={{ backgroundColor: '#1A1410', color: 'white' }}
                        >
                            ver todos los prompts
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-16">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold border border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            ← anterior
                        </button>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                const isEdge = page === 1 || page === totalPages;
                                const isNear = Math.abs(page - currentPage) <= 1;
                                if (!isEdge && !isNear) {
                                    if (page === 2 || page === totalPages - 1) {
                                        return <span key={page} className="text-brand-muted text-xs px-1">···</span>;
                                    }
                                    return null;
                                }
                                return (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`w-10 h-10 rounded-xl text-xs font-mono font-bold transition-all border ${
                                            currentPage === page
                                                ? 'border-transparent text-white'
                                                : 'border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent'
                                        }`}
                                        style={currentPage === page ? { backgroundColor: '#C96A3C' } : {}}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold border border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            siguiente →
                        </button>
                    </div>
                )}
            </div>

            {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
            {!isSubscribed && !loading && filteredPrompts.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-4">
                    <div
                        className="rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-brand-border"
                        style={{ backgroundColor: '#F0EAE1' }}
                    >
                        <div>
                            <p className="font-mono text-[10px] text-brand-muted tracking-widest mb-1.5 uppercase">sin contrato · cancela cuando quieras</p>
                            <h3 className="font-display text-2xl text-brand-text">
                                Accede a los 150+ prompts por{' '}
                                <span style={{ color: '#C96A3C' }}>$4/mes</span>
                            </h3>
                        </div>
                        <button
                            onClick={handleSubscribe}
                            className="group flex-shrink-0 inline-flex items-center gap-2 font-bold text-sm px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg"
                            style={{ backgroundColor: '#C96A3C', color: 'white' }}
                        >
                            <Sparkles size={14} />
                            hazte premium
                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Prompt Card ────────────────────────────────────────────────────────────────
const PromptCard: React.FC<{ prompt: any; index: number }> = ({ prompt, index }) => (
    <Link
        to={`/prompts/${prompt.id}`}
        className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
        style={{
            backgroundColor: 'white',
            border: '1px solid #E3DCD3',
        }}
        onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#C96A3C';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(201,106,60,0.10)';
        }}
        onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#E3DCD3';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
    >
        {/* Premium accent bar */}
        {prompt.is_premium && (
            <div className="h-0.5 w-full" style={{ backgroundColor: '#C96A3C' }} />
        )}

        <div className="p-6 flex flex-col flex-1">
            {/* Top row: index + tier */}
            <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[11px]" style={{ color: '#C8BEB5' }}>
                    {String(index + 1).padStart(2, '0')}
                </span>
                <span
                    className="font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase"
                    style={prompt.is_premium
                        ? { backgroundColor: '#FAF0E8', color: '#C96A3C' }
                        : { backgroundColor: '#F0EAE1', color: '#8B7E74' }
                    }
                >
                    {prompt.is_premium
                        ? <span className="flex items-center gap-1"><Lock size={7} />premium</span>
                        : 'gratis'
                    }
                </span>
            </div>

            {/* Title */}
            <h3
                className="font-display text-xl leading-snug mb-3 transition-colors line-clamp-2"
                style={{ color: '#1D1B18' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#C96A3C')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#1D1B18')}
            >
                {prompt.title}
            </h3>

            {/* Description */}
            <p className="text-sm leading-relaxed line-clamp-2 flex-1 mb-5" style={{ color: '#8B7E74' }}>
                {prompt.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #F0EAE1' }}>
                <span
                    className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: '#FAF9F5', color: '#8B7E74', border: '1px solid #E3DCD3' }}
                >
                    {getCategoryEmoji(prompt.category?.toLowerCase() ?? '')} {prompt.category || 'general'}
                </span>
                <span
                    className="font-mono text-[11px] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                    style={{ color: '#C96A3C' }}
                >
                    abrir →
                </span>
            </div>
        </div>
    </Link>
);

export default Prompts;
