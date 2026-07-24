import React, { useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, ArrowRight, ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AlpacaIcon from '../components/AlpacaIcon';

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

/* ─── Paleta (Relume-inspired — tema claro) ─── */
const BG = '#ffffff';
const BG_ALT = '#f6f6f4';
const TEXT = '#14151a';
const MUTED = '#5f6067';
const DIM = '#9a9ba1';
const BORDER = '#e6e6e9';

const NAVY = '#14151a';   // botones primarios / footer
const BLUE = '#3b4af7';   // acento (links, detalles)
const BANNER_BG = '#c9f2e3';
const BANNER_TEXT = '#0d5c43';

const buyUrl = 'https://pay.hotmart.com/K99381988U?checkoutMode=10&bid=1778363157034';

/* ─── Cursor "multiplayer" (firma visual Relume) ─── */
const Cursor: React.FC<{ label: string; color: string; top: string; left?: string; right?: string; flip?: boolean; rotate?: number }> = ({
  label, color, top, left, right, flip, rotate = 0
}) => (
  <div style={{
    position: 'absolute', top, left, right, zIndex: 10,
    display: 'flex', flexDirection: 'column',
    alignItems: flip ? 'flex-end' : 'flex-start',
    transform: `rotate(${rotate}deg)`,
    pointerEvents: 'none',
    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))',
  }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ transform: flip ? 'scaleX(-1)' : 'none' }}>
      <path d="M4 3L20 11L12.5 13L9.5 20L4 3Z" fill={color} stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
    <span style={{
      backgroundColor: color, color: '#fff',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
      padding: '3px 9px', borderRadius: 100,
      marginTop: 2, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  </div>
);

/* ─── Botones ─── */
const BtnPrimary: React.FC<{ children: React.ReactNode; href?: string; size?: 'sm' | 'lg' }> = ({ children, href = buyUrl, size = 'sm' }) => (
  <a
    href={href}
    target={href.startsWith('http') ? '_blank' : undefined}
    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: NAVY, color: '#fff',
      fontWeight: 600,
      fontSize: size === 'lg' ? 16 : 14,
      padding: size === 'lg' ? '15px 30px' : '10px 20px',
      borderRadius: 8,
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      transition: 'background 0.15s, transform 0.15s',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#2a2b33'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = NAVY; }}
  >
    {children}
  </a>
);

const BtnSecondary: React.FC<{ children: React.ReactNode; href: string; size?: 'sm' | 'lg' }> = ({ children, href, size = 'sm' }) => (
  <a
    href={href}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: 'transparent', color: TEXT,
      fontWeight: 600,
      fontSize: size === 'lg' ? 16 : 14,
      padding: size === 'lg' ? '14px 30px' : '9px 20px',
      borderRadius: 8,
      border: `1px solid ${TEXT}`,
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(20,21,26,0.05)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
  >
    {children}
  </a>
);

/* ─── Link con flecha (estilo "Give it a try") ─── */
const ArrowLink: React.FC<{ children: React.ReactNode; href?: string }> = ({ children, href = buyUrl }) => (
  <a
    href={href}
    target={href.startsWith('http') ? '_blank' : undefined}
    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      color: TEXT, fontWeight: 600, fontSize: 14,
      textDecoration: 'none', borderBottom: `1.5px solid ${TEXT}`,
      paddingBottom: 1,
    }}
  >
    {children}
    <ArrowUpRight size={15} />
  </a>
);

/* ─── FAQ ─── */
const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between py-6" style={{ userSelect: 'none' }}>
        <span style={{ color: TEXT, fontSize: 16, fontWeight: 600, lineHeight: 1.4, paddingRight: 24 }}>{q}</span>
        {open
          ? <ChevronUp size={18} style={{ color: TEXT, flexShrink: 0 }} />
          : <ChevronDown size={18} style={{ color: DIM, flexShrink: 0 }} />
        }
      </div>
      {open && (
        <div className="pb-6">
          <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.8, maxWidth: 640 }}>{a}</p>
        </div>
      )}
    </div>
  );
};

/* ─── Etiqueta de sección (eyebrow) ─── */
const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 14 }}>{children}</p>
);

