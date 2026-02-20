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

const Home: React.FC = () => {
  return (
    <div className="w-full">
      <Hero />
      <TrustBar />
      <PromptGrid />
      <ValueProp />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Faq />

      {/* Bottom CTA similar to reference */}
      <section className="bg-brand-bg py-24 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-6 uppercase">
            accede al <span className="underline decoration-4 underline-offset-4 decoration-black">banco completo</span> hoy
          </h2>
          <p className="font-mono text-sm text-gray-500 mb-10 uppercase tracking-widest">
            un precio simple. $3.90/mes. cancela cuando quieras.
          </p>
          <Link to="/pricing">
            <button className="bg-brand-text text-brand-bg px-12 py-4 rounded-none font-bold text-lg hover:scale-105 transition-transform shadow-xl uppercase tracking-widest">
              OBTENER ACCESO ILIMITADO →
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;