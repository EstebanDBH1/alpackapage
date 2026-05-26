import React from 'react';

const steps = [
  { num: "01", title: "Activa tu acceso", desc: "Suscríbete por $4/mes. Sin contratos ni letras pequeñas. Libertad total para cancelar cuando quieras.", emoji: "⚡", bg: '#faf5ff', accent: '#a855f7' },
  { num: "02", title: "Encuentra la solución", desc: "Navega por una biblioteca curada de prompts de alto nivel, optimizados para los modelos de IA más potentes.", emoji: "🔍", bg: '#eff6ff', accent: '#3b82f6' },
  { num: "03", title: "Copia con precisión", desc: "Obtén con un clic la estructura exacta, parámetros técnicos y las instrucciones que otros ignoran.", emoji: "⌘", bg: '#f0fdf4', accent: '#22c55e' },
  { num: "04", title: "Domina la IA", desc: "Pégalo en ChatGPT, Claude o Gemini y mira cómo la IA entrega resultados profesionales al instante.", emoji: "🚀", bg: '#fff7ed', accent: '#f97316' },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#f7f6f3', borderTop: '1px solid #e4e4e1' }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16 md:mb-20 text-center max-w-xl mx-auto">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            backgroundColor: '#ffffff', border: '1px solid #e4e4e1',
            borderRadius: 100, padding: '4px 12px', marginBottom: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#787774', letterSpacing: '0.1em', textTransform: 'uppercase' }}>proceso</span>
          </div>
          <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>
            Más simple de lo que parece.<br />
            <span>Cuatro pasos.</span>
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="rounded-2xl p-8 transition-all hover:-translate-y-0.5 cursor-default"
              style={{
                backgroundColor: step.bg,
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  style={{
                    width: 48, height: 48, borderRadius: 14,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  {step.emoji}
                </div>
                <span
                  className="font-mono text-[11px] font-bold"
                  style={{ color: step.accent, backgroundColor: 'rgba(255,255,255,0.7)', padding: '3px 8px', borderRadius: 6 }}
                >
                  {step.num}
                </span>
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: '#1a1a1a', letterSpacing: '-0.01em' }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#787774' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
