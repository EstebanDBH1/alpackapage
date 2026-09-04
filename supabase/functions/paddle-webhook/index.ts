import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Acceso vitalicio ──
// Pago único que desbloquea la biblioteca para siempre. Se marca en la DB con
// `subscription_status = 'lifetime'`, que reconocen `has_library_access()` en
// la DB y `LIBRARY_STATUSES` en lib/access.ts. No incluye el generador con IA.
const LIFETIME_STATUS = 'lifetime';
// El price id se configura por env; la constante es solo el fallback al precio
// real de producción, para que la función siga funcionando sin configurar nada.
const LIFETIME_PRICE_ID = Deno.env.get('PADDLE_LIFETIME_PRICE_ID')?.trim()
  || 'pri_01m1pta9nh5jh843qe9fb8gf4p';

// ── Verificación de firma de Paddle ──
// Paddle firma cada webhook con el header `Paddle-Signature`:
//   ts=<unix>;h1=<hmac-sha256-hex>
// La firma es HMAC-SHA256(`${ts}:${rawBody}`) con el secret del endpoint.
const MAX_SKEW_SECONDS = 5 * 60;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyPaddleSignature(rawBody: string, signatureHeader: string | null, secret: string): Promise<boolean> {
  if (!signatureHeader) return false;

  const parts = new Map<string, string[]>();
  for (const pair of signatureHeader.split(';')) {
    const [k, v] = pair.split('=');
    if (!k || !v) continue;
    const key = k.trim();
    if (!parts.has(key)) parts.set(key, []);
    parts.get(key)!.push(v.trim());
  }

  const ts = parts.get('ts')?.[0];
  const signatures = parts.get('h1') ?? [];
  if (!ts || signatures.length === 0) return false;

  // Anti-replay: rechazar timestamps demasiado viejos o futuros
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > MAX_SKEW_SECONDS) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`${ts}:${rawBody}`));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');

  // h1 puede venir repetido durante una rotación de secret
  return signatures.some(sig => timingSafeEqual(expected, sig));
}

// ¿Esta transacción es una compra de acceso vitalicio?
//
// `transaction.completed` se dispara también en CADA renovación mensual, así
// que filtrar bien es lo que evita convertir a un suscriptor de $7 en vitalicio
// por accidente:
//   1. las renovaciones traen `subscription_id`; una compra única no.
//   2. algún ítem tiene que ser el precio vitalicio — por `custom_data`
//      (`access: 'lifetime'`, que es lo que lleva el precio) o, si Paddle no
//      expandiera el objeto price, por id.
function isLifetimePurchase(tx: any): boolean {
  if (tx?.subscription_id) return false;

  const items = Array.isArray(tx?.items) ? tx.items : [];
  return items.some((item: any) => {
    const price = item?.price;
    if (!price) return false;
    return price.custom_data?.access === LIFETIME_STATUS || price.id === LIFETIME_PRICE_ID;
  });
}

