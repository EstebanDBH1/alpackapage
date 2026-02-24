/**
 * Supabase Edge Function: create-portal-session
 * 
 * Genera URLs de sesión de portal de Paddle Billing para que el usuario
 * gestione su suscripción. Valida que el customer_id pertenezca al usuario
 * autenticado antes de hacer la petición a Paddle.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Verificar que el usuario está autenticado
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 2. Crear cliente Supabase con SERVICE ROLE para verificar el user
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        // 3. Extraer el usuario del JWT
        const jwt = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 4. Obtener el customer_id del body
        const { customer_id } = await req.json();

        if (!customer_id) {
            return new Response(JSON.stringify({ error: 'customer_id es requerido' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 5. Verificar que el customer_id pertenece al usuario autenticado
        const { data: subscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('customer_id')
            .eq('customer_id', user.id)
            .maybeSingle();

        if (subError || !subscription) {
            return new Response(JSON.stringify({ error: 'No se encontró suscripción para este usuario' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 6. Obtener el paddle_customer_id de metadata de forma segura
        const { data: subWithMeta } = await supabaseAdmin
            .from('subscriptions')
            .select('metadata')
            .eq('customer_id', user.id)
            .maybeSingle();

        const paddleCustomerId = subWithMeta?.metadata?.paddle_customer_id
            || subWithMeta?.metadata?.customer_id;

        // Validar que el customer_id enviado coincide con el de la suscripción del usuario
        if (!paddleCustomerId || customer_id !== paddleCustomerId) {
            return new Response(JSON.stringify({ error: 'customer_id no autorizado' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 7. Hacer la petición a Paddle
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
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ urls: data.data.urls }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
