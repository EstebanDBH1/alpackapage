import React from 'react';
import {
  Globe, Brain, PenLine, Code2, BarChart2, Search,
  Lightbulb, Scale, BookOpen, TrendingUp, FlaskConical, Target
} from 'lucide-react';

const cases = [
  { Icon: Globe,        title: "dominio de idiomas",      description: "practica conversación real, corrige gramática y entiende modismos con inmersión total.", bg: '#eff6ff', iconColor: '#3b82f6' },
  { Icon: Brain,        title: "aprendizaje acelerado",   description: "domina temas complejos en minutos usando síntesis y analogías de alto nivel.", bg: '#faf5ff', iconColor: '#a855f7' },
  { Icon: PenLine,      title: "escritura y tono",        description: "redacta artículos y correos que conectan, manteniendo tu voz en cada texto.", bg: '#fff7ed', iconColor: '#f97316' },
  { Icon: Code2,        title: "código y sistemas",       description: "genera scripts, componentes web y resuelve bugs aunque no sepas programar.", bg: '#f0fdf4', iconColor: '#22c55e' },
  { Icon: BarChart2,    title: "análisis de datos",       description: "describe lo que necesitas y obtén macros, cálculos y análisis avanzados al instante.", bg: '#fefce8', iconColor: '#eab308' },
  { Icon: Search,       title: "investigación profunda",  description: "extrae puntos clave de documentos y reportes técnicos sin perder el hilo.", bg: '#f0f9ff', iconColor: '#0ea5e9' },
  { Icon: Lightbulb,    title: "estrategia creativa",     description: "ideas de negocio, nombres de marca y planes de marketing basados en tendencias reales.", bg: '#fff1f2', iconColor: '#f43f5e' },
  { Icon: Scale,        title: "asistencia legal",        description: "revisa contratos y traduce el lenguaje jurídico a términos claros y accionables.", bg: '#f0fdf4', iconColor: '#10b981' },
  { Icon: BookOpen,     title: "resúmenes de valor",      description: "convierte libros y pdfs extensos en notas accionables en segundos.", bg: '#fff7ed', iconColor: '#fb923c' },
  { Icon: TrendingUp,   title: "modelos de negocio",      description: "planes de venta y propuestas de valor sólidas con un consultor estratégico siempre disponible.", bg: '#fdf4ff', iconColor: '#c026d3' },
  { Icon: FlaskConical, title: "ingeniería de prompts",   description: "aprende la estructura técnica para hablarle a la ia de forma efectiva a la primera.", bg: '#eff6ff', iconColor: '#6366f1' },
  { Icon: Target,       title: "hábitos y rutina",        description: "planes de estudio, agendas y sistemas de productividad totalmente personalizados.", bg: '#f0fdf4', iconColor: '#14b8a6' },
];

const Features: React.FC = () => {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-16">
          <div className="max-w-xl">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              backgroundColor: '#f7f6f3', border: '1px solid #e4e4e1',
              borderRadius: 100, padding: '4px 12px', marginBottom: 16,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#787774', letterSpacing: '0.1em', textTransform: 'uppercase' }}>casos de uso</span>
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>
              Un prompt para cada tarea.<br />
              <span>150+ casos cubiertos.</span>
            </h2>
          </div>
          <p className="text-sm max-w-xs md:text-right leading-relaxed pb-1" style={{ color: '#787774' }}>
            desde marketing y ventas hasta análisis de datos y estrategia.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {cases.map((item, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl border transition-all duration-150 hover:-translate-y-0.5 cursor-default"
              style={{
                backgroundColor: item.bg,
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)';
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.8)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <item.Icon size={17} style={{ color: item.iconColor }} />
              </div>
              <h3 className="font-semibold text-sm mb-2 leading-snug" style={{ color: '#1a1a1a' }}>
                {item.title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: '#787774' }}>
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
