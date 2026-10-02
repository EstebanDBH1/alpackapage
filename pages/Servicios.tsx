import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Bot, Check, Clock, Code2, GraduationCap, LineChart, Mail,
    MessageCircle, Plus, Rocket, Sparkles, Workflow, Globe,
} from 'lucide-react';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, GREEN, AMBER, SANS, MONO,
} from '../components/darkKit';

/* Página de servicios (Alpacka Studio): el brazo de "hecho para ti" del
   negocio. La suscripción vende prompts a $7; esto vende implantación a
   cuatro cifras al mismo público que ya nos lee. Todo el contenido es
   estático y vive aquí arriba para poder editar precios y textos sin tocar
   el maquetado. */

/* ── Contacto — cámbialo por tus canales reales ───────────────────────── */
const CONTACT_EMAIL = 'hola@alpackaai.xyz';
const WHATSAPP_URL = 'https://wa.me/000000000000';   // ← tu número con prefijo
const CALL_URL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Diagnóstico gratuito — Alpacka Studio')}`;

type Service = {
    id: string;
    icon: React.ReactNode;
    accent: string;
    tag: string;
    name: string;
    pitch: string;
    includes: string[];
    price: string;
    timeline: string;
    featured?: boolean;
};

const SERVICES: Service[] = [
    {
        id: 'automatizacion',
        icon: <Workflow size={17} />,
        accent: AMBER,
        tag: 'Automatización',
        name: 'Automatización de procesos con IA',
        pitch: 'Conectamos las herramientas que ya usas (Sheets, Notion, CRM, email, Stripe) y dejamos que la IA haga el trabajo repetitivo: clasificar, redactar, resumir y avisar.',
        includes: [
            'Auditoría de los procesos que más horas te comen',
            'Flujos automatizados en n8n / Make con IA de por medio',
            'Informes y alertas automáticas donde ya trabajas',
            'Documentación y traspaso para que no dependas de nadie',
        ],
        price: 'Desde $490',
        timeline: '1–2 semanas',
        featured: true,
    },
    {
        id: 'web-ia',
        icon: <Globe size={17} />,
        accent: '#7dd3fc',
        tag: 'Desarrollo web',
        name: 'Páginas web con IA integrada',
        pitch: 'No una web bonita y muerta: una web que responde, recomienda y califica. Landing o sitio completo con funciones de IA reales dentro, no un chat pegado en una esquina.',
        includes: [
            'Diseño y desarrollo a medida (React + Tailwind)',
            'Funciones con IA: buscador inteligente, recomendador, generador',
            'SEO técnico, velocidad y analítica desde el día uno',
            'Panel para editar contenidos sin tocar código',
        ],
        price: 'Desde $890',
        timeline: '2–4 semanas',
    },
    {
        id: 'agentes',
        icon: <Bot size={17} />,
        accent: GREEN,
        tag: 'Agentes IA',
        name: 'Agente de ventas 24/7 (WhatsApp e Instagram)',
        pitch: 'Un agente entrenado con tu catálogo y tu forma de vender que atiende, resuelve dudas, califica al interesado y te pasa solo los que están listos para comprar.',
        includes: [
            'Entrenado con tus productos, precios y objeciones reales',
            'WhatsApp Business, Instagram DM o el chat de tu web',
            'Agenda citas y registra cada lead en tu CRM o en una hoja',
            'Traspaso a humano cuando la conversación lo pide',
        ],
        price: 'Desde $690',
        timeline: '1–2 semanas',
    },
    {
        id: 'saas',
        icon: <Rocket size={17} />,
        accent: '#b39dff',
        tag: 'Producto',
        name: 'De la idea al SaaS funcionando',
        pitch: 'Tienes una idea de producto digital y nadie que la construya. Montamos el MVP completo —login, base de datos, pagos y panel— y lo dejamos cobrando.',
        includes: [
            'Producto real en producción, no un prototipo de Figma',
            'Autenticación, base de datos y roles (Supabase)',
            'Cobros con Stripe o Paddle, suscripción o pago único',
            'Dominio, despliegue y 30 días de soporte incluidos',
        ],
        price: 'Desde $2.400',
        timeline: '4–8 semanas',
    },
    {
        id: 'contenido',
        icon: <Sparkles size={17} />,
        accent: '#f472b6',
        tag: 'Contenido',
        name: 'Sistema de contenido con IA',
        pitch: 'El mismo sistema con el que gestionamos más de medio millón de seguidores: una máquina de guiones, posts y artículos con tu voz, lista para publicar cada semana.',
        includes: [
            'Prompts y plantillas a medida de tu marca y tu tono',
            'Calendario editorial automatizado mes a mes',
            'Artículos SEO y guiones para reels en lote',
            'Formación al equipo para que lo lleven ellos',
        ],
        price: 'Desde $390 / mes',
        timeline: 'Servicio mensual',
    },
    {
        id: 'consultoria',
        icon: <GraduationCap size={17} />,
        accent: '#fbbf24',
        tag: 'Consultoría',
        name: 'Formación y consultoría para equipos',
        pitch: 'Tu equipo ya usa ChatGPT, pero mal. Les enseñamos a sacarle partido de verdad y salimos con un plan escrito de qué automatizar primero y cuánto ahorra.',
        includes: [
            'Taller práctico en vivo (2–4 h) con casos de tu empresa',
            'Biblioteca de prompts propia para tu equipo',
            'Diagnóstico y hoja de ruta de IA priorizada por impacto',
            'Sesión de seguimiento a los 30 días',
        ],
        price: 'Desde $450',
        timeline: 'Sesión o mensual',
    },
];

