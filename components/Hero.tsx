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
        <div className="flex flex-wrap justify-center gap-8 mb-12 text-[10px] sm:text-sm font-mono text-gray-500 tracking-widest">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-brand-text font-bold text-[12px] sm:text-xl block mb-1">{stat.value}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-5xl font-black tracking-tighter mb-8 leading-[0.9]">
          Copia, pega y domina cualquier <span className="text-gray-400" >modelo</span> de
          <span className="bg-brand-surface px-1 rounded-lg">IA.</span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10 font-sans leading-relaxed">
          Optimiza tu flujo de trabajo con nuestra librería de ingeniería de prompts. Herramientas listas para usar que automatizan tus tareas de negocio en segundos.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/pricing" className="w-full sm:w-auto">
            <button className="w-full bg-brand-text text-brand-bg px-8 py-4 rounded-md font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-gray-200 tracking-tight">
              ACCESO ILIMITADO <ArrowRight size={20} />
            </button>
          </Link>
          <Link to="/prompts" className="w-full sm:w-auto">
            <button className="w-full bg-brand-surface text-brand-text border border-gray-200 px-8 py-4 rounded-md font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 tracking-tight">
              VER PACK DE MUESTRA <Lock size={16} className="text-gray-400" />
            </button>
          </Link>
        </div>

        <div className="mt-8 text-xs font-mono text-gray-400 tracking-widest">
          cancela cuando quieras. <Link to="/login" className="text-brand-text hover:underline">acceso instantáneo al registrarte →</Link>
        </div>
      </div>

      {/* Featured In */}
      <div className="mt-24 border-t border-brand-surface pt-12">
        <p className="text-center font-mono text-[10px] text-gray-400 tracking-widest mb-8">
          utilizado por equipos en
        </p>


        {


          /*
          
          <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30 grayscale contrast-200">
            <span className="text-xl md:text-2xl font-black font-sans">FORBES</span>
            <span className="text-xl md:text-2xl font-black font-serif italic">WIRED</span>
            <span className="text-xl md:text-2xl font-black font-mono">NYT</span>
            <span className="text-xl md:text-2xl font-black font-sans tracking-widest">VERGE</span>
            <span className="text-xl md:text-2xl font-black font-serif">VOGUE</span>
          </div>
          
          */
        }
      </div>
    </section>
  );
};

export default Hero;