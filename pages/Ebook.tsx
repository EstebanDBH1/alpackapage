import React, { useState } from 'react';
import { Check, Shield, ChevronDown, ChevronUp, BookOpen, Zap, Target, Users, Star, ArrowRight, Gift, Clock, TrendingUp } from 'lucide-react';
import AlpacaIcon from '../components/AlpacaIcon';

const RED = '#dc2626';
const RED_DIM = 'rgba(220,38,38,0.15)';
const RED_BORDER = 'rgba(220,38,38,0.35)';
const BG = '#0a0a0a';
const SURFACE = '#111111';
const SURFACE2 = '#161616';
const TEXT = 'rgba(255,255,255,0.90)';
const TEXT_MUTED = 'rgba(255,255,255,0.55)';
const TEXT_DIM = 'rgba(255,255,255,0.30)';
const BORDER = 'rgba(255,255,255,0.07)';

/* ─── Ebook cover ─── */
const EbookCover: React.FC = () => (
  <div className="relative flex items-center justify-center">
    <div className="absolute" style={{
      width: 380, height: 460,
      background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.35) 0%, transparent 70%)',
      filter: 'blur(50px)',
      borderRadius: '50%',
    }} />
    <div className="relative" style={{
      width: 270,
      height: 360,
      borderRadius: '4px 14px 14px 4px',
      background: 'linear-gradient(135deg, #1a0505 0%, #0d0d0d 50%, #1a0505 100%)',
      boxShadow: '-8px 8px 0 #050505, -16px 16px 40px rgba(0,0,0,0.9), 0 0 80px rgba(220,38,38,0.22)',
      border: '1px solid rgba(220,38,38,0.28)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      textAlign: 'center',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #dc2626, transparent)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 16, background: 'linear-gradient(90deg, #000, #1a0505)', borderRight: '1px solid rgba(220,38,38,0.2)' }} />
      <div style={{ paddingLeft: 14 }}>
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: '0.22em', color: '#dc2626', textTransform: 'uppercase', marginBottom: 12 }}>alpacka.ai</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.4, marginBottom: 8 }}>el gran</p>
        <p style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 26, lineHeight: 1.05, color: 'white', textTransform: 'uppercase', marginBottom: 4 }}>
          EBOOK<br />de<br />PROMPTS
        </p>
        <p style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 15, color: '#dc2626', textTransform: 'uppercase', marginBottom: 16 }}>de IA generativa</p>
        <div style={{ width: 44, height: 2, background: '#dc2626', margin: '0 auto 16px' }} />
        <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 11, lineHeight: 1.5 }}>que realmente<br />necesitas</p>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, background: 'linear-gradient(0deg, rgba(220,38,38,0.14), transparent)' }} />
    </div>
  </div>
);

/* ─── FAQ Item ─── */
const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between py-6 px-7" style={{ userSelect: 'none' }}>
        <span style={{ color: TEXT, fontSize: 16, fontWeight: 500, lineHeight: 1.5, paddingRight: 28 }}>{q}</span>
        {open
          ? <ChevronUp size={17} style={{ color: RED, flexShrink: 0 }} />
          : <ChevronDown size={17} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
        }
      </div>
      {open && (
        <div className="px-7 pb-6">
          <p style={{ color: TEXT_MUTED, fontSize: 15, lineHeight: 1.8 }}>{a}</p>
        </div>
      )}
    </div>
  );
};

/* ─── AI Marquee ─── */
const aiTools = [
  { name: 'ChatGPT', color: '#10a37f' },
  { name: 'Claude', color: '#D4A853' },
  { name: 'Gemini', color: '#4285F4' },
  { name: 'DeepSeek', color: '#3B82F6' },
  { name: 'Perplexity', color: '#20B2AA' },
  { name: 'Grok', color: '#e0e0e0' },
  { name: 'Mistral', color: '#FF6B35' },
  { name: 'Copilot', color: '#0078D4' },
  { name: 'Meta AI', color: '#0668E1' },
  { name: 'LLaMA 3', color: '#9B59B6' },
  { name: 'Command R', color: '#E74C3C' },
  { name: 'Qwen', color: '#F39C12' },
];

