import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ChevronRight, ArrowRight } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   Kit visual de las landings autocontenidas (/ y /bank-prompts).
   Paleta clara + Euclid Circular, fuera del tema oscuro de la app.
   ══════════════════════════════════════════════════════════════ */

/* ─── Paleta ─── */
export const BG       = '#ffffff';
export const BG_WARM  = '#f8f8f6';
export const BG_INK   = '#0e0e10';
export const TEXT     = '#15151a';
export const TEXT_MED = '#5c5c66';
export const TEXT_DIM = '#9a9aa3';
export const BORDER   = '#e7e7e2';
export const ACCENT   = '#f5324f';   // rojo de los titulares
export const YELLOW   = '#ffc93e';   // botón principal
export const GREEN    = '#16a34a';

export const FONT =
  '"Euclid Circular A", "Euclid Circular B", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/* Euclid Circular no está en Google Fonts: se carga solo en estas rutas. */
export const useEuclidFont = () => {
  useEffect(() => {
    const id = 'euclid-circular-font';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.cdnfonts.com/css/euclid-circular-a';
    document.head.appendChild(link);
  }, []);
};

/* Estilos de la cápsula: fuerza la tipografía dentro de `.bp-scope`
   (el preflight de Tailwind aplica Geist Mono al body). */
export const LandingStyles: React.FC = () => (
  <style>{`
    .bp-scope, .bp-scope * { font-family: ${FONT}; }
    .bp-scope ::selection { background: ${YELLOW}; color: #1a1500; }
    @keyframes bpGlow {
      0%,100% { opacity: .55; transform: scale(1); }
      50%     { opacity: .85; transform: scale(1.06); }
    }
    .bp-glow { animation: bpGlow 7s ease-in-out infinite; }
    @keyframes bpUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .bp-up { animation: bpUp .5s ease-out both; }
  `}</style>
);

/* ─── Etiqueta de sección ─── */
export const Eyebrow: React.FC<{
  children: React.ReactNode;
  color?: string;
  bg?: string;
  border?: string;
}> = ({ children, color = TEXT_MED, bg = BG_WARM, border = BORDER }) => (
  <div
    className="inline-flex items-center gap-2 rounded-full"
    style={{ backgroundColor: bg, border: `1px solid ${border}`, padding: '5px 13px', marginBottom: 18 }}
  >
    <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color }}>
      {children}
    </span>
  </div>
);

export const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2
    style={{
      fontWeight: 600,
      fontSize: 'clamp(1.55rem, 3vw, 2.1rem)',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      color: TEXT,
      marginBottom: 18,
    }}
  >
    {children}
  </h2>
);

export const P: React.FC<{ children: React.ReactNode; dim?: boolean }> = ({ children, dim }) => (
  <p style={{ color: dim ? TEXT_DIM : TEXT_MED, fontSize: 16, lineHeight: 1.8, marginBottom: 12 }}>{children}</p>
);

/* Fila con icono ✓ / ✕ / › */
export const Row: React.FC<{ kind: 'yes' | 'no' | 'point'; children: React.ReactNode }> = ({ kind, children }) => {
  const map = {
    yes:   { bg: '#eefbf2', bd: '#c3ecd1', fg: GREEN,     icon: <Check size={11} strokeWidth={3.2} /> },
    no:    { bg: '#fef1f1', bd: '#fbcfcf', fg: '#e0463f', icon: <X size={11} strokeWidth={3.2} /> },
    point: { bg: '#fff7e8', bd: '#fbe3b0', fg: '#c98200', icon: <ChevronRight size={11} strokeWidth={3.2} /> },
  }[kind];

  return (
    <div className="flex items-start gap-3" style={{ padding: '9px 0' }}>
      <span
        style={{
          width: 20, height: 20, borderRadius: 7, flexShrink: 0, marginTop: 1,
          backgroundColor: map.bg, border: `1px solid ${map.bd}`, color: map.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {map.icon}
      </span>
      <span style={{ color: TEXT_MED, fontSize: 15.5, lineHeight: 1.6 }}>{children}</span>
    </div>
  );
};

/* ─── CTA (amarillo por defecto) ─── */
export const Cta: React.FC<{
  label: string;
  to?: string;          // ruta interna (react-router)
  href?: string;        // ancla o enlace externo
  full?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'yellow' | 'ink';
}> = ({ label, to, href = '#comprar', full, size = 'md', variant = 'yellow' }) => {
  const pad = size === 'lg' ? '17px 30px' : size === 'sm' ? '9px 18px' : '14px 26px';
  const fs  = size === 'lg' ? 16.5 : size === 'sm' ? 13.5 : 15;
  const ink = variant === 'ink';

  const style: React.CSSProperties = {
    display: full ? 'flex' : 'inline-flex',
    width: full ? '100%' : undefined,
    alignItems: 'center', justifyContent: 'center', gap: 9,
    backgroundColor: ink ? BG_INK : YELLOW,
    color: ink ? '#ffffff' : '#1a1500',
    fontWeight: 600, fontSize: fs, padding: pad, borderRadius: 12,
    textDecoration: 'none', whiteSpace: 'nowrap',
  };

  const content = (
    <>
      {label}
      <ArrowRight size={size === 'sm' ? 14 : 16} />
    </>
  );

  if (to) {
    return <Link to={to} style={style}>{content}</Link>;
  }

  // Los enlaces externos (checkout de Hotmart, etc.) se abren en otra pestaña.
  const external = /^https?:\/\//.test(href);

  return (
    <a
      href={href}
      style={style}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </a>
  );
};

/* Card con hover sutil (usada en las rejillas de categorías) */
export const HoverCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 16,
      padding: '20px 20px 18px', transition: 'transform .15s, box-shadow .15s, border-color .15s',
      ...style,
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = 'translateY(-2px)';
      el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.06)';
      el.style.borderColor = '#d8d8d2';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = 'none';
      el.style.borderColor = BORDER;
    }}
  >
    {children}
  </div>
);
