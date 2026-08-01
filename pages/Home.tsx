import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Briefcase, Check, ChevronDown, Clock, Code, Copy, GraduationCap,
  Languages, LayoutGrid, Lock, LogIn, Megaphone, PenLine, RefreshCw, Search, Share2,
  Sparkles, Star, User, Wand2, Zap,
} from 'lucide-react';
import AlpacaIcon from '../components/AlpacaIcon';
import { supabase } from '../lib/supabase';
import {
  BG, BG_WARM, BG_INK, TEXT, TEXT_MED, TEXT_DIM, BORDER, ACCENT, YELLOW, GREEN, FONT,
  useEuclidFont, LandingStyles, Eyebrow, H2, P, Row, Cta, HoverCard,
} from '../components/landingKit';

/* ══════════════════════════════════════════════════════════════
   Home — landing autocontenida (sin Navbar/Footer de la app).
   Misma estructura, paleta y tipografía que /bank-prompts, pero
   vendiendo la suscripción al banco + el generador de prompts.
   ══════════════════════════════════════════════════════════════ */

const PRICE = '7 USD/mes';

/* ─── Categorías del banco ─── */
const CATEGORIES = [
  { icon: <Megaphone size={19} />,     color: '#f97316', title: 'Marketing y ventas',     desc: 'Anuncios, emails y ofertas que convierten visitas en clientes.' },
  { icon: <Share2 size={19} />,        color: '#8b5cf6', title: 'Redes sociales',         desc: 'Hooks, guiones y calendarios de contenido que retienen la atención.' },
  { icon: <Code size={19} />,          color: '#3b82f6', title: 'Vibe coding',            desc: 'Webs, apps y herramientas reales sin escribir una línea de código.' },
  { icon: <Zap size={19} />,           color: '#eab308', title: 'Productividad',          desc: 'Sistemas, planificación y foco para hacer en horas lo de días.' },
  { icon: <Languages size={19} />,     color: '#14b8a6', title: 'Aprender idiomas',       desc: 'Convierte la IA en un tutor personal disponible 24/7.' },
  { icon: <PenLine size={19} />,       color: '#f43f5e', title: 'Escritura y copy',       desc: 'Textos que enganchan, persuaden y venden en cualquier formato.' },
  { icon: <Briefcase size={19} />,     color: '#16a34a', title: 'Negocios',               desc: 'Ideas, validación, estrategia y propuestas listas para ejecutar.' },
  { icon: <GraduationCap size={19} />, color: '#6366f1', title: 'Estudio y aprendizaje',  desc: 'Domina cualquier tema el doble de rápido con el método correcto.' },
];

