import React, { useState } from 'react';
import { Check, Shield, ChevronDown, ChevronUp, Zap, Target, Star, ArrowRight, Gift, Clock, TrendingUp, BookOpen, Sparkles, Database, Layers, Quote } from 'lucide-react';
import AlpacaIcon from '../components/AlpacaIcon';

/* ─── Palette (Notion-inspired) ─── */
const BG       = '#ffffff';
const BG_WARM  = '#f7f6f3';
const BG_CARD  = '#ffffff';
const TEXT     = '#1a1a1a';
const TEXT_MED = '#787774';
const TEXT_DIM = '#a8a5a1';
const BORDER   = '#e4e4e1';

/* ─── Notion-style FAQ ─── */
const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between py-5 px-6" style={{ userSelect: 'none' }}>
        <span style={{ color: TEXT, fontSize: 15, fontWeight: 500, lineHeight: 1.5, paddingRight: 24 }}>{q}</span>
        {open
          ? <ChevronUp size={16} style={{ color: TEXT_MED, flexShrink: 0 }} />
          : <ChevronDown size={16} style={{ color: TEXT_DIM, flexShrink: 0 }} />
        }
      </div>
      {open && (
        <div className="px-6 pb-5">
          <p style={{ color: TEXT_MED, fontSize: 14, lineHeight: 1.8 }}>{a}</p>
        </div>
      )}
    </div>
  );
};

