import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex Rivera',
    role: 'Full-stack Developer',
    content: 'He ahorrado horas de depuración. Los prompts de SQL son simplemente perfectos. Desde que lo uso, mis pull requests se revisan solos.',
    avatar: 'AR',
  },
  {
    name: 'Elena Gómez',
    role: 'Content Creator',
    content: 'Mis hilos de Twitter ahora tienen 10 veces más engagement. Brutal.',
    avatar: 'EG',
  },
  {
    name: 'Marcus Chen',
    role: 'Product Designer',
    content: 'La sección de Midjourney es una joya. Resultados consistentes en minutos.',
    avatar: 'MC',
  },
];

const Stars: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={size} className="fill-amber-400 text-amber-400" />
    ))}
  </div>
);

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#F0EAE1' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-14">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: '#8B7E74' }}>
              — testimonios
            </p>
            <h2 className="font-display text-3xl md:text-4xl leading-tight" style={{ color: '#1D1B18' }}>
              Lo que dicen<br />
              <em className="not-italic font-sans font-bold">de nosotros.</em>
            </h2>
          </div>
          <p className="text-sm max-w-xs md:text-right pb-1 leading-relaxed" style={{ color: '#8B7E74' }}>
            +50 usuarios optimizando su flujo de trabajo diario
          </p>
        </div>

        {/* Grid: 1 large + 2 small */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Featured */}
          <div
            className="lg:col-span-3 rounded-3xl p-8 md:p-10 border flex flex-col justify-between"
            style={{ backgroundColor: 'white', borderColor: '#E3DCD3' }}
          >
            <div>
              <Stars size={14} />
              <p className="font-display italic font-light text-2xl md:text-[1.7rem] leading-snug mt-6 mb-8" style={{ color: '#1D1B18' }}>
                "{testimonials[0].content}"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-6" style={{ borderTop: '1px solid #F0EAE1' }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border"
                style={{ backgroundColor: '#F0EAE1', color: '#1D1B18', borderColor: '#E3DCD3' }}
              >
                {testimonials[0].avatar}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#1D1B18' }}>{testimonials[0].name}</p>
                <p className="text-xs" style={{ color: '#8B7E74' }}>{testimonials[0].role}</p>
              </div>
            </div>
          </div>

          {/* Two smaller */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {testimonials.slice(1).map((t) => (
              <div
                key={t.name}
                className="rounded-3xl p-7 border flex-1 flex flex-col justify-between"
                style={{ backgroundColor: 'white', borderColor: '#E3DCD3' }}
              >
                <div>
                  <Stars size={11} />
                  <p className="text-sm leading-relaxed mt-4 mb-6" style={{ color: '#8B7E74' }}>
                    "{t.content}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid #F0EAE1' }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border"
                    style={{ backgroundColor: '#FAF0E8', color: '#C96A3C', borderColor: '#F5D9C8' }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[13px] leading-none" style={{ color: '#1D1B18' }}>{t.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#8B7E74' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Testimonials;
