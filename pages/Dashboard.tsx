
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, LogOut, Settings, AlertTriangle, CheckCircle, Clock, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Subscription } from '../types';
import Skeleton from '../components/Skeleton';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
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
                .single();

            if (sub) {
                setSubscription(sub);
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

        // If we have the URL directly, use it
        if (subscription.update_url) {
            window.open(subscription.update_url, '_blank');
            return;
        }

        // If it's a Paddle subscription but we don't have the URL, 
        // we can try to use Paddle.js if it's initialized
        if (subscription.subscription_id.startsWith('sub_') && window.Paddle) {
            window.Paddle.Checkout.open({
                subscriptionId: subscription.subscription_id,
                settings: {
                    displayMode: "overlay",
                    theme: "light",
                    locale: "es",
                }
            });
            return;
        }

        // Fallback: Notify support or check if it's PayPal
        if (subscription.subscription_id.startsWith('I-')) {
            alert('Para gestionar tu suscripción de PayPal, por favor ve a tu cuenta de PayPal > Pagos automáticos.');
        } else {
            alert('No se puede abrir el portal de gestión automáticamente. Por favor contacta a soporte@alpacka.ai');
        }
    };

    const handleCancelSubscription = async () => {
        if (!subscription) return;

        if (!window.confirm("¿Estás seguro de que quieres cancelar? Perderás el acceso al final de tu periodo de facturación actual.")) {
            return;
        }

        // If we have the URL directly, use it
        if (subscription.cancel_url) {
            window.open(subscription.cancel_url, '_blank');
            return;
        }

        setUpdating(true);
        try {
            // Determine which function to call based on provider
            const isPayPal = subscription.subscription_id.startsWith('I-');
            const isPaddle = subscription.subscription_id.startsWith('sub_');
            const functionName = isPayPal ? 'cancel-paypal-subscription' : (isPaddle ? 'cancel-paddle-subscription' : null);

            if (functionName) {
                const { data, error } = await supabase.functions.invoke(functionName, {
                    body: {
                        subscriptionID: subscription.subscription_id,
                        userID: user.id
                    }
                });

                if (error) throw error;
                alert('Suscripción cancelada con éxito. Seguirás teniendo acceso hasta el final del periodo.');
                window.location.reload();
            } else {
                alert('No se puede cancelar este tipo de suscripción automáticamente. Por favor contacta a soporte@alpacka.ai');
            }
        } catch (err: any) {
            console.error('Error cancelling:', err);
            alert('Hubo un error al procesar la cancelación: ' + err.message);
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
                            <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase">
                                Hola, {user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'}
                            </h1>
                            <p className="font-mono text-gray-500 text-xs uppercase tracking-widest">
                                Gestiona tu acceso a la bóveda
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`bg-[#F5F3F1] border border-gray-200 px-4 py-2 rounded-full text-xs font-mono flex items-center gap-2 ${!isActive ? 'opacity-50' : ''}`}>
                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                {isActive ? 'MEMBRESÍA ACTIVA' : 'INACTIVA'}
                                {isActive && (
                                    <span className="ml-2 text-[10px] opacity-70">
                                        ({subscription?.subscription_id.startsWith('I-') ? 'PAYPAL' : 'PADDLE'})
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
                                    <div className="font-mono text-xs border border-white/30 px-2 py-1 rounded">{isActive ? 'PRO' : 'FREE'}</div>
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
                            <h3 className="font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                                <User size={16} /> Tu Perfil
                            </h3>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Email</label>
                                    <div className="font-sans font-medium break-all">{user?.email}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Proveedor</label>
                                    <div className="font-sans text-sm text-gray-500">Google Auth</div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full border border-black text-black py-3 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
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
                                    <label className="block text-[10px] font-mono text-gray-400 uppercase mb-2">Próxima Factura</label>
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
                                    <label className="block text-[10px] font-mono text-gray-400 uppercase mb-2">Método de Pago</label>
                                    <div className="flex items-center gap-2 font-bold">
                                        <CreditCard size={18} className="text-gray-400" />
                                        {isActive ? (subscription?.subscription_id.startsWith('I-') ? 'PayPal' : 'Paddle') : '-'}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 font-sans">
                                        {subscription?.subscription_id.startsWith('I-') ? 'Suscripción de PayPal' : 'Via Paddle Payments'}
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
                                            className="flex-1 bg-black text-white py-4 font-bold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Settings size={16} /> {updating ? 'Procesando...' : 'Gestionar en Paddle'}
                                        </button>

                                        <button
                                            onClick={handleCancelSubscription}
                                            disabled={updating}
                                            className="flex-1 bg-white border border-red-200 text-red-600 py-4 font-bold text-sm uppercase tracking-wider hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <AlertTriangle size={16} /> {updating ? 'Procesando...' : 'Cancelar Suscripción'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        className="flex-1 bg-black text-white py-4 font-bold text-sm uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
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

                        {/* Billing History (Mocked for now as we don't store history in DB, only current sub) */}
                        <div className="bg-white border border-gray-200 p-8 opacity-50 pointer-events-none">
                            <h3 className="font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
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