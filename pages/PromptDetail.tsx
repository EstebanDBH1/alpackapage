import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getAiToolMeta } from '../lib/aiTools';
import { Prompt } from '../types';
import { Copy, Check, Lock, AlertCircle, Bookmark, BookmarkCheck, ArrowRight, Download, ArrowLeft } from 'lucide-react';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, GREEN, AMBER,
    MONO, AI_BADGE_DARK, CategoryBadge,
} from '../components/darkKit';

/* Detalle de prompt — mismo lenguaje visual oscuro estilo skills.sh
   que la home (ver public/reference-new-app/reference.png). */

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
        <div style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: MONO }}>
            <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 space-y-5">
                {[16, 44, 20, 280].map((h, i) => (
                    <div
                        key={i}
                        className="animate-pulse"
                        style={{
                            height: h, borderRadius: h > 100 ? 12 : 8,
                            backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`,
                            width: i === 1 ? '70%' : i === 0 ? 120 : '100%',
                        }}
                    />
                ))}
            </div>
        </div>
    );

    // ── Not found ────────────────────────────────────────────────────────────
    if (!prompt) return (
        <div style={{ backgroundColor: BG, color: TEXT, minHeight: '80vh', fontFamily: MONO, display: 'flex', flexDirection: 'column' }}>
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-20 text-center">
                <div
                    style={{
                        width: 52, height: 52, borderRadius: 14,
                        backgroundColor: PANEL, border: `1px solid ${BORDER}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <AlertCircle size={22} style={{ color: DIM }} />
                </div>
                <h2 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>Prompt no encontrado</h2>
                <Link
                    to="/"
                    style={{ fontFamily: MONO, fontSize: 13.5, color: MUTED, textDecoration: 'none', borderBottom: `1px solid ${BORDER}`, paddingBottom: 2 }}
                >
                    Volver al directorio
                </Link>
            </div>
        </div>
    );

    const isLocked = prompt.is_premium && !isSubscribed;
    const tool = getAiToolMeta(prompt.ai_tool);
    const badge = AI_BADGE_DARK[tool.value] ?? AI_BADGE_DARK['cualquier-modelo'];

    const chip: React.CSSProperties = {
        fontFamily: MONO, borderRadius: 6, padding: '3px 9px', fontSize: 10,
        fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
    };

    const boxBtn: React.CSSProperties = {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: MONO, backgroundColor: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8,
        padding: '7px 12px', fontSize: 12, fontWeight: 600, color: TEXT,
        cursor: 'pointer', transition: 'border-color .15s, background .15s',
    };

    return (
        <div style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: MONO }}>
            <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10 md:py-12">

                {/* Volver */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 26,
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: MONO, fontSize: 13, color: MUTED,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = MUTED; }}
                >
                    <ArrowLeft size={14} /> Volver al directorio
                </button>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_300px] lg:gap-10">

                    {/* ── IZQUIERDA: contenido ──────────────────────────────── */}
                    <div className="min-w-0">

                        {/* Chips */}
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <CategoryBadge category={prompt.category} size="md" />
                            <span style={{ ...chip, backgroundColor: badge.bg, border: `1px solid ${badge.bd}`, color: badge.fg }}>
                                {tool.label}
                            </span>
                            {prompt.is_premium && (
                                <span
                                    className="inline-flex items-center gap-1.5"
                                    style={{
                                        ...chip, color: AMBER, backgroundColor: 'rgba(255,178,36,0.08)',
                                        border: '1px solid rgba(255,178,36,0.28)',
                                    }}
                                >
                                    <Lock size={9} /> Premium
                                </span>
                            )}
                        </div>

                        {/* Título */}
                        <h1
                            style={{
                                fontFamily: MONO,
                                fontWeight: 700,
                                fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)',
                                lineHeight: 1.2,
                                letterSpacing: '-0.02em',
                                color: TEXT,
                                marginBottom: 18,
                            }}
                        >
                            {prompt.title}
                        </h1>

                        {/* Imagen */}
                        {prompt.image_url && (
                            <div
                                className="mb-7 w-full overflow-hidden"
                                style={{ borderRadius: 12, border: `1px solid ${BORDER_SOFT}` }}
                            >
                                <img src={prompt.image_url} alt={prompt.title} className="block h-auto w-full" />
                            </div>
                        )}

                        {/* Descripción */}
                        {prompt.description && (
                            <p
                                style={{
                                    borderLeft: `2px solid ${BORDER}`, paddingLeft: 16, marginBottom: 28,
                                    fontFamily: MONO, color: MUTED, fontSize: 14.5, lineHeight: 1.75,
                                }}
                            >
                                {prompt.description}
                            </p>
                        )}

                        {/* ── Caja del prompt ───────────────────────────────── */}
                        <div
                            className="mb-6 overflow-hidden"
                            style={{ borderRadius: 12, border: `1px solid ${BORDER_SOFT}`, backgroundColor: CARD }}
                        >
                            {/* Cabecera */}
                            <div
                                className="flex items-center justify-between gap-3"
                                style={{ padding: '11px 16px', backgroundColor: PANEL, borderBottom: `1px solid ${BORDER_SOFT}` }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: GREEN }} />
                                    <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED }}>
                                        El prompt
                                    </span>
                                </div>
                                {!isLocked && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleDownloadPdf} style={boxBtn} title="Descargar como PDF">
                                            <Download size={13} /> PDF
                                        </button>
                                        <button
                                            onClick={handleCopy}
                                            style={{
                                                ...boxBtn,
                                                backgroundColor: copied ? 'rgba(63,207,142,0.1)' : TEXT,
                                                borderColor: copied ? 'rgba(63,207,142,0.35)' : TEXT,
                                                color: copied ? GREEN : '#000',
                                            }}
                                        >
                                            {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                                            {copied ? '¡Copiado!' : 'Copiar'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Contenido o bloqueo */}
                            {isLocked ? (
                                <div style={{ position: 'relative', minHeight: 470 }}>
                                    {/* Vista previa difuminada */}
                                    <div
                                        aria-hidden="true"
                                        style={{
                                            position: 'absolute', inset: 0, padding: 28,
                                            opacity: 0.5, filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none',
                                        }}
                                    >
                                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: MONO, fontSize: 13, lineHeight: 1.8, color: MUTED }}>
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

                                    {/* Overlay */}
                                    <div
                                        className="absolute inset-0 flex items-center justify-center p-6"
                                        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.92) 45%, #000000)' }}
                                    >
                                        <div className="flex flex-col items-center text-center" style={{ maxWidth: 340 }}>
                                            <div
                                                style={{
                                                    width: 54, height: 54, borderRadius: 14, marginBottom: 18,
                                                    backgroundColor: 'rgba(255,178,36,0.08)', border: '1px solid rgba(255,178,36,0.28)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >
                                                <Lock size={22} style={{ color: AMBER }} />
                                            </div>

                                            <h4 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: '-0.01em', marginBottom: 10, color: TEXT }}>
                                                Contenido premium
                                            </h4>
                                            <p style={{ fontFamily: MONO, color: MUTED, fontSize: 13.5, lineHeight: 1.7, marginBottom: 22 }}>
                                                Suscríbete para desbloquear este prompt y los más de 1.000 del directorio.
                                            </p>

                                            <Link
                                                to="/pricing"
                                                style={{
                                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                                                    fontFamily: MONO, backgroundColor: TEXT, color: '#000', fontWeight: 700, fontSize: 14,
                                                    padding: '13px 24px', borderRadius: 10, textDecoration: 'none',
                                                    marginBottom: 12,
                                                }}
                                            >
                                                Desbloquear por 7 USD/mes
                                                <ArrowRight size={15} />
                                            </Link>
                                            <Link
                                                to={`/login?redirect=/prompts/${id}`}
                                                style={{ fontFamily: MONO, fontSize: 12.5, color: MUTED, textDecoration: 'none' }}
                                            >
                                                Ya tengo cuenta
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '24px 22px', overflowX: 'auto' }}>
                                    <pre
                                        style={{
                                            whiteSpace: 'pre-wrap', wordBreak: 'break-word', userSelect: 'all',
                                            fontFamily: MONO, fontSize: 13.5, lineHeight: 1.85, color: TEXT,
                                        }}
                                    >
                                        {prompt.content}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Cómo usarlo */}
                        {!isLocked && (
                            <div
                                className="flex items-start gap-3.5"
                                style={{ backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 12, padding: '16px 18px' }}
                            >
                                <AlertCircle size={16} style={{ color: AMBER, flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontFamily: MONO, color: MUTED, fontSize: 13, lineHeight: 1.7 }}>
                                    <strong style={{ color: TEXT, fontWeight: 600 }}>Cómo usarlo: </strong>
                                    reemplaza los parámetros entre{' '}
                                    <code
                                        style={{
                                            backgroundColor: PANEL, border: `1px solid ${BORDER}`, borderRadius: 5,
                                            padding: '1px 6px', fontSize: 12, color: TEXT,
                                        }}
                                    >
                                        [corchetes]
                                    </code>{' '}
                                    con tus datos para obtener el mejor resultado del modelo en la primera respuesta.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── DERECHA: metadatos ────────────────────────────────── */}
                    <div className="flex flex-col gap-3 lg:sticky" style={{ top: 24 }}>

                        {/* Guardar */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                fontFamily: MONO,
                                backgroundColor: isSaved ? 'rgba(63,207,142,0.08)' : PANEL,
                                border: `1px solid ${isSaved ? 'rgba(63,207,142,0.3)' : BORDER}`,
                                color: isSaved ? GREEN : TEXT,
                                borderRadius: 10, padding: '11px 18px', fontSize: 13, fontWeight: 600,
                                cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
                                transition: 'background .15s, border-color .15s',
                            }}
                        >
                            {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                            {isSaved ? 'Guardado' : 'Guardar prompt'}
                        </button>

                        {/* Detalles */}
                        <div style={{ backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`, borderRadius: 12, padding: '16px 18px' }}>
                            <h3 style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: DIM, marginBottom: 12 }}>
                                Detalles del prompt
                            </h3>
                            <div className="flex flex-col">
                                {[
                                    { k: 'Categoría', v: prompt.category || 'General', accent: false },
                                    { k: 'Acceso', v: prompt.is_premium ? 'Premium' : 'Gratuito', accent: !!prompt.is_premium },
                                    { k: 'Modelo', v: tool.label, accent: false },
                                ].map((row, i, arr) => (
                                    <React.Fragment key={row.k}>
                                        <div className="flex items-center justify-between gap-3" style={{ padding: '9px 0' }}>
                                            <span style={{ fontFamily: MONO, fontSize: 12, color: DIM }}>{row.k}</span>
                                            <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 600, color: row.accent ? AMBER : TEXT }}>
                                                {row.v}
                                            </span>
                                        </div>
                                        {i < arr.length - 1 && <div style={{ height: 1, backgroundColor: BORDER_SOFT }} />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* CTA si no está suscrito */}
                        {!isSubscribed && !isLocked && (
                            <div
                                style={{
                                    backgroundColor: 'rgba(255,178,36,0.06)', border: '1px solid rgba(255,178,36,0.22)',
                                    borderRadius: 12, padding: '16px 18px', textAlign: 'center',
                                }}
                            >
                                <p style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.65, color: MUTED, marginBottom: 13 }}>
                                    Desbloquea <strong style={{ fontWeight: 700, color: AMBER }}>+1.000 prompts premium</strong> y el generador con IA.
                                </p>
                                <Link
                                    to="/pricing"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        fontFamily: MONO, backgroundColor: TEXT, color: '#000', fontWeight: 700, fontSize: 13,
                                        padding: '11px 18px', borderRadius: 9, textDecoration: 'none',
                                    }}
                                >
                                    Ver el plan — 7 USD/mes
                                </Link>
                            </div>
                        )}

                        {/* Volver */}
                        <Link
                            to="/"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                padding: '10px', borderRadius: 10,
                                border: `1px solid ${BORDER_SOFT}`, backgroundColor: CARD,
                                fontFamily: MONO, fontSize: 13, color: MUTED, textDecoration: 'none',
                            }}
                        >
                            <ArrowLeft size={13} /> Todos los prompts
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default PromptDetail;
