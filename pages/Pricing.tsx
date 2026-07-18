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
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            // getSession lee del almacenamiento local (sin round-trip al servidor de auth)
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user ?? null;
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

    // El pago vive en /checkout (Paddle embebido dentro de la app)
    const handleJoinClick = () => {
        if (isSubscribed) return;
        if (!user) return navigate('/login?redirect=/checkout');
        navigate('/checkout');
    };

    return (
        <div className="relative min-h-screen overflow-x-clip bg-background bg-radial-glow font-space text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

            <main className="relative mx-auto max-w-3xl px-4 py-16 sm:px-8 md:py-20">

                {/* ── Hero ─────────────────────────────────────────────── */}
                <div className="mb-14 text-center">
                    <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]"></span>
                        <span>Membresía Premium</span>
                    </div>
                    <h1 className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.6rem]">
                        Un plan. <em className="not-italic text-primary/90">Acceso total.</em>
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                        Desbloquea todo el banco de prompts por lo que cuesta un café al mes.
                    </p>
                </div>

                {/* ── Pricing card ─────────────────────────────────────── */}
                <div className="relative mx-auto mb-20 max-w-xl">
                    <div className="absolute -inset-10 -z-10 rounded-full bg-accent/5 blur-3xl"></div>

                    <div className="rounded-3xl border border-primary/30 bg-card p-8 text-center shadow-[0_0_80px_oklch(0.86_0.09_90_/_0.08)] sm:p-12">
                        <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-accent/40 bg-secondary px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-accent">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]"></span>
                            <span>Membresía Pro</span>
                        </div>

                        <div className="mt-6 flex items-baseline justify-center gap-2">
                            <span className="text-6xl font-medium text-foreground sm:text-7xl">4</span>
                            <span className="text-2xl text-muted-foreground">USD/mes</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Facturación mensual · cancela cuando quieras, sin dramas.
                        </p>

                        {/* Features */}
                        <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
                            {FEATURES.map(feature => (
                                <li key={feature} className="flex items-center gap-3 text-sm text-foreground/90">
                                    <Check size={16} strokeWidth={2.5} className="shrink-0 text-accent" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <button
                            onClick={handleJoinClick}
                            disabled={isSubscribed}
                            className={`mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-medium transition ${
                                isSubscribed
                                    ? 'cursor-default border border-border text-muted-foreground'
                                    : 'bg-primary text-primary-foreground shadow-[0_0_30px_oklch(0.86_0.09_90_/_0.25)] hover:opacity-90'
                            }`}
                        >
                            {isSubscribed
                                ? 'Plan Actual'
                                : (user ? 'Suscribirse ahora' : 'Unirse al banco')}
                        </button>

                        {/* Secure note */}
                        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Pago seguro vía Paddle · SSL 256-bit
                        </div>
                    </div>
                </div>

                {/* ── Trust props ──────────────────────────────────────── */}
                <div className="mb-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        { title: 'Sin tasas ocultas', desc: 'El precio es final. Sin créditos, sin recargas, sin sorpresas en tu factura.' },
                        { title: 'Flexibilidad total', desc: 'Cancela con un clic. Mantienes el acceso hasta que termine tu periodo.' },
                        { title: 'Pago seguro', desc: 'Checkout encriptado vía Paddle. Tus datos nunca tocan nuestros servidores.' },
                    ].map(({ title, desc }) => (
                        <div key={title} className="rounded-2xl border border-border/70 bg-card p-6 transition hover:border-primary/40">
                            <h4 className="text-base font-medium text-foreground">{title}</h4>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </div>

                {/* ── FAQ ──────────────────────────────────────────────── */}
                <div>
                    <div className="mb-10 text-center">
                        <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]"></span>
                            <span>Preguntas frecuentes</span>
                        </div>
                        <h2 className="mt-6 text-balance text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
                            Todo lo que necesitas saber.
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {FAQ_DATA.map((item, index) => {
                            const open = openIndex === index;
                            return (
                                <div key={index} className="rounded-2xl border border-border/70 bg-card px-5">
                                    <button
                                        className="flex w-full items-center justify-between gap-4 py-4 text-left focus:outline-none"
                                        onClick={() => setOpenIndex(open ? null : index)}
                                    >
                                        <span className="text-sm font-medium text-foreground">
                                            {item.question}
                                        </span>
                                        <span className={`shrink-0 text-lg leading-none text-muted-foreground transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
                                            +
                                        </span>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
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
