import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { supabase } from '../lib/supabase';

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

  // ── Timeline solo para el icono hamburguesa → X (nodos estáticos) ──
  useGSAP(() => {
    const menu = navRef.current!.querySelector('.mobile-menu') as HTMLElement;
    // El panel se anima solo con transform/opacity (compositor, sin reflow):
    // animar height dentro de un backdrop-blur obliga a repintar el blur en
    // cada frame y el menú se sentía lento en móvil.
    gsap.set(menu, { autoAlpha: 0, y: -8, scale: 0.98, transformOrigin: 'top center' });

    // Estado base de las 3 barras: centradas vertical/horizontalmente y separadas ±6px.
    // GSAP es el dueño de TODAS las transformaciones para que la X cierre exacta.
    gsap.set('.hb-line', { xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });
    gsap.set('.hb-top', { y: -6 });
    gsap.set('.hb-mid', { y: 0 });
    gsap.set('.hb-bot', { y: 6 });

    tl.current = gsap.timeline({
      paused: true,
      defaults: { duration: 0.3, ease: 'power2.inOut' },
    })
      .to('.hb-top', { y: 0, rotate: 45 }, 0)
      .to('.hb-mid', { opacity: 0, scaleX: 0, duration: 0.2, ease: 'power2.out' }, 0)
      .to('.hb-bot', { y: 0, rotate: -45 }, 0);
  }, { scope: navRef });

  // ── Abre / cierra el panel. Los .mobile-link se re-seleccionan en cada
  //    apertura: si cambia la sesión, React reemplaza esos nodos y un timeline
  //    construido una sola vez se quedaría apuntando a nodos viejos. ──
  useGSAP(() => {
    if (!tl.current) return;
    const menu = navRef.current!.querySelector('.mobile-menu') as HTMLElement;

    if (isOpen) {
      tl.current.play();
      gsap.to(menu, { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: 'power3.out', overwrite: 'auto' });
      gsap.fromTo(
        '.mobile-link',
        { autoAlpha: 0, y: -6 },
        { autoAlpha: 1, y: 0, stagger: 0.035, duration: 0.2, ease: 'power2.out', delay: 0.05, overwrite: 'auto' },
      );
    } else {
      tl.current.reverse();
      gsap.to(menu, { autoAlpha: 0, y: -8, scale: 0.98, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
    }
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
    <nav ref={navRef} className="sticky top-0 z-50 w-full px-3 pt-3 font-space text-foreground sm:px-6">
      <div className="relative mx-auto max-w-6xl rounded-2xl border border-border/50 bg-card/50 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_oklch(0.93_0.02_85_/_0.06)] backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-3 sm:px-4">

        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition hover:bg-secondary/60"
          aria-label="Inicio"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">A</span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-medium text-foreground">Alpacka.ai</span>
            <span className="text-xs text-muted-foreground">Banco de Prompts</span>
          </span>
        </Link>

        {/* Navegación de escritorio */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/prompts" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground">Prompts</Link>
          <Link to="/pricing" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground">Precios</Link>

          <span className="mx-2 h-4 w-px bg-border" />

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
              >
                Mi cuenta
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary/60 hover:text-accent"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
              >
                Acceder
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="ml-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_0_20px_oklch(0.86_0.09_90_/_0.2)] transition hover:opacity-90"
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
          <span className="hb-line hb-top absolute top-1/2 left-1/2 h-0.5 w-6 bg-foreground rounded-full" />
          <span className="hb-line hb-mid absolute top-1/2 left-1/2 h-0.5 w-6 bg-foreground rounded-full" />
          <span className="hb-line hb-bot absolute top-1/2 left-1/2 h-0.5 w-6 bg-foreground rounded-full" />
        </button>
        </div>

        {/* Menú móvil: panel flotante bajo el navbar (siempre en el DOM; GSAP anima solo transform/opacity) */}
        <div className="mobile-menu invisible md:hidden absolute inset-x-0 top-full mt-2 rounded-2xl border border-border/50 bg-card/90 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_oklch(0.93_0.02_85_/_0.06)] backdrop-blur-xl">
          <div className="flex flex-col gap-1 px-3 py-3 text-sm font-medium">
          <Link to="/prompts" className="mobile-link rounded-xl px-3 py-2.5 text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground" onClick={() => setIsOpen(false)}>Prompts</Link>
          <Link to="/pricing" className="mobile-link rounded-xl px-3 py-2.5 text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground" onClick={() => setIsOpen(false)}>Precios</Link>

          <div className="mobile-link h-px bg-border/60 w-full my-2" />

          {user ? (
            <>
              <Link to="/dashboard" className="mobile-link rounded-xl px-3 py-2.5 text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground" onClick={() => setIsOpen(false)}>Mi cuenta</Link>
              <button onClick={handleLogout} className="mobile-link rounded-xl px-3 py-2.5 text-left text-muted-foreground transition hover:bg-secondary/60 hover:text-accent">Salir</button>
            </>
          ) : (
            <>
              <button
                onClick={() => { navigate('/login'); setIsOpen(false); }}
                className="mobile-link rounded-xl px-3 py-2.5 text-left text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
              >
                Acceder
              </button>
              <button
                onClick={() => { navigate('/pricing'); setIsOpen(false); }}
                className="mobile-link mt-2 rounded-full bg-primary px-5 py-3 text-center font-medium text-primary-foreground shadow-[0_0_20px_oklch(0.86_0.09_90_/_0.2)] transition hover:opacity-90"
              >
                Acceso total
              </button>
            </>
          )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
