import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Bookmark, Lock, ArrowRight, Sparkles } from 'lucide-react';

const CATEGORY_EMOJIS: Record<string, string> = {
    marketing: '📣', copywriting: '✍️', ventas: '💰',
    productividad: '⚡', estrategia: '♟️', redes: '📱',
    email: '📧', negocio: '💼', contenido: '🎨',
    datos: '📊', 'ideas de negocio': '💡', finanzas: '📈',
};

interface Props {
    userId: string;
}

const SavedPrompts: React.FC<Props> = ({ userId }) => {
    const [savedPrompts, setSavedPrompts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase
                .from('saved_prompts')
                .select(`id, prompt_id, prompts ( id, title, category, is_premium )`)
                .eq('user_id', userId);
            if (data) setSavedPrompts(data);
            setLoading(false);
        };
        fetch();
    }, [userId]);

    return (
        <div
            className="rounded-2xl p-7 md:p-8 border"
            style={{ backgroundColor: 'white', borderColor: '#E3DCD3' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Bookmark size={14} style={{ color: '#8B7E74' }} />
                    <h3 className="font-display font-semibold text-lg" style={{ color: '#1D1B18' }}>
                        Prompts guardados
                    </h3>
                    {!loading && savedPrompts.length > 0 && (
                        <span
                            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: '#F0EAE1', color: '#8B7E74' }}
                        >
                            {savedPrompts.length}
                        </span>
                    )}
                </div>
                {!loading && savedPrompts.length > 0 && (
                    <Link
                        to="/prompts"
                        className="font-mono text-[10px] font-bold uppercase tracking-widest transition-colors"
                        style={{ color: '#8B7E74' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C96A3C')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#8B7E74')}
                    >
                        explorar más →
                    </Link>
                )}
            </div>

            {/* Loading skeleton */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="h-24 rounded-xl animate-pulse"
                            style={{ backgroundColor: '#F0EAE1' }}
                        />
                    ))}
                </div>
            )}

            {/* Cards */}
            {!loading && savedPrompts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedPrompts.map(item => {
                        const cat = item.prompts?.category?.toLowerCase() ?? '';
                        const emoji = CATEGORY_EMOJIS[cat] ?? '•';
                        return (
                            <Link
                                key={item.id}
                                to={`/prompts/${item.prompts.id}`}
                                className="group flex flex-col rounded-xl p-4 border transition-all duration-150 hover:-translate-y-0.5"
                                style={{ borderColor: '#E3DCD3', backgroundColor: '#FAF9F5' }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#C96A3C';
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(201,106,60,0.08)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#E3DCD3';
                                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                }}
                            >
                                {/* Top row */}
                                <div className="flex items-center justify-between mb-3">
                                    <span
                                        className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 rounded-md"
                                        style={{ backgroundColor: 'white', color: '#8B7E74', border: '1px solid #E3DCD3' }}
                                    >
                                        {emoji} {item.prompts.category || 'general'}
                                    </span>
                                    {item.prompts.is_premium && (
                                        <span
                                            className="font-mono text-[9px] font-bold flex items-center gap-1"
                                            style={{ color: '#C96A3C' }}
                                        >
                                            <Lock size={8} /> premium
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h4
                                    className="font-display font-semibold text-sm leading-snug line-clamp-2 flex-1 mb-3"
                                    style={{ color: '#1D1B18' }}
                                >
                                    {item.prompts.title}
                                </h4>

                                {/* Footer */}
                                <div className="flex justify-end">
                                    <span
                                        className="font-mono text-[10px] font-bold group-hover:translate-x-1 transition-transform"
                                        style={{ color: '#C96A3C' }}
                                    >
                                        abrir →
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Empty state */}
            {!loading && savedPrompts.length === 0 && (
                <div
                    className="text-center py-14 rounded-xl border border-dashed"
                    style={{ borderColor: '#E3DCD3', backgroundColor: '#FAF9F5' }}
                >
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: '#F0EAE1', border: '1px solid #E3DCD3' }}
                    >
                        <Sparkles size={18} style={{ color: '#C8BEB5' }} />
                    </div>
                    <p className="font-semibold text-sm mb-1" style={{ color: '#1D1B18' }}>
                        Aún no guardaste ningún prompt
                    </p>
                    <p className="text-xs mb-5" style={{ color: '#8B7E74' }}>
                        Marca prompts como favoritos desde la biblioteca.
                    </p>
                    <Link
                        to="/prompts"
                        className="inline-flex items-center gap-1.5 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
                        style={{ backgroundColor: '#C96A3C', color: 'white' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#AF5A30')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#C96A3C')}
                    >
                        Explorar biblioteca <ArrowRight size={12} />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SavedPrompts;