// Resuelve el usuario de Supabase dueño de la compra.
// La vía normal es `custom_data.supabase_user_id`, que el checkout de la app
// siempre envía. El fallback por email existe para no dejar sin acceso a
// alguien que YA PAGÓ si la compra llegó por otro camino (payment link, o un
// checkout abierto fuera de la app).
async function resolveUserId(supabase: any, tx: any): Promise<string | null> {
  const fromCustomData = tx?.custom_data?.supabase_user_id;
  if (fromCustomData) return String(fromCustomData);

  const paddleCustomerId = tx?.customer_id;
  if (!paddleCustomerId) return null;

  const apiKey = Deno.env.get('PADDLE_API_KEY');
  if (!apiKey) {
    console.warn('⚠️ Sin PADDLE_API_KEY: no se puede resolver al comprador por email');
    return null;
  }

  const apiUrl = Deno.env.get('PADDLE_ENV') === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com';

  try {
    const res = await fetch(`${apiUrl}/customers/${paddleCustomerId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      console.error(`❌ Paddle devolvió ${res.status} al buscar el customer ${paddleCustomerId}`);
      return null;
    }

    const email = (await res.json())?.data?.email;
    if (!email) return null;

    const { data, error } = await supabase.rpc('find_user_id_by_email', { p_email: email });
    if (error) {
      console.error('❌ find_user_id_by_email falló:', error);
      return null;
    }
    if (data) console.log('🔎 Comprador resuelto por email (la compra no traía supabase_user_id)');
    return data ?? null;
  } catch (err) {
    console.error('❌ Error resolviendo al comprador por email:', err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // El body crudo es necesario para la firma; se parsea después.
    const rawBody = await req.text();

    const webhookSecret = Deno.env.get('PADDLE_NOTIFICATION_WEBHOOK_SECRET');
    if (webhookSecret) {
      const valid = await verifyPaddleSignature(rawBody, req.headers.get('Paddle-Signature'), webhookSecret);
      if (!valid) {
        console.warn('⛔ Webhook rejected: invalid or missing Paddle-Signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }
    } else {
      // Modo transitorio: sin secret configurado no se puede verificar.
      // Configura PADDLE_NOTIFICATION_WEBHOOK_SECRET en los secrets de Supabase.
      //
      // PENDIENTE (auditoría 2026-08-26): esto falla en abierto — si el secret
      // faltara, se procesarían webhooks sin verificar firma y cualquiera podría
      // concederse premium. Hoy el secret SÍ está puesto (una petición sin firma
      // devuelve 401), así que es riesgo latente, no un agujero abierto.
      console.warn('⚠️ PADDLE_NOTIFICATION_WEBHOOK_SECRET is NOT set — webhook signature NOT verified!');
    }

    const body = JSON.parse(rawBody);
    console.log("🔔 Webhook received:", body.event_type);

    const { event_type, data } = body;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ══ Pago único: acceso vitalicio a la biblioteca ══
    if (event_type === 'transaction.completed' && isLifetimePurchase(data)) {
      const transaction = data;
      const supabaseUserId = await resolveUserId(supabase, transaction);

      if (!supabaseUserId) {
        // Alguien pagó y no sabemos a quién darle el acceso. Se registra con
        // todo lo necesario para asignarlo a mano y se responde 200 para que
        // Paddle no reintente en bucle un evento que no va a mejorar solo.
        console.error(
          `🚨 COMPRA VITALICIA SIN USUARIO — transacción ${transaction.id}, ` +
          `customer ${transaction.customer_id}. Requiere asignación manual.`
        );
        return new Response(JSON.stringify({ received: true, warning: 'buyer_unresolved' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const lifetimeItem = (transaction.items ?? []).find((i: any) =>
        i?.price?.custom_data?.access === LIFETIME_STATUS || i?.price?.id === LIFETIME_PRICE_ID
      );

      const lifetimeRow = {
        // No hay suscripción de Paddle detrás, pero la columna es la PK y es
        // NOT NULL: se usa el id de la transacción como identificador estable.
        subscription_id: transaction.id,
        subscription_status: LIFETIME_STATUS,
        price_id: lifetimeItem?.price?.id ?? LIFETIME_PRICE_ID,
        product_id: lifetimeItem?.price?.product_id ?? null,
        customer_id: supabaseUserId,
        // Un vitalicio no vence ni se renueva.
        current_period_end: null,
        cancel_at_period_end: false,
        scheduled_change: null,
        updated_at: new Date().toISOString(),
        metadata: {
          access: LIFETIME_STATUS,
          paddle_customer_id: transaction.customer_id ?? null,
          paddle_transaction_id: transaction.id,
          purchased_at: transaction.billed_at ?? new Date().toISOString(),
        },
      };

      // Upsert por customer_id: idempotente si Paddle reentrega el evento, y si
      // el comprador ya tenía una suscripción mensual el vitalicio la sustituye
      // (gana el mejor plan).
      const { error: lifetimeError } = await supabase
        .from('subscriptions')
        .upsert(lifetimeRow, { onConflict: 'customer_id' });

      if (lifetimeError) {
        console.error('❌ Error concediendo acceso vitalicio:', lifetimeError);
        return new Response(JSON.stringify({ error: lifetimeError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      console.log(`✅ Acceso vitalicio concedido a ${supabaseUserId} (transacción ${transaction.id})`);

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Handle subscription events
    if (event_type && event_type.startsWith('subscription.')) {
      const subscription = data;
      const supabaseUserId = subscription.custom_data?.supabase_user_id;

      if (!supabaseUserId) {
        console.warn(`⚠️ No supabase_user_id found in custom_data for subscription ${subscription.id}`);
      }

      // Extract Paddle's customer_id (ctm_...)
      const paddleCustomerId = subscription.customer_id || null;
      console.log(`📦 Paddle customer_id: ${paddleCustomerId}`);

      // Build metadata with paddle_customer_id and subscription_id for portal session
      const metadata: Record<string, any> = {
        paddle_customer_id: paddleCustomerId,
        paddle_subscription_id: subscription.id,
      };

      // Prepare subscription data
      const subscriptionData: any = {
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        price_id: subscription.items?.[0]?.price?.id,
        customer_id: supabaseUserId,
        current_period_end: subscription.current_billing_period?.ends_at,
        updated_at: new Date().toISOString(),
        metadata: metadata,
      };

      // Handle cancel_at_period_end from scheduled_change
      if (subscription.scheduled_change?.action === 'cancel') {
        subscriptionData.cancel_at_period_end = true;
        subscriptionData.scheduled_change = JSON.stringify(subscription.scheduled_change);
      } else if (event_type === 'subscription.updated' && !subscription.scheduled_change) {
        // If updated and no scheduled_change, reset cancel_at_period_end
        subscriptionData.cancel_at_period_end = false;
        subscriptionData.scheduled_change = null;
      }

      // Determine onConflict target
      const conflictTarget = supabaseUserId ? 'customer_id' : 'subscription_id';

      console.log(`Updating subscription for user ${supabaseUserId} using conflict target ${conflictTarget}`);

      if (supabaseUserId || subscription.id) {
          // Un vitalicio no se degrada nunca. Si el comprador tuvo (o tiene)
          // además una suscripción mensual, sus eventos —sobre todo el
          // `canceled` al darla de baja— llegarían aquí y, al hacer upsert por
          // customer_id, sobrescribirían el 'lifetime' revocando un acceso ya
          // pagado. Se refrescan los datos de facturación, pero no el status.
          const targetValue = conflictTarget === 'customer_id' ? supabaseUserId : subscription.id;

          const { data: existing } = await supabase
            .from('subscriptions')
            .select('subscription_status')
            .eq(conflictTarget, targetValue)
            .maybeSingle();

          if (existing?.subscription_status === LIFETIME_STATUS) {
            const { subscription_status: _status, subscription_id: _pk, ...billingOnly } = subscriptionData;
            const { error: keepError } = await supabase
              .from('subscriptions')
              .update({ ...billingOnly, current_period_end: null })
              .eq(conflictTarget, targetValue);

            if (keepError) {
              console.error('❌ Error actualizando la fila vitalicia:', keepError);
              return new Response(JSON.stringify({ error: keepError.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
              });
            }

            console.log(`🛡️ Status 'lifetime' preservado para ${targetValue} (${event_type} no altera el status)`);
            return new Response(JSON.stringify({ received: true }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }

          const { error: subError } = await supabase
            .from('subscriptions')
            .upsert(subscriptionData, { onConflict: conflictTarget });

          if (subError) {
            console.error(`❌ Error updating subscription (target: ${conflictTarget}):`, subError);
            return new Response(JSON.stringify({ error: subError.message }), { status: 500 });
          }

          console.log(`✅ Subscription ${subscription.id} processed successfully with paddle_customer_id: ${paddleCustomerId}`);
      } else {
          console.log(`ℹ️ Skipping update: No user ID or subscription ID found`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('🔥 Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
