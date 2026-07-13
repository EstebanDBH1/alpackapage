import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Laura M.',
    role: 'Fundadora de SaaS',
    avatar: 'LM',
    avatarBg: '#ff3333',
    avatarColor: '#ffffff',
    content: 'Usé el prompt de campaña de lanzamiento y tuvimos 80 registros en la primera semana. Antes tardaba 3 días en armar algo así. Ahora lo hago en 30 minutos.',
    metric: '80 leads en 7 días',
    metricBg: 'rgba(255, 51, 51, 0.1)',
    metricColor: '#ff3333',
    metricBorder: 'rgba(255, 51, 51, 0.2)',
  },
  {
    name: 'Diego R.',
    role: 'Consultor independiente',
    avatar: 'DR',
    avatarBg: '#222222',
    avatarColor: '#ffffff',
    content: 'Cerré un cliente de $6,000 con la propuesta que generé usando el prompt de propuesta de valor. El cliente me preguntó si tenía equipo detrás. Era solo yo y alpacka.',
    metric: '$6,000 en una propuesta',
    metricBg: 'rgba(255, 255, 255, 0.05)',
    metricColor: '#cccccc',
    metricBorder: 'rgba(255, 255, 255, 0.1)',
  },
  {
    name: 'Ana B.',
    role: 'Content Manager',
    avatar: 'AB',
    avatarBg: '#222222',
    avatarColor: '#ffffff',
    content: 'Gestiono el contenido de 4 marcas yo sola. Sin alpacka era imposible. Ahora entrego calendarios editoriales completos en una tarde. Los $4/mes son lo mejor que invierto.',
    metric: '4 marcas · 1 persona',
    metricBg: 'rgba(255, 255, 255, 0.05)',
    metricColor: '#cccccc',
    metricBorder: 'rgba(255, 255, 255, 0.1)',
  },
];

const Stars: React.FC = () => (
  <div className="flex gap-1 mb-4">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={14} className="fill-[#ff3333] text-[#ff3333]" />
    ))}
  </div>
);

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-[#222222]">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16">
        
        {/* Red Badge */}
        <div className="inline-block px-3 py-1 mb-6 border border-[#ff3333]/20 bg-[#ff3333]/10 rounded-full">
          <span className="text-[#ff3333] text-[10px] font-bold uppercase tracking-widest font-space">
            Resultados Reales
          </span>
        </div>

        <h2 className="font-space font-bold text-3xl md:text-5xl text-white mb-6 uppercase tracking-tight">
          "The Best AI Community<br className="hidden md:block"/> In The World"
        </h2>
        
        <p className="text-gray-400 font-space text-lg">
          Lo que cambia cuando tienes los prompts correctos.
        </p>

      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-[#111111] border border-[#222222] p-8 flex flex-col justify-between">
            <div>
              <Stars />
              <p className="text-gray-300 font-space leading-relaxed text-sm mb-6">
                "{t.content}"
              </p>
              <div
                className="inline-flex items-center gap-2 px-2.5 py-1 font-space text-[10px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: t.metricBg, color: t.metricColor, border: `1px solid ${t.metricBorder}` }}
              >
                → {t.metric}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#222222]">
              <div
                className="w-10 h-10 flex items-center justify-center font-bold text-sm font-space"
                style={{ backgroundColor: t.avatarBg, color: t.avatarColor }}
              >
                {t.avatar}
              </div>
              <div>
                <p className="font-bold text-white text-sm font-space">{t.name}</p>
                <p className="text-xs text-gray-500 font-space">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
