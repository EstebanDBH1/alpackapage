// Carga e inicialización de Paddle.js compartida por toda la app.
// Paddle.Initialize solo puede llamarse una vez por página: este módulo
// garantiza una única inicialización y reparte los eventos del checkout
// (checkout.completed, etc.) a quien se suscriba.

type PaddleEvent = { name?: string; data?: any };
type PaddleEventListener = (event: PaddleEvent) => void;

const listeners = new Set<PaddleEventListener>();
let loadPromise: Promise<any> | null = null;

export const onPaddleEvent = (listener: PaddleEventListener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const loadPaddle = (): Promise<any> => {
    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
        const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim();
        if (!clientToken) {
            reject(new Error('Falta VITE_PADDLE_CLIENT_TOKEN'));
            return;
        }

        const init = () => {
            if (!window.Paddle) {
                reject(new Error('Paddle.js no se cargó correctamente'));
                return;
            }
            if (clientToken.startsWith('test_')) window.Paddle.Environment.set('sandbox');
            window.Paddle.Initialize({
                token: clientToken,
                eventCallback: (event: PaddleEvent) => listeners.forEach(l => l(event)),
            });
            resolve(window.Paddle);
        };

        if (window.Paddle) {
            init();
            return;
        }

        const existing = document.getElementById('paddle-js-sdk') as HTMLScriptElement | null;
        const script = existing ?? document.createElement('script');
        if (!existing) {
            script.id = 'paddle-js-sdk';
            script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
            script.async = true;
            document.body.appendChild(script);
        }
        script.addEventListener('load', init);
        script.addEventListener('error', () => reject(new Error('No se pudo descargar Paddle.js')));
    });

    // Si la carga falla, permitir reintentar en la próxima llamada
    loadPromise.catch(() => { loadPromise = null; });

    return loadPromise;
};
