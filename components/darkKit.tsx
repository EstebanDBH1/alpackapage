import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Menu, X, LogOut, ChevronDown, Search, Bookmark, User as UserIcon, Shield, ArrowRight,
    Library, Sparkles, Puzzle, Newspaper, Briefcase, BookOpen, Instagram,
} from 'lucide-react';
import AlpacaIcon from './AlpacaIcon';
import { supabase, isAdminUser } from '../lib/supabase';
import { getCachedPromptsList, fetchPromptsList } from '../lib/promptsList';

/* ══════════════════════════════════════════════════════════════
   Kit visual del nuevo diseño oscuro estilo skills.sh
   (ver public/reference-new-app/reference.png). Lo comparten la
   home (directorio) y el detalle de prompt.
   ══════════════════════════════════════════════════════════════ */

export const BG = '#000000';
export const PANEL = '#111111';
export const CARD = '#0a0a0a';
export const BORDER = '#262626';
export const BORDER_SOFT = '#1a1a1a';
export const TEXT = '#ededed';
export const MUTED = '#a0a0a0';
export const DIM = '#707070';
export const GREEN = '#3fcf8e';
export const AMBER = '#ffb224';

/* ── Tipografía ──────────────────────────────────────────────────
   Pareja del sitio: Hanken Grotesk para todo lo que se lee (títulos,
   copy, botones, navegación) y JetBrains Mono reservado a lo técnico
   (eyebrows en versalitas, badges, precios, contadores, prompts). Usar
   la mono solo ahí es lo que hace que la combinación se note. */
export const SANS = '"Hanken Grotesk", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export const HEADER_H = 64;

/* ── Badge de categoría ──────────────────────────────────────────
   Cada categoría recibe siempre el mismo color (hash del nombre) para
   reconocerla de un vistazo. La paleta es solo de tonos fríos: el ámbar
   y el verde están reservados a "premium" y "gratis", y reutilizarlos
   aquí haría que el color dejara de significar nada. */
const CATEGORY_COLORS = [
    { fg: '#8ab6ff', bg: 'rgba(96,150,255,0.10)', bd: 'rgba(96,150,255,0.28)' }, // azul
    { fg: '#c3b0ff', bg: 'rgba(160,130,255,0.10)', bd: 'rgba(160,130,255,0.28)' }, // violeta
    { fg: '#ff9fc8', bg: 'rgba(255,120,180,0.10)', bd: 'rgba(255,120,180,0.28)' }, // rosa
    { fg: '#9fa8f5', bg: 'rgba(130,140,240,0.11)', bd: 'rgba(130,140,240,0.28)' }, // índigo
    { fg: '#e0a6ff', bg: 'rgba(200,120,255,0.10)', bd: 'rgba(200,120,255,0.28)' }, // magenta
    { fg: '#a8bdd6', bg: 'rgba(150,175,205,0.10)', bd: 'rgba(150,175,205,0.28)' }, // acero
];

export const getCategoryStyle = (category?: string | null) => {
    const key = (category || 'general').toLowerCase();
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
};

/* Badge de categoría listo para usar (grid de prompts y detalle) */
export const CategoryBadge: React.FC<{ category?: string | null; size?: 'sm' | 'md' }> = ({
    category, size = 'sm',
}) => {
    const c = getCategoryStyle(category);
    const md = size === 'md';
    return (
        <span
            className="inline-flex items-center max-w-full"
            style={{
                fontFamily: MONO,
                gap: 5,
                backgroundColor: c.bg,
                border: `1px solid ${c.bd}`,
                color: c.fg,
                borderRadius: 5,
                padding: md ? '2px 8px' : '2px 7px',
                fontSize: md ? 10 : 9.5,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                lineHeight: 1.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
            }}
        >
            <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: c.fg, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{category || 'General'}</span>
        </span>
    );
};

/* Badges de herramienta IA sobre fondo negro */
export const AI_BADGE_DARK: Record<string, { bg: string; bd: string; fg: string }> = {
    'cualquier-modelo': { bg: PANEL, bd: BORDER, fg: MUTED },
    chatgpt: { bg: 'rgba(16,163,127,0.08)', bd: 'rgba(16,163,127,0.3)', fg: '#2fbf96' },
    claude: { bg: 'rgba(212,168,83,0.08)', bd: 'rgba(212,168,83,0.3)', fg: '#d4a853' },
    gemini: { bg: 'rgba(66,133,244,0.08)', bd: 'rgba(66,133,244,0.3)', fg: '#6ea8ff' },
};

/* El generador lleva un distintivo "Nuevo" hasta que la persona entra por
   primera vez. Es descubrimiento sin insistir: se ve, y en cuanto cumple su
   función desaparece para siempre en ese navegador. */
