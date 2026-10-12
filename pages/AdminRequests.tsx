import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isAdminUser } from '../lib/supabase';
import AdminTabs, { NEW_REQUESTS_EVENT } from '../components/AdminTabs';
import {
    Lock, RefreshCw, AlertCircle, Mail, Trash2, Inbox, Search,
} from 'lucide-react';

/* Bandeja de solicitudes de servicio que llegan desde el formulario de
   /servicios (tabla service_requests). La RLS solo deja leer, cambiar el
   estado y borrar al admin; el público solo puede insertar. */

type Status = 'nuevo' | 'leido' | 'respondido' | 'archivado';

interface ServiceRequest {
    id: string;
    created_at: string;
    name: string;
    email: string;
    service: string | null;
    message: string;
    status: Status;
}

const STATUS_META: Record<Status, { label: string; className: string }> = {
    nuevo: { label: 'Nuevo', className: 'border-red-500/40 bg-red-500/10 text-red-400' },
    leido: { label: 'Leído', className: 'border-sky-500/40 bg-sky-500/10 text-sky-400' },
    respondido: { label: 'Respondido', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
    archivado: { label: 'Archivado', className: 'border-border bg-secondary text-muted-foreground' },
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const AdminRequests: React.FC = () => {
    const [authState, setAuthState] = useState<'loading' | 'anonymous' | 'forbidden' | 'admin'>('loading');
    const [rows, setRows] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<Status | ''>('');
    const [search, setSearch] = useState('');
    const [openId, setOpenId] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Solicitudes · Admin | alpacka.ai';
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) setAuthState('anonymous');
            else if (!isAdminUser(session.user)) setAuthState('forbidden');
            else setAuthState('admin');
        });
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
            .from('service_requests')
            .select('*')
            .order('created_at', { ascending: false });
        if (err) setError(err.message);
        else setRows((data as ServiceRequest[]) ?? []);
        setLoading(false);
        window.dispatchEvent(new Event(NEW_REQUESTS_EVENT));
    };

    useEffect(() => {
        if (authState === 'admin') fetchRequests();
    }, [authState]);

    const setStatus = async (id: string, status: Status) => {
        setRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
        const { error: err } = await supabase.from('service_requests').update({ status }).eq('id', id);
        if (err) {
            setError(err.message);
            fetchRequests();
            return;
        }
        window.dispatchEvent(new Event(NEW_REQUESTS_EVENT));
    };

    const toggleOpen = (r: ServiceRequest) => {
        const opening = openId !== r.id;
        setOpenId(opening ? r.id : null);
        // Abrir un mensaje nuevo lo marca como leído.
        if (opening && r.status === 'nuevo') setStatus(r.id, 'leido');
    };

    const handleDelete = async (r: ServiceRequest) => {
        if (!window.confirm(`¿Eliminar la solicitud de ${r.name}? Esta acción no se puede deshacer.`)) return;
        const { error: err } = await supabase.from('service_requests').delete().eq('id', r.id);
        if (err) setError(err.message);
        else fetchRequests();
    };

    const counts = useMemo(() => {
        const c: Record<Status, number> = { nuevo: 0, leido: 0, respondido: 0, archivado: 0 };
        rows.forEach(r => { c[r.status] += 1; });
        return c;
    }, [rows]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter(r =>
            (statusFilter ? r.status === statusFilter : r.status !== 'archivado') &&
            (!q || [r.name, r.email, r.message, r.service ?? ''].some(v => v.toLowerCase().includes(q)))
        );
    }, [rows, statusFilter, search]);

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
                    to="/login?redirect=/admin/solicitudes"
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
            <AdminTabs active="/admin/solicitudes" />

            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-medium tracking-tight text-foreground">Solicitudes de servicio</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Mensajes enviados desde el formulario de /servicios.</p>
                </div>
                <button
                    onClick={fetchRequests}
                    disabled={loading}
                    className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:border-accent hover:text-foreground disabled:opacity-50"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Actualizar
                </button>
            </div>

            {/* Resumen / filtros */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(Object.keys(STATUS_META) as Status[]).map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                        className={`rounded-2xl border p-4 text-left transition ${
                            statusFilter === s ? 'border-accent bg-accent/10' : 'border-border/70 bg-card hover:border-accent/40'
                        }`}
                    >
                        <p className={`text-2xl font-medium ${s === 'nuevo' && counts.nuevo > 0 ? 'text-red-400' : 'text-foreground'}`}>
                            {counts[s]}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{STATUS_META[s].label}s</p>
                    </button>
                ))}
            </div>

            <div className="relative mb-6 max-w-sm">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, email o mensaje…"
                    className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground focus:border-accent focus:outline-none"
                />
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {loading ? (
                <p className="py-16 text-center text-sm text-muted-foreground">Cargando solicitudes…</p>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card py-16 text-center">
                    <Inbox size={22} className="text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        {rows.length === 0 ? 'Todavía no ha llegado ninguna solicitud.' : 'No hay solicitudes con este filtro.'}
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card">
                    {filtered.map(r => {
                        const open = openId === r.id;
                        const meta = STATUS_META[r.status];
                        return (
                            <div key={r.id} className={r.status === 'nuevo' ? 'bg-red-500/[0.03]' : ''}>
                                <button
                                    onClick={() => toggleOpen(r)}
                                    className="flex w-full items-start gap-4 px-5 py-4 text-left"
                                >
                                    <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${r.status === 'nuevo' ? 'bg-red-500' : 'bg-transparent'}`} />
                                    <div className="min-w-0 flex-grow">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <p className={`text-sm text-foreground ${r.status === 'nuevo' ? 'font-semibold' : 'font-medium'}`}>{r.name}</p>
                                            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] ${meta.className}`}>
                                                {meta.label}
                                            </span>
                                            {r.service && (
                                                <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                                                    {r.service}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`mt-1 text-sm text-muted-foreground ${open ? '' : 'truncate'}`}>
                                            {open ? r.email : r.message}
                                        </p>
                                    </div>
                                    <span className="flex-shrink-0 font-mono text-[11px] text-muted-foreground">{formatDate(r.created_at)}</span>
                                </button>

                                {open && (
                                    <div className="px-5 pb-5 pl-11">
                                        <p className="mb-5 whitespace-pre-wrap break-words rounded-xl border border-border/70 bg-background p-4 text-sm leading-relaxed text-foreground">
                                            {r.message}
                                        </p>

                                        <div className="mb-5 flex flex-wrap gap-2">
                                            <a
                                                href={`mailto:${r.email}?subject=${encodeURIComponent('Tu solicitud en Alpacka Studio')}`}
                                                onClick={() => r.status !== 'respondido' && setStatus(r.id, 'respondido')}
                                                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                                            >
                                                <Mail size={13} /> {r.email}
                                            </a>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="mr-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Marcar como</span>
                                            {(Object.keys(STATUS_META) as Status[]).map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setStatus(r.id, s)}
                                                    disabled={r.status === s}
                                                    className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.15em] transition disabled:cursor-default ${
                                                        r.status === s ? STATUS_META[s].className : 'border-border text-muted-foreground hover:border-accent hover:text-foreground'
                                                    }`}
                                                >
                                                    {STATUS_META[s].label}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => handleDelete(r)}
                                                className="ml-auto rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-red-500 hover:text-red-400"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
                Los archivados se ocultan del listado; pulsa «Archivados» arriba para verlos.
            </p>
        </div>
    );
};

export default AdminRequests;
