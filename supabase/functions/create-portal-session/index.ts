/**
 * Supabase Edge Function: create-portal-session
 * 
 * Genera URLs de sesión de portal de Paddle Billing para que el usuario
 * gestione su suscripción. Busca el paddle_customer_id de múltiples fuentes
 * y crea una portal session en la API de Paddle.
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

        // 2. Crear cliente Supabase con SERVICE ROLE
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

        // 4. Buscar la suscripción del usuario en nuestra DB
        const { data: subscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('subscription_id, metadata, customer_id')
            .eq('customer_id', user.id)
            .maybeSingle();

        if (subError || !subscription) {
            console.error('No subscription found for user:', user.id, subError);
            return new Response(JSON.stringify({ error: 'No se encontró suscripción para este usuario' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log('Subscription found:', subscription.subscription_id);
        console.log('Metadata:', JSON.stringify(subscription.metadata));

        // 5. Obtener el paddle_customer_id
        // Primero intentar desde metadata (saved by webhook)
        let paddleCustomerId = subscription.metadata?.paddle_customer_id;

        // Si no está en metadata, obtenerlo desde la API de Paddle usando el subscription_id
        const PADDLE_API_KEY = Deno.env.get('PADDLE_API_KEY');
        const PADDLE_API_URL = Deno.env.get('PADDLE_ENV') === 'production'
            ? 'https://api.paddle.com'
            : 'https://sandbox-api.paddle.com';

        if (!PADDLE_API_KEY) {
            throw new Error('PADDLE_API_KEY no está configurada');
        }

        if (!paddleCustomerId && subscription.subscription_id) {
            console.log('paddle_customer_id not in metadata, fetching from Paddle API...');

            // Fetch subscription details from Paddle to get the customer_id
            const subResponse = await fetch(`${PADDLE_API_URL}/subscriptions/${subscription.subscription_id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${PADDLE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });

            if (subResponse.ok) {
                const subData = await subResponse.json();
                paddleCustomerId = subData.data?.customer_id;
                console.log('Got paddle_customer_id from Paddle API:', paddleCustomerId);

                // Save it to metadata for future use
                if (paddleCustomerId) {
                    const existingMetadata = subscription.metadata || {};
                    await supabaseAdmin
                        .from('subscriptions')
                        .update({
                            metadata: {
                                ...existingMetadata,
                                paddle_customer_id: paddleCustomerId,
                                paddle_subscription_id: subscription.subscription_id,
                            }
                        })
                        .eq('customer_id', user.id);
                    console.log('Saved paddle_customer_id to metadata for future use');
                }
            } else {
                console.error('Failed to fetch subscription from Paddle:', await subResponse.text());
            }
        }

        if (!paddleCustomerId || !paddleCustomerId.startsWith('ctm_')) {
            return new Response(JSON.stringify({
                error: 'No se pudo obtener el ID de cliente de Paddle. Contacta soporte.'
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 6. Crear portal session en Paddle
        console.log('Creating portal session for customer:', paddleCustomerId);

        const response = await fetch(`${PADDLE_API_URL}/customers/${paddleCustomerId}/portal-sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PADDLE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error de Paddle:', JSON.stringify(data));
            return new Response(JSON.stringify({ error: data.error || 'Error al conectar con Paddle' }), {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log('Portal session created successfully');
        console.log('URLs:', JSON.stringify(data.data?.urls));

        return new Response(JSON.stringify({ urls: data.data.urls }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});