const PROCESS = [
    {
        step: '01',
        title: 'Diagnóstico gratuito',
        desc: 'Una llamada de 30 minutos. Te digo qué se puede automatizar, qué no merece la pena y cuánto tiempo o dinero hay en juego. Sin compromiso.',
    },
    {
        step: '02',
        title: 'Propuesta cerrada',
        desc: 'Alcance, precio fijo y fecha de entrega por escrito en 48 horas. Sin horas sorpresa ni facturas que crecen a mitad del proyecto.',
    },
    {
        step: '03',
        title: 'Construcción',
        desc: 'Trabajo en abierto: ves avances cada semana y puedes corregir el rumbo antes de que sea caro. Nada se entrega en una caja negra.',
    },
    {
        step: '04',
        title: 'Entrega y formación',
        desc: 'Todo queda a tu nombre, documentado y explicado a tu equipo en vídeo. Más 30 días de soporte para ajustar lo que haga falta.',
    },
];

const GUARANTEES = [
    {
        icon: <Clock size={15} style={{ color: AMBER }} />,
        chipBg: 'rgba(255,178,36,0.08)', chipBd: 'rgba(255,178,36,0.28)',
        title: 'Semanas, no meses',
        desc: 'La mayoría de proyectos se entregan en menos de un mes. Si tarda más, lo sabes antes de firmar.',
    },
    {
        icon: <Code2 size={15} style={{ color: GREEN }} />,
        chipBg: 'rgba(63,207,142,0.08)', chipBd: 'rgba(63,207,142,0.3)',
        title: 'Todo queda tuyo',
        desc: 'Código, cuentas y accesos a tu nombre. Nada se queda atado a una plataforma nuestra.',
    },
    {
        icon: <LineChart size={15} style={{ color: '#b39dff' }} />,
        chipBg: 'rgba(139,92,246,0.1)', chipBd: 'rgba(139,92,246,0.3)',
        title: 'Medimos el resultado',
        desc: 'Cada proyecto sale con una métrica acordada: horas ahorradas, leads atendidos o ventas cerradas.',
    },
];

const STACK = [
    'React', 'TypeScript', 'Supabase', 'n8n', 'Make', 'OpenAI', 'Claude',
    'Gemini', 'Stripe', 'Paddle', 'WhatsApp API', 'Notion', 'Vercel', 'Cloudflare',
];

