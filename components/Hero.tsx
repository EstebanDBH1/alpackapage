import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

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

const Hero: React.FC = () => {
  const [ref, visible] = useInView();

  return (
    <section className="bg-[#0a0a0a] text-white pt-24 pb-16 flex flex-col items-center text-center px-6 border-b border-[#222222]">
      
      {/* Top Red Badge */}
      <div className="inline-block px-3 py-1 mb-6 border border-[#ff3333]/20 bg-[#ff3333]/10 rounded-full">
        <span className="text-[#ff3333] text-[10px] font-bold uppercase tracking-widest font-space">
          Precio de lanzamiento · Acceso instantáneo
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-space font-bold uppercase tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
        La biblioteca de prompts #1<br className="hidden md:block"/> de todo internet.
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-space">
        <strong className="text-white">150+ estructuras probadas</strong> que hacen que ChatGPT, Claude y Gemini entreguen resultados profesionales en la primera respuesta. Sin iteraciones.
      </p>

      {/* Video/Image Placeholder (like the mockup in the image) */}
      <div className="w-full max-w-4xl mx-auto bg-[#111111] border border-[#222222] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(255,51,51,0.05)] mb-10 aspect-video relative flex items-center justify-center group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0"></div>
        
        {/* Decorative elements representing app interface behind */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Play button */}
        <div className="w-20 h-16 bg-[#ff3333] rounded-xl flex items-center justify-center z-10 transition-transform group-hover:scale-105 shadow-lg shadow-[#ff3333]/20">
           <Play fill="white" size={28} className="ml-1" />
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center z-10">
          <span className="text-white font-bold font-space text-lg md:text-2xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
            Descubre cómo funciona en 60 segundos
          </span>
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
        <Link to="/pricing" className="w-full">
          <button className="w-full bg-[#ff3333] hover:bg-[#cc0000] text-white font-bold text-sm uppercase tracking-widest py-4 px-8 rounded-sm transition-colors duration-200">
            Quiero acceso — $4/mes
          </button>
        </Link>
        <p className="text-[#ff3333] text-[11px] font-bold tracking-widest uppercase mt-2">
          Garantía de 14 días. Sin contrato.
        </p>
      </div>

    </section>
  );
};

export default Hero;
