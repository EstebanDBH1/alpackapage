import React, { useState } from 'react';
import { Shield, Clock, Terminal, Copy, Check } from 'lucide-react';

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
        <section className="py-20 md:py-28 bg-brand-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left — copy */}
                    <div>
                        <p className="font-mono text-[10px] text-brand-muted/50 tracking-[0.2em] uppercase mb-4">— por qué alpackaai</p>
                        <h2 className="mb-6">
                            <span className="block font-display italic font-light text-3xl md:text-4xl text-brand-text leading-tight">
                                ingeniería de prompts
                            </span>
                            <span className="block font-sans font-bold text-3xl md:text-4xl text-brand-text leading-tight">
                                para flujos de trabajo reales.
                            </span>
                        </h2>
                        <p className="text-brand-muted leading-relaxed mb-12 max-w-md">
                            no pierdas tiempo con resultados genéricos. nuestra librería utiliza estructuras avanzadas para garantizar que cada interacción con la ia sea productiva y profesional.
                        </p>

                        <div className="space-y-7">
                            <div className="flex gap-5">
                                <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-brand-border shadow-sm">
                                    <Clock size={16} className="text-brand-muted" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-brand-text text-sm mb-1">ahorro de tiempo</h4>
                                    <p className="text-brand-muted text-sm leading-relaxed">pasa del borrador al resultado final en segundos, sin iteraciones innecesarias.</p>
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-brand-border shadow-sm">
                                    <Shield size={16} className="text-brand-muted" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-brand-text text-sm mb-1">calidad verificada</h4>
                                    <p className="text-brand-muted text-sm leading-relaxed">cada estructura es probada exhaustivamente en gpt-5 y modelos de razonamiento.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right — code editor */}
                    <div className="relative">
                        {/* Floating badge */}
                        <div className="hidden lg:flex absolute -top-5 -right-5 z-10 bg-white border border-brand-border shadow-lg px-4 py-3 rounded-2xl items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <div>
                                <p className="text-xs font-semibold text-brand-text leading-none">99.2% de éxito</p>
                                <p className="text-[10px] text-brand-muted mt-0.5">en la primera respuesta</p>
                            </div>
                        </div>

                        <div className="rounded-2xl overflow-hidden border border-brand-border shadow-2xl shadow-[#1A1410]/10">
                            {/* Editor header */}
                            <div className="flex items-center justify-between px-5 py-3.5 bg-brand-dark border-b border-white/5">
                                <div className="flex items-center gap-3.5">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                                    </div>
                                    <span className="text-[11px] font-mono text-white/30 tracking-wider">campaña_marketing_30d.v1</span>
                                </div>
                                <Terminal size={12} className="text-white/20" />
                            </div>

                            {/* Code content */}
                            <div className="bg-[#1D1B18] p-5 md:p-7 space-y-px font-mono text-[12px] md:text-[13px] leading-[1.7] max-h-[400px] overflow-y-auto scrollbar-hide">
                                {fullPrompt.split('\n').map((line, i) => (
                                    <div key={i} className="flex gap-5">
                                        <span className="w-5 text-white/15 text-right select-none shrink-0 text-[11px] pt-px">{String(i + 1).padStart(2, '0')}</span>
                                        <p className={`${line.startsWith('#') ? 'text-[#D4A76A] font-semibold' : line.startsWith('-') || /^\d\./.test(line) ? 'text-white/55' : 'text-white/40'} break-words flex-1`}>
                                            {line || '\u00A0'}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Editor footer */}
                            <div className="flex items-center justify-between px-5 py-3.5 bg-brand-dark border-t border-white/5">
                                <span className="text-[10px] font-mono text-white/20 tracking-widest uppercase">optimizado · gpt-5</span>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-200 ${
                                        copied
                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-brand-accent text-white hover:bg-brand-accent-hover active:scale-95'
                                    }`}
                                >
                                    {copied ? <Check size={12} /> : <Copy size={12} />}
                                    {copied ? 'copiado' : 'copiar'}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ValueProp;
