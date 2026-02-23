import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Prompt } from '../types';
import { BadgeCheck, Lock, Search, Filter, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const TIERS = ['todos', 'gratis', 'premium'];

const Prompts: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('todas');
    const [selectedTier, setSelectedTier] = useState('todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="bg-white min-h-screen pb-24 font-sans">
            <Helmet>
                <title>archivo de prompts | alpackaai</title>
                <meta name="description" content="explora nuestra colección curada de prompts optimizados." />
            </Helmet>

            {/* HERO */}
            <section className="relative pt-16 pb-12 border-b border-zinc-100 bg-zinc-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-400 uppercase">
                            archivo actualizado hoy
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-zinc-900 lowercase">
                        archivo <span className="text-zinc-400">de</span> prompts
                    </h1>

                    <p className="max-w-xl mx-auto text-base md:text-lg text-zinc-500 mb-10 lowercase leading-relaxed">
                        explora nuestra colección curada de prompts probados e ingenierizados para automatizar tu flujo de trabajo.
                    </p>

                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute inset-0 bg-zinc-100 rounded-2xl transition-transform group-focus-within:scale-[1.02]"></div>
                        <div className="relative bg-white border border-zinc-200 rounded-2xl flex items-center p-1.5 shadow-sm group-focus-within:border-zinc-400 transition-all">
                            <Search className="ml-4 text-zinc-400 flex-shrink-0" size={20} />
                            <input
                                type="text"
                                placeholder="busca por palabra clave o modelo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none px-4 py-3 font-sans text-sm focus:ring-0 outline-none placeholder:text-zinc-400 lowercase"
                            />
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 lowercase">recientes</h2>
                        <p className="text-[10px] font-mono text-zinc-400 tracking-widest mt-1 uppercase">
                            {filteredPrompts.length} resultados
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="break-inside-avoid mb-8 bg-zinc-50 rounded-2xl p-6 h-64 shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredPrompts.length > 0 ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {filteredPrompts.map((prompt) => (
                            <Link
                                to={`/prompts/${prompt.id}`}
                                key={prompt.id}
                                className="break-inside-avoid mb-8 group relative bg-white border border-zinc-100 rounded-2xl shadow-xl shadow-zinc-200/50 block overflow-hidden transition-transform hover:-translate-y-1"
                            >
                                {/* IMAGE & BADGE CONTAINER */}
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

                                    {/* TIER BADGE (GRATIS/PREMIUM) */}
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
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-zinc-50 rounded-3xl">
                        <Filter className="mx-auto text-zinc-300 mb-4" size={40} />
                        <h3 className="text-lg font-bold mb-1 lowercase">sin resultados</h3>
                        <button
                            onClick={() => { setSelectedCategory('todas'); setSelectedTier('todos'); setSearchQuery(''); }}
                            className="text-xs font-bold bg-zinc-900 text-white px-6 py-3 rounded-xl mt-4 lowercase"
                        >
                            limpiar filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Prompts;