/* ─── Mockup: workspace Notion ─── */
const NotionMockup: React.FC = () => (
  <div style={{
    borderRadius: 12,
    overflow: 'hidden',
    border: `1px solid ${BORDER}`,
    boxShadow: '0 24px 60px rgba(20,21,26,0.10)',
    backgroundColor: BG,
  }}>
    {/* Window bar */}
    <div style={{
      backgroundColor: BG_ALT, borderBottom: `1px solid ${BORDER}`,
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {['#d9d9dc', '#d9d9dc', '#d9d9dc'].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c }} />
        ))}
      </div>
      <div style={{
        flex: 1, backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: 6,
        height: 24, maxWidth: 340, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 11, color: DIM }}>alpacka.ai · Biblioteca de Prompts</span>
      </div>
    </div>

    {/* Sidebar + content */}
    <div style={{ display: 'flex', height: 380 }}>
      <div className="hidden sm:block" style={{ width: 210, backgroundColor: BG_ALT, borderRight: `1px solid ${BORDER}`, padding: '18px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Biblioteca</div>
        {[
          { emoji: '⚡', label: 'Productividad', count: 42 },
          { emoji: '✍️', label: 'Copywriting', count: 38 },
          { emoji: '📱', label: 'Redes Sociales', count: 36 },
          { emoji: '📈', label: 'Marketing', count: 35 },
          { emoji: '💼', label: 'Negocios', count: 29 },
          { emoji: '🎨', label: 'Creatividad', count: 27 },
          { emoji: '🧠', label: 'Psicología', count: 26 },
          { emoji: '📧', label: 'Email', count: 22 },
          { emoji: '💻', label: 'Vibe Coding', count: 21 },
          { emoji: '🤖', label: 'Técnicos', count: 18 },
          { emoji: '🌐', label: 'SEO & Contenido', count: 16 },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '5px 8px', borderRadius: 6, marginBottom: 2,
            backgroundColor: i === 0 ? 'rgba(20,21,26,0.06)' : 'transparent',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12 }}>{item.emoji}</span>
              <span style={{ fontSize: 12, color: i === 0 ? TEXT : MUTED }}>{item.label}</span>
            </div>
            <span style={{ fontSize: 10, color: DIM, backgroundColor: 'rgba(20,21,26,0.05)', borderRadius: 4, padding: '1px 5px' }}>{item.count}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: '20px 24px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: TEXT }}>Productividad</span>
          <span style={{ fontSize: 11, color: DIM, backgroundColor: BG_ALT, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '2px 8px', marginLeft: 4 }}>42 prompts</span>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 96px 76px', gap: 8,
          padding: '6px 10px', backgroundColor: BG_ALT,
          borderRadius: '8px 8px 0 0', borderBottom: `1px solid ${BORDER}`,
        }}>
          {['Prompt', 'IA', 'Copiar'].map((h, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 600, color: DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
          ))}
        </div>

        {[
          { title: 'Planificador semanal Deep Work con bloques de 90 min', ai: 'Universal', color: '#10a37f' },
          { title: 'Resumen ejecutivo con decisiones y próximos pasos', ai: 'ChatGPT', color: '#10a37f' },
          { title: 'Email de seguimiento post-demo que cierra sin presionar', ai: 'Claude', color: '#D4A853' },
          { title: 'Estrategia de contenido 30 días con calendario y KPIs', ai: 'Gemini', color: '#4285F4' },
          { title: 'Análisis FODA completo con plan de acción por cuadrante', ai: 'Universal', color: '#10a37f' },
          { title: 'Propuesta comercial lista para enviar en una página', ai: 'Universal', color: '#10a37f' },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 96px 76px', gap: 8,
            padding: '10px 10px', borderBottom: `1px solid ${BORDER}`, alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: row.color }} />
              <span style={{ fontSize: 11, color: MUTED }}>{row.ai}</span>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: BLUE,
              backgroundColor: 'rgba(59,74,247,0.07)', border: '1px solid rgba(59,74,247,0.2)',
              borderRadius: 5, padding: '3px 8px', textAlign: 'center',
            }}>
              Copiar
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Mini-mockups para las 3 cards de producto ─── */
const MiniLibrary: React.FC = () => {
  const cats = [
    { emoji: '⚡', t: 'Productividad', n: 42 },
    { emoji: '✍️', t: 'Copywriting', n: 38 },
    { emoji: '📱', t: 'Redes Sociales', n: 36 },
    { emoji: '📈', t: 'Marketing', n: 35 },
    { emoji: '💼', t: 'Negocios', n: 29 },
    { emoji: '🎨', t: 'Creatividad', n: 27 },
    { emoji: '🧠', t: 'Psicología', n: 26 },
    { emoji: '📧', t: 'Email', n: 22 },
    { emoji: '💻', t: 'Vibe Coding', n: 21 },
    { emoji: '🤖', t: 'Técnicos', n: 18 },
    { emoji: '🌐', t: 'SEO & Contenido', n: 16 },
  ];
  return (
    <div style={{ backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12, boxShadow: '0 12px 32px rgba(20,21,26,0.08)' }}>
      {cats.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 6px', borderBottom: i < cats.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
          <span style={{ fontSize: 12.5, color: TEXT }}>{r.emoji}&nbsp;&nbsp;{r.t}</span>
          <span style={{ fontSize: 10.5, color: DIM, backgroundColor: BG_ALT, borderRadius: 4, padding: '1px 7px' }}>{r.n}</span>
        </div>
      ))}
    </div>
  );
};

