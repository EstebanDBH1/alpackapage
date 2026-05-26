import React, { useRef, useState, useEffect } from 'react';
import { Search, Check, Lock, Copy, Star, Zap } from 'lucide-react';

/* ─── IntersectionObserver hook ────────────────────────────────── */
const useActiveStep = (count: number) => {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>(Array(count).fill(null));
  useEffect(() => {
    const observers = refs.current.map((ref, i) => {
      if (!ref) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i); },
        { rootMargin: '-38% 0px -38% 0px' }
      );
      obs.observe(ref);
      return obs;
    });
    return () => { observers.forEach(o => o?.disconnect()); };
  }, []);
  return { active, refs };
};

/* ─── Mockup 1: Library browser ────────────────────────────────── */
const LibraryMockup: React.FC = () => (
  <div style={{
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    backgroundColor: 'white', borderRadius: 18,
    border: '1px solid #e4e4e1',
    boxShadow: '0 32px 80px rgba(0,0,0,0.11), 0 0 0 1px rgba(0,0,0,0.03)',
    overflow: 'hidden',
  }}>
    {/* Browser bar */}
    <div style={{ backgroundColor: '#f7f6f3', padding: '10px 14px', borderBottom: '1px solid #e4e4e1', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {['#ff6b6b', '#ffd93d', '#6bcb77'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c }} />)}
      </div>
      <div style={{ flex: 1, maxWidth: 220, margin: '0 auto', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 6, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 9, color: '#a8a5a1', fontFamily: 'monospace' }}>alpacka.ai/prompts</span>
      </div>
    </div>
    {/* Body */}
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 152, borderRight: '1px solid #e4e4e1', padding: '14px 10px', backgroundColor: '#fafaf8', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#c4c2bf', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Biblioteca</div>
        {[
          { icon: '⚡', label: 'Productividad', count: 42, active: true },
          { icon: '📣', label: 'Marketing', count: 38 },
          { icon: '✍️', label: 'Copywriting', count: 35 },
          { icon: '💼', label: 'Negocios', count: 29 },
          { icon: '🎨', label: 'Contenido', count: 27 },
          { icon: '📧', label: 'Email', count: 22 },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '5px 7px', borderRadius: 6, marginBottom: 2,
            backgroundColor: item.active ? '#f0f0ff' : 'transparent',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11 }}>{item.icon}</span>
              <span style={{ fontSize: 11, color: item.active ? '#6366f1' : '#787774', fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
            </div>
            <span style={{ fontSize: 9, color: '#c4c2bf', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, padding: '1px 4px' }}>{item.count}</span>
          </div>
        ))}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, backgroundColor: '#f7f6f3', border: '1px solid #e4e4e1', borderRadius: 8, padding: '6px 10px' }}>
          <Search size={11} style={{ color: '#a8a5a1' }} />
          <span style={{ fontSize: 11, color: '#c4c2bf' }}>Buscar prompts...</span>
        </div>
        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { title: 'Planificador semanal Deep Work con bloques de 90 min', cat: '⚡ Productividad', active: true },
            { title: 'Resumen ejecutivo con decisiones y próximos pasos', cat: '⚡ Productividad' },
            { title: 'Plan de objetivos Q3 con métricas y responsables', cat: '⚡ Productividad' },
            { title: 'Auditoría de tiempo: dónde van tus horas realmente', cat: '⚡ Productividad' },
          ].map((card, i) => (
            <div key={i} style={{
              padding: '11px 13px', borderRadius: 10,
              border: card.active ? '1.5px solid #a78bfa' : '1px solid #e4e4e1',
              backgroundColor: card.active ? '#faf5ff' : 'white',
              boxShadow: card.active ? '0 4px 14px rgba(167,139,250,0.14)' : 'none',
            }}>
              <div style={{ fontSize: 9, color: '#a8a5a1', marginBottom: 5 }}>{card.cat}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3 }}>{card.title}</div>
              <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Lock size={7} style={{ color: '#a78bfa' }} />
                <span style={{ fontSize: 8, color: '#a78bfa', fontWeight: 700 }}>premium</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ─── Mockup 2: Prompt detail + copy ───────────────────────────── */
