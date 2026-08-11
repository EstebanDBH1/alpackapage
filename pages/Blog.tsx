import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCachedBlogList, fetchBlogList, type BlogPostPreview } from '../lib/blogList';
import { Search } from 'lucide-react';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, GREEN, MONO,
} from '../components/darkKit';

/* Blog — mismo lenguaje visual oscuro estilo skills.sh que el resto de la app. */

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

const Blog: React.FC = () => {
    // Arranca con la caché si existe: el grid se pinta en el primer render
    const [posts, setPosts] = useState<BlogPostPreview[]>(() => getCachedBlogList() ?? []);
    const [loading, setLoading] = useState(() => !getCachedBlogList());
    const [selectedCategory, setSelectedCategory] = useState('todas');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        document.title = 'Blog · Guías y estrategias de IA | Alpacka';
    }, []);

    // Stale-while-revalidate: si hubo caché ya se pintó; refrescamos en segundo plano
    useEffect(() => {
        let cancelled = false;
        fetchBlogList().then(fresh => {
            if (cancelled) return;
            if (fresh) setPosts(fresh);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, []);

    const categories = useMemo(() => {
        const cats = Array.from(new Set(posts.map(p => p.category?.toLowerCase()).filter(Boolean))) as string[];
        return ['todas', ...cats.sort()];
    }, [posts]);

    const filteredPosts = useMemo(() => posts.filter(post => {
        const matchesCategory = selectedCategory === 'todas' || post.category?.toLowerCase() === selectedCategory;
        const q = searchQuery.toLowerCase();
        const matchesSearch = post.title.toLowerCase().includes(q) || (post.excerpt || '').toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
    }), [posts, selectedCategory, searchQuery]);

    // El grid reaparece con un fade al cambiar el filtro (la key fuerza el remontaje)
    const cardsKey = useMemo(() => filteredPosts.map(p => p.id).join(','), [filteredPosts]);

    return (
        <div style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: MONO }}>

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className="px-5 sm:px-8 pt-12 pb-9 text-center">
                <div className="mx-auto" style={{ maxWidth: 720 }}>
                    <p
                        style={{
                            fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: '0.16em',
                            textTransform: 'uppercase', color: DIM, marginBottom: 14,
                        }}
                    >
                        Blog
                    </p>

                    <h1
                        className="animate-fade-up"
                        style={{
                            fontFamily: MONO,
                            fontWeight: 700,
                            fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)',
                            lineHeight: 1.18,
                            letterSpacing: '-0.02em',
                            marginBottom: 14,
                            color: TEXT,
                        }}
                    >
                        Guías y estrategias para sacarle todo a la IA.
                    </h1>

                    <p
                        className="animate-fade-up"
                        style={{ fontFamily: MONO, color: MUTED, fontSize: 14.5, lineHeight: 1.75, maxWidth: 620, margin: '0 auto', animationDelay: '0.15s' }}
                    >
                        Artículos prácticos sobre prompts, herramientas y flujos de trabajo con
                        ChatGPT, Claude y Gemini. Sin humo: solo lo que funciona.
                    </p>
                </div>
            </div>

            {/* ── Barra de filtros (sticky arriba al hacer scroll) ───────────── */}
            <div
                style={{
                    position: 'sticky', top: 0, zIndex: 40,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                    borderTop: `1px solid ${BORDER_SOFT}`,
                    borderBottom: `1px solid ${BORDER_SOFT}`,
                }}
            >
                <div className="mx-auto max-w-4xl px-5 sm:px-8 py-3.5 flex flex-col items-center gap-3.5">

                    {/* Búsqueda */}
                    <div className="relative w-full" style={{ maxWidth: 560 }}>
                        <Search
                            size={15}
                            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: DIM, pointerEvents: 'none' }}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar un artículo…"
                            style={{
                                width: '100%', backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
                                padding: '10px 18px 10px 42px', fontFamily: MONO, fontSize: 13.5, color: TEXT, outline: 'none',
                                transition: 'border-color .15s',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#3a3a3a'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
                        />
                    </div>

                    {/* Categorías */}
                    {categories.length > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {categories.map(cat => {
                                const active = selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        style={{
                                            fontFamily: MONO,
                                            backgroundColor: active ? TEXT : PANEL,
                                            border: `1px solid ${active ? TEXT : BORDER}`,
                                            color: active ? '#000' : MUTED,
                                            borderRadius: 100, padding: '5px 13px',
                                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                            textTransform: 'capitalize', whiteSpace: 'nowrap',
                                            transition: 'background .15s, color .15s',
                                        }}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-5 sm:px-8 pt-10 pb-20">

                {/* ── Grid de posts ──────────────────────────────────── */}
                <div
                    key={cardsKey}
                    className="animate-fade-in grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                    {loading && Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse"
                            style={{ height: 330, borderRadius: 12, backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}` }}
                        />
                    ))}

                    {!loading && filteredPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>

                {/* Estado vacío */}
                {!loading && filteredPosts.length === 0 && (
                    <div className="text-center" style={{ padding: '56px 0' }}>
                        <p style={{ fontFamily: MONO, color: MUTED, fontSize: 14, marginBottom: 20 }}>
                            {posts.length === 0
                                ? 'Todavía no hay artículos publicados. Vuelve pronto.'
                                : 'Ningún artículo coincide con tu búsqueda.'}
                        </p>
                        {posts.length > 0 && (
                            <button
                                onClick={() => { setSelectedCategory('todas'); setSearchQuery(''); }}
                                style={{
                                    fontFamily: MONO, backgroundColor: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8,
                                    padding: '9px 18px', fontSize: 13, fontWeight: 600, color: TEXT, cursor: 'pointer',
                                }}
                            >
                                Ver todos los artículos
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

// ── Card de post (oscura) ────────────────────────────────────────────────────
const PostCard: React.FC<{ post: BlogPostPreview }> = ({ post }) => (
    <Link
        to={`/blog/${post.slug}`}
        className="flex flex-col overflow-hidden"
        style={{
            backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 12,
            textDecoration: 'none', transition: 'border-color .15s, background-color .15s',
        }}
        onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = '#3a3a3a';
            el.style.backgroundColor = PANEL;
        }}
        onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = BORDER_SOFT;
            el.style.backgroundColor = CARD;
        }}
    >
        {/* Portada */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 9', backgroundColor: PANEL }}>
            {post.cover_image_url ? (
                <img
                    src={post.cover_image_url}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <span style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: DIM, opacity: 0.5 }}>A</span>
                </div>
            )}
        </div>

        <div className="flex flex-grow flex-col" style={{ padding: '18px 18px 16px' }}>
            <div className="mb-3 flex items-center justify-between gap-3">
                <span
                    style={{
                        fontFamily: MONO, backgroundColor: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6,
                        padding: '3px 8px', fontSize: 10, fontWeight: 600,
                        letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED,
                    }}
                >
                    {post.category ? titleCase(post.category) : 'General'}
                </span>
                <time dateTime={post.created_at} style={{ fontFamily: MONO, fontSize: 11.5, color: DIM }}>
                    {formatDate(post.created_at)}
                </time>
            </div>

            <h3 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14.5, lineHeight: 1.4, color: TEXT, marginBottom: 8, letterSpacing: '-0.01em' }}>
                {post.title}
            </h3>
            {post.excerpt && (
                <p className="line-clamp-3" style={{ fontFamily: MONO, color: MUTED, fontSize: 12.5, lineHeight: 1.65 }}>
                    {post.excerpt}
                </p>
            )}

            <span style={{ marginTop: 16, fontFamily: MONO, fontSize: 12.5, fontWeight: 600, color: GREEN }}>
                Leer artículo →
            </span>
        </div>
    </Link>
);

export default Blog;
