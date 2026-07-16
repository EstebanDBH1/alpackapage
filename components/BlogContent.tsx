import React from 'react';

// Renderizador ligero de markdown, sin dependencias ni HTML crudo: todo se
// construye como nodos React, así el contenido de la BD no puede inyectar XSS.
// Cubre lo que produce el editor del admin: encabezados (##, ###), **negrita**,
// *cursiva*, `código`, [enlaces](url), ![imágenes](url), listas, citas y párrafos.

const INLINE_PATTERN = /(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(`[^`\n]+`)|(\[[^\]\n]+\]\([^)\s]+\))/g;

const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    let last = 0;
    let i = 0;
    for (const m of text.matchAll(INLINE_PATTERN)) {
        const idx = m.index ?? 0;
        if (idx > last) nodes.push(text.slice(last, idx));
        const tok = m[0];
        const key = `${keyPrefix}-${i++}`;
        if (tok.startsWith('**')) {
            nodes.push(<strong key={key} className="font-semibold text-foreground">{tok.slice(2, -2)}</strong>);
        } else if (tok.startsWith('`')) {
            nodes.push(<code key={key} className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.85em] text-foreground/90">{tok.slice(1, -1)}</code>);
        } else if (tok.startsWith('*')) {
            nodes.push(<em key={key}>{tok.slice(1, -1)}</em>);
        } else {
            const link = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (link) {
                nodes.push(
                    <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 transition hover:opacity-80">
                        {link[1]}
                    </a>,
                );
            } else {
                nodes.push(tok);
            }
        }
        last = idx + tok.length;
    }
    if (last < text.length) nodes.push(text.slice(last));
    return nodes;
};

type Block =
    | { type: 'h2' | 'h3' | 'p' | 'quote'; text: string }
    | { type: 'ul' | 'ol'; items: string[] }
    | { type: 'img'; alt: string; src: string };

const parseBlocks = (content: string): Block[] => {
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const blocks: Block[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) { i++; continue; }

        const img = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (img) { blocks.push({ type: 'img', alt: img[1], src: img[2] }); i++; continue; }

        if (trimmed.startsWith('### ')) { blocks.push({ type: 'h3', text: trimmed.slice(4) }); i++; continue; }
        if (trimmed.startsWith('## ')) { blocks.push({ type: 'h2', text: trimmed.slice(3) }); i++; continue; }
        // Un `#` suelto también se trata como h2: el h1 de la página es el título del post.
        if (trimmed.startsWith('# ')) { blocks.push({ type: 'h2', text: trimmed.slice(2) }); i++; continue; }

        if (/^[-*] /.test(trimmed)) {
            const items: string[] = [];
            while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
                items.push(lines[i].trim().slice(2));
                i++;
            }
            blocks.push({ type: 'ul', items });
            continue;
        }

        if (/^\d+\. /.test(trimmed)) {
            const items: string[] = [];
            while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^\d+\. /, ''));
                i++;
            }
            blocks.push({ type: 'ol', items });
            continue;
        }

        if (trimmed.startsWith('> ')) {
            const quoteLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith('> ')) {
                quoteLines.push(lines[i].trim().slice(2));
                i++;
            }
            blocks.push({ type: 'quote', text: quoteLines.join(' ') });
            continue;
        }

        // Párrafo: agrupa líneas consecutivas no vacías que no sean otro bloque
        const paraLines: string[] = [];
        while (i < lines.length) {
            const t = lines[i].trim();
            if (!t || t.startsWith('#') || t.startsWith('> ') || /^[-*] /.test(t) || /^\d+\. /.test(t) || /^!\[/.test(t)) break;
            paraLines.push(t);
            i++;
        }
        blocks.push({ type: 'p', text: paraLines.join(' ') });
    }

    return blocks;
};

const BlogContent: React.FC<{ content: string }> = ({ content }) => {
    const blocks = parseBlocks(content);

    return (
        <div className="text-base leading-[1.85] text-foreground/85">
            {blocks.map((block, i) => {
                const key = `b-${i}`;
                switch (block.type) {
                    case 'h2':
                        return <h2 key={key} className="mb-4 mt-10 text-xl font-medium tracking-tight text-foreground sm:text-2xl">{renderInline(block.text, key)}</h2>;
                    case 'h3':
                        return <h3 key={key} className="mb-3 mt-8 text-lg font-medium tracking-tight text-foreground">{renderInline(block.text, key)}</h3>;
                    case 'img':
                        return (
                            <figure key={key} className="my-8">
                                <img src={block.src} alt={block.alt} loading="lazy" className="w-full rounded-2xl border border-border/60" />
                                {block.alt && <figcaption className="mt-3 text-center text-xs text-muted-foreground">{block.alt}</figcaption>}
                            </figure>
                        );
                    case 'ul':
                        return (
                            <ul key={key} className="mb-6 ml-1 space-y-2">
                                {block.items.map((item, j) => (
                                    <li key={`${key}-${j}`} className="flex gap-3">
                                        <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                        <span>{renderInline(item, `${key}-${j}`)}</span>
                                    </li>
                                ))}
                            </ul>
                        );
                    case 'ol':
                        return (
                            <ol key={key} className="mb-6 ml-1 space-y-2">
                                {block.items.map((item, j) => (
                                    <li key={`${key}-${j}`} className="flex gap-3">
                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-accent">{j + 1}</span>
                                        <span>{renderInline(item, `${key}-${j}`)}</span>
                                    </li>
                                ))}
                            </ol>
                        );
                    case 'quote':
                        return (
                            <blockquote key={key} className="my-8 border-l-2 border-accent/60 pl-5 text-lg italic leading-relaxed text-foreground/75">
                                {renderInline(block.text, key)}
                            </blockquote>
                        );
                    default:
                        return <p key={key} className="mb-6">{renderInline(block.text, key)}</p>;
                }
            })}
        </div>
    );
};

export default BlogContent;
