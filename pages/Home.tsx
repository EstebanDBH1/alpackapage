import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
    ArrowRight, ArrowUpRight, Bookmark, Check, CornerDownLeft, Library, Lock, Puzzle, Search, Sparkles,
} from 'lucide-react';
import { getCachedPromptsList, fetchPromptsList } from '../lib/promptsList';
import { isNewPrompt } from '../lib/utils';
import { Prompt } from '../types';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, GREEN, AMBER, SANS, MONO,
    CategoryBadge, categoryHref,
} from '../components/darkKit';
import { OpenAILogo, ClaudeLogo, GeminiLogo, GrokLogo, DeepSeekLogo } from '../components/AiLogos';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ══════════════════════════════════════════════════════════════
   Home — landing del SaaS con la estructura de supabase.com: hero
   centrado con dos CTA, rejilla de producto en tarjetas, secciones
   con título "frase blanca + frase gris", y un cierre con CTA.

   Todo lo que muestra sale del catálogo real (get_prompts_list, la
   misma caché que /prompts): contadores, categorías, búsqueda y
   "recién añadidos". El catálogo completo vive en /prompts; el
   buscador de aquí es un atajo que lleva allí con ?q=.

   Regla de la casa: nada cambia de tamaño mientras se usa. El
   desplegable de búsqueda flota sobre la página y los números y
   rejillas reservan su hueco mientras carga el catálogo.
   ══════════════════════════════════════════════════════════════ */

const ACCENT = AMBER;
const LINE = BORDER_SOFT;

/* Quita tildes y pasa a minúsculas para que "logo" encuentre "Logó" y viceversa */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const SUGGESTIONS = ['email de ventas', 'entrevista de trabajo', 'logo', 'reels', 'plan de negocio', 'inglés'];

const AI_TOOLS = [
    { name: 'ChatGPT', logo: <OpenAILogo size={18} /> },
    { name: 'Claude', logo: <ClaudeLogo size={18} /> },
    { name: 'Gemini', logo: <GeminiLogo size={18} /> },
    { name: 'DeepSeek', logo: <DeepSeekLogo size={18} /> },
    { name: 'Grok', logo: <GrokLogo size={16} /> },
];

/* ─── Piezas comunes ─── */

/* Título de sección a la Supabase: la primera frase en blanco, la segunda en gris */
const SectionTitle: React.FC<{ title: string; sub: string; center?: boolean; className?: string }> = ({ title, sub, center, className = '' }) => (
    <h2
        className={`hm-rv ${className}`}
        style={{
            fontWeight: 500, fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', lineHeight: 1.15, letterSpacing: '-0.03em',
            color: TEXT, maxWidth: 760, textAlign: center ? 'center' : undefined, margin: center ? '0 auto' : undefined,
            textWrap: 'balance',
        }}
    >
        {title} <span style={{ color: DIM }}>{sub}</span>
    </h2>
);

const Btn: React.FC<{ to: string; children: React.ReactNode; variant?: 'primary' | 'ghost'; size?: 'md' | 'lg' }> = ({
    to, children, variant = 'primary', size = 'md',
}) => (
    <Link to={to} className={`hm-btn hm-btn-${variant} hm-btn-${size}`}>
        {children}
    </Link>
);

/* Tarjeta con el brillo que sigue al ratón (el efecto de las tarjetas de Supabase) */
const GlowCard: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties; to?: string }> = ({
    children, className = '', style, to,
}) => {
    const onMove = (e: React.MouseEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    const common = {
        className: `hm-glow-card ${className}`,
        onMouseMove: onMove,
        style: { backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, ...style },
    };
    return to
        ? <Link to={to} {...common} style={{ ...common.style, textDecoration: 'none', color: TEXT }}>{children}</Link>
        : <div {...common}>{children}</div>;
};

const CardLabel: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="flex items-center gap-2.5" style={{ color: TEXT, fontSize: 15, fontWeight: 500 }}>
        <span style={{ color: MUTED, display: 'inline-flex' }}>{icon}</span>
        {children}
    </div>
);

/* Número que reserva su hueco mientras carga (evita que el layout salte) */
const Num: React.FC<{ value: number | null; minCh?: number }> = ({ value, minCh = 3 }) => (
    <span style={{ display: 'inline-block', minWidth: `${minCh}ch`, fontVariantNumeric: 'tabular-nums' }}>
        {value === null ? <span style={{ color: BORDER }}>···</span> : value.toLocaleString('es')}
    </span>
);

