import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCachedBlogPost, fetchBlogPost } from '../lib/blogList';
import { BlogPost as BlogPostType } from '../types';
import BlogContent, { blogHtmlToText } from '../components/BlogContent';
import { ArrowLeft, Clock } from 'lucide-react';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, AMBER, MONO,
} from '../components/darkKit';

/* Artículo del blog — mismo lenguaje visual oscuro estilo skills.sh que el
   resto de la app. El HTML del artículo usa la variante .dk-scope del prose. */

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

const readingTime = (content: string) =>
    Math.max(1, Math.round(blogHtmlToText(content).split(/\s+/).length / 200));

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    // Si el artículo está en caché se pinta en el primer render, sin skeleton
    const [post, setPost] = useState<BlogPostType | null>(() => (slug ? getCachedBlogPost(slug) : null));
    const [status, setStatus] = useState<'loading' | 'ready' | 'notfound'>(() =>
        slug && getCachedBlogPost(slug) ? 'ready' : 'loading'
    );

    useEffect(() => {
        if (!slug) return;
        const cached = getCachedBlogPost(slug);
        if (cached) {
            setPost(cached);
            setStatus('ready');
        } else {
            setStatus('loading');
        }
        // Revalida en segundo plano (recoge ediciones del admin)
        let cancelled = false;
        fetchBlogPost(slug).then(fresh => {
            if (cancelled) return;
            if (fresh) {
                setPost(fresh);
                setStatus('ready');
            } else if (!cached) {
                setStatus('notfound');
            }
        });
        return () => { cancelled = true; };
    }, [slug]);

    useEffect(() => {
        if (post) document.title = `${post.title} | Blog de Alpacka`;
        return () => { document.title = 'Banco de Prompts de IA · +1.000 prompts para ChatGPT, Claude y Gemini | Alpacka'; };
    }, [post]);

    if (status === 'loading') {
        return (
            <div style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: MONO }}>
                <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-16 space-y-5">
                    <div className="animate-pulse" style={{ height: 14, width: 130, borderRadius: 7, backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}` }} />
                    <div className="animate-pulse" style={{ height: 46, width: '100%', borderRadius: 10, backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}` }} />
                    <div className="animate-pulse" style={{ aspectRatio: '16 / 9', width: '100%', borderRadius: 12, backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}` }} />
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="animate-pulse" style={{ height: 14, width: i === 4 ? '60%' : '100%', borderRadius: 7, backgroundColor: CARD }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'notfound' || !post) {
        return (
            <div
                className="flex flex-col items-center justify-center gap-5 px-5 py-24 text-center"
                style={{ backgroundColor: BG, color: TEXT, minHeight: '70vh', fontFamily: MONO }}
            >
                <h1 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>Artículo no encontrado</h1>
                <p style={{ fontFamily: MONO, color: MUTED, fontSize: 13.5, maxWidth: 380, lineHeight: 1.7 }}>
                    Este artículo no existe o ya no está disponible.
                </p>
                <Link
                    to="/blog"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        fontFamily: MONO, backgroundColor: TEXT, color: '#000', fontWeight: 700, fontSize: 13.5,
                        padding: '12px 22px', borderRadius: 10, textDecoration: 'none',
                    }}
                >
                    <ArrowLeft size={15} /> Volver al blog
                </Link>
            </div>
        );
    }

    return (
        <div className="dk-scope" style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: MONO }}>

            <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 pt-10 pb-20">

                {/* Volver */}
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 mb-9"
                    style={{ fontFamily: MONO, fontSize: 13, color: MUTED, textDecoration: 'none' }}
                >
                    <ArrowLeft size={14} /> Volver al blog
                </Link>

                {/* Cabecera del artículo */}
                <header className="mb-9">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                        <span
                            style={{
                                fontFamily: MONO, backgroundColor: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6,
                                padding: '3px 9px', fontSize: 10, fontWeight: 600,
                                letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED,
                            }}
                        >
                            {post.category ? titleCase(post.category) : 'General'}
                        </span>
                        <time dateTime={post.created_at} style={{ fontFamily: MONO, fontSize: 12.5, color: DIM }}>
                            {formatDate(post.created_at)}
                        </time>
                        <span className="inline-flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: 12.5, color: DIM }}>
                            <Clock size={12} />
                            {readingTime(post.content)} min de lectura
                        </span>
                        {!post.published && (
                            <span
                                style={{
                                    fontFamily: MONO, backgroundColor: 'rgba(255,178,36,0.08)', border: '1px solid rgba(255,178,36,0.28)',
                                    borderRadius: 6, padding: '3px 9px', fontSize: 10, fontWeight: 700,
                                    letterSpacing: '0.1em', textTransform: 'uppercase', color: AMBER,
                                }}
                            >
                                Borrador
                            </span>
                        )}
                    </div>

                    <h1
                        style={{
                            fontFamily: MONO,
                            fontWeight: 700,
                            fontSize: 'clamp(1.7rem, 3.6vw, 2.4rem)',
                            lineHeight: 1.2,
                            letterSpacing: '-0.02em',
                            color: TEXT,
                        }}
                    >
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p style={{ marginTop: 18, fontFamily: MONO, color: MUTED, fontSize: 15.5, lineHeight: 1.7 }}>
                            {post.excerpt}
                        </p>
                    )}
                </header>

                {/* Portada */}
                {post.cover_image_url && (
                    <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full object-cover"
                        style={{ aspectRatio: '16 / 9', borderRadius: 12, border: `1px solid ${BORDER_SOFT}`, marginBottom: 40 }}
                    />
                )}

                {/* Contenido */}
                <article>
                    <BlogContent content={post.content} />
                </article>

                {/* Divisor */}
                <div style={{ height: 1, backgroundColor: BORDER_SOFT, margin: '56px 0' }} />

                {/* CTA */}
                <div
                    className="text-center"
                    style={{ backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 14, padding: '32px 26px' }}
                >
                    <h2 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 'clamp(1.2rem, 2.4vw, 1.6rem)', letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 12, color: TEXT }}>
                        ¿Quieres resultados así con tu IA?
                    </h2>
                    <p style={{ fontFamily: MONO, color: MUTED, fontSize: 13.5, lineHeight: 1.7, maxWidth: 460, margin: '0 auto 24px' }}>
                        Explora el directorio con más de 1.000 prompts probados para ChatGPT, Claude y Gemini,
                        organizados por categoría.
                    </p>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                            fontFamily: MONO, backgroundColor: TEXT, color: '#000', fontWeight: 700, fontSize: 14,
                            padding: '14px 26px', borderRadius: 10, textDecoration: 'none',
                        }}
                    >
                        Explorar el directorio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
