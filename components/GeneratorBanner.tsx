import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wand2, ArrowRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { hasGeneratorAccess } from '../lib/access';
import { BORDER_SOFT, TEXT, MUTED, DIM, AMBER, SANS, MONO } from './darkKit';

/* ── Banner del generador (house ad) ─────────────────────────────
   Anuncio propio en todas las páginas del layout compartido. El
   generador es la función más infrautilizada del producto: de 40
   personas que lo tienen pagado, 16 lo han abierto alguna vez.

   Dos reglas para que sea un anuncio y no una molestia:
   · el mensaje cambia según pueda usarlo o no quien lo lee;
   · límite de frecuencia — cerrarlo lo calla una semana, y haber
     entrado ya al generador lo calla un mes. */

const DISMISS_KEY = 'alp-generator-banner-until';
const SEEN_GENERATOR_KEY = 'alp-seen-generator';

const DAY = 24 * 60 * 60 * 1000;
const DISMISS_DAYS = 7;
const AFTER_VISIT_DAYS = 30;

// Rutas donde el anuncio no pinta nada: la del propio generador y las de pago
const HIDDEN_ON = ['/generador', '/pricing', '/checkout', '/payment-success', '/login'];

const silencedUntil = (): number => {
    try { return Number(localStorage.getItem(DISMISS_KEY) ?? 0); } catch { return 0; }
};
const silenceFor = (days: number) => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now() + days * DAY)); } catch { /* sin localStorage: se seguirá viendo */ }
};

/* La suscripción se consulta una vez por carga de página y se comparte:
   el banner aparece en todas las rutas y no puede pedirla en cada una. */
let accessCache: { subscribed: boolean } | null = null;
let accessInflight: Promise<boolean> | null = null;

const loadAccess = (): Promise<boolean> => {
    if (accessCache) return Promise.resolve(accessCache.subscribed);
    if (accessInflight) return accessInflight;

    accessInflight = (async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) { accessCache = { subscribed: false }; return false; }

        const { data } = await supabase
            .from('subscriptions')
            .select('subscription_status')
            .eq('customer_id', user.id)
            .maybeSingle();

        const subscribed = hasGeneratorAccess(data?.subscription_status);
        accessCache = { subscribed };
        return subscribed;
    })().finally(() => { accessInflight = null; });

    return accessInflight;
};

const GeneratorBanner: React.FC = () => {
    const { pathname } = useLocation();
    const [visible, setVisible] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        // Si ya entró al generador, se calla un mes
        try {
            if (localStorage.getItem(SEEN_GENERATOR_KEY) === '1' && silencedUntil() === 0) {
                silenceFor(AFTER_VISIT_DAYS);
            }
        } catch { /* sin localStorage: seguimos */ }

        if (Date.now() < silencedUntil()) return;

        let cancelled = false;
        loadAccess().then(sub => {
            if (cancelled) return;
            setSubscribed(sub);
            setVisible(true);
        });
        return () => { cancelled = true; };
    }, []);

    const dismiss = () => {
        silenceFor(DISMISS_DAYS);
        setVisible(false);
    };

    if (!visible || HIDDEN_ON.some(p => pathname === p || pathname.startsWith(p + '/'))) return null;

    const headline = subscribed
        ? 'Tienes 10 prompts a medida al día sin usar'
        : 'Crea el prompt exacto que necesitas, con IA';

    const sub = subscribed
        ? 'Describe lo que quieres lograr y el generador te lo escribe con el formato de la casa.'
        : 'Incluido en el plan: describes tu caso y el generador escribe el prompt por ti.';

    return (
        <div
            style={{
                position: 'relative',
                background: 'linear-gradient(90deg, rgba(255,178,36,0.10), rgba(255,178,36,0.03) 60%, transparent)',
                borderBottom: `1px solid ${BORDER_SOFT}`,
                fontFamily: SANS,
            }}
        >
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <div
                    className="flex items-center gap-3 sm:gap-4"
                    style={{ paddingTop: 10, paddingBottom: 10, paddingRight: 28 }}
                >
                    <span
                        className="hidden sm:flex items-center justify-center"
                        style={{
                            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                            backgroundColor: 'rgba(255,178,36,0.1)',
                            border: '1px solid rgba(255,178,36,0.3)',
                        }}
                    >
                        <Wand2 size={15} style={{ color: AMBER }} />
                    </span>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span
                                style={{
                                    fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em',
                                    textTransform: 'uppercase', color: AMBER,
                                    backgroundColor: 'rgba(255,178,36,0.1)', border: '1px solid rgba(255,178,36,0.3)',
                                    borderRadius: 100, padding: '1px 6px', lineHeight: 1.6,
                                }}
                            >
                                Generador
                            </span>
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: TEXT }}>
                                {headline}
                            </span>
                        </div>
                        <p className="hidden md:block truncate" style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>
                            {sub}
                        </p>
                    </div>

                    <Link
                        to="/generador?from=banner"
                        className="inline-flex items-center gap-1.5 flex-shrink-0"
                        style={{
                            backgroundColor: TEXT, color: '#000',
                            fontSize: 12.5, fontWeight: 700, textDecoration: 'none',
                            borderRadius: 8, padding: '8px 14px', whiteSpace: 'nowrap',
                        }}
                    >
                        Probarlo <ArrowRight size={13} />
                    </Link>
                </div>
            </div>

            <button
                type="button"
                onClick={dismiss}
                aria-label="Cerrar aviso"
                className="inline-flex items-center justify-center"
                style={{
                    position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)',
                    width: 26, height: 26, borderRadius: 7,
                    background: 'none', border: 'none', color: DIM, cursor: 'pointer',
                    transition: 'color .15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DIM; }}
            >
                <X size={14} />
            </button>
        </div>
    );
};

export default GeneratorBanner;
