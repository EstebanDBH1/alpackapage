import React from 'react';
import { Bot } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(redirect, { replace: true });
      }
    });
  }, [navigate, redirect]);

  const handleLogin = () => {
    navigate(redirect);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8 bg-brand-bg">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-black text-white rounded-none flex items-center justify-center shadow-lg">
              <Bot size={40} strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-black mb-2">
            bienvenido de nuevo
          </h2>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
            acceso seguro a la bóveda
          </p>
        </div>

        <div className="mt-10">
          <div className="bg-brand-bg border border-gray-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none p-8">
            <div className="mb-6 text-center">
              <p className="text-sm font-bold mb-1">Inicia sesión o Regístrate</p>
              <p className="text-xs text-gray-500 font-sans">Usa tu cuenta de Google para acceder a tu suscripción.</p>
            </div>

            <button
              className="group w-full flex items-center justify-center gap-3 px-4 py-4 border-2 border-black bg-white text-sm font-bold text-black hover:bg-black hover:text-white transition-all duration-200"
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}${redirect}`,
                    },
                  });
                  if (error) throw error;
                } catch (error) {
                  alert('Error al iniciar sesión. Por favor intenta de nuevo.');
                }
              }}
            >
              <svg className="h-5 w-5 group-hover:invert" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              CONTINUAR CON GOOGLE
            </button>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-brand-bg text-gray-400 font-mono text-[10px] uppercase">Con la confianza de 45.2k+ usuarios</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 font-mono">
              Al continuar, aceptas nuestros <Link to="/terms" className="underline hover:text-black">Términos</Link> y <Link to="/privacy" className="underline hover:text-black">Política de Privacidad</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;