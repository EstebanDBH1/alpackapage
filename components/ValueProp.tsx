import React, { useState } from 'react';
import { Zap, Shield, Sparkles, Clock, Terminal, Copy, Check } from 'lucide-react';

const ValueProp: React.FC = () => {
    const [copied, setCopied] = useState(false);

    const fullPrompt = `# contexto
actúa como un director creativo y estratega de marketing senior con especialidad en growth marketing.

# objetivo
diseñar una campaña de marketing integral de 30 días para el lanzamiento de un producto, asegurando coherencia narrativa y conversión.

# pilares estratégicos
1. fase de awareness (días 1-10): generar curiosidad y educar sobre el problema.
2. fase de consideración (días 11-20): posicionar la solución y derribar objeciones.
3. fase de conversión (días 21-30): urgencia, escasez y cierre de ventas.

# entregables requeridos
- calendario de 30 días para redes sociales (ig, tiktok, linkedin).
- 3 guiones de anuncios de video (hook, story, offer).
- secuencia de 5 correos electrónicos de preventa.
- indicadores clave (kpis) para medir el éxito.

# formato de respuesta
genera tablas jerárquicas para el calendario y listas numeradas para los guiones. prioriza la claridad ejecutiva.`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="py-24 bg-white text-zinc-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-zinc-900 leading-tight">
                            por qué alpackaai? <br />
                            <span className="text-zinc-400 font-medium font-sans">ingeniería de prompts para flujos de trabajo reales.</span>
                        </h2>
                        <p className="text-lg text-zinc-500 font-sans mb-10 leading-relaxed max-w-lg">
                            no pierdas tiempo con resultados genéricos. nuestra librería utiliza estructuras avanzadas para garantizar que cada interacción con la ia sea productiva y profesional.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 border border-zinc-200">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1 text-zinc-800">ahorro de tiempo</h4>
                                    <p className="text-zinc-500 text-sm leading-snug">pasa del borrador al resultado final en segundos, sin iteraciones innecesarias.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 border border-zinc-200">
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1 text-zinc-800">calidad verificada</h4>
                                    <p className="text-zinc-500 text-sm leading-snug">cada estructura es probada exhaustivamente en gpt-5 y modelos de razonamiento.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full">
                        <div className="bg-zinc-100 border border-zinc-200 p-2 rounded-2xl shadow-xl">
                            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                                        </div>
                                        <span className="text-[11px] font-mono text-zinc-400 tracking-wider">campaña_marketing_30d.v1</span>
                                    </div>
                                    <Terminal size={14} className="text-zinc-300" />
                                </div>

                                <div className="p-6 md:p-8 space-y-1 font-mono text-[12px] md:text-[13px] leading-relaxed max-h-[450px] overflow-y-auto">
                                    {fullPrompt.split('\n').map((line, i) => (
                                        <div key={i} className="flex gap-4">
                                            <span className="w-5 text-zinc-300 text-right select-none">{String(i + 1).padStart(2, '0')}</span>
                                            <p className={`${line.startsWith('#') ? 'text-zinc-900 font-bold' : 'text-zinc-500'} break-words flex-1`}>
                                                {line}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="px-6 py-4 flex justify-between items-center border-t border-zinc-100 bg-white">
                                    <span className="text-[10px] text-zinc-400 font-medium tracking-tight uppercase font-mono">optimizado para gpt-5</span>
                                    <button
                                        onClick={handleCopy}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all duration-200 ${copied ? 'bg-green-50 text-green-600' : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95'
                                            }`}
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        {copied ? 'copiado' : 'copiar prompt'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -top-4 -right-4 bg-white border border-zinc-200 text-zinc-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
                            <Sparkles size={16} className="text-yellow-500" />
                            <div>
                                <p className="text-xs font-bold leading-none text-zinc-900">99.2% de éxito</p>
                                <p className="text-[9px] text-zinc-400 font-medium">en la primera respuesta</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ValueProp;