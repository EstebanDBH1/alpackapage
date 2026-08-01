import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, isAdminUser } from '../lib/supabase';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';
import AlpacaIcon from '../components/AlpacaIcon';
import {
  BG, BG_WARM, TEXT, TEXT_MED, TEXT_DIM, BORDER, GREEN, FONT,
  useEuclidFont, LandingStyles,
} from '../components/landingKit';

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
  <svg width="17" height="17" viewBox="0 0 24 24" style={{ flexShrink: 0, opacity: muted ? 0.4 : 1 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const browser = React.useMemo(() => detectInAppBrowser(), []);

  useEuclidFont();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      // El admin va a su panel salvo que pidiera otra ruta explícitamente.
      const target = isAdminUser(session.user) && redirect === '/dashboard' ? '/admin' : redirect;
      navigate(target, { replace: true });
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
    <div
      className="bp-scope"
      style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: FONT, display: 'flex', flexDirection: 'column' }}
    >
      <LandingStyles />

      {/* ── Header mínimo ── */}
      <header
        style={{
          height: 60, borderBottom: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.86)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 w-full flex items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="Inicio">
            <AlpacaIcon className="h-7 w-auto" />
          </Link>
          <Link
            to="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, color: TEXT_MED, textDecoration: 'none' }}
          >
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>
      </header>

      {/* ── Acceso ── */}
      <main className="flex-1 flex items-start justify-center px-5 py-14 sm:py-20">
        <div className="bp-up w-full" style={{ maxWidth: 420 }}>

          <div
            style={{
              backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 22,
              boxShadow: '0 14px 44px rgba(0,0,0,0.06)', overflow: 'hidden',
            }}
          >
            <div style={{ padding: '34px 30px 30px' }}>
              <div
                className="inline-flex items-center gap-2 rounded-full"
                style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, padding: '5px 13px', marginBottom: 20 }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: TEXT_MED }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: TEXT_MED }}>
                  Acceso · alpacka.ai
                </span>
              </div>

              <h1 style={{ fontWeight: 600, fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 10 }}>
                Iniciar sesión
              </h1>
              <p style={{ color: TEXT_MED, fontSize: 15, lineHeight: 1.7, marginBottom: 26 }}>
                Entra con tu cuenta de Google para acceder al banco de prompts, al generador y a tus prompts guardados.
              </p>

              {/* Aviso de navegador in-app */}
              {browser.inApp && (
                <div
                  style={{
                    backgroundColor: '#fff7e8', border: '1px solid #fbe3b0', borderRadius: 14,
                    padding: '16px 16px 14px', marginBottom: 20,
                  }}
                >
                  <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#8a5b00', marginBottom: 12 }}>
                    Estás dentro de {browser.appName}. Para iniciar sesión con Google, abre esta página en{' '}
                    {browser.isAndroid ? 'Chrome' : 'Safari'}.
                  </p>

                  {showIOSInstructions && (
                    <div
                      style={{
                        backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 11,
                        padding: '11px 13px', marginBottom: 12, fontSize: 12.5, color: TEXT_MED, lineHeight: 1.6,
                      }}
                    >
                      Toca <strong style={{ color: TEXT }}>···</strong> o <strong style={{ color: TEXT }}>⋮</strong> y selecciona{' '}
                      <strong style={{ color: TEXT }}>"Abrir en Safari"</strong>.
                    </div>
                  )}

                  <button
                    onClick={handleOpenInBrowser}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      backgroundColor: '#1a1500', color: '#fff', border: 'none', cursor: 'pointer',
                      borderRadius: 11, padding: '12px 16px', fontSize: 14, fontWeight: 600,
                    }}
                  >
                    <ExternalLink size={14} />
                    {browser.isAndroid ? 'Continuar en Chrome' : 'Continuar en Safari'}
                  </button>
                </div>
              )}

              {/* Botón de Google — desactivado dentro de un WebView */}
              {browser.inApp ? (
                <div
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 18px',
                    fontSize: 14.5, fontWeight: 600, color: TEXT_DIM, cursor: 'not-allowed',
                  }}
                >
                  <GoogleLogo muted />
                  No disponible aquí
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 12,
                    padding: '14px 18px', fontSize: 14.5, fontWeight: 600, color: TEXT,
                    cursor: 'pointer',
                  }}
                >
                  <GoogleLogo />
                  Continuar con Google
                </button>
              )}

              <p style={{ fontSize: 12.5, color: TEXT_DIM, lineHeight: 1.7, marginTop: 18 }}>
                Al continuar, aceptas nuestros{' '}
                <Link to="/terms" style={{ color: TEXT_MED, textDecoration: 'underline' }}>Términos</Link> y la{' '}
                <Link to="/privacy" style={{ color: TEXT_MED, textDecoration: 'underline' }}>Privacidad</Link>.
              </p>
            </div>

            {/* Qué incluye la cuenta */}
            <div style={{ backgroundColor: BG_WARM, borderTop: `1px solid ${BORDER}`, padding: '18px 30px' }}>
              {[
                'Acceso a tus prompts guardados',
                'Generador de prompts con IA',
                'Tu suscripción y facturación en un panel',
              ].map(t => (
                <div key={t} className="flex items-start gap-2.5" style={{ padding: '4px 0' }}>
                  <Check size={13} strokeWidth={3} style={{ color: GREEN, flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: 13.5, color: TEXT_MED, lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: TEXT_DIM, marginTop: 20 }}>
            ¿Todavía no tienes cuenta?{' '}
            <Link to="/pricing" style={{ color: TEXT, fontWeight: 600, textDecoration: 'none' }}>
              Ver el plan →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
