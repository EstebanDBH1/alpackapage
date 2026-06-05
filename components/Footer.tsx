import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 font-space text-gray-900">
      <div className="max-w-6xl mx-auto px-6 md:px-16 py-16">

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-16 mb-14">

          {/* Brand col */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-block font-bold tracking-tighter mb-5">
              alpacka.ai
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              El banco de prompts de IA para profesionales. Resultados en segundos, no en horas.
            </p>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1" />

          {/* Plataforma */}
          <div>
            <h4 className="text-[10px] text-gray-400 tracking-widest uppercase font-bold mb-5">Plataforma</h4>
            <ul className="space-y-3.5 text-sm text-gray-500">
              <li><Link to="/prompts" className="hover:text-gray-900 hover:underline transition-colors">Librería</Link></li>
              <li><Link to="/pricing" className="hover:text-gray-900 hover:underline transition-colors">Precios</Link></li>
              <li><Link to="/login" className="hover:text-gray-900 hover:underline transition-colors">Entrar</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] text-gray-400 tracking-widest uppercase font-bold mb-5">Legal</h4>
            <ul className="space-y-3.5 text-sm text-gray-500">
              <li><Link to="/terms" className="hover:text-gray-900 hover:underline transition-colors">Términos</Link></li>
              <li><Link to="/privacy" className="hover:text-gray-900 hover:underline transition-colors">Privacidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-7 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            © 2026 Alpacka.ai · Todos los derechos reservados.
          </p>
          <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">
            made with intention
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