/* ─── Prompts gratis de muestra (existen en el banco con estos IDs) ─── */
const FREE_PROMPTS = [
  {
    id: '9a1ca7e1-1693-419b-a64c-589d48b65a10',
    category: 'Educación',
    title: 'Aprende cualquier tema en tiempo récord (Método 80/20)',
    content: `Adopta el rol de un experto en ciencia del aprendizaje acelerado, formado en el Método Feynman, la repetición espaciada y el principio de Pareto, que ha diseñado planes de estudio para opositores, universitarios y profesionales que necesitan dominar temas complejos en tiempo récord. Tu misión es construir mi plan de aprendizaje acelerado. El problema es grave: la mayoría estudia releyendo y subrayando —métodos que la ciencia considera casi inútiles— y por eso tarda meses en aprender lo que podría dominar en días. Cada semana que pierdo estudiando mal es una oportunidad profesional que se me escapa. Respira hondo y trabaja en este problema paso a paso.

Ejecuta estas 5 acciones: 1) Identifica el 20% de conceptos del tema que explica el 80% de los resultados y ordénalos en una secuencia lógica de aprendizaje. 2) Explícame cada concepto clave con el Método Feynman: lenguaje simple, una analogía cotidiana y un ejemplo real. 3) Diseña un plan de estudio día a día adaptado a mi tiempo disponible, con bloques de práctica activa, no lectura pasiva. 4) Crea un test de autoevaluación de 10 preguntas con respuestas explicadas para detectar mis lagunas. 5) Dame un calendario de repasos con repetición espaciada (24 horas, 7 días, 30 días) para fijarlo en la memoria a largo plazo.

#INFORMACIÓN SOBRE MÍ:
- Tema que quiero aprender: [INSERTAR TEMA]
- Mi nivel actual (cero, básico, intermedio): [INSERTAR NIVEL]
- Tiempo disponible al día: [INSERTAR TIEMPO]
- Para qué lo necesito (examen, trabajo, proyecto): [INSERTAR OBJETIVO]

¡LO MÁS IMPORTANTE!: Estructura tu respuesta con las secciones: A, B, C, D, y E. Al final, dame el "reto de las 48 horas": la primera acción concreta que debo completar en los próximos dos días para validar que el plan funciona.`,
  },
  {
    id: '3871245e-8dc3-43ef-af8d-22caffa0d5b2',
    category: 'Redes Sociales',
    title: 'La Fábrica de Hooks Virales: 30 ganchos que detienen el scroll',
    content: `Adopta el rol de un estratega de contenido viral que ha escrito hooks para creadores con millones de seguidores en TikTok, Instagram, YouTube y X, y que domina los disparadores psicológicos que hacen que alguien detenga el scroll en menos de un segundo. Tu misión es fabricar los hooks de mi contenido. La realidad es brutal: la gente decide en los primeros 2 segundos si sigue viendo o pasa al siguiente video, y un buen contenido con un mal hook simplemente no existe para el algoritmo. Cada publicación que lanzo sin un gancho potente es trabajo tirado a la basura. Respira hondo y trabaja en este problema paso a paso.

Ejecuta estas 5 acciones: 1) Genera 30 hooks para mi nicho organizados en 6 disparadores psicológicos: curiosidad abierta, controversia, error común, resultado con prueba, FOMO y storytelling en primera persona. 2) Marca los 5 con mayor potencial viral para mi audiencia concreta y explica por qué funcionan. 3) Adapta esos 5 a cada formato: video corto (hablado a cámara), carrusel (texto de portada) y post de texto. 4) Escribe la primera frase que debe venir DESPUÉS de cada uno de esos 5 hooks para sostener la retención. 5) Dame una checklist de los 5 errores de hook que matan el alcance y que debo evitar siempre.

#INFORMACIÓN SOBRE MÍ:
- Mi nicho o tema de contenido: [INSERTAR NICHO]
- Mi audiencia objetivo: [INSERTAR AUDIENCIA]
- Plataforma principal: [INSERTAR PLATAFORMA]
- Un contenido mío que ya funcionó bien (opcional): [INSERTAR TEMA O TITULAR]

¡LO MÁS IMPORTANTE!: Estructura tu respuesta con las secciones: A, B, C, D, y E. Cierra con una plantilla reutilizable de "hook maestro" con espacios en blanco que pueda rellenar en 30 segundos para cualquier contenido futuro.`,
  },
  {
    id: '95989e18-de3d-406e-a6b5-eb1e29f6a8a9',
    category: 'Finanzas Personales',
    title: 'Tu Rescate Financiero: plan de 90 días para ordenar tu dinero',
    content: `Adopta el rol de un asesor financiero personal que ha ayudado a cientos de personas endeudadas y sin ahorros a recuperar el control de su dinero, combinando el método bola de nieve, el presupuesto 50/30/20 y fondos de emergencia adaptados a ingresos variables. Tu misión es diseñar mi plan de rescate financiero de 90 días. La situación es urgente: vivir al día no es solo estrés — cada mes sin plan son intereses que se acumulan, ahorro perdido y decisiones tomadas por pánico en lugar de estrategia. La diferencia entre quien sale del hoyo y quien se hunde no es el sueldo: es tener un plan. Respira hondo y trabaja en este problema paso a paso.

Ejecuta estas 5 acciones: 1) Haz un diagnóstico honesto de mi situación con los números que te doy: cuánto entra, cuánto sale, cuánto debo y mi "número de supervivencia" mensual. 2) Diseña mi presupuesto realista con el método que mejor encaje en mi caso, señalando los 3 gastos que debo recortar primero y cuánto libero con cada recorte. 3) Si tengo deudas, ordénalas con la estrategia óptima (avalancha vs bola de nieve) y dime exactamente cuánto pagar a cada una por mes. 4) Crea mi plan de fondo de emergencia: cuánto necesito, dónde guardarlo y en cuántos meses lo alcanzo. 5) Dame el calendario de 90 días con hitos semanales medibles y un ritual de revisión de 15 minutos cada domingo.

#INFORMACIÓN SOBRE MÍ:
- Mis ingresos mensuales (fijos o variables): [INSERTAR INGRESOS]
- Mis gastos fijos mensuales aproximados: [INSERTAR GASTOS]
- Mis deudas (monto, interés y pago mínimo de cada una): [INSERTAR DEUDAS O "NINGUNA"]
- Mi meta financiera principal: [INSERTAR META]

¡LO MÁS IMPORTANTE!: Estructura tu respuesta con las secciones: A, B, C, D, y E. Termina con las 3 acciones que puedo hacer HOY MISMO en menos de una hora para frenar la sangría (cancelaciones, llamadas, cambios automáticos).`,
  },
];