const SEEN_GENERATOR_KEY = 'alp-seen-generator';

const readSeenGenerator = (): boolean => {
    try { return localStorage.getItem(SEEN_GENERATOR_KEY) === '1'; }
    catch { return true; } // sin localStorage no insistimos
};

const NewBadge: React.FC = () => (
    <span
        style={{
            fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: AMBER,
            backgroundColor: 'rgba(255,178,36,0.1)', border: '1px solid rgba(255,178,36,0.3)',
            borderRadius: 100, padding: '1px 5px', lineHeight: 1.5, whiteSpace: 'nowrap',
        }}
    >
        Nuevo
    </span>
);

/* El slug de categoría es el nombre en minúsculas y codificado: es lo que
   espera /prompts (compara contra `category.toLowerCase()`). Cambiar esto
   sin cambiar Prompts.tsx deja el filtro sin coincidencias. */
export const categoryHref = (name: string) =>
    `/prompts/categoria/${encodeURIComponent(name.toLowerCase())}`;

type CategorySummary = { name: string; count: number };

const summarizeCategories = (list: { category?: string | null }[] | null): CategorySummary[] => {
    if (!list) return [];
    const counts = new Map<string, number>();
    for (const p of list) {
        const name = (p.category ?? '').trim();
        if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'));
};

/* Las categorías salen del listado ya cacheado (memoria/sessionStorage). Si
   el visitante aún no ha pasado por /prompts no hay caché, y entonces solo
   se descarga cuando abre el menú: así una visita que nunca lo abre no paga
   ninguna petición extra. */
const useCatalogCategories = (shouldLoad: boolean): CategorySummary[] => {
    const [cats, setCats] = useState<CategorySummary[]>(() => summarizeCategories(getCachedPromptsList()));

    useEffect(() => {
        if (!shouldLoad || cats.length) return;
        let cancelled = false;
        fetchPromptsList().then(list => {
            if (!cancelled && list) setCats(summarizeCategories(list));
        });
        return () => { cancelled = true; };
    }, [shouldLoad, cats.length]);

    return cats;
};

/* ── Header ─────────────────────────────────────────────────────
   Estructura tipo Supabase: logo, menús con paneles a todo el ancho
   (Producto, Prompts, Recursos), Precios, y a la derecha búsqueda +
   "Iniciar sesión" + CTA. Fijo arriba con fondo translúcido: las barras
   sticky de las páginas (filtros de /prompts, /blog, /skills) se pegan
   debajo con `top: HEADER_H`. */

type MenuKey = 'producto' | 'prompts' | 'recursos';

type MenuItem = { to: string; icon: React.ReactNode; title: string; desc: string; isNew?: boolean };

const PRODUCT_ITEMS: MenuItem[] = [
    { to: '/prompts', icon: <Library size={17} />, title: 'Biblioteca de prompts', desc: 'Cientos de prompts listos para copiar y pegar.' },
    { to: '/generador', icon: <Sparkles size={17} />, title: 'Generador con IA', desc: 'Describe lo que quieres y te escribe el prompt.', isNew: true },
    { to: '/skills', icon: <Puzzle size={17} />, title: 'Skills para Claude', desc: 'Instrucciones que convierten a Claude en especialista.' },
    { to: '/guardados', icon: <Bookmark size={17} />, title: 'Guardados', desc: 'Tus prompts favoritos, siempre a un clic.' },
];

const RESOURCE_ITEMS: MenuItem[] = [
    { to: '/blog', icon: <Newspaper size={17} />, title: 'Blog', desc: 'Guías y trucos para sacarle más a la IA.' },
    { to: '/servicios', icon: <Briefcase size={17} />, title: 'Servicios', desc: 'Llevamos la IA a tu negocio, llave en mano.' },
    { to: '/bank-prompts', icon: <BookOpen size={17} />, title: 'Pack en Notion', desc: '+500 prompts en Notion con un solo pago.' },
];

const navTextStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: SANS, fontSize: 14, color: active ? TEXT : MUTED, textDecoration: 'none',
    background: 'none', border: 'none', cursor: 'pointer', padding: '8px 10px', borderRadius: 8,
    display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'color .15s, background-color .15s',
});

const MenuCard: React.FC<{ item: MenuItem; showNew: boolean; onPick: () => void }> = ({ item, showNew, onPick }) => (
    <Link to={item.to} onClick={onPick} className="alp-menu-card flex items-start gap-3" style={{ textDecoration: 'none', padding: 12, borderRadius: 10 }}>
        <span className="alp-menu-ic" style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, border: `1px solid ${BORDER}`, backgroundColor: PANEL, color: MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {item.icon}
        </span>
        <span style={{ minWidth: 0 }}>
            <span className="flex items-center gap-2" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: TEXT }}>
                {item.title}
                {item.isNew && showNew && <NewBadge />}
            </span>
            <span className="block" style={{ fontFamily: SANS, fontSize: 13, color: DIM, lineHeight: 1.5, marginTop: 2 }}>{item.desc}</span>
        </span>
    </Link>
);

