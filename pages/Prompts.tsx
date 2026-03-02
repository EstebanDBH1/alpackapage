import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Prompt } from '../types';
import { BadgeCheck, Lock, Search, Unlock, Sparkles, ArrowRight, Zap, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PAGE_SIZE = 12;

// ── Category icons/emojis map ─────────────────────────────────────────────────
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

    // Load Paddle
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

    // scroll pills horizontally
    const scrollPills = (dir: 'left' | 'right') => {
        if (!pillsRef.current) return;
        pillsRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    };

    return (
        <div className="bg-white min-h-screen pb-24 font-sans">
            <Helmet>
                <title>Banco de Prompts de IA | alpackaai</title>
                <meta name="description" content="Prompts para todas las tareas comerciales. Resultados profesionales en segundos. Acceso ilimitado por $4/mes." />
            </Helmet>

            {/* ── HERO ──────────────────────────────────────────────────────────── */}
            <section className="relative pt-16 pb-16 overflow-hidden bg-white border-b border-zinc-100">
                {/* subtle dot grid */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,#e4e4e7_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_70%_90%_at_50%_0%,#000_40%,transparent_100%)] opacity-50 pointer-events-none" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                    {/* live pill */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-400 uppercase">banco actualizado hoy</span>
                    </div>

                    {/* headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-zinc-900 leading-[0.92] mb-5">
                        prompts que hacen<br />
                        <span className="text-zinc-300">que la IA te entienda.</span>
                    </h1>

                    <p className="text-zinc-500 text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-8">
                        más de <strong className="text-zinc-900">150 estructuras probadas</strong> para marketing, ventas y productividad — sin prueba y error.
                    </p>


                    {/* Search bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative bg-white border border-zinc-200 rounded-2xl flex items-center px-4 py-1 shadow-lg shadow-zinc-100 focus-within:border-zinc-400 focus-within:shadow-xl transition-all">
                            <Search className="text-zinc-300 flex-shrink-0 mr-3" size={18} />
                            <input
                                type="text"
                                placeholder='busca por tema: "email de ventas", "análisis de datos"...'
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none py-3.5 text-sm focus:ring-0 outline-none placeholder:text-zinc-300 text-zinc-900"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="ml-2 text-zinc-300 hover:text-zinc-600 transition-colors flex-shrink-0">
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FILTER BAR ───────────────────────────────────────────────── */}
            <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100">

                {/* Row 1: Select + Tier toggle */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2 flex items-center gap-3">
                    {/* Category select */}
                    <div className="relative flex-shrink-0">
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-bold rounded-xl px-4 pr-8 py-2 focus:outline-none focus:border-zinc-400 cursor-pointer lowercase transition-all hover:border-zinc-300"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {getCategoryEmoji(cat)} {cat}
                                </option>
                            ))}
                        </select>
                        {/* chevron icon */}
                        <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none rotate-90" />
                    </div>

                    {/* Separator */}
                    <div className="w-px h-5 bg-zinc-100 flex-shrink-0" />

                    {/* Tier toggle */}
                    <div className="flex-shrink-0 flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
                        {['todos', 'gratis', 'premium'].map(tier => (
                            <button
                                key={tier}
                                onClick={() => setSelectedTier(tier)}
                                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap
                                    ${selectedTier === tier ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                            >
                                {tier}
                            </button>
                        ))}
                    </div>

                    {/* Premium CTA (desktop) */}
                    {!isSubscribed && !loading && (
                        <button
                            onClick={handleSubscribe}
                            className="ml-auto hidden md:flex items-center gap-2 bg-zinc-900 text-white text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-black transition-all hover:-translate-y-0.5 shadow-lg"
                        >
                            <Sparkles size={12} className="text-yellow-400" />
                            hazte premium — $4/mes
                            <ArrowRight size={12} />
                        </button>
                    )}
                </div>

                {/* Row 2: Pills slider */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 flex items-center gap-2">
                    {/* Scroll left */}
                    <button
                        onClick={() => scrollPills('left')}
                        className="flex-shrink-0 hidden sm:flex items-center justify-center w-6 h-6 rounded-full border border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-700 transition-all"
                    >
                        <ChevronLeft size={12} />
                    </button>

                    {/* Pills */}
                    <div
                        ref={pillsRef}
                        className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 py-0.5"
                    >
                        {categories.map(cat => {
                            const isActive = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap
                                        ${isActive
                                            ? 'bg-zinc-900 text-white shadow-sm'
                                            : 'bg-zinc-50 text-zinc-500 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-800'
                                        }`}
                                >
                                    <span className="text-sm leading-none">{getCategoryEmoji(cat)}</span>
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    {/* Scroll right */}
                    <button
                        onClick={() => scrollPills('right')}
                        className="flex-shrink-0 hidden sm:flex items-center justify-center w-6 h-6 rounded-full border border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-700 transition-all"
                    >
                        <ChevronRight size={12} />
                    </button>
                </div>

            </div>

            {/* ── GRID ──────────────────────────────────────────────────────────── */}
            <div ref={gridRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Results header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-lg font-black tracking-tight text-zinc-900">
                            {searchQuery
                                ? <>resultados para <span className="text-zinc-400">"{searchQuery}"</span></>
                                : selectedCategory === 'todas' ? 'todos los prompts' : selectedCategory
                            }
                        </h2>
                        <p className="text-[10px] font-mono text-zinc-400 tracking-widest mt-0.5 uppercase">
                            {filteredPrompts.length} prompts · pág. {currentPage}/{totalPages || 1}
                        </p>
                    </div>

                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-zinc-50 rounded-2xl h-64 animate-pulse" />
                        ))}
                    </div>
                ) : filteredPrompts.length > 0 ? (
                    <>
                        {/* First batch */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5">
                            {firstBatch.map(prompt => (
                                <PromptCard key={prompt.id} prompt={prompt} />
                            ))}
                        </div>

                        {/* Upsell card between batches */}
                        {showUpsell && (
                            <div className="my-8 rounded-3xl bg-zinc-900 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_90%_40%,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
                                <div className="absolute -top-14 -right-14 w-56 h-56 rounded-full bg-white/[0.03] border border-white/5 pointer-events-none" />

                                <div className="flex-1 text-center md:text-left relative z-10">
                                    <span className="inline-flex items-center gap-2 text-[10px] font-mono text-zinc-500 tracking-[0.2em] mb-4">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        membresía activa en segundos
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-white mb-3 leading-tight">
                                        Desbloquea todo el<br />
                                        <span className="text-zinc-400">contenido premium.</span>
                                    </h3>
                                    <ul className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start mb-8">
                                        {['acceso a 150+ prompts', 'actualizaciones semanales', 'cancela con un clic'].map(item => (
                                            <li key={item} className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                                                <Check size={12} className="text-emerald-400" strokeWidth={3} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                        <button
                                            onClick={handleSubscribe}
                                            disabled={checkoutLoading}
                                            className="group flex items-center justify-center gap-2 bg-white text-zinc-900 font-bold text-sm px-8 py-4 rounded-2xl hover:bg-zinc-100 transition-all shadow-xl hover:-translate-y-0.5"
                                        >
                                            <Zap size={15} fill="currentColor" className="text-zinc-700" />
                                            {checkoutLoading ? 'cargando...' : (user ? 'suscribirme ahora' : 'hazte premium')}
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        {!user && (
                                            <Link
                                                to="/login?redirect=/prompts"
                                                className="flex items-center justify-center gap-2 border border-zinc-700 text-zinc-400 font-bold text-sm px-6 py-4 rounded-2xl hover:border-zinc-500 hover:text-zinc-300 transition-all"
                                            >
                                                ya tengo cuenta →
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-shrink-0 relative z-10">
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center w-52">
                                        <p className="text-zinc-500 text-[10px] font-mono tracking-widest mb-2">precio mensual</p>
                                        <span className="text-5xl font-black tracking-tighter text-white">$4</span>
                                        <p className="text-zinc-500 text-[10px] font-mono mt-1 mb-4">/mes · cancela cuando quieras</p>
                                        <div className="h-px bg-white/10 mb-4" />
                                        <p className="text-zinc-400 text-xs">
                                            equivale a <span className="text-white font-bold">$0.13/día</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Second batch */}
                        {secondBatch.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {secondBatch.map(prompt => (
                                    <PromptCard key={prompt.id} prompt={prompt} />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24 bg-zinc-50 rounded-3xl">
                        <Search className="mx-auto text-zinc-200 mb-4" size={40} />
                        <h3 className="text-base font-black mb-2 text-zinc-900">ningún prompt coincide</h3>
                        <p className="text-sm text-zinc-400 mb-6 max-w-xs mx-auto">
                            intenta con palabras más generales, o explora todas las categorías.
                        </p>
                        <button
                            onClick={() => { setSelectedCategory('todas'); setSelectedTier('todos'); setSearchQuery(''); }}
                            className="text-xs font-bold bg-zinc-900 text-white px-6 py-3 rounded-xl"
                        >
                            ver todos los prompts
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-14">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            ← anterior
                        </button>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                const isEdge = page === 1 || page === totalPages;
                                const isNear = Math.abs(page - currentPage) <= 1;
                                if (!isEdge && !isNear) {
                                    if (page === 2 || page === totalPages - 1) {
                                        return <span key={page} className="text-zinc-300 text-xs px-1">···</span>;
                                    }
                                    return null;
                                }
                                return (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === page
                                            ? 'bg-zinc-900 text-white shadow-lg'
                                            : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            siguiente →
                        </button>
                    </div>
                )}
            </div>

            {/* ── BOTTOM CTA ─────────────────────────────────────────────────── */}
            {!isSubscribed && !loading && filteredPrompts.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <p className="font-mono text-[10px] text-zinc-400 tracking-widest mb-1 uppercase">sin contrato · cancela cuando quieras</p>
                            <h3 className="text-xl font-black tracking-tight text-zinc-900">
                                accede a los 150+ prompts por <span className="underline decoration-4 underline-offset-4 decoration-zinc-300">$4/mes</span>
                            </h3>
                        </div>
                        <button
                            onClick={handleSubscribe}
                            className="flex-shrink-0 group flex items-center gap-2 bg-zinc-900 text-white font-bold text-sm px-8 py-4 rounded-2xl hover:bg-black transition-all shadow-lg hover:-translate-y-0.5"
                        >
                            <Sparkles size={15} className="text-yellow-400" />
                            hazte premium
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
        className="group relative bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-zinc-200/60 hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
        {/* Image */}
        <div className="relative bg-zinc-50 overflow-hidden">
            {prompt.image_url ? (
                <img
                    src={prompt.image_url}
                    alt={prompt.title}
                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
            ) : (
                <div className="w-full h-36 flex items-center justify-center">
                    <BadgeCheck size={32} className="text-zinc-200" />
                </div>
            )}
            {/* Badge */}
            <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest flex items-center gap-1 backdrop-blur-sm shadow-md
                ${prompt.is_premium
                    ? 'bg-zinc-900/90 text-white border border-white/10'
                    : 'bg-white/90 text-zinc-700 border border-zinc-200'
                }`}
            >
                {prompt.is_premium ? <Lock size={8} /> : <Unlock size={8} />}
                {prompt.is_premium ? 'PREMIUM' : 'GRATIS'}
            </span>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
            <h3 className="font-bold text-base leading-snug text-zinc-900 lowercase mb-2 group-hover:text-zinc-600 transition-colors line-clamp-2">
                {prompt.title}
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                {prompt.description}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                <span className="text-[9px] font-mono bg-zinc-50 text-zinc-400 border border-zinc-100 px-2 py-1 rounded-md uppercase tracking-widest">
                    {prompt.category || 'general'}
                </span>
                <span className="text-[11px] font-black text-zinc-900 lowercase inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    explorar <span className="text-base">→</span>
                </span>
            </div>
        </div>
    </Link>
);

export default Prompts;