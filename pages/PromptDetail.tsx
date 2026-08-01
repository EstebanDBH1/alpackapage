import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getAiToolMeta } from '../lib/aiTools';
import { Prompt } from '../types';
import { Copy, Check, Lock, AlertCircle, Bookmark, BookmarkCheck, ArrowRight, Download, ArrowLeft } from 'lucide-react';
import {
    BG, BG_WARM, TEXT, TEXT_MED, TEXT_DIM, BORDER, ACCENT, YELLOW, GREEN, FONT,
    useEuclidFont, LandingStyles,
} from '../components/landingKit';

// Badges de herramienta IA en versión clara (los de lib/aiTools son para el tema oscuro)
const AI_BADGE: Record<string, { bg: string; bd: string; fg: string }> = {
    'cualquier-modelo': { bg: BG_WARM,   bd: BORDER,    fg: TEXT_MED },
    chatgpt:            { bg: '#eefbf2', bd: '#c3ecd1', fg: '#0f8a44' },
    claude:             { bg: '#fff4ea', bd: '#fbdcc0', fg: '#c2620d' },
    gemini:             { bg: '#eff6ff', bd: '#cfe0fd', fg: '#2563eb' },
};

const PromptDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEuclidFont();

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
        <div className="bp-scope" style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: FONT }}>
            <LandingStyles />
            <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 space-y-5">
                {[16, 44, 20, 280].map((h, i) => (
                    <div
                        key={i}
                        className="animate-pulse"
                        style={{
                            height: h, borderRadius: h > 100 ? 18 : 10,
                            backgroundColor: BG_WARM, border: `1px solid ${BORDER}`,
                            width: i === 1 ? '70%' : i === 0 ? 120 : '100%',
                        }}
                    />
                ))}
            </div>
        </div>
    );

    // ── Not found ────────────────────────────────────────────────────────────
    if (!prompt) return (
        <div
            className="bp-scope flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center"
            style={{ backgroundColor: BG, color: TEXT, fontFamily: FONT }}
        >
            <LandingStyles />
            <div
                style={{
                    width: 52, height: 52, borderRadius: 16,
                    backgroundColor: BG_WARM, border: `1px solid ${BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <AlertCircle size={22} style={{ color: TEXT_DIM }} />
            </div>
            <h2 style={{ fontWeight: 600, fontSize: 24, letterSpacing: '-0.03em' }}>Prompt no encontrado</h2>
            <Link
                to="/prompts"
                style={{ fontSize: 14, color: TEXT_MED, textDecoration: 'none', borderBottom: `1px solid ${BORDER}`, paddingBottom: 2 }}
            >
                Volver al catálogo
            </Link>
        </div>
    );

    const isLocked = prompt.is_premium && !isSubscribed;
    const tool = getAiToolMeta(prompt.ai_tool);
    const badge = AI_BADGE[tool.value] ?? AI_BADGE['cualquier-modelo'];

    const chip: React.CSSProperties = {
        borderRadius: 8, padding: '4px 10px', fontSize: 10,
        fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
    };

    const boxBtn: React.CSSProperties = {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 9,
        padding: '7px 12px', fontSize: 12.5, fontWeight: 600, color: TEXT,
        cursor: 'pointer', transition: 'border-color .15s, background .15s',
    };

    return (
        <div className="bp-scope" style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: FONT }}>
            <LandingStyles />

            <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10 md:py-14">

                {/* Volver */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 28,
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13.5, color: TEXT_MED,
                    }}
                >
                    <ArrowLeft size={14} /> Volver al catálogo
                </button>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_300px] lg:gap-10">

                    {/* ── IZQUIERDA: contenido ──────────────────────────────── */}
                    <div className="min-w-0">

                        {/* Chips */}
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span style={{ ...chip, backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, color: TEXT_MED }}>
                                {prompt.category || 'general'}
                            </span>
                            <span style={{ ...chip, backgroundColor: badge.bg, border: `1px solid ${badge.bd}`, color: badge.fg }}>
                                {tool.label}
                            </span>
                            {prompt.is_premium && (
                                <span
                                    className="inline-flex items-center gap-1.5"
                                    style={{ ...chip, backgroundColor: '#fff7e8', border: '1px solid #fbe3b0', color: '#a86a00' }}
                                >
                                    <Lock size={9} /> Premium
                                </span>
                            )}
                        </div>

                        {/* Título */}
                        <h1
                            style={{
                                fontWeight: 600,
                                fontSize: 'clamp(1.8rem, 3.8vw, 2.6rem)',
                                lineHeight: 1.12,
                                letterSpacing: '-0.035em',
                                color: TEXT,
                                marginBottom: 20,
                            }}
                        >
                            {prompt.title}
                        </h1>

                        {/* Imagen */}
                        {prompt.image_url && (
                            <div
                                className="mb-7 w-full overflow-hidden"
                                style={{ borderRadius: 18, border: `1px solid ${BORDER}` }}
                            >
                                <img src={prompt.image_url} alt={prompt.title} className="block h-auto w-full" />
                            </div>
                        )}

                        {/* Descripción */}
                        {prompt.description && (
                            <p
                                style={{
                                    borderLeft: `2px solid ${BORDER}`, paddingLeft: 18, marginBottom: 30,
                                    color: TEXT_MED, fontSize: 16, lineHeight: 1.8,
                                }}
                            >
                                {prompt.description}
                            </p>
                        )}

                        {/* ── Caja del prompt ───────────────────────────────── */}
                        <div
                            className="mb-6 overflow-hidden"
                            style={{
                                borderRadius: 20, border: `1px solid ${BORDER}`, backgroundColor: BG,
                                boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
                            }}
                        >
                            {/* Cabecera */}
                            <div
                                className="flex items-center justify-between gap-3"
                                style={{ padding: '12px 18px', backgroundColor: BG_WARM, borderBottom: `1px solid ${BORDER}` }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: ACCENT }} />
                                    <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: TEXT_MED }}>
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
                                                backgroundColor: copied ? '#eefbf2' : BG,
                                                borderColor: copied ? '#c3ecd1' : BORDER,
                                                color: copied ? GREEN : TEXT,
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
                                            position: 'absolute', inset: 0, padding: 30,
                                            opacity: 0.4, filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none',
                                        }}
                                    >
                                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13.5, lineHeight: 1.8, color: TEXT_MED }}>
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
                                        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.94) 45%, #ffffff)' }}
                                    >
                                        <div className="flex flex-col items-center text-center" style={{ maxWidth: 340 }}>
                                            <div
                                                style={{
                                                    width: 56, height: 56, borderRadius: 18, marginBottom: 20,
                                                    backgroundColor: '#fff7e8', border: '1px solid #fbe3b0',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >
                                                <Lock size={22} style={{ color: '#c98200' }} />
                                            </div>

                                            <h4 style={{ fontWeight: 600, fontSize: 21, letterSpacing: '-0.025em', marginBottom: 10 }}>
                                                Contenido premium
                                            </h4>
                                            <p style={{ color: TEXT_MED, fontSize: 14.5, lineHeight: 1.7, marginBottom: 24 }}>
                                                Suscríbete para desbloquear este prompt y los más de 1.000 del banco.
                                            </p>

                                            <Link
                                                to="/pricing"
                                                style={{
                                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                                                    backgroundColor: YELLOW, color: '#1a1500', fontWeight: 600, fontSize: 15,
                                                    padding: '14px 24px', borderRadius: 12, textDecoration: 'none',
                                                    marginBottom: 12,
                                                }}
                                            >
                                                Desbloquear por 7 USD/mes
                                                <ArrowRight size={15} />
                                            </Link>
                                            <Link
                                                to={`/login?redirect=/prompts/${id}`}
                                                style={{ fontSize: 13, color: TEXT_MED, textDecoration: 'none' }}
                                            >
                                                Ya tengo cuenta
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '26px 24px', overflowX: 'auto' }}>
                                    <pre
                                        style={{
                                            whiteSpace: 'pre-wrap', wordBreak: 'break-word', userSelect: 'all',
                                            fontSize: 14.5, lineHeight: 1.85, color: TEXT,
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
                                style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '18px 20px' }}
                            >
                                <AlertCircle size={16} style={{ color: '#c98200', flexShrink: 0, marginTop: 2 }} />
                                <p style={{ color: TEXT_MED, fontSize: 14, lineHeight: 1.7 }}>
                                    <strong style={{ color: TEXT, fontWeight: 600 }}>Cómo usarlo: </strong>
                                    reemplaza los parámetros entre{' '}
                                    <code
                                        style={{
                                            backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 6,
                                            padding: '1px 6px', fontSize: 13, color: TEXT,
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
                    <div className="flex flex-col gap-3 lg:sticky" style={{ top: 84 }}>

                        {/* Guardar */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                backgroundColor: isSaved ? '#eefbf2' : BG,
                                border: `1px solid ${isSaved ? '#c3ecd1' : BORDER}`,
                                color: isSaved ? GREEN : TEXT,
                                borderRadius: 12, padding: '12px 18px', fontSize: 14, fontWeight: 600,
                                cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
                                transition: 'background .15s, border-color .15s',
                            }}
                        >
                            {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                            {isSaved ? 'Guardado' : 'Guardar prompt'}
                        </button>

                        {/* Detalles */}
                        <div style={{ backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '18px 20px' }}>
                            <h3 style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: TEXT_DIM, marginBottom: 14 }}>
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
                                            <span style={{ fontSize: 12.5, color: TEXT_DIM }}>{row.k}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: row.accent ? '#a86a00' : TEXT }}>
                                                {row.v}
                                            </span>
                                        </div>
                                        {i < arr.length - 1 && <div style={{ height: 1, backgroundColor: BORDER }} />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* CTA si no está suscrito */}
                        {!isSubscribed && !isLocked && (
                            <div
                                style={{
                                    backgroundColor: '#fff7e8', border: '1px solid #fbe3b0', borderRadius: 18,
                                    padding: '18px 20px', textAlign: 'center',
                                }}
                            >
                                <p style={{ fontSize: 13.5, lineHeight: 1.65, color: '#8a5b00', marginBottom: 14 }}>
                                    Desbloquea <strong style={{ fontWeight: 700 }}>+1.000 prompts premium</strong> y el generador con IA.
                                </p>
                                <Link
                                    to="/pricing"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        backgroundColor: YELLOW, color: '#1a1500', fontWeight: 600, fontSize: 14,
                                        padding: '12px 18px', borderRadius: 11, textDecoration: 'none',
                                    }}
                                >
                                    Ver el plan — 7 USD/mes
                                </Link>
                            </div>
                        )}

                        {/* Volver */}
                        <Link
                            to="/prompts"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                padding: '11px', borderRadius: 12,
                                border: `1px solid ${BORDER}`, backgroundColor: BG_WARM,
                                fontSize: 13.5, color: TEXT_MED, textDecoration: 'none',
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
