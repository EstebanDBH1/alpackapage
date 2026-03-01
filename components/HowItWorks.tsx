import React from 'react';

const steps = [
  {
    "num": "1",
    "title": "Activa tu acceso",
    "desc": "Suscríbete por solo $4/mes. Sin contratos ni letras pequeñas. Libertad total para cancelar."
  },
  {
    "num": "2",
    "title": "Encuentra la solución",
    "desc": "Navega por una librería curada de prompts de alto nivel, optimizados para los modelos de IA más potentes."
  },
  {
    "num": "3",
    "title": "Copia con precisión",
    "desc": "Obtén con un clic la estructura exacta, parámetros técnicos y las instrucciones que otros ignoran."
  },
  {
    "num": "4",
    "title": "Domina la IA",
    "desc": "Pégalo en ChatGPT, Claude o Midjourney y mira cómo la IA entrega resultados profesionales al instante."
  }
]

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 bg-[#111111] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-brand-surface">¿cómo funciona?</h2>
        </div>

        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.num} className="bg-[#1A1A1A] p-6 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:bg-[#222222] transition-colors border border-transparent hover:border-gray-700">
              <div className="w-10 h-10 bg-brand-text text-brand-bg rounded flex-shrink-0 flex items-center justify-center font-bold text-lg font-mono group-hover:bg-white group-hover:text-black transition-colors">
                {step.num}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1 text-gray-200">{step.title}</h3>
                <p className="text-gray-500 font-sans">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;