export const DarkHeader: React.FC = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [user, setUser] = useState<any>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
    const [mobileSection, setMobileSection] = useState<MenuKey | null>(null);
    const [accountOpen, setAccountOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [seenGenerator, setSeenGenerator] = useState(readSeenGenerator);
    const accountRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Al visitar el generador el distintivo cumple su función y se retira
    useEffect(() => {
        if (pathname !== '/generador' || seenGenerator) return;
        try { localStorage.setItem(SEEN_GENERATOR_KEY, '1'); } catch { /* sin localStorage: se seguirá viendo */ }
        setSeenGenerator(true);
    }, [pathname, seenGenerator]);

    // Las categorías solo se cargan cuando hacen falta: al abrir su panel o el menú móvil
    const categories = useCatalogCategories(openMenu === 'prompts' || menuOpen);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const inPrompts = pathname === '/prompts' || pathname.startsWith('/prompts/');
    const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/');
    const productActive = PRODUCT_ITEMS.some(i => i.to !== '/prompts' && isActive(i.to));
    const resourcesActive = RESOURCE_ITEMS.some(i => isActive(i.to));

    // Un pequeño retardo al salir evita que el panel se cierre al cruzar el
    // hueco entre el botón y el desplegable.
    const open = (k: MenuKey) => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpenMenu(k);
    };
    const scheduleClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
    };
    useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

    // El borde inferior aparece al empezar a bajar, como en Supabase
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ⌘K / Ctrl+K enfoca la búsqueda del header
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (window.matchMedia('(min-width: 1024px)').matches) searchRef.current?.focus();
                else setMenuOpen(true);
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        setOpenMenu(null);
        setMenuOpen(false);
        searchRef.current?.blur();
        navigate(q ? `/prompts?q=${encodeURIComponent(q)}` : '/prompts');
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
        // Sin esto el header seguiría mostrando "Iniciar sesión" tras entrar
        // (o la cuenta tras salir) hasta recargar la página.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => setUser(session?.user ?? null),
        );
        return () => subscription.unsubscribe();
    }, []);

    // Al navegar se cierra todo: si no, el panel sigue abierto sobre la página nueva
    useEffect(() => {
        setMenuOpen(false);
        setOpenMenu(null);
        setMobileSection(null);
        setAccountOpen(false);
    }, [pathname]);

    // Escape cierra lo que esté abierto (y evita dejarlo sin salida en teclado)
    useEffect(() => {
        if (!menuOpen && !openMenu && !accountOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            setMenuOpen(false);
            setOpenMenu(null);
            setAccountOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [menuOpen, openMenu, accountOpen]);

    // El menú de cuenta se cierra al pulsar fuera, como en cualquier web
    useEffect(() => {
        if (!accountOpen) return;
        const onDown = (e: MouseEvent) => {
            if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [accountOpen]);

    // Bloquea el scroll del fondo: sin esto la página se desliza por detrás
    // del panel al arrastrar sobre él.
    useEffect(() => {
        if (!menuOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, [menuOpen]);

    // Datos para el menú de cuenta
    const displayName: string = user?.user_metadata?.full_name || user?.email || '';
    const firstName = displayName.split(' ')[0] || 'Mi cuenta';
    const avatarUrl: string | undefined = user?.user_metadata?.avatar_url;
    const initial = (displayName.trim()[0] || 'U').toUpperCase();
    const admin = isAdminUser(user);

    // El admin gestiona su cuenta en /admin; el resto en /dashboard
    const accountHome = admin ? '/admin' : '/dashboard';

    // Al entrar se vuelve a donde estabas, no a una página cualquiera
    const loginHref = `/login?redirect=${encodeURIComponent(pathname + window.location.search)}`;
    // "Empieza gratis" lleva al catálogo después de entrar
    const signupHref = `/login?redirect=${encodeURIComponent('/prompts')}`;

    const handleLogout = async () => {
        setMenuOpen(false);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (e) {
            console.error('Error al cerrar sesión:', e);
        }
        navigate('/');
    };

    const avatar = (size: number) => avatarUrl ? (
        <img src={avatarUrl} alt="" referrerPolicy="no-referrer" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    ) : (
        <span className="inline-flex items-center justify-center" style={{ width: size, height: size, borderRadius: '50%', backgroundColor: PANEL, border: `1px solid ${BORDER}`, fontFamily: SANS, fontSize: size * 0.44, fontWeight: 700, color: TEXT }}>
            {initial}
        </span>
    );

    const menuTrigger = (k: MenuKey, label: string, active: boolean) => (
        <div key={k} onMouseEnter={() => open(k)} onMouseLeave={scheduleClose}>
            <button
                type="button"
                className="alp-nav-item"
                onClick={() => (openMenu === k ? setOpenMenu(null) : open(k))}
                aria-expanded={openMenu === k}
                aria-haspopup="true"
                style={navTextStyle(active || openMenu === k)}
            >
                {label}
                <ChevronDown size={13} style={{ transition: 'transform .18s', transform: openMenu === k ? 'rotate(180deg)' : 'none' }} />
            </button>
        </div>
    );

    const closeAll = () => { setOpenMenu(null); setMenuOpen(false); };

    return (
        <header
            style={{
                position: 'sticky', top: 0, zIndex: 60, height: HEADER_H,
                backgroundColor: scrolled || openMenu || menuOpen ? 'rgba(0,0,0,0.82)' : BG,
                backdropFilter: 'saturate(180%) blur(14px)', WebkitBackdropFilter: 'saturate(180%) blur(14px)',
                borderBottom: `1px solid ${scrolled || openMenu || menuOpen ? BORDER_SOFT : 'transparent'}`,
                display: 'flex', alignItems: 'center', transition: 'background-color .2s, border-color .2s',
            }}
        >
            <style>{`
                .alp-nav-item:hover { color: ${TEXT} !important; background-color: ${PANEL}; }
                .alp-menu-card { transition: background-color .15s; }
                .alp-menu-card:hover { background-color: ${PANEL}; }
                .alp-menu-card:hover .alp-menu-ic { color: ${AMBER}; border-color: rgba(255,178,36,0.35); }
                .alp-menu-ic { transition: color .15s, border-color .15s; }
                .alp-panel { animation: alpPanel .18s cubic-bezier(.2,.8,.2,1) both; }
                @keyframes alpPanel { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
                .alp-cta { transition: filter .15s, transform .15s; }
                .alp-cta:hover { filter: brightness(1.08); }
                .alp-ghost:hover { border-color: #3a3a3a !important; color: ${TEXT} !important; }
                @media (prefers-reduced-motion: reduce) { .alp-panel { animation: none; } }
            `}</style>

            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }} aria-label="Inicio">
                        <AlpacaIcon variant="light" className="h-6 w-auto" />
                        <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>alpacka.ai</span>
                    </Link>

                    {/* Navegación de escritorio */}
                    <nav className="hidden lg:flex items-center" aria-label="Principal">
                        {menuTrigger('producto', 'Producto', productActive)}
                        {menuTrigger('prompts', 'Prompts', inPrompts)}
                        {menuTrigger('recursos', 'Recursos', resourcesActive)}
                        <Link to="/pricing" className="alp-nav-item" style={navTextStyle(isActive('/pricing'))}>Precios</Link>
                    </nav>
                </div>

                <div className="hidden lg:flex items-center gap-2.5">
                    {/* Búsqueda: lleva a /prompts?q= */}
                    <form onSubmit={submitSearch} className="flex items-center">
                        <div className="relative flex items-center">
                            <Search size={14} style={{ position: 'absolute', left: 10, color: DIM, pointerEvents: 'none' }} />
                            <input
                                ref={searchRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Buscar prompts"
                                aria-label="Buscar prompts"
                                style={{
                                    fontFamily: SANS, fontSize: 13, color: TEXT,
                                    backgroundColor: PANEL, border: `1px solid ${BORDER}`,
                                    borderRadius: 8, padding: '7px 44px 7px 31px', width: 200, outline: 'none',
                                    transition: 'border-color .15s',
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#3a3a3a'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
                            />
                            <kbd style={{ position: 'absolute', right: 7, fontFamily: MONO, fontSize: 10.5, color: DIM, border: `1px solid ${BORDER}`, borderRadius: 5, padding: '1px 5px', pointerEvents: 'none' }}>Ctrl K</kbd>
                        </div>
                    </form>

                    {!user ? (
                        <>
                            <Link
                                to={loginHref}
                                className="alp-ghost"
                                style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 500, color: MUTED, textDecoration: 'none', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 12px', transition: 'border-color .15s, color .15s' }}
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                to={signupHref}
                                className="alp-cta"
                                style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: '#1a1200', backgroundColor: AMBER, textDecoration: 'none', border: `1px solid ${AMBER}`, borderRadius: 8, padding: '6px 12px' }}
                            >
                                Empieza gratis
                            </Link>
                        </>
                    ) : (
                        <div ref={accountRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setAccountOpen(o => !o)}
                                aria-expanded={accountOpen}
                                aria-haspopup="menu"
                                aria-label="Menú de cuenta"
                                className="inline-flex items-center gap-2"
                                style={{
                                    backgroundColor: accountOpen ? PANEL : 'transparent',
                                    border: `1px solid ${accountOpen ? BORDER : 'transparent'}`,
                                    borderRadius: 100, padding: '4px 9px 4px 4px', cursor: 'pointer',
                                    transition: 'background-color .15s, border-color .15s',
                                }}
                            >
                                {avatar(26)}
                                <span className="max-w-[92px] truncate" style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>{firstName}</span>
                                <ChevronDown size={12} style={{ color: DIM, transition: 'transform .18s', transform: accountOpen ? 'rotate(180deg)' : 'none' }} />
                            </button>

                            {accountOpen && (
                                <div
                                    role="menu"
                                    className="alp-panel"
                                    style={{
                                        position: 'absolute', top: 'calc(100% + 9px)', right: 0, zIndex: 70,
                                        minWidth: 232, backgroundColor: CARD,
                                        border: `1px solid ${BORDER}`, borderRadius: 12,
                                        boxShadow: '0 18px 40px rgba(0,0,0,0.6)', overflow: 'hidden',
                                    }}
                                >
                                    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${BORDER_SOFT}` }}>
                                        <p className="truncate" style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: TEXT }}>{displayName}</p>
                                        {admin && (
                                            <p style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: AMBER, marginTop: 3 }}>Administrador</p>
                                        )}
                                    </div>
                                    <div style={{ padding: 6 }}>
                                        {[
                                            { to: accountHome, icon: <UserIcon size={14} />, label: admin ? 'Panel de admin' : 'Mi cuenta' },
                                            { to: '/guardados', icon: <Bookmark size={14} />, label: 'Mis guardados' },
                                            ...(admin ? [{ to: '/admin/suscriptores', icon: <Shield size={14} />, label: 'Suscriptores' }] : []),
                                        ].map(item => (
                                            <Link
                                                key={item.to}
                                                to={item.to}
                                                role="menuitem"
                                                onClick={() => setAccountOpen(false)}
                                                className="alp-menu-card flex items-center gap-2.5"
                                                style={{ fontFamily: SANS, fontSize: 13, color: MUTED, textDecoration: 'none', padding: '9px 10px', borderRadius: 8 }}
                                            >
                                                {item.icon}
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                    <div style={{ padding: 6, borderTop: `1px solid ${BORDER_SOFT}` }}>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleLogout}
                                            className="alp-menu-card flex w-full items-center gap-2.5"
                                            style={{ fontFamily: SANS, fontSize: 13, color: MUTED, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '9px 10px', borderRadius: 8 }}
                                        >
                                            <LogOut size={14} />
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Hamburguesa (móvil y tablet) */}
                <button
                    type="button"
                    className="lg:hidden inline-flex items-center justify-center"
                    onClick={() => setMenuOpen(o => !o)}
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={menuOpen}
                    aria-controls="alp-mobile-nav"
                    style={{
                        width: 38, height: 38, borderRadius: 9,
                        backgroundColor: menuOpen ? PANEL : 'transparent',
                        border: `1px solid ${menuOpen ? BORDER : 'transparent'}`,
                        color: TEXT, cursor: 'pointer', marginRight: -8,
                        transition: 'background-color .15s, border-color .15s',
                    }}
                >
                    {menuOpen ? <X size={19} /> : <Menu size={19} />}
                </button>
            </div>

            {/* Paneles de escritorio: ocupan el ancho del header */}
            {openMenu && (
                <div
                    className="alp-panel hidden lg:block"
                    onMouseEnter={() => open(openMenu)}
                    onMouseLeave={scheduleClose}
                    style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60,
                        backgroundColor: CARD, borderTop: `1px solid ${BORDER_SOFT}`, borderBottom: `1px solid ${BORDER}`,
                        boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                    }}
                >
                    <div className="mx-auto w-full max-w-7xl px-5 sm:px-8" style={{ paddingTop: 20, paddingBottom: 22 }}>
                        {openMenu === 'producto' && (
                            <div className="grid grid-cols-12 gap-8">
                                <div className="col-span-8 grid grid-cols-2 gap-1">
                                    {PRODUCT_ITEMS.map(item => <MenuCard key={item.to} item={item} showNew={!seenGenerator} onPick={closeAll} />)}
                                </div>
                                <div className="col-span-4" style={{ borderLeft: `1px solid ${BORDER_SOFT}`, paddingLeft: 28 }}>
                                    <p style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM, margin: '12px 0 12px' }}>Para empezar</p>
                                    {[
                                        { to: '/prompts', label: 'Explorar el catálogo' },
                                        { to: '/pricing', label: 'Ver planes y precios' },
                                        { to: signupHref, label: 'Crear una cuenta gratis' },
                                    ].map(l => (
                                        <Link key={l.label} to={l.to} onClick={closeAll} className="alp-menu-card flex items-center justify-between" style={{ fontFamily: SANS, fontSize: 14, color: MUTED, textDecoration: 'none', padding: '9px 10px', borderRadius: 8, margin: '0 -10px' }}>
                                            {l.label}
                                            <ArrowRight size={14} style={{ color: DIM }} />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {openMenu === 'recursos' && (
                            <div className="grid grid-cols-3 gap-1">
                                {RESOURCE_ITEMS.map(item => <MenuCard key={item.to} item={item} showNew={false} onPick={closeAll} />)}
                            </div>
                        )}

                        {openMenu === 'prompts' && (
                            <>
                                <div className="flex items-baseline justify-between" style={{ marginBottom: 12 }}>
                                    <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: DIM }}>Categorías</span>
                                    <Link to="/prompts" onClick={closeAll} className="inline-flex items-center gap-1.5" style={{ fontFamily: SANS, fontSize: 13, color: MUTED, textDecoration: 'none' }}>
                                        Ver todo el catálogo <ArrowRight size={13} />
                                    </Link>
                                </div>
                                {/* Alto reservado mientras llegan las categorías: el panel no crece de golpe */}
                                <div className="grid grid-cols-4 gap-x-6 gap-y-0.5" style={{ minHeight: 6 * 34 }}>
                                    {categories.length === 0
                                        ? Array.from({ length: 16 }).map((_, i) => (
                                            <div key={i} className="animate-pulse" style={{ height: 14, borderRadius: 5, backgroundColor: PANEL, margin: '10px 8px' }} />
                                        ))
                                        : categories.map(c => (
                                            <Link
                                                key={c.name}
                                                to={categoryHref(c.name)}
                                                onClick={closeAll}
                                                className="alp-menu-card flex items-baseline justify-between gap-3"
                                                style={{ fontFamily: SANS, fontSize: 13.5, color: MUTED, textDecoration: 'none', padding: '7px 8px', borderRadius: 7 }}
                                            >
                                                <span className="truncate">{c.name}</span>
                                                <span style={{ fontFamily: MONO, fontSize: 10.5, color: DIM, flexShrink: 0 }}>{c.count}</span>
                                            </Link>
                                        ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Panel móvil + capa para cerrar tocando fuera. La capa es absolute y no
                fixed: el backdrop-filter del header lo convierte en el bloque
                contenedor de los fixed y la capa quedaría con alto cero. */}
            {menuOpen && (
                <>
                    <div
                        className="lg:hidden"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden="true"
                        style={{ position: 'absolute', top: '100%', left: 0, right: 0, height: `calc(100dvh - ${HEADER_H}px)`, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 55 }}
                    />
                    <nav
                        id="alp-mobile-nav"
                        className="lg:hidden"
                        style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60,
                            backgroundColor: CARD, borderBottom: `1px solid ${BORDER}`,
                            padding: '12px 20px 20px', display: 'flex', flexDirection: 'column',
                            boxShadow: '0 18px 40px rgba(0,0,0,0.6)',
                            maxHeight: `calc(100dvh - ${HEADER_H}px)`, overflowY: 'auto', overscrollBehavior: 'contain',
                        }}
                    >
                        <form onSubmit={submitSearch} style={{ marginBottom: 8 }}>
                            <div className="relative flex items-center">
                                <Search size={14} style={{ position: 'absolute', left: 11, color: DIM, pointerEvents: 'none' }} />
                                <input
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Buscar prompts"
                                    aria-label="Buscar prompts"
                                    style={{ fontFamily: SANS, fontSize: 15, color: TEXT, width: '100%', backgroundColor: PANEL, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '11px 12px 11px 32px', outline: 'none' }}
                                />
                            </div>
                        </form>

                        {([
                            { k: 'producto' as MenuKey, label: 'Producto' },
                            { k: 'prompts' as MenuKey, label: 'Prompts' },
                            { k: 'recursos' as MenuKey, label: 'Recursos' },
                        ]).map(sec => (
                            <div key={sec.k} style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
                                <button
                                    type="button"
                                    onClick={() => setMobileSection(s => (s === sec.k ? null : sec.k))}
                                    aria-expanded={mobileSection === sec.k}
                                    className="w-full flex items-center justify-between"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontSize: 15, fontWeight: 500, color: TEXT, padding: '14px 2px' }}
                                >
                                    {sec.label}
                                    <ChevronDown size={16} style={{ color: DIM, transition: 'transform .18s', transform: mobileSection === sec.k ? 'rotate(180deg)' : 'none' }} />
                                </button>
                                {mobileSection === sec.k && (
                                    <div className="flex flex-col" style={{ paddingBottom: 10 }}>
                                        {sec.k === 'prompts' ? (
                                            <>
                                                <Link to="/prompts" onClick={closeAll} style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: TEXT, textDecoration: 'none', padding: '10px 12px' }}>Todo el catálogo</Link>
                                                {categories.length === 0
                                                    ? <span style={{ fontFamily: SANS, fontSize: 13, color: DIM, padding: '8px 12px' }}>Cargando categorías…</span>
                                                    : categories.map(c => (
                                                        <Link key={c.name} to={categoryHref(c.name)} onClick={closeAll} className="flex items-baseline justify-between gap-3" style={{ fontFamily: SANS, fontSize: 14, color: MUTED, textDecoration: 'none', padding: '9px 12px' }}>
                                                            <span className="truncate">{c.name}</span>
                                                            <span style={{ fontFamily: MONO, fontSize: 10.5, color: DIM, flexShrink: 0 }}>{c.count}</span>
                                                        </Link>
                                                    ))}
                                            </>
                                        ) : (
                                            (sec.k === 'producto' ? PRODUCT_ITEMS : RESOURCE_ITEMS).map(item => (
                                                <MenuCard key={item.to} item={item} showNew={!seenGenerator} onPick={closeAll} />
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        <Link to="/pricing" onClick={closeAll} style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: TEXT, textDecoration: 'none', padding: '14px 2px', borderBottom: `1px solid ${BORDER_SOFT}` }}>
                            Precios
                        </Link>

                        {!user ? (
                            <div className="grid grid-cols-2 gap-2" style={{ marginTop: 18 }}>
                                <Link to={loginHref} onClick={closeAll} className="text-center" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, textDecoration: 'none', color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px' }}>
                                    Iniciar sesión
                                </Link>
                                <Link to={signupHref} onClick={closeAll} className="text-center" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, textDecoration: 'none', color: '#1a1200', backgroundColor: AMBER, borderRadius: 10, padding: '12px 14px' }}>
                                    Empieza gratis
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2.5" style={{ marginTop: 16, marginBottom: 6, padding: '4px 2px' }}>
                                    {avatar(28)}
                                    <span className="truncate" style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: TEXT }}>{displayName}</span>
                                </div>
                                {[
                                    { to: accountHome, icon: <UserIcon size={15} />, label: admin ? 'Panel de admin' : 'Mi cuenta' },
                                    { to: '/guardados', icon: <Bookmark size={15} />, label: 'Mis guardados' },
                                ].map(item => (
                                    <Link key={item.to} to={item.to} onClick={closeAll} className="flex items-center gap-2.5" style={{ fontFamily: SANS, fontSize: 14, color: MUTED, textDecoration: 'none', padding: '12px 12px', borderRadius: 9, backgroundColor: PANEL, marginBottom: 6 }}>
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center justify-center gap-2"
                                    style={{ marginTop: 4, width: '100%', fontFamily: SANS, fontSize: 13.5, fontWeight: 600, backgroundColor: 'transparent', color: MUTED, border: `1px solid ${BORDER}`, cursor: 'pointer', borderRadius: 10, padding: '12px 18px' }}
                                >
                                    <LogOut size={14} />
                                    Cerrar sesión
                                </button>
                            </>
                        )}
                    </nav>
                </>
            )}
        </header>
    );
};

/* ── Compatibilidad con landingKit ──────────────────────────────
   Las páginas migradas desde el kit claro (catálogo, dashboard,
   guardados, …) importan estos nombres. Aquí apuntan a la paleta
   oscura, así que basta con cambiarles la ruta del import. */
export const BG_WARM = PANEL;
export const BG_INK = '#141414';     // superficie elevada (tarjeta de miembro)
export const TEXT_MED = MUTED;
export const TEXT_DIM = DIM;
export const ACCENT = AMBER;
export const YELLOW = TEXT;          // CTA principal: blanco con texto oscuro
export const FONT = SANS;

/* Euclid Circular era solo del tema claro; hoy todo el sitio usa Hanken. */
export const useEuclidFont = () => { /* no-op: la sans se carga en index.html */ };

/* Fija la tipografía dentro de `.bp-scope`: Hanken de base y JetBrains Mono
   solo en lo que se marque como mono (utilidad `font-mono`, code/pre). */
export const LandingStyles: React.FC = () => (
    <style>{`
    .bp-scope, .bp-scope * { font-family: ${SANS}; }
    .bp-scope .font-mono, .bp-scope code, .bp-scope pre, .bp-scope kbd { font-family: ${MONO}; }
    .bp-scope ::selection { background: ${TEXT}; color: #000; }
  `}</style>
);

/* ── Footer ──────────────────────────────────────────────────────
   Estructura tipo Supabase: marca a la izquierda y columnas de enlaces
   (Producto, Categorías, Recursos, Legal). Además de navegar, expone las
   categorías: es la segunda vía de entrada al catálogo (la primera es el
   header) y la que deja esos enlaces al alcance de un buscador. */

const FooterLink: React.FC<{ to: string; children: React.ReactNode; external?: boolean }> = ({ to, children, external }) => {
    const style: React.CSSProperties = { fontFamily: SANS, fontSize: 13.5, color: DIM, textDecoration: 'none', transition: 'color .15s' };
    const hover = {
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = TEXT; },
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = DIM; },
    };
    return external
        ? <a href={to} target="_blank" rel="noopener noreferrer" style={style} {...hover}>{children}</a>
        : <Link to={to} style={style} {...hover}>{children}</Link>;
};

const FooterHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: TEXT, marginBottom: 16 }}>{children}</p>
);

export const DarkFooter: React.FC = () => {
    // Una sola petición por sesión, compartida con el catálogo: al cargarla
    // aquí, /prompts ya la encuentra en caché y renderiza al instante.
    const categories = useCatalogCategories(true);

    return (
        <footer style={{ borderTop: `1px solid ${BORDER_SOFT}`, backgroundColor: BG }}>
            <div className="mx-auto max-w-7xl px-5 sm:px-8" style={{ paddingTop: 64, paddingBottom: 32 }}>
                <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-12">
                    {/* Marca */}
                    <div className="col-span-2 md:col-span-4">
                        <Link to="/" className="inline-flex items-center gap-2" style={{ textDecoration: 'none' }}>
                            <AlpacaIcon variant="light" className="h-6 w-auto" />
                            <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>alpacka.ai</span>
                        </Link>
                        <p style={{ fontFamily: SANS, fontSize: 13.5, color: DIM, lineHeight: 1.7, marginTop: 14, maxWidth: 280 }}>
                            Prompts profesionales en español para ChatGPT, Claude y Gemini.
                        </p>
                        <a
                            href="https://www.instagram.com/alpacka.ai/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram de Alpacka"
                            className="inline-flex items-center justify-center"
                            style={{ marginTop: 20, width: 36, height: 36, borderRadius: 9, border: `1px solid ${BORDER}`, color: MUTED, transition: 'color .15s, border-color .15s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = '#3a3a3a'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER; }}
                        >
                            <Instagram size={16} />
                        </a>
                    </div>

                    <div className="md:col-span-2 flex flex-col">
                        <FooterHeading>Producto</FooterHeading>
                        <div className="flex flex-col gap-3">
                            <FooterLink to="/prompts">Biblioteca de prompts</FooterLink>
                            <FooterLink to="/generador">Generador con IA</FooterLink>
                            <FooterLink to="/skills">Skills para Claude</FooterLink>
                            <FooterLink to="/guardados">Guardados</FooterLink>
                            <FooterLink to="/pricing">Precios</FooterLink>
                        </div>
                    </div>

                    <div className="md:col-span-2 flex flex-col">
                        <FooterHeading>Recursos</FooterHeading>
                        <div className="flex flex-col gap-3">
                            <FooterLink to="/blog">Blog</FooterLink>
                            <FooterLink to="/servicios">Servicios</FooterLink>
                            <FooterLink to="/bank-prompts">Pack en Notion</FooterLink>
                            <FooterLink to="/dashboard">Mi cuenta</FooterLink>
                        </div>
                    </div>

                    {/* Categorías: alto reservado mientras cargan */}
                    <div className="col-span-2 md:col-span-4 flex flex-col">
                        <FooterHeading>Categorías</FooterHeading>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3" style={{ minHeight: 5 * 32 }}>
                            {categories.length === 0
                                ? Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="animate-pulse" style={{ height: 13, borderRadius: 4, backgroundColor: PANEL, marginTop: 4 }} />
                                ))
                                : categories.slice(0, 10).map(c => (
                                    <FooterLink key={c.name} to={categoryHref(c.name)}>{c.name}</FooterLink>
                                ))}
                        </div>
                        {categories.length > 10 && (
                            <div style={{ marginTop: 14 }}>
                                <FooterLink to="/prompts">Ver las {categories.length} categorías →</FooterLink>
                            </div>
                        )}
                    </div>
                </div>

                {/* Barra inferior */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderTop: `1px solid ${BORDER_SOFT}`, marginTop: 56, paddingTop: 24 }}>
                    <span style={{ fontFamily: SANS, fontSize: 12.5, color: DIM }}>© {new Date().getFullYear()} alpacka.ai · Pagos procesados por Paddle</span>
                    <div className="flex items-center gap-6">
                        <FooterLink to="/terms">Términos</FooterLink>
                        <FooterLink to="/privacy">Privacidad</FooterLink>
                    </div>
                </div>
            </div>
        </footer>
    );
};
