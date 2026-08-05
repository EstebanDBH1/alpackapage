import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCachedBlogPost, fetchBlogPost } from '../lib/blogList';
import { BlogPost as BlogPostType } from '../types';
import BlogContent, { blogHtmlToText } from '../components/BlogContent';
import { ArrowLeft, Clock } from 'lucide-react';
import {
    BG, BG_WARM, TEXT, TEXT_MED, TEXT_DIM, BORDER, YELLOW, FONT,
    useEuclidFont, LandingStyles,
} from '../components/landingKit';

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

    useEuclidFont();

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
            <div className="bp-scope" style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: FONT }}>
                <LandingStyles />
                <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-16 space-y-5">
                    <div className="animate-pulse" style={{ height: 14, width: 130, borderRadius: 7, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }} />
                    <div className="animate-pulse" style={{ height: 46, width: '100%', borderRadius: 12, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }} />
                    <div className="animate-pulse" style={{ aspectRatio: '16 / 9', width: '100%', borderRadius: 18, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }} />
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="animate-pulse" style={{ height: 14, width: i === 4 ? '60%' : '100%', borderRadius: 7, backgroundColor: BG_WARM }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'notfound' || !post) {
        return (
            <div
                className="bp-scope flex min-h-screen flex-col items-center justify-center gap-5 px-5 text-center"
                style={{ backgroundColor: BG, color: TEXT, fontFamily: FONT }}
            >
                <LandingStyles />
                <h1 style={{ fontWeight: 600, fontSize: 24, letterSpacing: '-0.03em' }}>Artículo no encontrado</h1>
                <p style={{ color: TEXT_MED, fontSize: 15, maxWidth: 380, lineHeight: 1.7 }}>
                    Este artículo no existe o ya no está disponible.
                </p>
                <Link
                    to="/blog"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        backgroundColor: YELLOW, color: '#1a1500', fontWeight: 600, fontSize: 14.5,
                        padding: '13px 24px', borderRadius: 12, textDecoration: 'none',
                    }}
                >
                    <ArrowLeft size={15} /> Volver al blog
                </Link>
            </div>
        );
    }

    return (
        <div className="bp-scope" style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: FONT }}>
            <LandingStyles />

            <div className="bp-up mx-auto w-full max-w-3xl px-5 sm:px-8 pt-10 pb-20">

                {/* Volver */}
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 mb-9"
                    style={{ fontSize: 13.5, color: TEXT_MED, textDecoration: 'none' }}
                >
                    <ArrowLeft size={14} /> Volver al blog
                </Link>

                {/* Cabecera del artículo */}
                <header className="mb-9">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                        <span
                            style={{
                                backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 7,
                                padding: '3px 9px', fontSize: 10, fontWeight: 600,
                                letterSpacing: '0.12em', textTransform: 'uppercase', color: TEXT_MED,
                            }}
                        >
                            {post.category ? titleCase(post.category) : 'General'}
                        </span>
                        <time dateTime={post.created_at} style={{ fontSize: 13, color: TEXT_DIM }}>
                            {formatDate(post.created_at)}
                        </time>
                        <span className="inline-flex items-center gap-1.5" style={{ fontSize: 13, color: TEXT_DIM }}>
                            <Clock size={12} />
                            {readingTime(post.content)} min de lectura
                        </span>
                        {!post.published && (
                            <span
                                style={{
                                    backgroundColor: '#fff7e8', border: '1px solid #fbe3b0', borderRadius: 7,
                                    padding: '3px 9px', fontSize: 10, fontWeight: 700,
                                    letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a86a00',
                                }}
                            >
                                Borrador
                            </span>
                        )}
                    </div>

                    <h1
                        style={{
                            fontWeight: 600,
                            fontSize: 'clamp(1.9rem, 4vw, 2.7rem)',
                            lineHeight: 1.12,
                            letterSpacing: '-0.035em',
                        }}
                    >
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p style={{ marginTop: 18, color: TEXT_MED, fontSize: 17.5, lineHeight: 1.7 }}>
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
                        style={{ aspectRatio: '16 / 9', borderRadius: 18, border: `1px solid ${BORDER}`, marginBottom: 40 }}
                    />
                )}

                {/* Contenido */}
                <article>
                    <BlogContent content={post.content} />
                </article>

                {/* Divisor */}
                <div style={{ height: 1, backgroundColor: BORDER, margin: '56px 0' }} />

                {/* CTA */}
                <div
                    className="text-center"
                    style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 22, padding: '34px 28px' }}
                >
                    <h2 style={{ fontWeight: 600, fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 12 }}>
                        ¿Quieres resultados así con tu IA?
                    </h2>
                    <p style={{ color: TEXT_MED, fontSize: 15.5, lineHeight: 1.7, maxWidth: 460, margin: '0 auto 26px' }}>
                        Explora el banco con más de 1.000 prompts probados para ChatGPT, Claude y Gemini,
                        organizados por categoría.
                    </p>
                    <Link
                        to="/prompts"
                        style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                            backgroundColor: YELLOW, color: '#1a1500', fontWeight: 600, fontSize: 15.5,
                            padding: '15px 28px', borderRadius: 12, textDecoration: 'none',
                        }}
                    >
                        Explorar el banco
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
