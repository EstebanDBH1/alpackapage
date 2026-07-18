import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Prompt } from '../types';
import { Copy, Check, Lock, AlertCircle, Bookmark, BookmarkCheck, ArrowRight, Download } from 'lucide-react';

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
            // getSession es local (sin red); con el usuario ya en mano lanzamos
            // prompt, suscripción y guardado en paralelo: un solo round-trip.
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user ?? null;

            const [{ data: promptData, error }, subRes, savedRes] = await Promise.all([
                supabase.rpc('get_prompt_detail', { prompt_id: id }).single(),
                user
                    ? supabase.from('subscriptions').select('subscription_status').eq('customer_id', user.id).maybeSingle()
                    : Promise.resolve({ data: null }),
                user
                    ? supabase.from('saved_prompts').select('id').eq('user_id', user.id).eq('prompt_id', id).maybeSingle()
                    : Promise.resolve({ data: null }),
            ]);

            const sub = subRes.data;
            const subscribed = !!(sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing'));
            setIsSaved(!!savedRes.data);

            if (!error) setPrompt(promptData as Prompt);
            setIsSubscribed(subscribed);
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

    const handleDownloadPdf = async () => {
        if (!prompt?.content) return;

        // jspdf pesa ~380 KB: se descarga solo cuando el usuario pide el PDF.
        const { default: jsPDF } = await import('jspdf');
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
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
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

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-background bg-radial-glow font-space">
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6">
                <div className="h-4 w-24 animate-pulse rounded-full bg-card" />
                <div className="h-10 w-2/3 animate-pulse rounded-xl bg-card" />
                <div className="h-5 w-full animate-pulse rounded-lg bg-card" />
                <div className="mt-8 h-64 w-full animate-pulse rounded-2xl bg-card" />
            </div>
        </div>
    );

    // ── Not found ────────────────────────────────────────────────────────────
    if (!prompt) return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background bg-radial-glow font-space text-foreground">
            <AlertCircle size={36} className="text-muted-foreground" />
            <h2 className="text-2xl font-medium tracking-tight">Prompt no encontrado</h2>
            <Link to="/prompts" className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline transition hover:text-foreground">
                Volver al catálogo
            </Link>
        </div>
    );

    const isLocked = prompt.is_premium && !isSubscribed;

    return (
        <div className="relative min-h-screen overflow-x-clip bg-background bg-radial-glow font-space text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

            <main className="relative mx-auto max-w-6xl px-4 py-12 sm:px-8 md:py-16">

                {/* Back nav */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-12 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <span>←</span> Volver al catálogo
                </button>

                <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_280px]">

                    {/* ── LEFT: Main content ──────────────────────────────────── */}
                    <div className="min-w-0">

                        {/* Category + Premium badge */}
                        <div className="mb-5 flex flex-wrap items-center gap-2">
                            <span className="inline-block rounded-md border border-border/50 bg-secondary px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                {prompt.category || 'general'}
                            </span>
                            {prompt.is_premium && (
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-secondary px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-accent">
                                    <Lock size={9} /> Premium
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="mb-6 text-balance text-3xl font-medium leading-tight tracking-tight text-foreground md:text-4xl">
                            {prompt.title}
                        </h1>

                        {/* Image */}
                        {prompt.image_url && (
                            <div className="mb-8 w-full overflow-hidden rounded-2xl border border-border/70">
                                <img src={prompt.image_url} alt={prompt.title} className="block h-auto w-full" />
                            </div>
                        )}

                        {/* Description */}
                        {prompt.description && (
                            <p className="mb-10 border-l-2 border-accent/40 pl-5 text-base leading-relaxed text-muted-foreground">
                                {prompt.description}
                            </p>
                        )}

                        {/* ── Prompt Box ──────────────────────────────────────── */}
                        <div className="mb-8 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_0_60px_oklch(0.86_0.09_90_/_0.06)]">

                            {/* Box Header */}
                            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]" />
                                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                        PROMPT_SYSTEM.txt
                                    </span>
                                </div>
                                {!isLocked && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleDownloadPdf}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary/40 focus:outline-none"
                                            title="Descargar como PDF"
                                        >
                                            <Download size={13} />
                                            <span>PDF</span>
                                        </button>
                                        <button
                                            onClick={handleCopy}
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none ${
                                                copied
                                                    ? 'border-accent/50 bg-secondary text-accent'
                                                    : 'border-border bg-secondary text-foreground hover:border-primary/40'
                                            }`}
                                        >
                                            {copied ? <Check size={13} /> : <Copy size={13} />}
                                            <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Content or Lock */}
                            {isLocked ? (
                                <div className="relative min-h-[500px]">
                                    {/* Blurred preview */}
                                    <div className="pointer-events-none absolute inset-0 select-none p-8 opacity-20 blur-sm" aria-hidden="true">
                                        <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground/80">
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

                                    {/* Lock overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-card/70 to-card p-6">
                                        <div className="flex max-w-xs flex-col items-center text-center">

                                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
                                                <Lock size={22} />
                                            </div>

                                            <h4 className="mb-2 text-xl font-medium tracking-tight text-foreground">
                                                Contenido Premium
                                            </h4>
                                            <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                                                Suscríbete para desbloquear este prompt y los 150+ de la librería.
                                            </p>

                                            <Link
                                                to="/pricing"
                                                className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] transition hover:opacity-90"
                                            >
                                                Desbloquear por 4 USD/mes
                                                <ArrowRight size={14} />
                                            </Link>
                                            <Link
                                                to={`/login?redirect=/prompts/${id}`}
                                                className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                Ya tengo cuenta
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto p-6 md:p-8">
                                    <pre className="select-all whitespace-pre-wrap break-words font-mono text-sm leading-[1.8] text-foreground/90 md:text-base">
                                        {prompt.content}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Tip */}
                        {!isLocked && (
                            <div className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-5">
                                <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-accent" />
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground">Cómo usarlo: </span>
                                    Reemplaza los parámetros entre{' '}
                                    <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-primary">
                                        [corchetes]
                                    </code>{' '}
                                    con tus datos específicos para obtener el mejor resultado del modelo en la primera respuesta.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Metadata Sidebar ─────────────────────────────── */}
                    <div className="flex flex-col gap-4 lg:sticky lg:top-24">

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition-colors duration-200 disabled:opacity-50 ${
                                isSaved
                                    ? 'border-accent/50 bg-accent/10 text-accent hover:bg-accent/20'
                                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                            }`}
                        >
                            {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                            {isSaved ? 'Guardado' : 'Guardar prompt'}
                        </button>

                        {/* Metadata card */}
                        <div className="rounded-2xl border border-border/70 bg-card p-5">
                            <h3 className="mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                Detalles del prompt
                            </h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Categoría</span>
                                    <span className="text-xs font-medium uppercase text-foreground">{prompt.category || 'General'}</span>
                                </div>
                                <div className="h-px bg-border/60" />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Acceso</span>
                                    <span className={`text-xs font-medium uppercase ${prompt.is_premium ? 'text-accent' : 'text-foreground'}`}>
                                        {prompt.is_premium ? 'Premium' : 'Gratuito'}
                                    </span>
                                </div>
                                <div className="h-px bg-border/60" />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Modelo</span>
                                    <span className="text-xs font-medium uppercase text-foreground">GPT · Claude · Gemini</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA if not subscribed and not locked (encourage upgrade) */}
                        {!isSubscribed && !isLocked && (
                            <div className="rounded-2xl border border-accent/40 bg-card p-5 text-center">
                                <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                                    Desbloquea <strong className="font-medium text-foreground">150+ prompts premium</strong> para resultados profesionales.
                                </p>
                                <Link to="/pricing" className="block w-full">
                                    <button className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                                        Ver planes — 4 USD/mes
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* Back link */}
                        <Link
                            to="/prompts"
                            className="flex items-center justify-center gap-2 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                        >
                            ← Todos los prompts
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default PromptDetail;
