import React, { useEffect, useState } from 'react';
import { Check, Zap, ShieldCheck, Clock, Sparkles, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PricingCard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const handleJoinClick = () => {
        if (isSubscribed) return;
        if (!user) return navigate('/login?redirect=/pricing');
        if (!scriptLoaded || !window.Paddle) return;
        setLoading(true);

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
            eventCallback: () => setLoading(false),
        });
    };

    const features = [
        'acceso ilimitado a 1,200+ prompts',
        'actualizaciones semanales garantizadas',
        'uso comercial incluido',
        'búsqueda avanzada por categoría',
        'guarda tus prompts favoritos',
        'soporte prioritario 24/7',
    ];

    return (
        <section className="py-24 bg-zinc-50 relative overflow-hidden">
            {/* BG decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Section header */}
                <div className="text-center mb-14">
                    <span className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-500 tracking-[0.2em] uppercase mb-4">
                        <Star size={11} className="fill-yellow-400 text-yellow-400" />
                        precio único — sin sorpresas
                        <Star size={11} className="fill-yellow-400 text-yellow-400" />
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-zinc-900 mb-4 leading-tight">
                        todo el banco. <span className="text-zinc-400">un solo precio.</span>
                    </h2>
                    <p className="text-base text-zinc-500 font-sans max-w-md mx-auto">
                        invierte menos que un café al mes y ahorra horas de trabajo cada día.
                    </p>
                </div>

                {/* Card + Social proof layout */}
                <div className="flex flex-col lg:flex-row items-center gap-12 justify-center">

                    {/* Pricing Card */}
                    <div className="relative w-full max-w-[380px]">
                        {/* Glow */}
                        <div className="absolute -inset-6 bg-gradient-to-b from-zinc-200/60 to-transparent rounded-[48px] blur-3xl -z-10"></div>

                        <div className="bg-white border border-zinc-200 rounded-[32px] p-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            {/* Badge */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="font-bold text-zinc-900 text-xl">membresía pro</h3>
                                    <p className="text-zinc-400 text-xs font-mono tracking-widest mt-1">full access</p>
                                </div>
                                <span className="bg-zinc-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider flex items-center gap-1">
                                    <Sparkles size={9} className="text-yellow-400" />
                                    popular
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[64px] font-black tracking-tighter text-zinc-900 leading-none">$3.90</span>
                                    <span className="text-zinc-400 font-medium text-sm">/mes</span>
                                </div>
                                <p className="text-zinc-400 text-xs mt-3">facturación mensual. cancela cuando quieras.</p>
                            </div>

                            {/* Features */}
                            <ul className="space-y-4 mb-10">
                                {features.map((feat, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-600">
                                        <div className="w-5 h-5 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                            <Check size={11} className="text-zinc-900" strokeWidth={3} />
                                        </div>
                                        <span className="font-medium">{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <button
                                onClick={handleJoinClick}
                                disabled={isSubscribed || loading}
                                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isSubscribed
                                    ? 'bg-emerald-50 text-emerald-600 cursor-default'
                                    : 'bg-zinc-900 text-white hover:bg-black active:scale-[0.98] shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {isSubscribed ? (
                                    <><Check size={16} strokeWidth={3} /> plan activo</>
                                ) : loading ? (
                                    <span className="opacity-70">cargando...</span>
                                ) : (
                                    <><Zap size={16} fill="currentColor" /> {user ? 'suscribirse ahora' : 'hazte premium'} <ArrowRight size={14} className="ml-1" /></>
                                )}
                            </button>

                            {/* Micro trust */}
                            <p className="text-center text-[10px] font-mono text-zinc-400 mt-4 tracking-wider">
                                pago seguro vía paddle · ssl 256-bit
                            </p>
                        </div>
                    </div>

                    {/* Right side: trust props */}
                    <div className="w-full max-w-sm space-y-6">

                        <div className="flex gap-4 p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center shrink-0 border border-zinc-100">
                                <ShieldCheck size={18} className="text-zinc-700" />
                            </div>
                            <div>
                                <h4 className="font-bold text-zinc-900 text-sm mb-1">sin tasas ocultas</h4>
                                <p className="text-zinc-500 text-xs leading-relaxed">el precio es final. sin créditos ni recargas. siempre $3.90.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center shrink-0 border border-zinc-100">
                                <Clock size={18} className="text-zinc-700" />
                            </div>
                            <div>
                                <h4 className="font-bold text-zinc-900 text-sm mb-1">cancela en un clic</h4>
                                <p className="text-zinc-500 text-xs leading-relaxed">sin burocracia. mantienes el acceso hasta que termine tu periodo.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center shrink-0 border border-zinc-100">
                                <Zap size={18} className="text-zinc-700" />
                            </div>
                            <div>
                                <h4 className="font-bold text-zinc-900 text-sm mb-1">acceso inmediato</h4>
                                <p className="text-zinc-500 text-xs leading-relaxed">en segundos desbloqueas todo el banco. sin esperas, sin validaciones.</p>
                            </div>
                        </div>

                        {/* ROI calculation */}
                        <div className="p-5 bg-zinc-900 rounded-2xl text-white">
                            <p className="text-[10px] font-mono text-zinc-400 tracking-widest mb-2">calcula tu roi</p>
                            <p className="text-sm font-semibold leading-relaxed">
                                si ahorras <span className="text-yellow-400 font-bold">2 horas/semana</span> en prompts,
                                alpackaai te cuesta <span className="text-yellow-400 font-bold">$0.09/hora</span> de tiempo recuperado.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingCard;
