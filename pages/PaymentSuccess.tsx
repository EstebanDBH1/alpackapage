import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles, Zap, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';

const REDIRECT_SECONDS = 7;

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 5;
        let timeoutId: ReturnType<typeof setTimeout>;

        const checkSubscription = async (userId: string) => {
            const { data: sub } = await supabase
                .from('subscriptions')
                .select('subscription_status')
                .eq('customer_id', userId)
                .single();

            if (sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing')) {
                setIsConfirmed(true);
                setIsVerifying(false);
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    // Reintenta cada 2 segundos esperando que el webhook de Paddle llegue
                    timeoutId = setTimeout(() => checkSubscription(userId), 2000);
                } else {
                    setIsVerifying(false);
                }
            }
        };

        const init = async () => {
            // getSession() lee la sesión LOCAL (sin llamada al servidor), evita 403
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setIsVerifying(false);
                return;
            }
            checkSubscription(session.user.id);
        };

        init();

        return () => clearTimeout(timeoutId);
    }, []);

    // Countdown y redirección automática
    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    navigate('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [navigate]);

    const perks = [
        { icon: Zap, text: 'Acceso ilimitado a 1.2M+ prompts' },
        { icon: BookOpen, text: 'Actualizaciones diarias de contenido' },
        { icon: Sparkles, text: 'Uso comercial incluido' },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-20">
            <Helmet>
                <title>¡Suscripción activada! | alpackaai</title>
            </Helmet>

            <div className="max-w-lg w-full">
                {/* Card principal */}
                <div className="bg-white border border-zinc-200 rounded-[32px] p-10 shadow-sm text-center">

                    {/* Icono animado */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center">
                                <CheckCircle size={36} className="text-white" strokeWidth={2} />
                            </div>
                            <span className="absolute inset-0 rounded-full bg-zinc-900 animate-ping opacity-10" />
                        </div>
                    </div>

                    {/* Título */}
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-3 lowercase">
                        ¡ya eres premium!
                    </h1>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-8 lowercase">
                        tu suscripción está activa. bienvenido al banco de prompts más completo en español.
                    </p>

                    {/* Estado de verificación */}
                    {isVerifying && (
                        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 mb-6 font-mono">
                            <Loader2 size={12} className="animate-spin" />
                            verificando suscripción...
                        </div>
                    )}
                    {!isVerifying && isConfirmed && (
                        <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 mb-6 font-mono bg-emerald-50 rounded-xl py-2 px-4">
                            <CheckCircle size={12} />
                            suscripción confirmada
                        </div>
                    )}

                    {/* Perks */}
                    <ul className="space-y-3 mb-10 text-left">
                        {perks.map(({ icon: Icon, text }, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-zinc-600">
                                <div className="w-8 h-8 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Icon size={14} className="text-zinc-900" />
                                </div>
                                <span className="font-medium lowercase">{text}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Botón CTA */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        Ir al Dashboard <ArrowRight size={16} />
                    </button>

                    {/* Countdown */}
                    <p className="text-xs text-zinc-400 mt-5 font-mono">
                        redirigiendo en <span className="font-bold text-zinc-600">{countdown}s</span>...
                    </p>
                </div>

                <p className="text-center text-xs text-zinc-400 mt-6 font-mono lowercase">
                    ¿algún problema? escríbenos a{' '}
                    <a href="mailto:soporte@alpackaai.xyz" className="underline hover:text-zinc-600 transition-colors">
                        soporte@alpackaai.xyz
                    </a>
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;