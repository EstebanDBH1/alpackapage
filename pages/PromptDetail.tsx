import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Prompt } from '../types';
import { Copy, Check, Lock, AlertCircle, Bookmark, BookmarkCheck, ArrowRight, Download } from 'lucide-react';
import jsPDF from 'jspdf';

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
        <div className="bg-white font-space">
            <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
                <div className="h-4 w-24 animate-pulse bg-gray-100" />
                <div className="h-10 w-2/3 animate-pulse bg-gray-100" />
                <div className="h-5 w-full animate-pulse bg-gray-50" />
                <div className="h-64 w-full animate-pulse mt-8 bg-gray-50" />
            </div>
        </div>
    );

    // ── Not found ────────────────────────────────────────────────────────────────
    if (!prompt) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-white font-space text-gray-900">
            <AlertCircle size={36} className="text-gray-300" />
            <h2 className="font-bold text-2xl uppercase tracking-tight">Prompt no encontrado</h2>
            <Link to="/prompts" className="text-xs uppercase tracking-wider underline hover:text-gray-500">
                Volver al catálogo
            </Link>
        </div>
    );

    const isLocked = prompt.is_premium && !isSubscribed;

    return (
        <div className="bg-white text-gray-900 font-space">
            <main className="max-w-3xl mx-auto px-6 py-16">

                {/* Back + Save */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-xs uppercase tracking-wider hover:underline flex items-center gap-2"
                    >
                        <span>←</span> Volver al catálogo
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 text-xs uppercase tracking-wider font-bold transition-colors disabled:opacity-50 ${isSaved ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
                        title={isSaved ? 'Quitar de guardados' : 'Guardar prompt'}
                    >
                        {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                        <span className="hidden sm:inline">{isSaved ? 'Guardado' : 'Guardar'}</span>
                    </button>
                </div>

                {/* Category + premium tag */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-bold bg-gray-100 uppercase tracking-wider">
                        {prompt.category || 'general'}
                    </span>
                    {prompt.is_premium && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border border-brand-red/30 text-brand-red">
                            <Lock size={10} /> Premium
                        </span>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-[28px] md:text-[35px] font-bold leading-tight mb-5">
                    {prompt.title}
                </h1>

                {/* Image */}
                {prompt.image_url && (
                    <div className="w-full overflow-hidden border border-gray-200 mb-8">
                        <img src={prompt.image_url} alt={prompt.title} className="w-full h-auto block" />
                    </div>
                )}

                {/* Description */}
                {prompt.description && (
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-10">
                        {prompt.description}
                    </p>
                )}

                {/* ── Caja de Código Minimalista ─────────────────────────────── */}
                <div className="border border-gray-200 mb-8 overflow-hidden bg-gray-50">
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                                PROMPT_SYSTEM
                            </span>
                        </div>
                        {!isLocked && (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleDownloadPdf}
                                    className="text-xs uppercase tracking-widest font-bold hover:text-gray-500 transition-colors flex items-center gap-1.5 focus:outline-none"
                                    title="Descargar como PDF"
                                >
                                    <Download size={14} />
                                    <span>PDF</span>
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className={`text-xs uppercase tracking-widest font-bold transition-colors flex items-center gap-1.5 focus:outline-none ${copied ? 'text-green-600' : 'hover:text-gray-500'}`}
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content area */}
                    {isLocked ? (
                        <div className="relative min-h-[460px]">
                            {/* Vista previa difuminada (señuelo realista) */}
                            <div className="absolute inset-0 p-6 select-none pointer-events-none blur-[6px] opacity-50" aria-hidden="true">
                                <pre className="text-gray-800 text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
{`Actúa como un experto en [área] con más de 10 años de experiencia
demostrable. Tu objetivo principal es [objetivo], considerando en todo
momento [contexto relevante] y las restricciones de [límites].

# Rol
Eres un especialista senior reconocido por [logro]. Hablas con
autoridad pero sin tecnicismos innecesarios.

# Tarea
1. Analiza [entrada] e identifica [criterios clave].
2. Desarrolla [instrucción 1] aplicando [marco / metodología].
3. Optimiza el resultado para [métrica de éxito].

# Formato de salida
Responde siempre en español, estructurado con [formato], usando
ejemplos concretos y un tono [tono]. Evita [errores comunes]...`}
                                </pre>
                            </div>

                            {/* Capa de vidrio esmerilado + tarjeta de bloqueo */}
                            <div className="absolute inset-0 flex items-center justify-center p-5 bg-gradient-to-b from-white/20 via-white/75 to-white backdrop-blur-[2px]">
                                <div className="flex flex-col items-center text-center">

                                    {/* Icono */}
                                    <div className="w-11 h-11 flex items-center justify-center mb-5 rounded-full bg-brand-red/10 text-brand-red">
                                        <Lock size={18} />
                                    </div>

                                    <h4 className="font-bold text-lg uppercase tracking-tight mb-6">
                                        Contenido Premium
                                    </h4>

                                    <Link
                                        to="/pricing"
                                        className="inline-flex items-center justify-center gap-2 border border-gray-900 bg-gray-900 text-white hover:bg-white hover:text-gray-900 px-8 py-3.5 text-xs uppercase tracking-wider font-bold transition-all duration-300"
                                    >
                                        Desbloquear acceso
                                        <ArrowRight size={14} />
                                    </Link>
                                    <Link
                                        to={`/login?redirect=/prompts/${id}`}
                                        className="mt-4 text-[11px] uppercase tracking-wider font-bold text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        Ya tengo cuenta
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 overflow-x-auto">
                            <pre className="text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words font-mono select-all">
                                {prompt.content}
                            </pre>
                        </div>
                    )}
                </div>

                {/* ── Tip ─────────────────────────────────────────────────────── */}
                {!isLocked && (
                    <div className="flex items-start gap-3 p-5 border border-gray-200 bg-gray-50">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-gray-900" />
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                            <span className="font-bold text-gray-900 uppercase tracking-wider">Tip:</span>{' '}
                            los parámetros entre{' '}
                            <code className="font-mono text-xs px-1.5 py-0.5 bg-gray-200 text-gray-900">
                                [corchetes]
                            </code>{' '}
                            son variables. Reemplázalos con tus datos específicos para obtener el mejor output del modelo.
                        </p>
                    </div>
                )}

            </main>
        </div>
    );
};

export default PromptDetail;
