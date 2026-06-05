import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── Product mockup (brutalist browser window) ────────────────── */
const ProductMockup: React.FC = () => (
  <div className="bg-white border border-gray-200 overflow-hidden shadow-[0_-1px_0_#e5e7eb,0_40px_100px_rgba(0,0,0,0.10)]">
    {/* Window bar */}
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => <span key={i} className="w-2.5 h-2.5 rounded-full bg-gray-300" />)}
      </div>
      <div className="flex-1 max-w-[260px] mx-auto bg-gray-50 border border-gray-100 h-6 flex items-center justify-center">
        <span className="text-[10px] text-gray-400 font-mono">alpacka.ai/prompts</span>
      </div>
      <div className="flex items-center gap-1.5 opacity-70">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">live</span>
      </div>
    </div>

    {/* App layout */}
    <div className="flex" style={{ height: 360 }}>
      {/* Sidebar */}
      <div className="border-r border-gray-200 bg-white flex-shrink-0 px-3 py-4" style={{ width: 172 }}>
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Biblioteca</div>
        {[
          { icon: '⚡', label: 'Productividad', count: 42, active: true },
          { icon: '📣', label: 'Marketing', count: 38 },
          { icon: '✍️', label: 'Copywriting', count: 35 },
          { icon: '💼', label: 'Negocios', count: 29 },
          { icon: '🎨', label: 'Contenido', count: 27 },
          { icon: '📧', label: 'Email', count: 22 },
          { icon: '🤖', label: 'Técnicos', count: 18 },
        ].map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-2 py-1.5 mb-0.5 transition-colors ${
              item.active ? 'bg-gray-900' : ''
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[11px]">{item.icon}</span>
              <span className={`text-[11px] uppercase tracking-wide ${item.active ? 'text-white font-bold' : 'text-gray-500'}`}>{item.label}</span>
            </div>
            <span className={`text-[9px] font-mono px-1 ${item.active ? 'text-gray-300 bg-gray-700' : 'text-gray-400 bg-gray-100'}`}>
              {item.count.toString().padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 px-5 py-4 overflow-hidden">
        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 px-3 py-2 mb-3.5">
          <span className="text-gray-400 text-xs">⌕</span>
          <span className="text-xs text-gray-400 font-mono">Buscar en 150+ prompts...</span>
          <span className="ml-auto text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 font-mono">⌘K</span>
        </div>
        {/* Status bar */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
          <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">⚡ Productividad</span>
          <span className="text-[9px] text-gray-400 font-mono">42 PROMPTS DISPONIBLES</span>
        </div>
        {/* Prompt cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { title: 'Planificador semanal Deep Work con bloques de 90 min', cat: 'Productividad', premium: true, highlighted: true },
            { title: 'Resumen ejecutivo de reunión con decisiones y acuerdos', cat: 'Productividad', premium: true },
            { title: 'Email de seguimiento post-demo que cierra sin presionar', cat: 'Copywriting', premium: true },
            { title: 'Estrategia de contenido 30 días con calendario y KPIs', cat: 'Marketing', premium: true },
            { title: 'Análisis FODA completo con plan de acción por cuadrante', cat: 'Estrategia', premium: false },
            { title: 'Propuesta de valor B2B para cliente de alto ticket', cat: 'Ventas', premium: true },
          ].map((card, i) => (
            <div
              key={i}
              className={`p-3 border bg-white transition-colors ${card.highlighted ? 'border-gray-900' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[7px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wider px-1.5 py-0.5">{card.cat}</span>
                {card.premium
                  ? <span className="text-[7px] font-bold bg-gray-900 text-white uppercase tracking-wider px-1.5 py-0.5">✦ PRO</span>
                  : <span className="text-[7px] font-bold bg-gray-100 text-gray-400 uppercase tracking-wider px-1.5 py-0.5">FREE</span>}
              </div>
              <div className="text-[11px] font-bold text-gray-900 leading-snug mb-2">{card.title}</div>
              <div className="flex items-center justify-end">
                <span className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">ver →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ─── Fade-in hook ──────────────────────────────────────────────── */
const useInView = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible] as const;
};

/* ─── Hero (brutalist / monochrome) ────────────────────────────── */
const Hero: React.FC = () => {
  const [statsRef, statsVisible] = useInView();

  return (
    <section
      className="relative overflow-hidden bg-white"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.015) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }}
    >
      <div className="relative" style={{ zIndex: 1, paddingTop: 80, paddingBottom: 0 }}>
        <div className="max-w-3xl mx-auto px-6 text-center">

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              +500 usuarios activos · precio de lanzamiento
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-space font-bold uppercase text-gray-900 mb-6"
            style={{ fontSize: 'clamp(2rem, 5.2vw, 3.5rem)', lineHeight: 1.08, letterSpacing: '-0.01em' }}
          >
            La biblioteca de prompts #1<br />de todo internet.
          </h1>

          {/* Subtext */}
          <p className="text-gray-600 max-w-xl mx-auto leading-relaxed mb-10" style={{ fontSize: 'clamp(14px, 1.5vw, 16px)' }}>
            <span className="font-bold text-gray-900">150+ estructuras probadas</span> que hacen que ChatGPT, Claude y Gemini entreguen resultados profesionales en la primera respuesta. Sin iteraciones.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:items-center max-w-md mx-auto sm:max-w-none">
            <Link to="/pricing" className="sm:w-auto">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gray-900 text-white border border-gray-900 hover:bg-white hover:text-gray-900 px-8 py-4 text-xs uppercase tracking-widest font-bold transition-colors duration-300">
                Quiero acceso — $4/mes
                <span aria-hidden>→</span>
              </button>
            </Link>
            <Link to="/prompts" className="sm:w-auto">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-4 text-xs uppercase tracking-widest font-bold transition-colors duration-300">
                Ver los 150+ prompts
                <span aria-hidden className="opacity-50">✦</span>
              </button>
            </Link>
          </div>

          {/* Trust line */}
          <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mt-5">
            acceso instantáneo · sin contrato · cancela cuando quieras
          </p>
        </div>

        {/* Stats shelf */}
        <div
          ref={statsRef}
          className="max-w-3xl mx-auto px-6"
          style={{
            marginTop: 44,
            opacity: statsVisible ? 1 : 0,
            transform: statsVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-gray-200 divide-x divide-y sm:divide-y-0 divide-gray-200">
            {[
              { value: '150+', label: 'prompts curados' },
              { value: '$4', label: 'por mes' },
              { value: '99%', label: 'éxito en 1ª resp.' },
              { value: '3', label: 'IAs compatibles' },
            ].map((stat, i) => (
              <div key={i} className="text-center py-5 px-3">
                <div className="font-space font-bold text-gray-900 mb-1" style={{ fontSize: 22, letterSpacing: '-0.02em' }}>{stat.value}</div>
                <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Product mockup */}
        <div className="max-w-6xl mx-auto px-6" style={{ marginTop: 56 }}>
          <ProductMockup />
        </div>
      </div>
    </section>
  );
};

export default Hero;
