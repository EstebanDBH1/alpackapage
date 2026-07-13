import React from 'react';
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

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
  <details className="group rounded-2xl border border-border/70 bg-card px-5">
    <summary className="flex items-center justify-between gap-4 py-4 text-sm font-medium text-foreground">
      {question}
      <ChevronDown size={16} className="faq-chevron shrink-0 text-muted-foreground transition-transform" />
    </summary>
    <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</p>
  </details>
);

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
    answer: 'La suscripción cuesta 4 USD al mes. Sin permanencia ni letra pequeña: puedes cancelar cuando quieras desde tu panel y mantienes el acceso hasta el final del período pagado.',
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
              <span className="text-foreground">3 formas</span> · 4 prompts · <span className="text-foreground">1 skill</span>
            </Pill>

            <h1 className="mx-auto mt-8 max-w-5xl text-balance text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              Convierte La IA en tu mejor{' '}
              <span className="inline-flex items-center align-baseline text-accent">herramienta</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              Explora una colección de prompts, guías y recursos para trabajar más rápido y obtener mejores resultados.
            </p>
          </section>

          {/* ============ BARRA DE VALOR ============ */}
          <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8 md:pb-24">
            <div className="grid grid-cols-2 divide-border/60 rounded-2xl border border-border/60 bg-card/60 backdrop-blur md:grid-cols-4 md:divide-x">
              {[
                { value: '+1.000', label: 'prompts probados' },
                { value: '+10', label: 'categorías' },
                { value: '4 USD', label: 'al mes', highlight: true },
                { value: '∞', label: 'actualizaciones incluidas' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1 px-4 py-6 text-center">
                  <span className={`text-2xl font-medium sm:text-3xl ${stat.highlight ? 'text-accent' : 'text-foreground'}`}>
                    {stat.value}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ============ EL PROBLEMA ============ */}
          <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-8 md:pb-32">
            <article className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
              <div>
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-foreground">
                    <Zap size={14} className="text-muted-foreground" />
                    01
                  </span>
                  <span className="rounded-md border border-border/50 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">El problema</span>
                </div>

                <h2 className="text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.6rem]">
                  Los resultados mediocres no son culpa de la IA. Son culpa del <em className="not-italic text-primary/90">prompt</em>.
                </h2>

                <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                  La misma IA que hoy te da respuestas genéricas puede escribir tu marketing, enseñarte un idioma o construir tu web. Solo necesita las instrucciones correctas. Y eso es exactamente lo que te llevas: los prompts que ya funcionan, listos para copiar y pegar.
                </p>

                <ul className="mt-6 space-y-2.5">
                  <CheckItem>Prompts probados, no experimentos</CheckItem>
                  <CheckItem>Resultados de experto desde el primer mensaje</CheckItem>
                  <CheckItem>Sin cursos ni teoría: copiar, pegar y listo</CheckItem>
                </ul>

                <a href="#comprar" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
                  Quiero el banco de prompts
                  <ArrowRight size={16} />
                </a>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute -inset-8 -z-10 rounded-full bg-primary/5 blur-3xl"></div>
                  <div className="mx-auto w-full max-w-xl space-y-4">
                    {/* Prompt malo */}
                    <div className="rounded-2xl border border-border/70 bg-card p-5 opacity-70">
                      <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground">✕</span>
                        Lo que escribe todo el mundo
                      </div>
                      <p className="text-sm text-muted-foreground">“Escríbeme un post para Instagram sobre mi negocio”</p>
                      <p className="mt-3 border-t border-border/60 pt-3 text-xs italic text-muted-foreground/70">→ Resultado: genérico, robótico, inservible.</p>
                    </div>

                    {/* Prompt del banco */}
                    <div className="rounded-2xl border border-accent/40 bg-card p-5 shadow-[0_0_40px_oklch(0.72_0.16_40_/_0.08)]">
                      <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-accent/50 text-accent">✓</span>
                        Prompt del banco
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90">
                        “Actúa como estratega de contenido con 10 años creando marcas en Instagram. Escribe un post para{' '}
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-primary">[TU NEGOCIO]</span> usando la estructura hook–historia–giro–CTA, dirigido a{' '}
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-primary">[TU CLIENTE]</span>…”
                      </p>
                      <p className="mt-3 border-t border-border/60 pt-3 text-xs italic text-muted-foreground">→ Resultado: un post que suena a ti y vende.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
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
                  Empezar por 4 USD/mes
                  <ArrowRight size={16} />
                </a>
              </div>

              <div className="md:order-1">
                <div className="relative">
                  <div className="absolute -inset-8 -z-10 rounded-full bg-primary/5 blur-3xl"></div>
                  <div className="mx-auto w-full max-w-xl rounded-2xl border border-border/70 bg-card shadow-[0_0_60px_oklch(0.86_0.09_90_/_0.06)]">
                    <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Marketing · Anuncio</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                        <Copy size={14} />
                        Copiar
                      </span>
                    </div>
                    <div className="space-y-3 px-5 py-5 text-sm leading-relaxed text-foreground/90">
                      <p>
                        Actúa como un media buyer senior que ha gestionado más de 2M USD en publicidad. Escribe 3 variantes de anuncio para{' '}
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-primary">[TU PRODUCTO]</span>:
                      </p>
                      <p className="text-muted-foreground">
                        1. Una centrada en el dolor del cliente<br />
                        2. Una centrada en la transformación<br />
                        3. Una con prueba social
                      </p>
                      <p>
                        Para cada variante incluye: hook de 5 palabras, cuerpo de máximo 50 y un CTA directo. Tono:{' '}
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-primary">[TU TONO]</span>.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 border-t border-border/60 px-5 py-3.5 text-xs text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
                      Listo para pegar en Claude, ChatGPT o Gemini
                    </div>
                  </div>
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
                  <span className="text-6xl font-medium text-foreground sm:text-7xl">4</span>
                  <span className="text-2xl text-muted-foreground">USD/mes</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Menos que un café al mes. Te ahorra horas cada semana.</p>

                <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
                  <CheckItem><span className="text-foreground">+1.000 prompts probados</span> organizados en +10 categorías</CheckItem>
                  <CheckItem>Funciona con <span className="text-foreground">Claude, ChatGPT y Gemini</span></CheckItem>
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

                <p className="mt-4 text-xs text-muted-foreground">4 USD/mes · Acceso inmediato · Cancela cuando quieras</p>
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
              Quiero mis +1.000 prompts por 4 USD/mes
              <ArrowRight size={16} />
            </a>
            <p className="mt-4 text-xs text-muted-foreground">4 USD/mes · Acceso inmediato · Cancela cuando quieras</p>
          </section>
        </main>

        {/* ============ FOOTER ============ */}
        <Footer />
      </div>
    </div>
  );
};

export default Home;
