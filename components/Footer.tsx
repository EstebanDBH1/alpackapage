import React from 'react';
import { Link } from 'react-router-dom';
import AlpacaIcon from './AlpacaIcon';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/60 bg-background px-4 py-12 font-space text-foreground sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <Link to="/" className="flex items-center gap-2 text-lg font-medium text-foreground transition hover:opacity-80">
          <AlpacaIcon variant="light" className="h-7 w-auto" />
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/prompts" className="transition hover:text-foreground">Prompts</Link>
          <Link to="/pricing" className="transition hover:text-foreground">Precios</Link>
          <Link to="/terms" className="transition hover:text-foreground">Términos y condiciones</Link>
          <Link to="/privacy" className="transition hover:text-foreground">Política de privacidad</Link>
        </nav>

        <p className="text-xs text-muted-foreground">© 2026 Alpacka</p>
      </div>
    </footer>
  );
};

export default Footer;
