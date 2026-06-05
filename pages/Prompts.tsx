import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Prompt } from '../types';
import { Link, useNavigate, useParams } from 'react-router-dom';

const PAGE_SIZE = 12;

// Subtítulos por categoría — espejo del comportamiento dinámico de la muestra
const CATEGORY_SUBTITLES: Record<string, string> = {
    marketing: 'Optimiza tus campañas, automatiza tu copywriting y eleva tu estrategia SEO con prompts validados por expertos en marketing digital.',
    desarrollo: 'Acelera tu flujo de trabajo, refactoriza código complejo y diseña sistemas robustos con IA siguiendo buenas prácticas.',
    escritura: 'Mejora tu redacción, corrige textos técnicos y crea ganchos irresistibles con ingeniería de prompts avanzada.',
};

const DEFAULT_SUBTITLE = 'Prompts gratuitos y seleccionados para IA compatibles con ChatGPT, Claude, Gemini, Midjourney y los principales modelos del mercado.';

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
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const gridRef = useRef<HTMLDivElement>(null);

    // ── Paddle ───────────────────────────────────────────────────────────────
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

    // ── Título y subtítulo dinámicos ────────────────────────────────────────────
    const heroTitle = useMemo(() => {
        if (selectedCategory === 'todas') return 'LA BIBLIOTECA DE PROMPTS #1 DE TODO INTERNET.';
        const count = filteredPrompts.length;
        const noun = count === 1 ? 'PROMPT SELECCIONADO' : 'PROMPTS SELECCIONADOS';
        return `${count} ${noun} PARA ${selectedCategory.toUpperCase()}.`;
    }, [selectedCategory, filteredPrompts.length]);

    const heroSubtitle = selectedCategory === 'todas'
        ? DEFAULT_SUBTITLE
        : (CATEGORY_SUBTITLES[selectedCategory] ?? DEFAULT_SUBTITLE);

    return (
        <div className="bg-white text-gray-900 font-space">
            <main className="flex flex-col items-center justify-center px-6 py-16">
                <div className="w-full flex flex-col items-center">

                    {/* ── Hero ─────────────────────────────────────────────── */}
                    <div className="max-w-3xl w-full text-center mb-16">
                        <h1 className="font-bold leading-tight mb-6 md:mb-8 text-[28px] md:text-[35px] uppercase transition-all">
                            {heroTitle}
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-[14px] md:text-[15px] mb-10">
                            {heroSubtitle}
                        </p>

                        {/* Búsqueda */}
                        <div className="max-w-xl mx-auto mb-8">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar un prompt..."
                                className="w-full px-6 py-4 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors text-sm"
                            />
                        </div>

                        {/* Filtros de categoría */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.map(cat => {
                                const active = selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategorySelect(cat)}
                                        className={`px-4 py-1 text-xs uppercase border border-gray-200 transition-all ${
                                            active
                                                ? 'bg-gray-900 text-white'
                                                : 'hover:bg-gray-900 hover:text-white'
                                        }`}
                                    >
                                        {cat === 'todas' ? 'Todo' : cat}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Filtro de acceso: todos / gratis / premium */}
                        <div className="flex justify-center items-center gap-6 mt-8">
                            {(['todos', 'gratis', 'premium'] as const).map(tier => {
                                const active = selectedTier === tier;
                                return (
                                    <button
                                        key={tier}
                                        onClick={() => setSelectedTier(tier)}
                                        className={`text-[11px] uppercase tracking-widest font-bold pb-1 border-b transition-colors ${
                                            active
                                                ? 'text-gray-900 border-gray-900'
                                                : 'text-gray-400 border-transparent hover:text-gray-900'
                                        }`}
                                    >
                                        {tier}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Grid de prompts ──────────────────────────────────── */}
                    <div
                        ref={gridRef}
                        className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24"
                    >
                        {loading && Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="border border-gray-200 p-6 h-44 animate-pulse bg-gray-50" />
                        ))}

                        {!loading && paginatedPrompts.map(prompt => (
                            <PromptCard key={prompt.id} prompt={prompt} />
                        ))}
                    </div>

                    {/* Estado vacío */}
                    {!loading && filteredPrompts.length === 0 && (
                        <div className="max-w-3xl w-full text-center mb-24 -mt-16">
                            <p className="text-sm text-gray-500 mb-6">
                                Ningún prompt coincide con tu búsqueda.
                            </p>
                            <button
                                onClick={() => { handleCategorySelect('todas'); setSelectedTier('todos'); setSearchQuery(''); }}
                                className="border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-3 text-xs uppercase tracking-wider font-bold transition-all"
                            >
                                Ver todos los prompts
                            </button>
                        </div>
                    )}

                    {/* Paginación */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 -mt-16 mb-24">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="text-xs uppercase tracking-wider font-bold px-3 py-2 hover:underline disabled:opacity-30 disabled:cursor-not-allowed disabled:no-underline"
                            >
                                ← Anterior
                            </button>
                            <span className="text-xs uppercase tracking-wider text-gray-400">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="text-xs uppercase tracking-wider font-bold px-3 py-2 hover:underline disabled:opacity-30 disabled:cursor-not-allowed disabled:no-underline"
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}

                    {/* Divisor minimalista */}
                    <div className="w-full max-w-3xl h-px bg-gray-100 mb-16" />

                    {/* ── CTA Premium ──────────────────────────────────────── */}
                    {!isSubscribed && (
                        <div className="max-w-xl w-full text-center py-6 relative">
                            <span className="inline-block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">
                                Membresía Premium
                            </span>

                            <h2 className="font-bold text-xl md:text-2xl leading-tight mb-3 uppercase tracking-tight">
                                Acceso Total por $4 USD/mes
                            </h2>

                            <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-8 max-w-md mx-auto">
                                Desbloquea más de 500 prompts avanzados de nivel senior y
                                actualizaciones constantes con los últimos modelos.
                            </p>

                            <button
                                onClick={handleSubscribe}
                                disabled={checkoutLoading}
                                className="border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-3.5 text-xs uppercase tracking-wider font-bold transition-all duration-300 w-full sm:w-auto disabled:opacity-50"
                            >
                                {checkoutLoading ? 'Procesando...' : 'Suscribirse'}
                            </button>

                            <div className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-6 flex justify-center items-center gap-1.5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Pago Seguro • Cancela cuando quieras
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

// ── Card de prompt ──────────────────────────────────────────────────────────
const PromptCard: React.FC<{ prompt: Prompt }> = ({ prompt }) => (
    <Link
        to={`/prompts/${prompt.id}`}
        className="border border-gray-200 p-6 hover:border-gray-900 transition-all cursor-pointer group flex flex-col"
    >
        <div className="flex items-center justify-between mb-4">
            <span className="inline-block px-2 py-1 text-[10px] font-bold bg-gray-100 uppercase tracking-wider">
                {prompt.category || 'General'}
            </span>
            {prompt.is_premium && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Premium
                </span>
            )}
        </div>
        <h3 className="font-bold text-lg mb-2 leading-snug">{prompt.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{prompt.description}</p>
    </Link>
);

export default Prompts;
