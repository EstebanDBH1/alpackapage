/* Flujo de inicio de sesión: a dónde se vuelve después de entrar con Google
   y cómo se avisa de que la sesión se ha iniciado.

   Regla: si la persona estaba haciendo algo concreto (viendo un prompt, en el
   catálogo con filtros, en el generador, en sus guardados o leyendo un
   artículo) vuelve exactamente ahí. Desde cualquier otra página (home,
   precios, servicios…) va a su panel, /dashboard, que es lo que le confirma
   que ha entrado y le dice qué puede hacer. */

const RETURN_TO_PAGE = ['/prompts', '/generador', '/guardados', '/blog/', '/skills'];

/* `/login` sin parámetro manda a /dashboard (es el valor por defecto en Login). */
export const loginHrefFrom = (pathname: string, search: string): string => {
    // Ya en /login: no anidar /login?redirect=/login?redirect=…
    if (pathname === '/login') return `/login${search}`;
    if (RETURN_TO_PAGE.some(p => pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`))) {
        return `/login?redirect=${encodeURIComponent(pathname + search)}`;
    }
    return '/login';
};

/* "Empieza gratis": siempre al panel, que es donde está el "Empieza aquí". */
export const SIGNUP_HREF = '/login';

/* Marca que se acaba de lanzar el login con Google. Al volver, el header la
   consume y muestra el aviso "Sesión iniciada". Caduca a los 15 minutos para
   que un intento abandonado no dispare el aviso días después. */
const SIGNIN_KEY = 'alp-signin-started';
const SIGNIN_TTL_MS = 15 * 60 * 1000;

export const markSignInStarted = () => {
    try { sessionStorage.setItem(SIGNIN_KEY, String(Date.now())); } catch { /* sin storage: no hay aviso */ }
};

export const consumeSignInFlag = (): boolean => {
    try {
        const raw = sessionStorage.getItem(SIGNIN_KEY);
        if (!raw) return false;
        sessionStorage.removeItem(SIGNIN_KEY);
        return Date.now() - Number(raw) < SIGNIN_TTL_MS;
    } catch {
        return false;
    }
};
