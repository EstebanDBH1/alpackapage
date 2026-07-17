import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Shield, ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadPaddle, onPaddleEvent } from '../lib/paddle';

const FEATURES = [
    'Acceso ilimitado a más de 500 prompts',
    'Actualizaciones semanales con los últimos modelos',
    'Búsqueda avanzada por categoría',
    'Guarda tus prompts favoritos',
    'Cancela cuando quieras, sin ataduras',
];

type Status = 'loading' | 'ready' | 'subscribed' | 'error';

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<Status>('loading');
    const openedRef = useRef(false);

    useEffect(() => {
        document.title = 'Completa tu suscripción | Alpacka';
        return () => { document.title = 'Banco de Prompts de IA · +1.000 prompts para ChatGPT, Claude y Gemini | Alpacka'; };
    }, []);

    // Al completarse el pago, Paddle emite checkout.completed: pequeña pausa
    // para que el cliente vea la confirmación del frame y redirigimos.
    useEffect(() => {
        const off = onPaddleEvent(event => {
            if (event?.name === 'checkout.completed') {
                setTimeout(() => navigate('/payment-success'), 1500);
            }
        });
        return off;
    }, [navigate]);

    useEffect(() => {
        let cancelled = false;

        const start = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) {
                navigate('/login?redirect=/checkout');
                return;
            }

            const { data: sub } = await supabase
                .from('subscriptions')
                .select('subscription_status')
                .eq('customer_id', user.id)
                .maybeSingle();
            if (cancelled) return;
            if (sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing')) {
                setStatus('subscribed');
                return;
            }

            try {
                const paddle = await loadPaddle();
                if (cancelled || openedRef.current) return;
                openedRef.current = true;
                setStatus('ready');
                paddle.Checkout.open({
                    settings: {
                        displayMode: 'inline',
                        frameTarget: 'paddle-checkout-frame',
                        frameInitialHeight: '450',
                        frameStyle: 'width: 100%; min-width: 286px; background-color: transparent; border: none;',
                        variant: 'one-page',
                        theme: 'dark',
                        locale: 'es',
                        successUrl: `${window.location.origin}/payment-success`,
                    },
                    items: [{ priceId: import.meta.env.VITE_PADDLE_PRICE_ID?.trim(), quantity: 1 }],
                    customer: { email: user.email },
                    customData: { supabase_user_id: String(user.id) },
                });
            } catch (err) {
                console.error('Error cargando el checkout:', err);
                if (!cancelled) setStatus('error');
            }
        };

        start();
        return () => { cancelled = true; };
    }, [navigate]);

    if (status === 'subscribed') {
        return (
            <div className="relative min-h-[70vh] overflow-x-clip bg-background bg-radial-glow font-space text-foreground">
                <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>
                <div className="animate-fade-up relative mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check size={26} strokeWidth={2.5} />
                    </div>
                    <h1 className="mb-3 text-2xl font-medium tracking-tight">Ya eres premium</h1>
                    <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                        Tu suscripción está activa: tienes acceso completo al banco de prompts.
                    </p>
                    <Link
                        to="/prompts"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                    >
                        Ir a los prompts
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-x-clip bg-background bg-radial-glow font-space text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

            <div className="animate-fade-up relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-8 md:py-16">

                <Link
                    to="/pricing"
                    className="mb-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft size={13} />
                    Volver a precios
                </Link>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1.15fr]">

                    {/* ── Resumen del pedido ─────────────────────────── */}
                    <div className="rounded-2xl border border-border/70 bg-card p-7 lg:sticky lg:top-24">
                        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-border/60 bg-secondary/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]"></span>
                            <span>Membresía Premium</span>
                        </div>

                        <div className="mb-6 flex items-baseline gap-2">
                            <span className="text-5xl font-medium tracking-tight">$4</span>
                            <span className="text-sm text-muted-foreground">USD / mes</span>
                        </div>

                        <ul className="mb-8 space-y-3">
                            {FEATURES.map(f => (
                                <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <Check size={15} className="mt-0.5 flex-shrink-0 text-accent" strokeWidth={2.5} />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-3 border-t border-border/60 pt-5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Shield size={13} className="flex-shrink-0" />
                                Cancela con un clic desde tu panel, cuando quieras.
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock size={13} className="flex-shrink-0" />
                                Pago procesado por Paddle. Tus datos nunca tocan nuestros servidores.
                            </div>
                        </div>
                    </div>

                    {/* ── Checkout embebido ──────────────────────────── */}
                    <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-6">
                        {status === 'error' ? (
                            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
                                <p className="text-sm text-muted-foreground">
                                    No pudimos cargar el formulario de pago. Revisa tu conexión (o desactiva el bloqueador de anuncios) e inténtalo de nuevo.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="rounded-full border border-border bg-secondary px-6 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/40"
                                >
                                    Reintentar
                                </button>
                            </div>
                        ) : (
                            <>
                                {status === 'loading' && (
                                    <div className="space-y-4 p-2">
                                        <div className="h-5 w-40 animate-pulse rounded bg-secondary" />
                                        <div className="h-11 w-full animate-pulse rounded-lg bg-secondary" />
                                        <div className="h-11 w-full animate-pulse rounded-lg bg-secondary" />
                                        <div className="h-28 w-full animate-pulse rounded-lg bg-secondary" />
                                        <div className="h-11 w-full animate-pulse rounded-lg bg-secondary" />
                                    </div>
                                )}
                                {/* Paddle monta aquí su frame (frameTarget) */}
                                <div className="paddle-checkout-frame" />
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
