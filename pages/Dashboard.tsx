
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, CreditCard, LogOut, Settings, AlertTriangle, CheckCircle, Clock, FileText, Loader2, Bookmark, ArrowUpRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Subscription } from '../types';
import Skeleton from '../components/Skeleton';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [savedPrompts, setSavedPrompts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }
            setUser(user);

            // Fetch Subscription
            const { data: sub } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('customer_id', user.id)
                .maybeSingle();

            if (sub) {
                setSubscription(sub);
            }

            // Fetch Saved Prompts
            const { data: saved } = await supabase
                .from('saved_prompts')
                .select(`
                    id,
                    prompt_id,
                    prompts (
                        id,
                        title,
                        category
                    )
                `)
                .eq('user_id', user.id);

            if (saved) {
                setSavedPrompts(saved);
            }

            setLoading(false);
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const [updating, setUpdating] = useState(false);

    // 1. Dynamic Paddle Loading in Dashboard
    useEffect(() => {
        if (!window.Paddle) {
            const scriptId = 'paddle-js-sdk-dash';
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
                script.async = true;
                script.onload = () => {
                    const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim();
                    const envFromToken = clientToken?.startsWith('test_') ? 'sandbox' : 'production';
                    const env = import.meta.env.VITE_PADDLE_ENVIRONMENT || import.meta.env.VITE_PADDLE_ENV || envFromToken;

                    if (window.Paddle && clientToken) {
                        window.Paddle.Environment.set(env);
                        window.Paddle.Initialize({ token: clientToken });
                    }
                };
                document.body.appendChild(script);
            }
        }
    }, []);

    const handleManageSubscription = async () => {
        if (!subscription) return;

        setUpdating(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-portal-session', {
                body: {}
            });

            console.log('Portal response data:', data);
            console.log('Portal response error:', error);

            // If error, try to read the response body for debug info
            if (error) {
                // The data field may contain the JSON body even on error
                if (data?.debug) {
                    console.error('Debug steps:', data.debug);
                }
                // Try to get context from FunctionsHttpError
                if (error.context) {
                    try {
                        const errorBody = await error.context.json();
                        console.error('Error body:', errorBody);
                        if (errorBody?.debug) {
                            console.error('Debug steps:', errorBody.debug);
                            alert('Error debug: ' + JSON.stringify(errorBody.debug, null, 2));
                            return;
                        }
                    } catch (e) {
                        // context may not be json
                    }
                }
                throw error;
            }
            if (data?.urls?.general?.overview) {
                window.open(data.urls.general.overview, '_blank');
            } else {
                console.error('Data received but no URLs:', data);
                throw new Error('No se recibió la URL del portal');
            }
        } catch (err: any) {
            console.error('Error al generar portal:', err);
            alert('Error: ' + (err.message || 'No se pudo abrir el portal de gestión. Por favor contacta soporte@alpackaai.xyz'));
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!subscription) return;

        if (!window.confirm("¿Estás seguro de que quieres cancelar? Perderás el acceso al final de tu periodo de facturación actual.")) {
            return;
        }

        setUpdating(true);
        try {
            // 1. Intentar abrir el portal de Paddle para que el usuario cancele desde ahí
            const { data, error } = await supabase.functions.invoke('create-portal-session', {
                body: {}
            });

            if (!error && data?.urls?.subscriptions) {
                // Buscar el link de cancelación para esta suscripción
                const subInfo = data.urls.subscriptions.find((s: any) => s.id === subscription.subscription_id);
                if (subInfo?.cancel_subscription) {
                    window.open(subInfo.cancel_subscription, '_blank');
                    return;
                }
            }

            // Si encontramos el portal general, abrirlo (el usuario puede cancelar desde ahí)
            if (!error && data?.urls?.general?.overview) {
                window.open(data.urls.general.overview, '_blank');
                return;
            }

            // 2. Fallback: usar la edge function de cancelación directa
            const { data: cancelData, error: cancelError } = await supabase.functions.invoke('cancel-paddle-subscription', {
                body: {
                    subscriptionID: subscription.subscription_id,
                    userID: user.id
                }
            });

            if (cancelError) throw cancelError;
            alert('Tu suscripción ha sido programada para cancelarse al final del periodo actual.');
            window.location.reload();
        } catch (err: any) {
            console.error('Error in cancellation:', err);
            alert('No pudimos procesar la cancelación automáticamente. Por favor, revisa tu correo electrónico (el mensaje de confirmación de tu suscripción tiene un link para gestionarla) o contacta a soporte@alpackaai.xyz');
        } finally {
            setUpdating(false);
        }
    }

    // ... inside loading check
    if (loading) {
        return (
            <div className="bg-brand-bg min-h-screen pb-24">
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <Skeleton variant="text" className="w-64 h-8 mb-2" />
                        <Skeleton variant="text" className="w-48 h-4" />
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="space-y-8">
                            <Skeleton className="h-64 w-full rounded-xl" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                        <div className="lg:col-span-2 space-y-8">
                            <Skeleton className="h-96 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isActive = subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing';

    return (
        <div className="bg-brand-bg min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter mb-2">
                                Hola, {user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'}
                            </h1>
                            <p className="font-mono text-gray-500 text-xs tracking-widest">
                                Gestiona tu acceso a la bóveda
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`bg-[#F5F3F1] border border-gray-200 px-4 py-2 rounded-full text-xs font-mono flex items-center gap-2 ${!isActive ? 'opacity-50' : ''}`}>
                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                {isActive ? 'MEMBRESÍA ACTIVA' : 'INACTIVA'}
                                {isActive && (
                                    <span className="ml-2 text-[10px] opacity-70">
                                        (PADDLE)
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Column 1: Membership Card & Profile */}
                    <div className="space-y-8">
                        {/* Digital Card */}
                        <div className="bg-black text-white p-6 rounded-xl shadow-[12px_12px_0px_0px_rgba(229,229,229,1)] relative overflow-hidden group">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-12">
                                    <div className="font-bold text-lg tracking-tighter">PROMPTBANK</div>
                                    <div className={`font-mono text-[10px] px-2 py-1 rounded border ${isActive ? 'bg-[#D4AF37] border-[#D4AF37] text-white' : 'border-white/30 text-white'}`}>
                                        {isActive ? 'PREMIUM' : 'FREE'}
                                    </div>
                                </div>
                                <div className="font-mono text-sm text-gray-400 mb-1">MIEMBRO</div>
                                <div className="font-bold text-xl mb-6 truncate">{user?.user_metadata?.full_name || user?.email}</div>
                                <div className="flex justify-between items-end">
                                    <div className="font-mono text-xs text-gray-500">ID: #{user?.id.slice(0, 8)}</div>
                                    <div className="font-mono text-xs">DESDE {new Date(user?.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Actions */}
                        <div className="bg-white border border-gray-200 p-6">
                            <h3 className="font-bold text-sm tracking-wider mb-6 flex items-center gap-2">
                                <User size={16} /> Tu Perfil
                            </h3>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-400 mb-1">Email</label>
                                    <div className="font-sans font-medium break-all">{user?.email}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-400 mb-1">Proveedor</label>
                                    <div className="font-sans text-sm text-gray-500">Google Auth</div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full border border-black text-black py-3 text-xs font-bold hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut size={14} /> Cerrar Sesión
                            </button>
                        </div>
                    </div>

                    {/* Column 2: Subscription Management */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Status Box */}
                        <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-8 gap-4">
                                <div>
                                    <h2 className="text-2xl font-black mb-1">Tu Suscripción</h2>
                                    <p className="text-gray-500 text-sm font-sans">
                                        {isActive ? 'Gestiona tu facturación y estado.' : 'No tienes una suscripción activa.'}
                                    </p>
                                </div>
                                {isActive && (
                                    <div className="text-right">
                                        <div className="text-3xl font-black tracking-tighter">$3.90</div>
                                        <div className="text-xs text-gray-400 font-mono">/mes</div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-400 mb-2">Próxima Factura</label>
                                    <div className="flex items-center gap-2 font-bold">
                                        <Clock size={18} className="text-gray-400" />
                                        {isActive && subscription?.current_period_end
                                            ? new Date(subscription.current_period_end).toLocaleDateString()
                                            : 'N/A'}
                                    </div>
                                    {isActive && !subscription?.cancel_at_period_end && (
                                        <p className="text-xs text-gray-400 mt-1 font-sans">Se renovará automáticamente.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-400 mb-2">Método de Pago</label>
                                    <div className="flex items-center gap-2 font-bold">
                                        <CreditCard size={18} className="text-gray-400" />
                                        {isActive ? 'Paddle' : '-'}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 font-sans">
                                        Via Paddle Payments
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {isActive ? (
                                    <>
                                        <button
                                            onClick={handleManageSubscription}
                                            disabled={updating}
                                            className="flex-1 bg-black text-white py-4 font-bold text-sm tracking-wider hover:opacity-80 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Settings size={16} /> {updating ? 'Procesando...' : 'Gestionar en Paddle'}
                                        </button>

                                        <button
                                            onClick={handleCancelSubscription}
                                            disabled={updating}
                                            className="flex-1 bg-white border border-red-200 text-red-600 py-4 font-bold text-sm tracking-wider hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <AlertTriangle size={16} /> {updating ? 'Procesando...' : 'Cancelar Suscripción'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        className="flex-1 bg-black text-white py-4 font-bold text-sm tracking-wider hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} /> Reactivar / Suscribirse
                                    </button>
                                )}
                            </div>

                            {subscription?.cancel_at_period_end && (
                                <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 text-xs text-yellow-800 font-sans flex items-start gap-3">
                                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                                    <p>Tu suscripción ha sido cancelada. Mantendrás el acceso hasta el final del periodo actual ({new Date(subscription.current_period_end!).toLocaleDateString()}).</p>
                                </div>
                            )}
                        </div>

                        {/* Saved Prompts Section */}
                        <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="font-bold text-sm tracking-wider mb-6 flex items-center gap-2">
                                <Bookmark size={16} /> Tus Prompts Guardados
                            </h3>

                            {savedPrompts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {savedPrompts.map((item) => (
                                        <Link
                                            key={item.id}
                                            to={`/prompts/${item.prompts.id}`}
                                            className="group border border-gray-100 p-4 hover:border-black transition-colors flex justify-between items-center"
                                        >
                                            <div>
                                                <span className="text-[10px] font-mono text-gray-400 block mb-1 uppercase tracking-widest">{item.prompts.category}</span>
                                                <h4 className="font-bold text-sm group-hover:underline">{item.prompts.title}</h4>
                                            </div>
                                            <ArrowUpRight size={18} className="text-gray-300 group-hover:text-black transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200">
                                    <Bookmark size={32} className="mx-auto text-gray-300 mb-4 opacity-50" />
                                    <p className="text-gray-500 text-sm font-sans mb-4">Aún no has guardado ningún prompt.</p>
                                    <Link to="/prompts" className="text-xs font-bold underline hover:text-black tracking-widest">EXPLORAR LA BÓVEDA</Link>
                                </div>
                            )}
                        </div>

                        {/* Billing History (Mocked for now as we don't store history in DB, only current sub) */}
                        <div className="bg-white border border-gray-200 p-8 opacity-50 pointer-events-none">
                            <h3 className="font-bold text-sm tracking-wider mb-6 flex items-center gap-2">
                                <FileText size={16} /> Historial de Facturas (Próximamente)
                            </h3>
                            <p className="text-sm">Disponible en el portal de Paddle.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;