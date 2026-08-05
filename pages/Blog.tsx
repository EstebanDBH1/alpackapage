import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCachedBlogList, fetchBlogList, type BlogPostPreview } from '../lib/blogList';
import { Search } from 'lucide-react';
import {
    BG, BG_WARM, TEXT, TEXT_MED, TEXT_DIM, BORDER, ACCENT, FONT,
    useEuclidFont, LandingStyles,
} from '../components/landingKit';

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

const Blog: React.FC = () => {
    // Arranca con la caché si existe: el grid se pinta en el primer render
    const [posts, setPosts] = useState<BlogPostPreview[]>(() => getCachedBlogList() ?? []);
    const [loading, setLoading] = useState(() => !getCachedBlogList());
    const [selectedCategory, setSelectedCategory] = useState('todas');
    const [searchQuery, setSearchQuery] = useState('');

    useEuclidFont();

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
        <div className="bp-scope" style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: FONT }}>
            <LandingStyles />

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className="px-5 sm:px-8 pt-12 pb-9 text-center">
                <div className="mx-auto" style={{ maxWidth: 720 }}>
                    <div
                        className="inline-flex items-center gap-2 rounded-full"
                        style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, padding: '5px 13px', marginBottom: 18 }}
                    >
                        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: ACCENT }} />
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: TEXT_MED }}>
                            Blog
                        </span>
                    </div>

                    <h1
                        className="animate-fade-up"
                        style={{
                            fontWeight: 600,
                            fontSize: 'clamp(1.75rem, 3.6vw, 2.6rem)',
                            lineHeight: 1.12,
                            letterSpacing: '-0.03em',
                            marginBottom: 14,
                        }}
                    >
                        Guías y estrategias para sacarle todo a la IA.
                    </h1>

                    <p
                        className="animate-fade-up"
                        style={{ color: TEXT_MED, fontSize: 16, lineHeight: 1.75, maxWidth: 620, margin: '0 auto', animationDelay: '0.15s' }}
                    >
                        Artículos prácticos sobre prompts, herramientas y flujos de trabajo con
                        ChatGPT, Claude y Gemini. Sin humo: solo lo que funciona.
                    </p>
                </div>
            </div>

            {/* ── Barra de filtros (sticky bajo el navbar) ───────────────────── */}
            <div
                style={{
                    position: 'sticky', top: 60, zIndex: 40,
                    backgroundColor: 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                    borderTop: `1px solid ${BORDER}`,
                    borderBottom: `1px solid ${BORDER}`,
                }}
            >
                <div className="mx-auto max-w-4xl px-5 sm:px-8 py-3.5 flex flex-col items-center gap-3.5">

                    {/* Búsqueda */}
                    <div className="relative w-full" style={{ maxWidth: 560 }}>
                        <Search
                            size={15}
                            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: TEXT_DIM, pointerEvents: 'none' }}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar un artículo…"
                            style={{
                                width: '100%', backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 12,
                                padding: '11px 18px 11px 42px', fontSize: 14, color: TEXT, outline: 'none',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#c9c9c2'; }}
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
                                            backgroundColor: active ? '#fff7e8' : BG_WARM,
                                            border: `1px solid ${active ? '#fbe3b0' : BORDER}`,
                                            color: active ? '#a86a00' : TEXT_MED,
                                            borderRadius: 100, padding: '6px 13px',
                                            fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                                            textTransform: 'capitalize', whiteSpace: 'nowrap',
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
                            style={{ height: 330, borderRadius: 18, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }}
                        />
                    ))}

                    {!loading && filteredPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>

                {/* Estado vacío */}
                {!loading && filteredPosts.length === 0 && (
                    <div className="text-center" style={{ padding: '56px 0' }}>
                        <p style={{ color: TEXT_MED, fontSize: 15, marginBottom: 20 }}>
                            {posts.length === 0
                                ? 'Todavía no hay artículos publicados. Vuelve pronto.'
                                : 'Ningún artículo coincide con tu búsqueda.'}
                        </p>
                        {posts.length > 0 && (
                            <button
                                onClick={() => { setSelectedCategory('todas'); setSearchQuery(''); }}
                                style={{
                                    backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 12,
                                    padding: '11px 20px', fontSize: 14, fontWeight: 600, color: TEXT, cursor: 'pointer',
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

// ── Card de post ─────────────────────────────────────────────────────────────
const PostCard: React.FC<{ post: BlogPostPreview }> = ({ post }) => (
    <Link
        to={`/blog/${post.slug}`}
        className="flex flex-col overflow-hidden"
        style={{
            backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 18,
            textDecoration: 'none', transition: 'transform .15s, box-shadow .15s, border-color .15s',
        }}
        onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = 'translateY(-2px)';
            el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.06)';
            el.style.borderColor = '#d8d8d2';
        }}
        onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = 'translateY(0)';
            el.style.boxShadow = 'none';
            el.style.borderColor = BORDER;
        }}
    >
        {/* Portada */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 9', backgroundColor: BG_WARM }}>
            {post.cover_image_url ? (
                <img
                    src={post.cover_image_url}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <span style={{ fontSize: 34, fontWeight: 600, color: TEXT_DIM, opacity: 0.5 }}>A</span>
                </div>
            )}
        </div>

        <div className="flex flex-grow flex-col" style={{ padding: '20px 20px 18px' }}>
            <div className="mb-3 flex items-center justify-between gap-3">
                <span
                    style={{
                        backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 7,
                        padding: '3px 8px', fontSize: 10, fontWeight: 600,
                        letterSpacing: '0.12em', textTransform: 'uppercase', color: TEXT_MED,
                    }}
                >
                    {post.category ? titleCase(post.category) : 'General'}
                </span>
                <time dateTime={post.created_at} style={{ fontSize: 12, color: TEXT_DIM }}>
                    {formatDate(post.created_at)}
                </time>
            </div>

            <h3 style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.35, color: TEXT, marginBottom: 8, letterSpacing: '-0.01em' }}>
                {post.title}
            </h3>
            {post.excerpt && (
                <p className="line-clamp-3" style={{ color: TEXT_MED, fontSize: 14, lineHeight: 1.65 }}>
                    {post.excerpt}
                </p>
            )}

            <span style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: TEXT }}>
                Leer artículo →
            </span>
        </div>
    </Link>
);

export default Blog;
