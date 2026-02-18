import React from 'react';
import { StatItem } from '../types';
import { ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats: StatItem[] = [
  { value: '1.2M+', label: 'prompts accesibles' },
  { value: '45.2k', label: 'miembros activos' },
  { value: '$3.90', label: 'tarifa plana mensual' },
];

const Hero: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Stats Header */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 text-xs sm:text-sm font-mono text-gray-500 uppercase tracking-widest">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-brand-text font-bold text-lg sm:text-xl block mb-1">{stat.value}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
          desbloquea <br className="hidden md:block" />
          <span className="text-gray-400">toda la</span> <span className="bg-brand-surface px-2 rounded-lg">bóveda</span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10 font-sans leading-relaxed">
          Deja de adivinar. Empieza a crear. <br />
          Obtén acceso ilimitado al mayor banco de prompts probados del mundo por solo $3.90/mes.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/pricing" className="w-full sm:w-auto">
            <button className="w-full bg-brand-text text-brand-bg px-8 py-4 rounded-md font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-gray-200 uppercase tracking-tight">
              ACCESO ILIMITADO <ArrowRight size={20} />
            </button>
          </Link>
          <Link to="/prompts" className="w-full sm:w-auto">
            <button className="w-full bg-brand-surface text-brand-text border border-gray-200 px-8 py-4 rounded-md font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 uppercase tracking-tight">
              VER PACK DE MUESTRA <Lock size={16} className="text-gray-400" />
            </button>
          </Link>
        </div>

        <div className="mt-8 text-xs font-mono text-gray-400 uppercase tracking-widest">
          cancela cuando quieras. <Link to="/login" className="text-brand-text hover:underline">acceso instantáneo al registrarte →</Link>
        </div>
      </div>

      {/* Featured In */}
      <div className="mt-24 border-t border-brand-surface pt-12">
        <p className="text-center font-mono text-xs text-gray-400 uppercase tracking-widest mb-8">
          Con la confianza de equipos en
        </p>
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
          <h3 className="text-2xl font-black font-sans">WIRED</h3>
          <h3 className="text-2xl font-black font-serif italic">Forbes</h3>
          <h3 className="text-2xl font-black font-mono">TechCrunch</h3>
          <h3 className="text-2xl font-black font-sans tracking-widest">VERGE</h3>
          <h3 className="text-2xl font-black font-serif">Vogue</h3>
        </div>
      </div>
    </section>
  );
};

export default Hero;