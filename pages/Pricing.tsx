import React, { useEffect, useState } from 'react';
import { Check, Zap, ShieldCheck, CreditCard, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Faq from '../components/Faq';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';

const Pricing: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim();
        const initPaddle = () => {
            if (!window.Paddle || !clientToken) return;
            const isSandbox = clientToken.startsWith('test_');
            if (isSandbox) window.Paddle.Environment.set('sandbox');
            window.Paddle.Initialize({ token: clientToken });
            setScriptLoaded(true);
        };

        if (window.Paddle) {
            initPaddle();
            return;
        }
        const script = document.createElement('script');
        script.id = 'paddle-js-sdk';
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

        const priceId = import.meta.env.VITE_PADDLE_PRICE_ID?.trim();

        window.Paddle.Checkout.open({
            settings: {
                displayMode: "overlay",
                theme: "light",
                locale: "es",
                successUrl: `${window.location.origin}/payment-success`
            },
            items: [{ priceId: priceId, quantity: 1 }],
            customer: { email: user.email },
            customData: { supabase_user_id: String(user.id) }
        });
    };

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-zinc-900 selection:text-white">
            <Helmet>
                <title>Precios | alpackaai</title>
            </Helmet>

            {/* HERO SECTION */}
            <div className="pt-32 pb-20 text-center max-w-3xl mx-auto px-6">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-zinc-900 mb-8 leading-[0.85] lowercase">
                    un plan. <br /> <span className="text-zinc-400">acceso total.</span>
                </h1>
                <p className="text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed lowercase">
                    olvida los créditos y las suscripciones costosas. desbloquea todo el banco de prompts por lo que cuesta un café al mes.
                </p>
            </div>

            {/* PRICING CARD */}
            <section className="pb-32 px-6">
                <div className="max-w-[400px] mx-auto relative">
                    {/* Sutil glow de fondo */}
                    <div className="absolute -inset-4 bg-zinc-100/50 rounded-[40px] blur-2xl -z-10" />

                    <div className="bg-white border border-zinc-200 rounded-[32px] p-10 shadow-sm transition-all hover:border-zinc-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="font-bold text-zinc-900 lowercase text-xl">Membresía Pro</h3>
                                <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest mt-1">Full Access</p>
                            </div>
                            <span className="bg-zinc-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                                Popular
                            </span>
                        </div>

                        <div className="mb-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-6xl font-black tracking-tighter text-zinc-900">$3.90</span>
                                <span className="text-zinc-400 font-medium lowercase">/mes</span>
                            </div>
                            <p className="text-zinc-400 text-xs mt-4 lowercase">facturación mensual. cancela cuando quieras sin dramas.</p>
                        </div>

                        <ul className="space-y-5 mb-10">
                            {[
                                'Acceso ilimitado a 1.2M+ prompts',
                                'Actualizaciones diarias',
                                'Uso comercial incluido',
                                'Búsqueda técnica avanzada',
                                'Soporte prioritario'
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-zinc-600">
                                    <div className="w-5 h-5 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                        <Check size={12} className="text-zinc-900" strokeWidth={3} />
                                    </div>
                                    <span className="font-medium lowercase">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={handleJoinClick}
                            disabled={isSubscribed}
                            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isSubscribed
                                ? 'bg-emerald-50 text-emerald-600 cursor-default'
                                : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]'
                                }`}
                        >
                            {isSubscribed ? (
                                <><Check size={18} strokeWidth={3} /> Plan Actual</>
                            ) : (
                                <><Zap size={16} fill="currentColor" /> {user ? 'Suscribirse ahora' : 'Unirse al banco'}</>
                            )}
                        </button>
                    </div>
                </div>
            </section>

            {/* TRUST PROPS */}
            <section className="py-24 border-t border-zinc-100">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
                    <div className="text-center md:text-left">
                        <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center mb-4 mx-auto md:mx-0">
                            <ShieldCheck size={20} className="text-zinc-900" />
                        </div>
                        <h4 className="font-bold text-zinc-900 lowercase mb-2">Sin tasas ocultas</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed lowercase font-medium">El precio es final. Sin créditos, sin recargas, sin sorpresas en tu factura.</p>
                    </div>
                    <div className="text-center md:text-left">
                        <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center mb-4 mx-auto md:mx-0">
                            <Clock size={20} className="text-zinc-900" />
                        </div>
                        <h4 className="font-bold text-zinc-900 lowercase mb-2">Flexibilidad total</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed lowercase font-medium">Cancela con un clic. Mantienes el acceso hasta que termine tu periodo.</p>
                    </div>
                    <div className="text-center md:text-left">
                        <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center mb-4 mx-auto md:mx-0">
                            <Zap size={20} className="text-zinc-900" />
                        </div>
                        <h4 className="font-bold text-zinc-900 lowercase mb-2">Pago seguro</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed lowercase font-medium">Checkout encriptado vía Paddle. Tus datos nunca tocan nuestros servidores.</p>
                    </div>
                </div>
            </section>

            <Faq />
        </div>
    );
};

export default Pricing;