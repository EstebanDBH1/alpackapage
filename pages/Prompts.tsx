import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Prompt } from '../types';
import { BadgeCheck, Lock, Search, Filter, Unlock, Sparkles, ArrowRight, Zap, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const TIERS = ['todos', 'gratis', 'premium'];
const PAGE_SIZE = 12;

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
    const [bannerVisible, setBannerVisible] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const gridRef = React.useRef<HTMLDivElement>(null);

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
            if (!error && data) {
                setPrompts(data as Prompt[]);
            }
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

    // Reset to page 1 when filters/search change
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
            settings: {
                displayMode: 'overlay',
                theme: 'light',
                locale: 'es',
                successUrl: `${window.location.origin}/payment-success`
            },
            items: [{ priceId: priceId, quantity: 1 }],
            customer: { email: user.email },
            customData: { supabase_user_id: String(user.id) },
            eventCallback: () => setCheckoutLoading(false),
        });
    };

    // Split current page into two batches for upsell card insertion (page 1 only)
    const firstBatch = paginatedPrompts.slice(0, 6);
    const secondBatch = paginatedPrompts.slice(6);
    const showUpsellCard = !isSubscribed && !loading && filteredPrompts.length > 0 && currentPage === 1;

    return (
        <div className="bg-white min-h-screen pb-24 font-sans">
            <Helmet>
                <title>Banco de Prompts de IA | alpackaai</title>
                <meta name="description" content="Prompts para todas las tareas comerciales. Resultados profesionales en segundos. Acceso ilimitado por $4/mes." />
            </Helmet>

            {/* ── STICKY PREMIUM BANNER (solo para no suscritos) ─────────────── */}
            {!isSubscribed && bannerVisible && !loading && (
                <div className="sticky top-16 z-50 bg-zinc-900 text-white px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Sparkles size={16} className="text-yellow-400 flex-shrink-0" />
                        <p className="text-xs font-mono tracking-wide truncate">
                            <span className="text-yellow-400 font-bold"></span>
                            {' '}Desbloqueas todo el contenido.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={handleSubscribe}
                            className="bg-white text-zinc-900 text-[11px] font-bold px-4 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                        >
                            <Zap size={11} fill="currentColor" />
                            hazte premium
                        </button>
                        <button
                            onClick={() => setBannerVisible(false)}
                            className="text-zinc-500 hover:text-white transition-colors flex-shrink-0"
                            aria-label="Cerrar banner"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* HERO */}
            <section className="relative pt-14 pb-14 border-b border-zinc-100 bg-white overflow-hidden">
                {/* Subtle grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_100%_at_50%_0%,#000_50%,transparent_100%)] opacity-60"></div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Status pill */}
                    <div className="flex justify-center mb-7">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-400 uppercase">
                                banco actualizado hoy
                            </span>
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-5 text-zinc-900 leading-[0.9]">
                        el prompt correcto cambia
                        <br />
                        <span className="text-zinc-400">todo el resultado.</span>
                    </h1>

                    <p className="text-center max-w-xl mx-auto text-base md:text-lg text-zinc-500 mb-8 leading-relaxed">
                        más de <strong className="text-zinc-900">100 estructuras probadas</strong> para que la IA entienda exactamente lo que necesitas —
                        sin prueba y error, sin resultados genéricos.
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8 text-center">
                        {[
                            { value: '150+', label: 'prompts disponibles' },
                            { value: '99.2%', label: 'de éxito en primera respuesta' },
                            { value: '$4', label: 'acceso ilimitado al mes' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="text-xl font-black tracking-tighter text-zinc-900">{stat.value}</p>
                                <p className="text-[10px] font-mono text-zinc-400 tracking-widest mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Search bar */}
                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute inset-0 bg-zinc-100 rounded-2xl transition-transform group-focus-within:scale-[1.01]"></div>
                        <div className="relative bg-white border border-zinc-200 rounded-2xl flex items-center p-1.5 shadow-md group-focus-within:border-zinc-400 group-focus-within:shadow-lg transition-all">
                            <Search className="ml-4 text-zinc-400 flex-shrink-0" size={20} />
                            <input
                                type="text"
                                placeholder="p. ej. &quot;email de ventas&quot;, &quot;análisis de datos&quot;, &quot;copywriting&quot;..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none px-4 py-3.5 font-sans text-sm focus:ring-0 outline-none placeholder:text-zinc-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mr-3 text-zinc-300 hover:text-zinc-600 transition-colors flex-shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* FILTROS */}
            <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Filter size={14} className="text-zinc-400 flex-shrink-0" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-zinc-50 border-none text-zinc-900 text-xs rounded-xl focus:ring-2 focus:ring-zinc-100 block w-full p-2.5 font-bold lowercase cursor-pointer"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex bg-zinc-100 p-1 rounded-xl">
                        {TIERS.map(tier => (
                            <button
                                key={tier}
                                onClick={() => setSelectedTier(tier)}
                                className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-all lowercase
                                ${selectedTier === tier ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                            >
                                {tier}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* GRID */}
            <div ref={gridRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900">
                            {searchQuery ? `resultados para "${searchQuery}"` : 'todos los prompts'}
                        </h2>
                        <p className="text-[10px] font-mono text-zinc-400 tracking-widest mt-1 uppercase">
                            {filteredPrompts.length} prompts · pág. {currentPage} / {totalPages || 1}
                        </p>
                    </div>
                    {/* Inline CTA pill for non-subscribers */}
                    {!isSubscribed && !loading && (
                        <button
                            onClick={handleSubscribe}
                            className="hidden md:flex items-center gap-2 bg-zinc-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-black transition-all hover:-translate-y-0.5 shadow-lg"
                        >
                            <Sparkles size={13} className="text-yellow-400" />
                            hazte premium — $4/mes
                            <ArrowRight size={13} />
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="break-inside-avoid mb-8 bg-zinc-50 rounded-2xl p-6 h-64 shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredPrompts.length > 0 ? (
                    <>
                        {/* FIRST BATCH */}
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 mb-8">
                            {firstBatch.map((prompt) => (
                                <PromptCard key={prompt.id} prompt={prompt} />
                            ))}
                        </div>

                        {/* ── UPSELL CARD (entre prompts) ─────────────────────────── */}
                        {showUpsellCard && (
                            <div className="my-10 rounded-3xl bg-zinc-900 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden shadow-2xl">
                                {/* BG decoration */}
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_100%_50%,rgba(255,255,255,0.04),transparent)] pointer-events-none"></div>
                                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/[0.03] border border-white/5"></div>
                                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/[0.03] border border-white/5"></div>

                                {/* Left content */}
                                <div className="flex-1 text-center md:text-left relative z-10">
                                    <span className="inline-flex items-center gap-2 text-[10px] font-mono text-zinc-500 tracking-[0.2em] mb-4">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        membresía activa en segundos
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-white mb-3 leading-tight">
                                        Desbloquea todo el<br />
                                        <span className="text-zinc-400">contenido.</span>
                                    </h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-sm mx-auto md:mx-0">

                                    </p>

                                    <ul className="flex flex-wrap gap-3 justify-center md:justify-start mb-8">
                                        {['acceso a 100+ prompts', 'actualizaciones semanales', 'cancela con un clic'].map((item) => (
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
                                            className="group flex items-center justify-center gap-2 bg-white text-zinc-900 font-bold text-sm px-8 py-4 rounded-2xl hover:bg-zinc-100 transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            <Zap size={16} fill="currentColor" className="text-zinc-700" />
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

                                {/* Right: price highlight */}
                                <div className="flex-shrink-0 relative z-10">
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-sm w-56">
                                        <p className="text-zinc-500 text-[10px] font-mono tracking-widest mb-2">precio mensual</p>
                                        <div className="flex items-baseline justify-center gap-1 mb-1">
                                            <span className="text-5xl font-black tracking-tighter text-white">$4</span>
                                        </div>
                                        <p className="text-zinc-500 text-[10px] font-mono mb-5">/mes · cancela cuando quieras</p>
                                        <div className="h-px bg-white/10 mb-5"></div>
                                        <p className="text-zinc-400 text-xs">
                                            equivale a{' '}
                                            <span className="text-white font-bold">$0.13/día</span>
                                            {' '}de productividad máxima
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECOND BATCH */}
                        {secondBatch.length > 0 && (
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                                {secondBatch.map((prompt) => (
                                    <PromptCard key={prompt.id} prompt={prompt} />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24 bg-zinc-50 rounded-3xl">
                        <Search className="mx-auto text-zinc-300 mb-4" size={40} />
                        <h3 className="text-lg font-bold mb-2">ningún prompt coincide con tu búsqueda</h3>
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

                {/* ── PAGINATION CONTROLS ─────────────────────────────────── */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-14">
                        {/* Prev */}
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            ← anterior
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                // Show: first, last, current ±1, and ellipsis
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
                                            : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next */}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            siguiente →
                        </button>
                    </div>
                )}
            </div>

            {/* ── BOTTOM CTA BANNER (solo para no suscritos) ─────────────── */}
            {!isSubscribed && !loading && filteredPrompts.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <p className="font-mono text-[10px] text-zinc-400 tracking-widest mb-1 uppercase">sin contrato · cancela cuando quieras</p>
                            <h3 className="text-xl font-black tracking-tight text-zinc-900">
                                accede a los 100+ prompts por <span className="underline decoration-4 underline-offset-4 decoration-zinc-300">$4/mes</span>
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

// ── Prompt Card sub-component ─────────────────────────────────────────────────
const PromptCard: React.FC<{ prompt: any }> = ({ prompt }) => (
    <Link
        to={`/prompts/${prompt.id}`}
        className="break-inside-avoid mb-8 group relative bg-white border border-zinc-100 rounded-2xl shadow-xl shadow-zinc-200/50 block overflow-hidden transition-transform hover:-translate-y-1"
    >
        {/* IMAGE & BADGE */}
        <div className="w-full overflow-hidden relative bg-zinc-50">
            {prompt.image_url ? (
                <img
                    src={prompt.image_url}
                    alt={prompt.title}
                    className="w-full h-auto object-cover opacity-100 transition-none"
                />
            ) : (
                <div className="w-full h-32 bg-zinc-100 flex items-center justify-center">
                    <BadgeCheck size={32} className="text-zinc-200" />
                </div>
            )}
            <div className="absolute top-4 right-4">
                <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest flex items-center gap-1.5 backdrop-blur-md shadow-lg ${prompt.is_premium
                    ? 'bg-zinc-900/90 text-white border border-white/10'
                    : 'bg-white/90 text-zinc-900 border border-zinc-200'
                    }`}>
                    {prompt.is_premium ? <Lock size={10} /> : <Unlock size={10} />}
                    {prompt.is_premium ? 'PREMIUM' : 'GRATIS'}
                </span>
            </div>
        </div>

        <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-bold text-lg leading-tight text-zinc-900 lowercase group-hover:text-zinc-600 transition-colors">
                    {prompt.title}
                </h3>
                <BadgeCheck size={18} className="text-zinc-200 group-hover:text-zinc-900 transition-colors flex-shrink-0" />
            </div>
            <p className="text-sm text-zinc-500 mb-6 lowercase font-sans leading-relaxed line-clamp-3">
                {prompt.description}
            </p>
            <div className="flex items-center justify-between border-t border-zinc-50 pt-5 mt-auto">
                <span className="text-[9px] font-mono bg-zinc-50 text-zinc-400 border border-zinc-100 px-2 py-1 rounded-md uppercase tracking-widest">
                    {prompt.category || 'general'}
                </span>
                <span className="text-[11px] font-black text-zinc-900 lowercase group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    explorar <span className="text-lg">→</span>
                </span>
            </div>
        </div>
    </Link>
);

export default Prompts;