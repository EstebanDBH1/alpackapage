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
import { ArrowRight, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="w-full">
      <Helmet>
        <title>Alpacka.ai | Banco de Prompts para IA e Ingeniería de Prompts</title>
        <meta name="description" content="Consigue los mejores prompts para ChatGPT, Claude y Midjourney. Biblioteca optimizada para automatizar negocios y mejorar productividad." />
        <link rel="canonical" href="https://alpackaai.xyz/" />
      </Helmet>

      {/* 1. ATENCIÓN — Hero persuasivo con CTA premium */}
      <Hero />

      {/* 2. CONFIANZA — Logos de modelos compatibles */}
      <TrustBar />

      {/* 3. INTERÉS — Muestra prompts reales (deseo de tener acceso) */}
      <PromptGrid />

      {/* 4. VALOR — Por qué alpackaai con demo interactiva */}
      <ValueProp />

      {/* 5. DESEO — Casos de uso concretos */}
      <Features />

      {/* 6. SOCIAL PROOF — Testimoniales */}
      <Testimonials />

      {/* 7. DECISIÓN — Pricing card embebida en el funnel */}
      <PricingCard />

      {/* 8. SOPORTE — Cómo funciona para disipar dudas */}
      <HowItWorks />

      {/* 9. OBJECIONES — FAQ */}
      <Faq />

      {/* 10. CIERRE FINAL */}
      <section className="py-24 md:py-36 relative overflow-hidden" style={{ backgroundColor: '#1A1410' }}>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, #C96A3C 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,106,60,0.10), transparent)' }} />

        <div className="max-w-3xl mx-auto text-center px-6 relative z-10">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-8 flex items-center justify-center gap-2" style={{ color: '#4D433C' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ahora mismo
          </p>
          <h2 className="mb-6">
            <span className="block font-display italic font-light text-4xl md:text-6xl leading-tight" style={{ color: 'rgba(255,255,255,0.82)' }}>
              ¿sigues perdiendo tiempo
            </span>
            <span className="block font-sans font-black text-3xl md:text-5xl leading-tight" style={{ color: '#C96A3C' }}>
              con prompts genéricos?
            </span>
          </h2>
          <p className="text-sm md:text-base mb-12 max-w-sm mx-auto leading-relaxed" style={{ color: '#4D433C' }}>
            por <strong style={{ color: 'rgba(255,255,255,0.5)' }}>$4 al mes</strong>, eso cambia hoy.
          </p>
          <Link to="/pricing">
            <button
              className="group inline-flex items-center gap-3 font-semibold text-base px-10 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-2xl"
              style={{ backgroundColor: '#C96A3C', color: 'white', boxShadow: '0 12px 40px rgba(201,106,60,0.25)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#AF5A30')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#C96A3C')}
            >
              <Sparkles size={16} style={{ color: 'rgba(255,220,160,0.9)' }} />
              hazte premium — $4/mes
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
          <p className="mt-6 font-mono text-[10px] tracking-widest" style={{ color: '#3D352E' }}>
            sin contrato · cancela cuando quieras · acceso instantáneo
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;