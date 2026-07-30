import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isAdminUser } from '../lib/supabase';
import { Search, Lock, RefreshCw, AlertCircle } from 'lucide-react';

interface SubscriberRow {
    email: string;
    subscription_id: string;
    subscription_status: string;
    price_id: string;
    cancel_at_period_end: boolean;
    current_period_end: string | null;
    created_at: string;
    updated_at: string;
}

const PRICE_LABELS: Record<string, string> = {
    'pri_01kjneczae0gfxdwde1q1h0app': '$4 (anclado)',
    'pri_01kyrhpzmcm7j0hnvcyvb0q9zy': '$7',
};

const STATUS_META: Record<string, { label: string; className: string }> = {
    active: { label: 'Activa', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
    trialing: { label: 'En prueba', className: 'border-sky-500/40 bg-sky-500/10 text-sky-400' },
    past_due: { label: 'Pago atrasado', className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
    paused: { label: 'Pausada', className: 'border-border bg-secondary text-muted-foreground' },
    canceled: { label: 'Cancelada', className: 'border-border bg-secondary text-muted-foreground' },
    cancelled: { label: 'Cancelada', className: 'border-border bg-secondary text-muted-foreground' },
};

const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const AdminSubscribers: React.FC = () => {
    const [authState, setAuthState] = useState<'loading' | 'anonymous' | 'forbidden' | 'admin'>('loading');
    const [rows, setRows] = useState<SubscriberRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        document.title = 'Suscriptores · Admin | alpacka.ai';
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) setAuthState('anonymous');
            else if (!isAdminUser(session.user)) setAuthState('forbidden');
            else setAuthState('admin');
        });
    }, []);

    const fetchSubscribers = async () => {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase.rpc('get_admin_subscribers');
        if (err) setError(err.message);
        else setRows((data as SubscriberRow[]) ?? []);
        setLoading(false);
    };

    useEffect(() => {
        if (authState === 'admin') fetchSubscribers();
    }, [authState]);

    const stats = useMemo(() => {
        const isLive = (r: SubscriberRow) => r.subscription_status === 'active' || r.subscription_status === 'trialing';
        return {
            activas: rows.filter(r => isLive(r) && !r.cancel_at_period_end).length,
            porCancelar: rows.filter(r => isLive(r) && r.cancel_at_period_end).length,
            atrasadas: rows.filter(r => r.subscription_status === 'past_due').length,
            canceladas: rows.filter(r => r.subscription_status === 'canceled' || r.subscription_status === 'cancelled').length,
        };
    }, [rows]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter(r =>
            (!q || r.email.toLowerCase().includes(q)) &&
            (!statusFilter ||
                (statusFilter === 'por_cancelar'
                    ? (r.subscription_status === 'active' || r.subscription_status === 'trialing') && r.cancel_at_period_end
                    : r.subscription_status === statusFilter))
        );
    }, [rows, search, statusFilter]);

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
                    to="/login?redirect=/admin/suscriptores"
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
                <Link
                    to="/admin/blog"
                    className="rounded-full border border-border px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:border-accent hover:text-foreground"
                >
                    Blog
                </Link>
                <span className="rounded-full border border-accent bg-accent/10 px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-accent">
                    Suscriptores
                </span>
            </div>

            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-medium tracking-tight text-foreground">Suscriptores</h1>
                <button
                    onClick={fetchSubscribers}
                    disabled={loading}
                    className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:border-accent hover:text-foreground disabled:opacity-50"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Actualizar
                </button>
            </div>

            {/* Resumen */}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Activas', value: stats.activas, filter: 'active' },
                    { label: 'Se cancelarán', value: stats.porCancelar, filter: 'por_cancelar' },
                    { label: 'Pago atrasado', value: stats.atrasadas, filter: 'past_due' },
                    { label: 'Canceladas', value: stats.canceladas, filter: 'canceled' },
                ].map(s => (
                    <button
                        key={s.filter}
                        onClick={() => setStatusFilter(statusFilter === s.filter ? '' : s.filter)}
                        className={`rounded-2xl border p-4 text-left transition ${
                            statusFilter === s.filter ? 'border-accent bg-accent/10' : 'border-border/70 bg-card hover:border-accent/40'
                        }`}
                    >
                        <p className="text-2xl font-medium text-foreground">{s.value}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
                    </button>
                ))}
            </div>

            {/* Buscador */}
            <div className="relative mb-6 max-w-sm">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por email…"
                    className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground focus:border-accent focus:outline-none"
                />
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {/* Tabla */}
            <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-border/60 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            <th className="px-5 py-4 font-normal">Email</th>
                            <th className="px-5 py-4 font-normal">Estado</th>
                            <th className="px-5 py-4 font-normal">Precio</th>
                            <th className="px-5 py-4 font-normal">Fin de período</th>
                            <th className="px-5 py-4 font-normal">Alta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Cargando suscriptores…</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Sin resultados.</td></tr>
                        ) : (
                            filtered.map(r => {
                                const meta = STATUS_META[r.subscription_status] ?? { label: r.subscription_status, className: 'border-border bg-secondary text-muted-foreground' };
                                const isLive = r.subscription_status === 'active' || r.subscription_status === 'trialing';
                                return (
                                    <tr key={r.subscription_id} className="border-b border-border/40 last:border-0">
                                        <td className="px-5 py-4 text-foreground">{r.email}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${meta.className}`}>
                                                    {meta.label}
                                                </span>
                                                {isLive && r.cancel_at_period_end && (
                                                    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-amber-400">
                                                        Se cancela el {formatDate(r.current_period_end)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-foreground">{PRICE_LABELS[r.price_id] ?? '—'}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{formatDate(r.current_period_end)}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{formatDate(r.created_at)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
                Datos de la tabla <code className="text-foreground/80">subscriptions</code> (sincronizada por webhooks de Paddle).
                Las filas "activas" con cartel de cancelación mantienen el acceso hasta el fin del período.
            </p>
        </div>
    );
};

export default AdminSubscribers;
