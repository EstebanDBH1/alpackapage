// Listado ligero de prompts (sin `content`) compartido por el catálogo
// (/prompts) y el marquee de la home. Cachea en memoria + sessionStorage:
// la primera visita descarga ~90 KB una vez y el resto de navegaciones
// renderizan al instante (stale-while-revalidate).

import { supabase } from './supabase';
import { Prompt } from '../types';

const CACHE_KEY = 'prompts-list-v1';

let memoryCache: Prompt[] | null = null;
let inflight: Promise<Prompt[] | null> | null = null;

// Lectura síncrona de la caché (memoria primero, luego sessionStorage)
export const getCachedPromptsList = (): Prompt[] | null => {
    if (memoryCache) return memoryCache;
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
            memoryCache = JSON.parse(raw) as Prompt[];
            return memoryCache;
        }
    } catch { /* sessionStorage no disponible: seguimos sin caché */ }
    return null;
};

// Trae la lista fresca (deduplicando peticiones simultáneas) y actualiza la caché
export const fetchPromptsList = (): Promise<Prompt[] | null> => {
    if (inflight) return inflight;

    inflight = Promise.resolve(supabase.rpc('get_prompts_list')).then(({ data, error }) => {
        inflight = null;
        if (error || !data) return null;
        memoryCache = data as Prompt[];
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* cuota llena: solo memoria */ }
        return memoryCache;
    });

    return inflight;
};
