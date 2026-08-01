import React from 'react';
import { Link } from 'react-router-dom';
import AlpacaIcon from './AlpacaIcon';
import { BG, TEXT, TEXT_MED, TEXT_DIM, BORDER, FONT, useEuclidFont, LandingStyles } from './landingKit';

/* Footer de la app — mismo lenguaje visual claro que el header y las landings. */

const LINKS = [
  { to: '/prompts', label: 'Prompts' },
  { to: '/generador', label: 'Generador' },
  { to: '/pricing', label: 'Precios' },
  { to: '/blog', label: 'Blog' },
  { to: '/terms', label: 'Términos' },
  { to: '/privacy', label: 'Privacidad' },
];

const Footer: React.FC = () => {
  useEuclidFont();

  return (
    <footer
      className="bp-scope"
      style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}`, color: TEXT, fontFamily: FONT }}
    >
      <LandingStyles />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col items-center gap-6 text-center">
        <Link to="/" className="flex items-center" aria-label="Inicio">
          <AlpacaIcon className="h-7 w-auto" />
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
          {LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              style={{ fontSize: 13.5, color: TEXT_MED, textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = TEXT_MED; }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <p style={{ fontSize: 12.5, color: TEXT_DIM }}>Alpacka © {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};

export default Footer;
