/**
 * Supabase Edge Function: create-portal-session
 * 
 * Este endpoint genera URLs de sesión de portal de Paddle Billing
 * para que el usuario gestione su suscripción o la cancele directamente.
 */

Deno.serve(async (req) => {
    // Manejo de CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        });
    }

    try {
        const { customer_id } = await req.json();

        if (!customer_id) {
            throw new Error('customer_id es requerido');
        }

        const PADDLE_API_KEY = Deno.env.get('PADDLE_API_KEY');
        const PADDLE_API_URL = Deno.env.get('PADDLE_ENV') === 'production'
            ? 'https://api.paddle.com'
            : 'https://sandbox-api.paddle.com';

        if (!PADDLE_API_KEY) {
            throw new Error('PADDLE_API_KEY no está configurada');
        }

        const response = await fetch(`${PADDLE_API_URL}/customers/${customer_id}/portal-sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PADDLE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error de Paddle:', data);
            return new Response(JSON.stringify({ error: data.error || 'Error al conectar con Paddle' }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

        // Devolvemos todo el objeto de URLs (general y por suscripción)
        // data.data.urls contiene: general { overview, ... } y subscriptions [ { subscription_id, cancel, update } ]
        return new Response(JSON.stringify({ urls: data.data.urls }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            status: 400,
        });
    }
});
