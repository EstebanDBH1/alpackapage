import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertCircle, ArrowRight, Bot, Check, CheckCircle2, Clock, Code2, GraduationCap,
    LineChart, Loader2, Mail, Plus, Rocket, Send, Sparkles, Workflow, Globe,
} from 'lucide-react';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, GREEN, AMBER, SANS, MONO,
} from '../components/darkKit';
import { supabase } from '../lib/supabase';

/* Página de servicios (Alpacka Studio): el brazo de "hecho para ti" del
   negocio. Sin precios publicados: cada proyecto se presupuesta tras la
   primera conversación. El formulario de abajo inserta en la tabla
   service_requests (el público solo puede insertar; leer es cosa del admin,
   en /admin/solicitudes). Todo el contenido es estático y vive aquí arriba
   para poder editar textos sin tocar el maquetado. */

/* ── Contacto ─────────────────────────────────────────────────────────── */
const CONTACT_EMAIL = 'alpackaaiservice@gmail.com';
const MAILTO_URL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Consulta de servicio — Alpacka Studio')}`;

type Service = {
    id: string;
    icon: React.ReactNode;
    accent: string;
    tag: string;
    name: string;
    pitch: string;
    includes: string[];
    ideal: string;
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
        ideal: 'Equipos que pierden horas en tareas repetitivas',
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
        ideal: 'Negocios que quieren una web que venda sola',
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
        ideal: 'Marcas que reciben muchos mensajes al día',
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
        ideal: 'Emprendedores con una idea de producto digital',
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
        ideal: 'Creadores y marcas que publican cada semana',
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
        ideal: 'Equipos que ya usan IA pero sin método',
        timeline: 'Sesión o mensual',
    },
];

