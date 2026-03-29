import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Prompt } from '../types';
import { Copy, Check, Lock, ChevronLeft, AlertCircle, Bookmark, BookmarkCheck, ArrowRight, Download } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import jsPDF from 'jspdf';

function getCategoryEmoji(cat: string): string {
    const map: Record<string, string> = {
        marketing: '📣', copywriting: '✍️', ventas: '💰',
        productividad: '⚡', estrategia: '♟️', redes: '📱',
        email: '📧', negocio: '💼', contenido: '🎨',
        datos: '📊', 'ideas de negocio': '💡', finanzas: '📈',
    };
    return map[cat?.toLowerCase()] ?? '•';
}

const PromptDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPromptAndUser = async () => {
            setLoading(true);
            const { data: promptData, error } = await supabase
                .rpc('get_prompt_detail', { prompt_id: id })
                .single();

            const { data: { user } } = await supabase.auth.getUser();
            let subscribed = false;

            if (user) {
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('subscription_status')
                    .eq('customer_id', user.id)
                    .maybeSingle();
                subscribed = sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing');

                const { data: saved } = await supabase
                    .from('saved_prompts')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('prompt_id', id)
                    .maybeSingle();
                setIsSaved(!!saved);
            }

            if (!error) setPrompt(promptData as Prompt);
            setIsSubscribed(!!subscribed);
            setLoading(false);
        };
        fetchPromptAndUser();
    }, [id]);

    const handleCopy = () => {
        if (prompt?.content) {
            navigator.clipboard.writeText(prompt.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadPdf = () => {
        if (!prompt?.content) return;

        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const ML = 18, MR = 18;
        const textW = pageW - ML - MR;
        const HEADER = 30, FOOTER = 12;
        const BOTTOM = pageH - FOOTER;

        const drawHeader = () => {
            doc.setFillColor(26, 20, 16);
            doc.rect(0, 0, pageW, HEADER, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.text('alpacka.ai', ML, 12);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(139, 126, 116);
            doc.text('biblioteca de prompts', ML, 21);
            if (prompt?.category) {
                doc.setFontSize(7);
                doc.text(prompt.category.toUpperCase(), pageW - MR, 14, { align: 'right' });
            }
        };

        const drawFooter = (pageNum: number, totalPages: number) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(139, 126, 116);
            const date = new Date().toLocaleDateString('es-ES');
            doc.text(`alpacka.ai  ·  generado el ${date}`, ML, pageH - 5);
            doc.text(
                `pág. ${pageNum} / ${totalPages}   ·   © ${new Date().getFullYear()} alpacka.ai`,
                pageW - MR, pageH - 5, { align: 'right' }
            );
        };

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(19);
        const titleLines: string[] = doc.splitTextToSize(prompt.title || '', textW);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const descLines: string[] = prompt.description ? doc.splitTextToSize(prompt.description, textW) : [];
        doc.setFont('courier', 'normal');
        doc.setFontSize(9);
        const contentLines: string[] = doc.splitTextToSize(prompt.content, textW - 10);

        const LINE_TITLE = 9, LINE_DESC = 6, LINE_CONTENT = 5.5;
        const BOX_PAD_X = 6, BOX_PAD_Y = 5;

        let simY = HEADER + 12, simPages = 1;
        const advance = (h: number) => {
            if (simY + h > BOTTOM) { simPages++; simY = HEADER + 10; }
            simY += h;
        };
        titleLines.forEach(() => advance(LINE_TITLE));
        simY += 4;
        if (descLines.length) { descLines.forEach(() => advance(LINE_DESC)); simY += 10; }
        advance(1); simY += 8;
        let ci = 0;
        while (ci < contentLines.length) {
            const avail = BOTTOM - simY - BOX_PAD_Y * 2;
            const perChunk = Math.max(1, Math.floor(avail / LINE_CONTENT));
            const chunk = contentLines.slice(ci, ci + perChunk);
            const boxH = chunk.length * LINE_CONTENT + BOX_PAD_Y * 2;
            advance(boxH + 4);
            ci += perChunk;
            if (ci < contentLines.length) { simPages++; simY = HEADER + 10; }
        }
        const totalPages = simPages;

        let page = 1;
        drawHeader();
        let y = HEADER + 12;

        const ensureSpace = (needed: number) => {
            if (y + needed > BOTTOM) {
                drawFooter(page, totalPages);
                doc.addPage();
                page++;
                drawHeader();
                y = HEADER + 10;
            }
        };

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(19);
        doc.setTextColor(29, 27, 24);
        titleLines.forEach((line: string) => { ensureSpace(LINE_TITLE); doc.text(line, ML, y); y += LINE_TITLE; });
        y += 4;

        if (descLines.length) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(139, 126, 116);
            descLines.forEach((line: string) => { ensureSpace(LINE_DESC); doc.text(line, ML, y); y += LINE_DESC; });
            y += 10;
        }

        ensureSpace(4);
        doc.setDrawColor(227, 220, 211);
        doc.setLineWidth(0.25);
        doc.line(ML, y, pageW - MR, y);
        y += 8;

        ensureSpace(7);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(139, 126, 116);
        doc.text('PROMPT', ML, y);
        y += 9;

        doc.setFont('courier', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(39, 39, 42);

        let ci2 = 0;
        while (ci2 < contentLines.length) {
            const avail = BOTTOM - y - BOX_PAD_Y * 2 - 2;
            const perChunk = Math.max(1, Math.floor(avail / LINE_CONTENT));
            const chunk = contentLines.slice(ci2, ci2 + perChunk);
            const boxH = chunk.length * LINE_CONTENT + BOX_PAD_Y * 2;
            doc.setFillColor(250, 249, 245);
            doc.setDrawColor(227, 220, 211);
            doc.setLineWidth(0.2);
            doc.roundedRect(ML, y, textW, boxH, 2, 2, 'FD');
            let ty = y + BOX_PAD_Y + LINE_CONTENT - 1;
            chunk.forEach((line: string) => { doc.text(line, ML + BOX_PAD_X, ty); ty += LINE_CONTENT; });
            y += boxH + 4;
            ci2 += perChunk;
            if (ci2 < contentLines.length) {
                drawFooter(page, totalPages);
                doc.addPage();
                page++;
                drawHeader();
                y = HEADER + 10;
            }
        }
        drawFooter(page, totalPages);

        const fileName = (prompt.title || 'prompt').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.pdf';
        doc.save(fileName);
    };

    const handleSave = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');
        if (!isSubscribed) return navigate('/pricing');
        setSaving(true);
        try {
            if (isSaved) {
                await supabase.from('saved_prompts').delete().eq('user_id', user.id).eq('prompt_id', id);
                setIsSaved(false);
            } else {
                await supabase.from('saved_prompts').insert({ user_id: user.id, prompt_id: id });
                setIsSaved(true);
            }
        } catch (e) { console.error(e); } finally { setSaving(false); }
    };

    // ── Loading ──────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen" style={{ backgroundColor: '#FAF9F5' }}>
            <div className="max-w-3xl mx-auto px-6 pt-16 space-y-6">
                <div className="h-4 w-24 rounded-full animate-pulse" style={{ backgroundColor: '#E3DCD3' }} />
                <div className="h-10 w-2/3 rounded-xl animate-pulse" style={{ backgroundColor: '#E3DCD3' }} />
                <div className="h-5 w-full rounded-lg animate-pulse" style={{ backgroundColor: '#F0EAE1' }} />
                <div className="h-64 w-full rounded-2xl animate-pulse mt-8" style={{ backgroundColor: '#F0EAE1' }} />
            </div>
        </div>
    );

    // ── Not found ────────────────────────────────────────────────────────────────
    if (!prompt) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#FAF9F5' }}>
            <AlertCircle size={36} style={{ color: '#C8BEB5' }} />
            <h2 className="font-display text-2xl" style={{ color: '#1D1B18' }}>prompt no encontrado</h2>
            <Link to="/prompts" className="font-mono text-xs underline" style={{ color: '#8B7E74' }}>
                volver a la biblioteca
            </Link>
        </div>
    );

    const isLocked = prompt.is_premium && !isSubscribed;

    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: '#FAF9F5', color: '#1D1B18' }}>
            <Helmet>
                <title>{`${prompt.title} | alpacka.ai`}</title>
            </Helmet>

            {/* ── Sub-nav ──────────────────────────────────────────────────────── */}
            <div
                className="sticky top-16 z-40 border-b backdrop-blur-md"
                style={{ backgroundColor: 'rgba(250,249,245,0.92)', borderColor: '#E3DCD3' }}
            >
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest uppercase transition-colors"
                        style={{ color: '#8B7E74' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C96A3C')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#8B7E74')}
                    >
                        <ChevronLeft size={14} />
                        biblioteca
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="transition-colors"
                        style={{ color: isSaved ? '#C96A3C' : '#8B7E74' }}
                        title={isSaved ? 'Quitar de guardados' : 'Guardar prompt'}
                        onMouseEnter={e => !isSaved && ((e.currentTarget as HTMLElement).style.color = '#C96A3C')}
                        onMouseLeave={e => !isSaved && ((e.currentTarget as HTMLElement).style.color = '#8B7E74')}
                    >
                        {isSaved
                            ? <BookmarkCheck size={20} />
                            : <Bookmark size={20} />
                        }
                    </button>
                </div>
            </div>

            {/* ── Main ─────────────────────────────────────────────────────────── */}
            <main className="max-w-3xl mx-auto px-6 pt-14 pb-8">

                {/* Meta tags */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span
                        className="font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border"
                        style={{ backgroundColor: '#F0EAE1', color: '#8B7E74', borderColor: '#E3DCD3' }}
                    >
                        {getCategoryEmoji(prompt.category)} {prompt.category || 'general'}
                    </span>
                    {prompt.is_premium && (
                        <span
                            className="font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5"
                            style={{ backgroundColor: '#FAF0E8', color: '#C96A3C', border: '1px solid #F5D9C8' }}
                        >
                            <Lock size={9} />
                            premium
                        </span>
                    )}
                </div>

                {/* Image */}
                {prompt.image_url && (
                    <div className="w-full rounded-2xl overflow-hidden mb-8">
                        <img
                            src={prompt.image_url}
                            alt={prompt.title}
                            className="w-full h-auto block"
                        />
                    </div>
                )}

                {/* Title */}
                <h1
                    className="font-display font-semibold leading-[1.06] tracking-tight mb-5"
                    style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#1D1B18' }}
                >
                    {prompt.title}
                </h1>

                {/* Description */}
                <p className="text-lg leading-relaxed mb-10" style={{ color: '#8B7E74' }}>
                    {prompt.description}
                </p>

                {/* Divider */}
                <div className="h-px mb-10" style={{ backgroundColor: '#E3DCD3' }} />

                {/* ── Prompt section ───────────────────────────────────────────── */}
                <section>

                    {/* Action bar */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: '#C8BEB5' }}>
                            prompt
                        </p>
                        {!isLocked && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadPdf}
                                    className="flex items-center gap-1.5 font-mono text-[11px] font-bold px-3 py-2 rounded-lg border transition-all hover:-translate-y-0.5"
                                    style={{ borderColor: '#E3DCD3', color: '#8B7E74', backgroundColor: 'white' }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.borderColor = '#C96A3C';
                                        (e.currentTarget as HTMLElement).style.color = '#C96A3C';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.borderColor = '#E3DCD3';
                                        (e.currentTarget as HTMLElement).style.color = '#8B7E74';
                                    }}
                                    title="Descargar como PDF"
                                >
                                    <Download size={13} />
                                    PDF
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 font-mono text-[11px] font-bold px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5 shadow-sm"
                                    style={copied
                                        ? { backgroundColor: '#22c55e', color: 'white', border: '1px solid transparent' }
                                        : { backgroundColor: '#C96A3C', color: 'white', border: '1px solid transparent' }
                                    }
                                >
                                    {copied ? <Check size={13} /> : <Copy size={13} />}
                                    {copied ? 'copiado' : 'copiar prompt'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content box */}
                    <div
                        className="relative rounded-2xl overflow-hidden"
                        style={{ border: '1px solid #2D2520' }}
                    >
                        {/* Top bar (terminal-style) */}
                        <div
                            className="flex items-center gap-2 px-5 py-3 border-b"
                            style={{ backgroundColor: '#221E1A', borderColor: '#2D2520' }}
                        >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3D352E' }} />
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3D352E' }} />
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3D352E' }} />
                            <span className="font-mono text-[10px] ml-2" style={{ color: '#4D433C' }}>
                                prompt.txt
                            </span>
                        </div>

                        {/* Content area */}
                        <div
                            className="relative min-h-[220px]"
                            style={{ backgroundColor: '#1A1410' }}
                        >
                            {isLocked ? (
                                <>
                                    {/* Blurred preview lines */}
                                    <div className="p-8 select-none pointer-events-none" style={{ filter: 'blur(5px)', opacity: 0.25 }}>
                                        <p className="font-mono text-sm leading-relaxed" style={{ color: '#C8BEB5' }}>
                                            Actúa como un experto en [área] con más de 10 años de experiencia.
                                            Tu objetivo es [objetivo principal] teniendo en cuenta [contexto
                                            relevante]. Debes [instrucción 1], [instrucción 2] y asegurarte
                                            de que el resultado cumpla con [criterio de calidad]. Responde
                                            siempre en español y estructura tu respuesta con [formato]...
                                        </p>
                                    </div>

                                    {/* Lock overlay */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8" style={{ background: 'linear-gradient(to bottom, rgba(26,20,16,0) 0%, rgba(26,20,16,0.85) 30%, rgba(26,20,16,1) 60%)' }}>
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-xl"
                                            style={{ backgroundColor: '#221E1A', border: '1px solid #3D352E' }}
                                        >
                                            <Lock size={22} style={{ color: '#C96A3C' }} />
                                        </div>
                                        <h4 className="font-display font-semibold text-lg text-white mb-2">
                                            Contenido premium
                                        </h4>
                                        <p className="text-sm mb-7 max-w-xs leading-relaxed" style={{ color: '#8B7E74' }}>
                                            Suscríbete para acceder a este prompt y a los 150+ del archivo.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Link
                                                to="/pricing"
                                                className="inline-flex items-center justify-center gap-2 font-bold text-sm px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg"
                                                style={{ backgroundColor: '#C96A3C', color: 'white' }}
                                            >
                                                ver planes
                                                <ArrowRight size={14} />
                                            </Link>
                                            <Link
                                                to="/login?redirect=/prompts"
                                                className="inline-flex items-center justify-center font-mono text-xs font-bold px-6 py-3.5 rounded-xl transition-colors"
                                                style={{ border: '1px solid #3D352E', color: '#8B7E74' }}
                                                onMouseEnter={e => {
                                                    (e.currentTarget as HTMLElement).style.borderColor = '#C96A3C';
                                                    (e.currentTarget as HTMLElement).style.color = '#C96A3C';
                                                }}
                                                onMouseLeave={e => {
                                                    (e.currentTarget as HTMLElement).style.borderColor = '#3D352E';
                                                    (e.currentTarget as HTMLElement).style.color = '#8B7E74';
                                                }}
                                            >
                                                ya tengo cuenta →
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <pre
                                    className="p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap select-all overflow-x-auto"
                                    style={{ color: '#D6CBC2' }}
                                >
                                    {prompt.content}
                                </pre>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Tip ─────────────────────────────────────────────────────── */}
                {!isLocked && (
                    <div
                        className="mt-6 flex items-start gap-4 p-5 rounded-2xl border"
                        style={{ backgroundColor: '#FAF0E8', borderColor: '#F5D9C8' }}
                    >
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#C96A3C' }} />
                        <p className="text-sm leading-relaxed" style={{ color: '#8B7E74' }}>
                            <span className="font-semibold" style={{ color: '#C96A3C' }}>Tip:</span>{' '}
                            los parámetros entre{' '}
                            <code
                                className="font-mono text-xs px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: '#F5D9C8', color: '#C96A3C' }}
                            >
                                [corchetes]
                            </code>{' '}
                            son variables. reemplázalos con tus datos específicos para obtener el mejor output del modelo.
                        </p>
                    </div>
                )}

            </main>
        </div>
    );
};

export default PromptDetail;
