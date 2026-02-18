import React from 'react';
import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-16 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <span className="font-bold text-2xl tracking-tighter group-hover:opacity-80 transition-opacity">
                Alpacka.<span className="text-gray-400">ai</span>
              </span>
            </Link>
            <p className="text-gray-400 font-sans max-w-sm text-sm">
              El principal banco de internet para prompts de IA de alta calidad.
              Acceso ilimitado para creadores, desarrolladores y empresas.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-500">Plataforma</h4>
            <ul className="space-y-3 font-mono text-sm">
              <li><Link to="/prompts" className="hover:text-gray-300">Librería de Prompts</Link></li>
              <li><Link to="/pricing" className="hover:text-gray-300">Precios</Link></li>
              <li><Link to="/login" className="hover:text-gray-300">Entrar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-500">Soporte</h4>
            <ul className="space-y-3 font-mono text-sm">
              <li><a href="#" className="hover:text-gray-300">Ayuda</a></li>
              <li><a href="#" className="hover:text-gray-300">Contacto</a></li>
              <li><Link to="/terms" className="hover:text-gray-300">Términos de Servicio</Link></li>
              <li><Link to="/privacy" className="hover:text-gray-300">Política de Privacidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-gray-600">
          <p>© 2025. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;