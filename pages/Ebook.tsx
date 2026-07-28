import React from 'react';

/* ─────────────────────────────────────────────────────────────
   /ebook — Página de venta del Bundle de Prompts en Notion.

   Ruta autocontenida (ver STANDALONE_ROUTES en App.tsx): trae su
   propio header y footer, y su propia tipografía (JetBrains Mono +
   Inter), aislada bajo la clase `.eb2` para no chocar con el Geist
   Mono global. El acento de marca es un negro suave (#2b2724); se
   escribe con valores arbitrarios de Tailwind a propósito, para no
   redefinir la paleta del resto de la app.
   ───────────────────────────────────────────────────────────── */

const BUY_URL = 'https://pay.hotmart.com/K99381988U?checkoutMode=10&bid=1778363157034';

const CATEGORIES = [
  'Inteligencia Artificial',
  'Marketing',
  'Redes Sociales',
  'Creación de Contenido',
  'Productividad',
  'Negocios',
  'Emprendimiento',
  'Ventas',
  'Copywriting',
  'SEO',
  'Programación',
  'Branding',
  'Educación',
  'Idiomas',
  'Escritura',
  'Finanzas',
  'Inversión',
  'Astrología',
  'Tarot',
  'Espiritualidad',
  'Psicología',
];

const FAQS = [
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

/* Botón de compra reutilizable. `tone="light"` es para fondo oscuro. */
const BuyButton: React.FC<{ label: string; tone?: 'dark' | 'light'; className?: string }> = ({
  label,
  tone = 'dark',
  className = '',
}) => (
  <a
    href={BUY_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={`${
      tone === 'light'
        ? 'bg-white hover:bg-slate-100 text-[#2b2724]'
        : 'bg-[#2b2724] hover:bg-[#1a1715] text-white'
    } font-bold text-sm px-5 py-2.5 rounded shadow-sm transition inline-flex items-center gap-2 whitespace-nowrap ${className}`}
  >
    <span>{label}</span>
    <span>→</span>
  </a>
);

/* Banda de conversión que se intercala entre secciones. */
const CtaBand: React.FC<{ text: string; label: string }> = ({ text, label }) => (
  <div className="mt-10 bg-white border border-slate-300 rounded-lg px-5 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div className="space-y-1">
      <p className="text-sm font-bold text-slate-900">{text}</p>
      <p className="text-[13px] text-slate-500 font-sans">
        Pago único de $10 · acceso en 2 minutos · garantía de 30 días
      </p>
    </div>
    <BuyButton label={label} className="shrink-0 self-start sm:self-auto" />
  </div>
);

const Ebook: React.FC = () => {
  return (
    <div className="eb2 min-h-screen bg-[#f5f5f7] text-slate-900">
      <style>{`
        .eb2 { font-family: 'JetBrains Mono', ui-monospace, monospace; color: #111827; }
        .eb2 .font-sans { font-family: 'Inter', system-ui, sans-serif; }
        .eb2 .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .eb2 ::selection { background-color: #2b2724; color: #ffffff; }
      `}</style>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-[#f5f5f7]/90 backdrop-blur-md border-b border-slate-300/70 text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="#" className="flex items-center gap-2 font-bold text-slate-900 tracking-tight text-base">
              <span className="w-4 h-4 rounded-full bg-[#2b2724] inline-block" />
              <span>alpacka.ai</span>
            </a>
            <nav className="hidden lg:flex items-center gap-5 text-slate-600 font-medium">
              <a href="#producto" className="hover:text-slate-900 transition">Qué es</a>
              <a href="#como-funciona" className="hover:text-slate-900 transition">Cómo funciona</a>
              <a href="#categorias" className="hover:text-slate-900 transition">Categorías</a>
              <a href="#precio" className="hover:text-slate-900 transition">Precio</a>
              <a href="#garantia" className="hover:text-slate-900 transition">Garantía</a>
              <a href="#faq" className="hover:text-slate-900 transition">FAQ</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-[11px] font-semibold rounded border border-slate-300">
              +200 prompts
            </span>
            <a
              href={BUY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2b2724] hover:bg-[#1a1715] text-white font-medium px-3 py-1.5 rounded transition text-sm shadow-sm"
            >
              Comprar — $10
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 md:pt-16 md:pb-24 grid md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-6 space-y-6 pt-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-slate-300 bg-white/80 text-[13px] text-slate-700 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2b2724]" />
            <span>Biblioteca de prompts en Notion <span className="text-slate-400">· acceso inmediato</span></span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            El prompt correcto, <br />
            a un clic <br />
            de distancia.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md font-sans">
            Deja de reescribir la misma instrucción cada vez que abres ChatGPT. Más de 200 prompts probados,
            ordenados en Notion, listos para copiar y pegar en ChatGPT, Claude o Gemini.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={BUY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2b2724] hover:bg-[#1a1715] text-white font-medium text-sm px-4 py-2.5 rounded flex items-center gap-2 shadow-sm transition"
            >
              <span className="bg-[#857d7680] px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                Pago único
              </span>
              <span>Acceder por $10</span>
            </a>
            <a
              href="#producto"
              className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-medium text-sm px-3.5 py-2.5 rounded flex items-center gap-2 shadow-sm transition"
            >
              <span>Ver qué incluye</span>
              <kbd className="bg-slate-100 border border-slate-300 text-[11px] px-1 py-0.5 rounded text-slate-500">↓</kbd>
            </a>
          </div>

          <p className="text-[13px] text-slate-500 font-sans">
            Antes $37 — hoy $10. Sin suscripción. Actualizaciones incluidas de por vida.
          </p>

          <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-4 text-[13px] text-slate-500">
            <span>Acceso en 2 minutos</span>
            <span>·</span>
            <span>Garantía de 30 días</span>
            <span>·</span>
            <span>Funciona en cualquier IA</span>
          </div>
        </div>

        {/* Imagen del producto */}
        <div className="md:col-span-6 relative">
          <div className="bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden">
            <img
              src="/bundlevtwo.png"
              alt="Bundle de Prompts de alpacka.ai abierto en Notion, con las categorías incluidas y el número de prompts de cada una"
              className="w-full h-auto block"
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="bg-white border border-slate-300 px-1.5 py-0.5 rounded font-mono shadow-sm">21 categorías</span>
            <span className="bg-white border border-slate-300 px-1.5 py-0.5 rounded font-mono shadow-sm">+200 prompts</span>
            <span className="text-slate-400">así se ve por dentro</span>
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS ── */}
      <section id="categorias" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-300/80">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-3">
            <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest">CATEGORÍAS</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Hay un prompt para <br />casi todo lo que haces.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              Da igual si vives del marketing, escribes correos todo el día, estás armando tu negocio o llevas
              cartas del tarot: vas a encontrar los tuyos. Todo filtrable por categoría dentro de Notion.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <span className="bg-white border border-slate-300 px-2 py-0.5 rounded shadow-sm">21 categorías</span>
              <span className="bg-white border border-slate-300 px-2 py-0.5 rounded shadow-sm">+200 prompts</span>
            </div>
          </div>

          <div className="md:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {CATEGORIES.map((name) => (
                <div
                  key={name}
                  className="bg-white border border-slate-300 rounded px-3 py-2.5 flex items-center gap-2 shadow-sm hover:border-[#b5aea6] transition"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2b2724] shrink-0" />
                  <span className="text-[13px] font-medium text-slate-800">{name}</span>
                </div>
              ))}
              <div className="bg-[#f5f4f2] border border-[#dbd7d1] rounded px-3 py-2.5 flex items-center gap-2 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2b2724] shrink-0" />
                <span className="text-[13px] font-bold text-[#1a1715]">+ nuevas cada semana</span>
              </div>
            </div>
          </div>
        </div>

        <CtaBand text="Tu categoría ya está ahí dentro, con los +200 prompts." label="Acceder por $10" />
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-300/80">
        <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest mb-1">Así de simple</div>
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Copiar, pegar, listo. <br />En serio, eso es todo.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              Nada que instalar y nada que aprender. Abres la biblioteca en Notion, filtras por categoría, copias
              el prompt con un clic y lo pegas en la IA que ya usas. Si sabes usar ChatGPT aunque sea a medias,
              esto lo dominas en el primer minuto.
            </p>
            <div className="pt-2 flex items-center gap-2 text-sm text-slate-600">
              <kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded shadow-sm text-[11px]">⌘</kbd>
              <span>+</span>
              <kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded shadow-sm text-[11px]">C</kbd>
              <span className="text-slate-400">y</span>
              <kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded shadow-sm text-[11px]">V</kbd>
              <span className="text-slate-500 text-[13px]">es toda la curva de aprendizaje</span>
            </div>
          </div>

          <div className="md:col-span-7 bg-white border border-slate-300 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[11px] text-slate-500">
              <span className="font-bold text-slate-800 uppercase tracking-wider">TU FLUJO DIARIO</span>
              <span className="text-slate-400">menos de 60 segundos</span>
            </div>

            <div className="space-y-3 text-sm">
              {[
                {
                  n: '01',
                  title: 'Encuentra',
                  tag: 'Categoría',
                  desc: 'Abre la biblioteca en Notion y filtra por categoría o busca por palabra clave. En segundos tienes el prompt exacto para lo que necesitas hoy.',
                },
                {
                  n: '02',
                  title: 'Copia',
                  tag: 'Un clic',
                  desc: 'Ya viene con rol, contexto, instrucción y formato definidos. No tienes que redactar nada: solo copiar.',
                },
                {
                  n: '03',
                  title: 'Completa',
                  tag: 'Corchetes',
                  desc: 'Cambias los campos entre corchetes por tus datos: tu cliente, tu producto, tu tono. Diez segundos de trabajo.',
                },
                {
                  n: '04',
                  title: 'Pega',
                  tag: 'Tu IA',
                  desc: 'Lo mandas a ChatGPT, Claude o Gemini y recibes una respuesta de nivel experto. A la primera, sin cinco intentos.',
                },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded bg-[#f5f4f2] border border-[#dbd7d1] text-[#2b2724] font-bold text-[11px] flex items-center justify-center shrink-0">
                    {step.n}
                  </span>
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span>{step.title}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{step.tag}</span>
                    </div>
                    <p className="text-[13px] text-slate-500 font-sans">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded text-[13px] text-slate-600 font-mono">
              <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">✓ Prompt listo para pegar</div>
              <div className="text-slate-800">
                Actúa como director comercial B2B. Escribe un email de seguimiento a [CLIENTE] tras la demo de
                [PRODUCTO], en tono directo, máximo 120 palabras, con una sola llamada a la acción.
              </div>
            </div>
          </div>
        </div>

        <CtaBand text="Puedes estar usando el primer prompt en dos minutos." label="Empezar ahora — $10" />
      </section>

      {/* ── EL PRODUCTO ── */}
      <section id="producto" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-300/80 space-y-16">
        <div>
          <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest mb-1">Lo que te llevas</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Una biblioteca de prompts <br />que sí puedes usar todos los días.
          </h2>
        </div>

        {/* Bloque 1 — biblioteca */}
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-4">
            <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest">+200 Prompts</div>
            <h3 className="text-xl font-bold text-slate-900">Todo ordenado en Notion, no en un PDF muerto.</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              Es un espacio de Notion que puedes duplicar en tu propia cuenta: base de datos, filtros, búsqueda y
              botón de copiar. Nada de hacer Ctrl+F en un archivo de 80 páginas para encontrar el prompt que
              usaste el mes pasado.
            </p>
            <ul className="text-sm text-slate-700 space-y-2 font-sans">
              {[
                'Filtra por categoría o busca por caso de uso en segundos.',
                'Duplícalo en tu Notion y añade los tuyos.',
                'Cada prompt se copia con un clic, sin formato roto.',
              ].map((li) => (
                <li key={li} className="flex items-center gap-2">
                  <span className="text-[#2b2724] font-bold">✓</span>
                  <span>{li}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-7 bg-white border border-slate-300 rounded-lg p-4 shadow-md text-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2b2724]" />
                <span className="font-bold text-slate-800">Biblioteca de Prompts</span>
              </div>
              <div className="text-[11px] text-slate-400">buscar · filtrar · copiar</div>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4 border-r border-slate-200 pr-2 space-y-2 text-[11px] text-slate-500">
                <div className="font-bold text-slate-700 text-[13px]">Categorías</div>
                <div className="text-[#2b2724] font-medium">⚡ Productividad · 42</div>
                <div className="pt-2 font-bold text-slate-700">FILTROS</div>
                <div className="flex flex-wrap gap-1">
                  {['Marketing', 'Ventas', 'Email'].map((t) => (
                    <span key={t} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="col-span-8 space-y-2">
                {[
                  {
                    title: '★ Resumen ejecutivo con decisiones',
                    tag: 'NEGOCIOS',
                    featured: true,
                    desc: 'Convierte [NOTAS] en un resumen con próximos pasos...',
                  },
                  {
                    title: '★ Copy de anuncio que convierte',
                    tag: 'ADS',
                    featured: false,
                    desc: '3 variantes para [PRODUCTO] con ángulos distintos...',
                  },
                  {
                    title: '★ Análisis FODA con plan de acción',
                    tag: 'ESTRATEGIA',
                    featured: false,
                    desc: 'Cuadrante por cuadrante y qué hacer con cada uno...',
                  },
                ].map((row) => (
                  <div key={row.tag} className="p-2 border border-slate-200 rounded hover:border-[#b5aea6]">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>{row.title}</span>
                      <span
                        className={
                          row.featured
                            ? 'text-[10px] bg-[#f5f4f2] text-[#1a1715] px-1 rounded uppercase'
                            : 'text-[10px] bg-slate-100 text-slate-600 px-1 rounded uppercase'
                        }
                      >
                        {row.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{row.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bloque 2 — anatomía del prompt */}
        <div className="grid md:grid-cols-12 gap-8 items-center pt-8">
          <div className="md:col-span-7 order-2 md:order-1 bg-white border border-slate-300 rounded-lg p-4 shadow-md text-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <span className="font-bold text-slate-800 text-[13px]">Anatomía de un prompt de la biblioteca</span>
              <span className="bg-[#2b2724] text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">Copiar</span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3 border border-slate-200 rounded space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Lo que ya viene escrito</div>
                {[
                  'Rol de la IA (quién debe ser)',
                  'Contexto y objetivo',
                  'Formato exacto de la respuesta',
                ].map((row) => (
                  <div key={row} className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#2b2724]">▸</span>
                      {row}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded">HECHO</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-3 border border-slate-200 rounded space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Lo único que pones tú</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-1.5 border border-slate-200 rounded">
                    <span className="text-slate-400">[CLIENTE]:</span> <span className="font-bold text-slate-800">tu cliente</span>
                  </div>
                  <div className="bg-white p-1.5 border border-slate-200 rounded">
                    <span className="text-slate-400">[TONO]:</span> <span className="font-bold text-slate-800">directo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 order-1 md:order-2 space-y-4">
            <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest">La diferencia</div>
            <h3 className="text-xl font-bold text-slate-900">Un buen prompt no es más largo. Está mejor armado.</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              Los prompts que circulan gratis por internet son gratis por algo: sirven a medias. La IA no te lee
              la mente; si le das tres palabras, te devuelve tres palabras. Los míos llegan con el trabajo hecho.
            </p>
            <ul className="text-sm text-slate-700 space-y-2 font-sans">
              {[
                'Le dice a la IA quién es y desde dónde responde.',
                'Define el formato para que no tengas que reescribir.',
                'Tú solo rellenas los corchetes con tus datos.',
              ].map((li) => (
                <li key={li} className="flex items-center gap-2">
                  <span className="text-[#2b2724] font-bold">✓</span>
                  <span>{li}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bloque 3 — actualizaciones */}
        <div className="grid md:grid-cols-12 gap-8 items-center pt-8">
          <div className="md:col-span-5 space-y-4">
            <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest">Actualizaciones</div>
            <h3 className="text-xl font-bold text-slate-900">Compras una vez. Sigue creciendo para siempre.</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              Cada vez que añado prompts nuevos, aparecen solos en tu espacio de Notion. Cuando sale un modelo
              nuevo o un caso de uso que no estaba, lo agrego. Sin cobrarte de nuevo y sin "versión 2.0" que
              tengas que comprar aparte.
            </p>
            <ul className="text-sm text-slate-700 space-y-2 font-sans">
              {[
                'Prompts nuevos cada semana, sin costo extra.',
                'No es una suscripción: es un pago único.',
                'Se actualiza solo, tú no haces nada.',
              ].map((li) => (
                <li key={li} className="flex items-center gap-2">
                  <span className="text-[#2b2724] font-bold">✓</span>
                  <span>{li}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-7 bg-white border border-slate-300 rounded-lg p-4 shadow-md text-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <span className="font-bold text-slate-800 text-[13px]">Historial de la biblioteca</span>
              <span className="text-[11px] text-slate-400">incluido de por vida</span>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4 border-r border-slate-200 pr-2 space-y-2 text-[11px]">
                <div className="p-1.5 bg-[#f5f4f2] border border-[#dbd7d1] rounded font-bold text-[#1a1715] flex justify-between items-center">
                  <span>Versión actual</span>
                  <span className="text-[10px]">+200</span>
                </div>
                <div className="p-1.5 hover:bg-slate-50 text-slate-600 flex justify-between items-center">
                  <span>Nicho: e-commerce</span>
                  <span className="text-[10px] text-slate-400">NUEVO</span>
                </div>
                <div className="p-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded flex justify-between items-center">
                  <span>Guía de prompting</span>
                  <span className="text-[10px]">incluida</span>
                </div>
              </div>

              <div className="col-span-8 bg-slate-50 border border-slate-200 p-3 rounded space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">Último añadido</span>
                  <span className="text-amber-500">★★★★★</span>
                </div>
                <div className="p-2 bg-white border border-slate-200 rounded text-[11px] text-slate-700 space-y-1">
                  <div className="text-emerald-600 font-semibold">
                    + 50 prompts por nicho: inmobiliaria, e-commerce, salud, legal y educación.
                  </div>
                  <div className="text-slate-500 font-sans">
                    Ya están disponibles en tu espacio. No tienes que hacer nada ni pagar nada extra.
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <span className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-semibold text-slate-700">
                    Sin suscripción
                  </span>
                  <span className="px-2 py-1 bg-slate-900 text-white rounded text-[11px] font-semibold">Pago único</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bloque 4 — el paquete */}
        <div className="bg-white border border-slate-300 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest">EL PAQUETE COMPLETO</div>
          <div className="max-w-xl space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              No es solo una lista de prompts. <br />Es todo el sistema, por $10.
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              Sin letra pequeña ni "pero". Esto es literalmente todo lo que recibes en el correo, dos minutos
              después de pagar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-4">
            {[
              {
                eyebrow: '01 BIBLIOTECA',
                title: '+200 prompts en Notion',
                desc: '21 categorías, filtros por caso de uso y cada prompt listo para copiar en un clic.',
              },
              {
                eyebrow: '02 EXTRAS POR NICHO',
                title: '50 prompts adicionales',
                desc: 'Inmobiliaria, e-commerce, salud, legal y educación. Casos específicos, directo al grano.',
              },
              {
                eyebrow: '03 GUÍA',
                title: 'Prompt engineering',
                desc: 'Los principios detrás de cada prompt, para que crees los tuyos cuando ninguno encaje exacto.',
              },
            ].map((card) => (
              <div key={card.eyebrow} className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">{card.eyebrow}</div>
                <div className="font-bold text-slate-800 text-sm">{card.title}</div>
                <p className="text-[13px] text-slate-500 font-sans">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <BuyButton label="Llevarme el paquete — $10" />
            <span className="text-[13px] text-slate-500 font-sans">
              Todo junto, un solo pago. Sin suscripción ni cobros después.
            </span>
          </div>
        </div>
      </section>

      {/* ── EL PROBLEMA (sección oscura) ── */}
      <section className="bg-[#0b0f19] text-white py-16 sm:py-24 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-4">
            <div className="text-[11px] font-bold text-[#c4c0bb] uppercase tracking-widest">EL PROBLEMA REAL</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Usas ChatGPT a diario y sigue dándote respuestas tibias.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              El problema no es la IA: es cómo le pides las cosas. Le escribes "hazme un email de ventas",
              esperas magia, y te devuelve algo tan genérico como tu pregunta.
            </p>

            <div className="space-y-4 pt-4 text-sm">
              {[
                {
                  icon: '🔁',
                  title: 'Pierdes tiempo reescribiendo',
                  desc: 'Tres intentos, cinco correcciones y al final terminas escribiéndolo tú a mano. Otra vez.',
                },
                {
                  icon: '📉',
                  title: 'Resultados que no puedes publicar',
                  desc: 'Texto corporativo, listas obvias y ese "Claro, con gusto te ayudo" que ya nadie soporta.',
                },
                {
                  icon: '✅',
                  title: 'Con el prompt bien hecho, te sirve la primera',
                  desc: 'Sin el "¿me das más contexto?" de siempre. Copias la respuesta y sigues con tu día.',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-[#c4c0bb] text-lg">{item.icon}</span>
                  <div>
                    <div className="font-bold text-slate-200">{item.title}</div>
                    <p className="text-[13px] text-slate-400 font-sans">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <BuyButton label="Saltarme la curva — $10" tone="light" />
            </div>
          </div>

          <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#857d76]" />
                <span className="font-bold text-slate-300">Lo que pides vs. lo que recibes</span>
              </span>
              <span>CASOS REALES</span>
            </div>

            <div className="space-y-2 text-[13px]">
              {[
                { left: '"escribe un email de ventas"', ok: false, right: 'Texto corporativo que nadie abriría' },
                { left: '"dame una estrategia de marketing"', ok: false, right: 'Cinco puntos obvios que ya sabías' },
                { left: '"ayúdame con mis redes"', ok: false, right: 'Tres reescrituras y sigues en blanco' },
                { left: 'Prompt de la biblioteca', ok: true, right: 'Respuesta lista para usar, a la primera' },
              ].map((row) => (
                <div key={row.left} className="flex items-center justify-between text-slate-300 gap-3">
                  <span className={row.ok ? 'text-[#c4c0bb] font-bold' : 'text-slate-500'}>{row.left}</span>
                  <span className={row.ok ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {row.ok ? '✓' : '✕'}
                  </span>
                  <span className={row.ok ? 'text-slate-400 text-right' : 'text-slate-500 text-right'}>{row.right}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded text-[13px] space-y-1 mt-4">
              <div className="text-[#c4c0bb] font-bold uppercase">APRENDER A PROMPTEAR CUESTA MESES</div>
              <p className="text-slate-400 font-sans">
                Ese trabajo ya lo hice yo. Tú solo copias el resultado: $10, una vez, y te ahorras la curva
                completa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPATIBILIDAD ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-300/80">
        <div className="bg-white border border-slate-300 rounded-xl p-6 md:p-8 shadow-sm grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 space-y-3">
            <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest">COMPATIBLE CON TODO</div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Un prompt, todas las IAs que ya usas.</h2>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              No están optimizados para un solo modelo. Están escritos bajo principios de ingeniería del lenguaje
              que funcionan en cualquier IA generativa: ChatGPT, Claude, Gemini, Copilot, Grok, DeepSeek… y lo que
              salga mañana.
            </p>
          </div>

          <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              { icon: '◉', label: 'ChatGPT, Claude y Gemini' },
              { icon: '◉', label: 'Copilot, Grok, DeepSeek y más' },
              { icon: '⚡', label: 'Funciona en la versión gratis' },
              { icon: '🇪🇸', label: 'Todo en español, listo para usar' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 border border-slate-200 p-3 rounded flex items-center gap-2">
                <span className="text-[#2b2724] font-bold">{item.icon}</span>
                <span className="text-[13px] font-medium text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARATIVA ── */}
      <section id="comparar" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-300/80 space-y-6">
        <div>
          <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest">COMPARA</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Por qué esto no es "otro pack de prompts".
          </h2>
          <p className="text-sm text-slate-600 font-sans mt-1">
            Los prompts sueltos de internet, los PDF de 300 páginas y los cursos de IA cubren un pedazo del
            problema. Esto cubre el trabajo completo: encontrar, copiar, personalizar y obtener el resultado.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 text-[11px]">
                <th className="py-3 px-3 font-bold uppercase">QUÉ NECESITAS</th>
                <th className="py-3 px-3 font-semibold uppercase text-center">
                  PROMPTS GRATIS <br />
                  <span className="text-[10px] font-normal text-slate-400">Internet / TikTok</span>
                </th>
                <th className="py-3 px-3 font-semibold uppercase text-center">
                  PACKS EN PDF <br />
                  <span className="text-[10px] font-normal text-slate-400">Listas sueltas</span>
                </th>
                <th className="py-3 px-3 font-semibold uppercase text-center">
                  CURSOS DE IA <br />
                  <span className="text-[10px] font-normal text-slate-400">$200+</span>
                </th>
                <th className="py-3 px-3 font-bold uppercase text-center text-[#2b2724] bg-[#f5f4f280] rounded-t border-t border-x border-[#dbd7d1]">
                  BIBLIOTECA ALPACKA <br />
                  <span className="text-[10px] font-semibold text-[#2b2724]">$10 pago único</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[13px] text-slate-700">
              {[
                { feature: 'Listos para copiar y pegar', gratis: 'A medias', pdf: '✓', curso: '—' },
                { feature: 'Estructura completa (rol, contexto, formato)', gratis: '—', pdf: 'Parcial', curso: '✓' },
                { feature: 'Organizado, filtrable y buscable', gratis: '—', pdf: 'Ctrl+F', curso: '—' },
                {
                  feature: 'Funciona en ChatGPT, Claude, Gemini y Copilot',
                  gratis: 'Depende',
                  pdf: 'Depende',
                  curso: 'Teoría',
                },
                { feature: 'Actualizaciones incluidas', gratis: '—', pdf: '—', curso: 'Otro curso' },
                { feature: 'Sin suscripción', gratis: '✓', pdf: '✓', curso: '—' },
                { feature: 'Tiempo hasta tu primer resultado útil', gratis: 'Horas', pdf: 'Días', curso: 'Semanas' },
              ].map((row, i) => {
                const cell = (v: string) =>
                  v === '—' ? 'text-center text-slate-300' : v === '✓' ? 'text-center text-[#2b2724]' : 'text-center text-slate-500';
                return (
                  <tr key={row.feature}>
                    <td className="py-3 px-3 font-semibold">{row.feature}</td>
                    <td className={cell(row.gratis)}>{row.gratis}</td>
                    <td className={cell(row.pdf)}>{row.pdf}</td>
                    <td className={cell(row.curso)}>{row.curso}</td>
                    <td className="text-center font-bold text-[#2b2724] bg-[#f5f4f24d] border-x border-[#dbd7d1]">
                      {i === 6 ? '2 min' : '✓'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <CtaBand text="La única columna con todos los ✓ cuesta $10, una sola vez." label="Quiero esa columna" />
      </section>

      {/* ── PRECIO ── */}
      <section id="precio" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-300/80 space-y-8">
        <div>
          <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest">PRECIO</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            $10 una sola vez. Nada más, nunca.
          </h2>
          <p className="text-sm text-slate-600 font-sans mt-1">
            Pagas, te llega el enlace a Notion en menos de 2 minutos y ya es tuyo para siempre. No hay suscripción,
            no hay upsell escondido, no hay "versión premium" más adelante.
          </p>
        </div>

        <div className="bg-white border-2 border-[#2b2724] rounded-xl shadow-md overflow-hidden grid md:grid-cols-12 max-w-4xl">
          <div className="md:col-span-5 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-base">Biblioteca alpacka.ai</span>
              <span className="text-[10px] font-bold text-[#1a1715] uppercase bg-[#f5f4f2] px-1.5 py-0.5 rounded border border-[#dbd7d1]">
                LANZAMIENTO
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-slate-900 tracking-tight">$10</span>
              <div className="leading-tight">
                <div className="text-[11px] text-slate-400 line-through">$37</div>
                <div className="text-[13px] text-slate-500 font-sans">pago único</div>
              </div>
            </div>

            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              Un solo pago. Acceso de por vida a todo el espacio de Notion, con las actualizaciones incluidas
              para siempre.
            </p>

            <a
              href={BUY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#2b2724] hover:bg-[#1a1715] text-white font-bold text-sm py-3 rounded transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Quiero la biblioteca — $10</span>
              <span>→</span>
            </a>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500 font-sans">
              <span>Acceso en 2 min</span>
              <span>·</span>
              <span>Garantía 30 días</span>
              <span>·</span>
              <span>Sin suscripción</span>
            </div>
          </div>

          <div className="md:col-span-7 p-6 md:p-8 bg-slate-50 space-y-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">TODO ESTO INCLUIDO</div>
            <ul className="text-sm text-slate-700 space-y-2.5 font-sans">
              {[
                '+200 prompts en Notion, repartidos en 21 categorías',
                '50 prompts extra por nicho: inmobiliaria, e-commerce, salud, legal y educación',
                'Guía de prompt engineering para crear los tuyos',
                'Prompts nuevos cada semana, sin costo extra',
                'Compatible con ChatGPT, Claude, Gemini, Copilot y cualquier IA',
                'Puedes duplicarlo en tu propia cuenta de Notion',
                'Garantía de 30 días: si no te sirve, te devuelvo el 100%',
              ].map((li) => (
                <li key={li} className="flex items-start gap-2">
                  <span className="text-[#2b2724] font-bold">✓</span>
                  <span>{li}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-[13px] text-slate-500 font-sans">Pago seguro vía Hotmart · Acceso a Notion por email</div>
      </section>

      {/* ── GARANTÍA ── */}
      <section id="garantia" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-300/80">
        <div className="bg-white border border-slate-300 rounded-xl p-6 md:p-8 shadow-sm grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-3">
            <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest">SIN RIESGO</div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Si no te sirve, te devuelvo cada centavo.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              Tienes 30 días. Ábrelo, úsalo, exprímelo. Si sientes que no valió la pena, me escribes y te devuelvo
              el 100%. Sin formularios raros, sin emails de retención, sin "espera, déjame explicarte por qué
              deberías quedarte". No me interesa quedarme con el dinero de alguien que no quedó contento.
            </p>
            <div className="pt-1">
              <BuyButton label="Probarlo sin riesgo — $10" />
            </div>
          </div>

          <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              { icon: '🛡️', label: '30 días de garantía' },
              { icon: '⚡', label: 'Acceso en 2 minutos' },
              { icon: '💳', label: 'Pago único de $10' },
              { icon: '♾️', label: 'Actualizaciones de por vida' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 border border-slate-200 p-3 rounded flex items-center gap-2">
                <span className="text-[#2b2724] font-bold">{item.icon}</span>
                <span className="text-[13px] font-medium text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-300/80 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-3">
          <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest">PREGUNTAS FRECUENTES</div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lo que me preguntan antes de comprar.</h2>
          <p className="text-sm text-slate-600 font-sans leading-relaxed">
            Respuestas claras sobre acceso, formato, compatibilidad, actualizaciones y garantía. Si te queda alguna
            duda, escríbeme antes de pagar.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 pt-2">
            {['Acceso', 'Formato', 'Compatibilidad', 'Garantía'].map((t) => (
              <span key={t} className="bg-slate-200 px-2 py-0.5 rounded">{t}</span>
            ))}
          </div>
        </div>

        <div className="md:col-span-7 bg-white border border-slate-300 rounded-xl divide-y divide-slate-200 text-sm shadow-sm">
          {FAQS.map((faq, i) => (
            <details key={faq.q} className="p-4 group">
              <summary className="font-bold text-slate-800 cursor-pointer flex justify-between items-center list-none">
                <span>
                  {String(i + 1).padStart(2, '0')} {faq.q}
                </span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="mt-2 text-slate-600 text-[13px] font-sans leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-white border border-slate-300 rounded-xl p-8 md:p-10 shadow-sm grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="text-[11px] font-bold text-[#2b2724] uppercase tracking-widest">PRECIO DE LANZAMIENTO</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Sigues peleando con la IA, o copias los que ya funcionan.
            </h2>
            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              Son $10, una sola vez. Lo tienes en tu correo en un par de minutos. Y si no te sirve, te devuelvo el
              dinero sin preguntar. Lo peor que puede pasar es que no pierdas nada.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={BUY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2b2724] hover:bg-[#1a1715] text-white font-medium text-sm px-5 py-2.5 rounded shadow-sm transition"
              >
                Quiero la biblioteca — $10 →
              </a>
              <span className="text-[13px] text-slate-500 font-sans">
                Pago único · sin suscripción · garantía de 30 días
              </span>
            </div>
          </div>

          <div className="md:col-span-5 bg-slate-50 border border-slate-200 p-4 rounded-lg text-sm space-y-2">
            <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold border-b border-slate-200 pb-1">
              <span>Lo que recibes hoy</span>
              <span className="border border-slate-300 px-1 rounded bg-white">$10</span>
            </div>
            <div className="space-y-1.5 text-slate-700 font-sans text-[13px]">
              {[
                '+200 prompts en Notion',
                '50 prompts extra por nicho',
                'Guía de prompt engineering',
                'Actualizaciones de por vida',
              ].map((li) => (
                <div key={li} className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> {li}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-300/80 bg-[#f5f5f7] py-12 text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <span className="w-3.5 h-3.5 rounded-full bg-[#2b2724] inline-block" />
                <span>alpacka.ai</span>
              </div>
              <p className="text-[13px] text-slate-500 font-sans leading-relaxed max-w-xs">
                Una biblioteca de prompts en Notion para gente que usa la IA todos los días y quiere resultados
                a la primera. Copiar, pegar, listo.
              </p>
              <div className="flex gap-2 text-[11px] text-slate-400">
                {['$10 pago único', 'Notion', '+200 prompts'].map((t) => (
                  <span key={t} className="bg-slate-200 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-800 uppercase text-[11px] tracking-wider mb-3">PRODUCTO</div>
              <ul className="space-y-2 text-[13px] text-slate-500 font-sans">
                <li><a href="#producto" className="hover:text-slate-800">Qué incluye</a></li>
                <li><a href="#como-funciona" className="hover:text-slate-800">Cómo funciona</a></li>
                <li><a href="#categorias" className="hover:text-slate-800">Categorías</a></li>
                <li><a href="#precio" className="hover:text-slate-800">Precio</a></li>
                <li><a href="#garantia" className="hover:text-slate-800">Garantía</a></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-slate-800 uppercase text-[11px] tracking-wider mb-3">RECURSOS</div>
              <ul className="space-y-2 text-[13px] text-slate-500 font-sans">
                <li><a href="#faq" className="hover:text-slate-800">Preguntas frecuentes</a></li>
                <li><a href="/blog" className="hover:text-slate-800">Blog</a></li>
                <li><a href="/prompts" className="hover:text-slate-800">Prompts</a></li>
                <li>
                  <a href={BUY_URL} target="_blank" rel="noopener noreferrer" className="hover:text-slate-800">
                    Comprar
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-slate-800 uppercase text-[11px] tracking-wider mb-3">LEGAL</div>
              <ul className="space-y-2 text-[13px] text-slate-500 font-sans">
                <li><a href="/terms" className="hover:text-slate-800">Términos</a></li>
                <li><a href="/privacy" className="hover:text-slate-800">Privacidad</a></li>
                <li>
                  <a href="mailto:estebanblancohernandez@gmail.com" className="hover:text-slate-800">Contacto</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-300/60 pt-6 flex flex-col sm:flex-row justify-between items-center text-[13px] text-slate-400 font-sans gap-2">
            <div>© 2026 alpacka.ai. Sin afiliación con OpenAI, Anthropic, Google ni Notion.</div>
            <div>alpackaai.xyz</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Ebook;
