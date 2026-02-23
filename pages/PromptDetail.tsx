import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Prompt } from '../types';
import { Copy, Check, Lock, ChevronLeft, AlertCircle, Bookmark, BookmarkCheck, Sparkles, Terminal } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { Helmet } from 'react-helmet-async';

const PromptDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPromptAndUser = async () => {
            setLoading(true);
            const { data: promptData, error } = await supabase.rpc('get_public_prompts').eq('id', id).single();

            const { data: { user } } = await supabase.auth.getUser();
            let subscribed = false;

            if (user) {
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('subscription_status')
                    .eq('customer_id', user.id)
                    .single();
                subscribed = sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing');

                const { data: saved } = await supabase
                    .from('saved_prompts')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('prompt_id', id)
                    .single();
                setIsSaved(!!saved);
            }

            if (!error) setPrompt(promptData as Prompt);
            setIsSubscribed(!!subscribed);
            setLoading(false);
        };
        fetchPromptAndUser();
    }, [id]);

    const handleCopy = () => {
        if (prompt?.content) {
            navigator.clipboard.writeText(prompt.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSave = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');
        if (!isSubscribed) return navigate('/pricing');

        setSaving(true);
        try {
            if (isSaved) {
                await supabase.from('saved_prompts').delete().eq('user_id', user.id).eq('prompt_id', id);
                setIsSaved(false);
            } else {
                await supabase.from('saved_prompts').insert({ user_id: user.id, prompt_id: id });
                setIsSaved(true);
            }
        } catch (e) { console.error(e); } finally { setSaving(false); }
    };

    if (loading) return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        </div>
    );

    if (!prompt) return (
        <div className="min-h-screen flex flex-col items-center justify-center font-sans">
            <AlertCircle size={40} className="text-zinc-300 mb-4" />
            <h2 className="text-xl font-bold lowercase">prompt no encontrado</h2>
            <Link to="/prompts" className="text-sm underline mt-2 opacity-50">volver al archivo</Link>
        </div>
    );

    const isLocked = prompt.is_premium && !isSubscribed;

    return (
        <div className="bg-white min-h-screen pb-20 font-sans">
            <Helmet>
                <title>{`${prompt.title} | alpackaai`}</title>
            </Helmet>

            {/* HEADER / NAV */}
            <nav className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-16 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">
                        <ChevronLeft size={16} className="mr-1" /> Volver
                    </button>
                    <div className="flex gap-4">
                        <button onClick={handleSave} disabled={saving} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                            {isSaved ? <BookmarkCheck size={20} className="text-emerald-500" /> : <Bookmark size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pt-12">
                {/* TITULO Y META */}
                <header className="mb-10 text-center md:text-left">
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                        <span className="px-2 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-mono rounded uppercase tracking-tighter">
                            {prompt.category}
                        </span>
                        {prompt.is_premium && (
                            <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-mono font-bold rounded flex items-center gap-1 border border-amber-100">
                                <Lock size={10} /> PREMIUM
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter lowercase mb-4">
                        {prompt.title}
                    </h1>
                    <p className="text-lg text-zinc-500 leading-relaxed lowercase max-w-2xl">
                        {prompt.description}
                    </p>
                </header>

                {/* VISUALIZER (Si es Midjourney o tiene imagen) */}
                {prompt.image_url && (
                    <div className="mb-10 rounded-3xl overflow-hidden border border-zinc-100 shadow-2xl shadow-zinc-200/50">
                        <img src={prompt.image_url} alt={prompt.title} className="w-full h-auto" />
                    </div>
                )}

                {/* PROMPT EDITOR / BOX */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Terminal size={14} /> Prompt Editor
                        </h3>
                        {!isLocked && (
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copiado' : 'Copiar Prompt'}
                            </button>
                        )}
                    </div>

                    <div className="relative group">
                        <div className={`w-full min-h-[200px] rounded-3xl p-8 md:p-10 font-mono text-base md:text-lg leading-relaxed transition-all border ${isLocked ? 'bg-zinc-50 border-zinc-200 overflow-hidden' : 'bg-zinc-50 border-zinc-100 text-zinc-800'}`}>
                            {isLocked ? (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-8 backdrop-blur-md bg-white/30">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4">
                                        <Lock className="text-zinc-900" size={24} />
                                    </div>
                                    <h4 className="font-black text-xl mb-2 lowercase">Contenido Bloqueado</h4>
                                    <p className="text-sm text-zinc-500 mb-6 max-w-xs lowercase">Este prompt es parte del archivo premium. Suscríbete para desbloquearlo.</p>
                                    <Link to="/pricing" className="bg-zinc-900 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-transform">
                                        Ver Planes
                                    </Link>
                                </div>
                            ) : (
                                <code className="block whitespace-pre-wrap select-all">
                                    {prompt.content}
                                </code>
                            )}

                            {/* Marca de agua sutil */}
                            <div className="absolute bottom-4 right-6 pointer-events-none opacity-20">
                                <Sparkles size={20} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* CONSEJO TÉCNICO */}
                <footer className="mt-8 flex items-start gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <AlertCircle className="text-blue-500 shrink-0" size={20} />
                    <div>
                        <p className="text-sm text-blue-900 leading-relaxed lowercase">
                            <span className="font-bold">tip de ingeniería:</span> los parámetros entre <span className="font-mono bg-blue-100 px-1 rounded">[corchetes]</span> son variables. cámbialos por tus datos específicos para obtener el mejor output del modelo.
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default PromptDetail;