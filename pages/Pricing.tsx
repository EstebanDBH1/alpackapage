import React, { useEffect, useState } from 'react';
import { Check, Zap, ShieldCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
        if (window.Paddle) { initPaddle(); return; }
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
            settings: { displayMode: "overlay", theme: "light", locale: "es", successUrl: `${window.location.origin}/payment-success` },
            items: [{ priceId: priceId, quantity: 1 }],
            customer: { email: user.email },
            customData: { supabase_user_id: String(user.id) }
        });
    };

    return (
        <div className="bg-brand-bg min-h-screen font-sans">
            <Helmet>
                <title>Precios | alpackaai</title>
            </Helmet>

            {/* HERO */}
            <div className="pt-24 pb-16 md:pt-32 md:pb-20 max-w-4xl mx-auto px-5 sm:px-6">
                <p className="font-mono text-[10px] text-brand-muted/50 tracking-[0.2em] uppercase mb-5">— precios</p>
                <h1 className="mb-6">
                    <span className="block font-display italic font-light text-4xl sm:text-6xl md:text-7xl text-brand-text leading-[0.9] tracking-tight">
                        un plan.
                    </span>
                    <span className="block font-sans font-black text-4xl sm:text-5xl md:text-6xl text-brand-text leading-[0.92] tracking-tighter">
                        acceso total.
                    </span>
                </h1>
                <p className="text-base md:text-lg text-brand-muted max-w-sm leading-relaxed">
                    Desbloquea todo el banco de prompts por lo que cuesta un café al mes.
                </p>
            </div>

            {/* PRICING CARD */}
            <section className="pb-16 md:pb-24 px-5 sm:px-6">
                <div className="max-w-[400px] mx-auto relative">
                    <div className="absolute -inset-6 bg-brand-border/20 rounded-[44px] blur-3xl -z-10" />
                    <div className="bg-white border border-brand-border rounded-3xl p-10 shadow-xl shadow-[#1A1410]/8">

                        <div className="flex justify-between items-start mb-9">
                            <div>
                                <h3 className="font-bold text-brand-text text-xl mb-1">Membresía Pro</h3>
                                <p className="text-brand-muted text-xs font-mono tracking-[0.15em] uppercase">Full Access</p>
                            </div>
                            <span className="bg-brand-accent text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider">
                                Popular
                            </span>
                        </div>

                        <div className="mb-9 pb-9 border-b border-brand-border">
                            <div className="flex items-start gap-1">
                                <span className="font-medium text-brand-muted text-lg mt-3.5">$</span>
                                <span className="font-black text-[5.5rem] text-brand-text leading-none tracking-tighter">4</span>
                                <span className="font-medium text-brand-muted text-sm mt-auto mb-2">/mes</span>
                            </div>
                            <p className="text-brand-muted text-xs mt-1">facturación mensual · cancela cuando quieras sin dramas.</p>
                        </div>

                        <ul className="space-y-4 mb-9">
                            {['Acceso ilimitado a 100+', 'Actualizaciones diarias', 'Búsqueda técnica avanzada', 'Soporte prioritario'].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3.5 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-brand-accent-light flex items-center justify-center shrink-0">
                                        <Check size={11} className="text-brand-accent" strokeWidth={2.5} />
                                    </div>
                                    <span className="font-medium text-brand-text/80">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={handleJoinClick}
                            disabled={isSubscribed}
                            className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 ${
                                isSubscribed
                                    ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-200'
                                    : 'bg-brand-accent text-white hover:bg-brand-accent-hover active:scale-[0.98] shadow-lg shadow-brand-accent/20'
                            }`}
                        >
                            {isSubscribed ? (
                                <><Check size={15} strokeWidth={2.5} /> Plan Actual</>
                            ) : (
                                <><Zap size={14} fill="currentColor" /> {user ? 'Suscribirse ahora' : 'Unirse al banco'}</>
                            )}
                        </button>

                        <p className="text-center text-[10px] font-mono text-brand-muted/40 mt-4 tracking-widest">
                            pago seguro vía paddle · ssl 256-bit
                        </p>
                    </div>
                </div>
            </section>

            {/* TRUST PROPS */}
            <section className="py-16 md:py-20 border-t border-brand-border bg-white">
                <div className="max-w-4xl mx-auto px-5 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-14">
                    {[
                        { icon: ShieldCheck, title: 'Sin tasas ocultas', desc: 'El precio es final. Sin créditos, sin recargas, sin sorpresas en tu factura.' },
                        { icon: Clock, title: 'Flexibilidad total', desc: 'Cancela con un clic. Mantienes el acceso hasta que termine tu periodo.' },
                        { icon: Zap, title: 'Pago seguro', desc: 'Checkout encriptado vía Paddle. Tus datos nunca tocan nuestros servidores.' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="text-center md:text-left">
                            <div className="w-10 h-10 bg-brand-surface rounded-xl flex items-center justify-center mb-5 mx-auto md:mx-0 border border-brand-border">
                                <Icon size={17} className="text-brand-muted" />
                            </div>
                            <h4 className="font-semibold text-brand-text text-sm mb-2">{title}</h4>
                            <p className="text-sm text-brand-muted leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Faq />
        </div>
    );
};

export default Pricing;