/* ─── AI logos marquee ─── */
const aiTools = [
  { name: 'ChatGPT', dot: '#10a37f' },
  { name: 'Claude', dot: '#D4A853' },
  { name: 'Gemini', dot: '#4285F4' },
  { name: 'DeepSeek', dot: '#3B82F6' },
  { name: 'Perplexity', dot: '#20B2AA' },
  { name: 'Grok', dot: '#555555' },
  { name: 'Mistral', dot: '#FF6B35' },
  { name: 'Copilot', dot: '#0078D4' },
  { name: 'Meta AI', dot: '#0668E1' },
  { name: 'LLaMA 3', dot: '#9B59B6' },
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
        .eb-marquee {
          animation: marqueeScroll 34s linear infinite;
          display: flex;
          width: max-content;
          gap: 10px;
          align-items: center;
        }
        .eb-marquee:hover { animation-play-state: paused; }
      `}</style>
      <div className="eb-marquee" style={{ padding: '4px 0' }}>
        {doubled.map((tool, i) => (
          <div
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              backgroundColor: BG_CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 100,
              padding: '7px 16px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: tool.dot, flexShrink: 0 }} />
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: TEXT_MED, fontWeight: 500 }}>
              {tool.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Floating gradient blob ─── */
const Blob: React.FC<{ color: string; size: number; top: string; left: string; opacity?: number }> = ({ color, size, top, left, opacity = 0.55 }) => (
  <div style={{
    position: 'absolute',
    top,
    left,
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    filter: `blur(${size * 0.55}px)`,
    opacity,
    pointerEvents: 'none',
  }} />
);

/* ─── Feature card ─── */
const FeatureCard: React.FC<{ icon: React.ReactNode; bg: string; title: string; desc: string; tag: string; tagColor: string }> = ({
  icon, bg, title, desc, tag, tagColor
}) => (
  <div style={{
    backgroundColor: bg,
    borderRadius: 20,
    padding: '32px 28px',
    position: 'relative',
    overflow: 'hidden',
    border: `1px solid rgba(0,0,0,0.05)`,
  }}>
    <div style={{
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {icon}
    </div>
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      backgroundColor: 'rgba(255,255,255,0.65)',
      borderRadius: 100,
      padding: '3px 10px',
      marginBottom: 12,
    }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: tagColor }} />
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: tagColor }}>{tag}</span>
    </div>
    <p style={{ color: TEXT, fontWeight: 700, fontSize: 16, marginBottom: 8, lineHeight: 1.3 }}>{title}</p>
    <p style={{ color: TEXT_MED, fontSize: 13, lineHeight: 1.7 }}>{desc}</p>
  </div>
);

/* ─── Main ─── */
const Ebook: React.FC = () => {

  const faqs = [
    {
      q: '¿Cuándo recibo el acceso?',
      a: 'En el momento en que pagas. Te llega un email con el enlace directo a Notion, generalmente en menos de 2 minutos. No hay proceso de revisión ni tiempos de espera.',
    },
    {
      q: '¿Funciona con la IA que yo uso?',
      a: 'Sí. Los prompts están diseñados bajo principios de ingeniería del lenguaje que funcionan en cualquier modelo generativo: ChatGPT, Gemini, Claude, Copilot, Grok, lo que sea que uses hoy o lo que salga mañana.',
    },
    {
      q: '¿Es un PDF o qué formato tiene exactamente?',
      a: 'Es un espacio en Notion, no un PDF. Puedes duplicarlo en tu propia cuenta de Notion, filtrar por categoría, buscar por palabra clave y copiar cada prompt con un clic. Se actualiza solo cuando añado contenido nuevo.',
    },
    {
      q: '¿Las actualizaciones tienen algún costo extra?',
      a: 'No. Cada vez que añado prompts nuevos los tienes automáticamente. Es parte de lo que pagas hoy. No hay suscripción oculta ni "versión premium" más adelante.',
    },
    {
      q: '¿Cómo funciona la garantía?',
      a: 'Tienes 7 días. Si lo abres, lo usas y sientes que no valió la pena, me escribes y te reembolso el 100%. Sin formularios raros ni emails de retención. Solo dime que no funcionó para ti.',
    },
    {
      q: '¿Necesito saber mucho de IAs para aprovecharlo?',
      a: 'No. Si ya usas ChatGPT aunque sea de vez en cuando, puedes usar esto. El formato es: copias el prompt, lo pegas en tu IA, completas los campos entre corchetes y ya.',
    },
  ];

  const buyUrl = 'https://pay.hotmart.com/K99381988U?checkoutMode=10&bid=1778363157034';

  const BtnPrimary: React.FC<{ children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }> = ({ children, size = 'md' }) => {
    const padding = size === 'lg' ? '16px 32px' : size === 'sm' ? '10px 20px' : '13px 26px';
    const fontSize = size === 'lg' ? 16 : size === 'sm' ? 13 : 14;
    return (
      <a
        href={buyUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#000',
          color: '#fff',
          fontWeight: 600,
          fontSize,
          padding,
          borderRadius: 10,
          textDecoration: 'none',
          transition: 'transform 0.15s, background 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.backgroundColor = '#222'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.backgroundColor = '#000'; }}
      >
        {children}
      </a>
    );
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: '"DM Sans", sans-serif', color: TEXT }}>

      {/* ── Header ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${BORDER}`,
        height: 56,
        display: 'flex', alignItems: 'center',
      }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlpacaIcon className="w-4 h-4" />
            <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontStyle: 'italic', fontWeight: 300, fontSize: 17, color: '#1a1a1a' }}>
              alpacka<span style={{ fontStyle: 'normal', fontFamily: '"DM Sans",sans-serif', fontWeight: 700, fontSize: 12, color: TEXT_DIM }}>.ai</span>
            </span>
          </div>

          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              backgroundColor: '#000', color: '#fff',
              fontWeight: 600, fontSize: 13,
              padding: '8px 18px', borderRadius: 9,
              textDecoration: 'none',
              transition: 'transform 0.15s, background 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#222'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#000'; }}
          >
            Comprar — $10
            <ArrowRight size={12} />
          </a>
        </div>
      </header>

      <div style={{ paddingTop: 56 }}>

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section style={{ position: 'relative', overflow: 'hidden', backgroundColor: BG }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <Blob color="radial-gradient(circle, #fbc7d4, #9796f0)" size={420} top="-80px" left="-60px" opacity={0.35} />
            <Blob color="radial-gradient(circle, #a8edea, #fed6e3)" size={340} top="60px" left="65%" opacity={0.30} />
            <Blob color="radial-gradient(circle, #ffecd2, #fcb69f)" size={280} top="40%" left="30%" opacity={0.22} />
          </div>

          <div className="relative max-w-5xl mx-auto px-6 sm:px-10 pt-20 pb-0 md:pt-28 text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-7" style={{
              backgroundColor: 'rgba(255,255,255,0.8)',
              border: `1px solid ${BORDER}`,
              borderRadius: 100,
              padding: '6px 14px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <Sparkles size={12} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_MED, letterSpacing: '0.02em' }}>
                +500 personas ya tienen acceso · precio de lanzamiento
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
              lineHeight: 1.1,
              color: TEXT,
              marginBottom: 22,
              letterSpacing: '-0.02em',
            }}>
              Tus respuestas con ChatGPT son mediocres<br />
              <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                porque tus prompts también lo son.
              </span>
            </h1>

            {/* Subheadline */}
            <p style={{ color: TEXT_MED, fontSize: 'clamp(15px, 1.6vw, 18px)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto 36px' }}>
              La Biblioteca de Prompts incluye más de 200 prompts listos para copiar y pegar que te ayudan a escribir mejor, aprender más rápido, crear contenido, resolver problemas y obtener respuestas mucho más útiles de ChatGPT en segundos.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  backgroundColor: '#000', color: '#fff',
                  fontWeight: 700, fontSize: 16,
                  padding: '16px 36px', borderRadius: 12,
                  textDecoration: 'none',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                  transition: 'transform 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.backgroundColor = '#222'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.backgroundColor = '#000'; }}
              >
                Quiero acceso inmediato — $10
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-12">
              {[
                '✅ Acceso inmediato',
                '✅ Actualizaciones futuras incluidas',
                '✅ Garantía de 7 días',
              ].map((item, i) => (
                <span key={i} style={{ fontSize: 13, color: TEXT_MED }}>{item}</span>
              ))}
            </div>

            {/* Product mockup */}
            <div style={{
              position: 'relative',
              maxWidth: 780,
              margin: '0 auto',
              borderRadius: '20px 20px 0 0',
              overflow: 'hidden',
              boxShadow: '0 -4px 0 #e4e4e1, 0 20px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
            }}>
              <div style={{ backgroundColor: '#ffffff', padding: '0' }}>
                {/* Window bar */}
                <div style={{
                  backgroundColor: '#f7f6f3',
                  borderBottom: `1px solid ${BORDER}`,
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff6b6b' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffd93d' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#6bcb77' }} />
                  </div>
                  <div style={{
                    flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 6,
                    height: 22, maxWidth: 320, margin: '0 auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 10, color: TEXT_DIM }}>alpacka.ai · Biblioteca de Prompts</span>
                  </div>
                </div>

                {/* Notion sidebar + content */}
                <div style={{ display: 'flex', height: 360 }}>
                  {/* Sidebar */}
                  <div style={{ width: 200, backgroundColor: '#f7f6f3', borderRight: `1px solid ${BORDER}`, padding: '16px 12px', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Biblioteca</div>
                    {[
                      { emoji: '✍️', label: 'Creación contenido', count: 45 },
                      { emoji: '⚡', label: 'Productividad', count: 38 },
                      { emoji: '📚', label: 'Aprendizaje', count: 32 },
                      { emoji: '💼', label: 'Negocios', count: 35 },
                      { emoji: '📧', label: 'Escritura', count: 28 },
                      { emoji: '🎨', label: 'Creatividad', count: 27 },
                      { emoji: '🤖', label: 'Técnicos', count: 18 },
                      { emoji: '🌐', label: 'SEO & Contenido', count: 16 },
                    ].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 8px',
                          borderRadius: 6,
                          marginBottom: 2,
                          backgroundColor: i === 0 ? 'rgba(0,0,0,0.05)' : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12 }}>{item.emoji}</span>
                          <span style={{ fontSize: 12, color: i === 0 ? TEXT : TEXT_MED }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: 10, color: TEXT_DIM, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4, padding: '1px 5px' }}>{item.count}</span>
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div style={{ flex: 1, padding: '20px 24px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <span style={{ fontSize: 18 }}>✍️</span>
                      <span style={{ fontWeight: 700, fontSize: 18, color: TEXT }}>Creación de Contenido</span>
                      <span style={{ fontSize: 11, color: TEXT_DIM, backgroundColor: '#f0f0ee', borderRadius: 4, padding: '2px 8px', marginLeft: 4 }}>en crecimiento</span>
                    </div>

                    {/* Table header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 80px',
                      gap: 8,
                      padding: '6px 10px',
                      backgroundColor: '#f7f6f3',
                      borderRadius: '8px 8px 0 0',
                      borderBottom: `1px solid ${BORDER}`,
                    }}>
                      {['Prompt', 'IA', 'Copiar'].map((h, i) => (
                        <span key={i} style={{ fontSize: 11, fontWeight: 600, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                      ))}
                    </div>

                    {/* Rows */}
                    {[
                      { title: 'Estrategia de contenido 30 días con calendario y KPIs', ai: 'Universal', color: '#10a37f' },
                      { title: 'Guion para reel de 60 segundos que engancha desde el primer segundo', ai: 'ChatGPT', color: '#10a37f' },
                      { title: 'Post carrusel con historia, datos y CTA integrado', ai: 'Claude', color: '#D4A853' },
                      { title: 'Ideas de contenido para 30 días en un nicho específico', ai: 'Gemini', color: '#4285F4' },
                      { title: 'Análisis de competencia y oportunidades poco explotadas', ai: 'Universal', color: '#10a37f' },
                    ].map((row, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 100px 80px',
                          gap: 8,
                          padding: '9px 10px',
                          borderBottom: `1px solid ${BORDER}`,
                          alignItems: 'center',
                          backgroundColor: i % 2 === 0 ? BG : '#fafaf8',
                        }}
                      >
                        <span style={{ fontSize: 13, color: TEXT }}>{row.title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: row.color }} />
                          <span style={{ fontSize: 11, color: TEXT_MED }}>{row.ai}</span>
                        </div>
                        <div style={{
                          fontSize: 11, fontWeight: 600, color: '#667eea',
                          backgroundColor: '#f0f0ff', borderRadius: 5,
                          padding: '3px 8px', textAlign: 'center', cursor: 'pointer',
                        }}>
                          Copiar ⌘
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            COMPATIBLE CON
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: BG_WARM, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, paddingTop: 20, paddingBottom: 20, overflow: 'hidden' }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: TEXT_DIM,
            textAlign: 'center',
            marginBottom: 16,
            fontWeight: 500,
          }}>
            compatible con todas las IAs que ya usas
          </p>
          <AIMarquee />
        </section>

        {/* ══════════════════════════════════════════
            DOLOR
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: BG }}>
          <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 md:py-28">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  backgroundColor: '#fff3f3', border: '1px solid #fecaca',
                  borderRadius: 100, padding: '4px 12px', marginBottom: 20,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>El problema</span>
                </div>

                <h2 style={{
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                  color: TEXT,
                  lineHeight: 1.15,
                  marginBottom: 18,
                  letterSpacing: '-0.02em',
                }}>
                  Si ChatGPT te está decepcionando, probablemente no es culpa de la IA.
                </h2>

                <p style={{ color: TEXT_MED, fontSize: 16, lineHeight: 1.8, marginBottom: 14 }}>
                  La mayoría de las personas le hacen preguntas vagas y reciben respuestas mediocres. Por eso sienten que ChatGPT:
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    'Da respuestas genéricas',
                    'No entiende exactamente lo que necesitan',
                    'Produce contenido aburrido',
                    'Pierde detalles importantes',
                    'Obliga a repetir instrucciones una y otra vez',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        backgroundColor: '#fee2e2', border: '1px solid #fca5a5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 900 }}>✕</span>
                      </div>
                      <span style={{ fontSize: 15, color: TEXT_MED }}>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14,
                  padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#dcfce7', border: '1px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Check size={10} style={{ color: '#22c55e' }} strokeWidth={3} />
                  </div>
                  <p style={{ fontSize: 14, color: '#166534', lineHeight: 1.6 }}>
                    <strong>La diferencia no está en la herramienta.</strong> Está en cómo le hablas.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { prompt: '"escribe un email de ventas"', result: 'Texto genérico y corporativo que nadie va a leer.' },
                  { prompt: '"dame una estrategia de marketing"', result: 'Una lista de 5 puntos obvios que ya conocías.' },
                  { prompt: '"ayúdame con mis redes sociales"', result: '3 reescrituras después, sigues sin el contenido.' },
                ].map((item, i) => (
                  <div key={i} style={{ backgroundColor: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '12px 16px', backgroundColor: BG_WARM, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: TEXT_DIM, flexShrink: 0, marginTop: 2 }}>Prompt</span>
                      <p style={{ fontFamily: 'monospace', fontSize: 12, color: TEXT, lineHeight: 1.4 }}>{item.prompt}</p>
                    </div>
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 8, color: '#ef4444', fontWeight: 900 }}>✕</span>
                      </div>
                      <p style={{ fontSize: 13, color: TEXT_MED, lineHeight: 1.5 }}>{item.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            DEMOSTRACIÓN — antes vs después
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: BG_WARM, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 md:py-28">

            <div className="text-center mb-14">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                backgroundColor: '#f0f0ff', border: '1px solid #c7d2fe',
                borderRadius: 100, padding: '4px 12px', marginBottom: 20,
              }}>
                <Sparkles size={11} style={{ color: '#6366f1' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>La demostración</span>
              </div>

              <h2 style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                color: TEXT,
                letterSpacing: '-0.02em',
                marginBottom: 14,
              }}>
                El mismo ChatGPT. Resultados completamente diferentes.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Prompt común */}
              <div style={{ backgroundColor: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                <div style={{
                  padding: '14px 20px',
                  backgroundColor: '#fff3f3',
                  borderBottom: '1px solid #fecaca',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Prompt común</span>
                </div>
                <div style={{ padding: '20px 22px' }}>
                  <div style={{
                    backgroundColor: BG_WARM,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: 16,
                  }}>
                    <p style={{ fontFamily: 'monospace', fontSize: 13, color: TEXT, lineHeight: 1.5 }}>
                      "Hazme una estrategia para Instagram."
                    </p>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Resultado:</p>
                  <p style={{ fontSize: 14, color: TEXT_MED, lineHeight: 1.7 }}>
                    Una respuesta genérica que podría servir para cualquiera. Publicar consistentemente. Usar hashtags. Interactuar con tu audiencia.
                  </p>
                </div>
              </div>

              {/* Prompt optimizado */}
              <div style={{ backgroundColor: BG_CARD, border: '1px solid #bbf7d0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(34,197,94,0.08)' }}>
                <div style={{
                  padding: '14px 20px',
                  backgroundColor: '#f0fdf4',
                  borderBottom: '1px solid #bbf7d0',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Prompt optimizado</span>
                </div>
                <div style={{ padding: '20px 22px' }}>
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: 16,
                  }}>
                    <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#166534', lineHeight: 1.6 }}>
                      "Actúa como estratega de crecimiento en Instagram. Analiza mi nicho [nicho], identifica oportunidades poco explotadas y crea un plan de contenido para 30 días enfocado en aumentar seguidores y ventas."
                    </p>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Resultado:</p>
                  <p style={{ fontSize: 14, color: TEXT_MED, lineHeight: 1.7 }}>
                    Una respuesta específica, con calendario, formatos de contenido diferenciados y métricas para cada semana. Algo que puedes usar hoy.
                  </p>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="text-center">
              <p style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                color: TEXT,
                letterSpacing: '-0.01em',
              }}>
                La diferencia no es ChatGPT.{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  La diferencia es el prompt.
                </span>
              </p>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            BENEFICIOS
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: BG }}>
          <div className="max-w-4xl mx-auto px-6 sm:px-10 py-20 md:py-28">

            <div className="text-center mb-14">
              <h2 style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                color: TEXT,
                letterSpacing: '-0.02em',
                marginBottom: 12,
              }}>
                Lo que puedes hacer con esta biblioteca
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { text: 'Crear contenido más rápido', desc: 'Posts, guiones y carruseles en minutos, no horas.' },
                { text: 'Escribir mejores textos', desc: 'Emails, artículos y propuestas que realmente se leen.' },
                { text: 'Aprender temas complejos fácilmente', desc: 'Explicaciones simples, resúmenes y tutorías personalizadas.' },
                { text: 'Organizar proyectos y tareas', desc: 'Planificación, priorización y seguimiento sin fricción.' },
                { text: 'Generar ideas cuando te quedas en blanco', desc: 'Brainstorming estructurado para cualquier situación.' },
                { text: 'Obtener respuestas más precisas', desc: 'Sin vaguedad, sin reescrituras, sin perder el tiempo.' },
                { text: 'Ahorrar horas de prueba y error', desc: 'Los prompts ya están probados. Solo copias y usas.' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    backgroundColor: BG_WARM,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 14,
                    padding: '18px 20px',
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    backgroundColor: '#dcfce7', border: '1px solid #86efac',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                  }}>
                    <Check size={11} style={{ color: '#22c55e' }} strokeWidth={3} />
                  </div>
                  <div>
                    <p style={{ color: TEXT, fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{item.text}</p>
                    <p style={{ color: TEXT_MED, fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            QUÉ RECIBES — 6 categorías
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: BG_WARM, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-28">

            <div className="text-center mb-14">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                backgroundColor: '#f0f0ff', border: '1px solid #c7d2fe',
                borderRadius: 100, padding: '4px 12px', marginBottom: 20,
              }}>
                <Database size={11} style={{ color: '#6366f1' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>el contenido</span>
              </div>

              <h2 style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                color: TEXT,
                letterSpacing: '-0.02em',
                marginBottom: 14,
              }}>
                Dentro encontrarás más de 200 prompts listos para usar
              </h2>
              <p style={{ color: TEXT_MED, fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
                Una base de datos en Notion organizada por categoría. Llegas, buscas lo que necesitas, copias en un clic y ya está.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FeatureCard
                bg="#fff7ed"
                icon={<Target size={22} style={{ color: '#f97316' }} />}
                tag="el más usado"
                tagColor="#f97316"
                title="Creación de Contenido"
                desc="Ideas, guiones, publicaciones, carruseles y estrategias. Para cuando necesitas contenido y no sabes por dónde empezar."
              />
              <FeatureCard
                bg="#fdf4ff"
                icon={<Zap size={22} style={{ color: '#a855f7' }} />}
                tag="el más pedido"
                tagColor="#a855f7"
                title="Productividad"
                desc="Organización, planificación y gestión de tareas. Los lunes que tardabas 2 horas organizándote, ahora son 15 minutos."
              />
              <FeatureCard
                bg="#eff6ff"
                icon={<BookOpen size={22} style={{ color: '#3b82f6' }} />}
                tag="imprescindible"
                tagColor="#3b82f6"
                title="Aprendizaje"
                desc="Explicaciones simples, resúmenes y tutorías personalizadas. Para dominar cualquier tema más rápido."
              />
              <FeatureCard
                bg="#f0fdf4"
                icon={<TrendingUp size={22} style={{ color: '#22c55e' }} />}
                tag="actualizado"
                tagColor="#22c55e"
                title="Negocios"
                desc="Marketing, ventas, investigación y estrategia. Para cuando necesitas resultados esta semana, no el mes que viene."
              />
              <FeatureCard
                bg="#fefce8"
                icon={<Star size={22} style={{ color: '#eab308' }} />}
                tag="el que convierte"
                tagColor="#eab308"
                title="Escritura"
                desc="Correos, artículos, textos persuasivos y más. Sin el inicio genérico. Directo al grano, desde la primera respuesta."
              />
              <FeatureCard
                bg="#faf5ff"
                icon={<Sparkles size={22} style={{ color: '#8b5cf6' }} />}
                tag="favorito"
                tagColor="#8b5cf6"
                title="Creatividad"
                desc="Lluvia de ideas, storytelling y generación de conceptos. Para cuando llevas 20 minutos mirando la pantalla en blanco."
              />
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            POR QUÉ ESTE RECURSO
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: BG }}>
          <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 md:py-28">

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 items-start">

              <div style={{ position: 'sticky', top: 80 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  backgroundColor: '#fefce8', border: '1px solid #fde68a',
                  borderRadius: 100, padding: '4px 12px', marginBottom: 20,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706', letterSpacing: '0.1em', textTransform: 'uppercase' }}>La diferencia</span>
                </div>

                <h2 style={{
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                  color: TEXT,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  marginBottom: 18,
                }}>
                  ¿Qué hace que un prompt funcione de verdad?
                </h2>

                <p style={{ color: TEXT_MED, fontSize: 15, lineHeight: 1.8, marginBottom: 14 }}>
                  La mayoría de prompts que encuentras online son genéricos. Funcionan a medias, en el mejor caso. El problema no es la IA — es que no tiene suficiente contexto para darte algo útil.
                </p>
                <p style={{ color: TEXT_MED, fontSize: 15, lineHeight: 1.8 }}>
                  Cada prompt de esta biblioteca tiene <strong style={{ color: TEXT }}>rol, contexto, objetivo y formato</strong> definidos. La IA recibe instrucciones completas y entrega algo que puedes usar en la primera respuesta.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: <Target size={20} style={{ color: '#6366f1' }} />,
                    bg: '#f0f0ff',
                    border: '#c7d2fe',
                    title: 'Funciona en cualquier IA',
                    desc: 'No está optimizado para un solo modelo. Funciona igual en ChatGPT, Gemini, Claude, Copilot o lo que sea que estés usando hoy, y lo que salga mañana.',
                  },
                  {
                    icon: <Zap size={20} style={{ color: '#f97316' }} />,
                    bg: '#fff7ed',
                    border: '#fed7aa',
                    title: 'El primero ya funciona',
                    desc: 'No necesitas pasar por tres intentos antes de llegar al que sirve. El prompt ya tiene la estructura completa que la IA necesita para entregarte algo real.',
                  },
                  {
                    icon: <Database size={20} style={{ color: '#22c55e' }} />,
                    bg: '#f0fdf4',
                    border: '#bbf7d0',
                    title: 'Organizado en Notion, no en un PDF',
                    desc: 'Filtras por categoría en segundos. No es un archivo donde tienes que hacer Ctrl+F. Es una base de datos que puedes duplicar en tu propia cuenta.',
                  },
                  {
                    icon: <TrendingUp size={20} style={{ color: '#8b5cf6' }} />,
                    bg: '#fdf4ff',
                    border: '#e9d5ff',
                    title: 'Se actualiza con el tiempo',
                    desc: 'Cuando salga un modelo nuevo o un caso de uso que no estaba, lo añado. Sin cobrar otra vez. Es parte del trato desde el día 1.',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: item.bg,
                      border: `1px solid ${item.border}`,
                      borderRadius: 16,
                      padding: '20px 22px',
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ color: TEXT, fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{item.title}</p>
                      <p style={{ color: TEXT_MED, fontSize: 13, lineHeight: 1.7 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            BONUS
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: BG_WARM, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 md:py-28">

            <div className="text-center mb-14">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: 100, padding: '4px 12px', marginBottom: 20,
              }}>
                <Gift size={11} style={{ color: '#22c55e' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>incluido sin costo extra</span>
              </div>

              <h2 style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                color: TEXT,
                letterSpacing: '-0.02em',
                marginBottom: 14,
              }}>
                Lo que viene en los $10.
              </h2>
              <p style={{ color: TEXT_MED, fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
                Sin letra pequeña ni sorpresas. Esto es literalmente todo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  num: '01',
                  emoji: '📚',
                  bg: '#f0f0ff',
                  border: '#c7d2fe',
                  accent: '#6366f1',
                  title: 'Tu biblioteca de prompts en Notion',
                  desc: 'Acceso completo al espacio. Filtros por categoría, búsqueda por caso de uso, y cada prompt listo para copiar en un clic.',
                  value: 'El acceso principal',
                },
                {
                  num: '02',
                  emoji: '🎯',
                  bg: '#fff7ed',
                  border: '#fed7aa',
                  accent: '#f97316',
                  title: '50 Prompts Extra por Nicho',
                  desc: 'Prompts adicionales para casos más específicos: inmobiliaria, e-commerce, salud, legal, educación. Directo al grano.',
                  value: 'Incluido',
                },
                {
                  num: '03',
                  emoji: '♾️',
                  bg: '#f0fdf4',
                  border: '#bbf7d0',
                  accent: '#22c55e',
                  title: 'Actualizaciones de por vida',
                  desc: 'Cada vez que añado prompts nuevos, los tienes. No es una suscripción. No hay "versión 2.0" que tengas que comprar de nuevo.',
                  value: 'Para siempre',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: item.bg,
                    border: `1px solid ${item.border}`,
                    borderRadius: 20,
                    padding: '28px 24px',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 24 }}>{item.emoji}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: item.accent, fontWeight: 700 }}>{item.num}</span>
                    </div>
                    <span style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 500 }}>{item.value}</span>
                  </div>
                  <p style={{ color: TEXT, fontWeight: 700, fontSize: 15, marginBottom: 8, lineHeight: 1.3 }}>{item.title}</p>
                  <p style={{ color: TEXT_MED, fontSize: 13, lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            TESTIMONIOS
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: BG }}>
          <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 md:py-28">

            <div className="text-center mb-14">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                backgroundColor: '#fefce8', border: '1px solid #fde68a',
                borderRadius: 100, padding: '4px 12px', marginBottom: 20,
              }}>
                <Star size={11} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Lo que dicen</span>
              </div>

              <h2 style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                color: TEXT,
                letterSpacing: '-0.02em',
              }}>
                Lo que dicen quienes ya la usan
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  quote: 'Ahorro horas cada semana porque ya no tengo que pensar cómo escribir los prompts.',
                  bg: '#f0f0ff',
                  border: '#c7d2fe',
                  accent: '#6366f1',
                },
                {
                  quote: 'Las respuestas de ChatGPT mejoraron muchísimo desde el primer día.',
                  bg: '#f0fdf4',
                  border: '#bbf7d0',
                  accent: '#22c55e',
                },
                {
                  quote: 'Por $10 recuperé la inversión en menos de una semana.',
                  bg: '#fff7ed',
                  border: '#fed7aa',
                  accent: '#f97316',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: item.bg,
                    border: `1px solid ${item.border}`,
                    borderRadius: 20,
                    padding: '28px 24px',
                    position: 'relative',
                  }}
                >
                  <Quote size={24} style={{ color: item.accent, opacity: 0.4, marginBottom: 16 }} />
                  <p style={{ color: TEXT, fontSize: 15, lineHeight: 1.7, fontWeight: 500 }}>
                    "{item.quote}"
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            GARANTÍA
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: BG_WARM, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-3xl mx-auto px-6 sm:px-10 py-20 md:py-28 text-center">

            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 32px rgba(102,126,234,0.25)',
            }}>
              <Shield size={32} style={{ color: 'white' }} />
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              backgroundColor: '#f0f0ff', border: '1px solid #c7d2fe',
              borderRadius: 100, padding: '4px 12px', marginBottom: 20,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#6366f1' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>sin riesgo</span>
            </div>

            <h2 style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              color: TEXT,
              letterSpacing: '-0.02em',
              marginBottom: 20,
            }}>
              Pruébala durante 7 días sin riesgo.
            </h2>

            <p style={{ color: TEXT_MED, fontSize: 16, lineHeight: 1.85, maxWidth: 500, margin: '0 auto 16px' }}>
              Si no encuentras valor en la biblioteca o simplemente no era lo que esperabas, envíanos un mensaje y te devolvemos el <strong style={{ color: TEXT }}>100%</strong> del dinero.
            </p>
            <p style={{ color: TEXT_DIM, fontSize: 14, lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
              Sin preguntas. Sin complicaciones.
            </p>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: BG, borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-3xl mx-auto px-6 sm:px-10 py-20 md:py-28">

            <div className="text-center mb-12">
              <h2 style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                color: TEXT,
                letterSpacing: '-0.02em',
                marginBottom: 10,
              }}>
                Preguntas frecuentes
              </h2>
              <p style={{ color: TEXT_MED, fontSize: 15 }}>Lo que me preguntan antes de comprar.</p>
            </div>

            <div style={{ backgroundColor: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              {faqs.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            CTA FINAL
        ══════════════════════════════════════════ */}
        <section style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#0f0f0f' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <Blob color="radial-gradient(circle, #667eea, #764ba2)" size={500} top="-100px" left="-100px" opacity={0.18} />
            <Blob color="radial-gradient(circle, #f093fb, #f5576c)" size={400} top="50%" left="70%" opacity={0.14} />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 sm:px-10 py-24 md:py-36 text-center">

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 100, padding: '4px 14px', marginBottom: 24,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} className="animate-pulse" />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>precio de lanzamiento</span>
            </div>

            <h2 style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2rem, 5vw, 3.6rem)',
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 20,
            }}>
              Puedes seguir improvisando prompts…<br />
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa, #f0abfc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                o empezar a usar los que ya funcionan.
              </span>
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, lineHeight: 1.8, maxWidth: 480, margin: '0 auto 52px' }}>
              Más de 200 prompts probados y listos para copiar, pegar y adaptar a tu situación. Por $10. Sin suscripción. Acceso en 2 minutos.
            </p>

            {/* Pricing card */}
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24,
              padding: '40px 36px',
              maxWidth: 440,
              margin: '0 auto 40px',
              backdropFilter: 'blur(20px)',
            }}>
              <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>
                acceso inmediato
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
                <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 72, color: 'white', lineHeight: 1 }}>$10</span>
                <div>
                  <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>$37</p>
                  <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>pago único</p>
                </div>
              </div>

              <div className="space-y-3.5 mb-10 text-left">
                {[
                  'Más de 200 prompts listos para usar hoy',
                  'ChatGPT, Gemini, Claude y cualquier IA que uses',
                  'Prompts adicionales para nichos específicos',
                  'Guía de prompt engineering incluida',
                  'Nuevos prompts cada semana, sin costo extra',
                  'Garantía de 7 días, sin complicaciones',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      backgroundColor: 'rgba(167,139,250,0.15)',
                      border: '1px solid rgba(167,139,250,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Check size={9} style={{ color: '#a78bfa' }} strokeWidth={3} />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{item}</span>
                  </div>
                ))}
              </div>

              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 16,
                  padding: '17px 24px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 8px 32px rgba(102,126,234,0.35)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(102,126,234,0.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(102,126,234,0.35)'; }}
              >
                Quiero acceso ahora — $10
                <ArrowRight size={17} />
              </a>

              <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 14, letterSpacing: '0.05em' }}>
                Acceso en 2 minutos · Pago único · Garantía 7 días
              </p>
            </div>

            {/* Trust row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
              {[
                { icon: <Shield size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />, label: 'Garantía 7 días' },
                { icon: <Clock size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />, label: 'Acceso en 2 min' },
                { icon: <Star size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />, label: 'Pago único' },
                { icon: <TrendingUp size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />, label: 'Sin suscripción' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t.icon}
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>{t.label}</span>
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
