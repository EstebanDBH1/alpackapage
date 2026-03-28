import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark py-16 md:py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-16 mb-14 md:mb-16">

          {/* Brand col */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-5 group">
              <span className="font-display italic font-light text-2xl text-white/60 group-hover:text-white/80 transition-colors">
                alpacka<span className="not-italic font-sans font-bold text-white/30 text-base">.ai</span>
              </span>
            </Link>
            <p className="text-white/25 text-sm leading-relaxed max-w-xs">
              El banco de prompts de IA para profesionales. Resultados en segundos, no en horas.
            </p>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1"></div>

          {/* Plataforma */}
          <div>
            <h4 className="font-mono text-[10px] text-white/20 tracking-[0.2em] uppercase mb-5">Plataforma</h4>
            <ul className="space-y-3.5 text-sm text-white/30">
              <li><Link to="/prompts" className="hover:text-white/60 transition-colors">Librería</Link></li>
              <li><Link to="/pricing" className="hover:text-white/60 transition-colors">Precios</Link></li>
              <li><Link to="/login" className="hover:text-white/60 transition-colors">Entrar</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-mono text-[10px] text-white/20 tracking-[0.2em] uppercase mb-5">Legal</h4>
            <ul className="space-y-3.5 text-sm text-white/30">
              <li><Link to="/terms" className="hover:text-white/60 transition-colors">Términos</Link></li>
              <li><Link to="/privacy" className="hover:text-white/60 transition-colors">Privacidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-7 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/15 font-mono">© 2026 Alpacka.ai · Todos los derechos reservados.</p>
          <p className="text-xs text-white/10 font-mono tracking-wider">made with intention</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