/* ══════════ Buscador en vivo ══════════ */
const LiveSearch: React.FC<{ prompts: Prompt[]; total: number | null }> = ({ prompts, total }) => {
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    const [hi, setHi] = useState(0);

    /* Atajo "/" para enfocar la búsqueda */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement;
            if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) && !t.isContentEditable) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    /* Cierra al hacer clic fuera */
    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);

    /* Cada palabra tiene que aparecer; las coincidencias en el título van primero */
    const { results, count } = useMemo(() => {
        const terms = norm(q).split(/\s+/).filter(Boolean);
        if (!terms.length) return { results: [] as Prompt[], count: 0 };
        const scored: { p: Prompt; s: number }[] = [];
        for (const p of prompts) {
            const title = norm(p.title || '');
            const hay = `${title} ${norm(p.description || '')} ${norm(p.category || '')}`;
            if (!terms.every(t => hay.includes(t))) continue;
            const s = terms.reduce((acc, t) => acc + (title.includes(t) ? 2 : 0) + (norm(p.category || '').includes(t) ? 1 : 0), 0);
            scored.push({ p, s });
        }
        scored.sort((a, b) => b.s - a.s);
        return { results: scored.slice(0, 6).map(x => x.p), count: scored.length };
    }, [q, prompts]);

    useEffect(() => { setHi(0); }, [q]);

    const goAll = (query = q) => navigate(`/prompts?q=${encodeURIComponent(query.trim())}`);

    /* Filas navegables: los resultados + "ver todos" al final */
    const rows = q.trim() ? results.length + 1 : SUGGESTIONS.length;

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHi(h => (h + 1) % rows); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => (h - 1 + rows) % rows); }
        else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (!q.trim()) { const s = SUGGESTIONS[hi]; if (s) setQ(s); return; }
            if (hi < results.length) navigate(`/prompts/${results[hi].id}`);
            else goAll();
        }
    };

    const showPanel = open;

    return (
        <div ref={boxRef} className="relative" style={{ zIndex: 30 }}>
            <div
                className="hm-search flex items-center gap-3"
                style={{
                    height: 64, padding: '0 10px 0 20px', borderRadius: 16,
                    backgroundColor: PANEL, border: `1px solid ${showPanel ? '#3a3a3a' : BORDER}`,
                    transition: 'border-color .2s, box-shadow .2s',
                    boxShadow: showPanel ? '0 0 0 4px rgba(255,178,36,0.08)' : 'none',
                }}
                onClick={() => inputRef.current?.focus()}
            >
                <Search size={19} style={{ color: MUTED, flexShrink: 0 }} />
                <input
                    ref={inputRef}
                    value={q}
                    onChange={e => { setQ(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    placeholder={total ? `Busca entre ${total.toLocaleString('es')} prompts…` : 'Busca un prompt…'}
                    aria-label="Buscar prompts"
                    role="combobox"
                    aria-expanded={showPanel}
                    aria-controls="hm-search-list"
                    autoComplete="off"
                    spellCheck={false}
                    style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: 17, color: TEXT, fontFamily: SANS }}
                />
                <kbd className="hidden sm:inline-flex" style={{ fontFamily: MONO, fontSize: 11.5, color: DIM, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '3px 8px' }}>/</kbd>
                <button
                    onClick={e => { e.stopPropagation(); q.trim() ? goAll() : inputRef.current?.focus(); }}
                    className="hm-search-go"
                    aria-label="Ver resultados"
                    style={{ height: 44, padding: '0 18px', borderRadius: 11, border: 'none', cursor: 'pointer', backgroundColor: TEXT, color: BG, fontWeight: 600, fontSize: 14.5, display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
                >
                    <span className="hidden sm:inline">Buscar</span>
                    <ArrowRight size={16} />
                </button>
            </div>

            {/* Panel flotante: no empuja nada */}
            {showPanel && (
                <div
                    id="hm-search-list"
                    role="listbox"
                    className="hm-panel"
                    style={{
                        position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                        backgroundColor: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: 16,
                        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.9)', overflow: 'hidden',
                    }}
                >
                    {!q.trim() ? (
                        <div style={{ padding: 10 }}>
                            <p style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIM, padding: '8px 10px 6px' }}>Prueba con</p>
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={s}
                                    role="option"
                                    aria-selected={hi === i}
                                    onMouseEnter={() => setHi(i)}
                                    onClick={() => { setQ(s); inputRef.current?.focus(); }}
                                    className="w-full flex items-center gap-3 text-left"
                                    style={{ padding: '10px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', backgroundColor: hi === i ? PANEL : 'transparent', color: hi === i ? TEXT : MUTED, fontSize: 15 }}
                                >
                                    <Search size={14} style={{ color: DIM }} /> {s}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: 10 }}>
                            {results.length === 0 && (
                                <p style={{ padding: '14px 10px', fontSize: 15, color: MUTED }}>
                                    Nada con “{q.trim()}”. Prueba con otra palabra o{' '}
                                    <Link to="/generador" style={{ color: TEXT, textDecoration: 'underline' }}>genera uno a medida</Link>.
                                </p>
                            )}
                            {results.map((p, i) => (
                                <Link
                                    key={p.id}
                                    to={`/prompts/${p.id}`}
                                    role="option"
                                    aria-selected={hi === i}
                                    onMouseEnter={() => setHi(i)}
                                    className="flex items-center gap-3"
                                    style={{ padding: '11px 10px', borderRadius: 10, textDecoration: 'none', backgroundColor: hi === i ? PANEL : 'transparent' }}
                                >
                                    <span style={{ flex: 1, minWidth: 0 }}>
                                        <span className="block truncate" style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{p.title}</span>
                                        <span className="block truncate" style={{ fontSize: 13, color: DIM, marginTop: 2 }}>{p.description}</span>
                                    </span>
                                    <span className="hidden sm:inline-flex"><CategoryBadge category={p.category} /></span>
                                    {p.is_premium
                                        ? <Lock size={13} style={{ color: AMBER, flexShrink: 0 }} />
                                        : <span style={{ fontFamily: MONO, fontSize: 10, color: GREEN, letterSpacing: '0.08em' }}>GRATIS</span>}
                                </Link>
                            ))}
                            {results.length > 0 && (
                                <button
                                    role="option"
                                    aria-selected={hi === results.length}
                                    onMouseEnter={() => setHi(results.length)}
                                    onClick={() => goAll()}
                                    className="w-full flex items-center justify-between text-left"
                                    style={{ marginTop: 4, padding: '12px 10px', borderRadius: 10, border: 'none', borderTop: `1px solid ${LINE}`, cursor: 'pointer', backgroundColor: hi === results.length ? PANEL : 'transparent', color: TEXT, fontSize: 14.5, fontWeight: 600 }}
                                >
                                    Ver los {count.toLocaleString('es')} resultados
                                    <CornerDownLeft size={14} style={{ color: DIM }} />
                                </button>
                            )}
                        </div>
                    )}
                    <div className="hidden sm:flex items-center gap-4" style={{ borderTop: `1px solid ${LINE}`, padding: '9px 20px', fontFamily: MONO, fontSize: 11, color: DIM }}>
                        <span>↑↓ moverte</span><span>↵ abrir</span><span>esc cerrar</span>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ══════════ Mockup del generador (alto fijo) ══════════ */
const GEN_IDEA = 'Quiero vender mis tartas caseras por Instagram';
const GEN_OUT = [
    '## Rol',
    'Eres estratega de redes para negocios de repostería.',
    '## Tarea',
    'Crea un plan de 30 días para vender [tus tartas]…',
    '## Estructura de salida',
    '- Calendario semanal · ganchos · llamadas a la acción',
];

const GeneratorMock: React.FC = () => {
    const [typed, setTyped] = useState(GEN_IDEA);
    const [lines, setLines] = useState(GEN_OUT.length);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
        let timers: ReturnType<typeof setTimeout>[] = [];
        let started = false;
        const run = () => {
            timers.forEach(clearTimeout); timers = [];
            setTyped(''); setLines(0);
            let t = 300;
            for (let i = 1; i <= GEN_IDEA.length; i++) { timers.push(setTimeout(() => setTyped(GEN_IDEA.slice(0, i)), t)); t += 38; }
            t += 500;
            for (let l = 1; l <= GEN_OUT.length; l++) { timers.push(setTimeout(() => setLines(l), t)); t += 260; }
            timers.push(setTimeout(run, t + 4200));
        };
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) { started = true; run(); } }, { threshold: 0.4 });
        if (ref.current) io.observe(ref.current);
        return () => { io.disconnect(); timers.forEach(clearTimeout); };
    }, []);

    return (
        <div ref={ref} aria-hidden="true" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16 }}>
            <div className="flex items-center gap-2" style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: '0 12px', height: 44, marginBottom: 14 }}>
                <Sparkles size={14} style={{ color: AMBER, flexShrink: 0 }} />
                <span className="truncate" style={{ fontSize: 14, color: TEXT }}>{typed}</span>
                <span className="hm-caret" />
            </div>
            <pre style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.75, margin: 0, height: 6 * 21, overflow: 'hidden' }}>
                {GEN_OUT.map((l, i) => (
                    <div key={i} style={{ color: l.startsWith('##') ? TEXT : DIM, opacity: i < lines ? 1 : 0, transform: i < lines ? 'none' : 'translateY(4px)', transition: 'opacity .35s, transform .35s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {l}
                    </div>
                ))}
            </pre>
        </div>
    );
};

