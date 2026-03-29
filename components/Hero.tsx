import React from 'react';
import { ArrowRight, Lock, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockPrompts = [
  { category: 'marketing', emoji: '📣', title: 'Campaña de lanzamiento de 30 días con calendario editorial y guiones', premium: true },
  { category: 'copywriting', emoji: '✍️', title: 'Email de ventas que convierte sin sonar a bot corporativo', premium: true },
  { category: 'estrategia', emoji: '♟️', title: 'Análisis competitivo con plan de acción ejecutable para tu nicho', premium: false },
];

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-14 pb-20 md:pt-20 md:pb-28" style={{ backgroundColor: '#FAF9F5' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 55% at 65% 20%, #EDE4D8 0%, transparent 65%)' }}
      />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-20 items-center">

          {/* ── Left ── */}
          <div>

            {/* Social proof bar */}
            <div className="inline-flex items-center gap-2.5 mb-8 px-3.5 py-2 rounded-full border" style={{ backgroundColor: 'white', borderColor: '#E3DCD3' }}>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-mono text-[10px] tracking-wide" style={{ color: '#8B7E74' }}>
                +500 usuarios activos · precio de lanzamiento
              </span>
            </div>

            {/* Headline */}
            <h1 className="mb-6">
              <span
                className="block font-display font-medium leading-[1.1] tracking-tight"
                style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)', color: '#1D1B18' }}
              >
                La IA que tienes es buena.
              </span>
              <span
                className="block font-display font-semibold leading-[1.1] tracking-tight"
                style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)', color: '#C96A3C' }}
              >
                Tus prompts, no.
              </span>
            </h1>

            <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: '#8B7E74' }}>
              <strong className="font-semibold" style={{ color: '#1D1B18' }}>150+ estructuras probadas</strong> que hacen que
              ChatGPT, Claude y Gemini entreguen resultados profesionales
              en la primera respuesta. Sin iteraciones. Sin frustración.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link to="/pricing" className="w-full sm:w-auto">
                <button
                  className="group w-full inline-flex items-center justify-center gap-2.5 font-semibold text-sm px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: '#C96A3C', color: 'white', boxShadow: '0 8px 24px rgba(201,106,60,0.25)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#AF5A30')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#C96A3C')}
                >
                  <Sparkles size={14} style={{ color: 'rgba(255,220,160,0.9)' }} />
                  quiero acceso — $4/mes
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link to="/prompts" className="w-full sm:w-auto">
                <button
                  className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm px-7 py-4 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: 'white', color: '#1D1B18', border: '1px solid #E3DCD3' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#C96A3C')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#E3DCD3')}
                >
                  ver los 150+ prompts
                  <Lock size={12} style={{ color: '#8B7E74' }} />
                </button>
              </Link>
            </div>

            {/* Trust micro-copy */}
            <p className="font-mono text-[10px] tracking-widest" style={{ color: '#C8BEB5' }}>
              acceso instantáneo · sin contrato · cancela cuando quieras
            </p>
          </div>

          {/* ── Right: prompt cards ── */}
          <div className="hidden lg:block relative">
            <div className="space-y-3">
              {mockPrompts.map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5 border"
                  style={{
                    backgroundColor: 'white',
                    borderColor: i === 0 ? '#C96A3C' : '#E3DCD3',
                    transform: i === 1 ? 'translateX(20px)' : 'none',
                    opacity: i === 2 ? 0.5 : 1,
                    boxShadow: i === 0 ? '0 4px 20px rgba(201,106,60,0.1)' : 'none',
                  }}
                >
                  {p.premium && <div className="h-0.5 w-full -mt-5 mb-4 rounded-t-sm" style={{ backgroundColor: '#C96A3C' }} />}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md"
                      style={{ backgroundColor: '#F0EAE1', color: '#8B7E74', border: '1px solid #E3DCD3' }}
                    >
                      {p.emoji} {p.category}
                    </span>
                    {p.premium && (
                      <span className="font-mono text-[9px] font-bold flex items-center gap-1" style={{ color: '#C96A3C' }}>
                        <Lock size={8} /> premium
                      </span>
                    )}
                  </div>
                  <p className="font-display font-medium text-sm leading-snug" style={{ color: '#1D1B18' }}>{p.title}</p>
                  <div className="mt-3.5 pt-3 flex justify-end" style={{ borderTop: '1px solid #F0EAE1' }}>
                    <span className="font-mono text-[10px] font-bold" style={{ color: '#C96A3C' }}>abrir →</span>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="absolute -bottom-4 left-0 right-0 h-28 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent, #FAF9F5)' }}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
