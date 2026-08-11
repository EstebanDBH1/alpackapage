import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, isAdminUser } from '../lib/supabase';
import { Check, ExternalLink } from 'lucide-react';
import {
  BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, GREEN, AMBER, MONO,
} from '../components/darkKit';

/* Login — mismo lenguaje visual oscuro estilo skills.sh que el resto de la
   app. El header/nav lo aporta el layout compartido (darkKit). */

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
    <div style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: MONO }}>

      <main className="flex items-start justify-center px-5 py-14 sm:py-20">
        <div className="w-full" style={{ maxWidth: 420 }}>

          <div
            style={{
              backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '32px 28px 28px' }}>
              <div
                className="inline-flex items-center gap-2 rounded-full"
                style={{ backgroundColor: PANEL, border: `1px solid ${BORDER}`, padding: '5px 13px', marginBottom: 20 }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: GREEN }} />
                <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED }}>
                  Acceso · alpacka.ai
                </span>
              </div>

              <h1 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 10, color: TEXT }}>
                Iniciar sesión
              </h1>
              <p style={{ fontFamily: MONO, color: MUTED, fontSize: 13.5, lineHeight: 1.7, marginBottom: 26 }}>
                Entra con tu cuenta de Google para acceder al directorio de prompts, al generador y a tus prompts guardados.
              </p>

              {/* Aviso de navegador in-app */}
              {browser.inApp && (
                <div
                  style={{
                    backgroundColor: 'rgba(255,178,36,0.06)', border: '1px solid rgba(255,178,36,0.25)',
                    borderRadius: 12, padding: '15px 15px 13px', marginBottom: 20,
                  }}
                >
                  <p style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.6, color: AMBER, marginBottom: 12 }}>
                    Estás dentro de {browser.appName}. Para iniciar sesión con Google, abre esta página en{' '}
                    {browser.isAndroid ? 'Chrome' : 'Safari'}.
                  </p>

                  {showIOSInstructions && (
                    <div
                      style={{
                        backgroundColor: PANEL, border: `1px solid ${BORDER}`, borderRadius: 9,
                        padding: '10px 12px', marginBottom: 12, fontFamily: MONO, fontSize: 12, color: MUTED, lineHeight: 1.6,
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
                      fontFamily: MONO, backgroundColor: TEXT, color: '#000', border: 'none', cursor: 'pointer',
                      borderRadius: 9, padding: '11px 16px', fontSize: 13, fontWeight: 700,
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
                    fontFamily: MONO, border: `1px solid ${BORDER_SOFT}`, borderRadius: 10, padding: '13px 18px',
                    fontSize: 13.5, fontWeight: 600, color: DIM, cursor: 'not-allowed',
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
                    fontFamily: MONO, backgroundColor: '#ffffff', border: '1px solid #ffffff', borderRadius: 10,
                    padding: '13px 18px', fontSize: 13.5, fontWeight: 700, color: '#111',
                    cursor: 'pointer', transition: 'opacity .15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                >
                  <GoogleLogo />
                  Continuar con Google
                </button>
              )}

              <p style={{ fontFamily: MONO, fontSize: 11.5, color: DIM, lineHeight: 1.7, marginTop: 18 }}>
                Al continuar, aceptas nuestros{' '}
                <Link to="/terms" style={{ color: MUTED, textDecoration: 'underline' }}>Términos</Link> y la{' '}
                <Link to="/privacy" style={{ color: MUTED, textDecoration: 'underline' }}>Privacidad</Link>.
              </p>
            </div>

            {/* Qué incluye la cuenta */}
            <div style={{ backgroundColor: PANEL, borderTop: `1px solid ${BORDER_SOFT}`, padding: '17px 28px' }}>
              {[
                'Acceso a tus prompts guardados',
                'Generador de prompts con IA',
                'Tu suscripción y facturación en un panel',
              ].map(t => (
                <div key={t} className="flex items-start gap-2.5" style={{ padding: '4px 0' }}>
                  <Check size={13} strokeWidth={3} style={{ color: GREEN, flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontFamily: MONO, fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontFamily: MONO, fontSize: 12.5, color: DIM, marginTop: 20 }}>
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
