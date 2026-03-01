import React, { useEffect, useState } from 'react';
import { ArrowRight, Lock, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const [count, setCount] = useState(0);

  // Animated counter for social proof
  useEffect(() => {
    let start = 0;
    const end = 100;
    const duration = 1800;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-16 pb-24 lg:pt-28 lg:pb-36 overflow-hidden bg-white">
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)] opacity-30"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

        {/* Social proof pill */}
        <div className="inline-flex items-center gap-2 bg-zinc-900 text-white text-[11px] font-mono px-4 py-2 rounded-full mb-10 tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-zinc-300">{count.toLocaleString()}+ prompts activos esta semana</span>
          <TrendingUp size={12} className="text-emerald-400" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.88] text-zinc-900">
          para de perder tiempo con la{' '}
          <span className="relative inline-block">
            <span className="relative z-10">ia.</span>
            <span className="absolute bottom-1 left-0 w-full h-3 bg-zinc-100 -z-10 rounded"></span>
          </span>
          <br />
          <span className="text-zinc-400 font-black">empieza a dominarla.</span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 mb-4 font-sans leading-relaxed">
          más de <strong className="text-zinc-900">100 prompts de ingeniería</strong> listos para copiar y usar.
          resultados profesionales en segundos, no en horas.
        </p>
        z
        {/* Mini social proof under headline */}
        <div className="flex flex-wrap justify-center items-center gap-5 mb-10 text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Users size={12} className="text-zinc-400" />
            +50 suscriptores activos
          </span>
          <span className="text-zinc-200">|</span>
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-yellow-500" />
            99.2% de éxito en primera respuesta
          </span>
          <span className="text-zinc-200">|</span>
          <span>$4/mes — menos que un café</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
          <Link to="/pricing" className="w-full sm:w-auto">
            <button className="w-full group bg-zinc-900 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
              <Sparkles size={18} className="text-yellow-400" />
              hazte premium
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link to="/prompts" className="w-full sm:w-auto">
            <button className="w-full bg-white text-zinc-900 border border-zinc-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all flex items-center justify-center gap-2">
              explorar prompts <Lock size={15} className="text-zinc-400" />
            </button>
          </Link>
        </div>

        {/* Risk reversal */}
        <p className="text-[11px] font-mono text-zinc-400 tracking-widest">
          sin contrato. cancela cuando quieras.{' '}
          <Link to="/login" className="text-zinc-700 font-bold hover:underline underline-offset-4 decoration-zinc-300">
            acceso instantáneo →
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Hero;