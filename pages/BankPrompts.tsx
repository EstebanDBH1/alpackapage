import React, { useEffect, useState } from 'react';
import {
  Check, Zap, Shield, Mail, Lock, ArrowRight, Copy,
  Star, Clock, LayoutGrid, Search, RefreshCw, Infinity as InfinityIcon,
} from 'lucide-react';
import AlpacaIcon from '../components/AlpacaIcon';
import {
  BG, BG_WARM, BG_INK, TEXT, TEXT_MED, TEXT_DIM, BORDER, ACCENT, YELLOW, GREEN, FONT,
  useEuclidFont, LandingStyles, Eyebrow, H2, P, Row, Cta, HoverCard,
} from '../components/landingKit';

/* ══════════════════════════════════════════════════════════════
   /bank-prompts — Landing autocontenida (ajena a la app).
   No usa la Navbar/Footer ni la tipografía global: trae su propio
   header, footer y tipografía (Euclid Circular).
   ══════════════════════════════════════════════════════════════ */

/* ⚠️ TODO: reemplazar por el enlace real de pago (Hotmart/Stripe/…) */
const BUY_URL = '#comprar';

/* ─── Botón de compra (usa el CTA del kit con la URL de pago) ─── */
const BuyButton: React.FC<{ full?: boolean; label?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  full, label = 'Obtenerlo ahora', size = 'md',
}) => <Cta href={BUY_URL} label={label} full={full} size={size} />;

/* ─── Categorías del pack ─── */
const categorias = [
  { emoji: '💼', title: 'Negocios y emprendimiento', desc: 'Crea ofertas, analiza a tus competidores, encuentra fuentes de ingresos.' },
  { emoji: '🎬', title: 'Creación de contenido',     desc: 'Ganchos virales, guiones de video, descripciones, hilos, ideas ilimitadas.' },
  { emoji: '✍️', title: 'Ventas y copywriting',      desc: 'Páginas de venta, correos de seguimiento, argumentarios, embudos de conversión.' },
  { emoji: '⚡', title: 'Productividad y organización', desc: 'Planificación, rutinas, gestión del tiempo, toma de decisiones.' },
  { emoji: '🧠', title: 'Aprendizaje acelerado',     desc: 'Domina cualquier habilidad 3x más rápido.' },
  { emoji: '💰', title: 'Finanzas personales',       desc: 'Presupuesto, ahorro, inversión, fuentes de ingresos pasivos.' },
  { emoji: '📱', title: 'Redes sociales',            desc: 'Estrategias de crecimiento, formatos virales, calendarios de contenido.' },
  { emoji: '🎯', title: 'Vida profesional',          desc: 'Redacta tu CV, prepara tus entrevistas, negocia tu salario, evoluciona más rápido en tu carrera.' },
];

