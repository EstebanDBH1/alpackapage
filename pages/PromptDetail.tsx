
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Prompt } from '../types';
import { Copy, Check, Lock, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { Helmet } from 'react-helmet-async';

const PromptDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        const fetchPromptAndUser = async () => {
            setLoading(true);

            // Fetch Prompt securely
            const promptPromise = supabase
                .rpc('get_public_prompts')
                .eq('id', id)
                .single();

            // Check User Subscription
            const userPromise = supabase.auth.getUser().then(async ({ data: { user } }) => {
                if (!user) return false;

                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('subscription_status')
                    .eq('customer_id', user.id)
                    .single();

                return sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing');
            });

            const [promptResult, isSubscribedResult] = await Promise.all([promptPromise, userPromise]);

            if (promptResult.error) {
                // Handle error
            } else {
                setPrompt(promptResult.data);
            }

            setIsSubscribed(!!isSubscribedResult);
            setLoading(false);
        };

        fetchPromptAndUser();
    }, [id]);

    // ... inside loading check
    if (loading) {
        return (
            <div className="bg-brand-bg min-h-screen pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-5 space-y-8">
                            <Skeleton className="aspect-square w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                        <div className="lg:col-span-7 space-y-8">
                            <Skeleton variant="text" className="w-1/4 mb-4" />
                            <Skeleton variant="text" className="h-12 w-3/4 mb-6" />
                            <Skeleton variant="text" className="h-24 w-full mb-6" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!prompt) {
        return (
            <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
                <AlertCircle size={48} className="mb-4 text-gray-400" />
                <h2 className="text-2xl font-black mb-2">PROMPT NO ENCONTRADO</h2>
                <Link to="/prompts" className="underline font-bold">Volver al archivo</Link>
            </div>
        );
    }

    const handleCopy = () => {
        if (prompt.content) {
            navigator.clipboard.writeText(prompt.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isLocked = prompt.is_premium && !isSubscribed;

    return (
        <div className="bg-brand-bg min-h-screen pb-24">
            <Helmet>
                <title>{`${prompt.title} | Prompt Engineering | Alpacka.ai`}</title>
                <meta name="description" content={prompt.description || `Prompt optimizado para ${prompt.category}. Copia y pega este prompt en ChatGPT o Claude.`} />
                <link rel="canonical" href={`https://alpackaai.xyz/prompts/${id}`} />
            </Helmet>
            {/* Breadcrumb / Back Navigation */}
            <div className="border-b border-brand-surface bg-white/50 backdrop-blur sticky top-20 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm font-mono text-gray-500 hover:text-black transition-colors"
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        VOLVER
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Image (Optional) & Technical Specs */}
                    <div className="lg:col-span-5 space-y-8">
                        {prompt.image_url && (
                            <div className="relative border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
                                <div className=" overflow-hidden relative group">
                                    <img
                                        src={prompt.image_url}
                                        alt={prompt.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {prompt.is_premium && (
                                        <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 text-xs font-bold tracking-wider flex items-center gap-1">
                                            <Lock size={12} /> Premium
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Technical Specs / Parameters */}
                        <div className="bg-[#F5F3F1] p-6 rounded-none">
                            <h3 className="font-bold text-xs tracking-widest mb-4 text-gray-500 border-b border-gray-300 pb-2">
                                Especificaciones
                            </h3>
                            <div className="space-y-3 font-mono text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Categoría</span>
                                    <span className="font-bold">{prompt.category}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">ID Referencia</span>
                                    <span className="font-bold text-xs">#{prompt.id.slice(0, 8)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Creado</span>
                                    <span className="font-bold text-xs">{new Date(prompt.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & Prompt */}
                    <div className="lg:col-span-7 space-y-8">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-black text-white px-2 py-1 text-[10px] font-mono tracking-wider">
                                    {prompt.category}
                                </span>
                                {!prompt.image_url && prompt.is_premium && (
                                    <span className="bg-black text-white px-2 py-1 text-[10px] font-mono tracking-wider flex items-center gap-1">
                                        <Lock size={10} /> Premium
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight mb-6">
                                {prompt.title}
                            </h1>
                            <p className="text-gray-600 font-sans text-lg leading-relaxed border-l-4 border-brand-surface pl-6">
                                {prompt.description}
                            </p>
                        </div>

                        {/* THE PROMPT BOX */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-sm tracking-wider flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Prompt
                                </h3>
                                {!isLocked && (
                                    <button
                                        onClick={handleCopy}
                                        className="text-xs font-mono font-bold hover:underline flex items-center gap-1"
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        {copied ? 'COPIADO' : 'COPIAR AL PORTAPAPELES'}
                                    </button>
                                )}
                            </div>

                            <div className="relative group">
                                {/* Background Box for Aesthetic */}
                                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 rounded-none"></div>

                                {/* Main Content Box */}
                                <div className="relative bg-[#111111] text-gray-300 p-6 md:p-8 font-mono text-sm leading-relaxed min-h-[200px] border border-gray-800">

                                    {/* Premium Logic */}
                                    {isLocked ? (
                                        <>
                                            <div className="blur-sm select-none opacity-50" aria-hidden="true">
                                                {prompt.content || "Lorem ipsum dolor sit amet content hidden..."}
                                            </div>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 text-center p-6">
                                                <Lock size={32} className="text-white mb-4" />
                                                <h3 className="text-white font-bold text-xl mb-2">Contenido Premium</h3>
                                                <p className="text-gray-300 text-xs mb-6 max-w-xs">
                                                    Este prompt está reservado para miembros del banco. Desbloquea acceso completo ahora.
                                                </p>
                                                <Link to="/pricing">
                                                    <button className="bg-white text-black px-6 py-3 font-bold text-sm hover:bg-gray-200 transition-colors tracking-wider">
                                                        Obtener Acceso Pro
                                                    </button>
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        <code className="block whitespace-pre-wrap">
                                            {prompt.content}
                                        </code>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Usage Tips (Placeholder) */}
                        <div className="bg-yellow-50 border border-yellow-200 p-6 text-sm text-yellow-900 font-sans">
                            <p className="font-bold mb-2 flex items-center gap-2">
                                <AlertCircle size={16} /> Consejo de Uso:
                            </p>
                            <p>
                                Asegúrate de reemplazar cualquier texto entre [CORCHETES] con tus propios detalles antes de ejecutar el prompt para obtener los mejores resultados.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptDetail;