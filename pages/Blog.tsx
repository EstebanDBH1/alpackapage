import React, { useState, useMemo, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';
import { Search } from 'lucide-react';

type BlogPostPreview = Omit<BlogPost, 'content'>;

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

// ── Reveal de texto por palabras (mismo patrón que Prompts) ──────────────────
const AnimatedText: React.FC<{ text: string; className?: string; delay?: number; stagger?: number }> = ({
    text, className = '', delay = 0, stagger = 0.05,
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const words = text.split(' ');

    useGSAP(() => {
        const targets = ref.current!.querySelectorAll('.word-inner');
        if (prefersReducedMotion()) {
            gsap.set(targets, { yPercent: 0, opacity: 1 });
            return;
        }
        gsap.fromTo(
            targets,
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.9, ease: 'power4.out', stagger, delay },
        );
    }, { scope: ref, dependencies: [text] });

    return (
        <span ref={ref} className={className} aria-label={text}>
            {words.map((word, i) => (
                <React.Fragment key={`${word}-${i}`}>
                    <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]" aria-hidden="true">
                        <span className="word-inner inline-block will-change-transform">{word}</span>
                    </span>
                    {i < words.length - 1 ? ' ' : ''}
                </React.Fragment>
            ))}
        </span>
    );
};

// ── Aparición suave ───────────────────────────────────────────────────────────
const FadeIn: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
    children, className = '', delay = 0,
}) => {
    const ref = useRef<HTMLParagraphElement>(null);

    useGSAP(() => {
        if (prefersReducedMotion()) {
            gsap.set(ref.current, { y: 0, opacity: 1 });
            return;
        }
        gsap.fromTo(
            ref.current,
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay },
        );
    }, { scope: ref });

    return <p ref={ref} className={className}>{children}</p>;
};

const Blog: React.FC = () => {
    const [posts, setPosts] = useState<BlogPostPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('todas');
    const [searchQuery, setSearchQuery] = useState('');
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.title = 'Blog · Guías y estrategias de IA | Alpacka';
    }, []);

    useEffect(() => {
        supabase
            .from('blog_posts')
            .select('id, title, slug, excerpt, cover_image_url, category, published, created_at, updated_at')
            .eq('published', true)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (!error && data) setPosts(data as BlogPostPreview[]);
                setLoading(false);
            });
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

    // ── Animación del grid ──────────────────────────────────────────────────────
    const cardsKey = useMemo(() => filteredPosts.map(p => p.id).join(','), [filteredPosts]);

    useGSAP(() => {
        if (loading) return;
        const cards = gridRef.current?.querySelectorAll('.blog-card');
        if (!cards || cards.length === 0) return;
        if (prefersReducedMotion()) {
            gsap.set(cards, { opacity: 1, y: 0 });
            return;
        }
        gsap.fromTo(
            cards,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06 },
        );
    }, { scope: gridRef, dependencies: [loading, cardsKey] });

    return (
        <div className="relative min-h-screen overflow-x-clip bg-background bg-radial-glow font-space text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

            <div className="relative">
                {/* ── Hero ──────────────────────────────────────────────────────── */}
                <div className="px-4 pt-14 pb-10 text-center sm:px-8">
                    <div className="mx-auto max-w-3xl">

                        {/* Badge */}
                        <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]"></span>
                            <span>Blog</span>
                        </div>

                        <h1 className="mt-6 mb-5 text-balance text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.6rem]">
                            <AnimatedText text="Guías y estrategias para sacarle todo a la IA." />
                        </h1>
                        <FadeIn
                            delay={0.25}
                            className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground"
                        >
                            Artículos prácticos sobre prompts, herramientas y flujos de trabajo con
                            ChatGPT, Claude y Gemini. Sin humo: solo lo que funciona.
                        </FadeIn>
                    </div>
                </div>

                {/* ── Barra de filtros (sticky) ──────────────────────────────────── */}
                <div className="sticky top-[70px] z-40 border-b border-border/60 bg-background/80 backdrop-blur">
                    <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-4 sm:px-6">

                        {/* Búsqueda */}
                        <div className="relative w-full max-w-xl">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar un artículo..."
                                className="w-full rounded-full border border-border/60 bg-card/60 py-2.5 pl-11 pr-5 text-sm text-foreground placeholder-muted-foreground/60 backdrop-blur transition focus:border-primary/40 focus:outline-none"
                            />
                        </div>

                        {/* Categorías */}
                        {categories.length > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-5">
                                {categories.map(cat => {
                                    const active = selectedCategory === cat;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`border-b pb-1 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                                                active
                                                    ? 'border-accent text-accent'
                                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <main className="flex flex-col items-center px-4 pt-12 pb-24 sm:px-8">

                    {/* ── Grid de posts ──────────────────────────────────── */}
                    <div
                        ref={gridRef}
                        className="grid w-full max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {loading && Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-80 animate-pulse rounded-2xl border border-border/70 bg-card" />
                        ))}

                        {!loading && filteredPosts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>

                    {/* Estado vacío */}
                    {!loading && filteredPosts.length === 0 && (
                        <div className="w-full max-w-3xl py-16 text-center">
                            <p className="mb-6 text-sm text-muted-foreground">
                                {posts.length === 0
                                    ? 'Todavía no hay artículos publicados. Vuelve pronto.'
                                    : 'Ningún artículo coincide con tu búsqueda.'}
                            </p>
                            {posts.length > 0 && (
                                <button
                                    onClick={() => { setSelectedCategory('todas'); setSearchQuery(''); }}
                                    className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 hover:bg-secondary"
                                >
                                    Ver todos los artículos
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// ── Card de post ─────────────────────────────────────────────────────────────
const PostCard: React.FC<{ post: BlogPostPreview }> = ({ post }) => (
    <Link
        to={`/blog/${post.slug}`}
        className="blog-card group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:border-primary/40"
    >
        {/* Portada */}
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
            {post.cover_image_url ? (
                <img
                    src={post.cover_image_url}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-radial-glow">
                    <span className="text-4xl font-medium text-foreground/20">A</span>
                </div>
            )}
        </div>

        <div className="flex flex-grow flex-col p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
                <span className="inline-block rounded-md border border-border/50 bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {post.category ? titleCase(post.category) : 'General'}
                </span>
                <time dateTime={post.created_at} className="text-[11px] text-muted-foreground">
                    {formatDate(post.created_at)}
                </time>
            </div>

            <h3 className="mb-2 text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                {post.title}
            </h3>
            {post.excerpt && (
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{post.excerpt}</p>
            )}

            <span className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-foreground">
                Leer artículo →
            </span>
        </div>
    </Link>
);

export default Blog;