const MiniNichos: React.FC = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {['🏠 Inmobiliaria', '🛒 E-commerce', '⚕️ Salud', '⚖️ Legal', '🎓 Educación', '💪 Fitness', '🍽️ Restaurantes', '📱 Creadores', 'Psicologia', 'Finanzas', 'Abogados'].map((n, i) => (
      <span key={i} style={{
        backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: 100,
        padding: '7px 14px', fontSize: 12.5, color: TEXT, fontWeight: 500,
        boxShadow: '0 4px 12px rgba(20,21,26,0.05)',
      }}>{n}</span>
    ))}
  </div>
);

const MiniGuide: React.FC = () => (
  <div style={{ backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, boxShadow: '0 12px 32px rgba(20,21,26,0.08)' }}>
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: DIM, marginBottom: 10 }}>Anatomía de un prompt</p>
    {[
      { tag: 'ROL', text: 'Actúa como estratega de marketing senior…', color: BLUE },
      { tag: 'CONTEXTO', text: 'Mi negocio es [INSERTAR] y mi cliente…', color: '#10a37f' },
      { tag: 'FORMATO', text: 'Entrega una tabla con 3 columnas…', color: '#e8590c' },
    ].map((r, i) => (
      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i < 2 ? 10 : 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: r.color, backgroundColor: `${r.color}14`, border: `1px solid ${r.color}33`, borderRadius: 4, padding: '2px 6px', flexShrink: 0, letterSpacing: '0.06em' }}>{r.tag}</span>
        <span style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{r.text}</span>
      </div>
    ))}
  </div>
);

