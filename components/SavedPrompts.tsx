import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Bookmark, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { BG, BG_WARM, TEXT, TEXT_MED, TEXT_DIM, BORDER, YELLOW, FONT } from './darkKit';

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
            className="bp-scope"
            style={{
                backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 20,
                padding: '24px 22px', fontFamily: FONT,
            }}
        >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <Bookmark size={15} style={{ color: TEXT_MED }} />
                    <h3 style={{ fontWeight: 600, fontSize: 16.5, letterSpacing: '-0.02em', color: TEXT }}>
                        Prompts guardados
                    </h3>
                    {!loading && savedPrompts.length > 0 && (
                        <span
                            style={{
                                backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 100,
                                padding: '2px 8px', fontSize: 11.5, fontWeight: 600, color: TEXT_MED,
                            }}
                        >
                            {savedPrompts.length}
                        </span>
                    )}
                </div>
                {!loading && savedPrompts.length > 0 && (
                    <Link to="/prompts" style={{ fontSize: 13, color: TEXT_MED, textDecoration: 'none' }}>
                        Explorar más →
                    </Link>
                )}
            </div>

            {/* Loading skeleton */}
            {loading && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="animate-pulse"
                            style={{ height: 96, borderRadius: 14, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }}
                        />
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
                                className="flex flex-col"
                                style={{
                                    backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 14,
                                    padding: '14px 15px', textDecoration: 'none',
                                }}
                            >
                                <div className="mb-2.5 flex items-center justify-between gap-2">
                                    <span
                                        style={{
                                            backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 7,
                                            padding: '3px 8px', fontSize: 10, fontWeight: 600,
                                            letterSpacing: '0.1em', textTransform: 'uppercase', color: TEXT_MED,
                                        }}
                                    >
                                        {emoji} {item.prompts.category || 'general'}
                                    </span>
                                    {item.prompts.is_premium && (
                                        <span
                                            className="inline-flex items-center gap-1"
                                            style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ffb224' }}
                                        >
                                            <Lock size={9} /> premium
                                        </span>
                                    )}
                                </div>

                                <h4
                                    className="line-clamp-2 flex-1"
                                    style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: TEXT, marginBottom: 10 }}
                                >
                                    {item.prompts.title}
                                </h4>

                                <div className="flex justify-end">
                                    <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_MED }}>abrir →</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Empty state */}
            {!loading && savedPrompts.length === 0 && (
                <div
                    className="text-center"
                    style={{
                        border: `1px dashed ${BORDER}`, borderRadius: 16, backgroundColor: BG_WARM,
                        padding: '44px 20px',
                    }}
                >
                    <div
                        className="mx-auto mb-4"
                        style={{
                            width: 46, height: 46, borderRadius: 15,
                            backgroundColor: BG, border: `1px solid ${BORDER}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <Sparkles size={19} style={{ color: '#ffb224' }} />
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 6 }}>
                        Aún no guardaste ningún prompt
                    </p>
                    <p style={{ fontSize: 13.5, color: TEXT_MED, marginBottom: 20 }}>
                        Marca prompts como favoritos desde el banco.
                    </p>
                    <Link
                        to="/prompts"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            backgroundColor: YELLOW, color: '#1a1500',
                            fontWeight: 600, fontSize: 14, padding: '11px 20px', borderRadius: 11,
                            textDecoration: 'none',
                        }}
                    >
                        Explorar el banco <ArrowRight size={14} />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SavedPrompts;
