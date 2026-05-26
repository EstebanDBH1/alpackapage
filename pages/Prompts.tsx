import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Prompt } from '../types';
import { Lock, Search, Sparkles, ArrowRight, Zap, Check, X, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const PAGE_SIZE = 12;

const CATEGORY_EMOJIS: Record<string, string> = {
    todas: '✦', marketing: '📣', copywriting: '✍️', ventas: '💰',
    productividad: '⚡', estrategia: '♟️', redes: '📱', email: '📧',
    negocio: '💼', contenido: '🎨', datos: '📊', 'ideas de negocio': '💡', finanzas: '📈',
};

function getCategoryEmoji(cat: string): string {
    return CATEGORY_EMOJIS[cat?.toLowerCase()] ?? '•';
}

const Prompts: React.FC = () => {
    const navigate = useNavigate();
    const { category: categoryParam } = useParams<{ category?: string }>();
    const selectedCategory = categoryParam ?? 'todas';
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

    useEffect(() => {
        const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim();
        const initPaddle = () => {
            if (!window.Paddle || !clientToken) return;
            if (clientToken.startsWith('test_')) window.Paddle.Environment.set('sandbox');
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
                    .from('subscriptions').select('subscription_status')
                    .eq('customer_id', user.id).maybeSingle();
                if (sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing')) {
                    setIsSubscribed(true);
                }
            }
        };
        checkUser();
    }, []);

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
    const firstBatch = paginatedPrompts.slice(0, 6);
    const secondBatch = paginatedPrompts.slice(6);
    const showUpsell = !isSubscribed && !loading && filteredPrompts.length > 0 && currentPage === 1;

    const goToPage = (page: number) => {
        setCurrentPage(page);
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleSubscribe = () => {
        if (!user) return navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        if (!scriptLoaded || !window.Paddle) return;
        setCheckoutLoading(true);
        window.Paddle.Checkout.open({
            settings: { displayMode: 'overlay', theme: 'light', locale: 'es', successUrl: `${window.location.origin}/payment-success` },
            items: [{ priceId: import.meta.env.VITE_PADDLE_PRICE_ID?.trim(), quantity: 1 }],
            customer: { email: user.email },
            customData: { supabase_user_id: String(user.id) },
            eventCallback: () => setCheckoutLoading(false),
        });
    };

    const isFiltered = selectedCategory !== 'todas' || selectedTier !== 'todos' || searchQuery !== '';

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#f7f6f3', color: '#1a1a1a' }}>

            {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
            <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e4e4e1' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8 sm:pb-10">

                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                        <div>
                            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3 flex items-center gap-2" style={{ color: '#a8a5a1' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                biblioteca · actualizada hoy
                            </p>
                            <h1
                                className="font-display font-bold leading-tight tracking-tight mb-2"
                                style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: '#1a1a1a', letterSpacing: '-0.03em' }}
                            >
                                Prompts que funcionan{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    en la primera.
                                </span>
                            </h1>
                            <p className="text-sm max-w-md" style={{ color: '#787774', lineHeight: 1.6 }}>
                                150+ prompts curados por especialistas. Filtra, copia y úsalos con ChatGPT, Claude o Gemini ahora mismo.
                            </p>
                        </div>

                        {/* Stats + CTA */}
                        <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
                            <div className="flex items-center gap-5">
                                {[
                                    { value: loading ? '···' : `${prompts.length}`, label: 'prompts' },
                                    { value: loading ? '·' : `${categories.length - 1}`, label: 'categorías' },
                                ].map(s => (
                                    <div key={s.label} className="text-right">
                                        <p className="font-display font-bold text-lg leading-none" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>{s.value}</p>
                                        <p className="font-mono text-[9px] tracking-widest uppercase mt-0.5" style={{ color: '#a8a5a1' }}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            {!isSubscribed && !loading && (
                                <button
                                    onClick={handleSubscribe}
                                    className="inline-flex items-center gap-2 font-semibold text-xs px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
                                    style={{ backgroundColor: '#000', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#222')}
                                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#000')}
                                >
                                    <Sparkles size={12} />
                                    acceso completo · $4/mes
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search bar */}
                    <div
                        className="flex items-center gap-3 px-4 sm:px-5 rounded-2xl border transition-colors"
                        style={{ backgroundColor: '#f7f6f3', borderColor: '#e4e4e1' }}
                    >
                        <Search size={15} style={{ color: '#c4c2bf', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Busca por tema, categoría o caso de uso…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none py-4 text-sm focus:ring-0 outline-none"
                            style={{ color: '#1a1a1a' }}
                            onFocus={e => (e.currentTarget.closest('div') as HTMLElement).style.borderColor = '#a78bfa'}
                            onBlur={e => (e.currentTarget.closest('div') as HTMLElement).style.borderColor = '#e4e4e1'}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="flex-shrink-0 p-1 rounded-lg transition-colors"
                                style={{ color: '#c4c2bf' }}
                                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#1a1a1a')}
                                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#c4c2bf')}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
            <div
                className="sticky top-14 z-40 border-b backdrop-blur-md"
                style={{ backgroundColor: 'rgba(247,246,243,0.96)', borderColor: '#e4e4e1' }}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2.5">

                    {/* Tier toggle */}
                    <div
                        className="flex items-center gap-0.5 p-1 rounded-xl flex-shrink-0"
                        style={{ backgroundColor: '#ebebea' }}
                    >
                        {(['todos', 'gratis', 'premium'] as const).map(tier => (
                            <button
                                key={tier}
                                onClick={() => setSelectedTier(tier)}
                                className="px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-[10px] sm:text-[11px] font-bold tracking-wide transition-all whitespace-nowrap"
                                style={selectedTier === tier
                                    ? { backgroundColor: 'white', color: '#1a1a1a', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                                    : { color: '#a8a5a1' }
                                }
                            >
                                {tier}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-5 flex-shrink-0" style={{ backgroundColor: '#e4e4e1' }} />

                    {/* Category select */}
                    <div className="relative flex-1 min-w-0">
                        <select
                            value={selectedCategory}
                            onChange={e => handleCategorySelect(e.target.value)}
                            className="w-full appearance-none font-mono text-[11px] font-bold pr-7 pl-3 py-2 rounded-xl border outline-none transition-colors cursor-pointer"
                            style={{
                                backgroundColor: selectedCategory !== 'todas' ? '#6366f1' : '#ebebea',
                                color: selectedCategory !== 'todas' ? 'white' : '#a8a5a1',
                                borderColor: selectedCategory !== 'todas' ? '#6366f1' : '#e4e4e1',
                            }}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {getCategoryEmoji(cat)} {cat}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={11}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: selectedCategory !== 'todas' ? 'rgba(255,255,255,0.6)' : '#c4c2bf' }}
                        />
                    </div>

                    {/* Result count */}
                    {!loading && (
                        <span
                            className="hidden md:block font-mono text-[10px] font-bold flex-shrink-0 px-2.5 py-1 rounded-lg"
                            style={{ backgroundColor: '#ebebea', color: '#a8a5a1' }}
                        >
                            {filteredPrompts.length}
                        </span>
                    )}
                </div>
            </div>

            {/* ── GRID ────────────────────────────────────────────────────────── */}
            <div ref={gridRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

                {/* Results label */}
                {!loading && (
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2.5">
                            <p className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: '#a8a5a1' }}>
                                {filteredPrompts.length} resultado{filteredPrompts.length !== 1 ? 's' : ''}
                                {searchQuery && <> · <span style={{ color: '#787774' }}>"{searchQuery}"</span></>}
                                {selectedCategory !== 'todas' && !searchQuery && <> · <span style={{ color: '#787774' }}>{selectedCategory}</span></>}
                            </p>
                            {isFiltered && (
                                <button
                                    onClick={() => { handleCategorySelect('todas'); setSelectedTier('todos'); setSearchQuery(''); }}
                                    className="font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md transition-colors"
                                    style={{ backgroundColor: '#ebebea', color: '#a8a5a1' }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.color = '#6366f1';
                                        (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0ff';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.color = '#a8a5a1';
                                        (e.currentTarget as HTMLElement).style.backgroundColor = '#ebebea';
                                    }}
                                >
                                    limpiar ×
                                </button>
                            )}
                        </div>
                        {totalPages > 1 && (
                            <p className="font-mono text-[10px]" style={{ color: '#a8a5a1' }}>
                                pág. {currentPage} / {totalPages}
                            </p>
                        )}
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="rounded-2xl h-52 animate-pulse" style={{ backgroundColor: '#ebebea' }} />
                        ))}
                    </div>
                )}

                {/* Prompt cards */}
                {!loading && filteredPrompts.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {firstBatch.map(prompt => (
                                <PromptCard key={prompt.id} prompt={prompt} />
                            ))}
                        </div>

                        {/* Mid-page upsell */}
                        {showUpsell && (
                            <div
                                className="my-6 rounded-2xl overflow-hidden relative"
                                style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}
                            >
                                {/* Gradient blobs */}
                                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', left: '-60px', top: '-60px', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, #667eea, #a78bfa)', filter: 'blur(80px)', opacity: 0.15 }} />
                                    <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, #f093fb, #667eea)', filter: 'blur(70px)', opacity: 0.12 }} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] relative z-10">
                                    {/* Left */}
                                    <div className="p-7 sm:p-8">
                                        <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3 flex items-center gap-2" style={{ color: '#4a4a4a' }}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            acceso completo en segundos
                                        </p>
                                        <h3
                                            className="font-display font-bold text-white mb-3"
                                            style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', lineHeight: 1.25, letterSpacing: '-0.02em' }}
                                        >
                                            Estás viendo solo una parte.{' '}
                                            <span style={{
                                                background: 'linear-gradient(135deg, #a78bfa, #f0abfc)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}>
                                                Desbloquea los 150+ prompts.
                                            </span>
                                        </h3>
                                        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
                                            {['todas las categorías', 'actualizaciones semanales', 'cancela cuando quieras'].map(item => (
                                                <span key={item} className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
                                                    <Check size={9} style={{ color: '#a78bfa' }} strokeWidth={3} />
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={handleSubscribe}
                                                disabled={checkoutLoading}
                                                className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
                                                style={{ backgroundColor: 'white', color: '#0a0a0a', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
                                                onMouseEnter={e => !checkoutLoading && ((e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0ff')}
                                                onMouseLeave={e => !checkoutLoading && ((e.currentTarget as HTMLElement).style.backgroundColor = 'white')}
                                            >
                                                <Zap size={13} fill="currentColor" />
                                                {checkoutLoading ? 'cargando...' : user ? 'suscribirme — $4/mes' : 'obtener acceso — $4/mes'}
                                                <ArrowRight size={12} />
                                            </button>
                                            {!user && (
                                                <Link
                                                    to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                                                    className="inline-flex items-center justify-center font-mono text-[11px] font-bold px-5 py-3 rounded-xl transition-colors border"
                                                    style={{ borderColor: '#2a2a2a', color: '#6a6a6a' }}
                                                    onMouseEnter={e => {
                                                        (e.currentTarget as HTMLElement).style.borderColor = '#a78bfa';
                                                        (e.currentTarget as HTMLElement).style.color = '#a78bfa';
                                                    }}
                                                    onMouseLeave={e => {
                                                        (e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a';
                                                        (e.currentTarget as HTMLElement).style.color = '#6a6a6a';
                                                    }}
                                                >
                                                    ya tengo cuenta →
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: price pill */}
                                    <div
                                        className="hidden md:flex flex-col items-center justify-center px-10 py-8"
                                        style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <p className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: '#4a4a4a' }}>por mes</p>
                                        <p className="font-display font-bold text-5xl leading-none" style={{ color: 'white', letterSpacing: '-0.03em' }}>$4</p>
                                        <p className="font-mono text-[10px] mt-2" style={{ color: '#4a4a4a' }}>= $0.13 / día</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {secondBatch.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {secondBatch.map(prompt => (
                                    <PromptCard key={prompt.id} prompt={prompt} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Empty state */}
                {!loading && filteredPrompts.length === 0 && (
                    <div
                        className="text-center py-20 rounded-2xl border"
                        style={{ backgroundColor: 'white', borderColor: '#e4e4e1' }}
                    >
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
                            style={{ backgroundColor: '#f7f6f3', border: '1px solid #e4e4e1' }}
                        >
                            <Search size={18} style={{ color: '#c4c2bf' }} />
                        </div>
                        <p className="font-semibold text-sm mb-2" style={{ color: '#1a1a1a' }}>
                            Ningún prompt coincide
                        </p>
                        <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: '#787774' }}>
                            Prueba con palabras más generales o explora todas las categorías.
                        </p>
                        <button
                            onClick={() => { handleCategorySelect('todas'); setSelectedTier('todos'); setSearchQuery(''); }}
                            className="font-mono text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
                            style={{ backgroundColor: '#1a1a1a', color: 'white' }}
                        >
                            ver todos los prompts
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-12">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ borderColor: '#e4e4e1', color: '#787774' }}
                            onMouseEnter={e => !(e.currentTarget as HTMLButtonElement).disabled && (
                                ((e.currentTarget as HTMLElement).style.borderColor = '#6366f1'),
                                ((e.currentTarget as HTMLElement).style.color = '#6366f1')
                            )}
                            onMouseLeave={e => (
                                ((e.currentTarget as HTMLElement).style.borderColor = '#e4e4e1'),
                                ((e.currentTarget as HTMLElement).style.color = '#787774')
                            )}
                        >
                            <span>←</span>
                            <span className="hidden sm:inline">anterior</span>
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                const isEdge = page === 1 || page === totalPages;
                                const isNear = Math.abs(page - currentPage) <= 1;
                                if (!isEdge && !isNear) {
                                    if (page === 2 || page === totalPages - 1) {
                                        return <span key={page} className="px-1 font-mono text-xs" style={{ color: '#c4c2bf' }}>···</span>;
                                    }
                                    return null;
                                }
                                return (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-mono text-xs font-bold transition-all border"
                                        style={currentPage === page
                                            ? { backgroundColor: '#6366f1', borderColor: '#6366f1', color: 'white' }
                                            : { borderColor: '#e4e4e1', color: '#787774' }
                                        }
                                        onMouseEnter={e => currentPage !== page && (
                                            ((e.currentTarget as HTMLElement).style.borderColor = '#6366f1'),
                                            ((e.currentTarget as HTMLElement).style.color = '#6366f1')
                                        )}
                                        onMouseLeave={e => currentPage !== page && (
                                            ((e.currentTarget as HTMLElement).style.borderColor = '#e4e4e1'),
                                            ((e.currentTarget as HTMLElement).style.color = '#787774')
                                        )}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ borderColor: '#e4e4e1', color: '#787774' }}
                            onMouseEnter={e => !(e.currentTarget as HTMLButtonElement).disabled && (
                                ((e.currentTarget as HTMLElement).style.borderColor = '#6366f1'),
                                ((e.currentTarget as HTMLElement).style.color = '#6366f1')
                            )}
                            onMouseLeave={e => (
                                ((e.currentTarget as HTMLElement).style.borderColor = '#e4e4e1'),
                                ((e.currentTarget as HTMLElement).style.color = '#787774')
                            )}
                        >
                            <span className="hidden sm:inline">siguiente</span>
                            <span>→</span>
                        </button>
                    </div>
                )}
            </div>

            {/* ── BOTTOM CTA ──────────────────────────────────────────────────── */}
            {!isSubscribed && !loading && filteredPrompts.length > 0 && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <div
                        className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden"
                        style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}
                    >
                        {/* Gradient blobs */}
                        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', left: '-40px', top: '-40px', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, #667eea, #a78bfa)', filter: 'blur(60px)', opacity: 0.18 }} />
                        </div>
                        <div className="relative z-10">
                            <p className="font-mono text-[10px] tracking-widest uppercase mb-2 flex items-center gap-1.5" style={{ color: '#4a4a4a' }}>
                                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                precio de lanzamiento
                            </p>
                            <h3 className="font-display font-bold text-lg sm:text-xl" style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>
                                Acceso completo a los 150+ prompts.{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #a78bfa, #f0abfc)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    $4 al mes.
                                </span>
                            </h3>
                            <p className="text-xs mt-1.5" style={{ color: '#4a4a4a' }}>
                                Sin contrato · cancela cuando quieras · acceso instantáneo
                            </p>
                        </div>
                        <button
                            onClick={handleSubscribe}
                            className="group relative z-10 w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 font-semibold text-sm px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5"
                            style={{ backgroundColor: 'white', color: '#0a0a0a', boxShadow: '0 6px 20px rgba(0,0,0,0.4)' }}
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0ff')}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'white')}
                        >
                            <Sparkles size={14} />
                            quiero acceso completo
                            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Prompt Card ────────────────────────────────────────────────────────────────
const PromptCard: React.FC<{ prompt: any }> = ({ prompt }) => (
    <Link
        to={`/prompts/${prompt.id}`}
        className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
        style={{ backgroundColor: 'white', border: '1px solid #e4e4e1', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
        onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#a78bfa';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(167,139,250,0.12)';
        }}
        onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#e4e4e1';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)';
        }}
    >
        {/* Premium accent line */}
        {prompt.is_premium && !prompt.image_url && (
            <div className="h-0.5 w-full flex-shrink-0" style={{ background: 'linear-gradient(90deg, #667eea, #a78bfa)' }} />
        )}

        {/* Image */}
        {prompt.image_url && (
            <div className="w-full overflow-hidden flex-shrink-0">
                <img src={prompt.image_url} alt={prompt.title} className="w-full h-auto block" />
            </div>
        )}

        <div className="p-5 flex flex-col flex-1">
            {/* Top: category + tier */}
            <div className="flex items-center justify-between mb-4">
                <span
                    className="font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md"
                    style={{ backgroundColor: '#f7f6f3', color: '#787774', border: '1px solid #e4e4e1' }}
                >
                    {getCategoryEmoji(prompt.category?.toLowerCase() ?? '')} {prompt.category || 'general'}
                </span>
                {prompt.is_premium ? (
                    <span
                        className="font-mono text-[9px] font-bold flex items-center gap-1 px-2 py-1 rounded-full"
                        style={{ color: '#6366f1', backgroundColor: '#f0f0ff', border: '1px solid #c7d2fe' }}
                    >
                        <Lock size={8} /> premium
                    </span>
                ) : (
                    <span className="font-mono text-[9px] font-bold" style={{ color: '#c4c2bf' }}>
                        gratis
                    </span>
                )}
            </div>

            {/* Title */}
            <h3
                className="font-display font-semibold leading-snug mb-2.5 flex-1 line-clamp-2"
                style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', color: '#1a1a1a' }}
            >
                {prompt.title}
            </h3>

            {/* Description */}
            <p
                className="text-[13px] leading-relaxed line-clamp-2 mb-4"
                style={{ color: '#787774' }}
            >
                {prompt.description}
            </p>

            {/* Footer */}
            <div
                className="flex items-center justify-end pt-3.5"
                style={{ borderTop: '1px solid #f0efec' }}
            >
                <span
                    className="font-mono text-[10px] font-bold group-hover:translate-x-0.5 transition-transform"
                    style={{ color: '#6366f1' }}
                >
                    abrir →
                </span>
            </div>
        </div>
    </Link>
);

export default Prompts;
