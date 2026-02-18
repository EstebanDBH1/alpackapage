import React, { useState } from 'react';
import { FaqItem } from '../types';
import { Plus, Minus } from 'lucide-react';

const faqData: FaqItem[] = [
  {
    question: "¿cuánto cuesta?",
    answer: "El acceso a PromptBank tiene una tarifa plana de $3.90 USD por mes. Esto te otorga acceso ilimitado a cada prompt en nuestra base de datos."
  },
  {
    question: "¿puedo cancelar mi suscripción?",
    answer: "Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de control. Mantendrás el acceso hasta el final de tu ciclo de facturación."
  },
  {
    question: "¿funcionan con GPT-4?",
    answer: "Sí. Cada prompt está etiquetado con la versión específica del modelo para la que fue optimizado (ej: GPT-4, Midjourney v6, Stable Diffusion XL)."
  },
  {
    question: "¿puedo contribuir con prompts?",
    answer: "Actualmente, nuestro banco es curado por expertos internos y socios seleccionados para asegurar la máxima calidad. No aceptamos envíos públicos por el momento."
  }
];

const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-16">preguntas frecuentes</h2>
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="border-b border-gray-200">
              <button
                className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
                onClick={() => toggleFaq(index)}
              >
                <span className="text-lg font-bold group-hover:text-gray-600 transition-colors">{item.question}</span>
                <span className="ml-6 flex-shrink-0 text-gray-400">
                  {openIndex === index ? (
                    <Minus size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-600 font-sans leading-relaxed text-sm md:text-base pr-8">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;