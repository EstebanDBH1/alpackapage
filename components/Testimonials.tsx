import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Alex Rivera',
        role: 'Full-stack Developer',
        content: 'He ahorrado horas de depuración. Los prompts de SQL son simplemente perfectos.',
        avatar: 'AR'
    },
    {
        name: 'Elena Gómez',
        role: 'Content Creator',
        content: 'Mis hilos de Twitter ahora tienen 10 veces más engagement. Brutal.',
        avatar: 'EG'
    },
    {
        name: 'Marcus Chen',
        role: 'Product Designer',
        content: 'La sección de Midjourney es una joya. Resultados consistentes en minutos.',
        avatar: 'MC'
    }
];

const Testimonials: React.FC = () => {
    return (
        <section className="py-24 bg-brand-bg relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-surface rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4">lo que dicen de nosotros</h2>
                    <p className="font-mono text-xs text-gray-500 tracking-widest">+50,000 usuarios optimizando su tiempo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 relative group">
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className="fill-brand-text text-brand-text" />
                                ))}
                            </div>
                            <p className="text-gray-600 font-sans italic mb-8 leading-relaxed">
                                "{t.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-surface rounded-full flex items-center justify-center font-bold text-xs">
                                    {t.avatar}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm tracking-tight">{t.name}</h4>
                                    <p className="text-[10px] font-mono text-gray-400">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