const AIMarquee: React.FC = () => {
  const doubled = [...aiTools, ...aiTools];
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ai-marquee-track {
          animation: marqueeScroll 38s linear infinite;
          display: flex;
          width: max-content;
          gap: 12px;
          align-items: center;
        }
        .ai-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="ai-marquee-track" style={{ padding: '4px 0' }}>
        {doubled.map((tool, i) => (
          <div
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 100,
              padding: '9px 18px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: tool.color, flexShrink: 0 }} />
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.05em' }}>
              {tool.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Main ─── */
const Ebook: React.FC = () => {

  const checkItems = [
    'Más de 200 prompts universales y categorizados',
    'Organizados por categoría y caso de uso real',
    'Compatible con ChatGPT, Claude, Gemini, DeepSeek y más',
    'Descarga inmediata — empieza en 2 minutos',
    'Actualizaciones gratuitas para siempre',
  ];

  const contentItems = [
    { title: 'Negocios y Emprendimiento', desc: 'Planes de negocio, pitch decks, análisis competitivos y propuestas que realmente cierran tratos.' },
    { title: 'Marketing y Ventas', desc: 'Emails que convierten, copy para anuncios, estrategias de contenido y campañas de 30 días en minutos.' },
    { title: 'Redes Sociales', desc: 'Calendarios editoriales listos, captions para viralizarte y guiones completos para Reels y TikTok.' },
    { title: 'Productividad Personal', desc: 'Planificación, toma de decisiones difíciles, gestión del tiempo y automatización de tareas repetitivas.' },
    { title: 'Programación y Tech', desc: 'Debugging, revisión de código, documentación técnica y diseño de arquitectura de software.' },
    { title: 'Escritura y Copywriting', desc: 'Artículos, guiones, storytelling y textos que enganchan desde la primera oración.' },
    { title: 'Educación y Formación', desc: 'Temarios completos, evaluaciones, explicaciones adaptadas y material didáctico en segundos.' },
    { title: 'Consultoría y Estrategia', desc: 'Frameworks de análisis, reportes ejecutivos y sesiones de consultoría estructuradas al instante.' },
  ];

  const whyItems = [
    {
      icon: <Target size={22} style={{ color: RED }} />,
      title: 'Resultados desde la primera respuesta',
      desc: 'Cada prompt tiene contexto, rol y formato definido. No más iteraciones. No más pérdida de tiempo. La IA entiende exactamente lo que necesitas.',
    },
    {
      icon: <Zap size={22} style={{ color: RED }} />,
      title: 'Recupera 10 horas a la semana',
      desc: 'Lo que antes tomaba 2 horas ahora toma 10 minutos. Por $10, el retorno de inversión es en las primeras 2 horas de uso.',
    },
    {
      icon: <BookOpen size={22} style={{ color: RED }} />,
      title: '+200 prompts probados en entornos reales',
      desc: 'No son prompts genéricos de internet. Son estructuras que han funcionado en negocios reales, proyectos reales, resultados reales.',
    },
    {
      icon: <TrendingUp size={22} style={{ color: RED }} />,
      title: 'La ventaja que otros no tienen',
      desc: 'Mientras la mayoría lucha con IA mediocre, tú tendrás la estructura exacta para obtener outputs de nivel profesional, siempre.',
    },
  ];

  const bonusItems = [
    {
      num: '01',
      title: 'Framework CIDE: Crea tus propios prompts',
      desc: 'El sistema exacto detrás de cada prompt del libro. Una vez que lo entiendes, puedes crear prompts de alta calidad para cualquier situación, en cualquier momento.',
      value: 'Valor: $15',
    },
    {
      num: '02',
      title: 'Prompt Maestro para Reuniones',
      desc: 'Convierte cualquier reunión en una lista de acciones concretas, responsables y fechas. El prompt que más nos piden. Úsalo mañana mismo.',
      value: 'Valor: $10',
    },
    {
      num: '03',
      title: 'Pack LinkedIn: 15 prompts extra',
      desc: 'Optimiza tu perfil, genera contenido que genera seguidores y posiciónate como referente en tu industria. Incluido sin costo adicional.',
      value: 'Valor: $12',
    },
  ];

  const faqs = [
    {
      q: '¿Funciona con cualquier IA? ¿ChatGPT, Claude, Gemini...?',
      a: 'Sí, al 100%. Todos los prompts funcionan con cualquier IA generativa: ChatGPT (gratuito o Plus), Claude, Gemini, DeepSeek, Perplexity y cualquier otro modelo. La estructura es lo que importa, no el modelo que uses.',
    },
    {
      q: '¿Necesito experiencia en inteligencia artificial?',
      a: 'Para nada. El libro está diseñado para que cualquier persona — sin importar su nivel técnico — pueda copiar, pegar y obtener resultados profesionales de inmediato. Si sabes escribir en cualquier chat de IA, sabes usar este libro.',
    },
    {
      q: '¿Cómo recibo el ebook después de pagar?',
      a: 'Recibirás un correo electrónico en los primeros 5 minutos después del pago con el enlace de descarga. Acceso instantáneo, 24/7. Sin esperas. Sin trámites.',
    },
    {
      q: '¿Y si el libro no es lo que esperaba?',
      a: 'Tienes 30 días completos para solicitar un reembolso, sin preguntas, sin formularios. Un solo correo es suficiente y te devolvemos el 100% de tu dinero. La garantía existe porque estamos completamente seguros del valor que vas a obtener.',
    },
    {
      q: '¿Los prompts se actualizan cuando evolucionan las IAs?',
      a: 'Sí. Tienes acceso gratuito a todas las actualizaciones futuras. A medida que evolucionan los modelos de IA, la plantilla evoluciona contigo. Una sola compra, valor permanente.',
    },
    {
      q: '¿En qué formato está? ¿Cómo accedo a los prompts?',
      a: 'Es una plantilla de Notion. Cuando compras, recibes acceso a un workspace completo con todos los prompts organizados por categoría. Puedes duplicarlo a tu cuenta gratuita de Notion y acceder desde cualquier dispositivo: computadora, tablet o teléfono.',
    },
  ];

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: '"DM Sans", sans-serif', color: TEXT }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 60% at 60% 0%, rgba(180,10,10,0.13) 0%, transparent 60%)',
        zIndex: 0,
      }} />

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 md:py-28">
            <div className="flex flex-col items-center">

              {/* Content */}
              <div style={{ maxWidth: 620, width: '100%', textAlign: 'center' }}>
                {/* Brand */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  <AlpacaIcon className="w-5 h-5" style={{ color: RED }} />
                  <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontStyle: 'italic', fontWeight: 300, fontSize: 19, color: 'rgba(255,255,255,0.7)' }}>
                    alpacka<span style={{ fontStyle: 'normal', fontFamily: '"DM Sans",sans-serif', fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>.ai</span>
                  </span>
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 mb-6" style={{
                  backgroundColor: RED_DIM,
                  border: `1px solid ${RED_BORDER}`,
                  borderRadius: 100,
                  padding: '6px 14px',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: RED }} />
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: RED, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    precio de lanzamiento
                  </span>
                </div>

                {/* Headline */}
                <h1 style={{
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                  lineHeight: 1.05,
                  color: 'white',
                  marginBottom: 22,
                }}>
                  El Ebook de Prompts<br />
                  <span style={{ color: RED }}>que Realmente</span><br />
                  Necesitas
                </h1>

                {/* Subheadline */}
                <p style={{ color: TEXT_MUTED, fontSize: 'clamp(15px, 1.6vw, 18px)', lineHeight: 1.75, margin: '0 auto 30px', maxWidth: 480 }}>
                  Domina ChatGPT, Gemini, Claude, Copilot y cualquier IA generativa con los mejores prompts. Un solo recurso para multiplicar tu productividad, sin importar qué herramienta uses.{' '}
                  <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Deja de reescribir. Empieza a producir.</strong>
                </p>

                {/* Checklist */}
                <div className="mb-10" style={{ display: 'inline-block', textAlign: 'left' }}>
                  <div className="space-y-3.5">
                    {checkItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: RED_DIM, border: `1px solid ${RED_BORDER}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Check size={10} style={{ color: RED }} strokeWidth={3} />
                        </div>
                        <span style={{ color: TEXT_MUTED, fontSize: 'clamp(13px, 1.2vw, 15px)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                  <a
                    href="https://pay.hotmart.com/K99381988U?checkoutMode=10&bid=1778363157034"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 10,
                      backgroundColor: RED, color: 'white',
                      fontWeight: 700, fontSize: 'clamp(14px, 1.2vw, 16px)',
                      padding: '16px 32px', borderRadius: 12,
                      textDecoration: 'none',
                      boxShadow: '0 0 50px rgba(220,38,38,0.40)',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 60px rgba(220,38,38,0.55)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(220,38,38,0.40)';
                    }}
                  >
                    Quiero el Ebook Ahora
                    <ArrowRight size={16} />
                  </a>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 38, color: 'white', lineHeight: 1 }}>$10</span>
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: TEXT_DIM, textDecoration: 'line-through' }}>$37</span>
                    </div>
                    <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: TEXT_DIM, letterSpacing: '0.1em', marginTop: 3 }}>
                      pago único · acceso de por vida
                    </p>
                  </div>
                </div>

                {/* Urgency note */}
                <p style={{ color: TEXT_DIM, fontSize: 12, fontFamily: '"JetBrains Mono", monospace', marginTop: 14, letterSpacing: '0.05em' }}>
                  ⚡ Precio de lanzamiento — puede subir sin previo aviso
                </p>
              </div>

              {/* Ebook image */}
              <div className="mt-16 w-full flex justify-center">
                <img
                  src="/page-ebook-image/ebook.png"
                  alt="Ebook de Prompts de IA Generativa — Alpacka.ai"
                  style={{
                    maxWidth: 480,
                    width: '100%',
                    borderRadius: 16,
                    boxShadow: '0 40px 80px rgba(0,0,0,0.85), 0 0 100px rgba(220,38,38,0.18)',
                    display: 'block',
                  }}
                />
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            AI MARQUEE
        ══════════════════════════════════════════ */}
        <section style={{ borderBottom: `1px solid ${BORDER}`, paddingTop: 24, paddingBottom: 24, overflow: 'hidden', backgroundColor: SURFACE }}>
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: TEXT_DIM,
            textAlign: 'center',
            marginBottom: 18,
          }}>
            compatible con todas las ias generativas
          </p>
          <AIMarquee />
        </section>

        {/* ══════════════════════════════════════════
            PROBLEMA (pain section)
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: SURFACE2, borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-4xl mx-auto px-6 sm:px-10 py-20 md:py-24 text-center">
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: RED, marginBottom: 14 }}>
              el problema que nadie quiere admitir
            </p>
            <h2 style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
              color: 'white',
              lineHeight: 1.15,
              marginBottom: 20,
            }}>
              El 90% de los usuarios de IA generativa{' '}
              <span style={{ color: RED }}>sigue obteniendo resultados mediocres.</span>
            </h2>
            <p style={{ color: TEXT_MUTED, fontSize: 'clamp(15px, 1.5vw, 18px)', lineHeight: 1.8, maxWidth: 620, margin: '0 auto 20px' }}>
              La razón siempre es la misma: prompts sin estructura. Le das una instrucción vaga, la IA te devuelve una respuesta genérica, reescribes tres veces y sigues sin tener lo que necesitas.
            </p>
            <p style={{ color: TEXT_MUTED, fontSize: 'clamp(15px, 1.5vw, 18px)', lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
              <strong style={{ color: 'rgba(255,255,255,0.8)' }}>No es la IA. Son los prompts.</strong> Con la estructura correcta, cualquier IA entrega resultados profesionales en la primera respuesta. Siempre.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            ¿QUÉ ENCONTRARÁS?
        ══════════════════════════════════════════ */}
        <section style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-28">

            <div className="text-center mb-16">
              <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: RED, marginBottom: 14 }}>
                el contenido
              </p>
              <h2 style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                color: 'white',
                marginBottom: 14,
              }}>
                ¿Qué Encontrarás en el{' '}
                <span style={{ color: RED }}>Libro?</span>
              </h2>
              <p style={{ color: TEXT_MUTED, fontSize: 'clamp(14px, 1.3vw, 17px)', maxWidth: 520, margin: '0 auto' }}>
                8 categorías. +200 prompts probados. Listos para aplicar hoy en tu trabajo, negocio o proyecto personal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contentItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: SURFACE,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 14,
                    padding: '22px 22px',
                    transition: 'border-color 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = RED_BORDER;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = BORDER;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: RED, opacity: 0.7 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div style={{ flex: 1, height: 1, backgroundColor: RED_BORDER }} />
                  </div>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(13px, 1.1vw, 15px)', marginBottom: 8 }}>{item.title}</p>
                  <p style={{ color: TEXT_DIM, fontSize: 'clamp(12px, 1vw, 13px)', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            ¿POR QUÉ ESTE LIBRO?
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: SURFACE2, borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-28">

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 items-center">

              <div>
                <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: RED, marginBottom: 14 }}>
                  la diferencia
                </p>
                <h2 style={{
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  color: 'white',
                  marginBottom: 18,
                  lineHeight: 1.15,
                }}>
                  ¿Por Qué Este{' '}
                  <span style={{ color: RED }}>Libro?</span>
                </h2>
                <p style={{ color: TEXT_MUTED, fontSize: 'clamp(15px, 1.4vw, 17px)', lineHeight: 1.8, maxWidth: 440, marginBottom: 20 }}>
                  Hay miles de prompts gratis en internet. Los puedes buscar en Google ahora mismo. El problema es que son genéricos, sin contexto y generan resultados mediocres.
                </p>
                <p style={{ color: TEXT_MUTED, fontSize: 'clamp(15px, 1.4vw, 17px)', lineHeight: 1.8, maxWidth: 440 }}>
                  Este libro es diferente. Cada prompt tiene{' '}
                  <strong style={{ color: 'rgba(255,255,255,0.8)' }}>rol, contexto, formato y restricciones definidas.</strong>{' '}
                  Esa es la diferencia entre una respuesta genérica y una respuesta que realmente usas.
                </p>
              </div>

              <div className="space-y-4">
                {whyItems.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: SURFACE,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 14,
                      padding: '20px 22px',
                      display: 'flex',
                      gap: 16,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      width: 42, height: 42,
                      borderRadius: 10,
                      background: RED_DIM,
                      border: `1px solid ${RED_BORDER}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(14px, 1.2vw, 16px)', marginBottom: 5 }}>{item.title}</p>
                      <p style={{ color: TEXT_MUTED, fontSize: 'clamp(13px, 1.1vw, 14px)', lineHeight: 1.7 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            BONUS EXCLUSIVOS
        ══════════════════════════════════════════ */}
        <section style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-28">

            <div className="text-center mb-16">
              <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: RED, marginBottom: 14 }}>
                incluido sin costo extra — valor $37
              </p>
              <h2 style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                color: 'white',
                marginBottom: 14,
              }}>
                Bonus{' '}
                <span style={{ color: RED }}>Exclusivos</span>
              </h2>
              <p style={{ color: TEXT_MUTED, fontSize: 'clamp(14px, 1.3vw, 17px)', maxWidth: 480, margin: '0 auto' }}>
                Todo esto viene incluido con tu compra. Sin costos adicionales. Sin suscripciones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {bonusItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: SURFACE,
                    border: `1px solid ${RED_BORDER}`,
                    borderRadius: 16,
                    padding: '30px 26px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, transparent, ${RED}, transparent)`,
                  }} />
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Gift size={18} style={{ color: RED }} />
                      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: RED, fontWeight: 700, letterSpacing: '0.1em' }}>
                        BONUS {item.num}
                      </span>
                    </div>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: TEXT_DIM }}>{item.value}</span>
                  </div>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(14px, 1.2vw, 16px)', marginBottom: 10, lineHeight: 1.3 }}>{item.title}</p>
                  <p style={{ color: TEXT_MUTED, fontSize: 'clamp(13px, 1.1vw, 14px)', lineHeight: 1.75 }}>{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            GARANTÍA
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: SURFACE2, borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-3xl mx-auto px-6 sm:px-10 py-20 md:py-28 text-center">

            <div style={{
              width: 72, height: 72,
              borderRadius: '50%',
              background: RED_DIM,
              border: `1px solid ${RED_BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 22px',
            }}>
              <Shield size={32} style={{ color: RED }} />
            </div>

            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: RED, marginBottom: 16 }}>
              sin riesgo · garantía total
            </p>

            <h2 style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              color: 'white',
              marginBottom: 20,
            }}>
              Garantía de Satisfacción{' '}
              <span style={{ color: RED }}>100%</span>
            </h2>

            <p style={{ color: TEXT_MUTED, fontSize: 'clamp(15px, 1.5vw, 18px)', lineHeight: 1.85, marginBottom: 16, maxWidth: 560, margin: '0 auto 16px' }}>
              Tienes <strong style={{ color: 'white' }}>30 días completos</strong> para explorar la plantilla, aplicar los prompts y ver los resultados. Si por cualquier razón sientes que no valió la pena, te devolvemos el{' '}
              <strong style={{ color: 'white' }}>100% de tu dinero</strong>. Sin formularios. Sin preguntas.
            </p>
            <p style={{ color: TEXT_DIM, fontSize: 'clamp(13px, 1.1vw, 15px)', lineHeight: 1.75, maxWidth: 500, margin: '0 auto' }}>
              La garantía no es letra pequeña — es nuestra manera de decirte que estamos completamente seguros de que este libro va a cambiar cómo usas la IA para siempre.
            </p>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            PREGUNTAS FRECUENTES
        ══════════════════════════════════════════ */}
        <section style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-3xl mx-auto px-6 sm:px-10 py-20 md:py-28">

            <div className="text-center mb-14">
              <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: RED, marginBottom: 14 }}>
                resolvemos tus dudas
              </p>
              <h2 style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                color: 'white',
              }}>
                Preguntas{' '}
                <span style={{ color: RED }}>Frecuentes</span>
              </h2>
            </div>

            <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
              {faqs.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            CTA FINAL
        ══════════════════════════════════════════ */}
        <section id="comprar" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 70% 80% at 50% 100%, rgba(180,10,10,0.20) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          <div className="relative max-w-4xl mx-auto px-6 sm:px-10 py-24 md:py-36 text-center">

            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: RED, marginBottom: 18 }}>
              es hora de dominar la ia generativa
            </p>

            <h2 style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              color: 'white',
              lineHeight: 1.1,
              marginBottom: 18,
            }}>
              Cada semana sin los prompts correctos<br />
              son horas que{' '}
              <span style={{ color: RED }}>no recuperas.</span>
            </h2>

            <p style={{ color: TEXT_MUTED, fontSize: 'clamp(15px, 1.5vw, 18px)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 48px' }}>
              Por $10 —menos de lo que cuesta un café— tienes acceso inmediato a +200 prompts, 3 bonuses exclusivos y actualizaciones de por vida. Sin suscripciones. Sin letra pequeña.
            </p>

            {/* Pricing card */}
            <div style={{
              backgroundColor: SURFACE,
              border: `1px solid ${RED_BORDER}`,
              borderRadius: 20,
              padding: '40px 36px',
              maxWidth: 420,
              margin: '0 auto 36px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${RED}, transparent)`,
              }} />

              <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: TEXT_DIM, marginBottom: 20 }}>
                precio de lanzamiento
              </p>

              <div className="flex items-baseline justify-center gap-4 mb-8">
                <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 64, color: 'white', lineHeight: 1 }}>$10</span>
                <div>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: TEXT_DIM, textDecoration: 'line-through' }}>$37</p>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: TEXT_DIM }}>pago único</p>
                </div>
              </div>

              <div className="space-y-3.5 mb-10 text-left">
                {[
                  '+200 prompts listos para usar',
                  '8 categorías completas',
                  '3 bonuses exclusivos (valor $37)',
                  'Actualizaciones de por vida',
                  'Garantía total de 30 días',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: RED_DIM, border: `1px solid ${RED_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={9} style={{ color: RED }} strokeWidth={3} />
                    </div>
                    <span style={{ color: TEXT_MUTED, fontSize: 'clamp(13px, 1.2vw, 15px)' }}>{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://pay.hotmart.com/K99381988U?checkoutMode=10&bid=1778363157034"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%',
                  backgroundColor: RED,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 'clamp(15px, 1.3vw, 17px)',
                  padding: '17px 24px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 0 50px rgba(220,38,38,0.40)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 60px rgba(220,38,38,0.55)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(220,38,38,0.40)';
                }}
              >
                Quiero el Ebook Ahora — $10
                <ArrowRight size={17} />
              </a>

              <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: TEXT_DIM, marginTop: 14, letterSpacing: '0.05em' }}>
                🔒 Pago seguro · Acceso inmediato · Garantía 30 días
              </p>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { icon: <Shield size={14} style={{ color: RED }} />, label: 'Garantía 30 días' },
                { icon: <Clock size={14} style={{ color: RED }} />, label: 'Acceso inmediato' },
                { icon: <Star size={14} style={{ color: RED }} />, label: 'Pago único' },
                { icon: <TrendingUp size={14} style={{ color: RED }} />, label: 'Actualizaciones incluidas' },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  {t.icon}
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: TEXT_DIM, letterSpacing: '0.08em' }}>{t.label}</span>
                </div>
              ))}
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default Ebook;
