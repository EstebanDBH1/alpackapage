/* Estado de acceso del visitante, compartido por toda la interfaz.

   Antes cada página preguntaba por su cuenta si había suscripción, y las
   piezas que no preguntaban (tarjetas del catálogo, home, guardados, menú)
   pintaban candados y botones de "Desbloquear" a quien ya había pagado.
   Este hook es la única fuente: una sola consulta, repartida a todos.

   Se guarda en sessionStorage para que al navegar o recargar la interfaz
   pinte bien desde el primer render, sin parpadeo de candados. Es solo UI:
   un valor viejo o manipulado no desbloquea nada, porque el contenido
   premium lo decide el servidor (`has_library_access()` y `generate-prompt`). */

import { useEffect, useSyncExternalStore } from 'react';
import { supabase } from './supabase';
import { hasLibraryAccess, hasGeneratorAccess } from './access';

type Snapshot = {
    /** Falso hasta saber quién es el visitante y qué plan tiene. */
    resolved: boolean;
    userId: string | null;
    status: string | null;
};

const STORAGE_KEY = 'alp-access-v1';

const readStored = (): Snapshot => {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
            const { userId, status } = JSON.parse(raw);
            if (typeof userId === 'string') {
                return { resolved: true, userId, status: typeof status === 'string' ? status : null };
            }
        }
    } catch { /* sin sessionStorage: se resuelve con la consulta */ }
    return { resolved: false, userId: null, status: null };
};

let snapshot: Snapshot = readStored();
const listeners = new Set<() => void>();

const publish = (next: Snapshot) => {
    const changed = next.resolved !== snapshot.resolved
        || next.userId !== snapshot.userId
        || next.status !== snapshot.status;
    if (!changed) return;
    snapshot = next;
    try {
        if (next.userId) sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: next.userId, status: next.status }));
        else sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* solo memoria */ }
    listeners.forEach(l => l());
};

let inflight: Promise<void> | null = null;

/** Vuelve a consultar el plan. Las llamadas simultáneas comparten petición. */
export const refreshAccess = (): Promise<void> => {
    if (inflight) return inflight;

    inflight = (async () => {
        // getSession lee del almacenamiento local (sin round-trip al servidor de auth)
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        if (!user) {
            publish({ resolved: true, userId: null, status: null });
            return;
        }

        const { data, error } = await supabase
            .from('subscriptions')
            .select('subscription_status')
            .eq('customer_id', user.id)
            .maybeSingle();

        // Si la consulta falla (red caída) se conserva lo que ya se sabía de
        // este usuario: mejor eso que volver a enseñarle candados a quien pagó.
        if (error) {
            publish({
                resolved: true,
                userId: user.id,
                status: snapshot.userId === user.id ? snapshot.status : null,
            });
            return;
        }
        publish({ resolved: true, userId: user.id, status: data?.subscription_status ?? null });
    })().finally(() => { inflight = null; });

    return inflight;
};

let authWatched = false;
const watchAuth = () => {
    if (authWatched) return;
    authWatched = true;
    supabase.auth.onAuthStateChange((_event, session) => {
        const userId = session?.user?.id ?? null;
        if (userId === snapshot.userId && snapshot.resolved) return;
        // Al cambiar de cuenta, lo del usuario anterior deja de valer al instante.
        if (userId !== snapshot.userId) publish({ resolved: false, userId: null, status: null });
        // Fuera del callback: supabase-js no admite llamadas propias dentro de él.
        setTimeout(() => { refreshAccess(); }, 0);
    });
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
};
const getSnapshot = () => snapshot;

export type Access = {
    /** Falso mientras aún no se sabe el plan (primer render sin caché). */
    resolved: boolean;
    signedIn: boolean;
    /** Biblioteca completa desbloqueada. */
    subscribed: boolean;
    /** Generador con IA desbloqueado. */
    generator: boolean;
};

export const useAccess = (): Access => {
    const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    // Cada página que se monta revalida (una sola petición aunque la pidan
    // varios componentes a la vez): así un pago recién hecho se refleja al navegar.
    useEffect(() => {
        watchAuth();
        refreshAccess();
    }, []);

    return {
        resolved: snap.resolved,
        signedIn: !!snap.userId,
        subscribed: hasLibraryAccess(snap.status),
        generator: hasGeneratorAccess(snap.status),
    };
};