/* ══════════ Ejemplo de prompt (formato real del catálogo) ══════════ */
const PROMPT_PARTS = [
    { tag: '## Rol', text: 'Eres reclutador senior en [sector] y filtras cientos de CV cada semana.', note: 'Quién tiene que ser la IA' },
    { tag: '## Tarea', text: 'Reescribe mi CV para esta oferta: [pega la oferta].', note: 'Qué tiene que hacer, con tus datos' },
    { tag: '## Estructura de salida', text: '- Palabras clave que faltan\n- Logros con verbo + resultado + cifra\n- Resumen de 3 líneas', note: 'Cómo quieres la respuesta' },
    { tag: '## Restricciones', text: 'No inventes experiencia. Si falta un dato, pregúntamelo.', note: 'Lo que no debe hacer' },
];

const PromptAnatomy: React.FC = () => {
    const [active, setActive] = useState(0);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            <div className="lg:col-span-5 flex flex-col gap-1.5">
                {PROMPT_PARTS.map((p, i) => (
                    <button
                        key={p.tag}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        onClick={() => setActive(i)}
                        className="text-left"
                        style={{
                            background: active === i ? PANEL : 'transparent', border: `1px solid ${active === i ? BORDER : 'transparent'}`,
                            borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'background-color .2s, border-color .2s',
                        }}
                    >
                        <p style={{ fontFamily: MONO, fontSize: 12, color: active === i ? ACCENT : DIM, marginBottom: 4, transition: 'color .2s' }}>{p.tag.replace('## ', '')}</p>
                        <p style={{ fontSize: 15.5, color: active === i ? TEXT : MUTED, transition: 'color .2s' }}>{p.note}</p>
                    </button>
                ))}
            </div>

            <div className="lg:col-span-7" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
                <div className="flex items-center gap-2" style={{ padding: '12px 16px', borderBottom: `1px solid ${LINE}` }}>
                    {[0, 1, 2].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#2a2a2a' }} />)}
                    <span style={{ fontFamily: MONO, fontSize: 11.5, color: DIM, marginLeft: 8 }}>mejorar-cv.md</span>
                </div>
                <pre style={{ fontFamily: MONO, fontSize: 13, lineHeight: 1.8, margin: 0, padding: '20px 22px', whiteSpace: 'pre-wrap' }}>
                    {PROMPT_PARTS.map((p, i) => (
                        <div
                            key={p.tag}
                            style={{
                                opacity: active === i ? 1 : 0.38, transition: 'opacity .25s',
                                borderLeft: `2px solid ${active === i ? ACCENT : 'transparent'}`, paddingLeft: 12, marginLeft: -14, marginBottom: 12,
                            }}
                        >
                            <div style={{ color: TEXT, fontWeight: 700 }}>{p.tag}</div>
                            <div style={{ color: MUTED }}>
                                {p.text.split(/(\[[^\]]+\])/).map((part, j) =>
                                    part.startsWith('[')
                                        ? <span key={j} style={{ color: ACCENT }}>{part}</span>
                                        : <React.Fragment key={j}>{part}</React.Fragment>,
                                )}
                            </div>
                        </div>
                    ))}
                </pre>
            </div>
        </div>
    );
};