const FAQS = [
  {
    q: '¿Cómo accedo al banco de prompts?',
    a: 'Acceso inmediato después de suscribirte. Entras con tu cuenta de Google y tienes el banco completo, organizado por categorías y listo para usar desde cualquier dispositivo.',
  },
  {
    q: '¿Funciona solo con Claude o también con otras IA?',
    a: 'Los prompts funcionan con Claude, ChatGPT, Gemini y prácticamente cualquier IA de texto. Están escritos para obtener el mejor resultado independientemente de la herramienta que uses.',
  },
  {
    q: '¿Qué es exactamente el generador de prompts?',
    a: 'Una herramienta incluida en tu suscripción: le describes en una frase lo que necesitas y te devuelve un prompt completo, con rol, contexto, instrucciones y formato de salida. Puedes generar hasta 10 al día.',
  },
  {
    q: '¿Necesito experiencia con IA para usarlos?',
    a: 'No. Si sabes copiar y pegar, sabes usar el banco. Cada prompt marca claramente los campos que debes personalizar (tu producto, tu cliente, tu tono…) y el resto ya está hecho.',
  },
  {
    q: '¿Cuánto cuesta y puedo cancelar?',
    a: 'La suscripción cuesta 7 USD al mes. Sin permanencia ni letra pequeña: puedes cancelar cuando quieras desde tu panel y mantienes el acceso hasta el final del período pagado.',
  },
  {
    q: '¿Se actualiza con nuevos prompts?',
    a: 'Sí. El banco crece con nuevos prompts y categorías cada semana, y todas las actualizaciones están incluidas en tu suscripción sin coste adicional.',
  },
];

