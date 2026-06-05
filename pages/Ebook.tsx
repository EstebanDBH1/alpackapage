import React, { useState } from 'react';
import { Check, Shield, ChevronDown, ChevronUp, Zap, Target, Star, ArrowRight, Gift, Clock, TrendingUp, BookOpen, Sparkles, Database, Layers } from 'lucide-react';
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
      a: 'Tienes 30 días. Si lo abres, lo usas y sientes que no valió la pena, me escribes y te reembolso el 100%. Sin formularios raros ni emails de retención. Solo dime que no funcionó para ti.',
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
          {/* Gradient blobs */}
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
              fontSize: 'clamp(2.6rem, 6vw, 4.4rem)',
              lineHeight: 1.05,
              color: TEXT,
              marginBottom: 22,
              letterSpacing: '-0.02em',
            }}>
              Tu IA trabaja con lo que le das.<br />
              <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Dale algo que funcione.
              </span>
            </h1>

            {/* Subheadline */}
            <p style={{ color: TEXT_MED, fontSize: 'clamp(15px, 1.6vw, 19px)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 36px' }}>
              Más de 200 prompts en Notion, organizados para que los encuentres en segundos y los pegues directo en la IA que ya usas. Sin cursos. Sin suscripción. Un pago, tuyo para siempre.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
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
                Acceder ahora — $10
                <ArrowRight size={16} />
              </a>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: TEXT_DIM }}>Precio normal: <span style={{ textDecoration: 'line-through' }}>$37</span></div>
                <div style={{ fontSize: 11, color: TEXT_DIM, letterSpacing: '0.05em' }}>pago único · garantía 30 días</div>
              </div>
            </div>

            <p style={{ fontSize: 12, color: TEXT_DIM, marginBottom: 56 }}>
              El precio sube cuando lleguemos a 1.000 compras.
            </p>

            {/* Product mockup */}
            <div style={{
              position: 'relative',
              maxWidth: 780,
              margin: '0 auto',
              borderRadius: '20px 20px 0 0',
              overflow: 'hidden',
              boxShadow: '0 -4px 0 #e4e4e1, 0 20px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
            }}>
              {/* Notion-style workspace mockup */}
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
                      { emoji: '⚡', label: 'Productividad', count: 42 },
                      { emoji: '✍️', label: 'Copywriting', count: 38 },
                      { emoji: '📈', label: 'Marketing', count: 35 },
                      { emoji: '💼', label: 'Negocios', count: 29 },
                      { emoji: '🎨', label: 'Creatividad', count: 27 },
                      { emoji: '📧', label: 'Email', count: 22 },
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
                      <span style={{ fontSize: 18 }}>⚡</span>
                      <span style={{ fontWeight: 700, fontSize: 18, color: TEXT }}>Productividad</span>
                      <span style={{ fontSize: 11, color: TEXT_DIM, backgroundColor: '#f0f0ee', borderRadius: 4, padding: '2px 8px', marginLeft: 4 }}>42 prompts</span>
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
                      { title: 'Planificador semanal Deep Work con bloques de 90 min', ai: 'Universal', color: '#10a37f' },
                      { title: 'Resumen ejecutivo con decisiones y próximos pasos', ai: 'ChatGPT', color: '#10a37f' },
                      { title: 'Email de seguimiento post-demo que cierra sin presionar', ai: 'Claude', color: '#D4A853' },
                      { title: 'Estrategia de contenido 30 días con calendario y KPIs', ai: 'Gemini', color: '#4285F4' },
                      { title: 'Análisis FODA completo con plan de acción por cuadrante', ai: 'Universal', color: '#10a37f' },
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
            PROBLEMA
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
                  Llevas meses usando ChatGPT y los resultados siguen siendo mediocres.
                </h2>

                <p style={{ color: TEXT_MED, fontSize: 16, lineHeight: 1.8, marginBottom: 14 }}>
                  No es la IA. Eres tú dándole instrucciones vagas y esperando magia. "Escribe un email de ventas" no es un prompt. Es una garantía de decepción.
                </p>

                <p style={{ color: TEXT_MED, fontSize: 16, lineHeight: 1.8 }}>
                  La diferencia entre lo que obtienes hoy y un resultado que realmente usas es <strong style={{ color: TEXT }}>la estructura del prompt.</strong> Solo eso.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { prompt: '"escribe un email de ventas"', result: 'Texto genérico y corporativo que nadie va a leer.', bad: true },
                  { prompt: '"dame una estrategia de marketing"', result: 'Una lista de 5 puntos obvios que ya conocías.', bad: true },
                  { prompt: '"ayúdame con mis redes sociales"', result: '3 reescrituras después, sigues sin el contenido.', bad: true },
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

                <div style={{
                  backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14,
                  padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#dcfce7', border: '1px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={10} style={{ color: '#22c55e' }} strokeWidth={3} />
                  </div>
                  <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
                    <strong>Con el prompt correcto:</strong> resultado que puedes usar en la primera respuesta. Sin "no te entendí bien, ¿puedes ser más específico?"
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            QUÉ INCLUYE — Notion-style feature cards
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
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>El contenido</span>
              </div>

              <h2 style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                color: TEXT,
                letterSpacing: '-0.02em',
                marginBottom: 14,
              }}>
                No es un PDF de 200 páginas que no vas a leer.
              </h2>
              <p style={{ color: TEXT_MED, fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
                Es una base de datos en Notion. Llegas, buscas lo que necesitas, copias en un clic y lo pegas en tu IA. Así de rápido.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FeatureCard
                bg="#fdf4ff"
                icon={<Zap size={22} style={{ color: '#a855f7' }} />}
                tag="42 prompts"
                tagColor="#a855f7"
                title="Productividad"
                desc="Planificación semanal, priorización, bloques de foco. Los lunes que tardabas 2 horas organizándote, ahora son 15 minutos."
              />
              <FeatureCard
                bg="#fff7ed"
                icon={<Target size={22} style={{ color: '#f97316' }} />}
                tag="38 prompts"
                tagColor="#f97316"
                title="Copywriting"
                desc="Posts, artículos, guiones, hilos. Sin el inicio genérico de 'Claro, con gusto te ayudo'. Directo al grano."
              />
              <FeatureCard
                bg="#f0fdf4"
                icon={<TrendingUp size={22} style={{ color: '#22c55e' }} />}
                tag="35 prompts"
                tagColor="#22c55e"
                title="Marketing y Ventas"
                desc="Estrategias de lanzamiento, copy de ads, análisis de competencia. Para cuando necesitas resultados esta semana."
              />
              <FeatureCard
                bg="#eff6ff"
                icon={<BookOpen size={22} style={{ color: '#3b82f6' }} />}
                tag="29 prompts"
                tagColor="#3b82f6"
                title="Comunicación"
                desc="Emails difíciles, negociaciones, propuestas, feedbacks incómodos. Para cuando importa cómo suenas."
              />
              <FeatureCard
                bg="#fff1f2"
                icon={<Layers size={22} style={{ color: '#f43f5e' }} />}
                tag="27 prompts"
                tagColor="#f43f5e"
                title="Creatividad e Ideas"
                desc="Brainstorming, conceptos, nombres, ideas de producto. Cuando llevas 20 minutos mirando la pantalla en blanco."
              />
              <FeatureCard
                bg="#fefce8"
                icon={<Star size={22} style={{ color: '#eab308' }} />}
                tag="22 prompts"
                tagColor="#eab308"
                title="Email Profesional"
                desc="Seguimientos, emails en frío, re-activaciones. Los que sí consiguen respuesta."
              />
              <FeatureCard
                bg="#f0fdfa"
                icon={<Gift size={22} style={{ color: '#14b8a6' }} />}
                tag="18 prompts"
                tagColor="#14b8a6"
                title="Plantillas Listas"
                desc="Los más usados, ya armados. Sin tener que adaptar nada. Copia, pega los corchetes y ya."
              />
              <FeatureCard
                bg="#faf5ff"
                icon={<Sparkles size={22} style={{ color: '#8b5cf6' }} />}
                tag="incluido"
                tagColor="#8b5cf6"
                title="Prompt Engineering"
                desc="Los principios detrás de cada prompt. Para que puedas crear los tuyos cuando ninguno encaje exactamente."
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
                  title: 'Biblioteca de +200 Prompts en Notion',
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
            GARANTÍA
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: BG }}>
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
              Si no es lo que esperabas, te devuelvo el dinero.
            </h2>

            <p style={{ color: TEXT_MED, fontSize: 16, lineHeight: 1.85, maxWidth: 500, margin: '0 auto 16px' }}>
              Tienes 30 días. Si lo abres, lo usas y sientes que no valió la pena, me escribes y te reembolso el <strong style={{ color: TEXT }}>100%</strong>. Sin formularios raros ni emails de retención.
            </p>
            <p style={{ color: TEXT_DIM, fontSize: 14, lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
              No tengo interés en quedarme con la plata de alguien que no quedó satisfecho. Si no funciona para ti, lo entiendo.
            </p>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════ */}
        <section style={{ backgroundColor: BG_WARM, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
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
          {/* Subtle gradient blobs */}
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
              O sigues improvisando prompts,<br />
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa, #f0abfc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                o tienes 200 ya hechos.
              </span>
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, lineHeight: 1.8, maxWidth: 480, margin: '0 auto 52px' }}>
              Por $10. Sin suscripción. Acceso en 2 minutos. Y si no te convence, te devuelvo el dinero.
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
                precio de lanzamiento
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
                  '+200 prompts en Notion, listos para usar hoy',
                  'ChatGPT, Gemini, Claude y cualquier IA que uses',
                  '50 prompts adicionales por nicho específico',
                  'Guía de prompt engineering incluida',
                  'Nuevos prompts cada semana, sin costo extra',
                  'Garantía de 30 días, sin formularios',
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
                Quiero la biblioteca — $10
                <ArrowRight size={17} />
              </a>

              <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 14, letterSpacing: '0.05em' }}>
                Acceso en 2 minutos · Pago único · Garantía 30 días
              </p>
            </div>

            {/* Trust row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
              {[
                { icon: <Shield size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />, label: 'Garantía 30 días' },
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