/* ══════════ Home ══════════ */
const Home: React.FC = () => {
    const root = useRef<HTMLDivElement>(null);
    const [prompts, setPrompts] = useState<Prompt[]>(() => getCachedPromptsList() ?? []);
    const loaded = prompts.length > 0;

    useEffect(() => {
        document.title = 'Alpacka.ai · Prompts para ChatGPT, Claude y Gemini';
    }, []);

    /* Stale-while-revalidate sobre el listado ligero compartido */
    useEffect(() => {
        let cancelled = false;
        fetchPromptsList().then(fresh => { if (!cancelled && fresh) setPrompts(fresh); });
        return () => { cancelled = true; };
    }, []);

    const stats = useMemo(() => {
        const cats = new Map<string, number>();
        let free = 0;
        for (const p of prompts) {
            const c = (p.category ?? '').trim();
            if (c) cats.set(c, (cats.get(c) ?? 0) + 1);
            if (!p.is_premium) free++;
        }
        const categories = [...cats.entries()].map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'));
        return { total: prompts.length, free, categories };
    }, [prompts]);

    const latest = useMemo(
        () => [...prompts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10),
        [prompts],
    );

    const total = loaded ? stats.total : null;

    /* Animaciones contenidas: entrada del hero y aparición suave por secciones */
    useGSAP(() => {
        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            gsap.from('.hm-in', { opacity: 0, y: 16, duration: 0.8, stagger: 0.07, ease: 'power3.out' });
            gsap.utils.toArray<HTMLElement>('.hm-rv').forEach(el => {
                gsap.from(el, { opacity: 0, y: 28, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
            });
        });
    }, { scope: root });

    const signupHref = `/login?redirect=${encodeURIComponent('/prompts')}`;

    return (
        <div ref={root} style={{ backgroundColor: BG, color: TEXT, fontFamily: SANS, overflowX: 'clip' }}>
            <style>{`
                .hm-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 500; border-radius: 8px;
                    text-decoration: none; white-space: nowrap; border: 1px solid transparent; transition: background-color .15s, border-color .15s, filter .15s; }
                .hm-btn-md { font-size: 14px; height: 38px; padding: 0 16px; }
                .hm-btn-lg { font-size: 15px; height: 44px; padding: 0 20px; }
                .hm-btn-primary { background: ${ACCENT}; color: #1a1200; border-color: ${ACCENT}; font-weight: 600; }
                .hm-btn-primary:hover { filter: brightness(1.08); }
                .hm-btn-ghost { background: ${PANEL}; color: ${TEXT}; border-color: ${BORDER}; }
                .hm-btn-ghost:hover { border-color: #3a3a3a; background: #161616; }

                .hm-search-go { transition: filter .2s; } .hm-search-go:hover { filter: brightness(0.92); }
                .hm-panel { animation: hmPanel .2s cubic-bezier(.2,.8,.2,1) both; }
                @keyframes hmPanel { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
                .hm-caret { width: 1.5px; height: 16px; background: ${TEXT}; flex-shrink: 0; animation: hmBlink 1s steps(2) infinite; }
                @keyframes hmBlink { 50% { opacity: 0; } }

                /* Brillo que sigue al ratón */
                .hm-glow-card { position: relative; overflow: hidden; transition: border-color .25s; }
                .hm-glow-card::before { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .3s;
                    background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(255,178,36,0.07), transparent 60%); }
                .hm-glow-card:hover { border-color: #333; }
                .hm-glow-card:hover::before { opacity: 1; }
                .hm-glow-card > * { position: relative; }

                .hm-cat-card .hm-cat-arrow { opacity: 0; transform: translate(-4px, 4px); transition: all .25s cubic-bezier(.2,.8,.2,1); }
                .hm-cat-card:hover .hm-cat-arrow { opacity: 1; transform: none; }

                .hm-rail { scroll-snap-type: x mandatory; scrollbar-width: none; }
                .hm-rail::-webkit-scrollbar { display: none; }
                .hm-rail > * { scroll-snap-align: start; }

                .hm-grid-bg { background-image: linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px);
                    background-size: 64px 64px; mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 20%, transparent 70%);
                    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 20%, transparent 70%); }

                .hm-scope a:focus-visible, .hm-scope button:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
                @media (prefers-reduced-motion: reduce) { .hm-caret, .hm-panel { animation: none; } }
            `}</style>

            <div className="hm-scope">
                {/* ══════════ HERO ══════════ */}
                <section className="relative">
                    <div className="hm-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', top: -260, left: '50%', width: 900, height: 520, marginLeft: -450, borderRadius: '50%', background: 'rgba(255,178,36,0.09)', filter: 'blur(90px)', pointerEvents: 'none' }} />

                    <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 md:pt-28 pb-16 md:pb-24 text-center">
                        <Link
                            to="/generador"
                            className="hm-in inline-flex items-center gap-2"
                            style={{ fontSize: 13, color: MUTED, border: `1px solid ${BORDER}`, backgroundColor: 'rgba(17,17,17,0.7)', borderRadius: 99, padding: '5px 12px 5px 6px', textDecoration: 'none', marginBottom: 28 }}
                        >
                            <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', color: '#1a1200', backgroundColor: ACCENT, borderRadius: 99, padding: '2px 8px' }}>NUEVO</span>
                            Generador de prompts con IA
                            <ArrowRight size={13} />
                        </Link>

                        <h1 className="hm-in" style={{ fontWeight: 500, fontSize: 'clamp(2.5rem, 6.6vw, 5.2rem)', lineHeight: 1.04, letterSpacing: '-0.045em', maxWidth: 980, margin: '0 auto' }}>
                            Prompts que funcionan.
                            <br />
                            <span style={{ background: `linear-gradient(180deg, ${ACCENT}, #ff8a3d)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                                En cualquier IA.
                            </span>
                        </h1>

                        <p className="hm-in" style={{ fontSize: 'clamp(16px, 1.5vw, 19px)', lineHeight: 1.6, color: MUTED, maxWidth: 640, margin: '24px auto 0' }}>
                            Alpacka es la biblioteca de prompts en español para ChatGPT, Claude y Gemini: <Num value={total} /> prompts
                            probados, ordenados por categoría y listos para copiar. Y si tu caso no está, el generador te lo escribe.
                        </p>

                        <div className="hm-in flex flex-wrap items-center justify-center gap-3" style={{ marginTop: 32 }}>
                            <Btn to={signupHref} size="lg">Empieza gratis</Btn>
                            <Btn to="/prompts" size="lg" variant="ghost">Ver el catálogo</Btn>
                        </div>

                        <div className="hm-in text-left" style={{ maxWidth: 680, margin: '40px auto 0', position: 'relative', zIndex: 40 }}>
                            <LiveSearch prompts={prompts} total={total} />
                        </div>

                        <div className="hm-in" style={{ marginTop: 64 }}>
                            <p style={{ fontSize: 13.5, color: DIM, marginBottom: 20 }}>Funciona con las IA que ya usas</p>
                            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4" style={{ color: MUTED }}>
                                {AI_TOOLS.map(t => (
                                    <span key={t.name} className="inline-flex items-center gap-2.5" style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>
                                        {t.logo}{t.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════ PRODUCTO (rejilla) ══════════ */}
                <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Biblioteca: tarjeta grande */}
                        <GlowCard to="/prompts" className="hm-rv lg:row-span-2 flex flex-col" style={{ padding: 28, minHeight: 440 }}>
                            <CardLabel icon={<Library size={18} />}>Biblioteca de prompts</CardLabel>
                            <p style={{ fontSize: 15, lineHeight: 1.6, color: MUTED, marginTop: 10 }}>
                                Cada prompt viene con su rol, su tarea y el formato de respuesta. Cambias lo que está entre corchetes y listo.
                            </p>
                            <div style={{ marginTop: 'auto', paddingTop: 28 }}>
                                <p style={{ fontWeight: 500, fontSize: 'clamp(4rem, 7vw, 6rem)', letterSpacing: '-0.06em', lineHeight: 0.9 }}><Num value={total} /></p>
                                <p style={{ fontSize: 14, color: DIM, marginTop: 10 }}>prompts en <Num value={loaded ? stats.categories.length : null} minCh={2} /> categorías</p>
                                <div style={{ borderTop: `1px solid ${LINE}`, marginTop: 22, paddingTop: 14 }}>
                                    {[
                                        { k: 'Gratis, sin tarjeta', v: <Num value={loaded ? stats.free : null} minCh={2} /> },
                                        { k: 'Premium', v: <Num value={loaded ? stats.total - stats.free : null} /> },
                                    ].map(r => (
                                        <div key={r.k} className="flex items-center justify-between" style={{ padding: '6px 0', fontSize: 14 }}>
                                            <span style={{ color: MUTED }}>{r.k}</span>
                                            <span style={{ fontFamily: MONO, fontSize: 13, color: TEXT }}>{r.v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlowCard>

                        {/* Generador: ancha */}
                        <GlowCard to="/generador" className="hm-rv md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center" style={{ padding: 28 }}>
                            <div>
                                <CardLabel icon={<Sparkles size={18} />}>Generador con IA</CardLabel>
                                <p style={{ fontSize: 15, lineHeight: 1.6, color: MUTED, marginTop: 10 }}>
                                    Describe en una frase lo que quieres lograr y te devuelve un prompt a medida, con la misma estructura que los del catálogo.
                                </p>
                                <p style={{ fontFamily: MONO, fontSize: 12, color: ACCENT, marginTop: 16 }}>10 prompts al día · incluido en los planes</p>
                            </div>
                            <GeneratorMock />
                        </GlowCard>

                        {/* Guardados */}
                        <GlowCard to="/guardados" className="hm-rv flex flex-col" style={{ padding: 28 }}>
                            <CardLabel icon={<Bookmark size={18} />}>Guardados</CardLabel>
                            <p style={{ fontSize: 15, lineHeight: 1.6, color: MUTED, marginTop: 10, marginBottom: 20 }}>Tus favoritos a un clic, en el ordenador o en el móvil.</p>
                            <div aria-hidden="true" style={{ marginTop: 'auto', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 6, backgroundColor: BG }}>
                                {['Email de ventas en frío', 'Simulacro de entrevista', 'Plan de contenidos 30 días'].map((t, i) => (
                                    <div key={t} className="flex items-center gap-2.5" style={{ padding: '9px 10px', borderTop: i ? `1px solid ${LINE}` : 'none', fontSize: 13.5, color: i ? MUTED : TEXT }}>
                                        <Bookmark size={13} fill={i ? 'none' : ACCENT} style={{ color: i ? DIM : ACCENT, flexShrink: 0 }} />
                                        <span className="truncate">{t}</span>
                                    </div>
                                ))}
                            </div>
                        </GlowCard>

                        {/* Skills */}
                        <GlowCard to="/skills" className="hm-rv flex flex-col" style={{ padding: 28 }}>
                            <CardLabel icon={<Puzzle size={18} />}>Skills para Claude</CardLabel>
                            <p style={{ fontSize: 15, lineHeight: 1.6, color: MUTED, marginTop: 10 }}>
                                Instrucciones listas que convierten a Claude en un especialista. Copias, pegas y listo, sin instalar nada.
                            </p>
                            <span className="inline-flex items-center gap-1.5" style={{ marginTop: 'auto', paddingTop: 20, fontSize: 14, color: TEXT }}>
                                Ver las skills <ArrowRight size={14} />
                            </span>
                        </GlowCard>
                    </div>
                </section>

                {/* ══════════ ANATOMÍA DE UN PROMPT ══════════ */}
                <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-24">
                    <div style={{ marginBottom: 48 }}>
                        <SectionTitle title="No son frases sueltas." sub="Cada prompt tiene cuatro partes para que la IA no adivine." />
                    </div>
                    <div className="hm-rv"><PromptAnatomy /></div>
                </section>

                {/* ══════════ CATEGORÍAS ══════════ */}
                <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-24">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6" style={{ marginBottom: 40 }}>
                        <SectionTitle title="Un prompt para cada tarea." sub="Marketing, empleo, idiomas, finanzas y mucho más." />
                        <div className="hm-rv flex-shrink-0"><Btn to="/prompts" variant="ghost">Ver todas las categorías</Btn></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {(stats.categories.length ? stats.categories.slice(0, 12) : Array.from({ length: 12 }, () => null)).map((c, i) => (
                            c ? (
                                <GlowCard key={c.name} to={categoryHref(c.name)} className="hm-rv hm-cat-card flex flex-col justify-between" style={{ padding: '18px 18px 16px', height: 108 }}>
                                    <div className="flex items-start justify-between gap-2">
                                        <span style={{ fontSize: 15.5, fontWeight: 500, letterSpacing: '-0.01em' }}>{c.name}</span>
                                        <ArrowUpRight size={16} className="hm-cat-arrow" style={{ color: MUTED, flexShrink: 0 }} />
                                    </div>
                                    <span style={{ fontFamily: MONO, fontSize: 12, color: DIM }}>{c.count} prompts</span>
                                </GlowCard>
                            ) : (
                                <div key={i} className="animate-pulse" style={{ height: 108, borderRadius: 16, border: `1px solid ${LINE}`, backgroundColor: CARD }} />
                            )
                        ))}
                    </div>
                </section>

                {/* ══════════ RECIÉN AÑADIDOS ══════════ */}
                <section className="py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6" style={{ marginBottom: 40 }}>
                        <SectionTitle title="Recién añadidos." sub="El catálogo no deja de crecer." />
                        <div className="hm-rv flex-shrink-0"><Btn to="/prompts" variant="ghost">Ver el catálogo</Btn></div>
                    </div>
                    <div
                        className="hm-rail flex gap-3 overflow-x-auto pb-2"
                        style={{
                            paddingLeft: 'max(20px, calc((100vw - 80rem) / 2 + 32px))', scrollPaddingLeft: 'max(20px, calc((100vw - 80rem) / 2 + 32px))',
                            paddingRight: 20,
                        }}
                    >
                        {(latest.length ? latest : Array.from({ length: 6 }) as (Prompt | undefined)[]).map((p, i) => (
                            p ? (
                                <GlowCard key={p.id} to={`/prompts/${p.id}`} className="flex flex-col flex-shrink-0" style={{ width: 'min(320px, 80vw)', height: 216, padding: 22 }}>
                                    <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                                        <CategoryBadge category={p.category} />
                                        {isNewPrompt(p.created_at) && <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', color: GREEN }}>NUEVO</span>}
                                    </div>
                                    <h3 className="line-clamp-2" style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 8 }}>{p.title}</h3>
                                    <p className="line-clamp-2" style={{ fontSize: 14, lineHeight: 1.55, color: MUTED }}>{p.description}</p>
                                    <div className="flex items-center justify-between mt-auto" style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                        {p.is_premium
                                            ? <span className="inline-flex items-center gap-1.5" style={{ color: AMBER }}><Lock size={10} /> Premium</span>
                                            : <span style={{ color: GREEN }}>Gratis</span>}
                                        <ArrowUpRight size={16} style={{ color: DIM }} />
                                    </div>
                                </GlowCard>
                            ) : (
                                <div key={i} className="flex-shrink-0 animate-pulse" style={{ width: 'min(320px, 80vw)', height: 216, borderRadius: 16, border: `1px solid ${LINE}`, backgroundColor: CARD }} />
                            )
                        ))}
                    </div>
                </section>

                {/* ══════════ PLANES ══════════ */}
                <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-24">
                    <div style={{ marginBottom: 40 }}>
                        <SectionTitle title="Empieza gratis." sub="Desbloquea el catálogo completo y el generador cuando quieras." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                name: 'Gratis', price: '$0', unit: '', note: 'Para probar sin compromiso.',
                                perks: [<><Num value={loaded ? stats.free : null} minCh={2} /> prompts gratis</>, 'Guarda tus favoritos', 'Funciona con cualquier IA'],
                                cta: 'Crear cuenta', to: signupHref, featured: false,
                            },
                            {
                                name: 'Mensual', price: '$7', unit: '/mes', note: 'Cancelas cuando quieras.',
                                perks: [<>Los <Num value={total} /> prompts</>, 'Generador con IA, 10 al día', 'Todos los prompts nuevos que añadamos'],
                                cta: 'Empezar', to: '/pricing', featured: true,
                            },
                            {
                                name: 'Vitalicio', price: '$47.99', unit: 'pago único', note: 'Pagas una vez y es tuyo.',
                                perks: ['Todo lo del plan mensual', 'Sin renovaciones', 'Actualizaciones para siempre'],
                                cta: 'Ver el vitalicio', to: '/pricing', featured: false,
                            },
                        ].map(p => (
                            <div
                                key={p.name}
                                className="hm-rv flex flex-col"
                                style={{
                                    borderRadius: 16, padding: 28, backgroundColor: CARD,
                                    border: `1px solid ${p.featured ? 'rgba(255,178,36,0.45)' : BORDER}`,
                                    boxShadow: p.featured ? '0 0 0 1px rgba(255,178,36,0.12), 0 30px 60px -30px rgba(255,178,36,0.25)' : 'none',
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <p style={{ fontSize: 15, fontWeight: 500, color: p.featured ? ACCENT : TEXT }}>{p.name}</p>
                                    {p.featured && <span style={{ fontFamily: MONO, fontSize: 10.5, color: ACCENT, border: '1px solid rgba(255,178,36,0.35)', borderRadius: 99, padding: '2px 9px' }}>Recomendado</span>}
                                </div>
                                <p style={{ marginTop: 20, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                    <span style={{ fontWeight: 500, fontSize: 44, letterSpacing: '-0.04em', lineHeight: 1 }}>{p.price}</span>
                                    <span style={{ fontSize: 14, color: DIM }}>{p.unit}</span>
                                </p>
                                <p style={{ fontSize: 14, color: MUTED, marginTop: 10 }}>{p.note}</p>
                                <Link to={p.to} className={`hm-btn hm-btn-md ${p.featured ? 'hm-btn-primary' : 'hm-btn-ghost'}`} style={{ marginTop: 22, width: '100%' }}>
                                    {p.cta}
                                </Link>
                                <div style={{ borderTop: `1px solid ${LINE}`, marginTop: 24, paddingTop: 18 }}>
                                    {p.perks.map((perk, i) => (
                                        <div key={i} className="flex items-start gap-2.5" style={{ padding: '5px 0', fontSize: 14.5, color: MUTED }}>
                                            <Check size={15} strokeWidth={2.4} style={{ color: ACCENT, flexShrink: 0, marginTop: 3 }} />
                                            <span>{perk}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════ CIERRE ══════════ */}
                <section className="relative" style={{ borderTop: `1px solid ${LINE}`, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', bottom: -320, left: '50%', width: 900, height: 520, marginLeft: -450, borderRadius: '50%', background: 'rgba(255,178,36,0.08)', filter: 'blur(90px)', pointerEvents: 'none' }} />
                    <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24 md:py-32 text-center">
                        <h2 className="hm-rv" style={{ fontWeight: 500, fontSize: 'clamp(2rem, 4.6vw, 3.6rem)', lineHeight: 1.08, letterSpacing: '-0.04em', maxWidth: 800, margin: '0 auto' }}>
                            Deja de improvisar con la IA.{' '}
                            <span style={{ color: DIM }}>Empieza con el prompt correcto.</span>
                        </h2>
                        <div className="hm-rv flex flex-wrap items-center justify-center gap-3" style={{ marginTop: 32 }}>
                            <Btn to={signupHref} size="lg">Empieza gratis</Btn>
                            <Btn to="/pricing" size="lg" variant="ghost">Ver planes</Btn>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
