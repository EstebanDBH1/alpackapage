import React from 'react';

const steps = [
  {
    num: '1',
    title: 'únete al banco',
    desc: 'Suscríbete por $3.90/mes. Sin cuotas ocultas. Cancela cuando quieras.'
  },
  {
    num: '2',
    title: 'explora y busca',
    desc: 'Accede a miles de prompts verificados para los principales modelos de IA.'
  },
  {
    num: '3',
    title: 'copia el código',
    desc: 'Copia con un clic la cadena exacta, prompts negativos y parámetros.'
  },
  {
    num: '4',
    title: 'despliega',
    desc: 'Pégalo en ChatGPT, Midjourney o tu API para resultados instantáneos.'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 bg-[#111111] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-brand-surface uppercase">cómo funciona</h2>
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