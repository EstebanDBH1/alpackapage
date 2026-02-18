import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const checkoutInitialized = useRef(false);

    // 1. Carga Dinámica del Script de Paddle
    useEffect(() => {
        if (window.Paddle) {
            console.log('Paddle already window-assigned');
            setScriptLoaded(true);
            return;
        }

        const scriptId = 'paddle-js-sdk';
        const existingScript = document.getElementById(scriptId);

        if (existingScript) {
            console.log('Script exists, waiting for window.Paddle...');
            const checkPaddle = setInterval(() => {
                if (window.Paddle) {
                    setScriptLoaded(true);
                    clearInterval(checkPaddle);
                }
            }, 100);
            return;
        }

        console.log('Loading Paddle script...');
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.async = true;
        script.onload = () => {
            console.log('Paddle script loaded');
            setScriptLoaded(true);
        };
        script.onerror = (err) => console.error('Failed to load Paddle script', err);
        document.body.appendChild(script);
    }, []);

    // 2. Verificación de Usuario
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                console.log('No user found, redirecting to login');
                navigate('/login?redirect=/checkout');
                return;
            }
            console.log('User authenticated:', user.email);
            setUser(user);
        };
        checkUser();
    }, [navigate]);

    // 3. Inicialización y Apertura del Checkout
    useEffect(() => {
        if (!scriptLoaded || !user || checkoutInitialized.current) {
            console.log('Waiting for deps:', { scriptLoaded, hasUser: !!user, alreadyInit: checkoutInitialized.current });
            return;
        }

        const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim();
        const priceId = import.meta.env.VITE_PADDLE_PRICE_ID?.trim();

        // Auto-detect environment based on token prefix if possible
        const envFromToken = clientToken?.startsWith('test_') ? 'sandbox' : 'production';
        const env = import.meta.env.VITE_PADDLE_ENVIRONMENT || import.meta.env.VITE_PADDLE_ENV || envFromToken;

        console.log('Paddle Config:', { env, hasToken: !!clientToken, hasPrice: !!priceId });

        if (!clientToken || !priceId) {
            console.error('CRITICAL: Paddle client token or price ID is missing in .env');
            return;
        }

        checkoutInitialized.current = true;

        const initializeCheckout = async () => {
            try {
                // Ensure container is ready
                await new Promise(resolve => setTimeout(resolve, 800));

                const container = document.getElementById('paddle-checkout-container');
                if (!container) {
                    console.error('Checkout container NOT found in DOM');
                    checkoutInitialized.current = false;
                    return;
                }

                if (window.Paddle) {
                    console.log('Initializing Paddle with environment:', env);
                    window.Paddle.Environment.set(env);

                    window.Paddle.Initialize({
                        token: clientToken,
                        eventCallback: (event: any) => {
                            console.log('Paddle Event:', event.name, event.data);
                            if (event.name === 'checkout.completed') {
                                navigate('/payment-success');
                            }
                        }
                    });

                    console.log('Opening checkout with priceId:', priceId);

                    const checkoutConfig = {
                        settings: {
                            displayMode: "inline",
                            containerSelector: "#paddle-checkout-container",
                            frameInitialHeight: 450,
                            frameStyle: "width: 100%; min-width: 312px; background-color: transparent; border: none;",
                            successUrl: `${window.location.origin}/payment-success`
                        },
                        items: [
                            {
                                priceId: priceId,
                                quantity: 1
                            }
                        ],
                        customer: {
                            email: user.email
                        },
                        customData: {
                            supabase_user_id: String(user.id)
                        }
                    };

                    window.Paddle.Checkout.open(checkoutConfig);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error during Paddle setup:', error);
                checkoutInitialized.current = false;
                setLoading(false);
            }
        };

        initializeCheckout();
    }, [scriptLoaded, user, navigate]);

    // Loading Screen (mientras carga el usuario o el script inicial)
    if (!user && loading) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-bg pt-24 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left Side: Info & Summary */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-black uppercase">
                                FINALIZAR <br /> SUSCRIPCIÓN.
                            </h1>
                            <p className="font-mono text-gray-500 uppercase tracking-widest text-sm">
                                Estás a un paso de desbloquear el acceso ilimitado a +1.2M prompts.
                            </p>
                        </div>

                        <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="font-bold text-xl mb-6 border-b-2 border-black pb-2 uppercase tracking-tight">Tu Plan</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg">Membresía Pro</span>
                                        <span className="text-xs text-gray-500 font-mono">FACTURACIÓN MENSUAL</span>
                                    </div>
                                    <span className="font-black text-2xl">$3.90</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500 font-mono border-t border-gray-100 pt-4">
                                    <span>Subtotal</span>
                                    <span>$3.90</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500 font-mono">
                                    <span>IVA / Impuestos</span>
                                    <span>Calculado al pagar</span>
                                </div>
                                <div className="flex justify-between items-center text-2xl font-black pt-4 border-t-2 border-black mt-2">
                                    <span>TOTAL</span>
                                    <span className="text-black">$3.90</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                                    <ShieldCheck size={14} className="text-black" />
                                    <span>PROCESADO POR PADDLE (SEGURIDAD BANCARIA)</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                                    <Lock size={14} className="text-black" />
                                    <span>TSL/SSL ENCRYPTED SECURE CONNECTION</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                                    <CreditCard size={14} className="text-black" />
                                    <span>CANCELACIÓN INSTANTÁNEA SIN COMPROMISOS</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#f0f0f0] border border-black/10 p-4 text-[11px] font-mono text-gray-400 uppercase leading-relaxed">
                            Al completar la compra, aceptas nuestros términos de servicio y política de privacidad. Tu suscripción se renovará automáticamente cada mes al precio actual hasta que decidas cancelarla desde tu panel de usuario.
                        </div>
                    </div>

                    {/* Right Side: Paddle Container */}
                    <div className="bg-white border-2 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] min-h-[600px] flex flex-col relative overflow-hidden">
                        <div className="bg-black text-white p-3 font-mono text-[10px] uppercase tracking-[0.2em] flex items-center justify-between">
                            <span>Checkout Seguro</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                            </div>
                        </div>

                        <div className="flex-grow p-4 flex flex-col">
                            <div id="paddle-checkout-container" className="w-full flex-grow">
                                {/* Paddle will inject the checkout here */}
                                {loading && (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 font-mono text-sm py-40">
                                        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        <div className="animate-pulse">Cargando pasarela de pago...</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