const BankPrompts: React.FC = () => {
  const [showBar, setShowBar] = useState(false);

  useEuclidFont();

  /* Barra de compra fija en móvil a partir del primer scroll */
  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 520);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bp-scope" style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: FONT }}>
      <LandingStyles />

      {/* ══════════ HEADER ══════════ */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50, height: 60,
          backgroundColor: 'rgba(255,255,255,0.86)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 w-full flex items-center justify-between">
          <div className="flex items-center">
            <AlpacaIcon className="h-7 w-auto" />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline" style={{ fontSize: 13, color: TEXT_DIM, textDecoration: 'line-through' }}>29$</span>
            <BuyButton size="sm" label="Obtenerlo — 11$" />
          </div>
        </div>
      </header>

      {/* ══════════ PRODUCTO: 2 columnas ══════════ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 pb-20 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 lg:gap-12 items-start">

          {/* ───── Columna izquierda ───── */}
          <div>

            {/* Título + chips */}
            <div className="bp-up">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full"
                  style={{ backgroundColor: '#fff7e8', border: '1px solid #fbe3b0', padding: '4px 11px', fontSize: 11.5, fontWeight: 600, color: '#a86a00' }}
                >
                  <Star size={11} fill="#f0a500" strokeWidth={0} /> Pack en Notion
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full"
                  style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, padding: '4px 11px', fontSize: 11.5, fontWeight: 500, color: TEXT_MED }}
                >
                  <InfinityIcon size={11} /> Actualizaciones de por vida
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full"
                  style={{ backgroundColor: '#eefbf2', border: '1px solid #c3ecd1', padding: '4px 11px', fontSize: 11.5, fontWeight: 600, color: GREEN }}
                >
                  <Shield size={11} /> Garantía 7 días
                </span>
              </div>

              <h1
                style={{
                  fontWeight: 600,
                  fontSize: 'clamp(1.9rem, 4.2vw, 3rem)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.035em',
                  marginBottom: 14,
                }}
              >
                La IA no es mágica.{' '}
                <span style={{ color: ACCENT }}>Tu prompt sí lo es.</span> 🧠
              </h1>

              <p style={{ color: TEXT_MED, fontSize: 'clamp(15.5px, 1.7vw, 18px)', lineHeight: 1.7, maxWidth: 620 }}>
                <strong style={{ color: TEXT, fontWeight: 600 }}>+500 prompts</strong> probados y listos para copiar y pegar
                para obtener resultados profesionales con ChatGPT y Claude. A partir de hoy.
              </p>
              <p style={{ color: TEXT_DIM, fontSize: 14.5, lineHeight: 1.7, marginTop: 12, maxWidth: 620 }}>
                Todo dentro de un Notion organizado, con actualizaciones de por vida por un solo pago.
              </p>
            </div>

            {/* Banner del producto */}
            <div
              className="relative mt-8 overflow-hidden"
              style={{
                borderRadius: 20,
                border: `1px solid ${BORDER}`,
                background: 'linear-gradient(135deg, #07080d 0%, #101528 55%, #0b0d16 100%)',
                boxShadow: '0 22px 60px rgba(10,12,25,0.28)',
              }}
            >
              <div
                className="bp-glow"
                style={{
                  position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
                  width: 620, height: 420, pointerEvents: 'none',
                  background: 'radial-gradient(circle, rgba(88,160,255,0.55), rgba(88,160,255,0) 62%)',
                  filter: 'blur(30px)',
                }}
              />
              <div
                style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35,
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
                  backgroundSize: '46px 46px',
                  maskImage: 'radial-gradient(circle at 50% 40%, #000 30%, transparent 78%)',
                  WebkitMaskImage: 'radial-gradient(circle at 50% 40%, #000 30%, transparent 78%)',
                }}
              />
              <div className="relative text-center px-6 py-14 sm:py-20">
                <p style={{ fontSize: 11, letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', marginBottom: 16 }}>
                  Notion · ChatGPT · Claude · Gemini
                </p>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: 'clamp(1.9rem, 5.2vw, 3.4rem)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.05,
                    color: '#ffffff',
                    marginBottom: 18,
                  }}
                >
                  PACK DE <span style={{ color: YELLOW }}>500</span> PROMPTS
                </p>
                <p style={{ fontSize: 'clamp(13.5px, 1.9vw, 17px)', color: 'rgba(255,255,255,0.62)' }}>
                  La IA no es <span style={{ color: '#8ab6ff' }}>mágica</span>. Tu prompt <span style={{ color: YELLOW }}>sí lo es</span>.
                </p>
              </div>
            </div>

            {/* Entrega */}
            <div
              className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3"
              style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 18px' }}
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid size={16} style={{ color: TEXT_MED }} />
                <span style={{ fontSize: 13.5, fontWeight: 500, color: TEXT }}>+500 prompts organizados en Notion</span>
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: 13, color: TEXT_DIM }}>
                <Mail size={14} /> Recibes el enlace por correo, al instante
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: 13, color: TEXT_DIM }}>
                <InfinityIcon size={14} /> Un pago · actualizaciones para siempre
              </div>
            </div>

            {/* ══════════ COPY ══════════ */}
            <div className="mt-14" style={{ maxWidth: 680 }}>

              {/* Intro */}
              <div style={{ borderLeft: `2px solid ${BORDER}`, paddingLeft: 20 }}>
                <P>Llevas meses usando ChatGPT u otras IA.</P>
                <P>Pero tus resultados siguen siendo promedio.</P>
                <P>Las respuestas son planas. Genéricas. Inutilizables.</P>
                <P>Te preguntas por qué los demás obtienen resultados increíbles con la misma IA que tú.</P>
                <P>La respuesta es simple.</P>
                <P>No es la herramienta la que marca la diferencia.</P>
                <p style={{ color: TEXT, fontSize: 17, lineHeight: 1.8, fontWeight: 600 }}>Es lo que le pides.</p>
              </div>

              {/* EL PROBLEMA */}
              <section className="mt-14">
                <Eyebrow color="#e0463f" bg="#fef1f1" border="#fbcfcf">El problema</Eyebrow>
                <H2>El 90% de las personas usan la IA así:</H2>
                <div
                  style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '14px 20px', marginBottom: 22 }}
                >
                  <Row kind="no">"Resume este texto"</Row>
                  <Row kind="no">"Escríbeme un post"</Row>
                  <Row kind="no">"Dame ideas"</Row>
                </div>
                <P>Y obtienen las respuestas que todo el mundo obtiene.</P>
                <P>Banales. Sin valor. Inutilizables.</P>
                <P>El 10% que obtiene resultados extraordinarios hace una sola cosa diferente:</P>
                <p style={{ color: TEXT, fontSize: 17, lineHeight: 1.8, fontWeight: 600 }}>Saben cómo hablarle a la IA.</p>
              </section>

              {/* LA SOLUCIÓN */}
              <section className="mt-14">
                <Eyebrow color={GREEN} bg="#eefbf2" border="#c3ecd1">La solución</Eyebrow>
                <H2>Este pack contiene:</H2>
                <P>
                  <strong style={{ color: TEXT, fontWeight: 600 }}>+500 prompts</strong> organizados, probados y optimizados
                  para que obtengas resultados profesionales cada vez.
                </P>
                <div className="flex flex-wrap items-center gap-2 mt-5">
                  {['Copias.', 'Pegas.', 'Obtienes el resultado.'].map((t, i) => (
                    <React.Fragment key={t}>
                      <span
                        style={{
                          backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 10,
                          padding: '9px 15px', fontSize: 14.5, fontWeight: 600, color: TEXT,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >
                        {t}
                      </span>
                      {i < 2 && <ArrowRight size={14} style={{ color: TEXT_DIM }} />}
                    </React.Fragment>
                  ))}
                </div>
                <p style={{ color: TEXT_DIM, fontSize: 14.5, marginTop: 14 }}>Eso es todo.</p>
              </section>
            </div>

            {/* LO QUE OBTIENES — cards a todo el ancho de la columna */}
            <section className="mt-14">
              <Eyebrow>Lo que obtienes</Eyebrow>
              <H2>📁 +500 prompts organizados por área</H2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
                {categorias.map(c => (
                  <HoverCard key={c.title}>
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span style={{ fontSize: 19, lineHeight: 1 }}>{c.emoji}</span>
                      <span style={{ fontWeight: 600, fontSize: 15.5, color: TEXT, letterSpacing: '-0.01em' }}>{c.title}</span>
                    </div>
                    <p style={{ color: TEXT_MED, fontSize: 14, lineHeight: 1.65 }}>{c.desc}</p>
                  </HoverCard>
                ))}
              </div>
            </section>

            {/* ══════════ CÓMO LO RECIBES (Notion) ══════════ */}
            <section className="mt-14">
              <Eyebrow>Cómo lo recibes</Eyebrow>
              <H2>Un espacio en Notion que crece contigo.</H2>
              <p style={{ color: TEXT_MED, fontSize: 16, lineHeight: 1.8, maxWidth: 680, marginBottom: 26 }}>
                No es un PDF que se queda viejo en tu carpeta de descargas. Es un Notion organizado que puedes duplicar en
                tu propia cuenta, y cada prompt nuevo que añado te llega sin pagar nada más.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    icon: <Search size={19} style={{ color: '#3b82f6' }} />,
                    bg: '#eff6ff', bd: '#cfe0fd',
                    title: 'Encuentra en segundos',
                    desc: 'Filtra por área o busca por palabra clave. Nada de hacer Ctrl+F en un archivo de 50 páginas.',
                  },
                  {
                    icon: <Copy size={19} style={{ color: '#8b5cf6' }} />,
                    bg: '#f7f2ff', bd: '#e2d5fb',
                    title: 'Duplícalo en tu Notion',
                    desc: 'Un clic y el pack queda en tu cuenta. Tuyo, editable, desde el móvil o el ordenador.',
                  },
                  {
                    icon: <RefreshCw size={19} style={{ color: GREEN }} />,
                    bg: '#eefbf2', bd: '#c3ecd1',
                    title: 'Actualizaciones de por vida',
                    desc: 'Prompts nuevos, modelos nuevos, casos nuevos. Se actualiza solo y ya está pagado.',
                  },
                ].map(c => (
                  <div key={c.title} style={{ backgroundColor: c.bg, border: `1px solid ${c.bd}`, borderRadius: 18, padding: '24px 22px' }}>
                    <div
                      style={{
                        width: 42, height: 42, borderRadius: 13, marginBottom: 16,
                        backgroundColor: 'rgba(255,255,255,0.75)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                    >
                      {c.icon}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 15.5, color: TEXT, marginBottom: 7, letterSpacing: '-0.01em' }}>{c.title}</p>
                    <p style={{ color: TEXT_MED, fontSize: 13.5, lineHeight: 1.65 }}>{c.desc}</p>
                  </div>
                ))}
              </div>

              <div
                className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4"
                style={{ backgroundColor: BG_INK, borderRadius: 14, padding: '14px 18px' }}
              >
                <InfinityIcon size={16} style={{ color: YELLOW, flexShrink: 0 }} />
                <span style={{ color: '#fff', fontSize: 14.5, fontWeight: 600 }}>Un solo pago de 11$.</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                  Sin suscripción, sin “versión 2.0” que comprar de nuevo. Todo lo que añada, lo tienes.
                </span>
              </div>
            </section>

            <div style={{ maxWidth: 680 }}>

              {/* PARA QUIÉN ES ESTO */}
              <section className="mt-14">
                <Eyebrow color="#c98200" bg="#fff7e8" border="#fbe3b0">Para quién es esto</Eyebrow>
                <H2>Esto es para ti si…</H2>
                <div style={{ marginTop: -4 }}>
                  <Row kind="point">Creas contenido y quieres producir 10x más rápido.</Row>
                  <Row kind="point">Tienes un negocio y quieres usar la IA como un experto.</Row>
                  <Row kind="point">Vendes productos o servicios y quieres un copywriting profesional.</Row>
                  <Row kind="point">Quieres aprender una nueva habilidad rápidamente.</Row>
                  <Row kind="point">Estás harto de las respuestas mediocres de ChatGPT o cualquier otra IA generativa.</Row>
                </div>
              </section>

              {/* ANTES / DESPUÉS */}
              <section className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div style={{ backgroundColor: '#fefafa', border: '1px solid #f7dede', borderRadius: 18, padding: '24px 22px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#e0463f', marginBottom: 14 }}>
                    Lo que nunca más volverás a hacer
                  </p>
                  <Row kind="no">Pasar horas buscando cómo formularle una pregunta a la IA.</Row>
                  <Row kind="no">Obtener respuestas genéricas sin valor.</Row>
                  <Row kind="no">Reescribir 10 veces el mismo prompt sin resultados.</Row>
                  <Row kind="no">Ver a los demás obtener mejores resultados sin entender por qué.</Row>
                </div>

                <div style={{ backgroundColor: '#f9fdfa', border: '1px solid #d5eede', borderRadius: 18, padding: '24px 22px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: GREEN, marginBottom: 14 }}>
                    Lo que harás en su lugar
                  </p>
                  <Row kind="yes">Abrir este pack.</Row>
                  <Row kind="yes">Copiar el prompt que se adapte a tu necesidad.</Row>
                  <Row kind="yes">Pegarlo en ChatGPT o Claude.</Row>
                  <Row kind="yes">Obtener un resultado profesional en 30 segundos.</Row>
                </div>
              </section>

              {/* YA LO ESTÁN USANDO */}
              <section className="mt-14">
                <Eyebrow>Ya lo están usando</Eyebrow>
                <P>
                  Creadores de contenido, emprendedores y freelancers. Quienes usan la IA para ciertas tareas ya utilizan
                  estos prompts todos los días para ahorrar tiempo y dinero.
                </P>
                <p
                  style={{
                    marginTop: 18, backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 14,
                    padding: '18px 20px', color: TEXT, fontSize: 16, lineHeight: 1.7, fontWeight: 500,
                  }}
                >
                  La pregunta es: ¿vas a seguir usando la IA como todo el mundo o vas a pasar al siguiente nivel?
                </p>
              </section>

              {/* LA OFERTA */}
              <section className="mt-14" id="comprar">
                <Eyebrow color="#c98200" bg="#fff7e8" border="#fbe3b0">La oferta</Eyebrow>

                <div
                  style={{
                    border: `1px solid ${BORDER}`, borderRadius: 22, overflow: 'hidden',
                    boxShadow: '0 14px 44px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ padding: '28px 26px', backgroundColor: BG }}>
                    <div className="flex items-end gap-3 mb-1">
                      <span style={{ fontSize: 17, color: TEXT_DIM, textDecoration: 'line-through' }}>29$</span>
                      <span style={{ fontWeight: 600, fontSize: 46, lineHeight: 1, letterSpacing: '-0.04em', color: TEXT }}>11$</span>
                      <span style={{ fontSize: 14, color: TEXT_MED, paddingBottom: 5 }}>hoy ⚡️</span>
                    </div>
                    <p style={{ color: TEXT_DIM, fontSize: 13.5, marginBottom: 22 }}>
                      Pago único · Pack en Notion · Actualizaciones de por vida
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-5">
                      {[
                        { icon: <Zap size={14} style={{ color: '#c98200' }} />,           t: 'Acceso inmediato tras el pago' },
                        { icon: <Copy size={14} style={{ color: '#3b82f6' }} />,          t: 'Duplícalo en tu Notion en 1 clic' },
                        { icon: <Lock size={14} style={{ color: GREEN }} />,              t: 'Pago 100% seguro' },
                        { icon: <Mail size={14} style={{ color: '#8b5cf6' }} />,          t: 'Entrega instantánea por email' },
                        { icon: <InfinityIcon size={14} style={{ color: '#e0463f' }} />,  t: 'Actualizaciones de por vida' },
                        { icon: <RefreshCw size={14} style={{ color: '#0ea5e9' }} />,     t: 'Sin suscripción: pagas una vez' },
                      ].map(i => (
                        <div key={i.t} className="flex items-center gap-2.5">
                          {i.icon}
                          <span style={{ fontSize: 14, color: TEXT_MED }}>{i.t}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-7">
                      <BuyButton full size="lg" label="Obtener el pack — 11$" />
                    </div>
                  </div>

                  {/* Garantía */}
                  <div style={{ backgroundColor: BG_WARM, borderTop: `1px solid ${BORDER}`, padding: '20px 26px' }}>
                    <div className="flex items-start gap-3">
                      <div
                        style={{
                          width: 34, height: 34, borderRadius: 11, flexShrink: 0,
                          backgroundColor: '#eefbf2', border: '1px solid #c3ecd1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Shield size={16} style={{ color: GREEN }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14.5, color: TEXT, marginBottom: 4 }}>🛡️ Garantía de 7 días</p>
                        <p style={{ color: TEXT_MED, fontSize: 14, lineHeight: 1.65 }}>
                          Si en los próximos 7 días consideras que estos prompts no te han aportado ningún valor, te devuelvo
                          tu dinero. Sin preguntas. Sin discusiones.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* ───── Columna derecha: card de compra sticky ───── */}
          <aside className="hidden lg:block lg:sticky" style={{ top: 84 }}>
            <div
              style={{
                backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 20,
                boxShadow: '0 12px 40px rgba(0,0,0,0.07)', overflow: 'hidden',
              }}
            >
              <div style={{ padding: '24px 22px' }}>
                <div className="flex items-baseline gap-2.5 mb-1">
                  <span style={{ fontSize: 15, color: TEXT_DIM, textDecoration: 'line-through' }}>29$</span>
                  <span style={{ fontWeight: 600, fontSize: 34, lineHeight: 1, letterSpacing: '-0.035em', color: ACCENT }}>11$</span>
                </div>
                <p style={{ color: TEXT_DIM, fontSize: 12.5, marginBottom: 18 }}>Pago único · Notion · Acceso de por vida</p>

                <BuyButton full label="Obtenerlo ahora" />

                <div className="mt-5 space-y-2.5">
                  {[
                    '+500 prompts listos para usar',
                    'Organizados en Notion, duplicable en tu cuenta',
                    '8 áreas: negocio, contenido, ventas…',
                    'Compatible con ChatGPT y Claude',
                    'Actualizaciones de por vida incluidas',
                  ].map(t => (
                    <div key={t} className="flex items-start gap-2.5">
                      <Check size={13} strokeWidth={3} style={{ color: GREEN, flexShrink: 0, marginTop: 3 }} />
                      <span style={{ fontSize: 13.5, color: TEXT_MED, lineHeight: 1.5 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: BG_WARM, padding: '14px 22px' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={13} style={{ color: TEXT_DIM }} />
                  <span style={{ fontSize: 12.5, color: TEXT_MED }}>Entrega en menos de 2 minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={13} style={{ color: TEXT_DIM }} />
                  <span style={{ fontSize: 12.5, color: TEXT_MED }}>Pago 100% seguro · Garantía 7 días</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ══════════ CTA FINAL (oscuro) ══════════ */}
      <section style={{ backgroundColor: BG_INK, position: 'relative', overflow: 'hidden' }}>
        <div
          className="bp-glow"
          style={{
            position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)',
            width: 760, height: 500, pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(255,201,62,0.22), rgba(255,201,62,0) 65%)',
            filter: 'blur(20px)',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-20 md:py-24 text-center">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
            Una última cosa
          </p>
          <h2
            style={{
              fontWeight: 600, color: '#fff',
              fontSize: 'clamp(1.8rem, 4.4vw, 2.9rem)',
              lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: 20,
            }}
          >
            Cada día que pasas sin los prompts correctos es{' '}
            <span style={{ color: YELLOW }}>tiempo perdido</span>, contenido fallido y dinero dejado sobre la mesa.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, lineHeight: 1.75, marginBottom: 36 }}>
            11$ hoy.<br />
            Horas ahorradas cada semana para el resto de tu vida.
          </p>

          <BuyButton size="lg" label="Quiero los 500 prompts — 11$" />

          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 mt-9">
            {[
              { icon: <Zap size={13} />, t: 'Acceso inmediato' },
              { icon: <Shield size={13} />, t: 'Garantía 7 días' },
              { icon: <Lock size={13} />, t: 'Pago único y seguro' },
              { icon: <InfinityIcon size={13} />, t: 'Actualizaciones de por vida' },
            ].map(i => (
              <div key={i.t} className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.34)' }}>
                {i.icon}
                <span style={{ fontSize: 12.5 }}>{i.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlpacaIcon className="h-6 w-auto" />
            <span style={{ fontSize: 13, color: TEXT_DIM }}>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/terms" style={{ fontSize: 13, color: TEXT_DIM, textDecoration: 'none' }}>Términos</a>
            <a href="/privacy" style={{ fontSize: 13, color: TEXT_DIM, textDecoration: 'none' }}>Privacidad</a>
          </div>
        </div>
      </footer>

      {/* ══════════ BARRA FIJA MÓVIL ══════════ */}
      <div
        className="lg:hidden"
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60,
          backgroundColor: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderTop: `1px solid ${BORDER}`,
          padding: '10px 16px calc(10px + env(safe-area-inset-bottom))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          transform: showBar ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform .25s ease-out',
        }}
      >
        <div>
          <div className="flex items-baseline gap-2">
            <span style={{ fontSize: 12.5, color: TEXT_DIM, textDecoration: 'line-through' }}>29$</span>
            <span style={{ fontWeight: 600, fontSize: 20, color: TEXT, letterSpacing: '-0.02em' }}>11$</span>
          </div>
          <p style={{ fontSize: 11, color: TEXT_DIM }}>+500 prompts en Notion · pago único</p>
        </div>
        <BuyButton label="Obtenerlo ahora" />
      </div>
    </div>
  );
};

export default BankPrompts;
