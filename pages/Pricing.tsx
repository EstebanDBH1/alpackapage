import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const FEATURES = [
    'Acceso ilimitado a más de 500 prompts',
    'Actualizaciones constantes con los últimos modelos',
    'Búsqueda técnica avanzada por categoría',
    'Guarda tus prompts favoritos',
    'Soporte prioritario',
    'Cancela cuando quieras, sin ataduras',
];

const FAQ_DATA = [
    { question: '¿Cuál es el costo y qué incluye?', answer: 'Por solo $4 USD al mes, desbloqueas el acceso total a nuestra librería. No hay letras chiquitas: tienes todos los prompts premium, las actualizaciones semanales y las nuevas categorías sin pagar un centavo más.' },
    { question: '¿Realmente funcionan estos prompts?', answer: 'Totalmente. No son frases al azar; cada uno ha sido testeado con ingeniería de prompts para asegurar que la IA te entregue resultados profesionales, estructurados y útiles desde el primer intento.' },
    { question: '¿Con qué modelos de IA puedo usarlos?', answer: 'Están diseñados para brillar en los modelos más potentes como GPT-5, Claude y Gemini. También tenemos secciones dedicadas para herramientas de imagen como Midjourney y DALL-E.' },
    { question: '¿Puedo cancelar si ya no los necesito?', answer: 'Claro, aquí mandas tú. Puedes cancelar tu suscripción con un solo clic desde tu perfil en cualquier momento. Seguirás teniendo acceso premium hasta que termine tu mes pagado.' },
    { question: '¿Actualizan el banco de prompts?', answer: '¡Cada semana! Nuestro equipo de expertos añade nuevos prompts basados en las tendencias del mercado y las peticiones de nuestra comunidad para que nunca te quedes atrás.' },
    { question: '¿Puedo sugerir un prompt que no esté?', answer: '¡Nos encantaría! Aunque nuestra curaduría es interna para mantener la calidad premium, escuchamos a nuestros suscriptores. Si necesitas un prompt específico, escríbenos y nuestro equipo lo diseñará para la próxima actualización.' },
];

const Pricing: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useEffect(() => {
        const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim();
        const initPaddle = () => {
            if (!window.Paddle || !clientToken) return;
            const isSandbox = clientToken.startsWith('test_');
            if (isSandbox) window.Paddle.Environment.set('sandbox');
            window.Paddle.Initialize({ token: clientToken });
            setScriptLoaded(true);
        };
        if (window.Paddle) { initPaddle(); return; }
        const script = document.createElement('script');
        script.id = 'paddle-js-sdk';
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.async = true;
        script.onload = initPaddle;
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('subscription_status')
                    .eq('customer_id', user.id)
                    .maybeSingle();
                if (sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing')) {
                    setIsSubscribed(true);
                }
            }
        };
        checkUser();
    }, []);

    const handleJoinClick = () => {
        if (isSubscribed) return;
        if (!user) return navigate('/login?redirect=/pricing');
        if (!scriptLoaded || !window.Paddle) return;
        const priceId = import.meta.env.VITE_PADDLE_PRICE_ID?.trim();
        window.Paddle.Checkout.open({
            settings: { displayMode: "overlay", theme: "light", locale: "es", successUrl: `${window.location.origin}/payment-success` },
            items: [{ priceId: priceId, quantity: 1 }],
            customer: { email: user.email },
            customData: { supabase_user_id: String(user.id) }
        });
    };

    return (
        <div className="bg-white text-gray-900 font-space">
            <main className="max-w-3xl mx-auto px-6 py-16">

                {/* ── Hero ─────────────────────────────────────────────── */}
                <div className="text-center mb-16">
                    <span className="inline-block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">
                        Membresía Premium
                    </span>
                    <h1 className="font-bold leading-tight mb-6 text-[28px] md:text-[35px] uppercase tracking-tight">
                        Un plan. Acceso total.
                    </h1>
                    <p className="text-gray-600 max-w-xl mx-auto leading-relaxed text-[14px] md:text-[15px]">
                        Desbloquea todo el banco de prompts por lo que cuesta un café al mes.
                    </p>
                </div>

                {/* ── Pricing card ─────────────────────────────────────── */}
                <div className="max-w-md mx-auto border border-gray-200 p-8 md:p-12 mb-16">

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="font-bold text-lg uppercase tracking-tight">Membresía Pro</h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Full Access</p>
                        </div>
                        <span className="border border-gray-900 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                            Popular
                        </span>
                    </div>

                    {/* Price */}
                    <div className="mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-end gap-1">
                            <span className="font-bold text-gray-400 text-2xl mb-2">$</span>
                            <span className="font-bold text-[5rem] leading-none tracking-tighter">4</span>
                            <span className="font-bold text-gray-400 text-sm mb-3">USD/mes</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                            Facturación mensual · cancela cuando quieras, sin dramas.
                        </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                        {FEATURES.map(feature => (
                            <li key={feature} className="flex items-center gap-3 text-sm">
                                <Check size={14} strokeWidth={3} className="text-gray-900 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <button
                        onClick={handleJoinClick}
                        disabled={isSubscribed}
                        className={`w-full px-8 py-3.5 text-xs uppercase tracking-wider font-bold transition-all duration-300 border ${
                            isSubscribed
                                ? 'border-gray-200 text-gray-400 cursor-default'
                                : 'border-gray-900 bg-gray-900 text-white hover:bg-white hover:text-gray-900'
                        }`}
                    >
                        {isSubscribed
                            ? 'Plan Actual'
                            : (user ? 'Suscribirse ahora' : 'Unirse al banco')}
                    </button>

                    {/* Secure note */}
                    <div className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-6 flex justify-center items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pago Seguro vía Paddle • SSL 256-bit
                    </div>
                </div>

                {/* ── Trust props ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16 pt-16 border-t border-gray-100">
                    {[
                        { title: 'Sin tasas ocultas', desc: 'El precio es final. Sin créditos, sin recargas, sin sorpresas en tu factura.' },
                        { title: 'Flexibilidad total', desc: 'Cancela con un clic. Mantienes el acceso hasta que termine tu periodo.' },
                        { title: 'Pago seguro', desc: 'Checkout encriptado vía Paddle. Tus datos nunca tocan nuestros servidores.' },
                    ].map(({ title, desc }) => (
                        <div key={title} className="text-center sm:text-left">
                            <h4 className="font-bold text-sm uppercase tracking-tight mb-2">{title}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>

                {/* ── FAQ ──────────────────────────────────────────────── */}
                <div className="pt-16 border-t border-gray-100">
                    <span className="inline-block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">
                        Preguntas
                    </span>
                    <h2 className="font-bold text-xl md:text-2xl uppercase tracking-tight leading-tight mb-10">
                        Preguntas frecuentes. Respuestas directas.
                    </h2>

                    <div className="border-t border-gray-200">
                        {FAQ_DATA.map((item, index) => {
                            const open = openIndex === index;
                            return (
                                <div key={index} className="border-b border-gray-200">
                                    <button
                                        className="w-full py-5 flex justify-between items-start text-left focus:outline-none gap-6"
                                        onClick={() => setOpenIndex(open ? null : index)}
                                    >
                                        <span className={`text-sm font-bold leading-snug transition-colors ${open ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {item.question}
                                        </span>
                                        <span className={`flex-shrink-0 text-lg leading-none transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
                                            +
                                        </span>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                                        <p className="text-sm leading-relaxed text-gray-500">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Pricing;
