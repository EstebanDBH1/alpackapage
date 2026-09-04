import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Bookmark, ArrowRight, Lock, Trash2 } from 'lucide-react';
import {
    BG, PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, AMBER,
    SANS, MONO, CategoryBadge,
} from '../components/darkKit';

/* Prompts guardados — página normal: cabecera, contador y la rejilla.
   Antes traía su propia barra sticky encima del header de la app (dos
   navegaciones apiladas) y repetía el título dentro de una tarjeta que
   envolvía la lista. Ahora el header compartido hace de navegación y
   aquí solo va el contenido. */

type SavedPromptInfo = {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    is_premium: boolean;
};

type SavedRow = {
    id: string;
    prompt_id: string;
    prompts: SavedPromptInfo | null;
};

/* El tipo que infiere supabase-js para el join dice array, pero al ser una
   relación de muchos-a-uno lo que llega es un objeto. Se normalizan ambas
   formas para no depender de cuál devuelva. */
const normalizeJoin = (value: unknown): SavedPromptInfo | null => {
    if (!value) return null;
    const info = Array.isArray(value) ? value[0] : value;
    return (info as SavedPromptInfo) ?? null;
};

const SavedPromptsPage: React.FC = () => {
    const navigate = useNavigate();
    const [rows, setRows] = useState<SavedRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            // getSession lee la sesión local: sin round-trip de red
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) { navigate('/login?redirect=/guardados', { replace: true }); return; }

            const { data } = await supabase
                .from('saved_prompts')
                .select('id, prompt_id, prompts ( id, title, description, category, is_premium )')
                .eq('user_id', user.id)
                .order('id', { ascending: false });

            if (cancelled) return;
            // Un prompt borrado del catálogo deja la fila con `prompts` a null
            const normalized: SavedRow[] = (data ?? []).map(r => ({
                id: String((r as { id: unknown }).id),
                prompt_id: String((r as { prompt_id: unknown }).prompt_id),
                prompts: normalizeJoin((r as { prompts: unknown }).prompts),
            }));
            setRows(normalized.filter(r => r.prompts));
            setLoading(false);
        };

        load();
        return () => { cancelled = true; };
    }, [navigate]);

    // Quitar de guardados sin salir de la página, como en cualquier web
    const handleRemove = async (rowId: string) => {
        setRemoving(rowId);
        const { error } = await supabase.from('saved_prompts').delete().eq('id', rowId);
        if (!error) setRows(prev => prev.filter(r => r.id !== rowId));
        setRemoving(null);
    };

    const eyebrow: React.CSSProperties = {
        fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: DIM,
    };

    return (
        <div style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: SANS }}>
            <main className="mx-auto max-w-6xl px-5 sm:px-8" style={{ paddingTop: 48, paddingBottom: 72 }}>

                {/* Cabecera */}
                <p style={{ ...eyebrow, marginBottom: 14 }}>Tu colección</p>
                <div className="flex flex-wrap items-baseline justify-between gap-3" style={{ marginBottom: 32 }}>
                    <div>
                        <h1 style={{
                            fontWeight: 700, fontSize: 'clamp(1.7rem, 3.6vw, 2.3rem)',
                            letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 8,
                        }}>
                            Prompts guardados
                        </h1>
                        <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.7 }}>
                            {loading
                                ? 'Cargando tu colección…'
                                : rows.length === 0
                                    ? 'Aquí aparecerán los prompts que marques como favoritos.'
                                    : `${rows.length} ${rows.length === 1 ? 'prompt guardado' : 'prompts guardados'}.`}
                        </p>
                    </div>
                    {!loading && rows.length > 0 && (
                        <Link
                            to="/prompts"
                            className="inline-flex items-center gap-1.5"
                            style={{ fontSize: 13.5, color: MUTED, textDecoration: 'none' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = MUTED; }}
                        >
                            Explorar el catálogo <ArrowRight size={14} />
                        </Link>
                    )}
                </div>

                {/* Cargando */}
                {loading && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse"
                                style={{ height: 132, borderRadius: 14, backgroundColor: PANEL, border: `1px solid ${BORDER_SOFT}` }}
                            />
                        ))}
                    </div>
                )}

                {/* Rejilla */}
                {!loading && rows.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {rows.map(row => {
                            const p = row.prompts!;
                            return (
                                <div
                                    key={row.id}
                                    className="relative flex flex-col"
                                    style={{
                                        backgroundColor: CARD, border: `1px solid ${BORDER_SOFT}`,
                                        borderRadius: 14, padding: '16px 17px',
                                        transition: 'border-color .15s',
                                        opacity: removing === row.id ? 0.45 : 1,
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER_SOFT; }}
                                >
                                    <div className="flex items-start justify-between gap-2" style={{ marginBottom: 11 }}>
                                        <CategoryBadge category={p.category} />
                                        {p.is_premium && (
                                            <span
                                                className="inline-flex items-center gap-1"
                                                style={{
                                                    fontFamily: MONO, fontSize: 9.5, fontWeight: 700,
                                                    letterSpacing: '0.12em', textTransform: 'uppercase', color: AMBER,
                                                }}
                                            >
                                                <Lock size={9} /> premium
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        to={`/prompts/${p.id}`}
                                        style={{ textDecoration: 'none', flex: 1 }}
                                    >
                                        <h2
                                            className="line-clamp-2"
                                            style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.4, color: TEXT, marginBottom: 7 }}
                                        >
                                            {p.title}
                                        </h2>
                                        {p.description && (
                                            <p className="line-clamp-2" style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
                                                {p.description}
                                            </p>
                                        )}
                                    </Link>

                                    <div
                                        className="flex items-center justify-between"
                                        style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${BORDER_SOFT}` }}
                                    >
                                        <Link
                                            to={`/prompts/${p.id}`}
                                            className="inline-flex items-center gap-1.5"
                                            style={{ fontSize: 12.5, fontWeight: 600, color: MUTED, textDecoration: 'none' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = MUTED; }}
                                        >
                                            Abrir <ArrowRight size={12} />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(row.id)}
                                            disabled={removing === row.id}
                                            title="Quitar de guardados"
                                            aria-label={`Quitar "${p.title}" de guardados`}
                                            className="inline-flex items-center justify-center"
                                            style={{
                                                width: 28, height: 28, borderRadius: 8,
                                                background: 'none', border: `1px solid transparent`,
                                                color: DIM, cursor: removing === row.id ? 'default' : 'pointer',
                                                transition: 'color .15s, border-color .15s',
                                            }}
                                            onMouseEnter={e => {
                                                const el = e.currentTarget as HTMLElement;
                                                el.style.color = TEXT; el.style.borderColor = BORDER;
                                            }}
                                            onMouseLeave={e => {
                                                const el = e.currentTarget as HTMLElement;
                                                el.style.color = DIM; el.style.borderColor = 'transparent';
                                            }}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Vacío */}
                {!loading && rows.length === 0 && (
                    <div
                        className="text-center"
                        style={{
                            border: `1px dashed ${BORDER}`, borderRadius: 16, backgroundColor: CARD,
                            padding: '56px 24px',
                        }}
                    >
                        <div
                            className="mx-auto"
                            style={{
                                width: 46, height: 46, borderRadius: 14, marginBottom: 18,
                                backgroundColor: PANEL, border: `1px solid ${BORDER}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <Bookmark size={19} style={{ color: MUTED }} />
                        </div>
                        <p style={{ fontSize: 15.5, fontWeight: 600, color: TEXT, marginBottom: 7 }}>
                            Todavía no has guardado ningún prompt
                        </p>
                        <p style={{ fontSize: 13.5, color: MUTED, marginBottom: 24, lineHeight: 1.7 }}>
                            Pulsa el marcador en cualquier prompt del catálogo y lo tendrás aquí.
                        </p>
                        <Link
                            to="/prompts"
                            className="inline-flex items-center gap-2"
                            style={{
                                backgroundColor: TEXT, color: '#000', fontWeight: 700, fontSize: 14,
                                padding: '12px 22px', borderRadius: 10, textDecoration: 'none',
                            }}
                        >
                            Explorar el catálogo <ArrowRight size={14} />
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SavedPromptsPage;