const FAQ = [
    {
        question: '¿Trabajáis con negocios pequeños o solo con empresas grandes?',
        answer: 'Sobre todo con negocios pequeños y medianos: tiendas online, agencias, consultorías, infoproductores y equipos de menos de 50 personas. Son los que más ganan automatizando, porque cada hora que se libera se nota al día siguiente.',
    },
    {
        question: '¿Cuánto cuesta realmente un proyecto?',
        answer: 'Los precios que ves son el punto de partida de cada servicio. El precio final depende del alcance, y lo sabes cerrado y por escrito antes de empezar: nunca facturamos por horas abiertas. Si tu presupuesto es menor, te digo qué parte del proyecto tiene sentido hacer primero.',
    },
    {
        question: 'No tengo ni idea de tecnología. ¿Es un problema?',
        answer: 'Al contrario, es lo normal. Tú pones el conocimiento de tu negocio y yo la parte técnica. Todo se entrega funcionando, documentado y explicado en vídeo, para que tu equipo lo use sin depender de nadie.',
    },
    {
        question: '¿Qué pasa si algo se rompe después de la entrega?',
        answer: 'Todos los proyectos incluyen 30 días de soporte para corregir errores sin coste. Pasado ese plazo puedes contratar mantenimiento mensual o llamarme solo cuando lo necesites.',
    },
    {
        question: '¿Puedo contratar solo una parte?',
        answer: 'Sí. Muchos clientes empiezan por una sola automatización o por el taller de formación y amplían después, cuando ya han visto el resultado. Es la forma más barata de comprobar si esto funciona en tu caso.',
    },
    {
        question: '¿En qué se diferencia esto de la suscripción de prompts?',
        answer: 'La suscripción es "hazlo tú": te damos las herramientas y los prompts por $7 al mes. Los servicios son "lo hacemos por ti": entramos en tu negocio, construimos el sistema y lo dejamos funcionando. Si tienes tiempo pero no presupuesto, empieza por la suscripción.',
    },
];

/* ── Piezas reutilizadas dentro de la página ──────────────────────────── */

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p style={{
        fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: DIM, marginBottom: 14,
    }}>
        {children}
    </p>
);

const PrimaryCta: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a
        href={href}
        style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: SANS, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            padding: '14px 24px', borderRadius: 10,
            background: 'linear-gradient(180deg, #ffffff, #d8d8d8)',
            border: '1px solid rgba(255,255,255,0.9)', color: '#000',
            boxShadow: '0 8px 26px rgba(255,255,255,0.1)',
            transition: 'transform .15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
        {children}
    </a>
);

const GhostCta: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
    const external = href.startsWith('http');
    return (
        <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: SANS, fontWeight: 600, fontSize: 14, textDecoration: 'none',
                padding: '14px 24px', borderRadius: 10,
                background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT,
                transition: 'border-color .15s, transform .15s',
            }}
            onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = '#3a3a3a';
                el.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = BORDER;
                el.style.transform = 'translateY(0)';
            }}
        >
            {children}
        </a>
    );
};

/* ── Página ───────────────────────────────────────────────────────────── */

