import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wand2, X, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { hasGeneratorAccess } from '../lib/access';
import { CARD, PANEL, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, AMBER, SANS, MONO } from './darkKit';

/* ── Anuncio del generador ("what's new") ────────────────────────
   Tarjeta centrada que se muestra UNA vez y no vuelve. Sustituye al
   banner permanente: el generador es la función más infrautilizada
   del producto (de 40 personas que lo tienen pagado, 16 lo han
   abierto), pero un anuncio que vive para siempre en la cabecera se
   convierte en ruido a los dos días.

   Reglas: una sola vez por navegador, con retardo para no golpear
   nada más cargar, y nunca sobre las páginas donde estorbaría. */

const SEEN_KEY = 'alp-generator-announced';
const SEEN_GENERATOR_KEY = 'alp-seen-generator';
const DELAY_MS = 1400;

// Ni en el propio generador ni encima de un pago a medias
const HIDDEN_ON = ['/generador', '/checkout', '/payment-success', '/login'];

const alreadyHandled = (): boolean => {
    try {
        return localStorage.getItem(SEEN_KEY) === '1'
            || localStorage.getItem(SEEN_GENERATOR_KEY) === '1';
    } catch {
        return true; // sin localStorage no podríamos recordar el cierre: mejor no mostrarlo
    }
};

const markHandled = () => {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* nada que hacer */ }
};

const GeneratorAnnouncement: React.FC = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const ctaRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (alreadyHandled()) return;
        if (HIDDEN_ON.some(p => pathname === p || pathname.startsWith(p + '/'))) return;

        let cancelled = false;
        const timer = setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            let hasAccess = false;
            if (user) {
                const { data } = await supabase
                    .from('subscriptions')
                    .select('subscription_status')
                    .eq('customer_id', user.id)
                    .maybeSingle();
                hasAccess = hasGeneratorAccess(data?.subscription_status);
            }

            if (cancelled) return;
            setSubscribed(hasAccess);
            setOpen(true);
        }, DELAY_MS);

        return () => { cancelled = true; clearTimeout(timer); };
        // Solo se evalúa al montar: no queremos que reaparezca al navegar
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        ctaRef.current?.focus();
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = previous;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const close = () => { markHandled(); setOpen(false); };

    const accept = () => {
        markHandled();
        setOpen(false);
        navigate('/generador?from=anuncio');
    };

    if (!open) return null;

    return (
        <>
            <style>{`
                @keyframes alpFadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes alpRise { from { opacity: 0; transform: translateY(10px) scale(.985) } to { opacity: 1; transform: none } }
                .alp-ann-overlay { animation: alpFadeIn .18s ease-out both }
                .alp-ann-card { animation: alpRise .26s cubic-bezier(.2,.7,.3,1) both }
                @media (prefers-reduced-motion: reduce) {
                    .alp-ann-overlay, .alp-ann-card { animation: none }
                }
            `}</style>

            <div
                className="alp-ann-overlay fixed inset-0 flex items-center justify-center"
                style={{
                    zIndex: 100, padding: 20,
                    backgroundColor: 'rgba(0,0,0,0.66)',
                    backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
                }}
                onClick={close}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="alp-ann-title"
                    className="alp-ann-card relative w-full"
                    onClick={e => e.stopPropagation()}
                    style={{
                        maxWidth: 400,
                        backgroundColor: CARD,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 18,
                        padding: '30px 28px 26px',
                        fontFamily: SANS,
                        boxShadow: '0 30px 70px rgba(0,0,0,0.7)',
                    }}
                >
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Cerrar"
                        className="absolute inline-flex items-center justify-center"
                        style={{
                            top: 12, right: 12, width: 28, height: 28, borderRadius: 8,
                            background: 'none', border: 'none', color: DIM, cursor: 'pointer',
                            transition: 'color .15s, background-color .15s',
                        }}
                        onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.color = TEXT; el.style.backgroundColor = PANEL;
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.color = DIM; el.style.backgroundColor = 'transparent';
                        }}
                    >
                        <X size={15} />
                    </button>

                    <div
                        className="flex items-center justify-center"
                        style={{
                            width: 42, height: 42, borderRadius: 13, marginBottom: 20,
                            backgroundColor: 'rgba(255,178,36,0.09)',
                            border: '1px solid rgba(255,178,36,0.28)',
                        }}
                    >
                        <Wand2 size={19} style={{ color: AMBER }} />
                    </div>

                    <p style={{
                        fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em',
                        textTransform: 'uppercase', color: AMBER, marginBottom: 10,
                    }}>
                        Nuevo
                    </p>

                    <h2
                        id="alp-ann-title"
                        style={{
                            fontSize: 20, fontWeight: 700, color: TEXT,
                            letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 10,
                        }}
                    >
                        Ahora puedes crear tus propios prompts
                    </h2>

                    <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.7, marginBottom: 22 }}>
                        Describe en una frase lo que quieres lograr y el generador te escribe un
                        prompt a medida, con la misma estructura que los del catálogo.
                        {subscribed
                            ? ' Ya está incluido en tu plan: hasta 10 al día.'
                            : ' Está incluido en la membresía, con hasta 10 al día.'}
                    </p>

                    <div className="flex flex-col gap-2">
                        <button
                            ref={ctaRef}
                            type="button"
                            onClick={accept}
                            className="inline-flex w-full items-center justify-center gap-2"
                            style={{
                                backgroundColor: TEXT, color: '#000', border: 'none', cursor: 'pointer',
                                fontFamily: SANS, fontSize: 14, fontWeight: 700,
                                borderRadius: 10, padding: '13px 20px',
                            }}
                        >
                            Probar el generador <ArrowRight size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={close}
                            className="w-full"
                            style={{
                                background: 'none', border: `1px solid ${BORDER_SOFT}`, cursor: 'pointer',
                                fontFamily: SANS, fontSize: 13, fontWeight: 600, color: MUTED,
                                borderRadius: 10, padding: '11px 20px',
                                transition: 'color .15s, border-color .15s',
                            }}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.color = TEXT; el.style.borderColor = BORDER;
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.color = MUTED; el.style.borderColor = BORDER_SOFT;
                            }}
                        >
                            Ahora no
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GeneratorAnnouncement;
