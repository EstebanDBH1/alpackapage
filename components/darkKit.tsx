import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, ChevronDown, Search, Bookmark, User as UserIcon, Shield } from 'lucide-react';
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

export const HEADER_H = 56;

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

/* ── Navegación ──────────────────────────────────────────────────
   El catálogo tiene 20+ categorías y cientos de prompts, así que
   "Prompts" es un desplegable con todas ellas en vez de un enlace
   suelto: sin eso, las rutas /prompts/categoria/* existen pero no
   las enlaza nadie y el catálogo entero cuelga de una sola puerta. */

const NAV_LINKS: { to: string; label: string; highlight?: boolean }[] = [
    { to: '/generador', label: 'Generador', highlight: true },
    { to: '/skills', label: 'Skills' },
    { to: '/blog', label: 'Blog' },
    { to: '/pricing', label: 'Precios' },
];

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

export const DarkHeader: React.FC = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [user, setUser] = useState<any>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [catsOpen, setCatsOpen] = useState(false);
    const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [seenGenerator, setSeenGenerator] = useState(readSeenGenerator);
    const accountRef = useRef<HTMLDivElement>(null);

    // Al visitar el generador el distintivo cumple su función y se retira
    useEffect(() => {
        if (pathname !== '/generador' || seenGenerator) return;
        try { localStorage.setItem(SEEN_GENERATOR_KEY, '1'); } catch { /* sin localStorage: se seguirá viendo */ }
        setSeenGenerator(true);
    }, [pathname, seenGenerator]);

    // Solo se cargan cuando hacen falta: al abrir el desplegable o el menú móvil
    const categories = useCatalogCategories(catsOpen || menuOpen);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const inPrompts = pathname === '/prompts' || pathname.startsWith('/prompts/');
    const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/');

    // Un pequeño retardo al salir evita que el panel se cierre al cruzar el
    // hueco entre el botón y el desplegable.
    const openCats = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setCatsOpen(true);
    };
    const scheduleCloseCats = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setCatsOpen(false), 140);
    };
    useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        setCatsOpen(false);
        setMenuOpen(false);
        navigate(q ? `/prompts?q=${encodeURIComponent(q)}` : '/prompts');
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
        // Sin esto el header seguiría mostrando "Cuenta" tras cerrar sesión
        // (o "Acceder" tras entrar) hasta recargar la página.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => setUser(session?.user ?? null),
        );
        return () => subscription.unsubscribe();
    }, []);

    // Al navegar se cierra todo: si no, el panel sigue abierto sobre la página nueva
    useEffect(() => {
        setMenuOpen(false);
        setCatsOpen(false);
        setMobileCatsOpen(false);
        setAccountOpen(false);
    }, [pathname]);

    // Escape cierra lo que esté abierto (y evita dejarlo sin salida en teclado)
    useEffect(() => {
        if (!menuOpen && !catsOpen && !accountOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            setMenuOpen(false);
            setCatsOpen(false);
            setAccountOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [menuOpen, catsOpen, accountOpen]);

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

    return (
        <header
            style={{
                position: 'relative', zIndex: 60,
                height: HEADER_H,
                backgroundColor: BG,
                borderBottom: `1px solid ${BORDER_SOFT}`,
                display: 'flex', alignItems: 'center',
            }}
        >
            <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 flex items-center justify-between">
                <Link to="/" className="flex items-center" style={{ textDecoration: 'none' }} aria-label="Inicio">
                    <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
                        alpacka.ai
                    </span>
                </Link>

                {/* Navegación de escritorio — a partir de md: con 5 enlaces más el
                    botón de cuenta, en tablet no cabe y se usa la hamburguesa. */}
                <nav className="hidden md:flex items-center gap-4">
                    {/* Prompts: enlace + desplegable con todas las categorías */}
                    <div
                        className="relative flex items-center"
                        onMouseEnter={openCats}
                        onMouseLeave={scheduleCloseCats}
                    >
                        <Link
                            to="/prompts"
                            style={{
                                fontFamily: SANS, fontSize: 13, textDecoration: 'none',
                                color: inPrompts ? TEXT : MUTED, transition: 'color .15s',
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
                            onMouseLeave={e => { if (!inPrompts) (e.currentTarget as HTMLElement).style.color = MUTED; }}
                        >
                            Prompts
                        </Link>
                        <button
                            type="button"
                            onClick={() => (catsOpen ? setCatsOpen(false) : openCats())}
                            aria-expanded={catsOpen}
                            aria-haspopup="true"
                            aria-label="Ver categorías"
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                                color: inPrompts ? TEXT : MUTED, display: 'inline-flex', alignItems: 'center',
                            }}
                        >
                            <ChevronDown
                                size={13}
                                style={{ transition: 'transform .18s', transform: catsOpen ? 'rotate(180deg)' : 'none' }}
                            />
                        </button>
                    </div>

                    {NAV_LINKS.map(l => (
                        <Link
                            key={l.to}
                            to={l.to}
                            className="inline-flex items-center gap-1.5"
                            style={{
                                fontFamily: SANS, fontSize: 13, textDecoration: 'none',
                                color: isActive(l.to) ? TEXT : MUTED, transition: 'color .15s',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
                            onMouseLeave={e => { if (!isActive(l.to)) (e.currentTarget as HTMLElement).style.color = MUTED; }}
                        >
                            {l.label}
                            {l.highlight && !seenGenerator && <NewBadge />}
                        </Link>
                    ))}

                    {/* Buscador: lleva a /prompts?q= */}
                    <form onSubmit={submitSearch} className="hidden lg:flex items-center" style={{ marginLeft: 4 }}>
                        <div className="relative flex items-center">
                            <Search size={13} style={{ position: 'absolute', left: 9, color: DIM, pointerEvents: 'none' }} />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Buscar prompts"
                                aria-label="Buscar prompts"
                                style={{
                                    fontFamily: SANS, fontSize: 12.5, color: TEXT,
                                    backgroundColor: PANEL, border: `1px solid ${BORDER}`,
                                    borderRadius: 8, padding: '6px 10px 6px 27px', width: 150, outline: 'none',
                                    transition: 'border-color .15s, width .18s',
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.width = '190px'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.width = '150px'; }}
                            />
                        </div>
                    </form>
                    {!user ? (
                        <Link
                            to={loginHref}
                            style={{
                                fontFamily: SANS, fontSize: 12.5, fontWeight: 600, textDecoration: 'none',
                                backgroundColor: TEXT, color: '#000',
                                borderRadius: 8, padding: '7px 14px', marginLeft: 3,
                            }}
                        >
                            Acceder
                        </Link>
                    ) : (
                        <div ref={accountRef} className="relative" style={{ marginLeft: 3 }}>
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
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                        style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <span
                                        className="inline-flex items-center justify-center"
                                        style={{
                                            width: 26, height: 26, borderRadius: '50%',
                                            backgroundColor: PANEL, border: `1px solid ${BORDER}`,
                                            fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: TEXT,
                                        }}
                                    >
                                        {initial}
                                    </span>
                                )}
                                <span
                                    className="max-w-[92px] truncate"
                                    style={{ fontFamily: SANS, fontSize: 12.5, color: MUTED }}
                                >
                                    {firstName}
                                </span>
                                <ChevronDown
                                    size={12}
                                    style={{ color: DIM, transition: 'transform .18s', transform: accountOpen ? 'rotate(180deg)' : 'none' }}
                                />
                            </button>

                            {accountOpen && (
                                <div
                                    role="menu"
                                    style={{
                                        position: 'absolute', top: 'calc(100% + 9px)', right: 0, zIndex: 70,
                                        minWidth: 224, backgroundColor: CARD,
                                        border: `1px solid ${BORDER}`, borderRadius: 12,
                                        boxShadow: '0 18px 40px rgba(0,0,0,0.6)', overflow: 'hidden',
                                    }}
                                >
                                    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${BORDER_SOFT}` }}>
                                        <p className="truncate" style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: TEXT }}>
                                            {displayName}
                                        </p>
                                        {admin && (
                                            <p style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: AMBER, marginTop: 3 }}>
                                                Administrador
                                            </p>
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
                                                className="flex items-center gap-2.5"
                                                style={{
                                                    fontFamily: SANS, fontSize: 13, color: MUTED, textDecoration: 'none',
                                                    padding: '9px 10px', borderRadius: 8, transition: 'background-color .12s, color .12s',
                                                }}
                                                onMouseEnter={e => {
                                                    const el = e.currentTarget as HTMLElement;
                                                    el.style.backgroundColor = PANEL; el.style.color = TEXT;
                                                }}
                                                onMouseLeave={e => {
                                                    const el = e.currentTarget as HTMLElement;
                                                    el.style.backgroundColor = 'transparent'; el.style.color = MUTED;
                                                }}
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
                                            className="flex w-full items-center gap-2.5"
                                            style={{
                                                fontFamily: SANS, fontSize: 13, color: MUTED, textAlign: 'left',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                padding: '9px 10px', borderRadius: 8, transition: 'background-color .12s, color .12s',
                                            }}
                                            onMouseEnter={e => {
                                                const el = e.currentTarget as HTMLElement;
                                                el.style.backgroundColor = PANEL; el.style.color = TEXT;
                                            }}
                                            onMouseLeave={e => {
                                                const el = e.currentTarget as HTMLElement;
                                                el.style.backgroundColor = 'transparent'; el.style.color = MUTED;
                                            }}
                                        >
                                            <LogOut size={14} />
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Hamburguesa (móvil y tablet) */}
                <button
                    type="button"
                    className="md:hidden inline-flex items-center justify-center"
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

            {/* Desplegable de categorías (escritorio). Ocupa el ancho del header
                en vez de colgar del botón: con 20+ categorías, un panel anclado
                se saldría de la pantalla por la derecha. */}
            {catsOpen && (
                <div
                    className="hidden md:block"
                    onMouseEnter={openCats}
                    onMouseLeave={scheduleCloseCats}
                    style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60,
                        backgroundColor: CARD,
                        borderTop: `1px solid ${BORDER_SOFT}`,
                        borderBottom: `1px solid ${BORDER}`,
                        boxShadow: '0 20px 44px rgba(0,0,0,0.6)',
                    }}
                >
                    <div className="mx-auto w-full max-w-6xl px-5 sm:px-8" style={{ paddingTop: 20, paddingBottom: 18 }}>
                        <div className="flex items-baseline justify-between" style={{ marginBottom: 14 }}>
                            <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: DIM }}>
                                Categorías
                            </span>
                            <Link
                                to="/prompts"
                                style={{ fontFamily: SANS, fontSize: 12.5, color: MUTED, textDecoration: 'none' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = MUTED; }}
                            >
                                Ver todo el catálogo →
                            </Link>
                        </div>

                        {categories.length === 0 ? (
                            <div className="grid grid-cols-4 gap-x-6 gap-y-1.5">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="animate-pulse"
                                        style={{ height: 15, borderRadius: 5, backgroundColor: PANEL, margin: '7px 0' }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-x-6 gap-y-0.5">
                                {categories.map(c => (
                                    <Link
                                        key={c.name}
                                        to={categoryHref(c.name)}
                                        onClick={() => setCatsOpen(false)}
                                        className="flex items-baseline justify-between gap-3"
                                        style={{
                                            fontFamily: SANS, fontSize: 13, color: MUTED, textDecoration: 'none',
                                            padding: '7px 8px', borderRadius: 7, transition: 'background-color .12s, color .12s',
                                        }}
                                        onMouseEnter={e => {
                                            const el = e.currentTarget as HTMLElement;
                                            el.style.backgroundColor = PANEL;
                                            el.style.color = TEXT;
                                        }}
                                        onMouseLeave={e => {
                                            const el = e.currentTarget as HTMLElement;
                                            el.style.backgroundColor = 'transparent';
                                            el.style.color = MUTED;
                                        }}
                                    >
                                        <span className="truncate">{c.name}</span>
                                        <span style={{ fontFamily: MONO, fontSize: 10.5, color: DIM, flexShrink: 0 }}>
                                            {c.count}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Panel móvil + capa para cerrar tocando fuera */}
            {menuOpen && (
                <>
                    <div
                        className="md:hidden"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden="true"
                        style={{
                            position: 'fixed', top: HEADER_H, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 55,
                        }}
                    />
                    <nav
                        id="alp-mobile-nav"
                        className="md:hidden"
                        style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60,
                            // Un punto más claro que el fondo: sobre negro atenuado, un
                            // panel negro puro no se distingue de la página de detrás.
                            backgroundColor: CARD,
                            borderBottom: `1px solid ${BORDER}`,
                            padding: '10px 20px 18px',
                            display: 'flex', flexDirection: 'column',
                            boxShadow: '0 18px 40px rgba(0,0,0,0.6)',
                            // Con las categorías desplegadas la lista no cabe en pantalla:
                            // el panel se desplaza por dentro en vez de desbordarse.
                            maxHeight: `calc(100vh - ${HEADER_H}px)`,
                            overflowY: 'auto',
                            overscrollBehavior: 'contain',
                        }}
                    >
                        <form onSubmit={submitSearch} style={{ marginBottom: 6 }}>
                            <div className="relative flex items-center">
                                <Search size={14} style={{ position: 'absolute', left: 11, color: DIM, pointerEvents: 'none' }} />
                                <input
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Buscar prompts"
                                    aria-label="Buscar prompts"
                                    style={{
                                        fontFamily: SANS, fontSize: 14, color: TEXT, width: '100%',
                                        backgroundColor: PANEL, border: `1px solid ${BORDER}`,
                                        borderRadius: 10, padding: '11px 12px 11px 32px', outline: 'none',
                                    }}
                                />
                            </div>
                        </form>

                        {/* Prompts, con las categorías dentro */}
                        <div style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
                            <div className="flex items-center justify-between">
                                <Link
                                    to="/prompts"
                                    onClick={() => setMenuOpen(false)}
                                    style={{
                                        flex: 1, fontFamily: SANS, fontSize: 14.5, fontWeight: 500,
                                        color: inPrompts ? TEXT : MUTED, textDecoration: 'none', padding: '13px 2px',
                                    }}
                                >
                                    Prompts
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setMobileCatsOpen(o => !o)}
                                    aria-expanded={mobileCatsOpen}
                                    aria-label={mobileCatsOpen ? 'Ocultar categorías' : 'Ver categorías'}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: MUTED, padding: '10px 6px', display: 'inline-flex', alignItems: 'center',
                                    }}
                                >
                                    <ChevronDown
                                        size={16}
                                        style={{ transition: 'transform .18s', transform: mobileCatsOpen ? 'rotate(180deg)' : 'none' }}
                                    />
                                </button>
                            </div>

                            {mobileCatsOpen && (
                                <div className="flex flex-col" style={{ paddingBottom: 8 }}>
                                    {categories.length === 0 ? (
                                        <span style={{ fontFamily: SANS, fontSize: 13, color: DIM, padding: '8px 12px' }}>
                                            Cargando categorías…
                                        </span>
                                    ) : categories.map(c => (
                                        <Link
                                            key={c.name}
                                            to={categoryHref(c.name)}
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-baseline justify-between gap-3"
                                            style={{
                                                fontFamily: SANS, fontSize: 13.5, color: MUTED, textDecoration: 'none',
                                                padding: '10px 12px', borderRadius: 8, backgroundColor: PANEL, marginBottom: 4,
                                            }}
                                        >
                                            <span className="truncate">{c.name}</span>
                                            <span style={{ fontFamily: MONO, fontSize: 10.5, color: DIM, flexShrink: 0 }}>{c.count}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {NAV_LINKS.map(l => (
                            <Link
                                key={l.to}
                                to={l.to}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2"
                                style={{
                                    fontFamily: SANS, fontSize: 14.5, fontWeight: 500,
                                    color: isActive(l.to) ? TEXT : MUTED,
                                    textDecoration: 'none', padding: '13px 2px',
                                    borderBottom: `1px solid ${BORDER_SOFT}`,
                                }}
                            >
                                {l.label}
                                {l.highlight && !seenGenerator && <NewBadge />}
                            </Link>
                        ))}
                        {!user ? (
                            <Link
                                to={loginHref}
                                onClick={() => setMenuOpen(false)}
                                className="block text-center"
                                style={{
                                    marginTop: 16, width: '100%',
                                    fontFamily: SANS, fontSize: 14, fontWeight: 700, textDecoration: 'none',
                                    backgroundColor: TEXT, color: '#000',
                                    borderRadius: 10, padding: '13px 18px',
                                }}
                            >
                                Acceder
                            </Link>
                        ) : (
                            <>
                                <div
                                    className="flex items-center gap-2.5"
                                    style={{ marginTop: 14, marginBottom: 4, padding: '4px 2px' }}
                                >
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt=""
                                            referrerPolicy="no-referrer"
                                            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span
                                            className="inline-flex items-center justify-center"
                                            style={{
                                                width: 28, height: 28, borderRadius: '50%',
                                                backgroundColor: PANEL, border: `1px solid ${BORDER}`,
                                                fontFamily: SANS, fontSize: 12, fontWeight: 700, color: TEXT,
                                            }}
                                        >
                                            {initial}
                                        </span>
                                    )}
                                    <span className="truncate" style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: TEXT }}>
                                        {displayName}
                                    </span>
                                </div>

                                {[
                                    { to: accountHome, icon: <UserIcon size={15} />, label: admin ? 'Panel de admin' : 'Mi cuenta' },
                                    { to: '/guardados', icon: <Bookmark size={15} />, label: 'Mis guardados' },
                                ].map(item => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2.5"
                                        style={{
                                            fontFamily: SANS, fontSize: 14, color: MUTED, textDecoration: 'none',
                                            padding: '12px 12px', borderRadius: 9, backgroundColor: PANEL, marginBottom: 6,
                                        }}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                ))}

                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center justify-center gap-2"
                                    style={{
                                        marginTop: 4, width: '100%',
                                        fontFamily: SANS, fontSize: 13.5, fontWeight: 600,
                                        backgroundColor: 'transparent', color: MUTED,
                                        border: `1px solid ${BORDER}`, cursor: 'pointer',
                                        borderRadius: 10, padding: '12px 18px',
                                    }}
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

/* ── Footer oscuro ───────────────────────────────────────────────
   Además de lo legal, expone todas las categorías. Es la segunda vía
   de entrada al catálogo (la primera es el desplegable del header) y
   la que deja esos enlaces al alcance de un buscador. */

const FooterLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <Link
        to={to}
        style={{ fontFamily: SANS, fontSize: 12.5, color: DIM, textDecoration: 'none', transition: 'color .15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DIM; }}
    >
        {children}
    </Link>
);

const FooterHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p style={{
        fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: MUTED, marginBottom: 14,
    }}>
        {children}
    </p>
);

export const DarkFooter: React.FC = () => {
    // Una sola petición por sesión, compartida con el catálogo: al cargarla
    // aquí, /prompts ya la encuentra en caché y renderiza al instante.
    const categories = useCatalogCategories(true);

    return (
        <footer style={{ borderTop: `1px solid ${BORDER_SOFT}`, backgroundColor: BG }}>
            <div className="mx-auto max-w-6xl px-5 sm:px-8" style={{ paddingTop: 48, paddingBottom: 32 }}>

                <div className="grid gap-10 md:gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>

                    {/* Marca */}
                    <div style={{ minWidth: 180 }}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
                                alpacka.ai
                            </span>
                        </Link>
                        <p style={{ fontFamily: SANS, fontSize: 12.5, color: DIM, lineHeight: 1.7, marginTop: 12, maxWidth: 240 }}>
                            Prompts profesionales en español para ChatGPT, Claude y Gemini.
                        </p>
                    </div>

                    {/* Producto */}
                    <div className="flex flex-col">
                        <FooterHeading>Producto</FooterHeading>
                        <div className="flex flex-col gap-2.5">
                            <FooterLink to="/prompts">Catálogo de prompts</FooterLink>
                            <FooterLink to="/generador">Generador con IA</FooterLink>
                            <FooterLink to="/skills">Skills</FooterLink>
                            <FooterLink to="/pricing">Precios</FooterLink>
                            <FooterLink to="/blog">Blog</FooterLink>
                        </div>
                    </div>

                    {/* Cuenta */}
                    <div className="flex flex-col">
                        <FooterHeading>Cuenta</FooterHeading>
                        <div className="flex flex-col gap-2.5">
                            <FooterLink to="/login">Iniciar sesión</FooterLink>
                            <FooterLink to="/dashboard">Mi cuenta</FooterLink>
                            <FooterLink to="/guardados">Mis guardados</FooterLink>
                            <FooterLink to="/terms">Términos</FooterLink>
                            <FooterLink to="/privacy">Privacidad</FooterLink>
                        </div>
                    </div>

                    {/* Categorías */}
                    {/* Ocupa dos columnas solo a partir de md: en móvil la rejilla
                        tiene una sola columna y un span 2 crearía una implícita,
                        desbordando la página a lo ancho. */}
                    <div className="flex flex-col md:col-span-2" style={{ minWidth: 240 }}>
                        <FooterHeading>Categorías</FooterHeading>
                        {categories.length === 0 ? (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="animate-pulse" style={{ height: 12, borderRadius: 4, backgroundColor: PANEL }} />
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                    {categories.slice(0, 14).map(c => (
                                        <FooterLink key={c.name} to={categoryHref(c.name)}>{c.name}</FooterLink>
                                    ))}
                                </div>
                                {categories.length > 14 && (
                                    <div style={{ marginTop: 14 }}>
                                        <FooterLink to="/prompts">Ver las {categories.length} categorías →</FooterLink>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Barra inferior */}
                <div
                    className="flex flex-wrap items-center justify-between gap-3"
                    style={{ borderTop: `1px solid ${BORDER_SOFT}`, marginTop: 40, paddingTop: 22 }}
                >
                    <span style={{ fontFamily: SANS, fontSize: 11.5, color: DIM }}>
                        © {new Date().getFullYear()} alpacka.ai
                    </span>
                    <span style={{ fontFamily: SANS, fontSize: 11.5, color: DIM }}>
                        Pagos procesados por Paddle
                    </span>
                </div>
            </div>
        </footer>
    );
};
