import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Laura M.',
    role: 'Fundadora de SaaS',
    avatar: 'LM',
    avatarBg: '#faf5ff',
    avatarColor: '#a855f7',
    content: 'Usé el prompt de campaña de lanzamiento y tuvimos 80 registros en la primera semana. Antes tardaba 3 días en armar algo así. Ahora lo hago en 30 minutos.',
    metric: '80 leads en 7 días',
    metricBg: '#faf5ff',
    metricColor: '#a855f7',
    metricBorder: '#e9d5ff',
  },
  {
    name: 'Diego R.',
    role: 'Consultor independiente',
    avatar: 'DR',
    avatarBg: '#eff6ff',
    avatarColor: '#3b82f6',
    content: 'Cerré un cliente de $6,000 con la propuesta que generé usando el prompt de propuesta de valor. El cliente me preguntó si tenía equipo detrás. Era solo yo y alpacka.',
    metric: '$6,000 en una propuesta',
    metricBg: '#eff6ff',
    metricColor: '#3b82f6',
    metricBorder: '#bfdbfe',
  },
  {
    name: 'Ana B.',
    role: 'Content Manager',
    avatar: 'AB',
    avatarBg: '#f0fdf4',
    avatarColor: '#22c55e',
    content: 'Gestiono el contenido de 4 marcas yo sola. Sin alpacka era imposible. Ahora entrego calendarios editoriales completos en una tarde. Los $4/mes son lo mejor que invierto.',
    metric: '4 marcas · 1 persona',
    metricBg: '#f0fdf4',
    metricColor: '#22c55e',
    metricBorder: '#bbf7d0',
  },
];

const Stars: React.FC = () => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
    ))}
  </div>
);

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#f7f6f3', borderTop: '1px solid #e4e4e1' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-14">
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              backgroundColor: '#ffffff', border: '1px solid #e4e4e1',
              borderRadius: 100, padding: '4px 12px', marginBottom: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#787774', letterSpacing: '0.1em', textTransform: 'uppercase' }}>resultados reales</span>
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>
              Lo que cambia cuando<br />
              <span>tienes los prompts correctos.</span>
            </h2>
          </div>
          <p className="text-sm max-w-xs md:text-right pb-1 leading-relaxed" style={{ color: '#787774' }}>
            +500 usuarios mejorando sus resultados con IA cada semana
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Featured */}
          <div
            className="lg:col-span-3 rounded-3xl p-8 md:p-10 flex flex-col justify-between"
            style={{ backgroundColor: 'white', border: '1px solid #e4e4e1', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
          >
            <div>
              <Stars />
              <p className="font-display font-normal text-lg md:text-xl leading-snug mt-6 mb-6" style={{ color: '#1a1a1a' }}>
                "{testimonials[0].content}"
              </p>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[10px] font-bold"
                style={{ backgroundColor: testimonials[0].metricBg, color: testimonials[0].metricColor, border: `1px solid ${testimonials[0].metricBorder}` }}
              >
                → {testimonials[0].metric}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-6 mt-6" style={{ borderTop: '1px solid #f0efec' }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
                style={{ backgroundColor: testimonials[0].avatarBg, color: testimonials[0].avatarColor }}
              >
                {testimonials[0].avatar}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>{testimonials[0].name}</p>
                <p className="text-xs" style={{ color: '#787774' }}>{testimonials[0].role}</p>
              </div>
            </div>
          </div>

          {/* Two smaller */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {testimonials.slice(1).map(t => (
              <div
                key={t.name}
                className="rounded-3xl p-7 flex-1 flex flex-col justify-between"
                style={{ backgroundColor: 'white', border: '1px solid #e4e4e1', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                <div>
                  <Stars />
                  <p className="text-sm leading-relaxed mt-4 mb-4" style={{ color: '#787774' }}>
                    "{t.content}"
                  </p>
                  <div
                    className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full font-mono text-[9px] font-bold"
                    style={{ backgroundColor: t.metricBg, color: t.metricColor, border: `1px solid ${t.metricBorder}` }}
                  >
                    → {t.metric}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-5 mt-5" style={{ borderTop: '1px solid #f0efec' }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs"
                    style={{ backgroundColor: t.avatarBg, color: t.avatarColor }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[13px] leading-none" style={{ color: '#1a1a1a' }}>{t.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#787774' }}>{t.role}</p>
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