const CopyMockup: React.FC = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{
      flex: 1, backgroundColor: 'white', borderRadius: 18,
      border: '1px solid #e4e4e1', boxShadow: '0 24px 70px rgba(0,0,0,0.1)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 22px', borderBottom: '1px solid #e4e4e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', backgroundColor: '#f0f0ff', border: '1px solid #c7d2fe', borderRadius: 5, padding: '2px 8px' }}>⚡ Productividad</span>
          <div style={{ display: 'flex', gap: 5 }}>
            {['ChatGPT', 'Claude', 'Gemini'].map(ai => (
              <span key={ai} style={{ fontSize: 8, color: '#787774', backgroundColor: '#f7f6f3', border: '1px solid #e4e4e1', borderRadius: 4, padding: '2px 5px' }}>{ai}</span>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}>
          Planificador de semana con bloques de foco y revisión de objetivos
        </div>
      </div>
      {/* Prompt text */}
      <div style={{ flex: 1, padding: '14px 22px', fontFamily: 'monospace', fontSize: 11, lineHeight: 1.75, color: '#787774', overflow: 'hidden' }}>
        <div style={{ marginBottom: 2 }}><span style={{ color: '#a78bfa', fontWeight: 700 }}># ROL</span></div>
        <div style={{ marginBottom: 10, color: '#555' }}>Actúa como coach de productividad certificado en Deep Work y gestión de energía cognitiva. Has trabajado con +200 founders y directivos de alto rendimiento que necesitan maximizar resultados sin agotarse.</div>
        <div style={{ marginBottom: 2 }}><span style={{ color: '#a78bfa', fontWeight: 700 }}># OBJETIVO</span></div>
        <div style={{ marginBottom: 10, color: '#555' }}>Diseña mi semana laboral completa del [LUNES] al [VIERNES]. Quiero bloques de 90 min de foco profundo, pausas activas entre bloques y una revisión de objetivos al cierre de cada día.</div>
        <div style={{ marginBottom: 2 }}><span style={{ color: '#a78bfa', fontWeight: 700 }}># CONTEXTO</span></div>
        <div style={{ marginBottom: 10, color: '#555' }}>Tipo de trabajo: [describe tu trabajo, ej: consultor, diseñador, founder]<br/>Reuniones fijas: [lista reuniones con hora y día]<br/>Energía alta: [horario pico, ej: 8–12h]<br/>Objetivos clave esta semana: [escribe 3 objetivos concretos]</div>
        <div style={{ marginBottom: 2 }}><span style={{ color: '#a78bfa', fontWeight: 700 }}># FORMATO</span></div>
        <div style={{ marginBottom: 10, color: '#555' }}>Tabla por día: Hora | Actividad | Tipo de foco | Duración | Notas<br/>Tipos de foco: Profundo · Operativo · Reunión · Recarga<br/>Añade bloque de revisión semanal el viernes 17:00–18:00.</div>
        <div style={{ marginBottom: 2 }}><span style={{ color: '#a78bfa', fontWeight: 700 }}># RESTRICCIONES</span></div>
        <div style={{ color: '#555' }}>Máx. 3 bloques de foco profundo por día (90 min c/u)<br/>Pausa activa de 15 min obligatoria entre cada bloque<br/>Deja el 20% del tiempo libre para imprevistos<br/>No programes foco profundo en las 2h después de comer</div>
      </div>
      {/* Copy action */}
      <div style={{ padding: '14px 22px', borderTop: '1px solid #e4e4e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: '#a8a5a1' }}>contexto · rol · formato · restricciones</span>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          backgroundColor: '#22c55e', color: 'white', fontWeight: 700, fontSize: 12,
          padding: '8px 16px', borderRadius: 8, boxShadow: '0 4px 14px rgba(34,197,94,0.28)',
        }}>
          <Check size={11} strokeWidth={3} />
          ¡Copiado!
        </div>
      </div>
    </div>
    {/* Floating badge */}
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ backgroundColor: 'white', border: '1px solid #bbf7d0', borderRadius: 10, padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#166534' }}>Listo para pegar en cualquier IA</span>
      </div>
    </div>
  </div>
);

/* ─── Mockup 3: AI result ───────────────────────────────────────── */
const ResultMockup: React.FC = () => (
  <div style={{
    width: '100%', height: '100%', backgroundColor: 'white', borderRadius: 18,
    border: '1px solid #e4e4e1', boxShadow: '0 24px 70px rgba(0,0,0,0.1)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  }}>
    {/* Chat header */}
    <div style={{ backgroundColor: '#f7f6f3', padding: '11px 18px', borderBottom: '1px solid #e4e4e1', display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: '#10a37f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 13, color: 'white' }}>✦</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>ChatGPT — GPT-5</span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#22c55e' }} />
        <span style={{ fontSize: 10, color: '#787774' }}>1ª respuesta</span>
      </div>
    </div>
    {/* Messages */}
    <div style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
      {/* User msg */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ backgroundColor: '#f0f0ff', border: '1px solid #c7d2fe', borderRadius: '12px 12px 3px 12px', padding: '8px 13px', maxWidth: '85%', fontSize: 10, color: '#4338ca', fontFamily: 'monospace', lineHeight: 1.5 }}>
          # ROL: coach de productividad certificado en Deep Work...<br />
          # OBJETIVO: semana del 24 al 28 de junio, bloques 90 min...<br />
          # CONTEXTO: consultor B2B · reuniones: mar 10h, jue 16h...
        </div>
      </div>
      {/* AI response */}
      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: '#10a37f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'white' }}>✦</span>
        </div>
        <div style={{ flex: 1, fontSize: 11, lineHeight: 1.75, color: '#374151' }}>
          <div style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>Plan Semanal · 24–28 de Junio</div>
          <div style={{ fontWeight: 600, color: '#6366f1', fontSize: 10, marginBottom: 3 }}>🎯 OBJETIVOS DE LA SEMANA</div>
          <div style={{ marginBottom: 8, fontSize: 10 }}>1. Cerrar propuesta cliente X (deadline: viernes)<br />2. Revisar métricas Q2 y preparar informe ejecutivo<br />3. Lanzar secuencia de emails — campaña semana 3</div>
          <div style={{ fontWeight: 600, color: '#6366f1', fontSize: 10, marginBottom: 3 }}>⚡ LUNES — Foco estratégico</div>
          <div style={{ fontSize: 10, marginBottom: 6 }}>08:00–09:30 · Foco profundo: propuesta cliente X<br />09:30–09:45 · Pausa activa obligatoria<br />09:45–11:15 · Foco profundo: análisis métricas Q2<br />11:15–12:00 · Operativo: emails y seguimientos</div>
          <div style={{ fontWeight: 600, color: '#6366f1', fontSize: 10, marginBottom: 3 }}>📋 MARTES — Reunión + operativo</div>
          <div style={{ fontSize: 10 }}>08:00–09:30 · Foco profundo: redacción informe Q2<br />10:00–11:00 · Reunión equipo (fija)<br />11:15–12:45 · Foco profundo: propuesta (cierre)</div>
        </div>
      </div>
    </div>
    {/* Footer */}
    <div style={{ padding: '10px 18px', borderTop: '1px solid #e4e4e1', display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#fafaf8' }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#22c55e' }} />
      <span style={{ fontSize: 10, color: '#787774' }}>Resultado profesional · Sin iteraciones · Listo para usar</span>
    </div>
  </div>
);

/* ─── Main component ────────────────────────────────────────────── */
const steps = [
  {
    num: '01', label: 'Encuentra',
    accent: '#6366f1', lineColor: 'rgba(99,102,241,0.35)',
    title: 'Filtra y encuentra el prompt exacto.',
    desc: '150+ prompts organizados por categoría, IA y caso de uso. Encuentra lo que necesitas en segundos, sin buscar en foros ni inventar desde cero.',
    mockup: <LibraryMockup />,
  },
  {
    num: '02', label: 'Copia',
    accent: '#22c55e', lineColor: 'rgba(34,197,94,0.35)',
    title: 'Copia la estructura completa. Un clic.',
    desc: 'No copies texto a mano. Un clic y tienes el prompt con contexto, rol, formato y restricciones incluidos. Todo lo que la IA necesita para entenderte bien.',
    mockup: <CopyMockup />,
  },
  {
    num: '03', label: 'Resultado',
    accent: '#f97316', lineColor: 'rgba(249,115,22,0.35)',
    title: 'Resultado profesional en la primera respuesta.',
    desc: 'Pégalo en ChatGPT, Claude o Gemini. La IA tiene todo el contexto que necesita. Sin iteraciones. Sin perder tiempo. Primera respuesta = resultado final.',
    mockup: <ResultMockup />,
  },
];

const StickyFeatureTour: React.FC = () => {
  const { active, refs } = useActiveStep(steps.length);

  return (
    <section style={{ backgroundColor: '#ffffff', paddingTop: 100, paddingBottom: 120, borderTop: '1px solid #e4e4e1' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>

        {/* Section header */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#f7f6f3', border: '1px solid #e4e4e1', borderRadius: 100, padding: '4px 12px', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#787774', letterSpacing: '0.1em', textTransform: 'uppercase' }}>así funciona</span>
          </div>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 'clamp(1.9rem, 3.5vw, 3rem)', color: '#1a1a1a', letterSpacing: '-0.025em', lineHeight: 1.12, marginBottom: 16 }}>
            De cero a resultado profesional.<br />
            <span style={{ background: 'linear-gradient(135deg, #667eea 0%, #f0abfc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              En menos de 2 minutos.
            </span>
          </h2>
          <p style={{ color: '#787774', fontSize: 16, lineHeight: 1.7, maxWidth: 420 }}>
            Tres pasos. Una sola herramienta. Más tiempo para lo que importa.
          </p>
        </div>

        {/* Desktop: two-column sticky layout */}
        <div className="hidden lg:grid" style={{ gridTemplateColumns: '480px 1fr', gap: 80, alignItems: 'start' }}>

          {/* Left — scrolling steps */}
          <div>
            {steps.map((step, i) => (
              <div
                key={i}
                ref={el => { refs.current[i] = el; }}
                style={{ minHeight: '72vh', display: 'flex', alignItems: 'center', padding: '48px 0' }}
              >
                <div style={{
                  opacity: active === i ? 1 : 0.18,
                  transform: `translateX(${active === i ? 0 : -10}px)`,
                  transition: 'opacity 0.65s cubic-bezier(.4,0,.2,1), transform 0.65s cubic-bezier(.4,0,.2,1)',
                }}>
                  {/* Step num + label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: step.accent }}>{step.num}</span>
                    <div style={{ height: 1, width: 24, backgroundColor: step.accent, opacity: 0.5 }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: step.accent, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{step.label}</span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 2.2vw, 1.9rem)', color: '#1a1a1a', marginBottom: 14, lineHeight: 1.18, letterSpacing: '-0.02em' }}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p style={{ color: '#787774', fontSize: 15, lineHeight: 1.78, maxWidth: 400 }}>
                    {step.desc}
                  </p>

                  {/* Progress pills */}
                  <div style={{ marginTop: 30, display: 'flex', gap: 6, alignItems: 'center' }}>
                    {steps.map((s, j) => (
                      <div key={j} style={{
                        height: 4, borderRadius: 100,
                        width: j === active ? 28 : 4,
                        backgroundColor: j === active ? step.accent : '#e4e4e1',
                        transition: 'all 0.45s cubic-bezier(.4,0,.2,1)',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — sticky mockup panel */}
          <div style={{ position: 'sticky', top: '10vh' }}>
            <div style={{ position: 'relative', height: '80vh' }}>
              {steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute', inset: 0,
                    opacity: active === i ? 1 : 0,
                    transform: active === i
                      ? 'scale(1) translateY(0)'
                      : active > i
                        ? 'scale(0.96) translateY(-14px)'
                        : 'scale(0.96) translateY(14px)',
                    transition: 'opacity 0.65s cubic-bezier(.4,0,.2,1), transform 0.65s cubic-bezier(.4,0,.2,1)',
                    pointerEvents: active === i ? 'auto' : 'none',
                  }}
                >
                  {step.mockup}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: stacked steps with inline mockups */}
        <div className="lg:hidden space-y-16">
          {steps.map((step, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: step.accent }}>{step.num}</span>
                <div style={{ height: 1, width: 20, backgroundColor: step.accent, opacity: 0.5 }} />
                <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: step.accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{step.label}</span>
              </div>
              <h3 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#1a1a1a', marginBottom: 10, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                {step.title}
              </h3>
              <p style={{ color: '#787774', fontSize: 15, lineHeight: 1.75, marginBottom: 24 }}>
                {step.desc}
              </p>
              <div style={{ height: 400 }}>{step.mockup}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default StickyFeatureTour;
