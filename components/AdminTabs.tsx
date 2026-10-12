import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/* Pestañas compartidas del panel de admin. La de «Solicitudes» lleva un
   contador de mensajes sin leer (status = 'nuevo') que llegan desde el
   formulario de /servicios. Solo se monta en páginas ya verificadas como
   admin; aun así, la RLS de service_requests es la que protege los datos. */

const TABS = [
    { to: '/admin', label: 'Prompts' },
    { to: '/admin/blog', label: 'Blog' },
    { to: '/admin/suscriptores', label: 'Suscriptores' },
    { to: '/admin/solicitudes', label: 'Solicitudes' },
];

export const NEW_REQUESTS_EVENT = 'admin:service-requests-changed';

const AdminTabs: React.FC<{ active: string }> = ({ active }) => {
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        const load = () => {
            supabase
                .from('service_requests')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'nuevo')
                .then(({ count }) => setUnread(count ?? 0));
        };
        load();
        window.addEventListener(NEW_REQUESTS_EVENT, load);
        return () => window.removeEventListener(NEW_REQUESTS_EVENT, load);
    }, []);

    return (
        <div className="mb-10 flex flex-wrap items-center gap-2">
            {TABS.map(t => {
                const badge = t.to === '/admin/solicitudes' && unread > 0 && (
                    <span className="ml-2 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-normal text-white">
                        {unread}
                    </span>
                );
                return t.to === active ? (
                    <span
                        key={t.to}
                        className="inline-flex items-center rounded-full border border-accent bg-accent/10 px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-accent"
                    >
                        {t.label}{badge}
                    </span>
                ) : (
                    <Link
                        key={t.to}
                        to={t.to}
                        className="inline-flex items-center rounded-full border border-border px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:border-accent hover:text-foreground"
                    >
                        {t.label}{badge}
                    </Link>
                );
            })}
        </div>
    );
};

export default AdminTabs;
