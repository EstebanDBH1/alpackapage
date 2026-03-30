import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Check, ArrowRight, ExternalLink } from 'lucide-react';
import AlpacaIcon from '@/components/AlpacaIcon';

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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const browser = React.useMemo(() => detectInAppBrowser(), []);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(redirect, { replace: true });
    });
  }, [navigate, redirect]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${redirect}` },
      });
      if (error) throw error;
    } catch {
      alert('Error al iniciar sesión. Por favor intenta de nuevo.');
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

  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);

  return (
    <div className="min-h-[calc(100vh-64px)] flex" style={{ backgroundColor: '#FAF9F5' }}>

      {/* ── Left panel — branding ──────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] p-14 relative overflow-hidden"
        style={{ backgroundColor: '#1A1410' }}
      >
        {/* Dot texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #C96A3C 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,106,60,0.09), transparent)' }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <AlpacaIcon />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
            alpacka.ai
          </span>
        </div>

        {/* Middle content */}
        <div className="relative z-10">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-6 flex items-center gap-2" style={{ color: '#4D433C' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            150+ prompts activos
          </p>
          <h2 className="font-display font-bold text-3xl leading-tight mb-8" style={{ color: 'rgba(255,255,255,0.88)' }}>
            El arsenal de prompts<br />
            que convierte IA<br />
            <span style={{ color: '#C96A3C' }}>en resultados.</span>
          </h2>
          <ul className="space-y-3.5">
            {[
              'acceso a 150+ prompts probados',
              'actualizaciones semanales',
              'guarda tus prompts favoritos',
              'cancela cuando quieras',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(201,106,60,0.15)', border: '1px solid rgba(201,106,60,0.25)' }}>
                  <Check size={9} style={{ color: '#C96A3C' }} strokeWidth={3} />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Price tag */}
        <div className="relative z-10 flex items-baseline gap-2">
          <span className="font-display font-bold text-4xl" style={{ color: 'rgba(255,255,255,0.15)' }}>$4</span>
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: '#3D352E' }}>/mes · todo incluido</span>
        </div>
      </div>

      {/* ── Right panel — form ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-16">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#1A1410' }}>
            <AlpacaIcon />
          </div>
          <span className="font-display font-semibold text-xl" style={{ color: '#1D1B18' }}>alpacka.ai</span>
        </div>

        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl mb-2" style={{ color: '#1D1B18' }}>
              Bienvenido
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#8B7E74' }}>
              Inicia sesión o crea tu cuenta con Google para acceder a tu suscripción.
            </p>
          </div>

          {/* In-app browser warning */}
          {browser.inApp && (
            <div
              className="mb-6 rounded-2xl p-4 border"
              style={{ backgroundColor: '#FFF8F0', borderColor: '#F5D5BE' }}
            >
              <p className="font-semibold text-sm mb-1" style={{ color: '#1D1B18' }}>
                Abrí esta página en tu navegador
              </p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: '#8B7E74' }}>
                Estás dentro de {browser.appName}. Google bloquea el inicio de sesión desde apps — tenés que abrirlo en {browser.isAndroid ? 'Chrome' : 'Safari'}.
              </p>

              {/* iOS step-by-step instructions */}
              {showIOSInstructions && (
                <div className="mb-3 p-3 rounded-xl text-xs space-y-1.5" style={{ backgroundColor: '#F0EAE1', color: '#5A4D45' }}>
                  <p className="font-semibold mb-1" style={{ color: '#1D1B18' }}>Cómo abrirlo en Safari:</p>
                  <p>1. Tocá el ícono <strong>···</strong> o <strong>⋮</strong> (tres puntos) arriba o abajo de la pantalla.</p>
                  <p>2. Seleccioná <strong>"Abrir en Safari"</strong> o <strong>"Abrir en navegador"</strong>.</p>
                  <p>3. Volvé a intentar iniciar sesión con Google.</p>
                </div>
              )}

              <button
                onClick={handleOpenInBrowser}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all"
                style={{ backgroundColor: '#C96A3C', color: 'white' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#AF5A30')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#C96A3C')}
              >
                <ExternalLink size={13} />
                {browser.isAndroid ? 'Abrir en Chrome' : 'Ver instrucciones para Safari'}
              </button>
            </div>
          )}

          {/* Google button — hidden in WebView to avoid the 403 confusion */}
          {browser.inApp ? (
            <div
              className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-sm mb-6 cursor-not-allowed"
              style={{ backgroundColor: '#F0EAE1', color: '#C8BEB5', border: '1px solid #E3DCD3' }}
            >
              <svg className="h-5 w-5 flex-shrink-0 opacity-30" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continuar con Google</span>
              <span className="ml-auto font-mono text-[9px] tracking-widest uppercase" style={{ color: '#C8BEB5' }}>no disponible aquí</span>
            </div>
          ) : null}

          {/* Google button — only shown in real browsers */}
          {!browser.inApp && (
            <>
              <button
                onClick={handleGoogleLogin}
                className="group w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5 shadow-sm mb-6"
                style={{ backgroundColor: 'white', color: '#1D1B18', border: '1px solid #E3DCD3' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#C96A3C';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(201,106,60,0.10)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#E3DCD3';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                }}
              >
                <svg className="h-5 w-5 flex-shrink-0" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar con Google
                <ArrowRight size={14} className="ml-auto group-hover:translate-x-0.5 transition-transform" style={{ color: '#8B7E74' }} />
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px" style={{ backgroundColor: '#E3DCD3' }} />
                <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: '#C8BEB5' }}>
                  acceso seguro
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: '#E3DCD3' }} />
              </div>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-5">
                {['ssl 256-bit', 'sin spam', 'cancela ya'].map(item => (
                  <span key={item} className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-1.5" style={{ color: '#C8BEB5' }}>
                    <Check size={9} strokeWidth={3} />
                    {item}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Terms */}
          <p className="mt-8 text-xs text-center leading-relaxed" style={{ color: '#C8BEB5' }}>
            Al continuar, aceptás nuestros{' '}
            <Link to="/terms" className="underline underline-offset-2 transition-colors hover:text-brand-muted" style={{ color: '#8B7E74' }}>Términos</Link>
            {' '}y{' '}
            <Link to="/privacy" className="underline underline-offset-2 transition-colors hover:text-brand-muted" style={{ color: '#8B7E74' }}>Privacidad</Link>.
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
