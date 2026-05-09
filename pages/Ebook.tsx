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
    '+200 prompts universales listos para copiar y pegar',
    'Funciona con ChatGPT, Gemini, Claude, Copilot y más',
    'Acceso instantáneo a biblioteca privada en Notion',
    'Actualizaciones de por vida — sin costo adicional',
    'Garantía de satisfacción de 30 días',
  ];

  const contentItems = [
    { title: '200+ Prompts Optimizados', desc: 'Prompts probados para obtener resultados inmediatos y de alta calidad.' },
    { title: 'Productividad Total', desc: 'Optimiza tu flujo de trabajo tanto en el ámbito personal como profesional.' },
    { title: 'Contenido y Copywriting', desc: 'Crea textos persuasivos y contenido creativo en segundos.' },
    { title: 'Marketing y Ventas', desc: 'Estrategias y copys enfocados en la conversión y el crecimiento de tu negocio.' },
    { title: 'Comunicación Avanzada', desc: 'Domina técnicas para comunicarte con ChatGPT, Gemini, Claude y cualquier modelo como un experto.' },
    { title: 'Implementación Real', desc: 'Ejemplos prácticos de cómo aplicar cada prompt en casos de uso reales, listos para ejecutar hoy.' },
    { title: 'Plantillas y Formularios', desc: 'Estructuras prediseñadas para simplemente copiar, pegar y obtener resultados profesionales al instante.' },
    { title: 'Guía de Buenas Prácticas', desc: 'Principios y técnicas de prompt engineering para sacarle el máximo a cualquier IA, siempre.' },
    { title: 'Actualizaciones de por Vida', desc: 'Acceso permanente a nuevos prompts y mejoras sin costo adicional.' },
  ];

  const whyItems = [
    {
      icon: <Target size={22} style={{ color: RED }} />,
      title: 'Prompts que funcionan en cualquier IA',
      desc: 'Diseñados bajo principios de ingeniería del lenguaje que funcionan en ChatGPT, Gemini, Claude, Copilot y cualquier modelo que salga en el futuro. 100% universal.',
    },
    {
      icon: <Zap size={22} style={{ color: RED }} />,
      title: 'Multiplica tu productividad desde el día 1',
      desc: 'Un solo recurso para optimizar tu flujo de trabajo personal y profesional. Lo que antes tomaba 2 horas ahora toma 10 minutos.',
    },
    {
      icon: <BookOpen size={22} style={{ color: RED }} />,
      title: '+200 prompts organizados y listos para usar',
      desc: 'No son prompts genéricos. Son estructuras organizadas por caso de uso real, listas para copiar, pegar y ejecutar en segundos en cualquier IA.',
    },
    {
      icon: <TrendingUp size={22} style={{ color: RED }} />,
      title: 'Acceso de por vida con actualizaciones',
      desc: 'A medida que salgan nuevas IAs, añadimos prompts adaptados sin costo adicional para ti. Una sola compra, valor permanente.',
    },
  ];

  const bonusItems = [
    {
      num: '01',
      title: '50 Prompts Exclusivos para Nichos Específicos',
      desc: '50 prompts adicionales para nichos específicos, compatibles con ChatGPT, Gemini, Claude y Copilot. Directo al grano para tu industria o sector.',
      value: 'Valor: $27',
    },
    {
      num: '02',
      title: 'Guía de Prompt Engineering Universal',
      desc: 'Resumen rápido con los mejores prompts para cada IA: ChatGPT, Gemini, Claude y más. Siempre a mano cuando lo necesites.',
      value: 'Valor: $27',
    },
    {
      num: '03',
      title: 'Acceso de Por Vida + Actualizaciones Permanentes',
      desc: 'A medida que aparezcan nuevos modelos y plataformas, añadiremos prompts optimizados sin costo adicional para ti. Una compra, valor eterno.',
      value: 'Incluido',
    },
  ];

  const faqs = [
    {
      q: '¿Cómo recibo el acceso después de la compra?',
      a: 'Inmediatamente después de completar tu pago, recibirás un email con el enlace de acceso directo a nuestra biblioteca privada en Notion. La entrega es instantánea.',
    },
    {
      q: '¿Funciona con ChatGPT, Gemini, Claude y otras IAs?',
      a: '¡Sí! Los prompts están diseñados bajo principios de ingeniería del lenguaje que funcionan en cualquier IA generativa: ChatGPT (GPT-4/5), Gemini, Claude, Copilot y cualquier modelo que salga en el futuro. El contenido es 100% universal.',
    },
    {
      q: '¿Qué formato tiene el eBook?',
      a: 'Más que un simple PDF, recibirás acceso a una base de datos dinámica en Notion. Esto te permite copiar y pegar los prompts fácilmente, filtrarlos por categorías, por IA y acceder a actualizaciones en tiempo real.',
    },
    {
      q: '¿Recibiré actualizaciones cuando salgan nuevas IAs?',
      a: 'Sí, tendrás acceso de por vida a la página de Notion. A medida que aparezcan nuevos modelos y plataformas, añadiremos prompts optimizados sin costo adicional para ti.',
    },
    {
      q: '¿Cómo funciona la garantía?',
      a: 'Si no estás satisfecho con la biblioteca de prompts por cualquier razón, simplemente envíanos un email dentro de los 30 días posteriores a la compra y te reembolsaremos el 100% de tu dinero. Sin preguntas.',
    },
    {
      q: '¿Necesito experiencia previa con IAs?',
      a: 'No, la guía está diseñada tanto para principiantes como para usuarios avanzados. Incluimos instrucciones claras de cómo usar cada prompt en distintas IAs para obtener los mejores resultados.',
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
                    El recurso #1 para dominar el prompting
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
                  El <span style={{ color: RED }}>Único eBook</span> de Prompts<br />
                  <span>que realmente necesitas</span>
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
                  ⏰ Oferta por tiempo limitado — el precio subirá pronto
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
                  <span style={{ color: RED }}>Ebook?</span>
                </h2>
                <p style={{ color: TEXT_MUTED, fontSize: 'clamp(15px, 1.4vw, 17px)', lineHeight: 1.8, maxWidth: 440, marginBottom: 20 }}>
                  No es solo una lista de prompts. Es un sistema completo para dominar cualquier IA.
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
                incluido sin costo extra — valorado en $97
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
              <p style={{ color: TEXT_MUTED, fontSize: 'clamp(14px, 1.3vw, 17px)', maxWidth: 520, margin: '0 auto' }}>
                Además del eBook, recibirás estos bonos gratis — listos para usar en cualquier IA.
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
              Si el eBook no supera tus expectativas, te devolvemos el{' '}
              <strong style={{ color: 'white' }}>100% de tu dinero</strong>. Sin preguntas, sin complicaciones. Tu satisfacción es nuestra prioridad.
            </p>
            <p style={{ color: TEXT_DIM, fontSize: 'clamp(13px, 1.1vw, 15px)', lineHeight: 1.75, maxWidth: 500, margin: '0 auto' }}>
              Tienes <strong style={{ color: 'rgba(255,255,255,0.5)' }}>30 días completos</strong> para explorar la biblioteca, aplicar los prompts y ver los resultados. Sin riesgo, sin letra pequeña.
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
              Domina ChatGPT, Gemini, Claude<br />
              y cualquier IA{' '}
              <span style={{ color: RED }}>desde hoy.</span>
            </h2>

            <p style={{ color: TEXT_MUTED, fontSize: 'clamp(15px, 1.5vw, 18px)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 48px' }}>
              Por $10 tienes acceso inmediato a +200 prompts universales, bonuses exclusivos valorados en $97 y actualizaciones de por vida. Sin suscripciones. Sin letra pequeña.
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
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: TEXT_DIM, textDecoration: 'line-through' }}>$97</p>
                  <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: TEXT_DIM }}>pago único</p>
                </div>
              </div>

              <div className="space-y-3.5 mb-10 text-left">
                {[
                  '+200 prompts universales listos para usar',
                  'Compatible con ChatGPT, Gemini, Claude y más',
                  'Biblioteca privada en Notion',
                  '3 bonuses exclusivos (valorados en $97)',
                  'Actualizaciones de por vida sin costo',
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
