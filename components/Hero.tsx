import React from 'react';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 pb-24 overflow-hidden" style={{ backgroundColor: '#FAF9F5' }}>
      {/* Warm ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #EDE4D8 0%, transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 relative z-10 w-full">

        {/* Status label */}
        <div className="flex items-center gap-2.5 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: '#8B7E74' }}>
            más de 150 prompts activos · actualizado esta semana
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-8">
          <span className="block font-display italic font-light leading-[0.92] tracking-tight" style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)', color: '#1D1B18' }}>
            deja de improvisar
          </span>
          <span className="block font-sans font-black leading-[0.9] tracking-tighter" style={{ fontSize: 'clamp(2.6rem, 8vw, 6.5rem)', color: '#1D1B18' }}>
            con la ia.
          </span>
        </h1>

        {/* Subheading + CTA side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end">

          <div>
            <p className="text-base md:text-lg leading-relaxed mb-10" style={{ color: '#8B7E74' }}>
              más de <strong className="font-semibold" style={{ color: '#1D1B18' }}>150 prompts de ingeniería</strong> listos
              para copiar y usar. resultados profesionales en segundos, no en horas.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link to="/pricing" className="w-full sm:w-auto">
                <button
                  className="group w-full inline-flex items-center justify-center gap-2.5 font-semibold text-sm px-9 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg"
                  style={{ backgroundColor: '#C96A3C', color: 'white', boxShadow: '0 8px 24px rgba(201,106,60,0.22)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#AF5A30')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#C96A3C')}
                >
                  <Sparkles size={15} style={{ color: 'rgba(255,220,160,0.9)' }} />
                  hazte premium
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link to="/prompts" className="w-full sm:w-auto">
                <button
                  className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: 'white', color: '#1D1B18', border: '1px solid #E3DCD3' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#C96A3C')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#E3DCD3')}
                >
                  explorar prompts
                  <Lock size={13} style={{ color: '#8B7E74' }} />
                </button>
              </Link>
            </div>

            {/* Risk reversal */}
            <p className="font-mono text-[10px] tracking-widest" style={{ color: '#C8BEB5' }}>
              sin contrato · cancela cuando quieras · acceso instantáneo
            </p>
          </div>

          {/* Stats block */}
          <div
            className="rounded-3xl p-8 border grid grid-cols-2 gap-6"
            style={{ backgroundColor: 'white', borderColor: '#E3DCD3' }}
          >
            {[
              { value: '150+', label: 'prompts listos' },
              { value: '$4', label: 'por mes' },
              { value: '12', label: 'categorías' },
              { value: '99%', label: 'éxito primer intento' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-display text-4xl leading-none mb-1.5" style={{ color: '#1D1B18' }}>
                  {stat.value}
                </p>
                <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: '#8B7E74' }}>
                  {stat.label}
                </p>
              </div>
            ))}

            <div className="col-span-2 pt-4" style={{ borderTop: '1px solid #F0EAE1' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#8B7E74' }}>
                compatible con <strong style={{ color: '#1D1B18' }}>ChatGPT, Claude, Gemini</strong> y todos los modelos modernos.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