/* ─── Main ─── */
const Ebook: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Título: split por líneas con mask (overflow: clip) — el texto sube desde detrás de la máscara
    SplitText.create('.eb-hero-title', {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.12,
          onComplete: () => self.revert(),
        });
      },
    });

    // El resto del hero entra detrás del título, en cascada suave
    gsap.from('.eb-hero-fade', {
      autoAlpha: 0,
      y: 22,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.1,
      delay: 0.35,
    });
  }, { scope: heroRef });

  // Stacking cards (solo mobile): las cards quedan sticky y la anterior se encoge cuando la siguiente se monta encima
  const stackRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(max-width: 767px)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.eb-stack-card');
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.94,
          transformOrigin: 'center top',
          ease: 'none',
          scrollTrigger: {
            trigger: cards[i + 1],
            start: 'top bottom',
            end: 'top 104px',
            scrub: true,
          },
        });
      });
    });
  }, { scope: stackRef });

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

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: '"Space Grotesk", sans-serif', color: TEXT }}>
      <style>{`
        .eb-section { scroll-margin-top: 110px; }
        @media (max-width: 640px) { .eb-hide-cursor { display: none; } }
        @media (max-width: 767px) {
          .eb-stack-card { position: sticky; will-change: transform; }
          .eb-stack-card:nth-child(1) { top: 80px; }
          .eb-stack-card:nth-child(2) { top: 92px; }
          .eb-stack-card:nth-child(3) { top: 104px; }
        }
        .eb-logo-marquee-wrap {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
          mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
        }
        .eb-logo-marquee {
          display: flex;
          align-items: center;
          width: max-content;
          animation: ebLogoScroll 28s linear infinite;
        }
        .eb-logo-marquee:hover { animation-play-state: paused; }
        @keyframes ebLogoScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .eb-logo-marquee { animation: none; }
        }
        /* Las secciones bajo el fold no se pintan hasta que se acercan al viewport */
        .eb-cv { content-visibility: auto; contain-intrinsic-size: auto 700px; }
        /* El blur del navbar es caro en móviles durante el scroll — se desactiva ahí */
        @media (max-width: 767px) {
          .eb-nav {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background-color: rgba(255,255,255,0.98) !important;
          }
        }
      `}</style>

      {/* ── Announcement banner ── */}
      <div style={{ backgroundColor: BANNER_BG, padding: '9px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: BANNER_TEXT, fontWeight: 500 }}>
          <strong style={{ fontWeight: 700 }}>Nuevos prompts cada semana</strong> — las actualizaciones están incluidas de por vida.{' '}
          <a href={buyUrl} target="_blank" rel="noopener noreferrer" style={{ color: BANNER_TEXT, fontWeight: 700, textDecoration: 'underline' }}>
            Acceder
          </a>
        </p>
      </div>

      {/* ── Navbar ── */}
      <header className="eb-nav" style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BORDER}`,
        height: 64,
        display: 'flex', alignItems: 'center',
      }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full flex items-center justify-between">
          <div className="flex items-center">
            <AlpacaIcon className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-3">
            <a href="#incluye" className="hidden sm:inline" style={{ color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: 'none', marginRight: 6 }}>
              Qué incluye
            </a>
            <a href="#precio" className="hidden sm:inline" style={{ color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: 'none', marginRight: 10 }}>
              Precio
            </a>
            <BtnPrimary>Acceder — $10</BtnPrimary>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section ref={heroRef} style={{ backgroundColor: BG, position: 'relative', overflow: 'hidden' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-0 text-center">

          <h1 className="eb-hero-title" style={{
            fontWeight: 600,
            fontSize: 'clamp(2.6rem, 6.5vw, 5rem)',
            lineHeight: 1.04,
            letterSpacing: '-0.03em',
            color: TEXT,
            maxWidth: 900,
            margin: '0 auto 24px',
          }}>
            Resultados de experto con IA, en un solo click.
          </h1>

          <p className="eb-hero-fade" style={{ color: MUTED, fontSize: 'clamp(16px, 1.8vw, 19px)', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 36px' }}>
            Todos los prompts están escritos para que puedas adaptarlos fácilmente a tu propio flujo de trabajo. Pégalo en ChatGPT, Claude o Gemini y obtén una respuesta
            que sirve a la primera.
          </p>

          <div className="eb-hero-fade flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <BtnPrimary size="lg">Acceder por $10 <ArrowRight size={16} /></BtnPrimary>
            <BtnSecondary size="lg" href="#incluye">Ver qué incluye</BtnSecondary>
          </div>

          <div className="eb-hero-fade" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px 22px', marginBottom: 64 }}>
            {['Pago único', 'Acceso en 2 minutos', 'Garantía de 30 días'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={13} style={{ color: TEXT }} strokeWidth={2.5} />
                <span style={{ fontSize: 13, color: DIM }}>{t}</span>
              </div>
            ))}
          </div>

          {/* Mockup + cursores */}
          <div className="eb-hero-fade" style={{ position: 'relative', maxWidth: 880, margin: '0 auto', paddingBottom: 0 }}>
            <div className="eb-hide-cursor"><Cursor label="Tú" color={BLUE} top="38%" right="6%" rotate={-4} flip /></div>
            <div className="eb-hide-cursor"><Cursor label="ChatGPT" color="#10a37f" top="12%" left="-2%" rotate={5} /></div>
            <div className="eb-hide-cursor"><Cursor label="Claude" color="#e8590c" top="72%" left="20%" rotate={-6} /></div>
            <NotionMockup />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3 CARDS DE PRODUCTO
      ══════════════════════════════════════════ */}
      <section id="incluye" ref={stackRef} className="eb-section" style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'Biblioteca de +200 prompts',
                desc: 'Encuentra en segundos el prompt exacto para lo que necesitas hoy, organizado por categorías en Notion.',
                visual: <MiniLibrary />,
                cursor: { label: 'Tú', color: BLUE },
              },
              {
                title: '50 prompts extra por nicho',
                desc: 'Casos específicos que no cubre ningún prompt genérico: inmobiliaria, e-commerce, salud, legal y más.',
                visual: <MiniNichos />,
                cursor: { label: 'Gemini', color: '#4285F4' },
              },
              {
                title: 'Guía de prompt engineering',
                desc: 'Los principios detrás de cada prompt, para que crees los tuyos cuando ninguno encaje exactamente.',
                visual: <MiniGuide />,
                cursor: { label: 'Claude', color: '#e8590c' },
              },
            ].map((card, i) => (
              <div key={i} className="eb-stack-card" style={{
                backgroundColor: BG_ALT,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <h3 style={{ fontWeight: 600, fontSize: 21, letterSpacing: '-0.01em', marginBottom: 10, color: TEXT }}>{card.title}</h3>
                <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.7, marginBottom: 18 }}>{card.desc}</p>
                <div style={{ marginBottom: 26 }}>
                  <ArrowLink>Lo quiero</ArrowLink>
                </div>
                <div style={{ position: 'relative', marginTop: 'auto' }}>
                  <div className="eb-hide-cursor"><Cursor label={card.cursor.label} color={card.cursor.color} top="-14px" right="4%" rotate={4} flip /></div>
                  {card.visual}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          QUOTE GRANDE (social proof)
      ══════════════════════════════════════════ */}
      <section className="eb-cv" style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-20 md:py-28 text-center">
          <p style={{ fontSize: 14, fontWeight: 600, color: DIM, letterSpacing: '0.02em', marginBottom: 28 }}>
            +200 prompts · 11 categorías · 1 clic para copiar
          </p>
          <blockquote style={{
            fontWeight: 500,
            fontSize: 'clamp(1.5rem, 3.4vw, 2.5rem)',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            color: TEXT,
            maxWidth: 820,
            margin: '0 auto 28px',
          }}>
            "Aprender a hablarle bien a la IA me tomó cientos de horas de prueba y error.
            A ti te puede tomar un clic."
          </blockquote>
          <p style={{ color: MUTED, fontSize: 14, fontWeight: 600 }}>Esteban</p>
          <p style={{ color: DIM, fontSize: 13 }}>Creador de alpacka.ai</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FILA DE "LOGOS" — IAs compatibles
      ══════════════════════════════════════════ */}
      <section className="eb-cv" style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
          <p style={{ fontSize: 13, color: DIM, textAlign: 'center', marginBottom: 22, fontWeight: 500 }}>
            El mismo prompt funciona en todas las IAs que ya usas
          </p>
          <div className="eb-logo-marquee-wrap">
            <div className="eb-logo-marquee">
              {[...Array(2)].map((_, copy) => (
                <React.Fragment key={copy}>
                  {['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Grok', 'Perplexity', 'DeepSeek', 'Mistral'].map((name, i) => (
                    <span key={i} aria-hidden={copy === 1} style={{ fontSize: 17, fontWeight: 600, color: '#c2c3c9', letterSpacing: '-0.01em', paddingRight: 64, whiteSpace: 'nowrap', flexShrink: 0 }}>{name}</span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURE 1 — Copia. Pega. Listo.
      ══════════════════════════════════════════ */}
      <section className="eb-cv" style={{ backgroundColor: BG_ALT, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            <div>
              <Eyebrow>Cero fricción</Eyebrow>
              <h2 style={{ fontWeight: 600, fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 18 }}>
                Copia. Pega. Listo.
              </h2>
              <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.8, marginBottom: 36, maxWidth: 480 }}>
                Nada que instalar, nada que aprender. Cada prompt ya viene con el rol, el contexto
                y el formato que la IA necesita para responderte bien a la primera.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Cero curva de aprendizaje</h3>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>
                    Si sabes usar ChatGPT aunque sea a medias, esto lo dominas en el primer minuto. Copiar y pegar; eso es todo.
                  </p>
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Campos [INSERTAR] guiados</h3>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>
                    Cada prompt te marca exactamente qué completar con tus datos. Sin adivinar qué le falta a la IA.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual: prompt malo vs prompt de la biblioteca */}
            <div style={{ position: 'relative' }}>
              <div className="eb-hide-cursor"><Cursor label="Tú" color={BLUE} top="52%" right="2%" rotate={-5} flip /></div>
              <div className="space-y-4">
                <div style={{ backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#dc2626' }}>Prompt genérico</span>
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    <p style={{ fontFamily: 'monospace', fontSize: 13, color: TEXT, marginBottom: 10 }}>"escribe un email de ventas"</p>
                    <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>→ Texto corporativo y genérico que nadie abriría. Tres reescrituras después, sigues igual.</p>
                  </div>
                </div>

                <div style={{ backgroundColor: '#fff', border: `1.5px solid ${TEXT}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 16px 40px rgba(20,21,26,0.10)' }}>
                  <div style={{ padding: '12px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#16a34a' }}>Prompt de la biblioteca</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: BLUE, backgroundColor: 'rgba(59,74,247,0.07)', border: '1px solid rgba(59,74,247,0.2)', borderRadius: 5, padding: '2px 8px' }}>Copiar</span>
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    <p style={{ fontFamily: 'monospace', fontSize: 13, color: TEXT, lineHeight: 1.6, marginBottom: 10 }}>
                      "Actúa como copywriter senior de respuesta directa. Mi producto es [INSERTAR], mi cliente ideal es [INSERTAR]. Escribe un email de ventas con asunto, gancho en 2 líneas y un solo CTA…"
                    </p>
                    <p style={{ fontSize: 13, color: '#16a34a', lineHeight: 1.6, fontWeight: 500 }}>→ Un email que sí se puede enviar, a la primera.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURE 2 — Notion, no PDF (invertida)
      ══════════════════════════════════════════ */}
      <section className="eb-cv" style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            <div className="order-2 lg:order-1" style={{ position: 'relative' }}>
              <div className="eb-hide-cursor"><Cursor label="ChatGPT" color="#10a37f" top="-16px" left="8%" rotate={6} /></div>
              <NotionMockup />
            </div>

            <div className="order-1 lg:order-2">
              <Eyebrow>Organización real</Eyebrow>
              <h2 style={{ fontWeight: 600, fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 18 }}>
                En Notion, no en un PDF de 80 páginas
              </h2>
              <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.8, marginBottom: 36, maxWidth: 480 }}>
                No es un archivo donde haces Ctrl+F y rezas. Es una base de datos que filtras por
                categoría, buscas por palabra clave y copias con un clic.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Filtra y encuentra en segundos</h3>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>
                    Once categorías: productividad, redes sociales, copywriting, marketing, psicología, vibe coding, negocios, creatividad, email, técnicos y SEO.
                  </p>
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Duplícalo en tu cuenta</h3>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>
                    Es tuyo. Lo duplicas en tu propio Notion, lo reorganizas a tu manera y lo llevas contigo.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURE 3 — Actualizaciones
      ══════════════════════════════════════════ */}
      <section className="eb-cv" style={{ backgroundColor: BG_ALT, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            <div>
              <Eyebrow>Comprado hoy, mejor mañana</Eyebrow>
              <h2 style={{ fontWeight: 600, fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 18 }}>
                La biblioteca crece; tu precio no
              </h2>
              <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.8, marginBottom: 36, maxWidth: 480 }}>
                Cuando sale un modelo nuevo o un caso de uso que no estaba, lo añado y aparece en
                tu espacio automáticamente. Pagaste una vez; eso es todo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Actualizaciones de por vida</h3>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>
                    Prompts nuevos cada semana, sin costo extra. No hay "versión 2.0" que tengas que volver a comprar.
                  </p>
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Sin suscripción</h3>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>
                    $10 una sola vez. Nada de cargos recurrentes escondidos ni "premium" más adelante.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual: changelog */}
            <div style={{ position: 'relative' }}>
              <div className="eb-hide-cursor"><Cursor label="Gemini" color="#4285F4" top="8%" right="4%" rotate={-4} flip /></div>
              <div style={{ backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '22px 24px', boxShadow: '0 16px 40px rgba(20,21,26,0.08)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: DIM, marginBottom: 16 }}>Últimas actualizaciones</p>
                {[
                  { tag: 'Nuevo', color: '#16a34a', text: '12 prompts de análisis de datos y reportes' },
                  { tag: 'Nuevo', color: '#16a34a', text: 'Pack: prompts para agentes y automatizaciones' },
                  { tag: 'Mejora', color: BLUE, text: 'Categoría SEO ampliada con búsqueda por intención' },
                  { tag: 'Nuevo', color: '#16a34a', text: '8 plantillas de email en frío por industria' },
                  { tag: 'Mejora', color: BLUE, text: 'Prompts optimizados para los modelos más recientes' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < 4 ? `1px solid ${BORDER}` : 'none' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: r.color, backgroundColor: `${r.color}12`, border: `1px solid ${r.color}30`, borderRadius: 4, padding: '2px 8px', flexShrink: 0, marginTop: 1 }}>{r.tag}</span>
                    <span style={{ fontSize: 13.5, color: TEXT, lineHeight: 1.5 }}>{r.text}</span>
                  </div>
                ))}
                <p style={{ fontSize: 12, color: DIM, marginTop: 14 }}>Incluido en tu compra — para siempre.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CARDS DE ACCESO (estilo "libraries")
      ══════════════════════════════════════════ */}
      <section className="eb-cv" style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">

          <div className="text-center mb-14">
            <h2 style={{ fontWeight: 600, fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)', letterSpacing: '-0.025em', marginBottom: 14 }}>
              Todo lo que desbloqueas por $10
            </h2>
            <p style={{ color: MUTED, fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
              Sin letra pequeña. Un solo pago, tres accesos, actualizaciones para siempre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                emoji: '📚',
                badge: 'Acceso principal',
                title: 'Biblioteca +200 prompts',
                bullets: ['Copiar con un clic, sin fricción', 'Búsqueda por palabra clave', 'Funciona en cualquier IA'],
                cats: ['⚡ Productividad', '✍️ Copywriting', '📱 Redes Sociales', '📈 Marketing', '💼 Negocios', '🎨 Creatividad', '🧠 Psicología', '📧 Email', '💻 Vibe Coding', '🤖 Técnicos', '🌐 SEO & Contenido'],
              },
              {
                emoji: '🎯',
                badge: 'Incluido',
                title: '50 prompts por nicho',
                bullets: ['Inmobiliaria y e-commerce', 'Salud, legal y educación', 'Fitness, restaurantes y creadores', 'Directo a tu caso de uso'],
                cats: [] as string[],
              },
              {
                emoji: '♾️',
                badge: 'Para siempre',
                title: 'Guía + actualizaciones',
                bullets: ['Guía de prompt engineering', 'Prompts nuevos cada semana', 'Duplica el espacio en tu Notion', 'Sin suscripción ni cargos extra'],
                cats: [] as string[],
              },
            ].map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#fff',
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: '30px 28px',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <span style={{ fontSize: 28 }}>{card.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: MUTED, backgroundColor: BG_ALT, border: `1px solid ${BORDER}`, borderRadius: 100, padding: '3px 12px' }}>{card.badge}</span>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 19, marginBottom: 16, letterSpacing: '-0.01em' }}>{card.title}</h3>
                <div className="space-y-3 mb-5">
                  {card.bullets.map((b, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <Check size={14} style={{ color: TEXT, flexShrink: 0, marginTop: 3 }} strokeWidth={2.5} />
                      <span style={{ fontSize: 14, color: MUTED, lineHeight: 1.55 }}>{b}</span>
                    </div>
                  ))}
                </div>
                {card.cats.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                    {card.cats.map((c, j) => (
                      <span key={j} style={{
                        fontSize: 11.5, color: MUTED, fontWeight: 500,
                        backgroundColor: BG_ALT, border: `1px solid ${BORDER}`,
                        borderRadius: 100, padding: '4px 11px', whiteSpace: 'nowrap',
                      }}>{c}</span>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 'auto' }}>
                  <ArrowLink>Acceder</ArrowLink>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING / CTA
      ══════════════════════════════════════════ */}
      <section id="precio" className="eb-section eb-cv" style={{ backgroundColor: BG_ALT, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            <div>
              <h2 style={{ fontWeight: 600, fontSize: 'clamp(2rem, 4.2vw, 3.2rem)', lineHeight: 1.08, letterSpacing: '-0.028em', marginBottom: 20 }}>
                Pruébala en tu próximo proyecto
              </h2>
              <p style={{ color: MUTED, fontSize: 17, lineHeight: 1.8, marginBottom: 28, maxWidth: 460 }}>
                Cuesta menos que un almuerzo y te ahorra horas cada semana. Y si no te sirve,
                tienes 30 días para pedir el 100% de vuelta — sin formularios, sin preguntas.
              </p>
              <div className="space-y-3">
                {[
                  'Acceso inmediato: llega a tu correo en 2 minutos',
                  'Pago único de $10 — sin suscripción',
                  'Garantía de devolución de 30 días',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Check size={15} style={{ color: TEXT }} strokeWidth={2.5} />
                    <span style={{ fontSize: 15, color: MUTED }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card de precio */}
            <div style={{ position: 'relative' }}>
              <div className="eb-hide-cursor"><Cursor label="Tú" color={BLUE} top="-16px" right="10%" rotate={5} flip /></div>
              <div style={{
                backgroundColor: '#fff',
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: '38px 34px',
                boxShadow: '0 24px 60px rgba(20,21,26,0.10)',
                maxWidth: 460,
                margin: '0 auto',
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: DIM, marginBottom: 18 }}>
                  Precio de lanzamiento
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 26 }}>
                  <span style={{ fontWeight: 600, fontSize: 64, lineHeight: 1, letterSpacing: '-0.03em', color: TEXT }}>$10</span>
                  <div>
                    <p style={{ fontSize: 14, color: DIM, textDecoration: 'line-through' }}>$37</p>
                    <p style={{ fontSize: 12, color: DIM }}>pago único</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    '+200 prompts en Notion, listos para usar hoy',
                    '50 prompts adicionales por nicho',
                    'Guía de prompt engineering incluida',
                    'ChatGPT, Claude, Gemini y cualquier IA',
                    'Prompts nuevos cada semana, gratis',
                    'Garantía de 30 días',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <Check size={14} style={{ color: TEXT, flexShrink: 0, marginTop: 3 }} strokeWidth={2.5} />
                      <span style={{ color: MUTED, fontSize: 14, lineHeight: 1.55 }}>{item}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    backgroundColor: NAVY, color: '#fff',
                    fontWeight: 600, fontSize: 16,
                    padding: '16px 24px', borderRadius: 8,
                    textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#2a2b33'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = NAVY; }}
                >
                  Quiero la biblioteca <ArrowRight size={16} />
                </a>

                <p style={{ fontSize: 12, color: DIM, marginTop: 14, textAlign: 'center' }}>
                  Acceso en 2 minutos · Pago único · Garantía 30 días
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="eb-cv" style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-14">

            <div>
              <h2 style={{ fontWeight: 600, fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)', letterSpacing: '-0.025em', marginBottom: 14, lineHeight: 1.1 }}>
                Preguntas frecuentes
              </h2>
              <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7 }}>
                Lo que me preguntan antes de comprar. Si tienes otra duda, escríbeme y te respondo directo.
              </p>
            </div>

            <div>
              {faqs.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════ */}
      <section className="eb-cv" style={{ backgroundColor: BG_ALT, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-32 text-center">
          <h2 style={{
            fontWeight: 600,
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            lineHeight: 1.06,
            letterSpacing: '-0.03em',
            maxWidth: 780,
            margin: '0 auto 22px',
          }}>
            Sigues peleando con la IA, o copias lo que ya funciona
          </h2>
          <p style={{ color: MUTED, fontSize: 17, lineHeight: 1.75, maxWidth: 520, margin: '0 auto 36px' }}>
            $10 una sola vez. En tu correo en 2 minutos. Y si no te sirve, te devuelvo el dinero.
            Lo peor que puede pasar es que no pierdas nada.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <BtnPrimary size="lg">Acceder por $10 <ArrowRight size={16} /></BtnPrimary>
            <BtnSecondary size="lg" href="#incluye">Ver qué incluye</BtnSecondary>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER (oscuro, multi-columna)
      ══════════════════════════════════════════ */}
      <footer className="eb-cv" style={{ backgroundColor: NAVY, color: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 mb-14">

            <div>
              <div className="flex items-center mb-4">
                <AlpacaIcon className="w-6 h-6" />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, maxWidth: 300 }}>
                Prompts probados para trabajar más rápido con IA. Sin prueba y error, sin respuestas tibias.
              </p>
            </div>

            {[
              {
                title: 'Producto',
                links: [
                  { label: 'Biblioteca de prompts', href: buyUrl, external: true },
                  { label: 'Marketplace', href: '/prompts' },
                  { label: 'Precios', href: '/pricing' },
                ],
              },
              {
                title: 'Recursos',
                links: [
                  { label: 'Blog', href: '/blog' },
                  { label: 'Skills', href: '/skills' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Términos', href: '/terms' },
                  { label: 'Privacidad', href: '/privacy' },
                ],
              },
            ].map((col, i) => (
              <div key={i}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{col.title}</p>
                <div className="space-y-3">
                  {col.links.map((link, j) => (
                    <a
                      key={j}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 14, textDecoration: 'none' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              © {new Date().getFullYear()} alpacka.ai — Todos los derechos reservados.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              Pago único · Garantía 30 días
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Ebook;
