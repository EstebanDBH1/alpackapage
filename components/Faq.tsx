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
    <section className="py-20 md:py-28" style={{ backgroundColor: 'white' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 md:mb-14">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: '#C8BEB5' }}>
            — preguntas
          </p>
          <h2 className="font-display font-medium text-2xl md:text-3xl leading-tight" style={{ color: '#1D1B18' }}>
            Preguntas frecuentes.<br />
            <span className="font-semibold">Respuestas directas.</span>
          </h2>
        </div>

        <div style={{ borderTop: '1px solid #F0EAE1' }}>
          {faqData.map((item, index) => (
            <div key={index} style={{ borderBottom: '1px solid #F0EAE1' }}>
              <button
                className="w-full py-6 flex justify-between items-start text-left focus:outline-none gap-6"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span
                  className="text-[15px] font-semibold leading-snug transition-colors"
                  style={{ color: openIndex === index ? '#C96A3C' : '#1D1B18' }}
                >
                  {item.question}
                </span>
                <ChevronDown
                  size={16}
                  className={`flex-shrink-0 mt-0.5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                  style={{ color: '#C8BEB5' }}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-sm leading-relaxed" style={{ color: '#8B7E74' }}>
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
