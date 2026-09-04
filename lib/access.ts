/* ══════════════════════════════════════════════════════════════
   Qué desbloquea cada estado de `subscriptions.subscription_status`.

   Hoy los dos niveles coinciden (solo hay plan mensual), pero se
   mantienen separados porque el servidor sí los distingue: la
   biblioteca la gatean la política RLS de `prompts` y
   `get_prompt_detail()`, mientras que el generador lo gatea la edge
   function `generate-prompt`. Si algún día un plan da uno y no el
   otro, este es el sitio donde se refleja.

   `lifetime` es el pago único de $47.99: biblioteca Y generador,
   para siempre. El coste por uso del generador lo acota el límite de
   10 generaciones al día que aplica la edge function, el mismo que a
   los suscriptores mensuales.

   Esto es solo UI: la frontera real está en el servidor. Si cambias
   una lista aquí, cambia también la de allí o la interfaz mentirá.
   El espejo de LIBRARY_STATUSES es `has_library_access()` en la DB
   (la usan la policy RLS de `prompts` y `get_prompt_detail`); el de
   GENERATOR_STATUSES vive en la edge function `generate-prompt`.
   ══════════════════════════════════════════════════════════════ */

export const LIBRARY_STATUSES = ['active', 'trialing', 'lifetime'] as const;
export const GENERATOR_STATUSES = ['active', 'trialing', 'lifetime'] as const;

type Status = string | null | undefined;

/** ¿Ve el contenido premium de los prompts? */
export const hasLibraryAccess = (status: Status): boolean =>
    !!status && (LIBRARY_STATUSES as readonly string[]).includes(status);

/** ¿Puede usar el generador con IA? */
export const hasGeneratorAccess = (status: Status): boolean =>
    !!status && (GENERATOR_STATUSES as readonly string[]).includes(status);

/** Pago único ya cobrado: no vence, no se renueva, no se cancela. */
export const isLifetime = (status: Status): boolean => status === 'lifetime';
