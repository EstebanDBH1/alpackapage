import React from 'react';

const steps = [
  { num: "01", title: "Activa tu acceso", desc: "Suscríbete por solo $4/mes. Sin contratos ni letras pequeñas. Libertad total para cancelar cuando quieras." },
  { num: "02", title: "Encuentra la solución", desc: "Navega por una librería curada de prompts de alto nivel, optimizados para los modelos de IA más potentes." },
  { num: "03", title: "Copia con precisión", desc: "Obtén con un clic la estructura exacta, parámetros técnicos y las instrucciones que otros ignoran." },
  { num: "04", title: "Domina la IA", desc: "Pégalo en ChatGPT, Claude o Midjourney y mira cómo la IA entrega resultados profesionales al instante." }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-brand-dark">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 md:mb-16">
          <p className="font-mono text-[10px] text-white/20 tracking-[0.2em] uppercase mb-4">— proceso</p>
          <h2 className="font-display italic font-light text-3xl md:text-4xl text-white/85 leading-tight">
            cuatro pasos.<br />
            <span className="not-italic font-sans font-bold text-white/90 text-3xl md:text-4xl">resultados inmediatos.</span>
          </h2>
        </div>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Vertical connector */}
          <div className="absolute left-[19px] top-8 bottom-8 w-px bg-gradient-to-b from-white/10 via-white/10 to-transparent hidden sm:block"></div>

          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={step.num} className="flex gap-7 sm:gap-9 group">
                {/* Number bubble */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-dark-surface border border-white/8 flex items-center justify-center z-10 group-hover:border-white/20 transition-colors mt-1">
                  <span className="font-mono text-[10px] text-white/30 group-hover:text-white/50 transition-colors">{step.num}</span>
                </div>

                {/* Content */}
                <div className={`pb-10 ${index === steps.length - 1 ? 'pb-0' : ''}`}>
                  <h3 className="font-semibold text-base text-white/80 mb-2 group-hover:text-white/90 transition-colors">{step.title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed max-w-md">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
