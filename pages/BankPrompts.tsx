import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, ArrowDown, ArrowUpRight, Check, Copy, Plus, Search, Shield } from 'lucide-react';
import AlpacaIcon from '../components/AlpacaIcon';
import { OpenAILogo, ClaudeLogo, GeminiLogo, GrokLogo, DeepSeekLogo } from '../components/AiLogos';
import { SANS, MONO, LandingStyles } from '../components/landingKit';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ══════════════════════════════════════════════════════════════
   /bank-prompts — Página de ventas del pack de prompts en Notion.
   Autocontenida (sin DarkHeader/DarkFooter). Se vende por Hotmart,
   igual que /ebook.

   Estética editorial: papel + tinta, tipografía grande, secciones
   numeradas y animación con GSAP. Todo el contenido es HTML real
   (nada de imágenes de texto) y las animaciones se desactivan con
   prefers-reduced-motion.
   ══════════════════════════════════════════════════════════════ */

/* Checkout de Hotmart (el mismo producto que /ebook) */
const BUY_URL = 'https://pay.hotmart.com/K99381988U?checkoutMode=10&bid=1778363157034';

/* Precio en un solo sitio: si cambia en Hotmart, se cambia aquí. */
const PRICE = '19,99$';
const PRICE_BEFORE = '29$';
const PER_PROMPT = '0,04$';

/* ─── Paleta ─── */
const PAPER = '#f3f0e9';
const PAPER_2 = '#ebe7dd';
const CARD = '#fbfaf6';
const INK = '#121211';
const INK_2 = '#1c1c1a';
const MUTED = '#6d6b64';
const FAINT = '#a3a097';
const LINE = 'rgba(18,18,17,0.12)';
/* Amarillo de la marca (el de la página de ventas anterior). Sobre el papel
   no se lee como color de texto, así que ahí va como subrayado de rotulador
   detrás de texto oscuro; como relleno (botones, chips) y sobre tinta, tal cual. */
const ACCENT = '#ffc93e';
const ON_ACCENT = '#1a1500';
const ACCENT_DEEP = '#a87600';   // acentos pequeños de texto sobre papel
const MARKER = `linear-gradient(transparent 56%, ${ACCENT} 56%, ${ACCENT} 92%, transparent 92%)`;
const ON_INK = '#f3f0e9';
const ON_INK_MED = 'rgba(243,240,233,0.62)';
const ON_INK_DIM = 'rgba(243,240,233,0.36)';
const INK_LINE = 'rgba(243,240,233,0.12)';

/* ─── Botón de compra ─── */
const BuyButton: React.FC<{ label?: string; size?: 'sm' | 'md' | 'lg'; tone?: 'ink' | 'accent'; full?: boolean }> = ({
  label = 'Conseguir el pack', size = 'md', tone = 'ink', full,
}) => (
  <a
    href={BUY_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={`bp-btn bp-btn-${tone} bp-btn-${size}`}
    style={{ width: full ? '100%' : undefined }}
  >
    <span>{label}</span>
    <span className="bp-btn-ic"><ArrowRight size={size === 'sm' ? 14 : 17} strokeWidth={2.2} /></span>
  </a>
);

/* ─── Etiqueta de sección: "01 — El problema" ─── */
const SectionTag: React.FC<{ n: string; children: React.ReactNode; dark?: boolean }> = ({ n, children, dark }) => (
  <div
    className="flex items-center gap-3"
    style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: dark ? ON_INK_DIM : MUTED, marginBottom: 28 }}
  >
    <span style={{ color: dark ? ON_INK : INK }}>{n}</span>
    <span style={{ width: 28, height: 1, backgroundColor: dark ? INK_LINE : LINE }} />
    <span>{children}</span>
  </div>
);

const H2: React.FC<{ children: React.ReactNode; dark?: boolean; className?: string }> = ({ children, dark, className = '' }) => (
  <h2
    className={className}
    style={{
      fontWeight: 700, fontSize: 'clamp(2rem, 4.6vw, 4rem)', lineHeight: 1.02, letterSpacing: '-0.045em',
      color: dark ? ON_INK : INK,
    }}
  >
    {children}
  </h2>
);

/* ══════════ Mockup del Notion (hecho en código, no imagen) ══════════ */
type Row = { title: string; sub: string; area: string; kw: string };

