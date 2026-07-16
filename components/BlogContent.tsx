import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

// El contenido del blog se guarda como HTML (lo produce el editor visual del
// admin). Antes de renderizar se pasa por DOMPurify con una lista blanca
// estricta: solo formato de texto, nada de scripts, estilos ni iframes.
const SANITIZE_CONFIG = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
};

// Los enlaces del contenido siempre abren en pestaña nueva y sin acceso al opener
DOMPurify.addHook('afterSanitizeAttributes', node => {
    if (node.tagName === 'A') {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
    }
    if (node.tagName === 'IMG') {
        node.setAttribute('loading', 'lazy');
    }
});

export const sanitizeBlogHtml = (html: string): string =>
    DOMPurify.sanitize(html, SANITIZE_CONFIG) as string;

// Texto plano del HTML (para tiempo de lectura, validaciones, etc.)
export const blogHtmlToText = (html: string): string =>
    sanitizeBlogHtml(html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();

const BlogContent: React.FC<{ content: string }> = ({ content }) => {
    const clean = useMemo(() => sanitizeBlogHtml(content), [content]);
    return <div className="blog-prose" dangerouslySetInnerHTML={{ __html: clean }} />;
};

export default BlogContent;
