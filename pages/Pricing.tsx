
import React, { useEffect, useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Faq from '../components/Faq';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';

const Pricing: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // 1. Carga Dinámica de Paddle en la página de precios
    useEffect(() => {
        if (window.Paddle) {
            setScriptLoaded(true);
            return;
        }

        const scriptId = 'paddle-js-sdk';
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.async = true;
        script.onload = () => {
            setScriptLoaded(true);
        };
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
                    .single();

                if (sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing')) {
                    setIsSubscribed(true);
                }
            }
        };
        checkUser();
    }, []);

    const handleJoinClick = () => {
        if (isSubscribed) return;

        if (!user) {
            // Regresar a la página de precios después del login para abrir el overlay
            navigate('/login?redirect=/pricing');
            return;
        }

        if (!scriptLoaded || !window.Paddle) {
            alert('Cargando pasarela de pago... Por favor espera un segundo.');
            return;
        }

        const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim();
        const priceId = import.meta.env.VITE_PADDLE_PRICE_ID?.trim();
        const envFromToken = clientToken?.startsWith('test_') ? 'sandbox' : 'production';
        const env = import.meta.env.VITE_PADDLE_ENVIRONMENT || import.meta.env.VITE_PADDLE_ENV || envFromToken;

        window.Paddle.Environment.set(env);
        window.Paddle.Initialize({
            token: clientToken,
            eventCallback: (event: any) => {
                if (event.name === 'checkout.completed') {
                    navigate('/payment-success');
                }
            }
        });

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
        <div className="bg-brand-bg min-h-screen">
            <Helmet>
                <title>Planes y Precios | Alpacka.ai</title>
                <meta name="description" content="Un solo plan. Acceso total. Suscríbete por solo $3.90/mes y obtén acceso ilimitado a nuestra base de datos de prompts." />
                <link rel="canonical" href="https://alpacka.ai/pricing" />
            </Helmet>
            {/* Header */}
            <div className="pt-24 pb-12 text-center max-w-4xl mx-auto px-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-[0.9]">
                    un plan. <br /> poder ilimitado.
                </h1>
                <p className="font-mono text-gray-500 text-sm md:text-base max-w-2xl mx-auto tracking-widest">
                    Deja de pagar por prompt. Desbloquea todo el banco por menos de un café.
                </p>
            </div>

            {/* Pricing Card Section */}
            <section className="pb-24 px-4">
                <div className="max-w-md mx-auto bg-white border-2 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative transition-transform hover:-translate-y-1">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 font-mono text-xs tracking-widest">
                        Más Popular
                    </div>

                    <div className="text-center border-b border-gray-100 pb-8 mb-8">
                        <h3 className="text-xl font-bold mb-2">Membresía Pro</h3>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-black tracking-tighter">$3.90</span>
                            <span className="text-gray-500 font-mono text-sm">/mes</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-4 font-mono">Facturación mensual. Cancela cuando quieras.</p>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {[
                            'Acceso ilimitado a 1.2M+ prompts',
                            'Actualizaciones diarias de base de datos',
                            'Derechos de uso comercial',
                            'Snippets de código "Copiar-Pegar"',
                            'Búsqueda avanzada y filtros',
                            'Soporte prioritario'
                        ].map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="bg-black text-white rounded-full p-0.5 mt-0.5 flex-shrink-0">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="text-sm font-bold text-gray-700">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={handleJoinClick}
                        disabled={isSubscribed}
                        className={`w-full py-4 font-bold text-sm tracking-wider transition-colors flex items-center justify-center gap-2 ${isSubscribed
                            ? 'bg-green-500 text-white cursor-default'
                            : 'bg-brand-text text-brand-bg hover:bg-gray-800'
                            }`}
                    >
                        {isSubscribed ? (
                            <>
                                <Check size={16} strokeWidth={3} />
                                Plan Actual
                            </>
                        ) : (
                            <>
                                <Zap size={16} fill="currentColor" />
                                {user ? 'Suscribirse Ahora' : 'Unirse al Banco'}
                            </>
                        )}
                    </button>
                </div>
            </section>

            {/* Value Props / Guarantee */}
            <section className="py-16 border-t border-brand-surface bg-[#F5F3F1]">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div>
                        <h4 className="font-bold text-lg mb-2">Sin Tasas Ocultas</h4>
                        <p className="text-sm text-gray-500 font-sans px-4">El precio que ves es el precio que pagas. Sin créditos, sin recargas, sin sorpresas.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-2">Cancela Cuando Quieras</h4>
                        <p className="text-sm text-gray-500 font-sans px-4">Cancelación en un clic desde tu panel. Mantén el acceso hasta el final de tu ciclo de facturación.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-2">Pago Seguro</h4>
                        <p className="text-sm text-gray-500 font-sans px-4">Checkout encriptado vía Paddle. Nunca almacenamos los datos de tu tarjeta de crédito.</p>
                    </div>
                </div>
            </section>

            <Faq />
        </div>
    )
}

export default Pricing;