const ROWS: Row[] = [
  { title: 'Email de ventas que no suena a spam',           sub: 'Asunto, gancho y cierre para tu producto', area: 'Marketing y ventas',    kw: 'email' },
  { title: 'Secuencia de bienvenida en 5 emails',           sub: 'Del primer saludo a la primera venta',     area: 'Copywriting',           kw: 'email' },
  { title: 'Responder a un cliente molesto, por escrito',   sub: 'Firme, amable y sin perder al cliente',    area: 'Copywriting',           kw: 'email' },
  { title: 'Simulacro de entrevista con feedback',          sub: 'La IA hace de reclutador y te corrige',    area: 'Conseguir empleo',      kw: 'entrevista' },
  { title: 'Las preguntas difíciles de una entrevista',     sub: 'Respuestas con tu experiencia real',       area: 'Conseguir empleo',      kw: 'entrevista' },
  { title: 'Practicar una entrevista en inglés',            sub: 'Ajustado a tu nivel y a tu sector',        area: 'Aprender inglés',       kw: 'entrevista' },
  { title: 'Plan de ahorro de 90 días',                     sub: 'Con tus ingresos y gastos reales',         area: 'Finanzas personales',   kw: 'ahorro' },
  { title: 'Encontrar los gastos hormiga de tu mes',        sub: 'Pega tu extracto y mira a dónde se va',    area: 'Finanzas personales',   kw: 'ahorro' },
  { title: 'Montar un fondo de emergencia paso a paso',     sub: 'Cuánto, en cuánto tiempo y dónde',         area: 'Finanzas personales',   kw: 'ahorro' },
  { title: 'Elegir nicho para un canal sin rostro',         sub: 'Demanda, competencia y potencial',         area: 'YouTube sin rostro',    kw: 'youtube' },
  { title: 'Guion de 8 minutos que retiene hasta el final', sub: 'Gancho, estructura y cierre',              area: 'Creación de contenido', kw: 'youtube' },
  { title: '30 títulos con curiosidad, sin clickbait',      sub: 'Para tu tema y tu audiencia',              area: 'Creación de contenido', kw: 'youtube' },
];
const QUERIES = ['email', 'entrevista', 'ahorro', 'youtube'];
const SIDEBAR = ['Copywriting', 'Marketing y ventas', 'Redes sociales', 'Creación de contenido', 'YouTube sin rostro', 'Conseguir empleo', 'Finanzas personales', 'Aprender inglés', 'Productividad', 'Vibe coding'];

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const NotionMock: React.FC = () => {
  const [qi, setQi] = useState(0);
  const [typed, setTyped] = useState(QUERIES[0]);

  /* Escribe y borra búsquedas en bucle */
  useEffect(() => {
    if (prefersReduced()) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const target = QUERIES[qi];
    let i = 0;
    const type = () => {
      if (cancelled) return;
      i++;
      setTyped(target.slice(0, i));
      if (i < target.length) timer = setTimeout(type, 85);
      else timer = setTimeout(erase, 2600);
    };
    const erase = () => {
      if (cancelled) return;
      i--;
      setTyped(target.slice(0, Math.max(i, 0)));
      if (i > 0) timer = setTimeout(erase, 35);
      else setQi(q => (q + 1) % QUERIES.length);
    };
    timer = setTimeout(type, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [qi]);

  const q = QUERIES[qi];
  /* Siempre 3 filas (las de la búsqueda en curso): si el número de filas
     cambiara mientras se escribe/borra, la página entera saltaría. */
  const results = ROWS.filter(r => r.kw === q);
  const activeArea = typed.length >= 2 ? results[0]?.area : undefined;

  return (
    <div
      className="bp-mock-inner"
      style={{
        backgroundColor: CARD, borderRadius: 18, border: `1px solid ${LINE}`, overflow: 'hidden',
        boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 50px 100px -40px rgba(18,18,17,.35), 0 20px 40px -30px rgba(18,18,17,.25)',
      }}
      aria-hidden="true"
    >
      {/* barra de ventana */}
      <div className="flex items-center gap-2" style={{ padding: '12px 16px', borderBottom: `1px solid ${LINE}`, backgroundColor: PAPER }}>
        <span style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#e0dccf' }} />
        <span style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#e0dccf' }} />
        <span style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#e0dccf' }} />
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: FAINT, marginLeft: 10 }}>notion.so / banco-de-prompts</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
        {/* sidebar */}
        <div className="hidden md:block" style={{ borderRight: `1px solid ${LINE}`, padding: '18px 12px', backgroundColor: PAPER }}>
          <p style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: FAINT, padding: '0 8px', marginBottom: 10 }}>16 áreas</p>
          {SIDEBAR.map(a => (
            <div
              key={a}
              style={{
                fontSize: 13, padding: '6px 8px', borderRadius: 7, marginBottom: 1,
                color: a === activeArea ? INK : MUTED, fontWeight: a === activeArea ? 600 : 400,
                backgroundColor: a === activeArea ? PAPER_2 : 'transparent', transition: 'all .2s',
              }}
            >
              {a}
            </div>
          ))}
          <div style={{ fontSize: 13, padding: '6px 8px', color: FAINT }}>+ 6 más</div>
        </div>

        {/* lista */}
        <div style={{ padding: '22px 22px 22px' }}>
          <p style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', color: INK, marginBottom: 16 }}>Banco de prompts</p>

          <div className="flex items-center gap-2.5" style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: '0 12px', height: 44, backgroundColor: '#fff', marginBottom: 14 }}>
            <Search size={15} style={{ color: FAINT }} />
            <span style={{ fontSize: 14.5, color: INK }}>{typed}</span>
            <span className="bp-caret" />
            <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: FAINT }}>{results.length} resultados</span>
          </div>

          <div>
            {results.map((r, i) => (
              <div
                key={r.title}
                className="bp-mock-row flex items-center gap-3"
                style={{ borderTop: i ? `1px solid ${LINE}` : 'none', padding: '14px 4px', animationDelay: `${i * 50}ms` }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14.5, color: INK, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                  <span style={{ display: 'block', fontSize: 13, color: FAINT, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.sub}</span>
                </span>
                <span className="hidden sm:inline" style={{ fontFamily: MONO, fontSize: 10.5, color: MUTED, backgroundColor: PAPER_2, borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap' }}>{r.area}</span>
                <Copy size={14} style={{ color: FAINT, flexShrink: 0 }} />
              </div>
            ))}
          </div>
          <p style={{ borderTop: `1px solid ${LINE}`, paddingTop: 14, fontFamily: MONO, fontSize: 11.5, color: FAINT }}>
            + 500 prompts más en el pack
          </p>
        </div>
      </div>
    </div>
  );
};

/* ══════════ Demo: prompt flojo vs prompt del pack ══════════ */
type Sample = { tab: string; vague: string; vagueResult: string; prompt: string };

const samples: Sample[] = [
  {
    tab: 'Redes sociales',
    vague: 'Escríbeme un post para Instagram sobre mi negocio.',
    vagueResult: '“✨ ¡Descubre lo mejor de nuestro negocio! Calidad, pasión y compromiso en cada detalle. ¡Te esperamos!”',
    prompt: `## Rol
Eres estratega de contenido para Instagram, especializado en negocios pequeños.

## Tarea
Escribe 3 versiones de un post para [tu negocio], pensado para [tu cliente ideal]. El objetivo es [vender / recibir mensajes / ganar seguidores].

## Estructura de salida
- Un gancho de una línea que frene el scroll
- Cuerpo de máximo 120 palabras, en tono [cercano / experto / divertido]
- Una llamada a la acción concreta
- 5 hashtags de nicho (nada de #love o #instagood)

## Restricciones
Prohibido "calidad y pasión" y frases que valgan para cualquier marca. Usa una situación real del día a día de [tu cliente ideal].`,
  },
  {
    tab: 'Empleo',
    vague: 'Mejora mi CV.',
    vagueResult: '“Aquí tienes algunas sugerencias: usa un formato limpio, destaca tus logros y adapta tu CV a cada oferta…”',
    prompt: `## Rol
Eres reclutador senior en [sector] y filtras cientos de CV por semana.

## Tarea
Reescribe mi CV para esta oferta: [pega la oferta]. Mi CV actual: [pega tu CV].

## Estructura de salida
- Las palabras clave de la oferta que faltan en mi CV
- Cada experiencia reescrita como: verbo + qué hice + resultado medible
- Un resumen profesional de 3 líneas pensado para esta empresa
- Las 3 preguntas que me harías en la entrevista con este CV

## Restricciones
No inventes experiencia ni cifras. Si te falta un dato para medir un logro, pregúntamelo antes de escribir.`,
  },
  {
    tab: 'Finanzas',
    vague: 'Ayúdame a ahorrar dinero.',
    vagueResult: '“¡Claro! Haz un presupuesto, reduce gastos innecesarios, evita compras impulsivas y crea un fondo de emergencia…”',
    prompt: `## Rol
Eres asesor financiero personal y hablas claro, sin tecnicismos.

## Tarea
Gano [ingresos al mes] y estos son mis gastos del último mes: [lista]. Quiero ahorrar [cantidad] en [plazo].

## Estructura de salida
- Tabla de mis gastos por categoría y % sobre lo que gano
- Los 3 recortes con más impacto, con cuánto ahorro en cada uno
- Plan semana a semana para los próximos 90 días
- Qué hago si un mes no llego al objetivo

## Restricciones
Nada de "deja de tomar café". Si mi objetivo no es realista con estos números, dímelo y propón otro.`,
  },
  {
    tab: 'Inglés',
    vague: 'Enséñame inglés.',
    vagueResult: '“¡Con gusto! Empecemos por lo básico: Hello significa hola, Goodbye significa adiós, Thank you significa gracias…”',
    prompt: `## Rol
Eres profesor nativo de inglés y das clases de conversación.

## Tarea
Vamos a tener una conversación de 10 turnos sobre [tema que te interese]. Mi nivel es [A2 / B1 / B2].

## Estructura de salida
- En cada turno me haces una sola pregunta y esperas mi respuesta
- Después de cada respuesta, corriges mis errores con una explicación breve
- Al terminar, una lista de 10 expresiones nuevas con un ejemplo cada una

## Restricciones
No respondas por mí ni avances sin que yo escriba. Habla a mi nivel, ni más fácil ni más difícil.`,
  },
];

/* Pinta los ## como títulos y los [corchetes] como huecos a rellenar */
const PromptText: React.FC<{ text: string }> = ({ text }) => (
  <pre style={{ fontFamily: MONO, fontSize: 12.8, lineHeight: 1.75, color: ON_INK_MED, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
    {text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <div key={i} style={{ color: ON_INK, fontWeight: 700 }}>{line}</div>;
      return (
        <div key={i}>
          {line.split(/(\[[^\]]+\])/).map((part, j) =>
            part.startsWith('[')
              ? <span key={j} style={{ color: ACCENT, backgroundColor: 'rgba(255,201,62,0.12)', borderRadius: 4, padding: '0 3px' }}>{part}</span>
              : <React.Fragment key={j}>{part}</React.Fragment>,
          )}
          {line === '' && ' '}
        </div>
      );
    })}
  </pre>
);

/* Pinta todas las variantes en la misma celda de grid y solo muestra la
   activa: el bloque mide siempre lo que la más larga, así cambiar de
   pestaña no mueve el resto de la página. */
const Stack: React.FC<{ active: number; items: React.ReactNode[] }> = ({ active, items }) => (
  <div style={{ display: 'grid' }}>
    {items.map((node, i) => (
      <div
        key={i}
        className={i === active ? 'bp-swap' : undefined}
        aria-hidden={i !== active}
        style={{ gridArea: '1 / 1', visibility: i === active ? 'visible' : 'hidden' }}
      >
        {node}
      </div>
    ))}
  </div>
);

const PromptDemo: React.FC = () => {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const s = samples[active];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(s.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* sin permiso de portapapeles: no pasa nada */ }
  };

  return (
    <div>
      <div className="flex gap-6 sm:gap-8 mb-8 overflow-x-auto bp-noscroll" role="tablist" style={{ borderBottom: `1px solid ${LINE}` }}>
        {samples.map((x, i) => (
          <button
            key={x.tab}
            role="tab"
            aria-selected={i === active}
            onClick={() => { setActive(i); setCopied(false); }}
            style={{
              fontSize: 15, fontWeight: 600, padding: '0 0 14px', cursor: 'pointer', whiteSpace: 'nowrap',
              background: 'none', border: 'none', marginBottom: -1,
              borderBottom: `2px solid ${i === active ? INK : 'transparent'}`,
              color: i === active ? INK : FAINT, transition: 'color .2s, border-color .2s',
            }}
          >
            {x.tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-4">
        {/* Lo que escribe casi todo el mundo */}
        <div className="flex flex-col" style={{ backgroundColor: CARD, border: `1px solid ${LINE}`, borderRadius: 18, padding: 24 }}>
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: FAINT, marginBottom: 20 }}>
            Lo que escribe casi todo el mundo
          </p>
          <Stack active={active} items={samples.map(x => (
            <>
              <div style={{ backgroundColor: PAPER_2, borderRadius: '16px 16px 4px 16px', padding: '12px 15px', marginLeft: 'auto', width: 'fit-content', maxWidth: '92%', marginBottom: 16 }}>
                <p style={{ fontSize: 15, color: INK }}>{x.vague}</p>
              </div>
              <div className="flex gap-2.5">
                <span style={{ width: 26, height: 26, borderRadius: 99, border: `1px solid ${LINE}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>
                  <OpenAILogo size={13} />
                </span>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: MUTED }}>{x.vagueResult}</p>
              </div>
            </>
          ))} />
          <p style={{ marginTop: 'auto', paddingTop: 24, fontSize: 14.5, lineHeight: 1.6, color: INK }}>
            <span style={{ color: ACCENT_DEEP, fontWeight: 700 }}>→</span> Una respuesta que vale para cualquiera… y por eso no te sirve a ti.
          </p>
        </div>

        {/* Un prompt del pack */}
        <div style={{ backgroundColor: INK, borderRadius: 18, overflow: 'hidden' }}>
          <div className="flex items-center justify-between gap-3" style={{ padding: '14px 18px 14px 22px', borderBottom: `1px solid ${INK_LINE}` }}>
            <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: ON_INK_MED }}>
              Un prompt del pack
            </p>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5"
              style={{
                fontSize: 12.5, fontWeight: 600, padding: '7px 12px', borderRadius: 99, cursor: 'pointer',
                border: `1px solid ${INK_LINE}`, backgroundColor: copied ? ACCENT : 'transparent',
                color: copied ? ON_ACCENT : ON_INK, transition: 'background-color .2s',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copiado' : 'Copiar y probar'}
            </button>
          </div>
          <div style={{ padding: '20px 22px 24px' }}>
            <Stack active={active} items={samples.map(x => <PromptText text={x.prompt} />)} />
          </div>
        </div>
      </div>

      <p style={{ fontSize: 14.5, color: MUTED, marginTop: 18 }}>
        Lo que está <span style={{ color: INK, fontWeight: 600, backgroundColor: ACCENT, borderRadius: 4, padding: '1px 5px' }}>[entre corchetes]</span> lo cambias por tus datos. El resto ya está pensado.
      </p>
    </div>
  );
};

/* ══════════ Contenido ══════════ */
const areas = [
  { title: 'Copywriting y contenido', desc: 'Copy, emails, guiones y storytelling.' },
  { title: 'Marketing y ventas',      desc: 'Embudos, captación de leads y guiones de cierre.' },
  { title: 'Redes sociales',          desc: 'Ideas, calendarios de publicación y engagement.' },
  { title: 'Creación de contenido',   desc: 'YouTube, guiones, títulos y monetización.' },
  { title: 'YouTube sin rostro',      desc: 'Nicho, producción con IA y marca anónima.' },
  { title: 'SEO',                     desc: 'Keywords, auditoría on-page y redacción de artículos.' },
  { title: 'Conseguir empleo',        desc: 'CV, carta de presentación, LinkedIn y entrevistas.' },
  { title: 'Productividad',           desc: 'Prioridades, rutinas y adiós a la procrastinación.' },
  { title: 'Finanzas personales',     desc: 'Presupuesto, deudas, ahorro e inversión.' },
  { title: 'Aprender inglés',         desc: 'Vocabulario, conversación e inglés de negocios.' },
  { title: 'Aprender francés',        desc: 'Programa intensivo, conversación y pronunciación.' },
  { title: 'Vibe coding',             desc: 'De la idea al brief y debugging sin saber programar.' },
  { title: 'Creatividad',             desc: 'Ideas, naming, bloqueo creativo y dirección visual.' },
  { title: 'Crecimiento personal',    desc: 'Mentalidad, excusas y un plan de acción real.' },
  { title: 'Bajar de peso',           desc: 'Nutrición, hábitos y planes a tu medida.' },
  { title: 'Astrología',              desc: 'Carta natal, compatibilidad y horóscopo.' },
];

const TASKS = [
  'Escribir un email de ventas', 'Preparar una entrevista', 'Hacer un presupuesto', 'Planificar un mes de contenido',
  'Mejorar tu CV', 'Practicar inglés', 'Encontrar un nicho', 'Escribir un guion de YouTube', 'Salir de un bloqueo creativo',
  'Optimizar un artículo para Google', 'Organizar tu semana', 'Convertir una idea en una app',
];

const faqs = [
  { q: '¿Necesito pagar Notion?', a: 'No. Funciona con la cuenta gratuita de Notion. Y para leer los prompts ni siquiera necesitas cuenta: el enlace se abre en el navegador. La cuenta solo te hace falta si quieres duplicarlo y editarlo a tu gusto.' },
  { q: '¿Con qué IA funcionan?', a: 'Con cualquiera que entienda texto: ChatGPT, Claude, Gemini, Grok, DeepSeek, Copilot… También con las versiones gratuitas.' },
  { q: '¿Están en español?', a: 'Sí, todos. Escritos en español desde el principio, no traducidos con prisas.' },
  { q: 'Nunca he usado prompts. ¿Me va a servir?', a: 'Precisamente para eso está hecho. No tienes que saber nada de “ingeniería de prompts”: copias el prompt, cambias lo que está entre corchetes por tus datos y lo pegas en la IA.' },
  { q: '¿Cómo y cuándo lo recibo?', a: 'Justo después de pagar, Hotmart te envía un correo con el acceso. Suele tardar un par de minutos. Si no lo ves, revisa spam o promociones.' },
  { q: '¿Es una suscripción?', a: `No. Pagas ${PRICE} una vez y es tuyo. Los prompts que vayamos añadiendo también te llegan, sin pagar nada más.` },
  { q: '¿Y si no me convence?', a: 'Tienes 7 días para pedir el reembolso desde Hotmart. Te devuelven el dinero completo, sin dar explicaciones.' },
];

const FaqItem: React.FC<{ q: string; a: string; i: number }> = ({ q, a, i }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${LINE}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-5 text-left"
        style={{ padding: '24px 0', cursor: 'pointer', background: 'none', border: 'none' }}
      >
        <span style={{ fontFamily: MONO, fontSize: 12, color: FAINT, width: 22, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
        <span style={{ fontSize: 'clamp(16.5px, 1.6vw, 19px)', fontWeight: 600, color: INK, letterSpacing: '-0.015em', flex: 1 }}>{q}</span>
        <Plus size={20} style={{ color: INK, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .3s cubic-bezier(.2,.8,.2,1)' }} />
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .35s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: MUTED, padding: '0 40px 26px 42px', maxWidth: 680 }}>{a}</p>
        </div>
      </div>
    </div>
  );
};

const includes = [
  '+500 prompts listos para copiar y pegar',
  '16 áreas: negocio, contenido, empleo, dinero, idiomas…',
  'Todo ordenado en Notion, con buscador y filtros',
  'Funciona con ChatGPT, Claude, Gemini y cualquier IA',
  'Prompts nuevos de por vida, sin pagar más',
];

const AiRow: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div className="flex flex-wrap items-center gap-x-7 gap-y-3" style={{ color: dark ? ON_INK_MED : MUTED }}>
    {[
      { l: <OpenAILogo size={17} />, n: 'ChatGPT' },
      { l: <ClaudeLogo size={17} />, n: 'Claude' },
      { l: <GeminiLogo size={17} />, n: 'Gemini' },
      { l: <GrokLogo size={15} />, n: 'Grok' },
      { l: <DeepSeekLogo size={17} />, n: 'DeepSeek' },
    ].map(x => (
      <span key={x.n} className="inline-flex items-center gap-2" style={{ fontSize: 14.5, fontWeight: 600 }}>{x.l}{x.n}</span>
    ))}
  </div>
);

const STATEMENT = 'La IA no te da malas respuestas porque sea tonta. Te las da porque le pides poco. Le escribes “hazme un post” y te devuelve lo mismo que a todo el mundo. La diferencia entre una respuesta mediocre y una buena casi siempre está en cómo se lo pides.';

/* ══════════════════════════════════════════════════════════════ */

const BankPrompts: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);

  /* Barra de compra fija en móvil a partir del primer scroll */
  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      /* Entrada del hero */
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.bp-hl > span', { yPercent: 110, duration: 1.15, stagger: 0.09 })
        .from('.bp-hfade', { opacity: 0, y: 18, duration: 0.9, stagger: 0.07 }, '-=0.75')
        .from('.bp-mock', { opacity: 0, y: 80, duration: 1.3 }, '-=0.8');

      /* El mockup se "asienta" al hacer scroll */
      gsap.fromTo('.bp-mock-inner', { scale: 0.93, rotateX: 8 }, {
        scale: 1, rotateX: 0, ease: 'none',
        scrollTrigger: { trigger: '.bp-mock', start: 'top 95%', end: 'top 25%', scrub: true },
      });

      /* Frase que se va encendiendo palabra a palabra */
      gsap.fromTo('.bp-word', { opacity: 0.15 }, {
        opacity: 1, stagger: 0.06, ease: 'none',
        scrollTrigger: { trigger: '.bp-statement', start: 'top 78%', end: 'bottom 55%', scrub: true },
      });

      /* Apariciones genéricas */
      gsap.utils.toArray<HTMLElement>('.bp-rv').forEach(el => {
        gsap.from(el, { opacity: 0, y: 46, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });

      /* Filas del índice de áreas */
      gsap.set('.bp-area', { opacity: 0, y: 26 });
      ScrollTrigger.batch('.bp-area', {
        start: 'top 92%', once: true,
        onEnter: b => gsap.to(b, { opacity: 1, y: 0, stagger: 0.05, duration: 0.8, ease: 'power3.out' }),
      });

      /* Precio: el número sube */
      gsap.from('.bp-price-num', {
        yPercent: 100, duration: 1.2, ease: 'power4.out',
        scrollTrigger: { trigger: '.bp-price', start: 'top 75%', once: true },
      });
    });
  }, { scope: root });

  return (
    <div ref={root} className="bp-scope" style={{ backgroundColor: PAPER, color: INK, minHeight: '100vh', fontFamily: SANS, overflowX: 'clip' }}>
      <LandingStyles />
      <style>{`
        .bp-scope ::selection { background: ${INK}; color: ${PAPER}; }
        .bp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 14px; font-weight: 600; border-radius: 999px;
          text-decoration: none; white-space: nowrap; transition: transform .25s cubic-bezier(.2,.8,.2,1), background-color .25s; }
        .bp-btn-sm { font-size: 13.5px; padding: 6px 6px 6px 16px; }
        .bp-btn-md { font-size: 15.5px; padding: 8px 8px 8px 24px; }
        .bp-btn-lg { font-size: 17px; padding: 9px 9px 9px 28px; }
        .bp-btn-ink { background: ${INK}; color: ${PAPER}; }
        .bp-btn-accent { background: ${ACCENT}; color: ${ON_ACCENT}; }
        .bp-btn-ic { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px;
          transition: transform .35s cubic-bezier(.2,.8,.2,1); }
        .bp-btn-sm .bp-btn-ic { width: 28px; height: 28px; }
        .bp-btn-md .bp-btn-ic { width: 38px; height: 38px; }
        .bp-btn-lg .bp-btn-ic { width: 46px; height: 46px; }
        .bp-btn-ink .bp-btn-ic { background: ${ACCENT}; color: ${ON_ACCENT}; }
        .bp-btn-accent .bp-btn-ic { background: ${INK}; color: ${ACCENT}; }
        .bp-btn:hover { transform: translateY(-2px); }
        .bp-btn:hover .bp-btn-ic { transform: rotate(-45deg); }
        .bp-btn:focus-visible, .bp-scope button:focus-visible, .bp-scope a:focus-visible { outline: 2px solid ${INK}; outline-offset: 3px; }

        .bp-hl { display: block; overflow: hidden; padding-bottom: .06em; margin-bottom: -.06em; }
        .bp-hl > span { display: block; }

        .bp-caret { width: 1.5px; height: 17px; background: ${INK}; margin-left: -6px; animation: bpBlink 1s steps(2) infinite; }
        @keyframes bpBlink { 50% { opacity: 0; } }
        .bp-mock-row { animation: bpRow .45s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes bpRow { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .bp-swap { animation: bpRow .5s cubic-bezier(.2,.8,.2,1) both; }

        .bp-marquee { display: flex; width: max-content; animation: bpMarq 50s linear infinite; }
        .bp-marquee:hover { animation-play-state: paused; }
        @keyframes bpMarq { to { transform: translateX(-50%); } }

        .bp-area { transition: background-color .35s cubic-bezier(.2,.8,.2,1), color .35s; }
        .bp-area .bp-area-arrow { opacity: 0; transform: translateX(-8px); transition: all .35s cubic-bezier(.2,.8,.2,1); }
        @media (hover: hover) {
          .bp-area:hover { background: ${INK}; color: ${PAPER}; }
          .bp-area:hover .bp-area-desc, .bp-area:hover .bp-area-n { color: ${ON_INK_MED}; }
          .bp-area:hover .bp-area-arrow { opacity: 1; transform: none; }
        }

        .bp-link { position: relative; text-decoration: none; }
        .bp-link::after { content: ''; position: absolute; left: 0; right: 0; bottom: -2px; height: 1px; background: currentColor;
          transform: scaleX(0); transform-origin: right; transition: transform .35s cubic-bezier(.2,.8,.2,1); }
        .bp-link:hover::after { transform: scaleX(1); transform-origin: left; }

        .bp-noscroll { scrollbar-width: none; } .bp-noscroll::-webkit-scrollbar { display: none; }

        .bp-mbar { display: flex; }
        @media (min-width: 1024px) { .bp-mbar { display: none; } }

        .bp-grain { position: absolute; inset: 0; pointer-events: none; opacity: .5; mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .05 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

        @media (prefers-reduced-motion: reduce) {
          .bp-marquee, .bp-caret, .bp-mock-row, .bp-swap { animation: none; }
        }
      `}</style>

      {/* ══════════ HEADER ══════════ */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          backgroundColor: 'rgba(243,240,233,0.82)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex items-center justify-between" style={{ height: 64 }}>
          <a href="#top" className="flex items-center gap-2.5" style={{ textDecoration: 'none', color: INK }}>
            <AlpacaIcon className="h-7 w-auto" />
            <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.02em' }}>alpacka.ai</span>
          </a>
          <nav className="hidden md:flex items-center gap-8" style={{ fontSize: 14, color: MUTED }}>
            <a className="bp-link" href="#demo" style={{ color: 'inherit' }}>Ejemplo</a>
            <a className="bp-link" href="#contenido" style={{ color: 'inherit' }}>Contenido</a>
            <a className="bp-link" href="#precio" style={{ color: 'inherit' }}>Precio</a>
            <a className="bp-link" href="#faq" style={{ color: 'inherit' }}>Preguntas</a>
          </nav>
          <BuyButton size="sm" label={`Conseguirlo · ${PRICE}`} />
        </div>
      </header>

      {/* ══════════ HERO ══════════ */}
      <section id="top" style={{ position: 'relative' }}>
        <div className="bp-grain" />
        <div className="relative max-w-[1320px] mx-auto px-4 sm:px-8 pt-12 md:pt-20">
          <div className="bp-hfade flex flex-wrap items-center gap-x-4 gap-y-2" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, marginBottom: 28 }}>
            <span className="inline-flex items-center gap-2">
              <span style={{ width: 7, height: 7, borderRadius: 99, backgroundColor: ACCENT }} />
              Pack de prompts en Notion
            </span>
            <span style={{ color: FAINT }}>/</span>
            <span>+500 prompts en español</span>
          </div>

          <h1 style={{ fontWeight: 800, fontSize: 'clamp(3rem, 10.6vw, 11rem)', lineHeight: 0.92, letterSpacing: '-0.06em', color: INK }}>
            <span className="bp-hl"><span>Pídele a la IA</span></span>
            <span className="bp-hl"><span>como lo haría</span></span>
            <span className="bp-hl"><span>un <span style={{ backgroundImage: MARKER, padding: '0 .04em' }}>experto.</span></span></span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 mt-10 md:mt-14 items-end">
            <div className="lg:col-span-6">
              <p className="bp-hfade" style={{ fontSize: 'clamp(17px, 1.6vw, 20px)', lineHeight: 1.55, color: MUTED, maxWidth: 540, marginBottom: 30 }}>
                Más de 500 prompts ya escritos y probados para ChatGPT, Claude y Gemini. Buscas el que necesitas, cambias
                tus datos y obtienes algo que <span style={{ color: INK }}>de verdad puedes usar</span>. A la primera.
              </p>
              <div className="bp-hfade flex flex-wrap items-center gap-x-6 gap-y-4">
                <BuyButton size="lg" label={`Conseguir el pack · ${PRICE}`} />
                <a href="#demo" className="bp-link inline-flex items-center gap-2" style={{ fontSize: 15, fontWeight: 600, color: INK }}>
                  Ver un ejemplo <ArrowDown size={15} />
                </a>
              </div>
              <p className="bp-hfade" style={{ fontSize: 13.5, color: FAINT, marginTop: 18 }}>
                Pago único · Acceso inmediato por correo · Garantía de 7 días
              </p>
            </div>

            <div className="lg:col-span-5 lg:col-start-8 grid grid-cols-3" style={{ borderTop: `1px solid ${INK}` }}>
              {[
                ['500+', 'prompts listos'],
                ['16', 'áreas'],
                ['1', 'pago, para siempre'],
              ].map(([n, l], i) => (
                <div key={l} className="bp-hfade" style={{ paddingTop: 16, paddingLeft: i ? 16 : 0, borderLeft: i ? `1px solid ${LINE}` : 'none' }}>
                  <p style={{ fontWeight: 700, fontSize: 'clamp(1.8rem, 3.2vw, 2.8rem)', letterSpacing: '-0.05em', lineHeight: 1 }}>{n}</p>
                  <p style={{ fontSize: 13.5, color: MUTED, marginTop: 8 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Producto */}
          <div className="bp-mock mt-16 md:mt-24 pb-16 md:pb-24" style={{ perspective: 1400 }}>
            <NotionMock />
          </div>
        </div>
      </section>

      {/* ══════════ MARQUEE de tareas ══════════ */}
      <div style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, overflow: 'hidden', padding: '20px 0' }}>
        <div className="bp-marquee" aria-hidden="true">
          {[...TASKS, ...TASKS].map((t, i) => (
            <span key={i} className="inline-flex items-center" style={{ fontSize: 'clamp(18px, 2vw, 24px)', fontWeight: 600, letterSpacing: '-0.02em', whiteSpace: 'nowrap', color: INK }}>
              {t}
              <span style={{ color: ACCENT_DEEP, margin: '0 28px', fontSize: '0.8em' }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ 01 — EL PROBLEMA ══════════ */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-8 py-24 md:py-40">
        <SectionTag n="01">El problema</SectionTag>
        <p className="bp-statement" style={{ fontWeight: 600, fontSize: 'clamp(1.7rem, 4.1vw, 3.6rem)', lineHeight: 1.12, letterSpacing: '-0.035em', maxWidth: 1180 }}>
          {STATEMENT.split(' ').map((w, i) => (
            <span key={i} className="bp-word">{w} </span>
          ))}
        </p>
        <div className="bp-rv mt-14 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
          <p style={{ fontSize: 17, lineHeight: 1.65, color: MUTED, maxWidth: 520 }}>
            Eso es justo lo que ya hemos hecho por ti: pensar cómo pedírselo, para cada tarea, y probarlo hasta que funciona.
          </p>
        </div>
      </section>

      {/* ══════════ 02 — LA DIFERENCIA (demo) ══════════ */}
      <section id="demo" style={{ backgroundColor: PAPER_2, scrollMarginTop: 64 }}>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-24 md:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
            <div className="lg:col-span-7 bp-rv">
              <SectionTag n="02">Míralo tú mismo</SectionTag>
              <H2>La misma IA.<br />Otra forma de pedírselo.</H2>
            </div>
            <p className="lg:col-span-4 lg:col-start-9 self-end bp-rv" style={{ fontSize: 17, lineHeight: 1.65, color: MUTED }}>
              Así son los prompts del pack. Elige un tema, cópialo y pruébalo ahora en tu IA. Es gratis, y es la forma más
              rápida de ver la diferencia.
            </p>
          </div>
          <div className="bp-rv"><PromptDemo /></div>
        </div>
      </section>

      {/* ══════════ 03 — CÓMO FUNCIONA ══════════ */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-8 py-24 md:py-36">
        <div className="bp-rv mb-14 md:mb-20">
          <SectionTag n="03">Cómo funciona</SectionTag>
          <H2>De “no sé qué pedirle”<br />a un resultado útil en un minuto.</H2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ borderTop: `1px solid ${INK}` }}>
          {[
            ['Busca', 'Abres el Notion y filtras por área o escribes lo que necesitas: “entrevista”, “email de ventas”, “presupuesto”…'],
            ['Rellena', 'Copias el prompt y cambias lo que está entre corchetes por tu caso: tu negocio, tu sector, tus números.'],
            ['Úsalo', 'Lo pegas en ChatGPT, Claude, Gemini o la que uses. Te devuelve algo pensado para ti, no un texto de relleno.'],
          ].map(([t, d], i) => (
            <div key={t} className="bp-rv" style={{ padding: '28px 0 8px', paddingLeft: i ? 'clamp(0px, 2vw, 28px)' : 0, borderLeft: i ? `1px solid ${LINE}` : 'none' }}>
              <div className="flex items-baseline justify-between md:pr-7">
                <p style={{ fontWeight: 700, fontSize: 'clamp(2rem, 3vw, 2.6rem)', letterSpacing: '-0.045em' }}>{t}</p>
                <span style={{ fontFamily: MONO, fontSize: 12, color: FAINT }}>0{i + 1}</span>
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: MUTED, marginTop: 12, maxWidth: 360 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ 04 — CONTENIDO ══════════ */}
      <section id="contenido" style={{ scrollMarginTop: 64 }}>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 pb-24 md:pb-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-7 bp-rv">
              <SectionTag n="04">Lo que hay dentro</SectionTag>
              <H2>+500 prompts en 16 áreas de tu vida y tu trabajo.</H2>
            </div>
            <p className="lg:col-span-4 lg:col-start-9 self-end bp-rv" style={{ fontSize: 17, lineHeight: 1.65, color: MUTED }}>
              No hace falta que uses todas. Con que dos o tres te encajen, el pack ya se ha pagado solo.
            </p>
          </div>

          <div style={{ borderTop: `1px solid ${INK}` }}>
            {areas.map((a, i) => (
              <div
                key={a.title}
                className="bp-area grid grid-cols-[36px_1fr_20px] md:grid-cols-[64px_1fr_1fr_24px] items-center gap-x-4"
                style={{ borderBottom: `1px solid ${LINE}`, padding: '20px 12px', margin: '0 -12px', borderRadius: 4 }}
              >
                <span className="bp-area-n" style={{ fontFamily: MONO, fontSize: 12, color: FAINT }}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 'clamp(19px, 2vw, 26px)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>{a.title}</p>
                  <p className="bp-area-desc md:hidden" style={{ fontSize: 14.5, color: MUTED, marginTop: 4 }}>{a.desc}</p>
                </div>
                <p className="bp-area-desc hidden md:block" style={{ fontSize: 15.5, color: MUTED }}>{a.desc}</p>
                <ArrowUpRight size={20} className="bp-area-arrow" />
              </div>
            ))}
          </div>

          <div className="bp-rv mt-12 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
            <BuyButton size="lg" label="Quiero las 16 áreas" />
            <span style={{ fontSize: 14.5, color: MUTED }}>Unos {PER_PROMPT} por prompt.</span>
          </div>
        </div>
      </section>

      {/* ══════════ 05 — PRECIO ══════════ */}
      <section id="precio" className="bp-price" style={{ backgroundColor: INK, color: ON_INK, scrollMarginTop: 64, position: 'relative', overflow: 'hidden' }}>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-24 md:py-36">
          <SectionTag n="05" dark>El precio</SectionTag>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8">
            <div className="lg:col-span-6">
              <H2 dark className="bp-rv">Todo el pack.<br />Un solo pago.</H2>
              <div className="bp-rv" style={{ fontSize: 17, lineHeight: 1.75, color: ON_INK_MED, marginTop: 28, maxWidth: 520 }}>
                <p style={{ marginBottom: 14 }}>
                  Escribir y probar cada uno de estos prompts nos llevó cientos de horas. Tú los tienes todos por menos de lo
                  que cuesta un menú, y sale a unos <span style={{ color: ON_INK }}>{PER_PROMPT} por prompt</span>.
                </p>
                <p style={{ marginBottom: 14 }}>
                  Sin suscripción y sin “versión 2.0” que comprar de nuevo: cada prompt que añadimos aparece en tu Notion sin que hagas nada.
                </p>
                <p>
                  Lo hace el equipo de <span style={{ color: ON_INK }}>@alpacka.ai</span>, la cuenta de IA que siguen más de
                  500.000 personas en Instagram.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 lg:col-start-8 bp-rv">
              <div style={{ border: `1px solid ${INK_LINE}`, borderRadius: 24, padding: 'clamp(24px, 3vw, 36px)', backgroundColor: INK_2 }}>
                <div className="flex items-center justify-between mb-6">
                  <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: ON_INK_MED }}>Pack completo</span>
                  <span style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 600, backgroundColor: ACCENT, color: ON_ACCENT, borderRadius: 99, padding: '4px 10px' }}>-31% hoy</span>
                </div>
                <div className="flex items-end gap-4">
                  <span style={{ display: 'inline-block', overflow: 'hidden', lineHeight: 0.9 }}>
                    <span className="bp-price-num" style={{ display: 'inline-block', fontWeight: 800, fontSize: 'clamp(4.2rem, 8vw, 6.4rem)', letterSpacing: '-0.06em' }}>{PRICE}</span>
                  </span>
                  <span style={{ fontSize: 20, color: ON_INK_DIM, textDecoration: 'line-through', paddingBottom: 10 }}>{PRICE_BEFORE}</span>
                </div>
                <p style={{ fontSize: 14, color: ON_INK_DIM, marginTop: 10, marginBottom: 28 }}>Pago único · acceso de por vida</p>

                <div style={{ borderTop: `1px solid ${INK_LINE}`, paddingTop: 22, marginBottom: 30 }}>
                  {includes.map(t => (
                    <div key={t} className="flex items-start gap-3" style={{ padding: '6px 0' }}>
                      <Check size={16} strokeWidth={2.6} style={{ color: ACCENT, flexShrink: 0, marginTop: 3 }} />
                      <span style={{ fontSize: 15.5, lineHeight: 1.55, color: ON_INK }}>{t}</span>
                    </div>
                  ))}
                </div>

                <BuyButton size="lg" tone="accent" label="Conseguir el pack ahora" full />

                <div className="flex items-start gap-3" style={{ marginTop: 22 }}>
                  <Shield size={18} style={{ color: ON_INK_MED, flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: ON_INK_MED }}>
                    <span style={{ color: ON_INK }}>Garantía de 7 días.</span> Si no te convence, pides el reembolso desde
                    Hotmart y te devuelven todo. Sin preguntas.
                  </p>
                </div>
              </div>
              <div className="mt-8"><AiRow dark /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 06 — FAQ ══════════ */}
      <section id="faq" className="max-w-[1320px] mx-auto px-4 sm:px-8 py-24 md:py-36" style={{ scrollMarginTop: 64 }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="lg:sticky" style={{ top: 110 }}>
              <SectionTag n="06">Preguntas</SectionTag>
              <H2 className="bp-rv">Lo que suele preguntar la gente.</H2>
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6 bp-rv" style={{ borderTop: `1px solid ${INK}` }}>
            {faqs.map((f, i) => <FaqItem key={f.q} q={f.q} a={f.a} i={i} />)}
          </div>
        </div>
      </section>

      {/* ══════════ CIERRE ══════════ */}
      <section style={{ borderTop: `1px solid ${LINE}`, position: 'relative' }}>
        <div className="bp-grain" />
        <div className="relative max-w-[1320px] mx-auto px-4 sm:px-8 pt-24 md:pt-36 pb-16">
          <p className="bp-rv" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, marginBottom: 24 }}>
            La próxima vez que abras ChatGPT
          </p>
          <h2 className="bp-rv" style={{ fontWeight: 800, fontSize: 'clamp(2.8rem, 8.4vw, 8.8rem)', lineHeight: 0.92, letterSpacing: '-0.06em' }}>
            sabrás exactamente<br />qué <span style={{ backgroundImage: MARKER, padding: '0 .04em' }}>pedirle.</span>
          </h2>
          <div className="bp-rv mt-12 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
            <BuyButton size="lg" label={`Conseguir el pack · ${PRICE}`} />
            <span style={{ fontSize: 14.5, color: MUTED }}>+500 prompts · 16 áreas · 7 días de garantía</span>
          </div>

          <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-24 lg:pb-0" style={{ borderTop: `1px solid ${LINE}`, marginTop: 'clamp(80px, 12vw, 160px)', paddingTop: 24, fontSize: 13.5, color: MUTED }}>
            <div className="flex items-center gap-2.5">
              <AlpacaIcon className="h-5 w-auto" />
              <span style={{ fontFamily: MONO }}>alpacka.ai © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-6">
              <a className="bp-link" href="/terms" style={{ color: 'inherit' }}>Términos</a>
              <a className="bp-link" href="/privacy" style={{ color: 'inherit' }}>Privacidad</a>
            </div>
          </footer>
        </div>
      </section>

      {/* ══════════ BARRA FIJA MÓVIL ══════════ */}
      <div
        className="bp-mbar"
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60,
          backgroundColor: 'rgba(243,240,233,0.92)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderTop: `1px solid ${LINE}`,
          padding: '10px 16px calc(10px + env(safe-area-inset-bottom))',
          alignItems: 'center', justifyContent: 'space-between', gap: 12,
          transform: showBar ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform .3s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <div>
          <div className="flex items-baseline gap-2">
            <span style={{ fontWeight: 800, fontSize: 21, letterSpacing: '-0.04em' }}>{PRICE}</span>
            <span style={{ fontSize: 13, color: FAINT, textDecoration: 'line-through' }}>{PRICE_BEFORE}</span>
          </div>
          <p style={{ fontSize: 11.5, color: MUTED }}>+500 prompts · pago único</p>
        </div>
        <BuyButton label="Lo quiero" />
      </div>
    </div>
  );
};

export default BankPrompts;
