import React, { useState } from 'react';
import { FaqItem } from '../types';
import { Plus, Minus } from 'lucide-react';

const faqData: FaqItem[] = [
  {
    "question": "¿Cuál es el costo y qué incluye?",
    "answer": "Por solo $4 USD al mes, desbloqueas el acceso total a nuestra librería. No hay letras chiquitas: tienes todos los prompts premium, las actualizaciones semanales y las nuevas categorías sin pagar un centavo más."
  },
  {
    "question": "¿Realmente funcionan estos prompts?",
    "answer": "Totalmente. No son frases al azar; cada uno ha sido testeado con ingeniería de prompts para asegurar que la IA te entregue resultados profesionales, estructurados y útiles desde el primer intento."
  },
  {
    "question": "¿Con qué modelos de IA puedo usarlos?",
    "answer": "Están diseñados para brillar en los modelos más potentes como GPT-5, Claude 3 y Gemini. También tenemos secciones dedicadas para herramientas de imagen como Midjourney y DALL-E."
  },
  {
    "question": "¿Puedo cancelar si ya no los necesito?",
    "answer": "Claro, aquí mandas tú. Puedes cancelar tu suscripción con un solo clic desde tu perfil en cualquier momento. Seguirás teniendo acceso premium hasta que termine tu mes pagado."
  },
  {
    "question": "¿Actualizan el banco de prompts?",
    "answer": "¡Cada semana! Nuestro equipo de expertos añade nuevos prompts basados en las tendencias del mercado y las peticiones de nuestra comunidad para que nunca te quedes atrás."
  },
  {
    "question": "¿Puedo sugerir un prompt que no esté?",
    "answer": "¡Nos encantaría! Aunque nuestra curaduría es interna para mantener la calidad premium, escuchamos a nuestros suscriptores. Si necesitas un prompt específico, escríbenos y nuestro equipo lo diseñará para la próxima actualización."
  }
]

const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center mb-16">preguntas frecuentes</h2>
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
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
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