const PROCESS = [
    {
        step: '01',
        title: 'Nos cuentas qué necesitas',
        desc: 'Rellenas el formulario o nos escribes. Te contactamos en menos de 24 horas para entender tu negocio y lo que quieres conseguir. Sin compromiso.',
    },
    {
        step: '02',
        title: 'Propuesta a medida',
        desc: 'Alcance, presupuesto y fecha de entrega por escrito. Sin horas sorpresa ni facturas que crecen a mitad del proyecto.',
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
        question: '¿Cuánto cuesta un proyecto?',
        answer: 'Depende de lo que necesites, por eso no publicamos tarifas cerradas. Nos cuentas tu caso en el formulario, lo hablamos y te enviamos una propuesta con alcance, precio y fecha por escrito antes de empezar: nunca facturamos por horas abiertas. Si tu presupuesto es ajustado, te decimos qué parte tiene sentido hacer primero.',
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
        answer: 'La suscripción es "hazlo tú": te damos las herramientas y los prompts para que los uses por tu cuenta. Los servicios son "lo hacemos por ti": entramos en tu negocio, construimos el sistema y lo dejamos funcionando. Si tienes tiempo pero no presupuesto, empieza por la suscripción.',
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

/* ── Formulario de solicitud ──────────────────────────────────────────── */

const fieldStyle: React.CSSProperties = {
    width: '100%', backgroundColor: PANEL, border: `1px solid ${BORDER}`, borderRadius: 10,
    padding: '12px 14px', fontFamily: SANS, fontSize: 14, color: TEXT, outline: 'none',
    transition: 'border-color .15s',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: DIM, marginBottom: 7,
};

const focusOn = (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.borderColor = AMBER; };
const focusOff = (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.borderColor = BORDER; };

const ContactForm: React.FC<{ service: string; onServiceChange: (s: string) => void }> = ({ service, onServiceChange }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [website, setWebsite] = useState('');   // honeypot: invisible para personas
    const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        // Un bot que rellena el campo oculto recibe un «enviado» falso.
        if (website) { setState('sent'); return; }
        if (message.trim().length < 10) {
            setErrorMsg('Cuéntanos un poco más sobre lo que necesitas.');
            return;
        }
        setState('sending');
        const { error } = await supabase.from('service_requests').insert({
            name: name.trim(),
            email: email.trim(),
            service: service || null,
            message: message.trim(),
        });
        if (error) {
            setState('error');
            setErrorMsg(`No se pudo enviar. Inténtalo de nuevo o escríbenos a ${CONTACT_EMAIL}.`);
            return;
        }
        setState('sent');
    };

    if (state === 'sent') {
        return (
            <div
                className="flex flex-col items-center justify-center text-center"
                style={{ backgroundColor: PANEL, border: `1px solid ${BORDER_SOFT}`, borderRadius: 14, padding: '40px 24px' }}
            >
                <CheckCircle2 size={34} style={{ color: GREEN, marginBottom: 14 }} />
                <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>¡Solicitud enviada!</p>
                <p style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.7, maxWidth: 340 }}>
                    Gracias{name ? `, ${name.trim().split(' ')[0]}` : ''}. Hemos recibido tu mensaje y te
                    responderemos por correo en menos de 24 horas.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="sr-name" style={labelStyle}>Nombre *</label>
                    <input id="sr-name" required maxLength={120} autoComplete="name" value={name}
                        onChange={e => setName(e.target.value)} onFocus={focusOn} onBlur={focusOff}
                        placeholder="Tu nombre" style={fieldStyle} />
                </div>
                <div>
                    <label htmlFor="sr-email" style={labelStyle}>Correo electrónico *</label>
                    <input id="sr-email" required type="email" maxLength={254} autoComplete="email" value={email}
                        onChange={e => setEmail(e.target.value)} onFocus={focusOn} onBlur={focusOff}
                        placeholder="tu@correo.com" style={fieldStyle} />
                </div>
            </div>

            <div>
                <label htmlFor="sr-service" style={labelStyle}>Servicio que te interesa</label>
                <select id="sr-service" value={service} onChange={e => onServiceChange(e.target.value)}
                    onFocus={focusOn} onBlur={focusOff} style={{ ...fieldStyle, cursor: 'pointer' }}>
                    <option value="">No lo sé todavía / otro</option>
                    {SERVICES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="sr-message" style={labelStyle}>¿Qué necesitas? *</label>
                <textarea id="sr-message" required minLength={10} maxLength={5000} rows={6} value={message}
                    onChange={e => setMessage(e.target.value)} onFocus={focusOn} onBlur={focusOff}
                    placeholder="Cuéntanos a qué se dedica tu negocio, qué quieres conseguir y, si lo tienes, un plazo aproximado."
                    style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>

            {/* Honeypot anti-spam: fuera de pantalla y fuera del orden de tabulación */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                value={website} onChange={e => setWebsite(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

            {errorMsg && (
                <div className="flex items-start gap-2" style={{
                    backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)',
                    borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#fca5a5',
                }}>
                    <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} /> {errorMsg}
                </div>
            )}

            <button
                type="submit"
                disabled={state === 'sending'}
                className="inline-flex items-center justify-center gap-2"
                style={{
                    fontFamily: SANS, fontWeight: 700, fontSize: 14, padding: '14px 24px', borderRadius: 10,
                    background: 'linear-gradient(180deg, #ffffff, #d8d8d8)',
                    border: '1px solid rgba(255,255,255,0.9)', color: '#000',
                    cursor: state === 'sending' ? 'wait' : 'pointer', opacity: state === 'sending' ? 0.7 : 1,
                }}
            >
                {state === 'sending'
                    ? <><Loader2 size={15} className="animate-spin" /> Enviando…</>
                    : <><Send size={15} /> Enviar solicitud</>}
            </button>
        </form>
    );
};

/* ── Página ───────────────────────────────────────────────────────────── */

const Servicios: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [pickedService, setPickedService] = useState('');

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
                        Automatizaciones, webs con IA integrada, agentes que atienden por ti y
                        formación para tu equipo. Proyectos a medida de tu negocio, entregados en semanas.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3" style={{ marginBottom: 22 }}>
                        <PrimaryCta href="#contacto">
                            Cuéntanos qué necesitas <ArrowRight size={15} />
                        </PrimaryCta>
                        <GhostCta href="#servicios">Ver los servicios</GhostCta>
                    </div>

                    <p style={{ fontFamily: MONO, fontSize: 11, color: DIM, letterSpacing: '0.04em' }}>
                        Respuesta en menos de 24 h · Primera consulta sin coste
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

                                        {/* Para quién y plazo: abajo del todo, alineados entre tarjetas */}
                                        <div
                                            className="mt-auto flex flex-col gap-4"
                                            style={{ borderTop: `1px solid ${BORDER_SOFT}`, paddingTop: 16 }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p style={{
                                                        fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em',
                                                        textTransform: 'uppercase', color: DIM, marginBottom: 5,
                                                    }}>
                                                        Ideal para
                                                    </p>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, lineHeight: 1.45 }}>
                                                        {s.ideal}
                                                    </p>
                                                </div>
                                                <span
                                                    className="inline-flex flex-shrink-0 items-center gap-1.5"
                                                    style={{
                                                        backgroundColor: PANEL, border: `1px solid ${BORDER}`,
                                                        borderRadius: 100, padding: '5px 11px',
                                                        fontFamily: MONO, fontSize: 10, color: MUTED,
                                                    }}
                                                >
                                                    <Clock size={10} /> {s.timeline}
                                                </span>
                                            </div>
                                            <a
                                                href="#contacto"
                                                onClick={() => setPickedService(s.name)}
                                                className="inline-flex items-center gap-1.5 self-start"
                                                style={{
                                                    fontSize: 13, fontWeight: 600, textDecoration: 'none',
                                                    color: s.featured ? AMBER : TEXT,
                                                }}
                                            >
                                                Solicitar este servicio <ArrowRight size={13} />
                                            </a>
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

                {/* ── Contacto + formulario ────────────────────────────── */}
                <section
                    id="contacto"
                    style={{
                        scrollMarginTop: 80, borderRadius: 18, padding: 1,
                        background: 'linear-gradient(160deg, rgba(255,178,36,0.4), rgba(255,178,36,0.08) 36%, #232323 68%, #1a1a1a)',
                    }}
                >
                    <div
                        className="grid gap-10 md:grid-cols-[1fr_1.25fr]"
                        style={{ borderRadius: 17, backgroundColor: CARD, padding: 'clamp(24px, 4vw, 40px)' }}
                    >
                        <div>
                            <Eyebrow>Siguiente paso</Eyebrow>
                            <h2 style={{
                                fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                                letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 14,
                                textWrap: 'balance',
                            }}>
                                Cuéntanos qué necesitas.
                            </h2>
                            <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.75, marginBottom: 24 }}>
                                Explícanos tu negocio y lo que quieres conseguir. Revisamos cada
                                solicitud personalmente y te respondemos en menos de 24 horas con
                                una propuesta o, como mínimo, con un consejo útil.
                            </p>

                            <div className="flex flex-col gap-3" style={{ marginBottom: 24 }}>
                                {['Sin compromiso ni discurso de ventas', 'Propuesta a medida y por escrito', 'Tus datos solo se usan para responderte'].map(t => (
                                    <div key={t} className="flex items-center gap-2.5">
                                        <Check size={14} strokeWidth={3} style={{ color: GREEN, flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: MUTED }}>{t}</span>
                                    </div>
                                ))}
                            </div>

                            <p style={{
                                fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em',
                                textTransform: 'uppercase', color: DIM, marginBottom: 8,
                            }}>
                                ¿Prefieres el correo?
                            </p>
                            <a
                                href={MAILTO_URL}
                                className="inline-flex items-center gap-2 break-all"
                                style={{ fontSize: 14, fontWeight: 600, color: TEXT, textDecoration: 'none' }}
                            >
                                <Mail size={15} style={{ color: AMBER, flexShrink: 0 }} /> {CONTACT_EMAIL}
                            </a>
                        </div>

                        <ContactForm service={pickedService} onServiceChange={setPickedService} />
                    </div>
                </section>

                <p className="text-center" style={{ fontSize: 12.5, color: DIM, lineHeight: 1.7, marginTop: 24 }}>
                    ¿Prefieres hacerlo tú por tu cuenta?{' '}
                    <Link to="/prompts" style={{ color: TEXT, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                        Explora la biblioteca de prompts
                    </Link>
                </p>

            </main>
        </div>
    );
};

export default Servicios;
