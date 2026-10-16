import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, isAdminUser } from '../lib/supabase';
import { getCachedPromptsList, fetchPromptsList } from '../lib/promptsList';
import { markSignInStarted } from '../lib/authFlow';
import { Check, ExternalLink, Lock, Bookmark, Wand2, Library, Loader2 } from 'lucide-react';
import AlpacaIcon from '../components/AlpacaIcon';
import {
  BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, GREEN, AMBER, SANS, MONO, HEADER_H,
  CategoryBadge,
} from '../components/darkKit';
import { Prompt } from '../types';

/* Login — pantalla dividida: el acceso a la izquierda y, en escritorio, una
   vitrina del catálogo a la derecha (prompts reales de la caché compartida).
   El header/nav lo aporta el layout compartido (darkKit). */

function detectInAppBrowser(): { inApp: boolean; isAndroid: boolean; isIOS: boolean; appName: string } {
  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  // App-specific checks
  if (/Instagram/i.test(ua)) return { inApp: true, isAndroid, isIOS, appName: 'Instagram / Threads' };
  if (/FBAN|FBAV|FB_IAB|FBIOS|FBDV/i.test(ua)) return { inApp: true, isAndroid, isIOS, appName: 'Facebook' };
  if (/Twitter|TwitterAndroid|TwitteriPhone/i.test(ua)) return { inApp: true, isAndroid, isIOS, appName: 'X / Twitter' };
  if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return { inApp: true, isAndroid, isIOS, appName: 'TikTok' };
  if (/LinkedInApp/i.test(ua)) return { inApp: true, isAndroid, isIOS, appName: 'LinkedIn' };
  if (/Snapchat/i.test(ua)) return { inApp: true, isAndroid, isIOS, appName: 'Snapchat' };
  if (/Pinterest/i.test(ua)) return { inApp: true, isAndroid, isIOS, appName: 'Pinterest' };

  // Generic WebView detection
  // Android WebView: contiene "wv" o "Version/" sin ser Safari/Chrome real
  if (isAndroid && /wv|WebView/i.test(ua)) return { inApp: true, isAndroid, isIOS, appName: 'una app' };
  // iOS WebView: tiene AppleWebKit pero NO tiene "Safari" en el UA
  if (isIOS && !/Safari/i.test(ua)) return { inApp: true, isAndroid, isIOS, appName: 'una app' };

  return { inApp: false, isAndroid, isIOS, appName: '' };
}

/* Logo de Google a cuatro colores (el botón va sobre fondo blanco) */
const GoogleLogo: React.FC<{ muted?: boolean }> = ({ muted }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0, opacity: muted ? 0.4 : 1 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
);

/* El titular se adapta a lo que la persona intentaba hacer antes de llegar */
const headingFor = (redirect: string): { title: string; subtitle: string } => {
  if (redirect.startsWith('/checkout')) return {
    title: 'Un paso más para tu suscripción',
    subtitle: 'Entra con Google y te llevamos directo al pago. Tu acceso queda ligado a esta cuenta.',
  };
  if (redirect.startsWith('/generador')) return {
    title: 'Entra para usar el generador',
    subtitle: 'Describe lo que necesitas y la IA te escribe un prompt a medida, con el formato del catálogo.',
  };
  if (redirect.startsWith('/guardados')) return {
    title: 'Tus prompts guardados te esperan',
    subtitle: 'Entra con Google para ver y gestionar los prompts que marcaste.',
  };
  if (redirect.startsWith('/prompts/')) return {
    title: 'Entra para ver este prompt',
    subtitle: 'Inicia sesión con Google y vuelves justo a donde estabas.',
  };
  return {
    title: 'Bienvenido a alpacka.ai',
    subtitle: 'Entra con tu cuenta de Google para acceder a la librería, al generador y a tus prompts guardados.',
  };
};

