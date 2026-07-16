import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BlogPost as BlogPostType } from '../types';
import BlogContent from '../components/BlogContent';
import { ArrowLeft, Clock } from 'lucide-react';

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

const readingTime = (content: string) =>
    Math.max(1, Math.round(content.split(/\s+/).length / 200));

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPostType | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'notfound'>('loading');
    const articleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!slug) return;
        setStatus('loading');
        supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error || !data) {
                    setStatus('notfound');
                    return;
                }
                setPost(data as BlogPostType);
                setStatus('ready');
            });
    }, [slug]);

    useEffect(() => {
        if (post) document.title = `${post.title} | Blog de Alpacka`;
        return () => { document.title = 'Banco de Prompts de IA · +1.000 prompts para ChatGPT, Claude y Gemini | Alpacka'; };
    }, [post]);

    useGSAP(() => {
        if (status !== 'ready' || !articleRef.current) return;
        if (prefersReducedMotion()) return;
        gsap.fromTo(
            articleRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        );
    }, { dependencies: [status] });

    if (status === 'loading') {
        return (
            <div className="mx-auto w-full max-w-3xl px-6 py-16">
                <div className="mb-6 h-4 w-32 animate-pulse rounded bg-card" />
                <div className="mb-8 h-12 w-full animate-pulse rounded bg-card" />
                <div className="mb-10 aspect-[16/9] w-full animate-pulse rounded-2xl bg-card" />
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-4 w-full animate-pulse rounded bg-card" />
                    ))}
                </div>
            </div>
        );
    }

    if (status === 'notfound' || !post) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
                <p className="text-sm text-muted-foreground">Este artículo no existe o ya no está disponible.</p>
                <Link
                    to="/blog"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                    <ArrowLeft size={15} />
                    Volver al blog
                </Link>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-x-clip bg-background bg-radial-glow font-space text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

            <div ref={articleRef} className="relative mx-auto w-full max-w-3xl px-6 pt-12 pb-24">

                {/* Volver */}
                <Link
                    to="/blog"
                    className="mb-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft size={13} />
                    Volver al blog
                </Link>

                {/* Cabecera del artículo */}
                <header className="mb-10">
                    <div className="mb-5 flex flex-wrap items-center gap-4">
                        <span className="inline-block rounded-md border border-border/50 bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {post.category ? titleCase(post.category) : 'General'}
                        </span>
                        <time dateTime={post.created_at} className="text-xs text-muted-foreground">
                            {formatDate(post.created_at)}
                        </time>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock size={12} />
                            {readingTime(post.content)} min de lectura
                        </span>
                        {!post.published && (
                            <span className="inline-block rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-accent">
                                Borrador
                            </span>
                        )}
                    </div>

                    <h1 className="text-balance text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
                    )}
                </header>

                {/* Portada */}
                {post.cover_image_url && (
                    <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="mb-12 aspect-[16/9] w-full rounded-2xl border border-border/60 object-cover"
                    />
                )}

                {/* Contenido */}
                <article>
                    <BlogContent content={post.content} />
                </article>

                {/* Divisor */}
                <div className="my-16 h-px w-full bg-border/60" />

                {/* CTA */}
                <div className="relative">
                    <div className="absolute -inset-10 -z-10 rounded-full bg-accent/5 blur-3xl"></div>
                    <div className="rounded-3xl border border-primary/30 bg-card px-8 py-10 text-center shadow-[0_0_80px_oklch(0.86_0.09_90_/_0.08)]">
                        <h2 className="mb-4 text-balance text-2xl font-medium leading-tight tracking-tight text-foreground">
                            ¿Quieres resultados así con tu IA?
                        </h2>
                        <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
                            Explora nuestra librería con más de 1.000 prompts probados para
                            ChatGPT, Claude y Gemini, organizados por categoría.
                        </p>
                        <Link
                            to="/prompts"
                            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90"
                        >
                            Explorar la librería
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
