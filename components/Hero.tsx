import React from 'react';
import { StatItem } from '../types';
import { ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats: StatItem[] = [
  { value: '10', label: 'miembros activos' },
  { value: '$3.90', label: 'tarifa plana mensual' },
];

const Hero: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Stats Header - Minimalista y alineado */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 text-[10px] sm:text-xs font-mono text-zinc-400 tracking-[0.2em] uppercase">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-zinc-900 font-bold text-sm sm:text-xl block mb-1">
                {stat.value}
              </span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Main Headline - Tamaño original con estilo pulido */}
        <h1 className="text-4xl sm:text-5xl md:text-5xl font-black tracking-tighter mb-8 leading-[0.95] text-zinc-900 lowercase">
          copia, pega y domina cualquier <span className="text-zinc-400">modelo</span> de
          <span className="bg-zinc-100 px-2 py-1 rounded-lg ml-2">ia.</span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 mb-10 font-sans leading-relaxed lowercase">
          optimiza tu flujo de trabajo con nuestra librería de ingeniería de prompts. herramientas listas para usar que automatizan tus tareas de negocio y aprendizaje.
        </p>

        {/* CTAs - Más limpios sin sombras pesadas */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/pricing" className="w-full sm:w-auto">
            <button className="w-full bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-2 tracking-tight lowercase">
              acceso ilimitado <ArrowRight size={20} />
            </button>
          </Link>
          <Link to="/prompts" className="w-full sm:w-auto">
            <button className="w-full bg-white text-zinc-900 border border-zinc-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 tracking-tight lowercase">
              prompts <Lock size={16} className="text-zinc-400" />
            </button>
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-[11px] font-mono text-zinc-400 tracking-widest lowercase">
          cancela cuando quieras.
          <Link to="/login" className="ml-2 text-zinc-900 font-bold hover:underline underline-offset-4 decoration-zinc-200">
            acceso instantáneo al registrarte →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;