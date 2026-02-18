import React from 'react';
import { Terminal, Palette, PenTool } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">tareas reales. resultados reales.</h2>
          <p className="font-mono text-sm text-gray-500">esto es lo que la gente genera con PromptBank</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#1A1A1A] p-8 rounded-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-500 pointer-events-none select-none">
               <Terminal size={100} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-brand-surface rounded-lg flex items-center justify-center mb-6 text-black">
                <Terminal size={20} />
              </div>
              <h3 className="text-xl font-bold mb-3">código y automatización</h3>
              <p className="text-gray-400 text-sm font-sans leading-relaxed">
                ¿Necesitas un script en Python, un componente React o una consulta SQL?
                Encuentra instrucciones precisas para que los LLMs escriban código impecable.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1A1A1A] p-8 rounded-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-500 pointer-events-none select-none">
               <Palette size={100} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-brand-surface rounded-lg flex items-center justify-center mb-6 text-black">
                <Palette size={20} />
              </div>
              <h3 className="text-xl font-bold mb-3">generación visual</h3>
              <p className="text-gray-400 text-sm font-sans leading-relaxed">
                Desbloquea todo el potencial de Midjourney y DALL-E.
                Obtén estilos consistentes, iluminación y composición siempre.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#1A1A1A] p-8 rounded-xl text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-500 pointer-events-none select-none">
               <PenTool size={100} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-brand-surface rounded-lg flex items-center justify-center mb-6 text-black">
                <PenTool size={20} />
              </div>
              <h3 className="text-xl font-bold mb-3">marketing y copy</h3>
              <p className="text-gray-400 text-sm font-sans leading-relaxed">
                Desde artículos SEO hasta tweets virales.
                Usa prompts que entienden matices, tono y voz de marca.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;