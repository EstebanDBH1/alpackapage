import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles, Zap, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
        <div className="relative flex min-h-screen items-center justify-center overflow-x-clip bg-background bg-radial-glow px-4 py-20 font-space text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

            <div className="relative w-full max-w-lg">
                <div className="absolute -inset-10 -z-10 rounded-full bg-primary/5 blur-3xl"></div>

                {/* Card principal */}
                <div className="rounded-3xl border border-primary/30 bg-card p-10 text-center shadow-[0_0_80px_oklch(0.86_0.09_90_/_0.08)]">

                    {/* Icono animado */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)]">
                                <CheckCircle size={36} className="text-primary-foreground" strokeWidth={2} />
                            </div>
                            <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-10" />
                        </div>
                    </div>

                    {/* Título */}
                    <h1 className="mb-3 text-3xl font-medium tracking-tight text-foreground">
                        ¡Ya eres premium!
                    </h1>
                    <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                        Tu suscripción está activa. Bienvenido al banco de prompts más completo en español.
                    </p>

                    {/* Estado de verificación */}
                    {isVerifying && (
                        <div className="mb-6 flex items-center justify-center gap-2 font-mono text-xs text-muted-foreground">
                            <Loader2 size={12} className="animate-spin" />
                            verificando suscripción...
                        </div>
                    )}
                    {!isVerifying && isConfirmed && (
                        <div className="mx-auto mb-6 flex w-fit items-center justify-center gap-2 rounded-full border border-accent/40 bg-secondary px-4 py-2 font-mono text-xs text-accent">
                            <CheckCircle size={12} />
                            suscripción confirmada
                        </div>
                    )}

                    {/* Perks */}
                    <ul className="mb-10 space-y-3 text-left">
                        {perks.map(({ icon: Icon, text }, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-foreground/90">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-secondary">
                                    <Icon size={14} className="text-accent" />
                                </div>
                                <span className="font-medium">{text}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Botón CTA */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90 active:scale-[0.98]"
                    >
                        Ir al Dashboard <ArrowRight size={16} />
                    </button>

                    {/* Countdown */}
                    <p className="mt-5 font-mono text-xs text-muted-foreground">
                        redirigiendo en <span className="font-bold text-foreground">{countdown}s</span>...
                    </p>
                </div>

                <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
                    ¿Algún problema? Escríbenos a{' '}
                    <a href="mailto:soporte@alpackaai.xyz" className="underline transition-colors hover:text-foreground">
                        soporte@alpackaai.xyz
                    </a>
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;