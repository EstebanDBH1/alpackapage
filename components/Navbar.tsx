import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AlpacaIcon from './AlpacaIcon';
import {
  BG, BG_WARM, TEXT, TEXT_MED, BORDER, FONT,
  useEuclidFont, LandingStyles, Cta,
} from './landingKit';

/* Header de la app — mismo lenguaje visual que las landings
   (/ y /bank-prompts): fondo claro, Euclid Circular y CTA amarillo. */

const LINKS = [
  { to: '/prompts', label: 'Prompts' },
  { to: '/generador', label: 'Generador' },
  { to: '/skills', label: 'Skills' },
  { to: '/blog', label: 'Blog' },
  { to: '/pricing', label: 'Precios' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEuclidFont();

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

  const linkStyle: React.CSSProperties = {
    fontSize: 13.5, fontWeight: 500, color: TEXT_MED, textDecoration: 'none',
    padding: '6px 2px', transition: 'color .15s',
  };

  const mobileLinkStyle: React.CSSProperties = {
    fontSize: 14.5, fontWeight: 500, color: TEXT_MED, textDecoration: 'none',
    padding: '11px 14px', borderRadius: 10, display: 'block',
  };

  return (
    <nav
      className="bp-scope"
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.86)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${BORDER}`,
        fontFamily: FONT,
      }}
    >
      <LandingStyles />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between" style={{ height: 60 }}>
        <Link to="/" className="flex items-center" aria-label="Inicio">
          <AlpacaIcon className="h-7 w-auto" />
        </Link>

        {/* Navegación de escritorio */}
        <div className="hidden md:flex items-center gap-7">
          {LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              style={linkStyle}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = TEXT_MED; }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" style={linkStyle}>Mi cuenta</Link>
              <button
                onClick={handleLogout}
                style={{ ...linkStyle, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>Acceder</Link>
              <Cta to="/pricing" size="sm" label="Acceso total" />
            </>
          )}
        </div>

        {/* Botón hamburguesa (móvil) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex h-6 w-6 flex-col items-center justify-center gap-[5px] focus:outline-none"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
        >
          <span
            className={`h-0.5 w-6 rounded-full transition-transform duration-300 ${isOpen ? 'translate-y-[7px] rotate-45' : ''}`}
            style={{ backgroundColor: TEXT }}
          />
          <span
            className={`h-0.5 w-6 rounded-full transition-all duration-200 ${isOpen ? 'scale-x-0 opacity-0' : ''}`}
            style={{ backgroundColor: TEXT }}
          />
          <span
            className={`h-0.5 w-6 rounded-full transition-transform duration-300 ${isOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
            style={{ backgroundColor: TEXT }}
          />
        </button>
      </div>

      {/* Menú móvil: siempre en el DOM; solo se transicionan transform/opacity */}
      <div
        className={`md:hidden absolute inset-x-0 top-full transition-all duration-200 ease-out ${
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
        }`}
        style={{
          backgroundColor: BG,
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: '0 14px 34px rgba(0,0,0,0.07)',
        }}
      >
        <div className="px-4 py-3 flex flex-col gap-0.5">
          {LINKS.map(l => (
            <Link key={l.to} to={l.to} style={mobileLinkStyle} onClick={() => setIsOpen(false)}>
              {l.label}
            </Link>
          ))}

          <div style={{ height: 1, backgroundColor: BORDER, margin: '8px 0' }} />

          {user ? (
            <>
              <Link to="/dashboard" style={mobileLinkStyle} onClick={() => setIsOpen(false)}>Mi cuenta</Link>
              <button
                onClick={handleLogout}
                style={{ ...mobileLinkStyle, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{ ...mobileLinkStyle, backgroundColor: BG_WARM }}
                onClick={() => setIsOpen(false)}
              >
                Acceder
              </Link>
              <div className="mt-2" onClick={() => setIsOpen(false)}>
                <Cta to="/pricing" full label="Acceso total" />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
