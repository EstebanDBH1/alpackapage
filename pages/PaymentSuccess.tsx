
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to dashboard after 5 seconds automatically
        const timer = setTimeout(() => {
            navigate('/dashboard');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
            <div className="bg-white border-2 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-black tracking-tighter mb-4">¡PAGO EXITOSO!</h1>
                <p className="font-mono text-gray-500 mb-8">
                    Tu suscripción ha sido procesada correctamente. Ya tienes acceso ilimitado a todo el banco de prompts.
                </p>

                <Link to="/dashboard" className="block w-full">
                    <button className="w-full bg-black text-white py-4 font-bold text-sm tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                        Ir al Dashboard <ArrowRight size={16} />
                    </button>
                </Link>

                <p className="text-xs text-gray-400 mt-6 font-mono">
                    Serás redirigido automáticamente en 5 segundos...
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;
