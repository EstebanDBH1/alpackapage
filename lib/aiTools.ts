// Metadatos de la herramienta de IA para la que está pensado cada prompt.
// Fuente única de verdad para el selector del admin y los badges públicos.

import { AiTool } from '../types';

export const AI_TOOLS: { value: AiTool; label: string; badgeClass: string }[] = [
    { value: 'cualquier-modelo', label: 'Cualquier modelo', badgeClass: 'border-border/50 bg-secondary text-muted-foreground' },
    { value: 'chatgpt', label: 'ChatGPT', badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
    { value: 'claude', label: 'Claude', badgeClass: 'border-orange-500/30 bg-orange-500/10 text-orange-400' },
    { value: 'gemini', label: 'Gemini', badgeClass: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
];

export const getAiToolMeta = (value?: string | null) =>
    AI_TOOLS.find(t => t.value === value) ?? AI_TOOLS[0];
