import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Prompt } from '../types';
import { BadgeCheck, Lock, Search, Filter, Unlock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Skeleton from '../components/Skeleton';
import { Helmet } from 'react-helmet-async';

const TIERS = ['Todos', 'Gratis', 'Premium'];

const Prompts: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [selectedTier, setSelectedTier] = useState('Todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrompts = async () => {
            const { data, error } = await supabase
                .rpc('get_public_prompts'); // Secure function call

            if (error) {
                // Silently fail or handle UI state
            } else {
                setPrompts(data || []);
            }
            setLoading(false);
        };

        fetchPrompts();
    }, []);

    // Get unique categories from prompts
    const categories = useMemo(() => {
        const uniqueCats = Array.from(new Set(prompts.map(p => p.category).filter(Boolean)));
        return ['Todas', ...uniqueCats.sort()];
    }, [prompts]);

    const filteredPrompts = useMemo(() => {
        return prompts.filter(prompt => {
            const matchesCategory = selectedCategory === 'Todas' || prompt.category === selectedCategory;
            const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (prompt.description || '').toLowerCase().includes(searchQuery.toLowerCase());

            let matchesTier = true;
            if (selectedTier === 'Gratis') matchesTier = prompt.is_premium === false;
            if (selectedTier === 'Premium') matchesTier = prompt.is_premium === true;

            return matchesCategory && matchesSearch && matchesTier;
        });
    }, [prompts, selectedCategory, selectedTier, searchQuery]);

    return (
        <div className="bg-brand-bg min-h-screen pb-24">
            <Helmet>
                <title>Librería de Prompts | Alpacka.ai</title>
                <meta name="description" content="Explora más de 1.2M+ de prompts para ChatGPT, Claude y Midjourney. Biblioteca optimizada para automatizar negocios e ingeniería de prompts." />
                <link rel="canonical" href="https://alpackaai.xyz/prompts" />
            </Helmet>

            {/* HERO SECTION */}
            <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-bg border border-brand-surface mb-8">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-mono font-bold tracking-widest text-gray-500">
                            BASE DE DATOS ACTUALIZADA DIARIAMENTE
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight mb-6">
                        Archivo <br className="hidden md:block" />
                        <span className="text-gray-300">de</span> prompts
                    </h1>

                    <p className="max-w-xl mx-auto text-lg md:text-xl text-gray-500 mb-10 font-sans leading-relaxed">
                        Explora nuestra colección curada de más de 1.2M+ de prompts probados e ingenierizados para la perfección.
                    </p>

                    {/* SEARCH BAR IN HERO */}
                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-lg transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                        <div className="relative bg-white border-2 border-black rounded-lg flex items-center p-2">
                            <Search className="ml-4 text-gray-400 flex-shrink-0" size={24} />
                            <input
                                type="text"
                                placeholder="Busca por palabra clave, estilo o modelo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none px-4 py-3 font-mono text-base focus:ring-0 outline-none placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-200 rounded-full blur-3xl"></div>
                </div>
            </section>

            {/* FILTERS BAR (STICKY) */}
            <div className="sticky top-20 z-40 bg-brand-bg/95 backdrop-blur border-b border-brand-surface py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">

                    {/* Category Filters */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-black focus:border-black block w-full p-2.5 font-mono"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tier Filters */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {TIERS.map(tier => (
                            <button
                                key={tier}
                                onClick={() => setSelectedTier(tier)}
                                className={`px-3 py-1.5 text-xs font-bold tracking-wider transition-colors
                                ${selectedTier === tier
                                        ? 'text-black underline decoration-2 underline-offset-4'
                                        : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {tier}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Recientes</h2>
                        <p className="text-xs font-mono text-gray-500 tracking-widest mt-1">mostrando {filteredPrompts.length} resultados</p>
                    </div>
                </div>

                {/* MASONRY LAYOUT USING COLUMNS */}
                {loading ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="break-inside-avoid mb-8 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                <Skeleton className="h-48 w-full" />
                                <div className="p-5">
                                    <Skeleton variant="text" className="w-3/4 mb-4" />
                                    <Skeleton variant="text" className="w-full mb-2" />
                                    <Skeleton variant="text" className="w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredPrompts.length > 0 ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {filteredPrompts.map((prompt) => (
                            <Link
                                to={`/prompts/${prompt.id}`}
                                key={prompt.id}
                                className="break-inside-avoid mb-8 group relative bg-white border border-gray-200 transition-all duration-300 flex flex-col overflow-hidden rounded-none shadow-sm hover:shadow-md"
                            >
                                {/* Only show Image if it exists */}
                                {prompt.image_url && (
                                    <div className="w-full overflow-hidden relative bg-gray-50 border-b border-gray-100">
                                        <img
                                            src={prompt.image_url}
                                            alt={prompt.title}
                                            className="w-full h-auto object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                                        />
                                        <div className="absolute top-4 right-4 z-10">
                                            {prompt.is_premium ? (
                                                <span className="bg-black text-white px-3 py-1.5 text-[10px] font-bold tracking-wider flex items-center gap-1 shadow-lg">
                                                    <Lock size={12} /> Pro
                                                </span>
                                            ) : (
                                                <span className="bg-white text-black border border-black px-3 py-1.5 text-[10px] font-bold tracking-wider flex items-center gap-1 shadow-sm">
                                                    <Unlock size={12} /> Free
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-6 flex flex-col">
                                    <div>
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <h3 className="font-bold text-xl leading-[1.1] tracking-tight group-hover:text-black transition-colors">{prompt.title}</h3>
                                            <BadgeCheck size={20} className="text-blue-500 flex-shrink-0 mt-1" />
                                        </div>
                                        <p className="text-base text-gray-500 mb-6 font-sans leading-relaxed">
                                            {prompt.description}
                                        </p>
                                    </div>

                                    <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black bg-brand-bg border border-brand-surface px-2.5 py-1 text-gray-500 tracking-widest rounded shadow-sm">
                                                {prompt.category || 'General'}
                                            </span>
                                            {prompt.is_premium ? (
                                                <span className="text-[10px] font-bold text-black border border-black px-2 py-0.5 tracking-tighter">PRO</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-green-600 border border-green-600 px-2 py-0.5 tracking-tighter">FREE</span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-xs font-black tracking-widest group-hover:translate-x-1 transition-transform">
                                            Explorar <span className="ml-1 text-lg">→</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                        <Filter className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-xl font-bold mb-2">No encontramos nada</h3>
                        <p className="font-mono text-gray-400 mb-6">Intenta ajustar tus filtros o buscar algo diferente.</p>
                        <button
                            onClick={() => { setSelectedCategory('Todas'); setSelectedTier('Todos'); setSearchQuery(''); }}
                            className="text-sm font-bold bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
                        >
                            LIMPIAR FILTROS
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Prompts;