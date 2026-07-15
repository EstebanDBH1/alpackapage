import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isAdminUser } from '../lib/supabase';
import { Prompt } from '../types';
import { Plus, Pencil, Trash2, ArrowLeft, Check, AlertCircle, Search, Lock } from 'lucide-react';

const EMPTY_FORM = {
    id: '',
    title: '',
    description: '',
    category: '',
    content: '',
    is_premium: true,
    image_url: '',
};

type FormState = typeof EMPTY_FORM;

const Admin: React.FC = () => {
    const [authState, setAuthState] = useState<'loading' | 'anonymous' | 'forbidden' | 'admin'>('loading');
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loadingPrompts, setLoadingPrompts] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedFlash, setSavedFlash] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) setAuthState('anonymous');
            else if (!isAdminUser(session.user)) setAuthState('forbidden');
            else setAuthState('admin');
        });
    }, []);

    const fetchPrompts = async () => {
        setLoadingPrompts(true);
        const { data, error: err } = await supabase
            .from('prompts')
            .select('*')
            .order('created_at', { ascending: false });
        if (err) setError(err.message);
        else setPrompts((data as Prompt[]) ?? []);
        setLoadingPrompts(false);
    };

    useEffect(() => {
        if (authState === 'admin') fetchPrompts();
    }, [authState]);

    const categories = useMemo(
        () => Array.from(new Set(prompts.map(p => p.category))).sort(),
        [prompts]
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return prompts.filter(p =>
            (!categoryFilter || p.category === categoryFilter) &&
            (!q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
        );
    }, [prompts, search, categoryFilter]);

    const openNew = () => {
        setError(null);
        setForm({ ...EMPTY_FORM });
    };

    const openEdit = (p: Prompt) => {
        setError(null);
        setForm({
            id: p.id,
            title: p.title,
            description: p.description ?? '',
            category: p.category,
            content: p.content ?? '',
            is_premium: p.is_premium,
            image_url: p.image_url ?? '',
        });
    };

    const handleSave = async () => {
        if (!form) return;
        if (!form.title.trim() || !form.category.trim() || !form.content.trim()) {
            setError('Título, categoría y contenido son obligatorios.');
            return;
        }
        setSaving(true);
        setError(null);

        const payload = {
            title: form.title.trim(),
            description: form.description.trim() || null,
            category: form.category.trim(),
            content: form.content.replace(/\r\n/g, '\n').trim(),
            is_premium: form.is_premium,
            image_url: form.image_url.trim() || null,
        };

        const { error: err } = form.id
            ? await supabase.from('prompts').update(payload).eq('id', form.id)
            : await supabase.from('prompts').insert(payload);

        setSaving(false);
        if (err) {
            setError(err.message);
            return;
        }
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
        setForm(null);
        fetchPrompts();
    };

    const handleDelete = async (p: Prompt) => {
        if (!window.confirm(`¿Eliminar "${p.title}"? Esta acción no se puede deshacer.`)) return;
        const { error: err } = await supabase.from('prompts').delete().eq('id', p.id);
        if (err) setError(err.message);
        else fetchPrompts();
    };

    // El contenido debería tener saltos de línea: sin ellos se renderiza como un bloque pegado.
    const contentHasNoBreaks = !!form && form.content.trim().length > 200 && !form.content.includes('\n');

    if (authState === 'loading') {
        return <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Cargando…</div>;
    }

    if (authState === 'anonymous') {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
                    <Lock size={22} />
                </div>
                <p className="text-sm text-muted-foreground">Necesitas iniciar sesión para acceder.</p>
                <Link
                    to="/login?redirect=/admin"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    if (authState === 'forbidden') {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
                <p className="text-sm text-muted-foreground">Esta página no existe.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
            {form ? (
                /* ---------- Editor ---------- */
                <div>
                    <button
                        onClick={() => setForm(null)}
                        className="mb-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft size={13} />
                        Volver al listado
                    </button>

                    <h1 className="mb-8 text-2xl font-medium tracking-tight text-foreground">
                        {form.id ? 'Editar prompt' : 'Nuevo prompt'}
                    </h1>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Formulario */}
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Título *</label>
                                <input
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Categoría *</label>
                                    <input
                                        list="admin-categories"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                                    />
                                    <datalist id="admin-categories">
                                        {categories.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-foreground">
                                        <input
                                            type="checkbox"
                                            checked={form.is_premium}
                                            onChange={e => setForm({ ...form, is_premium: e.target.checked })}
                                            className="h-4 w-4 accent-[#C96A3C]"
                                        />
                                        Premium
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Descripción corta</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">URL de imagen (opcional)</label>
                                <input
                                    value={form.image_url}
                                    onChange={e => setForm({ ...form, image_url: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Contenido *</label>
                                <textarea
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    rows={18}
                                    spellCheck={false}
                                    className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
                                />
                            </div>

                            {contentHasNoBreaks && (
                                <div className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-foreground">
                                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-accent" />
                                    <p>
                                        El contenido no tiene saltos de línea: se verá como un bloque de texto pegado.
                                        Separa los párrafos y los puntos numerados con líneas en blanco (mira la vista previa).
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-start gap-3 rounded-xl border border-brand-red/40 bg-brand-red/10 p-4 text-sm text-foreground">
                                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-brand-red" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                                >
                                    {saving ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Crear prompt'}
                                </button>
                                <button
                                    onClick={() => setForm(null)}
                                    className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>

                        {/* Vista previa: replica exacta del render de PromptDetail */}
                        <div>
                            <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                Vista previa (así se verá en la web)
                            </p>
                            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                                <div className="overflow-x-auto p-6 md:p-8">
                                    <pre className="select-all whitespace-pre-wrap break-words font-mono text-sm leading-[1.8] text-foreground/90 md:text-base">
                                        {form.content || 'Escribe el contenido para ver la vista previa…'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ---------- Listado ---------- */
                <div>
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-medium tracking-tight text-foreground">Administrar prompts</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {prompts.length} prompts en la librería
                                {savedFlash && (
                                    <span className="ml-3 inline-flex items-center gap-1 text-accent">
                                        <Check size={13} /> Guardado
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={openNew}
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                        >
                            <Plus size={15} />
                            Nuevo prompt
                        </button>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-3">
                        <div className="relative flex-grow sm:max-w-xs">
                            <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por título o categoría…"
                                className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-accent focus:outline-none"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {error && !form && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-red/40 bg-brand-red/10 p-4 text-sm text-foreground">
                            <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-brand-red" />
                            <p>{error}</p>
                        </div>
                    )}

                    {loadingPrompts ? (
                        <p className="py-16 text-center text-sm text-muted-foreground">Cargando prompts…</p>
                    ) : (
                        <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card">
                            {filtered.map(p => (
                                <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                                    <div className="min-w-0 flex-grow">
                                        <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {p.category}
                                            {p.is_premium && <span className="ml-2 text-accent">Premium</span>}
                                            {p.content && !p.content.includes('\n') && (
                                                <span className="ml-2 text-brand-red">⚠ sin saltos de línea</span>
                                            )}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => openEdit(p)}
                                        className="flex-shrink-0 rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                                        title="Editar"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p)}
                                        className="flex-shrink-0 rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:border-brand-red hover:text-brand-red"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <p className="py-16 text-center text-sm text-muted-foreground">No hay prompts que coincidan con la búsqueda.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Admin;
