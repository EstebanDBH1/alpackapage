import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  ArrowRight,
  Briefcase,
  Check,
  ChevronDown,
  Code,
  Copy,
  GraduationCap,
  Languages,
  Megaphone,
  PenLine,
  Share2,
  Zap,
} from 'lucide-react';

/* ─── Piezas reutilizables del diseño ───────────────────────────── */

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2l1.6 7.2L21 10l-6.4 3.2L16 21l-4-4.8L8 21l1.4-7.8L3 10l7.4-.8L12 2z" />
  </svg>
);

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
    <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]"></span>
    <span>{children}</span>
  </div>
);

const CheckItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center gap-3 text-sm text-foreground/90">
    <Check size={16} strokeWidth={2.5} className="shrink-0 text-accent" />
    <span>{children}</span>
  </li>
);

const CategoryCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="group rounded-2xl border border-border/70 bg-card p-6 transition hover:border-primary/40">
    <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-accent">
      {icon}
    </span>
    <h3 className="text-lg font-medium text-foreground">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
  </div>
);

/* ─── Prompts gratis de muestra (existen en el banco con estos IDs) ─ */

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

const DEMO_PROMPT = `Adopta el rol de un media buyer senior que ha gestionado más de 2 millones de USD en publicidad digital y sabe exactamente por qué el 90% de los anuncios quema presupuesto sin vender. Tu misión es escribir los anuncios de mi producto. El problema es serio: cada día que mis campañas corren con un copy mediocre es dinero que se va directo a la basura, mientras mi competencia se lleva a mis clientes con anuncios que sí conectan. Respira hondo y trabaja en este problema paso a paso.

Ejecuta estas 5 acciones: 1) Escribe 3 variantes de anuncio: una centrada en el dolor del cliente, una en la transformación y una con prueba social. 2) Para cada variante dame un hook de máximo 5 palabras que detenga el scroll. 3) Escribe el cuerpo de cada anuncio en máximo 50 palabras, sin relleno. 4) Cierra cada variante con un CTA directo y específico. 5) Dime cuál de las 3 lanzarías primero y por qué.

#INFORMACIÓN SOBRE MÍ:
- Mi producto o servicio: [INSERTAR PRODUCTO]
- Mi cliente ideal: [INSERTAR CLIENTE]
- Tono de mi marca: [INSERTAR TONO]
- Plataforma donde anuncio: [INSERTAR PLATAFORMA]

¡LO MÁS IMPORTANTE!: Estructura tu respuesta con las secciones: A, B, C, D, y E. Al final, dame una versión de 15 palabras de la mejor variante para usarla como anuncio de remarketing.`;

const DemoPromptCard: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(DEMO_PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-border/70 bg-card shadow-[0_0_60px_oklch(0.86_0.09_90_/_0.06)]">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Marketing · Anuncio</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground transition hover:border-accent/50"
        >
          {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="subtle-scrollbar max-h-80 overflow-y-auto whitespace-pre-wrap px-5 py-5 font-sans text-xs leading-relaxed text-foreground/90">
        {DEMO_PROMPT}
      </pre>
      <div className="flex items-center gap-2 border-t border-border/60 px-5 py-3.5 text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
        Listo para pegar en Claude, ChatGPT o Gemini
      </div>
    </div>
  );
};