const Servicios: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: SANS }}>
            <main className="mx-auto max-w-5xl px-5 sm:px-8 py-14 md:py-16">

                {/* ── Hero ─────────────────────────────────────────────── */}
                <section className="text-center" style={{ marginBottom: 56 }}>
                    <Eyebrow>Alpacka Studio · Servicios</Eyebrow>
                    <h1 style={{
                        fontWeight: 700, fontSize: 'clamp(1.9rem, 4.2vw, 2.9rem)',
                        lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 16,
                        textWrap: 'balance',
                    }}>
                        Metemos la IA dentro de tu negocio.{' '}
                        <span style={{ color: AMBER }}>Y la dejamos funcionando.</span>
                    </h1>
                    <p style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.75, maxWidth: 600, margin: '0 auto 28px' }}>
                        Automatizaciones, webs con IA integrada y agentes que atienden por ti.
                        Proyectos cerrados, con precio y fecha por escrito, entregados en semanas.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3" style={{ marginBottom: 22 }}>
                        <PrimaryCta href={CALL_URL}>
                            Agendar diagnóstico gratuito <ArrowRight size={15} />
                        </PrimaryCta>
                        <GhostCta href="#servicios">Ver los servicios</GhostCta>
                    </div>

                    <p style={{ fontFamily: MONO, fontSize: 11, color: DIM, letterSpacing: '0.04em' }}>
                        Respuesta en menos de 24 h · Primera llamada sin coste
                    </p>
                </section>

                {/* ── Garantías ────────────────────────────────────────── */}
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" style={{ marginBottom: 72 }}>
                    {GUARANTEES.map(g => (
                        <div key={g.title} style={{
                            backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`,
                            borderRadius: 12, padding: '20px 18px',
                        }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10, marginBottom: 13,
                                backgroundColor: g.chipBg, border: `1px solid ${g.chipBd}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {g.icon}
                            </div>
                            <p style={{ fontWeight: 700, fontSize: 13.5, color: TEXT, marginBottom: 6, letterSpacing: '-0.01em' }}>
                                {g.title}
                            </p>
                            <p style={{ color: MUTED, fontSize: 12, lineHeight: 1.65 }}>{g.desc}</p>
                        </div>
                    ))}
                </section>

                {/* ── Servicios ────────────────────────────────────────── */}
                <section id="servicios" style={{ scrollMarginTop: 80, marginBottom: 72 }}>
                    <div className="text-center" style={{ marginBottom: 34 }}>
                        <Eyebrow>Qué hacemos</Eyebrow>
                        <h2 style={{
                            fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                            letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 12,
                        }}>
                            Seis formas de ponerte la IA a trabajar.
                        </h2>
                        <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
                            Cada uno se contrata por separado. Si no sabes por cuál empezar,
                            eso es exactamente lo que resolvemos en la primera llamada.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {SERVICES.map(s => (
                            <article
                                key={s.id}
                                className="relative flex flex-col"
                                style={{
                                    borderRadius: 18, padding: 1,
                                    background: s.featured
                                        ? 'linear-gradient(160deg, rgba(255,178,36,0.45), rgba(255,178,36,0.1) 34%, #232323 66%, #1a1a1a)'
                                        : BORDER_SOFT,
                                    boxShadow: s.featured ? '0 20px 56px rgba(0,0,0,0.5)' : 'none',
                                }}
                            >
                                <div
                                    className="flex flex-1 flex-col"
                                    style={{ borderRadius: 17, backgroundColor: CARD, overflow: 'hidden' }}
                                >
                                    {/* Cabecera */}
                                    <div style={{ padding: '22px 22px 20px', borderBottom: `1px solid ${BORDER_SOFT}` }}>
                                        <div className="flex items-center justify-between gap-3" style={{ marginBottom: 16 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 11,
                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${BORDER}`, color: s.accent,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {s.icon}
                                            </div>
                                            <span style={{
                                                fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em',
                                                textTransform: 'uppercase', color: s.featured ? AMBER : DIM,
                                            }}>
                                                {s.tag}
                                            </span>
                                        </div>

                                        <h3 style={{
                                            fontSize: 16.5, fontWeight: 700, color: TEXT,
                                            letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 10,
                                        }}>
                                            {s.name}
                                        </h3>
                                        <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.7 }}>{s.pitch}</p>
                                    </div>

                                    {/* Qué incluye */}
                                    <div className="flex flex-1 flex-col" style={{ padding: '20px 22px 22px' }}>
                                        <p style={{
                                            fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em',
                                            textTransform: 'uppercase', color: DIM, marginBottom: 14,
                                        }}>
                                            Incluye
                                        </p>

                                        <div className="flex flex-col gap-2.5" style={{ marginBottom: 20 }}>
                                            {s.includes.map(item => (
                                                <div key={item} className="flex items-start gap-2.5">
                                                    <span style={{
                                                        width: 16, height: 16, borderRadius: 5, flexShrink: 0, marginTop: 1,
                                                        backgroundColor: 'rgba(63,207,142,0.1)',
                                                        border: '1px solid rgba(63,207,142,0.3)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <Check size={9} strokeWidth={3.2} style={{ color: GREEN }} />
                                                    </span>
                                                    <span style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>{item}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Precio y plazo: abajo del todo, alineados entre tarjetas */}
                                        <div
                                            className="mt-auto flex items-end justify-between gap-3"
                                            style={{ borderTop: `1px solid ${BORDER_SOFT}`, paddingTop: 16 }}
                                        >
                                            <div>
                                                <p style={{
                                                    fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em',
                                                    textTransform: 'uppercase', color: DIM, marginBottom: 5,
                                                }}>
                                                    Inversión
                                                </p>
                                                <p style={{
                                                    fontFamily: MONO, fontWeight: 700, fontSize: 19,
                                                    letterSpacing: '-0.02em', color: TEXT,
                                                }}>
                                                    {s.price}
                                                </p>
                                            </div>
                                            <span
                                                className="inline-flex items-center gap-1.5"
                                                style={{
                                                    backgroundColor: PANEL, border: `1px solid ${BORDER}`,
                                                    borderRadius: 100, padding: '5px 11px',
                                                    fontFamily: MONO, fontSize: 10, color: MUTED,
                                                }}
                                            >
                                                <Clock size={10} /> {s.timeline}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* ── Proceso ──────────────────────────────────────────── */}
                <section style={{ marginBottom: 72 }}>
                    <div className="text-center" style={{ marginBottom: 34 }}>
                        <Eyebrow>Cómo trabajamos</Eyebrow>
                        <h2 style={{
                            fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                            letterSpacing: '-0.025em', lineHeight: 1.2,
                        }}>
                            Cuatro pasos. Sin sorpresas.
                        </h2>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {PROCESS.map(p => (
                            <div key={p.step} style={{
                                backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`,
                                borderRadius: 12, padding: '20px 18px',
                            }}>
                                <span style={{
                                    fontFamily: MONO, fontSize: 11, fontWeight: 700,
                                    letterSpacing: '0.1em', color: AMBER,
                                }}>
                                    {p.step}
                                </span>
                                <p style={{
                                    fontWeight: 700, fontSize: 13.5, color: TEXT,
                                    marginTop: 12, marginBottom: 7, letterSpacing: '-0.01em',
                                }}>
                                    {p.title}
                                </p>
                                <p style={{ color: MUTED, fontSize: 12, lineHeight: 1.65 }}>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Stack ────────────────────────────────────────────── */}
                <section style={{ marginBottom: 72 }}>
                    <div className="text-center" style={{ marginBottom: 24 }}>
                        <Eyebrow>Con qué lo construimos</Eyebrow>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {STACK.map(tech => (
                            <span key={tech} style={{
                                fontFamily: MONO, fontSize: 11.5, color: MUTED,
                                backgroundColor: PANEL, border: `1px solid ${BORDER_SOFT}`,
                                borderRadius: 100, padding: '7px 14px',
                            }}>
                                {tech}
                            </span>
                        ))}
                    </div>
                </section>

                {/* ── FAQ ──────────────────────────────────────────────── */}
                <section style={{ marginBottom: 72 }}>
                    <div className="text-center" style={{ marginBottom: 32 }}>
                        <Eyebrow>Preguntas frecuentes</Eyebrow>
                        <h2 style={{
                            fontWeight: 700, fontSize: 'clamp(1.3rem, 2.6vw, 1.7rem)',
                            letterSpacing: '-0.02em', lineHeight: 1.25,
                        }}>
                            Lo que todos preguntan antes de empezar.
                        </h2>
                    </div>

                    <div style={{ backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 12, overflow: 'hidden' }}>
                        {FAQ.map((item, index) => {
                            const open = openIndex === index;
                            const last = index === FAQ.length - 1;
                            return (
                                <div key={index} style={{ borderBottom: last ? 'none' : `1px solid ${BORDER_SOFT}` }}>
                                    <button
                                        onClick={() => setOpenIndex(open ? null : index)}
                                        aria-expanded={open}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            gap: 16, padding: '16px 18px', background: 'none', border: 'none',
                                            cursor: 'pointer', textAlign: 'left',
                                        }}
                                    >
                                        <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: TEXT, lineHeight: 1.5 }}>
                                            {item.question}
                                        </span>
                                        <Plus
                                            size={16}
                                            style={{ color: DIM, flexShrink: 0, transition: 'transform .25s', transform: open ? 'rotate(45deg)' : 'none' }}
                                        />
                                    </button>
                                    <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .25s ease' }}>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ padding: '0 18px 17px', color: MUTED, fontSize: 13, lineHeight: 1.75 }}>
                                                {item.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── CTA final ────────────────────────────────────────── */}
                <section
                    className="text-center"
                    style={{
                        borderRadius: 18, padding: 1,
                        background: 'linear-gradient(160deg, rgba(255,178,36,0.4), rgba(255,178,36,0.08) 36%, #232323 68%, #1a1a1a)',
                    }}
                >
                    <div style={{ borderRadius: 17, backgroundColor: CARD, padding: '40px 28px' }}>
                        <Eyebrow>Siguiente paso</Eyebrow>
                        <h2 style={{
                            fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                            letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 14,
                            textWrap: 'balance',
                        }}>
                            Cuéntame qué te está quitando el tiempo.
                        </h2>
                        <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.75, maxWidth: 520, margin: '0 auto 26px' }}>
                            Treinta minutos, sin compromiso y sin discurso de ventas. Sales de la
                            llamada sabiendo qué automatizar primero, aunque no me contrates.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3" style={{ marginBottom: 20 }}>
                            <PrimaryCta href={CALL_URL}>
                                <Mail size={15} /> Escribir por email
                            </PrimaryCta>
                            <GhostCta href={WHATSAPP_URL}>
                                <MessageCircle size={15} /> Hablar por WhatsApp
                            </GhostCta>
                        </div>

                        <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.7 }}>
                            ¿Prefieres hacerlo tú por tu cuenta?{' '}
                            <Link to="/pricing" style={{ color: TEXT, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                                Mira la suscripción de prompts
                            </Link>{' '}
                            desde $7 al mes.
                        </p>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default Servicios;
