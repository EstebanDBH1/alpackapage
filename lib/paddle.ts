// Inicialización de Paddle compartida por toda la app, usando el paquete
// oficial @paddle/paddle-js (mismo patrón que el starter kit de Paddle).
// Paddle solo puede inicializarse una vez por página: este módulo garantiza
// una única inicialización y reparte los eventos del checkout (totales,
// checkout.completed, etc.) a quien se suscriba.

import { initializePaddle, type Paddle, type PaddleEventData } from '@paddle/paddle-js';

type PaddleEventListener = (event: PaddleEventData) => void;

const listeners = new Set<PaddleEventListener>();
let loadPromise: Promise<Paddle> | null = null;

export const onPaddleEvent = (listener: PaddleEventListener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const loadPaddle = (): Promise<Paddle> => {
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
        const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim();
        if (!clientToken) throw new Error('Falta VITE_PADDLE_CLIENT_TOKEN');

        const paddle = await initializePaddle({
            token: clientToken,
            environment: clientToken.startsWith('test_') ? 'sandbox' : 'production',
            eventCallback: event => listeners.forEach(l => l(event)),
        });
        if (!paddle) throw new Error('Paddle.js no se pudo inicializar');
        return paddle;
    })();

    // Si la carga falla, permitir reintentar en la próxima llamada
    loadPromise.catch(() => { loadPromise = null; });

    return loadPromise;
};

// Formato de moneda según el idioma del navegador (patrón del starter kit).
// Los totales de los eventos del checkout ya vienen en decimal.
export const formatMoney = (amount: number = 0, currency: string = 'USD') => {
    const language = typeof navigator !== 'undefined' ? navigator.language : 'es';
    return new Intl.NumberFormat(language ?? 'es', {
        style: 'currency',
        currency,
    }).format(amount);
};
