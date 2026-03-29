import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import PromptGrid from '../components/PromptGrid';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Faq from '../components/Faq';
import TrustBar from '../components/TrustBar';
import Testimonials from '../components/Testimonials';
import ValueProp from '../components/ValueProp';
import PricingCard from '../components/PricingCard';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Sparkles, X, Check } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="w-full">
      <Helmet>
        <title>Alpacka.ai | Banco de Prompts para IA e Ingeniería de Prompts</title>
        <meta name="description" content="150+ prompts probados para ChatGPT, Claude y Gemini. Marketing, ventas y productividad. $4/mes." />
        <link rel="canonical" href="https://alpackaai.xyz/" />
      </Helmet>

      {/* 1. HOOK */}
      <Hero />

      {/* 2. PROBLEMA — El dolor de los prompts genéricos */}
      <section className="py-16 md:py-24" style={{ backgroundColor: 'white' }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-8">

          <div className="max-w-xl mb-12">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-4" style={{ color: '#C8BEB5' }}>
              el problema
            </p>
            <h2 className="font-display font-medium text-2xl md:text-3xl leading-snug mb-4" style={{ color: '#1D1B18' }}>
              El 90% de las personas usa la IA a diario y sigue obteniendo resultados mediocres.
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#8B7E74' }}>
              La razón siempre es la misma: prompts sin estructura.
            </p>
          </div>

          {/* Pain grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
            {[
              {
                input: '"escribe un email de ventas"',
                output: 'Texto genérico y corporativo que nadie va a leer.',
              },
              {
                input: '"dame una estrategia de marketing"',
                output: 'Un listado de 5 puntos obvios que ya conocías.',
              },
              {
                input: '"ayúdame con mis redes sociales"',
                output: '3 reescrituras después, sigues sin el contenido que necesitas.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border"
                style={{ borderColor: '#E3DCD3' }}
              >
                {/* Input row */}
                <div
                  className="px-5 py-4 flex items-start gap-3"
                  style={{ backgroundColor: '#FAF9F5', borderBottom: '1px solid #E3DCD3' }}
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest mt-0.5 flex-shrink-0" style={{ color: '#C8BEB5' }}>
                    prompt
                  </span>
                  <p className="font-mono text-[11px] leading-relaxed" style={{ color: '#1D1B18' }}>
                    {item.input}
                  </p>
                </div>
                {/* Output row */}
                <div className="px-5 py-4 flex items-start gap-3" style={{ backgroundColor: 'white' }}>
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}
                  >
                    <X size={8} style={{ color: '#ef4444' }} strokeWidth={3} />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#8B7E74' }}>
                    {item.output}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reframe */}
          <div
            className="rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-l-4"
            style={{ backgroundColor: '#FAF0E8', borderColor: '#C96A3C', border: '1px solid #F5D9C8', borderLeftWidth: '3px', borderLeftColor: '#C96A3C' }}
          >
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1" style={{ color: '#1D1B18' }}>
                No es la IA. Son los prompts.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#8B7E74' }}>
                Con la estructura correcta, ChatGPT, Claude y Gemini entregan resultados profesionales en la{' '}
                <strong style={{ color: '#C96A3C' }}>primera respuesta</strong>. Sin iteraciones. Sin pérdida de tiempo.
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              {['contexto claro', 'formato definido', 'rol asignado'].map(tag => (
                <div key={tag} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(201,106,60,0.12)', border: '1px solid rgba(201,106,60,0.2)' }}
                  >
                    <Check size={8} style={{ color: '#C96A3C' }} strokeWidth={3} />
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: '#C96A3C' }}>
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3. CONFIANZA */}
      <TrustBar />

      {/* 4. PRODUCTO */}
      <PromptGrid />

      {/* 5. EDUCACIÓN */}
      <ValueProp />

      {/* 6. CASOS DE USO */}
      <Features />

      {/* 7. PROCESO */}
      <HowItWorks />

      {/* 8. PRUEBA SOCIAL */}
      <Testimonials />

      {/* 9. PRECIO */}
      <PricingCard />

      {/* 10. OBJECIONES */}
      <Faq />

      {/* 11. CIERRE */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#1A1410' }}>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #C96A3C 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />

          <div className="py-20 md:py-28 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-14 items-center">

            {/* Left */}
            <div>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-6 flex items-center gap-2" style={{ color: '#4D433C' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                precio de lanzamiento
              </p>
              <h2
                className="font-display font-medium leading-[1.12] mb-5"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'rgba(255,255,255,0.85)' }}
              >
                Cada semana sin los prompts correctos son horas que{' '}
                <span className="font-semibold" style={{ color: '#C96A3C' }}>
                  no recuperas.
                </span>
              </h2>
              <p className="text-sm leading-relaxed mb-2 max-w-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Mientras sigues reescribiendo prompts que no funcionan, otros están obteniendo los resultados que tú quieres.
              </p>
              <p className="text-sm leading-relaxed mb-8 max-w-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                $4 al mes es menos de lo que pierdes en una hora improductiva con la IA.
              </p>

              <Link to="/pricing">
                <button
                  className="group inline-flex items-center gap-2.5 font-semibold text-sm px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: '#C96A3C', color: 'white', boxShadow: '0 8px 28px rgba(201,106,60,0.28)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#AF5A30')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#C96A3C')}
                >
                  <Sparkles size={14} style={{ color: 'rgba(255,220,160,0.9)' }} />
                  quiero acceso ahora
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <p className="mt-4 font-mono text-[10px] tracking-widest" style={{ color: '#3D352E' }}>
                acceso instantáneo · sin contrato · cancela cuando quieras
              </p>
            </div>

            {/* Right: what you get */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div
                className="px-7 py-4 border-b"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: '#4D433C' }}>
                  lo que obtienes desde el primer día
                </p>
              </div>
              <div className="px-7 py-6 space-y-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                {[
                  'Emails de ventas que convierten de verdad',
                  'Estrategias de marketing con profundidad real',
                  'Campañas de 30 días listas en 30 minutos',
                  'Análisis competitivos que impresionan a clientes',
                  'Contenido para redes sin bloqueo creativo',
                  'Propuestas de consultoría que cierran negocios',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(201,106,60,0.15)', border: '1px solid rgba(201,106,60,0.2)' }}
                    >
                      <Check size={8} style={{ color: '#C96A3C' }} strokeWidth={3} />
                    </div>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div
                className="px-7 py-5 flex items-center justify-between border-t"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <span className="font-mono text-[11px]" style={{ color: '#4D433C' }}>todo esto por</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-semibold text-3xl" style={{ color: 'white' }}>$4</span>
                  <span className="font-mono text-[10px]" style={{ color: '#4D433C' }}>/mes</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
