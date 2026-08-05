import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles, Zap, Wand2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
    BG, BG_WARM, TEXT, TEXT_MED, TEXT_DIM, BORDER, YELLOW, GREEN, FONT,
    useEuclidFont, LandingStyles,
} from '../components/landingKit';

const REDIRECT_SECONDS = 7;

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEuclidFont();

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
        { icon: Zap, color: '#c98200', bg: '#fff7e8', bd: '#fbe3b0', text: 'Acceso ilimitado a +1.000 prompts' },
        { icon: Wand2, color: '#8b5cf6', bg: '#f7f2ff', bd: '#e2d5fb', text: 'Generador con IA — 10 prompts al día' },
        { icon: Sparkles, color: GREEN, bg: '#eefbf2', bd: '#c3ecd1', text: 'Prompts nuevos cada semana, incluidos' },
    ];

    return (
        <div
            className="bp-scope flex min-h-screen items-center justify-center px-5 py-16"
            style={{ backgroundColor: BG, color: TEXT, fontFamily: FONT }}
        >
            <LandingStyles />

            <div className="bp-up w-full" style={{ maxWidth: 480 }}>
                <div
                    className="text-center"
                    style={{
                        backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 22,
                        padding: '38px 32px', boxShadow: '0 14px 44px rgba(0,0,0,0.06)',
                    }}
                >
                    {/* Icono */}
                    <div className="mb-7 flex justify-center">
                        <div
                            style={{
                                width: 68, height: 68, borderRadius: 22,
                                backgroundColor: '#eefbf2', border: '1px solid #c3ecd1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <CheckCircle size={32} strokeWidth={2} style={{ color: GREEN }} />
                        </div>
                    </div>

                    <h1 style={{ fontWeight: 600, fontSize: 28, letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: 12 }}>
                        ¡Ya eres premium!
                    </h1>
                    <p style={{ color: TEXT_MED, fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                        Tu suscripción está activa. Bienvenido al banco de prompts más completo en español.
                    </p>

                    {/* Estado de verificación */}
                    {isVerifying && (
                        <div className="mb-6 flex items-center justify-center gap-2" style={{ fontSize: 13, color: TEXT_DIM }}>
                            <Loader2 size={13} className="animate-spin" />
                            Verificando suscripción…
                        </div>
                    )}
                    {!isVerifying && isConfirmed && (
                        <div
                            className="mx-auto mb-6 flex w-fit items-center gap-2"
                            style={{
                                backgroundColor: '#eefbf2', border: '1px solid #c3ecd1', borderRadius: 100,
                                padding: '6px 14px', fontSize: 12.5, fontWeight: 600, color: GREEN,
                            }}
                        >
                            <CheckCircle size={13} /> Suscripción confirmada
                        </div>
                    )}

                    {/* Beneficios */}
                    <div className="mb-8 flex flex-col gap-2.5 text-left">
                        {perks.map(({ icon: Icon, color, bg, bd, text }, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3"
                                style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 13, padding: '12px 14px' }}
                            >
                                <span
                                    style={{
                                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                        backgroundColor: bg, border: `1px solid ${bd}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <Icon size={15} style={{ color }} />
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{text}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                            backgroundColor: YELLOW, border: 'none', borderRadius: 12,
                            padding: '15px 24px', fontSize: 15.5, fontWeight: 600, color: '#1a1500', cursor: 'pointer',
                        }}
                    >
                        Ir a mi cuenta <ArrowRight size={16} />
                    </button>

                    <p style={{ fontSize: 12.5, color: TEXT_DIM, marginTop: 16 }}>
                        Redirigiendo en <strong style={{ color: TEXT, fontWeight: 600 }}>{countdown}s</strong>…
                    </p>
                </div>

                <p className="text-center" style={{ fontSize: 12.5, color: TEXT_DIM, marginTop: 20 }}>
                    ¿Algún problema? Escríbenos a{' '}
                    <a href="mailto:soporte@alpackaai.xyz" style={{ color: TEXT_MED, textDecoration: 'underline' }}>
                        soporte@alpackaai.xyz
                    </a>
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;
