import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { hasGeneratorAccess } from '../lib/access';
import { CARD, PANEL, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, AMBER, SANS, MONO } from './darkKit';

/* ── Anuncio del generador ("what's new") ────────────────────────
   Se muestra UNA vez por navegador y no vuelve.

   En vez de describir la función con un icono y un párrafo, la tarjeta
   la enseña: se ve la frase que escribe el usuario y el prompt saliendo
   debajo, en la monoespaciada y con el formato de bloques del catálogo.
   El material del producto es texto, así que el anuncio es texto. */

const SEEN_KEY = 'alp-generator-announced';
const SEEN_GENERATOR_KEY = 'alp-seen-generator';
const DELAY_MS = 1400;

/* Modo prueba: la tarjeta reaparece en cada recarga en vez de mostrarse
   una sola vez. Se activa solo con `npm run dev`, o en producción añadiendo
   `?announce=1` a la URL. Nunca por defecto: si esto se colara, el anuncio
   saldría a cada visitante en cada carga y sería exactamente el pop-up
   pesado que queremos evitar. */
const isForced = (): boolean => {
    try {
        if (import.meta.env.DEV) return true;
        return new URLSearchParams(window.location.search).has('announce');
    } catch { return false; }
};

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
    // En modo prueba no se persiste: así el localStorage queda limpio para
    // comprobar después el comportamiento real de "una sola vez".
    if (isForced()) return;
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* nada que hacer */ }
};

const GeneratorAnnouncement: React.FC = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const ctaRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const forced = isForced();
        if (!forced && alreadyHandled()) return;
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
                @keyframes alpFade { from { opacity: 0 } to { opacity: 1 } }
                @keyframes alpRise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
                .alp-ov { animation: alpFade .18s ease-out both }
                .alp-card { animation: alpRise .3s cubic-bezier(.2,.7,.3,1) both }
                @media (prefers-reduced-motion: reduce) {
                    .alp-ov, .alp-card { animation: none !important; opacity: 1 !important; transform: none !important }
                }
            `}</style>

            <div
                className="alp-ov fixed inset-0 flex items-center justify-center"
                style={{
                    zIndex: 100, padding: 20,
                    backgroundColor: 'rgba(0,0,0,0.72)',
                    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                }}
                onClick={close}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="alp-ann-title"
                    className="alp-card relative w-full"
                    onClick={e => e.stopPropagation()}
                    style={{
                        maxWidth: 440,
                        backgroundColor: CARD,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 16,
                        fontFamily: SANS,
                        boxShadow: '0 30px 80px rgba(0,0,0,0.75)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Barra superior: etiqueta discreta y cierre */}
                    <div
                        className="flex items-center justify-between"
                        style={{ padding: '13px 14px 13px 18px', borderBottom: `1px solid ${BORDER_SOFT}` }}
                    >
                        <div className="flex items-center gap-2.5">
                            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: AMBER }} />
                            <span style={{
                                fontFamily: MONO, fontSize: 9.5, fontWeight: 700,
                                letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED,
                            }}>
                                Nuevo · Generador
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={close}
                            aria-label="Cerrar"
                            className="inline-flex items-center justify-center"
                            style={{
                                width: 26, height: 26, borderRadius: 7,
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
                            <X size={14} />
                        </button>
                    </div>

                    <div style={{ padding: '22px 18px 20px' }}>
                        <h2
                            id="alp-ann-title"
                            style={{
                                fontSize: 21, fontWeight: 700, color: TEXT,
                                letterSpacing: '-0.025em', lineHeight: 1.28, marginBottom: 9,
                            }}
                        >
                            Genera tus prompts de IA
                            <br />
                            en un solo clic
                        </h2>
                        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, marginBottom: 18 }}>
                            Consigue prompts potentes sin esfuerzo — describe tu objetivo como si
                            hablaras con un amigo y nosotros nos encargamos del resto.
                        </p>

                        <div className="flex items-center gap-2.5">
                            <button
                                ref={ctaRef}
                                type="button"
                                onClick={accept}
                                style={{
                                    flex: 1,
                                    backgroundColor: TEXT, color: '#000', border: 'none', cursor: 'pointer',
                                    fontFamily: SANS, fontSize: 13.5, fontWeight: 700,
                                    borderRadius: 9, padding: '12px 18px',
                                }}
                            >
                                Crear
                            </button>
                            <button
                                type="button"
                                onClick={close}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontFamily: SANS, fontSize: 13, fontWeight: 500, color: DIM,
                                    padding: '12px 14px', transition: 'color .15s',
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = MUTED; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DIM; }}
                            >
                                Ahora no
                            </button>
                        </div>

                        <p style={{ fontFamily: MONO, fontSize: 10, color: DIM, marginTop: 13, letterSpacing: '0.04em' }}>
                            {subscribed ? 'Incluido en tu plan · 10 al día' : 'Incluido en la membresía · 10 al día'}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GeneratorAnnouncement;
