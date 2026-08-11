import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

export const MONO = '"Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';

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

/* ── Header oscuro (estático: se desplaza con la página) ────── */
const NAV_LINKS = [
    { to: '/skills', label: 'Skills' },
    { to: '/generador', label: 'Generador' },
    { to: '/blog', label: 'Blog' },
    { to: '/pricing', label: 'Precios' },
];

export const DarkHeader: React.FC = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [user, setUser] = useState<any>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    }, []);

    // Al navegar se cierra solo: si no, el panel sigue abierto sobre la página nueva
    useEffect(() => { setMenuOpen(false); }, [pathname]);

    // Escape cierra el menú (y evita dejarlo abierto sin salida en teclado)
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    // Bloquea el scroll del fondo: sin esto la página se desliza por detrás
    // del panel al arrastrar sobre él.
    useEffect(() => {
        if (!menuOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, [menuOpen]);

    const authLabel = user ? 'Dashboard' : 'Acceder';
    const goAuth = () => { setMenuOpen(false); navigate(user ? '/dashboard' : '/login'); };

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

                {/* Navegación de escritorio */}
                <nav className="hidden sm:flex items-center gap-5">
                    {NAV_LINKS.map(l => (
                        <Link
                            key={l.to}
                            to={l.to}
                            style={{ fontFamily: MONO, fontSize: 13, color: MUTED, textDecoration: 'none', transition: 'color .15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = MUTED; }}
                        >
                            {l.label}
                        </Link>
                    ))}
                    <button
                        onClick={goAuth}
                        style={{
                            fontFamily: MONO, fontSize: 12.5, fontWeight: 600,
                            backgroundColor: TEXT, color: '#000', border: 'none', cursor: 'pointer',
                            borderRadius: 8, padding: '7px 14px', marginLeft: 3,
                        }}
                    >
                        {authLabel}
                    </button>
                </nav>

                {/* Hamburguesa (solo móvil) */}
                <button
                    type="button"
                    className="sm:hidden inline-flex items-center justify-center"
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

            {/* Panel móvil + capa para cerrar tocando fuera */}
            {menuOpen && (
                <>
                    <div
                        className="sm:hidden"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden="true"
                        style={{
                            position: 'fixed', top: HEADER_H, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 55,
                        }}
                    />
                    <nav
                        id="alp-mobile-nav"
                        className="sm:hidden"
                        style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60,
                            // Un punto más claro que el fondo: sobre negro atenuado, un
                            // panel negro puro no se distingue de la página de detrás.
                            backgroundColor: CARD,
                            borderBottom: `1px solid ${BORDER}`,
                            padding: '10px 20px 18px',
                            display: 'flex', flexDirection: 'column',
                            boxShadow: '0 18px 40px rgba(0,0,0,0.6)',
                        }}
                    >
                        {NAV_LINKS.map(l => (
                            <Link
                                key={l.to}
                                to={l.to}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    fontFamily: MONO, fontSize: 14.5, fontWeight: 500,
                                    color: pathname === l.to ? TEXT : MUTED,
                                    textDecoration: 'none', padding: '13px 2px',
                                    borderBottom: `1px solid ${BORDER_SOFT}`,
                                }}
                            >
                                {l.label}
                            </Link>
                        ))}
                        <button
                            onClick={goAuth}
                            style={{
                                marginTop: 16, width: '100%',
                                fontFamily: MONO, fontSize: 14, fontWeight: 700,
                                backgroundColor: TEXT, color: '#000', border: 'none', cursor: 'pointer',
                                borderRadius: 10, padding: '13px 18px',
                            }}
                        >
                            {authLabel}
                        </button>
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
export const FONT = MONO;

/* Euclid Circular era solo del tema claro: en el oscuro todo va en mono. */
export const useEuclidFont = () => { /* no-op: el tema oscuro usa Geist Mono */ };

/* Fuerza la tipografía mono dentro de `.bp-scope` (el preflight de Tailwind
   aplica su propia familia al body). */
export const LandingStyles: React.FC = () => (
    <style>{`
    .bp-scope, .bp-scope * { font-family: ${MONO}; }
    .bp-scope ::selection { background: ${TEXT}; color: #000; }
  `}</style>
);

/* ── Footer oscuro minimal ──────────────────────────────────── */
export const DarkFooter: React.FC = () => (
    <footer style={{ borderTop: `1px solid ${BORDER_SOFT}`, backgroundColor: BG }}>
        <div
            className="mx-auto max-w-6xl px-5 sm:px-8 flex flex-wrap items-center justify-between gap-3"
            style={{ paddingTop: 22, paddingBottom: 22 }}
        >
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: DIM }}>
                © {new Date().getFullYear()} alpacka.ai
            </span>
            <div className="flex items-center gap-5">
                {[
                    { to: '/terms', label: 'Términos' },
                    { to: '/privacy', label: 'Privacidad' },
                    { to: '/blog', label: 'Blog' },
                ].map(l => (
                    <Link
                        key={l.to}
                        to={l.to}
                        style={{ fontFamily: MONO, fontSize: 11.5, color: DIM, textDecoration: 'none' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = MUTED; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DIM; }}
                    >
                        {l.label}
                    </Link>
                ))}
            </div>
        </div>
    </footer>
);
