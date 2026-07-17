import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, ChevronDown } from 'lucide-react';
import type { CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events';
import { supabase } from '../lib/supabase';
import { loadPaddle, onPaddleEvent, formatMoney } from '../lib/paddle';

const FEATURES = [
    'Acceso ilimitado a más de 500 prompts',
    'Actualizaciones semanales',
    'Guarda tus prompts favoritos',
    'Cancela cuando quieras',
];

type Status = 'loading' | 'ready' | 'subscribed' | 'error';

const LineSkeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-16' }) => (
    <span className={`inline-block animate-pulse rounded bg-secondary ${className}`} />
);

// Fila del resumen: muestra skeleton hasta que llegan los totales de Paddle
const SummaryRow: React.FC<{ label: string; value?: number; currency?: string; strong?: boolean }> = ({
    label, value, currency, strong = false,
}) => (
    <div className="flex items-center justify-between text-sm">
        <span className={strong ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
        {value !== undefined
            ? <span className={strong ? 'font-medium' : ''}>{formatMoney(value, currency)}</span>
            : <LineSkeleton />}
    </div>
);

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<Status>('loading');
    const [checkoutData, setCheckoutData] = useState<CheckoutEventsData | null>(null);
    const openedRef = useRef(false);

    useEffect(() => {
        document.title = 'Completa tu suscripción | Alpacka';
        return () => { document.title = 'Banco de Prompts de IA · +1.000 prompts para ChatGPT, Claude y Gemini | Alpacka'; };
    }, []);

    // Eventos del checkout: totales en vivo para el resumen + redirección al pagar
    useEffect(() => {
        const off = onPaddleEvent(event => {
            if (event?.data) setCheckoutData(event.data as CheckoutEventsData);
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
                        variant: 'one-page',
                        frameTarget: 'paddle-checkout-frame',
                        frameInitialHeight: 450,
                        frameStyle: 'width: 100%; min-width: 286px; background-color: transparent; border: none;',
                        theme: 'light',
                        locale: 'es',
                        allowLogout: false,
                        successUrl: `${window.location.origin}/payment-success`,
                    },
                    items: [{ priceId: import.meta.env.VITE_PADDLE_PRICE_ID?.trim(), quantity: 1 }],
                    customer: { email: user.email! },
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
            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center font-space text-foreground">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check size={26} strokeWidth={2.5} />
                </div>
                <h1 className="mb-3 text-2xl font-medium tracking-tight">Ya eres premium</h1>
                <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Tu suscripción está activa: tienes acceso completo al banco de prompts.
                </p>
                <Link
                    to="/prompts"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                    Ir a los prompts
                </Link>
            </div>
        );
    }

    const totals = checkoutData?.totals;
    const currency = checkoutData?.currency_code;
    const priceName = checkoutData?.items?.[0]?.price_name ?? 'Alpacka Premium';
    const recurringTotal = checkoutData?.recurring_totals?.total;

    const lineItems = (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium">{priceName}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Banco completo de prompts para ChatGPT, Claude y Gemini.
                    </p>
                </div>
            </div>
            <ul className="space-y-2.5">
                {FEATURES.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <Check size={13} className="flex-shrink-0 text-accent" strokeWidth={2.5} />
                        {f}
                    </li>
                ))}
            </ul>
            <div className="space-y-3 border-t border-border/60 pt-4">
                <SummaryRow label="Subtotal" value={totals?.subtotal} currency={currency} />
                <SummaryRow label="Impuestos" value={totals?.tax} currency={currency} />
                <div className="border-t border-border/60 pt-3">
                    <SummaryRow label="Total a pagar hoy" value={totals?.total} currency={currency} strong />
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid min-h-screen grid-cols-1 font-space md:grid-cols-2">

            {/* ══ Panel izquierdo: marca + resumen en vivo (estilo Stripe) ══ */}
            <div className="flex flex-col bg-background px-6 py-8 text-foreground sm:px-10 md:min-h-screen md:py-12">
                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col md:ml-auto md:mr-16">

                    {/* Volver + logo */}
                    <Link
                        to="/pricing"
                        className="group mb-10 inline-flex items-center gap-3 text-foreground transition-opacity hover:opacity-80"
                    >
                        <ArrowLeft size={16} className="text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
                        <span className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium">A</span>
                            <span className="text-sm font-medium">Alpacka.ai</span>
                        </span>
                    </Link>

                    <div className="animate-fade-up">
                        <p className="mb-2 text-sm text-muted-foreground">Suscríbete a {priceName}</p>

                        {/* Total en vivo (con impuestos del país del cliente) */}
                        {totals?.total !== undefined ? (
                            <div className="mb-1 flex items-baseline gap-2">
                                <span className="text-5xl font-medium tracking-tight">{formatMoney(totals.total, currency)}</span>
                                <span className="text-sm leading-tight text-muted-foreground">al<br />mes</span>
                            </div>
                        ) : (
                            <LineSkeleton className="mb-1 h-12 w-48" />
                        )}
                        {recurringTotal !== undefined ? (
                            <p className="mb-8 text-xs text-muted-foreground">
                                Luego {formatMoney(recurringTotal, currency)} cada mes, impuestos incluidos · Sin permanencia
                            </p>
                        ) : (
                            <LineSkeleton className="mb-8 h-3 w-56" />
                        )}

                        {/* Detalle: visible en desktop, plegable en móvil (patrón del starter kit) */}
                        <div className="hidden border-t border-border/60 pt-6 md:block">
                            {lineItems}
                        </div>
                        <details className="group border-t border-border/60 pt-4 md:hidden">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-muted-foreground [&::-webkit-details-marker]:hidden">
                                Resumen del pedido
                                <ChevronDown size={15} className="transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="pt-4">{lineItems}</div>
                        </details>
                    </div>

                    {/* Footer del panel (abajo del todo, como Stripe) */}
                    <div className="mt-auto hidden pt-10 md:block">
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
                            <span>Pagos procesados por Paddle</span>
                            <span className="h-3 w-px bg-border" />
                            <Link to="/terms" className="transition-colors hover:text-muted-foreground">Términos</Link>
                            <Link to="/privacy" className="transition-colors hover:text-muted-foreground">Privacidad</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ Panel derecho: formulario de pago (blanco, estilo Stripe) ══ */}
            <div className="bg-white px-6 py-10 sm:px-10 md:min-h-screen md:py-12">
                <div className="mx-auto w-full max-w-sm md:ml-16 md:mr-auto">

                    <p className="mb-6 text-sm font-semibold text-gray-800">Datos de pago</p>

                    {status === 'error' ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
                            <p className="text-sm text-gray-500">
                                No pudimos cargar el formulario de pago. Revisa tu conexión (o desactiva el bloqueador de anuncios) e inténtalo de nuevo.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : (
                        <>
                            {status === 'loading' && (
                                <div className="space-y-4">
                                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                                    <div className="h-11 w-full animate-pulse rounded-lg bg-gray-100" />
                                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                                    <div className="h-11 w-full animate-pulse rounded-lg bg-gray-100" />
                                    <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100" />
                                    <div className="h-11 w-full animate-pulse rounded-lg bg-gray-200" />
                                </div>
                            )}
                            {/* Paddle monta aquí su frame (frameTarget) */}
                            <div className="paddle-checkout-frame" />
                        </>
                    )}

                    {/* Footer móvil (en desktop va en el panel izquierdo) */}
                    <div className="mt-10 flex items-center justify-center gap-3 text-[11px] text-gray-400 md:hidden">
                        <span>Pagos procesados por Paddle</span>
                        <span className="h-3 w-px bg-gray-200" />
                        <Link to="/terms" className="hover:text-gray-500">Términos</Link>
                        <Link to="/privacy" className="hover:text-gray-500">Privacidad</Link>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Checkout;
