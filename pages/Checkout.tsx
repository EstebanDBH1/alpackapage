import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ArrowLeft, ChevronDown } from 'lucide-react';
import type { CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events';
import { supabase } from '../lib/supabase';
import { hasLibraryAccess } from '../lib/access';
import { loadPaddle, onPaddleEvent, formatMoney } from '../lib/paddle';
import {
    BG, BG_WARM, TEXT, TEXT_MED, TEXT_DIM, BORDER, YELLOW, GREEN, FONT,
    useEuclidFont, LandingStyles,
} from '../components/darkKit';

/* Dos planes sobre el mismo checkout: la mensual y el pago único vitalicio.
   Se elige con `?plan=lifetime`; sin parámetro, mensual (el enlace de siempre
   sigue funcionando igual). */

/* Fallback del precio vitalicio si la env var no está configurada en el build.
   `.env` está en .gitignore, así que sin esto un despliegue en el que falte la
   variable rompería la compra sin avisar. Un price id no es secreto: viaja al
   navegador dentro del bundle de todas formas. La env var, si existe, manda. */
const LIFETIME_PRICE_ID_FALLBACK = 'pri_01m1pta9nh5jh843qe9fb8gf4p';

const MONTHLY_FEATURES = [
    'Acceso ilimitado a más de 1.000 prompts',
    'Generador de prompts con IA — 10 al día',
    'Actualizaciones semanales',
    'Guarda tus prompts favoritos',
    'Cancela cuando quieras',
];

const LIFETIME_FEATURES = [
    'Acceso ilimitado a más de 1.000 prompts',
    'Todas las actualizaciones futuras incluidas',
    'Guarda tus prompts favoritos',
    'Un solo pago — nunca vuelves a pagar',
    'Sin renovaciones ni cancelaciones que gestionar',
];

const PLANS = {
    monthly: {
        priceId: () => import.meta.env.VITE_PADDLE_PRICE_ID?.trim(),
        features: MONTHLY_FEATURES,
        docTitle: 'Completa tu suscripción | Alpacka',
        heading: 'Suscríbete a',
        blurb: 'Banco completo de prompts para ChatGPT, Claude y Gemini.',
        fallbackName: 'Alpacka Premium',
        recurring: true,
    },
    lifetime: {
        priceId: () => import.meta.env.VITE_PADDLE_LIFETIME_PRICE_ID?.trim() || LIFETIME_PRICE_ID_FALLBACK,
        features: LIFETIME_FEATURES,
        docTitle: 'Acceso vitalicio | Alpacka',
        heading: 'Compra',
        blurb: 'Banco completo de prompts para ChatGPT, Claude y Gemini, para siempre.',
        fallbackName: 'Acceso vitalicio',
        recurring: false,
    },
} as const;

type PlanKey = keyof typeof PLANS;

type Status = 'loading' | 'ready' | 'subscribed' | 'error';

const LineSkeleton: React.FC<{ w?: number | string; h?: number }> = ({ w = 64, h = 14 }) => (
    <span
        className="inline-block animate-pulse"
        style={{ width: w, height: h, borderRadius: 6, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }}
    />
);

// Fila del resumen: muestra skeleton hasta que llegan los totales de Paddle
const SummaryRow: React.FC<{ label: string; value?: number; currency?: string; strong?: boolean }> = ({
    label, value, currency, strong = false,
}) => (
    <div className="flex items-center justify-between" style={{ fontSize: 14 }}>
        <span style={{ color: strong ? TEXT : TEXT_MED, fontWeight: strong ? 600 : 400 }}>{label}</span>
        {value !== undefined
            ? <span style={{ color: TEXT, fontWeight: strong ? 600 : 500 }}>{formatMoney(value, currency)}</span>
            : <LineSkeleton />}
    </div>
);

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<Status>('loading');
    const [checkoutData, setCheckoutData] = useState<CheckoutEventsData | null>(null);
    const openedRef = useRef(false);

    const planKey: PlanKey = searchParams.get('plan') === 'lifetime' ? 'lifetime' : 'monthly';
    const plan = PLANS[planKey];

    useEuclidFont();

    useEffect(() => {
        document.title = plan.docTitle;
        return () => { document.title = 'Banco de Prompts de IA · +1.000 prompts para ChatGPT, Claude y Gemini | Alpacka'; };
    }, [plan.docTitle]);

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
                navigate(`/login?redirect=${encodeURIComponent(`/checkout?plan=${planKey}`)}`);
                return;
            }

            const { data: sub } = await supabase
                .from('subscriptions')
                .select('subscription_status')
                .eq('customer_id', user.id)
                .maybeSingle();
            if (cancelled) return;
            if (hasLibraryAccess(sub?.subscription_status)) {
                setStatus('subscribed');
                return;
            }

            const priceId = plan.priceId();
            if (!priceId) {
                console.error(`Falta el price id de Paddle para el plan "${planKey}"`);
                setStatus('error');
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
                        // La página es oscura: sin esto el frame de Paddle se monta
                        // en blanco y queda como un bloque luminoso sobre el negro.
                        theme: 'dark',
                        locale: 'es',
                        allowLogout: false,
                        successUrl: `${window.location.origin}/payment-success`,
                    },
                    items: [{ priceId, quantity: 1 }],
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
    }, [navigate, planKey, plan]);

    if (status === 'subscribed') {
        return (
            <div
                className="bp-scope flex min-h-screen flex-col items-center justify-center px-6 text-center"
                style={{ backgroundColor: BG, color: TEXT, fontFamily: FONT }}
            >
                <LandingStyles />
                <div className="bp-up flex flex-col items-center">
                    <div
                        style={{
                            width: 56, height: 56, borderRadius: 18, marginBottom: 22,
                            backgroundColor: 'rgba(63,207,142,0.1)', border: '1px solid rgba(63,207,142,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <Check size={24} strokeWidth={3} style={{ color: GREEN }} />
                    </div>
                    <h1 style={{ fontWeight: 600, fontSize: 26, letterSpacing: '-0.03em', marginBottom: 10 }}>Ya eres premium</h1>
                    <p style={{ color: TEXT_MED, fontSize: 15, lineHeight: 1.7, maxWidth: 380, marginBottom: 28 }}>
                        Tu acceso está activo: ya tienes el banco de prompts completo. No hace falta que pagues de nuevo.
                    </p>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                            backgroundColor: YELLOW, color: '#1a1500', fontWeight: 700, fontSize: 14.5,
                            padding: '14px 28px', borderRadius: 10, textDecoration: 'none',
                        }}
                    >
                        Ir a los prompts
                    </Link>
                </div>
            </div>
        );
    }

    const totals = checkoutData?.totals;
    const currency = checkoutData?.currency_code;
    const priceName = checkoutData?.items?.[0]?.price_name ?? plan.fallbackName;
    const recurringTotal = checkoutData?.recurring_totals?.total;

    const lineItems = (
        <div className="space-y-4">
            <div>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: TEXT }}>{priceName}</p>
                <p style={{ fontSize: 13, color: TEXT_MED, lineHeight: 1.6, marginTop: 4 }}>
                    {plan.blurb}
                </p>
            </div>

            <div className="flex flex-col gap-2">
                {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2.5">
                        <Check size={12} strokeWidth={3} style={{ color: GREEN, flexShrink: 0, marginTop: 3 }} />
                        <span style={{ fontSize: 13, color: TEXT_MED, lineHeight: 1.5 }}>{f}</span>
                    </div>
                ))}
            </div>

            <div className="space-y-3" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
                <SummaryRow label="Subtotal" value={totals?.subtotal} currency={currency} />
                <SummaryRow label="Impuestos" value={totals?.tax} currency={currency} />
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
                    <SummaryRow label="Total a pagar hoy" value={totals?.total} currency={currency} strong />
                </div>
            </div>
        </div>
    );

    const legal = (
        <>
            <span>Pagos procesados por Paddle</span>
            <span style={{ width: 1, height: 12, backgroundColor: BORDER }} />
            <Link to="/terms" style={{ color: TEXT_DIM, textDecoration: 'none' }}>Términos</Link>
            <Link to="/privacy" style={{ color: TEXT_DIM, textDecoration: 'none' }}>Privacidad</Link>
        </>
    );

    return (
        <div className="bp-scope" style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: FONT }}>
            <LandingStyles />

            <div className="mx-auto w-full max-w-5xl px-5 sm:px-8 py-8 md:py-12">

                {/* Volver + logo */}
                <Link
                    to="/pricing"
                    className="inline-flex items-center gap-3 mb-9"
                    style={{ textDecoration: 'none', color: TEXT_MED }}
                >
                    <ArrowLeft size={16} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>alpacka.ai</span>
                </Link>

                <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_1.15fr] md:gap-12">

                    {/* ══ Resumen del pedido (en vivo) ══ */}
                    <div className="bp-up md:sticky" style={{ top: 24 }}>
                        <p style={{ fontSize: 14, color: TEXT_MED, marginBottom: 8 }}>{plan.heading} {priceName}</p>

                        {/* Total en vivo (con impuestos del país del cliente) */}
                        {totals?.total !== undefined ? (
                            <div className="flex items-baseline gap-2.5 mb-1.5">
                                <span style={{ fontWeight: 600, fontSize: 46, lineHeight: 1, letterSpacing: '-0.04em', color: TEXT }}>
                                    {formatMoney(totals.total, currency)}
                                </span>
                                {plan.recurring
                                    ? <span style={{ fontSize: 14, color: TEXT_MED, lineHeight: 1.2 }}>al<br />mes</span>
                                    : <span style={{ fontSize: 14, color: TEXT_MED, lineHeight: 1.2 }}>pago<br />único</span>}
                            </div>
                        ) : (
                            <div className="mb-1.5"><LineSkeleton w={190} h={46} /></div>
                        )}

                        {/* En el vitalicio no hay `recurring_totals`: el texto es fijo,
                            si no el skeleton se quedaría girando para siempre. */}
                        {!plan.recurring ? (
                            <p style={{ fontSize: 12.5, color: TEXT_DIM, marginBottom: 28 }}>
                                Un solo pago, impuestos incluidos · Acceso permanente con todas las actualizaciones futuras
                            </p>
                        ) : recurringTotal !== undefined ? (
                            <p style={{ fontSize: 12.5, color: TEXT_DIM, marginBottom: 28 }}>
                                Luego {formatMoney(recurringTotal, currency)} cada mes, impuestos incluidos · Sin permanencia
                            </p>
                        ) : (
                            <div className="mb-7"><LineSkeleton w={230} h={12} /></div>
                        )}

                        {/* Detalle: visible en desktop, plegable en móvil */}
                        <div className="hidden md:block" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24 }}>
                            {lineItems}
                        </div>

                        <details className="group md:hidden" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
                            <summary
                                className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden"
                                style={{ fontSize: 14, color: TEXT_MED }}
                            >
                                Resumen del pedido
                                <ChevronDown size={15} className="transition-transform group-open:rotate-180" />
                            </summary>
                            <div style={{ paddingTop: 16 }}>{lineItems}</div>
                        </details>

                        {/* Legal (desktop) */}
                        <div
                            className="mt-9 hidden md:flex items-center gap-3"
                            style={{ fontSize: 11.5, color: TEXT_DIM }}
                        >
                            {legal}
                        </div>
                    </div>

                    {/* ══ Formulario de pago ══ */}
                    <div
                        className="bp-up"
                        style={{
                            backgroundColor: '#0a0a0a', border: `1px solid ${BORDER}`, borderRadius: 14,
                            padding: '22px 20px',
                        }}
                    >
                        <p style={{ fontSize: 14.5, fontWeight: 600, color: TEXT, marginBottom: 20 }}>Datos de pago</p>

                        {status === 'error' ? (
                            <div className="flex flex-col items-center justify-center gap-4 text-center" style={{ minHeight: 300 }}>
                                <p style={{ fontSize: 14, color: TEXT_MED, lineHeight: 1.7, maxWidth: 340 }}>
                                    No pudimos cargar el formulario de pago. Revisa tu conexión (o desactiva el bloqueador de
                                    anuncios) e inténtalo de nuevo.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    style={{
                                        backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 11,
                                        padding: '11px 22px', fontSize: 14, fontWeight: 600, color: TEXT, cursor: 'pointer',
                                    }}
                                >
                                    Reintentar
                                </button>
                            </div>
                        ) : (
                            <>
                                {status === 'loading' && (
                                    <div className="flex flex-col gap-3.5">
                                        <LineSkeleton w={120} h={14} />
                                        <LineSkeleton w="100%" h={44} />
                                        <LineSkeleton w={96} h={14} />
                                        <LineSkeleton w="100%" h={44} />
                                        <LineSkeleton w="100%" h={96} />
                                        <LineSkeleton w="100%" h={44} />
                                    </div>
                                )}
                                {/* Paddle monta aquí su frame (frameTarget) */}
                                <div className="paddle-checkout-frame" />
                            </>
                        )}
                    </div>

                </div>

                {/* Legal (móvil) */}
                <div
                    className="mt-9 flex items-center justify-center gap-3 md:hidden"
                    style={{ fontSize: 11.5, color: TEXT_DIM }}
                >
                    {legal}
                </div>

            </div>
        </div>
    );
};

export default Checkout;
