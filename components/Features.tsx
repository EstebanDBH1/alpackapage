import React from 'react';
import {
  Globe, Brain, PenLine, Code2, BarChart2, Search,
  Lightbulb, Scale, BookOpen, TrendingUp, FlaskConical, Target
} from 'lucide-react';

const cases = [
  { Icon: Globe,        title: "dominio de idiomas",      description: "practica conversación real, corrige gramática y entiende modismos con inmersión total." },
  { Icon: Brain,        title: "aprendizaje acelerado",   description: "domina temas complejos en minutos usando síntesis y analogías de alto nivel." },
  { Icon: PenLine,      title: "escritura y tono",        description: "redacta artículos y correos que conectan, manteniendo tu voz en cada texto." },
  { Icon: Code2,        title: "código y sistemas",       description: "genera scripts, componentes web y resuelve bugs aunque no sepas programar." },
  { Icon: BarChart2,    title: "análisis de datos",       description: "describe lo que necesitas y obtén macros, cálculos y análisis avanzados al instante." },
  { Icon: Search,       title: "investigación profunda",  description: "extrae puntos clave de documentos y reportes técnicos sin perder el hilo." },
  { Icon: Lightbulb,    title: "estrategia creativa",     description: "ideas de negocio, nombres de marca y planes de marketing basados en tendencias reales." },
  { Icon: Scale,        title: "asistencia legal",        description: "revisa contratos y traduce el lenguaje jurídico a términos claros y accionables." },
  { Icon: BookOpen,     title: "resúmenes de valor",      description: "convierte libros y pdfs extensos en notas accionables en segundos." },
  { Icon: TrendingUp,   title: "modelos de negocio",      description: "planes de venta y propuestas de valor sólidas con un consultor estratégico siempre disponible." },
  { Icon: FlaskConical, title: "ingeniería de prompts",   description: "aprende la estructura técnica para hablarle a la ia de forma efectiva a la primera." },
  { Icon: Target,       title: "hábitos y rutina",        description: "planes de estudio, agendas y sistemas de productividad totalmente personalizados." },
];

const Features: React.FC = () => {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: 'white' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-16">
          <div className="max-w-xl">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: '#8B7E74' }}>
              — casos de uso
            </p>
            <h2 className="font-display text-3xl md:text-4xl leading-tight" style={{ color: '#1D1B18' }}>
              Tareas reales.<br />
              <em className="not-italic font-sans font-bold">Resultados reales.</em>
            </h2>
          </div>
          <p className="text-sm max-w-xs md:text-right leading-relaxed pb-1" style={{ color: '#8B7E74' }}>
            todo lo que puedes construir, aprender y automatizar con alpacka.ai.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cases.map((item, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl border transition-all duration-150 hover:-translate-y-0.5"
              style={{ backgroundColor: '#FAF9F5', borderColor: '#E3DCD3' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#C96A3C';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(201,106,60,0.07)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#E3DCD3';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 border transition-colors group-hover:border-orange-200"
                style={{ backgroundColor: 'white', borderColor: '#E3DCD3' }}
              >
                <item.Icon size={15} style={{ color: '#8B7E74' }} className="group-hover:text-brand-accent transition-colors" />
              </div>
              <h3 className="font-semibold text-sm mb-2 leading-snug" style={{ color: '#1D1B18' }}>
                {item.title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: '#8B7E74' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
