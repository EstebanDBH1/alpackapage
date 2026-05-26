import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Lock, Star, Sparkles, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── Parallax blob ─────────────────────────────────────────────── */
const Blob: React.FC<{ color: string; size: number; x: string; y: string; opacity?: number; speed?: number }> = ({
  color, size, x, y, opacity = 0.42, speed = 0.3,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const scrollY = window.scrollY;
      ref.current.style.transform = `translateY(${scrollY * speed}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', left: x, top: y,
        width: size, height: size, borderRadius: '50%',
        background: color,
        filter: `blur(${size * 0.48}px)`,
        opacity, pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  );
};

/* ─── Product mockup (browser window) ──────────────────────────── */
const ProductMockup: React.FC = () => (
  <div style={{
    backgroundColor: '#ffffff',
    borderRadius: '16px 16px 0 0',
    border: '1px solid #e4e4e1',
    borderBottom: 'none',
    boxShadow: '0 -4px 0 #e4e4e1, 0 40px 100px rgba(0,0,0,0.13)',
    overflow: 'hidden',
  }}>
    {/* Window bar */}
    <div style={{ backgroundColor: '#f7f6f3', padding: '11px 16px', borderBottom: '1px solid #e4e4e1', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {['#ff6b6b', '#ffd93d', '#6bcb77'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c }} />)}
      </div>
      <div style={{ flex: 1, maxWidth: 260, margin: '0 auto', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 6, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 10, color: '#a8a5a1', fontFamily: 'monospace' }}>alpacka.ai/prompts</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: 0.5 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#22c55e' }} />
        <span style={{ fontSize: 9, color: '#787774', fontFamily: 'monospace' }}>live</span>
      </div>
    </div>

    {/* App layout */}
    <div style={{ display: 'flex', height: 360 }}>
      {/* Sidebar */}
      <div style={{ width: 168, borderRight: '1px solid #e4e4e1', padding: '16px 12px', backgroundColor: '#fafaf8', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#c4c2bf', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Biblioteca</div>
        {[
          { icon: '⚡', label: 'Productividad', count: 42, active: true },
          { icon: '📣', label: 'Marketing', count: 38 },
          { icon: '✍️', label: 'Copywriting', count: 35 },
          { icon: '💼', label: 'Negocios', count: 29 },
          { icon: '🎨', label: 'Contenido', count: 27 },
          { icon: '📧', label: 'Email', count: 22 },
          { icon: '🤖', label: 'Técnicos', count: 18 },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '5px 8px', borderRadius: 6, marginBottom: 2,
            backgroundColor: item.active ? '#f0f0ff' : 'transparent',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11 }}>{item.icon}</span>
              <span style={{ fontSize: 11, color: item.active ? '#6366f1' : '#787774', fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
            </div>
            <span style={{ fontSize: 9, color: '#c4c2bf', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, padding: '1px 4px' }}>{item.count}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '16px 20px', overflow: 'hidden' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#f7f6f3', border: '1px solid #e4e4e1', borderRadius: 9, padding: '7px 12px', marginBottom: 14 }}>
          <Search size={12} style={{ color: '#a8a5a1' }} />
          <span style={{ fontSize: 12, color: '#c4c2bf' }}>Buscar en 150+ prompts...</span>
          <span style={{ marginLeft: 'auto', fontSize: 9, color: '#c4c2bf', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace' }}>⌘K</span>
        </div>
        {/* Section title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>⚡ Productividad</span>
          <span style={{ fontSize: 10, color: '#a8a5a1', backgroundColor: '#f0f0ee', borderRadius: 4, padding: '2px 7px' }}>42 prompts</span>
        </div>
        {/* Prompt cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { title: 'Planificador semanal Deep Work con bloques de 90 min y revisión diaria', cat: 'Productividad', premium: true, highlighted: true },
            { title: 'Resumen ejecutivo de reunión con decisiones, acuerdos y próximos pasos', cat: 'Productividad', premium: true },
            { title: 'Email de seguimiento post-demo que cierra sin presionar', cat: 'Copywriting', premium: true },
            { title: 'Estrategia de contenido 30 días con calendario editorial y KPIs', cat: 'Marketing', premium: true },
            { title: 'Análisis FODA completo con plan de acción por cada cuadrante', cat: 'Estrategia', premium: false },
            { title: 'Propuesta de valor B2B diferenciada para cliente de alto ticket', cat: 'Ventas', premium: true },
          ].map((card, i) => (
            <div key={i} style={{
              padding: '12px 14px', borderRadius: 11,
              border: card.highlighted ? '1.5px solid #a78bfa' : '1px solid #e4e4e1',
              backgroundColor: card.highlighted ? '#faf5ff' : 'white',
              boxShadow: card.highlighted ? '0 4px 14px rgba(167,139,250,0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
            }}>
              <div style={{ fontSize: 9, color: '#a8a5a1', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.cat}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3, marginBottom: 8 }}>{card.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {card.premium && (
                  <span style={{ fontSize: 8, color: '#a78bfa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Lock size={7} /> premium
                  </span>
                )}
                <span style={{ fontSize: 9, color: '#6366f1', fontWeight: 700, marginLeft: 'auto' }}>ver →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ─── Fade-in hook ──────────────────────────────────────────────── */
const useInView = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible] as const;
};

/* ─── Hero ──────────────────────────────────────────────────────── */
const Hero: React.FC = () => {
  const [statsRef, statsVisible] = useInView();

  return (
    <section style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#ffffff' }}>
      {/* Gradient blobs (with parallax) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Blob color="radial-gradient(circle, #fbc7d4, #9796f0)" size={480} x="-60px" y="-80px" speed={0.15} />
        <Blob color="radial-gradient(circle, #a8edea, #fed6e3)" size={380} x="60%" y="0px" opacity={0.32} speed={0.08} />
        <Blob color="radial-gradient(circle, #ffecd2, #fcb69f)" size={320} x="38%" y="30%" opacity={0.2} speed={0.12} />
      </div>

      {/* ── Main content ── */}
      <div className="relative" style={{ zIndex: 1, paddingTop: 80, paddingBottom: 0 }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 28,
            backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid #e4e4e1',
            borderRadius: 100, padding: '6px 16px',
            backdropFilter: 'blur(12px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={9} className="fill-amber-400 text-amber-400" />)}
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#787774' }}>
              +500 usuarios activos · precio de lanzamiento
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ marginBottom: 22, letterSpacing: '-0.03em' }}>
            <span
              className="block font-display font-bold"
              style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5rem)', lineHeight: 1.07, color: '#1a1a1a' }}
            >
              La IA que tienes es buena.
            </span>
            <span
              className="block font-display font-bold"
              style={{
                fontSize: 'clamp(2.6rem, 6.5vw, 5rem)', lineHeight: 1.07,
                background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              Tus prompts, no.
            </span>
          </h1>

          {/* Subtext */}
          <p style={{ color: '#787774', fontSize: 'clamp(15px, 1.6vw, 18px)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 36px' }}>
            <strong style={{ color: '#1a1a1a', fontWeight: 600 }}>150+ estructuras probadas</strong> que hacen que ChatGPT, Claude y Gemini entreguen resultados profesionales en la primera respuesta. Sin iteraciones.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} className="sm:flex-row sm:justify-center">
            <Link to="/pricing">
              <button
                className="group inline-flex items-center gap-2.5 font-semibold text-sm transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: '#000', color: 'white', padding: '15px 32px', borderRadius: 12, fontSize: 15, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#222')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#000')}
              >
                <Sparkles size={14} style={{ color: 'rgba(255,220,160,0.9)' }} />
                Quiero acceso — $4/mes
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <Link to="/prompts">
              <button
                className="inline-flex items-center gap-2 font-semibold text-sm transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#1a1a1a', padding: '15px 28px', borderRadius: 12, fontSize: 15, border: '1px solid #e4e4e1', cursor: 'pointer', backdropFilter: 'blur(8px)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#a78bfa')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e4e4e1')}
              >
                Ver los 150+ prompts
                <Lock size={12} style={{ color: '#a8a5a1' }} />
              </button>
            </Link>
          </div>

          {/* Trust line */}
          <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#c4c2bf', letterSpacing: '0.1em', marginTop: 16 }}>
            acceso instantáneo · sin contrato · cancela cuando quieras
          </p>
        </div>

        {/* Stats shelf */}
        <div
          ref={statsRef}
          style={{
            maxWidth: 780, margin: '40px auto 0', padding: '0 24px',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 24,
            opacity: statsVisible ? 1 : 0,
            transform: statsVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
          }}
        >
          {[
            { value: '150+', label: 'prompts curados' },
            { value: '$4', label: 'por mes' },
            { value: '99%', label: 'éxito en 1ª resp.' },
            { value: '3', label: 'IAs compatibles' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 22, color: '#1a1a1a', letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#a8a5a1', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Product mockup — floating into the next section */}
        <div style={{ maxWidth: 1100, margin: '56px auto 0', padding: '0 24px 0' }}>
          <ProductMockup />
        </div>
      </div>
    </section>
  );
};

export default Hero;
