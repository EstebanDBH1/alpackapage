import React from 'react';

const steps = [
  { num: "01", title: "Activa tu acceso", desc: "Suscríbete por $4/mes. Sin contratos ni letras pequeñas. Libertad total para cancelar cuando quieras." },
  { num: "02", title: "Encuentra la solución", desc: "Navega por una biblioteca curada de prompts de alto nivel, optimizados para los modelos de IA más potentes." },
  { num: "03", title: "Copia con precisión", desc: "Obtén con un clic la estructura exacta, parámetros técnicos y las instrucciones que otros ignoran." },
  { num: "04", title: "Domina la IA", desc: "Pégalo en ChatGPT, Claude o Gemini y mira cómo la IA entrega resultados profesionales al instante." }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#1A1410' }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 md:mb-16">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
            — proceso
          </p>
          <h2 className="font-display font-medium text-2xl md:text-3xl leading-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Más simple de lo que parece.<br />
            <span className="font-semibold" style={{ color: '#C96A3C' }}>Cuatro pasos.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          <div
            className="absolute left-[19px] top-8 bottom-8 w-px hidden sm:block"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)' }}
          />

          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={step.num} className="flex gap-7 sm:gap-9 group">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center z-10 mt-1 transition-colors"
                  style={{ backgroundColor: '#1A1410', borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <span className="font-mono text-[10px] transition-colors" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    {step.num}
                  </span>
                </div>
                <div className={`pb-10 ${index === steps.length - 1 ? 'pb-0' : ''}`}>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {step.desc}
                  </p>
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
