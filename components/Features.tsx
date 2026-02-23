import React from 'react';

const casesDeUso = [
  {
    emoji: "🌍",
    title: "dominio de idiomas",
    description: "practica conversación real, corrige gramática y entiende modismos. usa prompts de inmersión para aprender cualquier lengua sin salir de casa."
  },
  {
    emoji: "🧠",
    title: "aprendizaje acelerado",
    description: "domina temas complejos en minutos. usa técnicas de síntesis y analogías para absorber conocimientos mucho más rápido de lo normal."
  },
  {
    emoji: "✍️",
    title: "escritura y tono",
    description: "redacta artículos y correos que conectan. clona tu propio estilo de escritura para que la ai mantenga tu esencia en cada texto."
  },
  {
    emoji: "💻",
    title: "código y sistemas",
    description: "genera scripts, componentes web o resuelve errores de lógica. construye herramientas potentes aunque no sepas programar."
  },
  {
    emoji: "📊",
    title: "análisis de datos",
    description: "olvida las fórmulas complejas. describe lo que necesitas y obtén macros, cálculos y análisis avanzados de tus hojas de cálculo."
  },
  {
    emoji: "🕵️",
    title: "investigación profunda",
    description: "analiza mercados o temas históricos. extrae puntos clave de documentos interminables y reportes técnicos sin perder el hilo."
  },
  {
    emoji: "💡",
    title: "estrategia creativa",
    description: "desbloquea ideas de negocio, nombres de marca y planes de marketing basados en tendencias reales y actuales."
  },
  {
    emoji: "⚖️",
    title: "asistencia legal",
    description: "revisa contratos y detecta cláusulas de riesgo. traduce el lenguaje jurídico a términos sencillos y fáciles de entender."
  },
  {
    emoji: "📚",
    title: "resúmenes de valor",
    description: "convierte libros y pdfs largos en notas accionables. extrae la sabiduría de cualquier texto en segundos."
  },
  {
    emoji: "💰",
    title: "modelos de negocio",
    description: "crea planes de venta y propuestas de valor sólidas. usa la ai como un consultor estratégico para escalar tus proyectos."
  },
  {
    emoji: "🧪",
    title: "ingeniería de prompts",
    description: "aprende la estructura técnica para hablarle a la ai de forma efectiva y obtener resultados precisos a la primera."
  },
  {
    emoji: "🌱",
    title: "hábitos y rutina",
    description: "diseña planes de estudio, agendas y sistemas de productividad personalizados para optimizar cada minuto de tu día."
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-white text-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4 text-zinc-900 lowercase">
            tareas reales. resultados reales.
          </h2>
          <p className="font-mono text-xs text-zinc-500 tracking-widest uppercase">
            todo lo que puedes construir y aprender con alpackaai
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {casesDeUso.map((item, index) => (
            <div
              key={index}
              className="bg-zinc-50 p-8 rounded-xl border border-zinc-200 relative overflow-hidden group transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-100/50"
            >
              <div className="relative z-10">
                <span className="block text-3xl mb-6 transition-transform duration-300 group-hover:scale-110">
                  {item.emoji}
                </span>
                <h3 className="text-xl font-bold mb-3 text-zinc-900 lowercase">
                  {item.title}
                </h3>
                <p className="text-zinc-500 text-sm font-sans leading-relaxed lowercase">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;