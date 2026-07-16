import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  const checkUser = async () => {
    // getSession() lee la sesión local al instante; getUser() hace una petición
    // de red y dejaba el navbar en "Acceder" varios segundos tras recargar.
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { subscription.unsubscribe(); };
  }, []);

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
    <nav className="sticky top-0 z-50 w-full px-3 pt-3 font-space text-foreground sm:px-6">
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
          <Link to="/skills" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground">Skills</Link>
          <Link to="/blog" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground">Blog</Link>
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

        {/* Botón hamburguesa (móvil): las 3 barras se transforman en X con transiciones CSS */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex h-6 w-6 flex-col items-center justify-center gap-[5px] focus:outline-none"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
        >
          <span className={`h-0.5 w-6 rounded-full bg-foreground transition-transform duration-300 ${isOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 rounded-full bg-foreground transition-all duration-200 ${isOpen ? 'scale-x-0 opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 rounded-full bg-foreground transition-transform duration-300 ${isOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
        </div>

        {/* Menú móvil: siempre en el DOM; solo se transicionan transform/opacity
            (animar height dentro de un backdrop-blur repinta el blur en cada frame) */}
        <div className={`md:hidden absolute inset-x-0 top-full mt-2 origin-top rounded-2xl border border-border/50 bg-card/90 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_oklch(0.93_0.02_85_/_0.06)] backdrop-blur-xl transition-all duration-200 ease-out ${isOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-2 scale-[0.98] opacity-0'}`}>
          <div className="flex flex-col gap-1 px-3 py-3 text-sm font-medium">
          <Link to="/prompts" className="rounded-xl px-3 py-2.5 text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground" onClick={() => setIsOpen(false)}>Prompts</Link>
          <Link to="/skills" className="rounded-xl px-3 py-2.5 text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground" onClick={() => setIsOpen(false)}>Skills</Link>
          <Link to="/blog" className="rounded-xl px-3 py-2.5 text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground" onClick={() => setIsOpen(false)}>Blog</Link>
          <Link to="/pricing" className="rounded-xl px-3 py-2.5 text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground" onClick={() => setIsOpen(false)}>Precios</Link>

          <div className="h-px bg-border/60 w-full my-2" />

          {user ? (
            <>
              <Link to="/dashboard" className="rounded-xl px-3 py-2.5 text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground" onClick={() => setIsOpen(false)}>Mi cuenta</Link>
              <button onClick={handleLogout} className="rounded-xl px-3 py-2.5 text-left text-muted-foreground transition hover:bg-secondary/60 hover:text-accent">Salir</button>
            </>
          ) : (
            <>
              <button
                onClick={() => { navigate('/login'); setIsOpen(false); }}
                className="rounded-xl px-3 py-2.5 text-left text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
              >
                Acceder
              </button>
              <button
                onClick={() => { navigate('/pricing'); setIsOpen(false); }}
                className="mt-2 rounded-full bg-primary px-5 py-3 text-center font-medium text-primary-foreground shadow-[0_0_20px_oklch(0.86_0.09_90_/_0.2)] transition hover:opacity-90"
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
