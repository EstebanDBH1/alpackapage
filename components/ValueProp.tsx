import React from 'react';
import { Zap, Shield, Sparkles, Clock } from 'lucide-react';

const ValueProp: React.FC = () => {
    return (
        <section className="py-24 bg-brand-text text-brand-bg relative overflow-hidden">
            {/* Decorative Gradient */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-8 uppercase leading-none">
                            ¿por qué alpackaai? <br />
                            <span className="text-gray-500">el estándar dorado de la ingeniería de prompts.</span>
                        </h2>
                        <p className="text-lg text-gray-400 font-sans mb-10 leading-relaxed">
                            No pierdas tiempo probando "trucos" que no funcionan. Nuestra librería está verificada por ingenieros de IA para garantizar el mejor output posible en cada interacción.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1 uppercase text-sm tracking-wide">ahorro de tiempo</h4>
                                    <p className="text-gray-500 text-xs">Pasa de horas a segundos en la creación de prompts complejos.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1 uppercase text-sm tracking-wide">calidad verificada</h4>
                                    <p className="text-gray-500 text-xs">Cada prompt ha sido probado en Múltiples iteraciones antes de publicarse.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-[#222222] border border-white/10 p-2 rounded-2xl shadow-2xl">
                            <div className="bg-[#1A1A1A] rounded-xl p-8 border border-white/5">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30"></div>
                                </div>

                                <div className="space-y-4 font-mono text-[10px] md:text-sm">
                                    <p className="text-gray-500 italic"># Prompt de ejemplo para Reporte de Ventas</p>
                                    <p className="text-brand-surface">actúas como un experto arquitecto de datos...</p>
                                    <p className="text-gray-400">analiza los siguientes CSVs y genera un reporte ejecutivo que...</p>
                                    <div className="pt-4 flex justify-between items-center border-t border-white/5 mt-8">
                                        <span className="text-[10px] uppercase tracking-widest text-gray-600">output esperado: óptimo</span>
                                        <button className="bg-brand-surface text-brand-text px-4 py-1 rounded-full font-bold text-[10px] uppercase">copiar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -right-6 bg-brand-surface text-brand-text p-6 rounded-2xl shadow-2xl border-4 border-brand-text animate-bounce-slow">
                            <Sparkles size={24} className="mb-2" />
                            <p className="font-black text-xl leading-none uppercase">9.8/10</p>
                            <p className="text-[10px] font-mono uppercase tracking-tighter">calificación promedio</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ValueProp;
