import React from 'react';
import Hero from '../components/Hero';
import PromptGrid from '../components/PromptGrid';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Faq from '../components/Faq';

const Home: React.FC = () => {
  return (
    <div className="w-full">
      <Hero />
      <PromptGrid />
      <Features />
      <HowItWorks />
      <Faq />
      
      {/* Bottom CTA similar to reference */}
      <section className="bg-brand-bg py-24 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
            accede al <span className="underline decoration-4 underline-offset-4 decoration-black">banco completo</span> hoy
          </h2>
          <p className="font-mono text-sm text-gray-500 mb-10 uppercase tracking-widest">
            un precio simple. $3.90/mes. cancela cuando quieras.
          </p>
          <button className="bg-brand-text text-brand-bg px-12 py-4 rounded-md font-bold text-lg hover:scale-105 transition-transform shadow-xl">
            OBTENER ACCESO ILIMITADO →
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;