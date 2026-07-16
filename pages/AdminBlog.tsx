import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isAdminUser } from '../lib/supabase';
import { BlogPost } from '../types';
import BlogContent from '../components/BlogContent';
import { Plus, Pencil, Trash2, ArrowLeft, Check, AlertCircle, Search, Lock, Upload, ImagePlus, Loader2 } from 'lucide-react';

const EMPTY_FORM = {
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    category: '',
    content: '',
    cover_image_url: '',
    published: false,
};

type FormState = typeof EMPTY_FORM;

const slugify = (s: string) =>
    s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // quita tildes (marcas diacríticas tras NFD)
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');

// Sube una imagen al bucket blog-images y devuelve su URL pública
const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
        .from('blog-images')
        .upload(path, file, { cacheControl: '31536000', upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
    return data.publicUrl;
};

const AdminBlog: React.FC = () => {
    const [authState, setAuthState] = useState<'loading' | 'anonymous' | 'forbidden' | 'admin'>('loading');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState<FormState | null>(null);
    const [slugTouched, setSlugTouched] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingInline, setUploadingInline] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedFlash, setSavedFlash] = useState(false);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const inlineInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) setAuthState('anonymous');
            else if (!isAdminUser(session.user)) setAuthState('forbidden');
            else setAuthState('admin');
        });
    }, []);

    const fetchPosts = async () => {
        setLoadingPosts(true);
        const { data, error: err } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });
        if (err) setError(err.message);
        else setPosts((data as BlogPost[]) ?? []);
        setLoadingPosts(false);
    };

    useEffect(() => {
        if (authState === 'admin') fetchPosts();
    }, [authState]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return posts.filter(p =>
            !q || p.title.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
        );
    }, [posts, search]);

    const openNew = () => {
        setError(null);
        setSlugTouched(false);
        setForm({ ...EMPTY_FORM });
    };

    const openEdit = (p: BlogPost) => {
        setError(null);
        setSlugTouched(true);
        setForm({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt ?? '',
            category: p.category ?? '',
            content: p.content ?? '',
            cover_image_url: p.cover_image_url ?? '',
            published: p.published,
        });
    };

    const handleTitleChange = (title: string) => {
        if (!form) return;
        // El slug se autogenera desde el título hasta que el admin lo edite a mano
        setForm({ ...form, title, slug: slugTouched ? form.slug : slugify(title) });
    };

    const handleCoverUpload = async (file: File | undefined) => {
        if (!file || !form) return;
        setUploadingCover(true);
        setError(null);
        try {
            const url = await uploadImage(file);
            setForm(f => f ? { ...f, cover_image_url: url } : f);
        } catch (e: any) {
            setError(`Error al subir la imagen: ${e.message ?? e}`);
        } finally {
            setUploadingCover(false);
            if (coverInputRef.current) coverInputRef.current.value = '';
        }
    };

    // Sube una imagen y la inserta como markdown en la posición del cursor
    const handleInlineUpload = async (file: File | undefined) => {
        if (!file || !form) return;
        setUploadingInline(true);
        setError(null);
        try {
            const url = await uploadImage(file);
            const snippet = `\n\n![Descripción de la imagen](${url})\n\n`;
            const textarea = contentRef.current;
            const pos = textarea ? textarea.selectionStart : form.content.length;
            setForm(f => f ? { ...f, content: f.content.slice(0, pos) + snippet + f.content.slice(pos) } : f);
        } catch (e: any) {
            setError(`Error al subir la imagen: ${e.message ?? e}`);
        } finally {
            setUploadingInline(false);
            if (inlineInputRef.current) inlineInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        if (!form) return;
        if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
            setError('Título, slug y contenido son obligatorios.');
            return;
        }
        setSaving(true);
        setError(null);

        const payload = {
            title: form.title.trim(),
            slug: slugify(form.slug),
            excerpt: form.excerpt.trim() || null,
            category: form.category.trim().toLowerCase() || null,
            content: form.content.replace(/\r\n/g, '\n').trim(),
            cover_image_url: form.cover_image_url.trim() || null,
            published: form.published,
        };

        const { error: err } = form.id
            ? await supabase.from('blog_posts').update(payload).eq('id', form.id)
            : await supabase.from('blog_posts').insert(payload);

        setSaving(false);
        if (err) {
            setError(err.code === '23505' ? 'Ya existe un post con ese slug. Cámbialo.' : err.message);
            return;
        }
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
        setForm(null);
        fetchPosts();
    };

    const handleDelete = async (p: BlogPost) => {
        if (!window.confirm(`¿Eliminar "${p.title}"? Esta acción no se puede deshacer.`)) return;
        const { error: err } = await supabase.from('blog_posts').delete().eq('id', p.id);
        if (err) setError(err.message);
        else fetchPosts();
    };

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
                    to="/login?redirect=/admin/blog"
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
            {/* Pestañas del panel */}
            <div className="mb-10 flex items-center gap-2">
                <Link
                    to="/admin"
                    className="rounded-full border border-border px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:border-accent hover:text-foreground"
                >
                    Prompts
                </Link>
                <span className="rounded-full border border-accent bg-accent/10 px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-accent">
                    Blog
                </span>
            </div>

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
                        {form.id ? 'Editar post' : 'Nuevo post'}
                    </h1>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Formulario */}
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Título *</label>
                                <input
                                    value={form.title}
                                    onChange={e => handleTitleChange(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Slug (URL) *</label>
                                    <input
                                        value={form.slug}
                                        onChange={e => { setSlugTouched(true); setForm({ ...form, slug: e.target.value }); }}
                                        placeholder="mi-articulo"
                                        className="w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-xs text-foreground focus:border-accent focus:outline-none"
                                    />
                                    <p className="mt-1.5 text-[11px] text-muted-foreground">/blog/{slugify(form.slug) || '…'}</p>
                                </div>
                                <div>
                                    <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Categoría</label>
                                    <input
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        placeholder="guías, noticias, tutoriales…"
                                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Extracto (aparece en las cards y en Google)</label>
                                <textarea
                                    value={form.excerpt}
                                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                    rows={2}
                                    className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                                />
                            </div>

                            {/* Imagen de portada */}
                            <div>
                                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Imagen de portada</label>
                                <div className="flex flex-wrap items-center gap-3">
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => handleCoverUpload(e.target.files?.[0])}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => coverInputRef.current?.click()}
                                        disabled={uploadingCover}
                                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-accent disabled:opacity-50"
                                    >
                                        {uploadingCover ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                        {uploadingCover ? 'Subiendo…' : 'Subir imagen'}
                                    </button>
                                    {form.cover_image_url && (
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, cover_image_url: '' })}
                                            className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-brand-red"
                                        >
                                            Quitar
                                        </button>
                                    )}
                                </div>
                                {form.cover_image_url && (
                                    <img
                                        src={form.cover_image_url}
                                        alt="Portada"
                                        className="mt-3 aspect-[16/9] w-full max-w-sm rounded-xl border border-border/60 object-cover"
                                    />
                                )}
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Contenido *</label>
                                    <div>
                                        <input
                                            ref={inlineInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => handleInlineUpload(e.target.files?.[0])}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => inlineInputRef.current?.click()}
                                            disabled={uploadingInline}
                                            title="Sube una imagen y la inserta donde esté el cursor"
                                            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-accent disabled:opacity-50"
                                        >
                                            {uploadingInline ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
                                            {uploadingInline ? 'Subiendo…' : 'Insertar imagen'}
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    ref={contentRef}
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    rows={18}
                                    spellCheck={false}
                                    placeholder={'## Un encabezado\n\nUn párrafo normal con **negrita** y [un enlace](https://...).\n\n- Un punto de lista\n- Otro punto'}
                                    className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
                                />
                                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                                    Formato: <span className="font-mono">## encabezado</span> · <span className="font-mono">**negrita**</span> · <span className="font-mono">- lista</span> · <span className="font-mono">&gt; cita</span> · <span className="font-mono">[texto](url)</span>. Separa párrafos con una línea en blanco.
                                </p>
                            </div>

                            <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-foreground">
                                <input
                                    type="checkbox"
                                    checked={form.published}
                                    onChange={e => setForm({ ...form, published: e.target.checked })}
                                    className="h-4 w-4 accent-[#C96A3C]"
                                />
                                Publicado (visible en la web)
                            </label>

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
                                    {saving ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Crear post'}
                                </button>
                                <button
                                    onClick={() => setForm(null)}
                                    className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>

                        {/* Vista previa: replica el render de BlogPost */}
                        <div>
                            <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                Vista previa (así se verá en la web)
                            </p>
                            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                                <div className="max-h-[80vh] overflow-y-auto p-6 md:p-8">
                                    {form.cover_image_url && (
                                        <img src={form.cover_image_url} alt="" className="mb-6 aspect-[16/9] w-full rounded-xl object-cover" />
                                    )}
                                    <h2 className="mb-6 text-2xl font-medium leading-tight tracking-tight text-foreground">
                                        {form.title || 'Título del post…'}
                                    </h2>
                                    {form.content
                                        ? <BlogContent content={form.content} />
                                        : <p className="text-sm text-muted-foreground">Escribe el contenido para ver la vista previa…</p>}
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
                            <h1 className="text-2xl font-medium tracking-tight text-foreground">Administrar blog</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {posts.length} posts · {posts.filter(p => p.published).length} publicados
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
                            Nuevo post
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="relative sm:max-w-xs">
                            <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por título o categoría…"
                                className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-accent focus:outline-none"
                            />
                        </div>
                    </div>

                    {error && !form && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-red/40 bg-brand-red/10 p-4 text-sm text-foreground">
                            <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-brand-red" />
                            <p>{error}</p>
                        </div>
                    )}

                    {loadingPosts ? (
                        <p className="py-16 text-center text-sm text-muted-foreground">Cargando posts…</p>
                    ) : (
                        <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card">
                            {filtered.map(p => (
                                <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                                    {p.cover_image_url ? (
                                        <img src={p.cover_image_url} alt="" className="h-12 w-20 flex-shrink-0 rounded-lg border border-border/50 object-cover" />
                                    ) : (
                                        <div className="flex h-12 w-20 flex-shrink-0 items-center justify-center rounded-lg border border-border/50 bg-secondary text-xs text-muted-foreground">
                                            Sin foto
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-grow">
                                        <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {p.category || 'sin categoría'}
                                            {p.published
                                                ? <span className="ml-2 text-accent">Publicado</span>
                                                : <span className="ml-2 text-muted-foreground/70">Borrador</span>}
                                            <span className="ml-2 font-mono">/blog/{p.slug}</span>
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
                                <p className="py-16 text-center text-sm text-muted-foreground">
                                    {posts.length === 0 ? 'Todavía no hay posts. Crea el primero.' : 'No hay posts que coincidan con la búsqueda.'}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminBlog;