const PERKS = [
  { icon: Library, text: 'Librería de prompts listos para copiar' },
  { icon: Wand2, text: 'Generador de prompts con IA' },
  { icon: Bookmark, text: 'Guarda tus favoritos y vuelve cuando quieras' },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const browser = React.useMemo(() => detectInAppBrowser(), []);
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState(false);
  const heading = headingFor(redirect);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      // El admin va a su panel salvo que pidiera otra ruta explícitamente.
      const target = isAdminUser(session.user) && redirect === '/dashboard' ? '/admin' : redirect;
      navigate(target, { replace: true });
    });
  }, [navigate, redirect]);

  const handleGoogleLogin = async () => {
    setError(false);
    setPending(true);
    // El checkout no lleva header (y por tanto no hay aviso): ahí no se marca,
    // o el aviso saldría más tarde, fuera de contexto, tras pagar.
    if (!redirect.startsWith('/checkout')) markSignInStarted();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${redirect}` },
      });
      if (error) throw error;
      // Si todo va bien el navegador sale hacia Google; dejamos el spinner.
    } catch {
      setPending(false);
      setError(true);
    }
  };

  const handleOpenInBrowser = () => {
    const url = window.location.href;
    if (browser.isAndroid) {
      window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
    } else {
      // iOS: no hay forma de forzar Safari, mostramos instrucciones
      setShowIOSInstructions(true);
    }
  };

  return (
    <div
      className="grid lg:grid-cols-2"
      style={{ backgroundColor: BG, color: TEXT, fontFamily: SANS, minHeight: `calc(100vh - ${HEADER_H}px)` }}
    >
      <style>{`
        .lg-google { transition: transform .15s, box-shadow .15s, background-color .15s; }
        .lg-google:hover:not(:disabled) { background-color: #f2f2f2; box-shadow: 0 8px 30px rgba(255,255,255,0.08); }
        .lg-google:active:not(:disabled) { transform: scale(.99); }
        .lg-google:focus-visible, .lg-link:focus-visible { outline: 2px solid ${TEXT}; outline-offset: 3px; }
        .lg-link { color: ${MUTED}; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: #444; transition: color .15s; }
        .lg-link:hover { color: ${TEXT}; }
        @keyframes lgFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes lgSpin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .lg-float { animation: none !important; } }
      `}</style>

      {/* ── Columna de acceso ─────────────────────────────────────────── */}
      <main className="relative flex items-center justify-center px-5 py-14 sm:px-10">
        {/* Halo suave detrás del formulario (solo móvil, donde no hay vitrina) */}
        <div
          aria-hidden
          className="lg:hidden"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 45% at 50% 0%, rgba(255,178,36,0.07), transparent 70%)',
          }}
        />

        <div className="relative w-full animate-fade-up" style={{ maxWidth: 400 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 52, height: 52, borderRadius: 14, marginBottom: 28,
              backgroundColor: CARD, border: `1px solid ${BORDER}`,
              boxShadow: '0 0 0 6px rgba(255,255,255,0.02)',
            }}
          >
            <AlpacaIcon variant="light" className="h-8 w-auto" />
          </div>

          <h1 style={{ fontWeight: 600, fontSize: 'clamp(1.7rem, 3vw, 2.05rem)', letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 12, color: TEXT }}>
            {heading.title}
          </h1>
          <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.65, marginBottom: 32 }}>
            {heading.subtitle}
          </p>

          {/* Aviso de navegador in-app */}
          {browser.inApp && (
            <div
              style={{
                backgroundColor: 'rgba(255,178,36,0.06)', border: '1px solid rgba(255,178,36,0.25)',
                borderRadius: 12, padding: '15px 15px 13px', marginBottom: 14,
              }}
            >
              <p style={{ fontSize: 13, lineHeight: 1.6, color: AMBER, marginBottom: 12 }}>
                Estás dentro de {browser.appName}. Google no permite iniciar sesión desde aquí: abre esta página en{' '}
                {browser.isAndroid ? 'Chrome' : 'Safari'}.
              </p>

              {showIOSInstructions && (
                <div
                  style={{
                    backgroundColor: PANEL, border: `1px solid ${BORDER}`, borderRadius: 9,
                    padding: '10px 12px', marginBottom: 12, fontSize: 12.5, color: MUTED, lineHeight: 1.6,
                  }}
                >
                  Toca <strong style={{ color: TEXT }}>···</strong> o <strong style={{ color: TEXT }}>⋮</strong> y selecciona{' '}
                  <strong style={{ color: TEXT }}>"Abrir en Safari"</strong>.
                </div>
              )}

              <button
                onClick={handleOpenInBrowser}
                className="lg-google"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  backgroundColor: TEXT, color: '#000', border: 'none', cursor: 'pointer',
                  borderRadius: 10, height: 44, fontSize: 14, fontWeight: 600,
                }}
              >
                <ExternalLink size={15} />
                {browser.isAndroid ? 'Continuar en Chrome' : 'Continuar en Safari'}
              </button>
            </div>
          )}

          {/* Botón de Google — desactivado dentro de un WebView */}
          {browser.inApp ? (
            <div
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                border: `1px solid ${BORDER_SOFT}`, borderRadius: 12, height: 52,
                fontSize: 14.5, fontWeight: 600, color: DIM, cursor: 'not-allowed',
              }}
            >
              <GoogleLogo muted />
              No disponible aquí
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={pending}
              className="lg-google"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11,
                backgroundColor: '#ffffff', border: 'none', borderRadius: 12, height: 52,
                fontSize: 15, fontWeight: 600, color: '#111', cursor: pending ? 'wait' : 'pointer',
              }}
            >
              {pending
                ? <Loader2 size={18} style={{ animation: 'lgSpin 0.8s linear infinite', color: '#555' }} />
                : <GoogleLogo />}
              {pending ? 'Conectando con Google…' : 'Continuar con Google'}
            </button>
          )}

          {error && (
            <p role="alert" style={{ fontSize: 13, color: '#ff8a8a', marginTop: 12, lineHeight: 1.5 }}>
              No pudimos iniciar sesión. Inténtalo de nuevo en unos segundos.
            </p>
          )}

          <div className="flex items-center gap-2" style={{ marginTop: 16 }}>
            <Lock size={12} style={{ color: DIM, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: DIM, lineHeight: 1.5 }}>
              ¿Primera vez? Tu cuenta se crea al entrar. Sin contraseñas.
            </span>
          </div>

          {/* Qué incluye */}
          <div style={{ borderTop: `1px solid ${BORDER_SOFT}`, marginTop: 32, paddingTop: 24 }}>
            <p style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: DIM, marginBottom: 14 }}>
              Con tu cuenta
            </p>
            <ul className="flex flex-col gap-3">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center"
                    style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: CARD, border: `1px solid ${BORDER}`, flexShrink: 0 }}
                  >
                    <Icon size={13} style={{ color: MUTED }} />
                  </span>
                  <span style={{ fontSize: 14, color: MUTED }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p style={{ fontSize: 12, color: DIM, lineHeight: 1.7, marginTop: 32 }}>
            Al continuar, aceptas nuestros{' '}
            <Link to="/terms" className="lg-link">Términos</Link> y la{' '}
            <Link to="/privacy" className="lg-link">Política de privacidad</Link>.
          </p>
        </div>
      </main>

      {/* ── Vitrina (escritorio) ──────────────────────────────────────── */}
      <Showcase />
    </div>
  );
};

/* Vitrina: tres prompts reales flotando sobre una retícula, más las cifras
   del catálogo. Usa la misma caché que /prompts, así que normalmente pinta
   al instante y además deja el catálogo precargado para después del login. */
const Showcase: React.FC = () => {
  const [prompts, setPrompts] = React.useState<Prompt[]>(() => getCachedPromptsList() ?? []);
  React.useEffect(() => {
    let cancelled = false;
    fetchPromptsList().then(fresh => { if (!cancelled && fresh) setPrompts(fresh); });
    return () => { cancelled = true; };
  }, []);

  // Tres prompts de categorías distintas, para que la muestra se vea variada
  const picks = React.useMemo(() => {
    const seen = new Set<string>();
    const out: Prompt[] = [];
    for (const p of prompts) {
      const cat = (p.category || '').toLowerCase();
      if (!p.title || !p.description || seen.has(cat)) continue;
      seen.add(cat);
      out.push(p);
      if (out.length === 3) break;
    }
    return out;
  }, [prompts]);

  const categories = React.useMemo(
    () => new Set(prompts.map(p => (p.category || '').toLowerCase()).filter(Boolean)).size,
    [prompts],
  );

  const offsets = [
    { x: -36, rotate: -1, delay: '0s' },
    { x: 40, rotate: 0.6, delay: '1.2s' },
    { x: -12, rotate: -0.4, delay: '2.4s' },
  ];

  return (
    <aside
      aria-hidden
      className="hidden lg:flex relative overflow-hidden flex-col justify-center"
      style={{ borderLeft: `1px solid ${BORDER_SOFT}`, backgroundColor: '#050505' }}
    >
      {/* Retícula + halo ámbar */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${BORDER_SOFT} 1px, transparent 1px), linear-gradient(90deg, ${BORDER_SOFT} 1px, transparent 1px)`,
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, #000 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, #000 20%, transparent 80%)',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 45%, rgba(255,178,36,0.08), transparent 55%)',
      }} />

      <div className="relative mx-auto w-full" style={{ maxWidth: 440, padding: '48px 24px' }}>
        <div className="flex flex-col gap-4" style={{ minHeight: 420, justifyContent: 'center' }}>
          {picks.length === 0 && Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ height: 118, borderRadius: 14, border: `1px solid ${BORDER_SOFT}`, backgroundColor: CARD, transform: `translateX(${offsets[i].x}px) rotate(${offsets[i].rotate}deg)` }}
            />
          ))}
          {picks.map((p, i) => (
            <div key={p.id} style={{ transform: `translateX(${offsets[i].x}px) rotate(${offsets[i].rotate}deg)` }}>
              <div
                className="lg-float"
                style={{
                  animation: `lgFloat 6s ease-in-out ${offsets[i].delay} infinite`,
                  backgroundColor: 'rgba(10,10,10,0.92)', border: `1px solid ${BORDER}`, borderRadius: 14,
                  padding: '16px 18px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <div className="flex items-center justify-between gap-2" style={{ marginBottom: 10 }}>
                  <CategoryBadge category={p.category} />
                  {p.is_premium ? (
                    <span className="inline-flex items-center gap-1" style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: AMBER }}>
                      <Lock size={9} /> Premium
                    </span>
                  ) : (
                    <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREEN }}>
                      Gratis
                    </span>
                  )}
                </div>
                <p className="line-clamp-1" style={{ fontSize: 14.5, fontWeight: 600, color: TEXT, letterSpacing: '-0.01em', marginBottom: 5 }}>
                  {p.title}
                </p>
                <p className="line-clamp-2" style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {prompts.length > 0 && (
          <div className="flex flex-col items-center gap-2.5" style={{ marginTop: 40, fontFamily: MONO, fontSize: 12, color: DIM, whiteSpace: 'nowrap' }}>
            <div className="flex items-center gap-4">
              <span><span style={{ color: TEXT }}>{prompts.length.toLocaleString('es')}</span> prompts</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: DIM }} />
              <span><span style={{ color: TEXT }}>{categories}</span> categorías</span>
            </div>
            <span className="inline-flex items-center gap-1.5"><Check size={12} style={{ color: GREEN }} /> ChatGPT · Claude · Gemini</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Login;
