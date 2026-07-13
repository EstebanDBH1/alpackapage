import React, { useState } from 'react';
import { FaqItem } from '../types';
import { ChevronDown } from 'lucide-react';

const faqData: FaqItem[] = [
  { "question": "¿Cuál es el costo y qué incluye?", "answer": "Por solo $4 USD al mes, desbloqueas el acceso total a nuestra librería. No hay letras chiquitas: tienes todos los prompts premium, las actualizaciones semanales y las nuevas categorías sin pagar un centavo más." },
  { "question": "¿Realmente funcionan estos prompts?", "answer": "Totalmente. No son frases al azar; cada uno ha sido testeado con ingeniería de prompts para asegurar que la IA te entregue resultados profesionales, estructurados y útiles desde el primer intento." },
  { "question": "¿Con qué modelos de IA puedo usarlos?", "answer": "Están diseñados para brillar en los modelos más potentes como GPT-5, Claude 3 y Gemini. También tenemos secciones dedicadas para herramientas de imagen como Midjourney y DALL-E." },
  { "question": "¿Puedo cancelar si ya no los necesito?", "answer": "Claro, aquí mandas tú. Puedes cancelar tu suscripción con un solo clic desde tu perfil en cualquier momento. Seguirás teniendo acceso premium hasta que termine tu mes pagado." },
  { "question": "¿Actualizan el banco de prompts?", "answer": "¡Cada semana! Nuestro equipo de expertos añade nuevos prompts basados en las tendencias del mercado y las peticiones de nuestra comunidad para que nunca te quedes atrás." },
  { "question": "¿Puedo sugerir un prompt que no esté?", "answer": "¡Nos encantaría! Aunque nuestra curaduría es interna para mantener la calidad premium, escuchamos a nuestros suscriptores. Si necesitas un prompt específico, escríbenos y nuestro equipo lo diseñará para la próxima actualización." }
];

const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-[#222222]">
      <div className="max-w-3xl mx-auto px-6 text-center">

        {/* Header */}
        <div className="mb-14">
          {/* Red Badge */}
          <div className="inline-block px-3 py-1 mb-6 border border-[#ff3333]/20 bg-[#ff3333]/10 rounded-full">
            <span className="text-[#ff3333] text-[10px] font-bold uppercase tracking-widest font-space">
              FAQ
            </span>
          </div>

          <h2 className="font-space font-bold text-3xl md:text-4xl text-white mb-6 uppercase tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="text-left border-t border-[#222222]">
          {faqData.map((item, index) => (
            <div key={index} className="border-b border-[#222222]">
              <button
                className="w-full py-6 flex justify-between items-start text-left focus:outline-none gap-6"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span
                  className="text-[15px] font-bold font-space uppercase tracking-wide transition-colors"
                  style={{ color: openIndex === index ? '#ff3333' : '#ffffff' }}
                >
                  {item.question}
                </span>
                <ChevronDown
                  size={16}
                  className={`flex-shrink-0 mt-0.5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                  style={{ color: openIndex === index ? '#ff3333' : '#666666' }}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-sm leading-relaxed text-gray-400 font-space">
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
