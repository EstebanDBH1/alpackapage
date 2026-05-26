import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import PromptGrid from '../components/PromptGrid';
import Faq from '../components/Faq';
import Testimonials from '../components/Testimonials';
import PricingCard from '../components/PricingCard';
import StickyFeatureTour from '../components/StickyFeatureTour';
import { ArrowRight, Check, X, Copy, Shield, Zap, TrendingUp } from 'lucide-react';

/* ─── Fade-in utility ───────────────────────────────────────────── */
const useInView = (threshold = 0.12) => {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, v] as const;
};

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; from?: 'up' | 'left' }> = ({ children, delay = 0, from = 'up' }) => {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'none' : from === 'up' ? 'translateY(20px)' : 'translateX(-20px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

/* ─── Large Feature Block ───────────────────────────────────────── */
const LargeFeature: React.FC<{
  label: string; headline: React.ReactNode; body: string;
  points: string[]; bg: string; border: string;
  accentColor: string; accentBg: string; accentBorder: string;
  visual: React.ReactNode; reverse?: boolean;
}> = ({ label, headline, body, points, bg, border, accentColor, accentBg, accentBorder, visual, reverse }) => {
  const [ref, v] = useInView(0.08);
  return (
    <section style={{ backgroundColor: bg, borderTop: `1px solid ${border}` }}>
      <div
        ref={ref}
        style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 32px' }}
      >
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${reverse ? 'lg:[direction:rtl]' : ''}`}
        >
          {/* Text */}
          <div style={{ direction: 'ltr' }}>
            <div style={{
              opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(18px)',
              transition: 'opacity 0.7s ease 0ms, transform 0.7s ease 0ms',
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 100, padding: '4px 12px', marginBottom: 18 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accentColor }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
              </div>
              <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)', color: '#1a1a1a', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 18 }}>
                {headline}
              </h2>
              <p style={{ color: '#787774', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>{body}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {points.map((pt, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(10px)',
                    transition: `opacity 0.6s ease ${120 + i * 80}ms, transform 0.6s ease ${120 + i * 80}ms`,
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: accentBg, border: `1px solid ${accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Check size={9} style={{ color: accentColor }} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 14, color: '#787774', lineHeight: 1.6 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visual */}
          <div style={{
            direction: 'ltr',
            opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s',
          }}>
            {visual}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Prompt engineering visual ────────────────────────────────── */
const PromptStructureVisual: React.FC = () => (
  <div style={{ backgroundColor: '#1a1a1a', borderRadius: 18, overflow: 'hidden', border: '1px solid #2d2d2d', boxShadow: '0 24px 64px rgba(0,0,0,0.14)' }}>
    <div style={{ backgroundColor: '#111', padding: '11px 16px', borderBottom: '1px solid #2d2d2d', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {['#ff6b6b', '#ffd93d', '#6bcb77'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c }} />)}
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>prompt_structure.md</span>
    </div>
    <div style={{ padding: '20px 28px', fontFamily: 'monospace', fontSize: 11, lineHeight: 1.7, color: 'rgba(255,255,255,0.4)', overflow: 'hidden' }}>
      {[
        { text: '# ROL', color: '#a78bfa', bold: true },
        { text: 'Eres director creativo de una agencia de marketing de', color: 'rgba(255,255,255,0.5)' },
        { text: 'performance con 10 años en SaaS B2B. Has lanzado 40+', color: 'rgba(255,255,255,0.5)' },
        { text: 'productos en LATAM con resultados desde el primer mes.', color: 'rgba(255,255,255,0.5)' },
        { text: '' },
        { text: '# OBJETIVO', color: '#a78bfa', bold: true },
        { text: 'Diseña una campana de lanzamiento de 30 dias: estrategia', color: 'rgba(255,255,255,0.5)' },
        { text: 'de contenido, 5 emails en secuencia, plan de paid media', color: 'rgba(255,255,255,0.5)' },
        { text: 'y calendario editorial con acciones diarias por fase.', color: 'rgba(255,255,255,0.5)' },
        { text: '' },
        { text: '# CONTEXTO', color: '#a78bfa', bold: true },
        { text: 'Producto: SaaS B2B de productividad  Budget: .000/mes', color: 'rgba(255,255,255,0.5)' },
        { text: 'Publico: founders y equipos de 10-50 personas', color: 'rgba(255,255,255,0.5)' },
        { text: 'Canales: LinkedIn + email + Google Ads', color: 'rgba(255,255,255,0.5)' },
        { text: 'Competencia directa: Notion, Monday, Asana', color: 'rgba(255,255,255,0.5)' },
        { text: '' },
        { text: '# FORMATO DE RESPUESTA', color: '#a78bfa', bold: true },
        { text: 'Divide en 4 fases semanales (awareness a conversion).', color: 'rgba(255,255,255,0.5)' },
        { text: 'Por fase: objetivo, acciones diarias, KPIs y checklist.', color: 'rgba(255,255,255,0.5)' },
        { text: 'Incluye tabla de contenido y secuencia de emails completa.', color: 'rgba(255,255,255,0.5)' },
        { text: '' },
        { text: '# RESTRICCIONES', color: '#a78bfa', bold: true },
        { text: 'Sin tacticas agresivas  Enfoque en educacion y confianza', color: 'rgba(255,255,255,0.5)' },
        { text: 'KPIs clave: CAC, trial starts, MRR semana 1 y mes 1', color: 'rgba(255,255,255,0.5)' },
      ].map((line, i) => (
        <div key={i} style={{ color: line.color || 'rgba(255,255,255,0.5)', fontWeight: line.bold ? 700 : 400, marginBottom: 0 }}>
          {line.text || ' '}
        </div>
      ))}
    </div>
    <div style={{ padding: '12px 28px', borderTop: '1px solid #2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#22c55e' }} />
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>99.2% éxito en 1ª respuesta</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#000', border: '1px solid #333', borderRadius: 7, padding: '5px 12px' }}>
        <Copy size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>copiar</span>
      </div>
    </div>
  </div>
);

/* ─── Updates visual ────────────────────────────────────────────── */
const UpdatesVisual: React.FC = () => (
  <div style={{ backgroundColor: '#ffffff', borderRadius: 18, border: '1px solid #e4e4e1', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.07)' }}>
    <div style={{ padding: '18px 22px', borderBottom: '1px solid #e4e4e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Nuevos esta semana</div>
        <div style={{ fontSize: 11, color: '#787774' }}>Actualización · semana 24</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '4px 10px' }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#22c55e' }} className="animate-pulse" />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a' }}>6 prompts nuevos</span>
      </div>
    </div>
    {[
      { title: 'Agente de prospección B2B en LinkedIn: mensaje + seguimiento en 3 pasos', cat: '💰 Ventas', badge: 'nuevo', badgeBg: '#faf5ff', badgeColor: '#a855f7' },
      { title: 'Newsletter semanal con gancho, historia y CTA en menos de 600 palabras', cat: '📧 Email', badge: 'nuevo', badgeBg: '#faf5ff', badgeColor: '#a855f7' },
      { title: 'Análisis de competidores con matriz de diferenciación y posicionamiento', cat: '♟️ Estrategia', badge: 'nuevo', badgeBg: '#faf5ff', badgeColor: '#a855f7' },
      { title: 'Propuesta de consultoría premium de $5k+ con estructura de alto cierre', cat: '💼 Negocios', badge: 'popular', badgeBg: '#fff7ed', badgeColor: '#f97316' },
      { title: 'Sistema de onboarding en 7 días para reducir churn en el primer mes', cat: '⚡ Productividad', badge: 'popular', badgeBg: '#fff7ed', badgeColor: '#f97316' },
    ].map((item, i) => (
      <div key={i} style={{ padding: '13px 22px', borderBottom: '1px solid #f0efec', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 3 }}>{item.title}</div>
          <div style={{ fontSize: 10, color: '#a8a5a1' }}>{item.cat}</div>
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: item.badgeColor, backgroundColor: item.badgeBg, borderRadius: 4, padding: '2px 7px', flexShrink: 0 }}>{item.badge}</span>
      </div>
    ))}
    <div style={{ padding: '14px 22px', backgroundColor: '#fafaf8', display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>Ver todos los nuevos prompts →</span>
    </div>
  </div>
);

/* ─── Blob for the dark CTA ────────────────────────────────────── */
const DarkBlob: React.FC<{ color: string; size: number; x: string; y: string; op?: number }> = ({ color, size, x, y, op = 0.18 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: color, filter: `blur(${size * 0.48}px)`, opacity: op, pointerEvents: 'none' }} />
);

/* ─── Home ──────────────────────────────────────────────────────── */
const Home: React.FC = () => {
  return (
    <div className="w-full">

      {/* 1. HERO */}
      <Hero />

      {/* 2. COMPATIBLE CON (slim bar) */}
      <div style={{ backgroundColor: '#f7f6f3', borderTop: '1px solid #e4e4e1', borderBottom: '1px solid #e4e4e1', padding: '14px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a8a5a1', marginRight: 8 }}>compatible con</span>
          {['ChatGPT', 'Claude', 'Gemini', 'Mistral', 'Copilot', 'Perplexity', 'Grok'].map(name => (
            <span key={name} style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', padding: '2px 10px', backgroundColor: 'white', border: '1px solid #e4e4e1', borderRadius: 6 }}>{name}</span>
          ))}
        </div>
      </div>

      {/* 3. PROBLEMA */}
      <section style={{ backgroundColor: 'white', borderBottom: '1px solid #e4e4e1' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '88px 32px' }}>

          <FadeIn>
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#fff3f3', border: '1px solid #fecaca', borderRadius: 100, padding: '4px 12px', marginBottom: 18 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>el problema</span>
              </div>
              <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)', color: '#1a1a1a', letterSpacing: '-0.025em', lineHeight: 1.15, maxWidth: 560 }}>
                El 90% usa la IA a diario y sigue obteniendo resultados mediocres.
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
            {[
              { input: '"escribe un email de ventas"', output: 'Texto genérico que nadie va a leer.', delay: 0 },
              { input: '"dame una estrategia de marketing"', output: 'Una lista de 5 puntos obvios que ya conocías.', delay: 80 },
              { input: '"ayúdame con mis redes sociales"', output: '3 reescrituras después, sigues sin el contenido.', delay: 160 },
            ].map((item, i) => (
              <FadeIn key={i} delay={item.delay}>
                <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e4e4e1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ padding: '12px 16px', backgroundColor: '#f7f6f3', borderBottom: '1px solid #e4e4e1', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#a8a5a1', flexShrink: 0, marginTop: 2 }}>prompt</span>
                    <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#1a1a1a', lineHeight: 1.4 }}>{item.input}</p>
                  </div>
                  <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 8, backgroundColor: 'white' }}>
                    <div style={{ width: 15, height: 15, borderRadius: '50%', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <X size={7} style={{ color: '#ef4444' }} strokeWidth={3} />
                    </div>
                    <p style={{ fontSize: 13, color: '#787774', lineHeight: 1.55 }}>{item.output}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={200}>
            <div style={{ backgroundColor: '#f0f0ff', border: '1px solid #c7d2fe', borderRadius: 16, padding: '22px 26px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 4 }}>No es la IA. Son los prompts.</p>
                <p style={{ fontSize: 14, color: '#787774', lineHeight: 1.7 }}>
                  Con la estructura correcta, ChatGPT, Claude y Gemini entregan resultados profesionales en la <strong style={{ color: '#6366f1' }}>primera respuesta</strong>.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {['contexto claro', 'formato definido', 'rol asignado'].map(tag => (
                  <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={8} style={{ color: '#6366f1' }} strokeWidth={3} />
                    </div>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

        </div>
      </section>

      {/* 4. PROMPT MARQUEE */}
      <PromptGrid />

      {/* 5. STICKY FEATURE TOUR ← EL ELEMENTO NOTION */}
      <StickyFeatureTour />

      {/* 6. LARGE FEATURE A — Ingeniería de prompts */}
      <LargeFeature
        label="Ingeniería de prompts"
        headline={<>No son prompts simples.<br />Son <span style={{ background: 'linear-gradient(135deg,#667eea,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>estructuras de ingeniería.</span></>}
        body="Cada prompt incluye contexto, rol, objetivo y formato de respuesta. La IA recibe instrucciones completas y entrega resultados profesionales desde el primer intento. Sin iteraciones."
        points={[
          'Estructura con rol, contexto, objetivo y formato definido',
          'Probado exhaustivamente en GPT-5 y modelos de razonamiento',
          '99.2% de éxito en la primera respuesta, sin reescrituras',
        ]}
        bg="#fafaf8"
        border="#e4e4e1"
        accentColor="#6366f1"
        accentBg="#f0f0ff"
        accentBorder="#c7d2fe"
        visual={<PromptStructureVisual />}
      />

      {/* 7. LARGE FEATURE B — Actualizaciones semanales */}
      <LargeFeature
        label="siempre actualizado"
        headline={<>Cada semana, prompts nuevos.<br />Sin costo adicional.</>}
        body="El mercado de la IA cambia cada semana. Nosotros también. Añadimos prompts optimizados para los nuevos modelos y casos de uso que van surgiendo, sin que pagues ni un centavo más."
        points={[
          'Actualizaciones semanales garantizadas, en tu plan actual',
          'Prompts para los últimos modelos: GPT-5, Claude 3.7, Gemini...',
          'Sugerencias de la comunidad → prompts nuevos en 7 días',
        ]}
        bg="#ffffff"
        border="#e4e4e1"
        accentColor="#22c55e"
        accentBg="#f0fdf4"
        accentBorder="#bbf7d0"
        visual={<UpdatesVisual />}
        reverse
      />

      {/* 8. TESTIMONIALS */}
      <Testimonials />

      {/* 9. PRICING */}
      <PricingCard />

      {/* 10. FAQ */}
      <Faq />

      {/* 11. DARK CTA */}
      <section style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <DarkBlob color="radial-gradient(circle, #667eea, #764ba2)" size={600} x="-100px" y="-150px" op={0.2} />
          <DarkBlob color="radial-gradient(circle, #f093fb, #f5576c)" size={440} x="65%" y="30%" op={0.14} />
          <DarkBlob color="radial-gradient(circle, #4facfe, #00f2fe)" size={300} x="40%" y="60%" op={0.08} />
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 1 }}>
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-14 items-center" style={{ padding: '96px 0' }}>

            {/* Left */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '4px 14px', marginBottom: 22 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} className="animate-pulse" />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>precio de lanzamiento</span>
              </div>

              <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 18 }}>
                Cada semana sin los prompts correctos son horas que{' '}
                <span style={{ background: 'linear-gradient(135deg, #a78bfa, #f0abfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  no recuperas.
                </span>
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 6, maxWidth: 400, color: 'rgba(255,255,255,0.3)' }}>
                Mientras sigues reescribiendo prompts que no funcionan, otros obtienen los resultados que tú quieres.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 36, maxWidth: 400, color: 'rgba(255,255,255,0.45)' }}>
                $4 al mes es menos de lo que pierdes en una hora improductiva con la IA.
              </p>

              <Link to="/pricing">
                <button
                  className="group inline-flex items-center gap-2.5 font-semibold text-sm transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: '#ffffff', color: '#1a1a1a', padding: '15px 32px', borderRadius: 12, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  Quiero acceso ahora
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.12)', marginTop: 14 }}>
                acceso instantáneo · sin contrato · cancela cuando quieras
              </p>
            </div>

            {/* Right card */}
            <div style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>lo que obtienes desde el primer día</p>
              </div>
              <div style={{ padding: '20px 24px', backgroundColor: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: <Zap size={13} style={{ color: '#a78bfa' }} />, text: 'Emails de ventas que convierten de verdad' },
                  { icon: <TrendingUp size={13} style={{ color: '#a78bfa' }} />, text: 'Estrategias de marketing con profundidad real' },
                  { icon: <Check size={13} style={{ color: '#a78bfa' }} />, text: 'Campañas de 30 días listas en 30 minutos' },
                  { icon: <Shield size={13} style={{ color: '#a78bfa' }} />, text: 'Propuestas de consultoría que cierran negocios' },
                  { icon: <Copy size={13} style={{ color: '#a78bfa' }} />, text: 'Contenido para redes sin bloqueo creativo' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>todo esto por</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800, fontSize: 32, color: 'white' }}>$4</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>/mes</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
