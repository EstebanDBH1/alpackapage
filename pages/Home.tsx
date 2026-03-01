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

      {/* 10. CIERRE FINAL — CTA de urgencia */}
      <section className="bg-zinc-900 py-28 relative overflow-hidden">
        {/* Subtle grain */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.05),transparent)]"></div>

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <span className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-500 tracking-[0.2em] mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            acceso disponible ahora mismo
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-5 text-white leading-tight">
            ¿sigues perdiendo tiempo<br />
            <span className="text-zinc-400">con prompts genéricos?</span>
          </h2>
          <p className="font-sans text-base text-zinc-400 mb-10 max-w-lg mx-auto leading-relaxed">
            <strong className="text-white"> por $4 al mes</strong>, eso cambia hoy.
          </p>
          <Link to="/pricing">
            <button className="group inline-flex items-center gap-3 bg-white text-zinc-900 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-zinc-100 transition-all shadow-2xl hover:-translate-y-0.5 active:translate-y-0">
              <Sparkles size={20} className="text-yellow-500" />
              hazte premium — $4/mes
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <p className="mt-5 text-[11px] font-mono text-zinc-600 tracking-widest">
            sin contrato · cancela cuando quieras · acceso instantáneo
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;