import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { supabase } from '../lib/supabase';
import AlpacaIcon from './AlpacaIcon';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  const navRef = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  // ── Construye el timeline una sola vez (scope = nav, cleanup automático) ──
  useGSAP(() => {
    const menu = navRef.current!.querySelector('.mobile-menu') as HTMLElement;
    gsap.set(menu, { height: 0, overflow: 'hidden' });

    // Estado base de las 3 barras: centradas vertical/horizontalmente y separadas ±6px.
    // GSAP es el dueño de TODAS las transformaciones para que la X cierre exacta.
    gsap.set('.hb-line', { xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });
    gsap.set('.hb-top', { y: -6 });
    gsap.set('.hb-mid', { y: 0 });
    gsap.set('.hb-bot', { y: 6 });

    tl.current = gsap.timeline({
      paused: true,
      defaults: { duration: 0.4, ease: 'power3.inOut' },
    })
      // Hamburguesa → X (todas convergen al centro)
      .to('.hb-top', { y: 0, rotate: 45 }, 0)
      .to('.hb-mid', { opacity: 0, scaleX: 0, duration: 0.25, ease: 'power2.out' }, 0)
      .to('.hb-bot', { y: 0, rotate: -45 }, 0)
      // Reveal del panel
      .to(menu, { height: 'auto', duration: 0.45 }, 0)
      // Stagger de los enlaces
      .from('.mobile-link', { autoAlpha: 0, y: -10, stagger: 0.06, duration: 0.3, ease: 'power2.out' }, 0.15);
  }, { scope: navRef });

  // ── Reproduce / revierte según el estado ──
  useGSAP(() => {
    if (!tl.current) return;
    if (isOpen) tl.current.play();
    else tl.current.reverse();
  }, { dependencies: [isOpen], scope: navRef });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav ref={navRef} className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 font-space text-gray-900">
      <div className="flex justify-between items-center px-6 py-4 md:px-10">

        {/* Logo — solo el icono */}
        <Link to="/" className="hover:opacity-70 transition-opacity" aria-label="Inicio">
          <AlpacaIcon className="w-5 h-auto" />
        </Link>

        {/* Navegación de escritorio */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/prompts" className="uppercase hover:underline">Prompts</Link>
          <Link to="/pricing" className="uppercase hover:underline">Precios</Link>

          <span className="w-px h-4 bg-gray-200" />

          {user ? (
            <div className="flex items-center gap-4 text-xs">
              <Link
                to="/dashboard"
                className="text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200 pb-0.5 hover:text-gray-900 transition-colors"
              >
                Mi cuenta
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-red-500 transition-colors uppercase font-bold tracking-wider"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-5 text-xs">
              <button
                onClick={() => navigate('/login')}
                className="hover:underline font-bold uppercase tracking-wider"
              >
                Acceder
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-4 py-2 uppercase tracking-wider font-bold transition-all duration-300"
              >
                Acceso total
              </button>
            </div>
          )}
        </div>

        {/* Botón hamburguesa (móvil) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative w-6 h-6 focus:outline-none"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
        >
          <span className="hb-line hb-top absolute top-1/2 left-1/2 h-0.5 w-6 bg-gray-900 rounded-full" />
          <span className="hb-line hb-mid absolute top-1/2 left-1/2 h-0.5 w-6 bg-gray-900 rounded-full" />
          <span className="hb-line hb-bot absolute top-1/2 left-1/2 h-0.5 w-6 bg-gray-900 rounded-full" />
        </button>
      </div>

      {/* Menú móvil (siempre en el DOM; animado con GSAP) */}
      <div className="mobile-menu md:hidden bg-white border-t border-gray-100">
        <div className="flex flex-col gap-4 px-6 py-5 text-sm uppercase tracking-wider font-bold">
          <Link to="/prompts" className="mobile-link hover:text-gray-500" onClick={() => setIsOpen(false)}>Prompts</Link>
          <Link to="/pricing" className="mobile-link hover:text-gray-500" onClick={() => setIsOpen(false)}>Precios</Link>

          <div className="mobile-link h-px bg-gray-100 w-full my-1" />

          {user ? (
            <>
              <Link to="/dashboard" className="mobile-link hover:text-gray-500" onClick={() => setIsOpen(false)}>Mi cuenta</Link>
              <button onClick={handleLogout} className="mobile-link hover:text-red-500 text-left">Salir</button>
            </>
          ) : (
            <>
              <button
                onClick={() => { navigate('/login'); setIsOpen(false); }}
                className="mobile-link hover:text-gray-500 text-left"
              >
                Acceder
              </button>
              <button
                onClick={() => { navigate('/pricing'); setIsOpen(false); }}
                className="mobile-link border border-gray-900 bg-gray-900 text-white hover:bg-white hover:text-gray-900 px-4 py-3 text-center transition-all duration-300"
              >
                Acceso total
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
