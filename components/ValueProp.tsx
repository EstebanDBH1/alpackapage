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
        <section className="py-20 md:py-28" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e4e4e1' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left — copy */}
                    <div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            backgroundColor: '#f7f6f3', border: '1px solid #e4e4e1',
                            borderRadius: 100, padding: '4px 12px', marginBottom: 16,
                        }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#787774', letterSpacing: '0.1em', textTransform: 'uppercase' }}>estructura probada</span>
                        </div>
                        <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight mb-4" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                            No son prompts simples.<br />
                            <span>Son estructuras de ingeniería.</span>
                        </h2>
                        <p className="leading-relaxed mb-12 max-w-md" style={{ color: '#787774', fontSize: 15 }}>
                            Cada prompt incluye contexto, rol, objetivo y formato de respuesta. La IA recibe instrucciones completas y entrega resultados profesionales desde el primer intento.
                        </p>

                        <div className="space-y-6">
                            {[
                                {
                                    icon: <Clock size={16} style={{ color: '#6366f1' }} />,
                                    bg: '#f0f0ff',
                                    border: '#c7d2fe',
                                    title: 'ahorro de tiempo',
                                    desc: 'pasa del borrador al resultado final en segundos, sin iteraciones innecesarias.',
                                },
                                {
                                    icon: <Shield size={16} style={{ color: '#22c55e' }} />,
                                    bg: '#f0fdf4',
                                    border: '#bbf7d0',
                                    title: 'calidad verificada',
                                    desc: 'cada estructura es probada exhaustivamente en gpt-5 y modelos de razonamiento.',
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div
                                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: item.bg, border: `1px solid ${item.border}` }}
                                    >
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1" style={{ color: '#1a1a1a' }}>{item.title}</h4>
                                        <p className="text-sm leading-relaxed" style={{ color: '#787774' }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — code editor */}
                    <div className="relative">
                        {/* Floating badge */}
                        <div
                            className="hidden lg:flex absolute -top-5 -right-5 z-10 bg-white border shadow-lg px-4 py-3 rounded-2xl items-center gap-3"
                            style={{ borderColor: '#e4e4e1', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                        >
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <div>
                                <p className="text-xs font-semibold leading-none" style={{ color: '#1a1a1a' }}>99.2% de éxito</p>
                                <p className="text-[10px] mt-0.5" style={{ color: '#787774' }}>en la primera respuesta</p>
                            </div>
                        </div>

                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{ border: '1px solid #e4e4e1', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
                        >
                            {/* Editor header */}
                            <div
                                className="flex items-center justify-between px-5 py-3.5 border-b"
                                style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.06)' }}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ff6b6b' }} />
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ffd93d' }} />
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#6bcb77' }} />
                                    </div>
                                    <span className="font-mono text-[11px] tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                        campaña_marketing_30d.v1
                                    </span>
                                </div>
                                <Terminal size={12} style={{ color: 'rgba(255,255,255,0.18)' }} />
                            </div>

                            {/* Code content */}
                            <div
                                className="p-5 md:p-7 space-y-px font-mono text-[12px] md:text-[13px] leading-[1.7] max-h-[380px] overflow-y-auto"
                                style={{ backgroundColor: '#1a1a1a' }}
                            >
                                {fullPrompt.split('\n').map((line, i) => (
                                    <div key={i} className="flex gap-5">
                                        <span
                                            className="w-5 text-right select-none shrink-0 text-[11px] pt-px"
                                            style={{ color: 'rgba(255,255,255,0.1)' }}
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <p
                                            className="break-words flex-1"
                                            style={{
                                                color: line.startsWith('#')
                                                    ? '#a78bfa'
                                                    : line.startsWith('-') || /^\d\./.test(line)
                                                        ? 'rgba(255,255,255,0.55)'
                                                        : 'rgba(255,255,255,0.35)',
                                                fontWeight: line.startsWith('#') ? 600 : 400,
                                            }}
                                        >
                                            {line || ' '}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Editor footer */}
                            <div
                                className="flex items-center justify-between px-5 py-3.5 border-t"
                                style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.05)' }}
                            >
                                <span
                                    className="font-mono text-[10px] tracking-widest uppercase"
                                    style={{ color: 'rgba(255,255,255,0.18)' }}
                                >
                                    optimizado · gpt-5
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all"
                                    style={copied
                                        ? { backgroundColor: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }
                                        : { backgroundColor: '#000', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }
                                    }
                                    onMouseEnter={e => !copied && ((e.currentTarget as HTMLElement).style.backgroundColor = '#333')}
                                    onMouseLeave={e => !copied && ((e.currentTarget as HTMLElement).style.backgroundColor = '#000')}
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
