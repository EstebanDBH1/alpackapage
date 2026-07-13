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
        <div className="rounded-2xl border border-border/70 bg-card p-7 md:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bookmark size={14} className="text-muted-foreground" />
                    <h3 className="text-lg font-medium tracking-tight text-foreground">
                        Prompts guardados
                    </h3>
                    {!loading && savedPrompts.length > 0 && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {savedPrompts.length}
                        </span>
                    )}
                </div>
                {!loading && savedPrompts.length > 0 && (
                    <Link
                        to="/prompts"
                        className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
                    >
                        explorar más →
                    </Link>
                )}
            </div>

            {/* Loading skeleton */}
            {loading && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary" />
                    ))}
                </div>
            )}

            {/* Cards */}
            {!loading && savedPrompts.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {savedPrompts.map(item => {
                        const cat = item.prompts?.category?.toLowerCase() ?? '';
                        const emoji = CATEGORY_EMOJIS[cat] ?? '•';
                        return (
                            <Link
                                key={item.id}
                                to={`/prompts/${item.prompts.id}`}
                                className="group flex flex-col rounded-xl border border-border/60 bg-secondary/40 p-4 transition hover:border-primary/40"
                            >
                                {/* Top row */}
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="rounded-md border border-border/50 bg-card px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                                        {emoji} {item.prompts.category || 'general'}
                                    </span>
                                    {item.prompts.is_premium && (
                                        <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.15em] text-accent">
                                            <Lock size={8} /> premium
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h4 className="mb-3 flex-1 text-sm font-medium leading-snug text-foreground line-clamp-2">
                                    {item.prompts.title}
                                </h4>

                                {/* Footer */}
                                <div className="flex justify-end">
                                    <span className="font-mono text-[10px] text-accent transition-transform group-hover:translate-x-1">
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
                <div className="rounded-xl border border-dashed border-border/70 bg-secondary/30 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-secondary">
                        <Sparkles size={18} className="text-accent" />
                    </div>
                    <p className="mb-1 text-sm font-medium text-foreground">
                        Aún no guardaste ningún prompt
                    </p>
                    <p className="mb-5 text-xs text-muted-foreground">
                        Marca prompts como favoritos desde la biblioteca.
                    </p>
                    <Link
                        to="/prompts"
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                    >
                        Explorar biblioteca <ArrowRight size={12} />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SavedPrompts;
