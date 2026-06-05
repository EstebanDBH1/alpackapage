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
    <div className="bg-white text-gray-900 font-space">
      <div className="w-full max-w-md mx-auto px-6 py-16 text-center">

        {/* Back */}
        <Link
          to="/"
          className="text-xs uppercase tracking-wider mb-12 hover:underline flex items-center gap-2 mx-auto w-fit"
        >
          <span>←</span> Volver al inicio
        </Link>

        {/* Login box */}
        <div className="border border-gray-200 p-8 md:p-12 bg-white flex flex-col items-center">

          <span className="inline-block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-6">
            ALPACKA.AI Acceso
          </span>

          <h2 className="font-bold text-2xl uppercase tracking-tight leading-tight mb-3">
            Iniciar Sesión
          </h2>

          <p className="text-gray-500 text-xs leading-relaxed mb-8 max-w-xs mx-auto">
            Accede a tu cuenta para guardar prompts y administrar tus preferencias de forma instantánea.
          </p>

          {/* In-app browser warning */}
          {browser.inApp && (
            <div className="w-full border border-gray-200 bg-gray-50 p-4 mb-6 text-left">
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Para iniciar sesión con Google, abre esta página en {browser.isAndroid ? 'Chrome' : 'Safari'}.
              </p>

              {showIOSInstructions && (
                <div className="mb-3 p-3 text-xs text-gray-600 bg-white border border-gray-200">
                  <p>Toca <strong>···</strong> o <strong>⋮</strong> y selecciona <strong>"Abrir en Safari"</strong>.</p>
                </div>
              )}

              <button
                onClick={handleOpenInBrowser}
                className="w-full flex items-center justify-center gap-2 border border-gray-900 bg-gray-900 text-white hover:bg-white hover:text-gray-900 px-4 py-3 text-xs uppercase tracking-wider font-bold transition-all duration-300"
              >
                <ExternalLink size={13} />
                {browser.isAndroid ? 'Continuar en Chrome' : 'Continuar en Safari'}
              </button>
            </div>
          )}

          {/* Google button — disabled inside WebView */}
          {browser.inApp ? (
            <div className="w-full flex items-center justify-center gap-3 border border-gray-200 text-gray-300 px-6 py-4 text-xs uppercase tracking-wider font-bold cursor-not-allowed mb-6">
              <svg className="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="currentColor">
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
              className="flex items-center justify-center gap-3 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-4 text-xs uppercase tracking-wider font-bold transition-all duration-300 w-full mb-6"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.84-4.53z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continuar con Google</span>
            </button>
          )}

          {/* Terms */}
          <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed max-w-[250px]">
            Al continuar, aceptas nuestros{' '}
            <Link to="/terms" className="underline hover:text-gray-900">Términos</Link>
            {' '}y{' '}
            <Link to="/privacy" className="underline hover:text-gray-900">Privacidad</Link>.
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