const FreePromptCard: React.FC<{ prompt: (typeof FREE_PROMPTS)[number] }> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border/70 bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
        <span className="truncate text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{prompt.category}</span>
        <span className="shrink-0 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-accent">
          Gratis
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 py-5">
        <h3 className="mb-3 text-base font-medium leading-snug text-foreground">{prompt.title}</h3>
        <pre className="subtle-scrollbar max-h-64 flex-1 overflow-y-auto whitespace-pre-wrap pr-2 font-sans text-xs leading-relaxed text-muted-foreground">
          {prompt.content}
        </pre>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-3.5">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/50"
        >
          {copied ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
          {copied ? 'Copiado' : 'Copiar prompt'}
        </button>
        <Link to={`/prompts/${prompt.id}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground">
          Ver en el banco
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
};

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
  <details className="group rounded-2xl border border-border/70 bg-card px-5">
    <summary className="flex items-center justify-between gap-4 py-4 text-sm font-medium text-foreground">
      {question}
      <ChevronDown size={16} className="faq-chevron shrink-0 text-muted-foreground transition-transform" />
    </summary>
    <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</p>
  </details>
);

const AI_TOOLS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Grok',
  'Copilot',
  'Perplexity',
  'Mistral',
  'DeepSeek',
  'Llama',
  'Qwen',
];

const CATEGORIES = [
  { icon: <Megaphone size={20} />, title: 'Marketing y ventas', desc: 'Anuncios, emails y ofertas que convierten visitas en clientes.' },
  { icon: <Share2 size={20} />, title: 'Redes sociales', desc: 'Hooks, guiones y calendarios de contenido que retienen la atención.' },
  { icon: <Code size={20} />, title: 'Vibe coding', desc: 'Webs, apps y herramientas reales sin escribir una línea de código.' },
  { icon: <Zap size={20} />, title: 'Productividad', desc: 'Sistemas, planificación y foco para hacer en horas lo de días.' },
  { icon: <Languages size={20} />, title: 'Aprender idiomas', desc: 'Convierte la IA en un tutor personal disponible 24/7.' },
  { icon: <PenLine size={20} />, title: 'Escritura y copy', desc: 'Textos que enganchan, persuaden y venden en cualquier formato.' },
  { icon: <Briefcase size={20} />, title: 'Negocios', desc: 'Ideas, validación, estrategia y propuestas listas para ejecutar.' },
  { icon: <GraduationCap size={20} />, title: 'Estudio y aprendizaje', desc: 'Domina cualquier tema el doble de rápido con el método correcto.' },
];

const FAQS = [
  {
    question: '¿Cómo accedo al banco de prompts?',
    answer: 'Acceso inmediato después de suscribirte. Entras con tu cuenta de Google y tienes el banco completo, organizado por categorías y listo para usar desde cualquier dispositivo.',
  },
  {
    question: '¿Funciona solo con Claude o también con otras IA?',
    answer: 'Los prompts funcionan con Claude, ChatGPT, Gemini y prácticamente cualquier IA de texto. Están escritos para obtener el mejor resultado independientemente de la herramienta que uses.',
  },
  {
    question: '¿Necesito experiencia con IA para usarlos?',
    answer: 'No. Si sabes copiar y pegar, sabes usar el banco. Cada prompt marca claramente los campos que debes personalizar (tu producto, tu cliente, tu tono…) y el resto ya está hecho.',
  },
  {
    question: '¿Cuánto cuesta y puedo cancelar?',
    answer: 'La suscripción cuesta 7 USD al mes. Sin permanencia ni letra pequeña: puedes cancelar cuando quieras desde tu panel y mantienes el acceso hasta el final del período pagado.',
  },
  {
    question: '¿Se actualiza con nuevos prompts?',
    answer: 'Sí. El banco crece con nuevos prompts y categorías cada semana, y todas las actualizaciones están incluidas en tu suscripción sin coste adicional.',
  },
];

/* ─── Home ──────────────────────────────────────────────────────── */

const Home: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background bg-radial-glow font-space text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

      <div className="relative">
        {/* ============ HEADER ============ */}
        <Navbar />

        <main>
          {/* ============ HERO ============ */}
          <section className="relative px-4 pb-20 pt-10 text-center sm:px-8 sm:pt-16 md:pb-28">
            <Pill>
              <span className="text-foreground">#1 en tecnología</span>
            </Pill>

            <h1 className="mx-auto mt-8 max-w-5xl text-balance text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              Convierte La IA en tu mejor{' '}
              <span className="inline-flex items-center align-baseline text-accent">herramienta</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              Explora una colección de prompts, guías y recursos para trabajar más rápido y obtener mejores resultados.
            </p>

            <div className="mt-9">
              <Link
                to="/prompts"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90"
              >
                Explorar prompts
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* ============ MARQUEE DE COMPATIBILIDAD ============ */}
          <section className="pb-20 md:pb-24">
            <p className="mb-8 text-center text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Compatible con las principales IA
            </p>
            <div className="marquee-mask overflow-hidden">
              <div className="animate-marquee flex w-max">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
                    {AI_TOOLS.map((tool) => (
                      <span key={tool} className="flex items-center">
                        <span className="whitespace-nowrap px-8 text-xl font-medium text-foreground/80 sm:px-10 sm:text-2xl">
                          {tool}
                        </span>
                        <span className="text-sm text-accent">✦</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ============ EL PROBLEMA ============ */}
          <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-8 md:pb-32">
            <article className="mx-auto max-w-2xl text-center">
              <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-foreground">
                  <Zap size={14} className="text-muted-foreground" />
                  01
                </span>
                <span className="rounded-md border border-border/50 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">El problema</span>
              </div>

              <h2 className="text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.6rem]">
                Los resultados mediocres no son culpa de la IA. Son culpa del <em className="not-italic text-primary/90">prompt</em>.
              </h2>

              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                La misma IA que hoy te da respuestas genéricas puede escribir tu marketing, enseñarte un idioma o construir tu web. Solo necesita las instrucciones correctas. Y eso es exactamente lo que te llevas: los prompts que ya funcionan, listos para copiar y pegar.
              </p>

              <ul className="mx-auto mt-6 inline-flex flex-col items-start space-y-2.5 text-left">
                <CheckItem>Prompts probados, no experimentos</CheckItem>
                <CheckItem>Resultados de experto desde el primer mensaje</CheckItem>
                <CheckItem>Sin cursos ni teoría: copiar, pegar y listo</CheckItem>
              </ul>

              <div className="mt-8">
                <a href="#comprar" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
                  Quiero el banco de prompts
                  <ArrowRight size={16} />
                </a>
              </div>
            </article>
          </section>

          {/* ============ PROMPTS GRATIS DE MUESTRA ============ */}
          <section id="prompts-gratis" className="mx-auto max-w-6xl px-4 pb-24 sm:px-8 md:pb-32">
            <div className="mb-12 text-center md:mb-16">
              <Pill>Pruébalos gratis</Pill>
              <h2 className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.6rem]">
                No te lo contamos: <em className="not-italic text-primary/90">cópialos ahora</em>.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                Estos 3 prompts completos son tuyos, sin registro. Así es exactamente cada uno de los +1.000 que hay dentro del banco.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {FREE_PROMPTS.map((p) => (
                <FreePromptCard key={p.id} prompt={p} />
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              ¿Te gustaron? Hay más de 1.000 como estos, organizados en +20 categorías.{' '}
              <a href="#comprar" className="text-accent transition hover:opacity-80">
                Desbloquéalos todos →
              </a>
            </p>
          </section>

          {/* ============ CATEGORÍAS ============ */}
          <section id="categorias" className="mx-auto max-w-6xl px-4 pb-24 sm:px-8 md:pb-32">
            <div className="mb-12 text-center md:mb-16">
              <Pill>¿Qué hay dentro?</Pill>
              <h2 className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.6rem]">
                Un prompt probado para <em className="not-italic text-primary/90">cada área</em> de tu vida.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                No importa qué quieras conseguir: aquí ya hay un prompt que lo hace por ti.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((cat) => (
                <CategoryCard key={cat.title} icon={cat.icon} title={cat.title} desc={cat.desc} />
              ))}

              {/* Y muchas más */}
              <div className="group flex flex-col justify-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-6 text-center transition hover:border-primary/40">
                <span className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-accent">
                  <StarIcon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-medium text-foreground">…y muchas más</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Salud, finanzas, viajes, creatividad, imágenes con IA…</p>
              </div>
            </div>
          </section>

          {/* ============ CÓMO FUNCIONA ============ */}
          <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-8 md:pb-32">
            <article className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
              <div className="md:order-2">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-foreground">
                    <Copy size={14} className="text-muted-foreground" />
                    02
                  </span>
                  <span className="rounded-md border border-border/50 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Cómo funciona</span>
                </div>

                <h2 className="text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.6rem]">
                  Copia. Pega. <em className="not-italic text-primary/90">Resultados.</em>
                </h2>

                <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                  Sin cursos de 6 horas ni teoría de prompt engineering. Abre el banco, busca tu categoría, copia el prompt y pégalo en tu IA favorita. Cada prompt te indica exactamente qué personalizar.
                </p>

                <ul className="mt-6 space-y-2.5">
                  <CheckItem>Organizado por categorías: encuentra todo en segundos</CheckItem>
                  <CheckItem>Campos marcados para personalizar en 10 segundos</CheckItem>
                  <CheckItem>Funciona con Claude, ChatGPT y Gemini</CheckItem>
                </ul>

                <a href="#comprar" className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 hover:bg-secondary">
                  Empezar por 7 USD/mes
                  <ArrowRight size={16} />
                </a>
              </div>

              <div className="md:order-1">
                <div className="relative">
                  <div className="absolute -inset-8 -z-10 rounded-full bg-primary/5 blur-3xl"></div>
                  <DemoPromptCard />
                </div>
              </div>
            </article>
          </section>

          {/* ============ PRECIO / OFERTA ============ */}
          <section id="comprar" className="mx-auto max-w-6xl scroll-mt-10 px-4 pb-24 sm:px-8 md:pb-32">
            <div className="relative mx-auto max-w-2xl">
              <div className="absolute -inset-10 -z-10 rounded-full bg-accent/5 blur-3xl"></div>

              <div className="rounded-3xl border border-primary/30 bg-card p-8 text-center shadow-[0_0_80px_oklch(0.86_0.09_90_/_0.08)] sm:p-12">
                <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-accent/40 bg-secondary px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]"></span>
                  <span>Precio de lanzamiento</span>
                </div>

                <h2 className="mt-6 text-balance text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
                  Todo el banco. <em className="not-italic text-primary/90">Sin permanencia.</em>
                </h2>

                <div className="mt-6 flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-medium text-foreground sm:text-7xl">7</span>
                  <span className="text-2xl text-muted-foreground">USD/mes</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Menos que un café al mes. Te ahorra horas cada semana.</p>

                <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
                  <CheckItem><span className="text-foreground">+1.000 prompts probados</span> organizados en +10 categorías</CheckItem>
                  <CheckItem>Funciona con <span className="text-foreground">Claude, ChatGPT y Gemini</span></CheckItem>
                  <CheckItem><span className="text-foreground">Generador de prompts con IA</span> — hasta 10 prompts a medida al día</CheckItem>
                  <CheckItem><span className="text-foreground">Acceso inmediato</span> después del pago</CheckItem>
                  <CheckItem>Prompts nuevos cada semana <span className="text-foreground">sin coste extra</span></CheckItem>
                  <CheckItem>Cancela cuando quieras. <span className="text-foreground">Sin permanencia.</span></CheckItem>
                </ul>

                <Link
                  to="/pricing"
                  className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90 sm:w-auto"
                >
                  Conseguir mi banco de prompts
                  <ArrowRight size={16} />
                </Link>

                <p className="mt-4 text-xs text-muted-foreground">7 USD/mes · Acceso inmediato · Cancela cuando quieras</p>
              </div>
            </div>
          </section>

          {/* ============ FAQ ============ */}
          <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-8 md:pb-32">
            <div className="mb-10 text-center">
              <Pill>Preguntas frecuentes</Pill>
              <h2 className="mt-6 text-balance text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
                Todo lo que necesitas saber.
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq) => (
                <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>

          {/* ============ CTA FINAL ============ */}
          <section className="px-4 pb-24 text-center sm:px-8 md:pb-32">
            <h2 className="mx-auto max-w-3xl text-balance text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
              Tu IA ya es capaz. Dale las <em className="not-italic text-accent">instrucciones correctas</em>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
              Por el precio de un café, deja de improvisar prompts y empieza a obtener resultados de experto hoy mismo.
            </p>
            <a href="#comprar" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90">
              Quiero mis +1.000 prompts por 7 USD/mes
              <ArrowRight size={16} />
            </a>
            <p className="mt-4 text-xs text-muted-foreground">7 USD/mes · Acceso inmediato · Cancela cuando quieras</p>
          </section>
        </main>

        {/* ============ FOOTER ============ */}
        <Footer />
      </div>
    </div>
  );
};

export default Home;
