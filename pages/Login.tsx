import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ExternalLink } from 'lucide-react';

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
    <div className="relative min-h-screen overflow-x-clip bg-background bg-radial-glow font-space text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

      <div className="relative mx-auto w-full max-w-md px-4 py-16 text-center sm:px-6 md:py-20">

        {/* Back */}
        <Link
          to="/"
          className="mx-auto mb-10 flex w-fit items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
        >
          <span>←</span> Volver al inicio
        </Link>

        {/* Login box */}
        <div className="relative">
          <div className="absolute -inset-10 -z-10 rounded-full bg-primary/5 blur-3xl"></div>

          <div className="flex flex-col items-center rounded-3xl border border-border/70 bg-card p-8 shadow-[0_0_60px_oklch(0.86_0.09_90_/_0.06)] sm:p-12">

            <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-border/60 bg-secondary px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]"></span>
              <span>Alpacka.ai · Acceso</span>
            </div>

            <h2 className="mt-6 text-2xl font-medium leading-tight tracking-tight text-foreground sm:text-3xl">
              Iniciar sesión
            </h2>

            <p className="mx-auto mt-3 mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Accede a tu cuenta para guardar prompts y administrar tus preferencias de forma instantánea.
            </p>

            {/* In-app browser warning */}
            {browser.inApp && (
              <div className="mb-6 w-full rounded-2xl border border-accent/40 bg-secondary p-4 text-left">
                <p className="mb-3 text-xs leading-relaxed text-foreground/90">
                  Para iniciar sesión con Google, abre esta página en {browser.isAndroid ? 'Chrome' : 'Safari'}.
                </p>

                {showIOSInstructions && (
                  <div className="mb-3 rounded-xl border border-border/60 bg-card p-3 text-xs text-muted-foreground">
                    <p>Toca <strong className="text-foreground">···</strong> o <strong className="text-foreground">⋮</strong> y selecciona <strong className="text-foreground">"Abrir en Safari"</strong>.</p>
                  </div>
                )}

                <button
                  onClick={handleOpenInBrowser}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  <ExternalLink size={14} />
                  {browser.isAndroid ? 'Continuar en Chrome' : 'Continuar en Safari'}
                </button>
              </div>
            )}

            {/* Google button — disabled inside WebView */}
            {browser.inApp ? (
              <div className="mb-6 flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-border px-6 py-4 text-sm font-medium text-muted-foreground/60">
                <svg className="h-4 w-4 opacity-40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.84-4.53z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>No disponible aquí</span>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="mb-6 flex w-full items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 text-sm font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.84-4.53z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continuar con Google</span>
              </button>
            )}

            {/* Terms */}
            <p className="max-w-[280px] text-xs leading-relaxed text-muted-foreground">
              Al continuar, aceptas nuestros{' '}
              <Link to="/terms" className="underline transition hover:text-foreground">Términos</Link>
              {' '}y{' '}
              <Link to="/privacy" className="underline transition hover:text-foreground">Privacidad</Link>.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