/* ─── Card de prompt gratis (copiable) ─── */
const FreePromptCard: React.FC<{ prompt: (typeof FREE_PROMPTS)[number] }> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="flex flex-col"
      style={{ backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden' }}
    >
      <div
        className="flex items-center justify-between gap-3"
        style={{ padding: '12px 18px', backgroundColor: BG_WARM, borderBottom: `1px solid ${BORDER}` }}
      >
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: TEXT_DIM }}>
          {prompt.category}
        </span>
        <span
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: GREEN, backgroundColor: '#eefbf2', border: '1px solid #c3ecd1',
            borderRadius: 100, padding: '3px 9px',
          }}
        >
          Gratis
        </span>
      </div>

      <div className="flex flex-1 flex-col" style={{ padding: '18px 18px 0' }}>
        <h3 style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.35, color: TEXT, marginBottom: 12, letterSpacing: '-0.01em' }}>
          {prompt.title}
        </h3>
        <div style={{ position: 'relative', flex: 1 }}>
          <pre
            className="subtle-scrollbar"
            style={{
              maxHeight: 210, overflowY: 'auto', whiteSpace: 'pre-wrap',
              fontSize: 12.5, lineHeight: 1.7, color: TEXT_MED, paddingRight: 8, marginBottom: 0,
            }}
          >
            {prompt.content}
          </pre>
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-3"
        style={{ padding: '13px 18px', marginTop: 16, borderTop: `1px solid ${BORDER}` }}
      >
        <button
          onClick={handleCopy}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            backgroundColor: copied ? '#eefbf2' : BG_WARM,
            border: `1px solid ${copied ? '#c3ecd1' : BORDER}`,
            color: copied ? GREEN : TEXT,
            borderRadius: 10, padding: '8px 14px', fontSize: 12.5, fontWeight: 600,
            cursor: 'pointer', transition: 'background .15s, border-color .15s',
          }}
        >
          {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
          {copied ? 'Copiado' : 'Copiar prompt'}
        </button>
        <Link
          to={`/prompts/${prompt.id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: TEXT_DIM, textDecoration: 'none' }}
        >
          Ver en el banco <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
};

/* ─── FAQ ─── */
const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between gap-4" style={{ padding: '17px 20px', userSelect: 'none' }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: TEXT, lineHeight: 1.5 }}>{q}</span>
        <ChevronDown
          size={16}
          style={{ color: TEXT_DIM, flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </div>
      {open && (
        <p style={{ padding: '0 20px 18px', color: TEXT_MED, fontSize: 14.5, lineHeight: 1.75 }}>{a}</p>
      )}
    </div>
  );
};

const Home: React.FC = () => {
  const [showBar, setShowBar] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEuclidFont();

  // Sesión: si ya hay cuenta, el header lleva a la plataforma en vez de a la venta.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  /* Barra de suscripción fija en móvil a partir del primer scroll */
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
          <Link to="/" className="flex items-center" aria-label="Alpacka">
            <AlpacaIcon className="h-7 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {[
              { to: '/prompts', label: 'Prompts' },
              { to: '/generador', label: 'Generador' },
              { to: '/blog', label: 'Blog' },
              { to: '/pricing', label: 'Precio' },
            ].map(l => (
              <Link
                key={l.to}
                to={l.to}
                style={{ fontSize: 13.5, color: TEXT_MED, textDecoration: 'none', fontWeight: 500 }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Acceso a la plataforma: icono siempre visible (los suscriptores
                entran por aquí, no por el CTA de venta). */}
            <Link
              to={user ? '/dashboard' : '/login'}
              aria-label={user ? 'Mi cuenta' : 'Iniciar sesión'}
              title={user ? 'Mi cuenta' : 'Iniciar sesión'}
              style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                backgroundColor: BG, border: `1px solid ${BORDER}`, color: TEXT,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              {user ? <User size={16} /> : <LogIn size={16} />}
            </Link>

            {user
              ? <Cta to="/prompts" size="sm" label="Entrar al banco" />
              : <Cta to="/pricing" size="sm" label="Empieza ahora" />
            }
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
                  <Star size={11} fill="#f0a500" strokeWidth={0} /> Banco de prompts en español
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full"
                  style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, padding: '4px 11px', fontSize: 11.5, fontWeight: 500, color: TEXT_MED }}
                >
                  <Wand2 size={11} /> Generador con IA incluido
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full"
                  style={{ backgroundColor: '#eefbf2', border: '1px solid #c3ecd1', padding: '4px 11px', fontSize: 11.5, fontWeight: 600, color: GREEN }}
                >
                  <RefreshCw size={11} /> Cancela cuando quieras
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
                <strong style={{ color: TEXT, fontWeight: 600 }}>+1.000 prompts</strong> probados y listos para copiar y pegar
                para obtener resultados profesionales con ChatGPT, Claude y Gemini. Desde hoy.
              </p>
              <p style={{ color: TEXT_DIM, fontSize: 14.5, lineHeight: 1.7, marginTop: 12, maxWidth: 620 }}>
                Y cuando no exista el prompt que necesitas, el generador con IA te lo escribe. Todo por {PRICE}.
              </p>
            </div>

            {/* Banner */}
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
                  ChatGPT · Claude · Gemini · Grok
                </p>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: 'clamp(1.7rem, 4.8vw, 3.2rem)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.05,
                    color: '#ffffff',
                    marginBottom: 18,
                  }}
                >
                  BANCO DE <span style={{ color: YELLOW }}>+1.000</span> PROMPTS
                </p>
                <p style={{ fontSize: 'clamp(13.5px, 1.9vw, 17px)', color: 'rgba(255,255,255,0.62)' }}>
                  Copia. Pega. <span style={{ color: YELLOW }}>Resultados de experto</span>.
                </p>
              </div>
            </div>

            {/* Qué incluye la suscripción, en una línea */}
            <div
              className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3"
              style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 18px' }}
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid size={16} style={{ color: TEXT_MED }} />
                <span style={{ fontSize: 13.5, fontWeight: 500, color: TEXT }}>+1.000 prompts en +20 categorías</span>
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: 13, color: TEXT_DIM }}>
                <Wand2 size={14} /> Generador con IA: 10 prompts a medida al día
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: 13, color: TEXT_DIM }}>
                <RefreshCw size={14} /> Prompts nuevos cada semana
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
                <div style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '14px 20px', marginBottom: 22 }}>
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
                <H2>Tu suscripción incluye:</H2>
                <P>
                  <strong style={{ color: TEXT, fontWeight: 600 }}>+1.000 prompts</strong> organizados, probados y optimizados
                  para que obtengas resultados profesionales cada vez. Más un generador con IA para los casos que no estén.
                </P>
                <div className="flex flex-wrap items-center gap-2 mt-5">
                  {['Buscas.', 'Copias.', 'Pegas.', 'Obtienes el resultado.'].map((t, i, arr) => (
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
                      {i < arr.length - 1 && <ArrowRight size={14} style={{ color: TEXT_DIM }} />}
                    </React.Fragment>
                  ))}
                </div>
                <p style={{ color: TEXT_DIM, fontSize: 14.5, marginTop: 14 }}>Eso es todo.</p>
              </section>
            </div>

            {/* LO QUE OBTIENES */}
            <section className="mt-14">
              <Eyebrow>Lo que obtienes</Eyebrow>
              <H2>📁 +1.000 prompts organizados por área</H2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
                {CATEGORIES.map(c => (
                  <HoverCard key={c.title}>
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span
                        style={{
                          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                          backgroundColor: `${c.color}14`, color: c.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {c.icon}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 15.5, color: TEXT, letterSpacing: '-0.01em' }}>{c.title}</span>
                    </div>
                    <p style={{ color: TEXT_MED, fontSize: 14, lineHeight: 1.65 }}>{c.desc}</p>
                  </HoverCard>
                ))}

                <HoverCard style={{ borderStyle: 'dashed', backgroundColor: BG_WARM }}>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span
                      style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        backgroundColor: 'rgba(0,0,0,0.04)', color: TEXT_MED,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Sparkles size={19} />
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 15.5, color: TEXT, letterSpacing: '-0.01em' }}>…y muchas más</span>
                  </div>
                  <p style={{ color: TEXT_MED, fontSize: 14, lineHeight: 1.65 }}>
                    Salud, finanzas, viajes, creatividad, imágenes con IA, entrevistas de trabajo…
                  </p>
                </HoverCard>
              </div>
            </section>

            {/* ══════════ EL GENERADOR ══════════ */}
            <section className="mt-14">
              <Eyebrow color="#8b5cf6" bg="#f7f2ff" border="#e2d5fb">El generador</Eyebrow>
              <H2>¿Y si el prompt que necesitas no existe?</H2>
              <p style={{ color: TEXT_MED, fontSize: 16, lineHeight: 1.8, maxWidth: 680, marginBottom: 26 }}>
                Se lo pides al generador. Le escribes en una frase lo que necesitas y te devuelve un prompt completo —con rol,
                contexto, instrucciones paso a paso y formato de salida— construido con la misma estructura que los del banco.
                Incluido en tu suscripción, hasta 10 al día.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Mock del generador */}
                <div
                  style={{
                    backgroundColor: BG_INK, borderRadius: 18, overflow: 'hidden',
                    boxShadow: '0 18px 50px rgba(10,12,25,0.25)',
                  }}
                >
                  <div
                    className="flex items-center justify-between"
                    style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Wand2 size={13} style={{ color: YELLOW }} />
                      <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>
                        Generador de prompts
                      </span>
                    </div>
                    <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)' }}>10 / día</span>
                  </div>

                  <div style={{ padding: '18px 16px' }}>
                    <p style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
                      Tú escribes
                    </p>
                    <div
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                        borderRadius: 11, padding: '12px 14px', fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5,
                      }}
                    >
                      Un plan de contenidos de 30 días para mi taller de cerámica en Instagram
                    </div>

                    <div className="flex justify-center" style={{ padding: '12px 0' }}>
                      <ArrowRight size={15} style={{ color: 'rgba(255,255,255,0.3)', transform: 'rotate(90deg)' }} />
                    </div>

                    <p style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
                      La IA devuelve
                    </p>
                    <div
                      style={{
                        backgroundColor: 'rgba(255,201,62,0.07)', border: '1px solid rgba(255,201,62,0.22)',
                        borderRadius: 11, padding: '14px', fontSize: 12.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7,
                      }}
                    >
                      «Adopta el rol de un estratega de contenido especializado en marcas artesanales locales…
                      Ejecuta estas 5 acciones: 1) Define los 3 pilares de contenido… 4) Construye el calendario
                      día a día con formato, hook y CTA…»
                      <span style={{ display: 'block', marginTop: 10, color: 'rgba(255,255,255,0.35)', fontSize: 11.5 }}>
                        + campos [INSERTAR] listos para personalizar
                      </span>
                    </div>
                  </div>
                </div>

                {/* Puntos del generador */}
                <div className="flex flex-col gap-3">
                  {[
                    {
                      icon: <Wand2 size={18} style={{ color: '#8b5cf6' }} />, bg: '#f7f2ff', bd: '#e2d5fb',
                      title: 'Escribe una frase, recibe un prompt',
                      desc: 'No tienes que saber prompt engineering. Describes el resultado que quieres y el generador arma la estructura.',
                    },
                    {
                      icon: <LayoutGrid size={18} style={{ color: '#3b82f6' }} />, bg: '#eff6ff', bd: '#cfe0fd',
                      title: 'La misma estructura del banco',
                      desc: 'Rol experto, contexto, acciones numeradas y formato de salida. Lo que hace que la primera respuesta ya sirva.',
                    },
                    {
                      icon: <Zap size={18} style={{ color: '#c98200' }} />, bg: '#fff7e8', bd: '#fbe3b0',
                      title: '10 generaciones al día',
                      desc: 'Incluidas en la suscripción, sin coste por uso. Se renuevan cada día.',
                    },
                  ].map(c => (
                    <div key={c.title} style={{ backgroundColor: c.bg, border: `1px solid ${c.bd}`, borderRadius: 16, padding: '18px 20px' }}>
                      <div className="flex items-start gap-3">
                        <span
                          style={{
                            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                            backgroundColor: 'rgba(255,255,255,0.75)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          }}
                        >
                          {c.icon}
                        </span>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 15, color: TEXT, marginBottom: 5 }}>{c.title}</p>
                          <p style={{ color: TEXT_MED, fontSize: 13.5, lineHeight: 1.65 }}>{c.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Link
                    to="/generador"
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      border: `1px solid ${BORDER}`, borderRadius: 12, padding: '13px 18px',
                      fontSize: 14, fontWeight: 600, color: TEXT, textDecoration: 'none', backgroundColor: BG,
                    }}
                  >
                    Ver el generador <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </section>

            {/* ══════════ PRUÉBALOS GRATIS ══════════ */}
            <section className="mt-14">
              <Eyebrow>Pruébalos gratis</Eyebrow>
              <H2>No te lo contamos: cópialos ahora.</H2>
              <p style={{ color: TEXT_MED, fontSize: 16, lineHeight: 1.8, maxWidth: 680, marginBottom: 26 }}>
                Estos 3 prompts completos son tuyos, sin registro y sin pagar nada. Así es exactamente cada uno de los
                +1.000 que hay dentro del banco.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {FREE_PROMPTS.map(p => (
                  <FreePromptCard key={p.id} prompt={p} />
                ))}
              </div>
            </section>

            {/* ══════════ CÓMO FUNCIONA ══════════ */}
            <section className="mt-14">
              <Eyebrow>Cómo funciona</Eyebrow>
              <H2>Un banco que vive en la web y crece cada semana.</H2>
              <p style={{ color: TEXT_MED, fontSize: 16, lineHeight: 1.8, maxWidth: 680, marginBottom: 26 }}>
                Nada que descargar ni instalar. Entras con tu cuenta de Google desde el móvil o el ordenador y todo está
                ahí, ordenado y listo para copiar.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    icon: <Search size={19} style={{ color: '#3b82f6' }} />, bg: '#eff6ff', bd: '#cfe0fd',
                    title: 'Encuentra en segundos',
                    desc: 'Filtra por categoría o busca por palabra clave. El prompt exacto para lo que necesitas hoy.',
                  },
                  {
                    icon: <Copy size={19} style={{ color: '#8b5cf6' }} />, bg: '#f7f2ff', bd: '#e2d5fb',
                    title: 'Copia en un clic',
                    desc: 'Cada prompt ya trae rol, contexto y formato. Cambias los campos [INSERTAR] y listo.',
                  },
                  {
                    icon: <RefreshCw size={19} style={{ color: GREEN }} />, bg: '#eefbf2', bd: '#c3ecd1',
                    title: 'Prompts nuevos cada semana',
                    desc: 'El banco crece y las actualizaciones están incluidas mientras estés suscrito.',
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
                <RefreshCw size={16} style={{ color: YELLOW, flexShrink: 0 }} />
                <span style={{ color: '#fff', fontSize: 14.5, fontWeight: 600 }}>7 USD al mes.</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                  Sin permanencia. Cancelas desde tu panel cuando quieras y conservas el acceso hasta el final del período.
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
                  <Row kind="yes">Abrir el banco y filtrar por lo que necesitas.</Row>
                  <Row kind="yes">Copiar el prompt que se adapte a tu caso.</Row>
                  <Row kind="yes">Pegarlo en ChatGPT, Claude o Gemini.</Row>
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

              {/* LA SUSCRIPCIÓN */}
              <section className="mt-14" id="comprar">
                <Eyebrow color="#c98200" bg="#fff7e8" border="#fbe3b0">La suscripción</Eyebrow>

                <div style={{ border: `1px solid ${BORDER}`, borderRadius: 22, overflow: 'hidden', boxShadow: '0 14px 44px rgba(0,0,0,0.06)' }}>
                  <div style={{ padding: '28px 26px', backgroundColor: BG }}>
                    <div className="flex items-end gap-3 mb-1">
                      <span style={{ fontWeight: 600, fontSize: 46, lineHeight: 1, letterSpacing: '-0.04em', color: TEXT }}>7 USD</span>
                      <span style={{ fontSize: 15, color: TEXT_MED, paddingBottom: 5 }}>/ mes</span>
                    </div>
                    <p style={{ color: TEXT_DIM, fontSize: 13.5, marginBottom: 22 }}>
                      Menos que un café · Sin permanencia · Cancela cuando quieras
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-5">
                      {[
                        { icon: <LayoutGrid size={14} style={{ color: '#3b82f6' }} />,  t: '+1.000 prompts en +20 categorías' },
                        { icon: <Wand2 size={14} style={{ color: '#8b5cf6' }} />,       t: 'Generador con IA (10 al día)' },
                        { icon: <Zap size={14} style={{ color: '#c98200' }} />,         t: 'Acceso inmediato tras el pago' },
                        { icon: <RefreshCw size={14} style={{ color: GREEN }} />,       t: 'Prompts nuevos cada semana' },
                        { icon: <Sparkles size={14} style={{ color: '#f43f5e' }} />,    t: 'ChatGPT, Claude, Gemini y más' },
                        { icon: <Lock size={14} style={{ color: TEXT_MED }} />,         t: 'Pago 100% seguro con Paddle' },
                      ].map(i => (
                        <div key={i.t} className="flex items-center gap-2.5">
                          {i.icon}
                          <span style={{ fontSize: 14, color: TEXT_MED }}>{i.t}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-7">
                      <Cta to="/pricing" full size="lg" label="Empezar por 7 USD/mes" />
                    </div>
                  </div>

                  <div style={{ backgroundColor: BG_WARM, borderTop: `1px solid ${BORDER}`, padding: '20px 26px' }}>
                    <div className="flex items-start gap-3">
                      <div
                        style={{
                          width: 34, height: 34, borderRadius: 11, flexShrink: 0,
                          backgroundColor: '#eefbf2', border: '1px solid #c3ecd1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <RefreshCw size={16} style={{ color: GREEN }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14.5, color: TEXT, marginBottom: 4 }}>🔓 Sin permanencia</p>
                        <p style={{ color: TEXT_MED, fontSize: 14, lineHeight: 1.65 }}>
                          Cancelas en dos clics desde tu panel, sin escribir a nadie y sin explicaciones. Mantienes el acceso
                          hasta el final del período que ya pagaste.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ */}
              <section className="mt-14">
                <Eyebrow>Preguntas frecuentes</Eyebrow>
                <H2>Todo lo que necesitas saber.</H2>
                <div style={{ backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden', marginTop: 8 }}>
                  {FAQS.map(f => (
                    <FaqItem key={f.q} q={f.q} a={f.a} />
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* ───── Columna derecha: card sticky ───── */}
          <aside className="hidden lg:block lg:sticky" style={{ top: 84 }}>
            <div
              style={{
                backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 20,
                boxShadow: '0 12px 40px rgba(0,0,0,0.07)', overflow: 'hidden',
              }}
            >
              <div style={{ padding: '24px 22px' }}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span style={{ fontWeight: 600, fontSize: 34, lineHeight: 1, letterSpacing: '-0.035em', color: ACCENT }}>7 USD</span>
                  <span style={{ fontSize: 14, color: TEXT_MED }}>/ mes</span>
                </div>
                <p style={{ color: TEXT_DIM, fontSize: 12.5, marginBottom: 18 }}>Acceso completo · Cancela cuando quieras</p>

                <Cta to="/pricing" full label="Empezar ahora" />

                <div className="mt-5 space-y-2.5">
                  {[
                    '+1.000 prompts listos para usar',
                    'Generador de prompts con IA incluido',
                    '+20 categorías: marketing, negocio, estudio…',
                    'ChatGPT, Claude, Gemini y cualquier IA',
                    'Prompts nuevos cada semana',
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
                  <span style={{ fontSize: 12.5, color: TEXT_MED }}>Acceso inmediato tras el pago</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={13} style={{ color: TEXT_DIM }} />
                  <span style={{ fontSize: 12.5, color: TEXT_MED }}>Pago seguro · Sin permanencia</span>
                </div>
              </div>
            </div>

            <Link
              to="/prompts"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                marginTop: 12, padding: '12px', borderRadius: 14,
                border: `1px solid ${BORDER}`, backgroundColor: BG_WARM,
                fontSize: 13.5, color: TEXT_MED, textDecoration: 'none',
              }}
            >
              Explorar el banco <ArrowRight size={13} />
            </Link>
          </aside>
        </div>
      </div>

      {/* ══════════ CTA FINAL ══════════ */}
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
            7 USD este mes.<br />
            Horas ahorradas cada semana desde hoy.
          </p>

          <Cta to="/pricing" size="lg" label="Quiero mis +1.000 prompts — 7 USD/mes" />

          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 mt-9">
            {[
              { icon: <Zap size={13} />, t: 'Acceso inmediato' },
              { icon: <Wand2 size={13} />, t: 'Generador incluido' },
              { icon: <Lock size={13} />, t: 'Pago seguro' },
              { icon: <RefreshCw size={13} />, t: 'Cancela cuando quieras' },
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
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
            <div>
              <AlpacaIcon className="h-7 w-auto" />
              <p style={{ fontSize: 13, color: TEXT_DIM, marginTop: 12, maxWidth: 260, lineHeight: 1.6 }}>
                Banco de prompts en español para ChatGPT, Claude y Gemini.
              </p>
            </div>

            <div className="flex gap-12">
              <div className="flex flex-col gap-2.5">
                {[
                  { to: '/prompts', label: 'Prompts' },
                  { to: '/generador', label: 'Generador' },
                  { to: '/pricing', label: 'Precio' },
                  { to: '/blog', label: 'Blog' },
                ].map(l => (
                  <Link key={l.to} to={l.to} style={{ fontSize: 13, color: TEXT_MED, textDecoration: 'none' }}>
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { to: '/login', label: 'Entrar' },
                  { to: '/dashboard', label: 'Mi cuenta' },
                  { to: '/terms', label: 'Términos' },
                  { to: '/privacy', label: 'Privacidad' },
                ].map(l => (
                  <Link key={l.to} to={l.to} style={{ fontSize: 13, color: TEXT_MED, textDecoration: 'none' }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 12.5, color: TEXT_DIM, marginTop: 32 }}>
            Alpacka © {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* ══════════ BARRA FIJA MÓVIL (solo para visitantes sin cuenta) ══════════ */}
      <div
        className={user ? 'hidden' : 'lg:hidden'}
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
          <div className="flex items-baseline gap-1.5">
            <span style={{ fontWeight: 600, fontSize: 20, color: TEXT, letterSpacing: '-0.02em' }}>7 USD</span>
            <span style={{ fontSize: 12.5, color: TEXT_DIM }}>/ mes</span>
          </div>
          <p style={{ fontSize: 11, color: TEXT_DIM }}>+1.000 prompts · generador incluido</p>
        </div>
        <Cta to="/pricing" label="Empezar ahora" />
      </div>
    </div>
  );
};

export default Home;
