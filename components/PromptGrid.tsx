import React from 'react';
import { supabase } from '../lib/supabase';
import { ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORY_EMOJIS: Record<string, string> = {
  marketing: '📣', copywriting: '✍️', ventas: '💰',
  productividad: '⚡', estrategia: '♟️', redes: '📱',
  email: '📧', negocio: '💼', contenido: '🎨',
  datos: '📊', 'ideas de negocio': '💡', finanzas: '📈',
};

const PromptGrid: React.FC = () => {
  const [prompts, setPrompts] = React.useState<any[]>([]);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    const fetchPrompts = async () => {
      const { data } = await supabase.rpc('get_public_prompts').limit(10);
      if (data) setPrompts(data);
    };
    fetchPrompts();
  }, []);

  const marqueePrompts = [...prompts, ...prompts, ...prompts];

  if (prompts.length === 0) return null;

  return (
    <section className="py-24 overflow-hidden border-y" style={{ backgroundColor: '#f7f6f3', borderColor: '#e4e4e1' }}>
      <div className="w-full">

        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-12 flex justify-between items-end">
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              backgroundColor: '#ffffff', border: '1px solid #e4e4e1',
              borderRadius: 100, padding: '4px 12px', marginBottom: 14,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#787774', letterSpacing: '0.1em', textTransform: 'uppercase' }}>biblioteca de prompts</span>
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>
              Prompts reales.<br />
              <span>Listos para usar.</span>
            </h2>
          </div>
          <Link
            to="/prompts"
            className="hidden md:flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest uppercase transition-all hover:-translate-y-0.5"
            style={{ color: '#787774' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#6366f1')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#787774')}
          >
            ver todos <ArrowRight size={13} />
          </Link>
        </div>

        {/* Marquee */}
        <div className="relative w-full overflow-hidden">
          {/* Edge fades */}
          <div
            className="absolute top-0 left-0 w-28 h-full z-20 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #f7f6f3, transparent)' }}
          />
          <div
            className="absolute top-0 right-0 w-28 h-full z-20 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #f7f6f3, transparent)' }}
          />

          <div
            className="flex items-stretch gap-4 w-max py-4"
            style={{ animation: `marquee 55s linear infinite`, animationPlayState: isPaused ? 'paused' : 'running' }}
          >
            {marqueePrompts.map((prompt, index) => (
              <Link
                to={`/prompts/${prompt.id}`}
                key={`${prompt.id}-${index}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="w-[280px] md:w-[300px] flex-shrink-0 flex flex-col rounded-2xl transition-all duration-200 hover:-translate-y-1"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e4e4e1',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              >
                {/* Image preview */}
                {prompt.image_url && (
                  <div className="w-full overflow-hidden rounded-t-2xl flex-shrink-0">
                    <img
                      src={prompt.image_url}
                      alt={prompt.title}
                      className="w-full h-auto block"
                    />
                  </div>
                )}

                {/* Premium bar */}
                {prompt.is_premium && (
                  <div
                    className={`h-0.5 ${prompt.image_url ? '' : 'rounded-t-2xl'}`}
                    style={{ background: 'linear-gradient(90deg, #667eea, #a78bfa)' }}
                  />
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Top: category + tier */}
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 rounded-md"
                      style={{ backgroundColor: '#f7f6f3', color: '#787774', border: '1px solid #e4e4e1' }}
                    >
                      {CATEGORY_EMOJIS[prompt.category?.toLowerCase()] ?? '•'} {prompt.category || 'general'}
                    </span>
                    {prompt.is_premium && (
                      <span
                        className="font-mono text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: '#f0f0ff', color: '#6366f1', border: '1px solid #c7d2fe' }}
                      >
                        <Lock size={8} /> premium
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg leading-snug mb-3 line-clamp-2 flex-1" style={{ color: '#1a1a1a' }}>
                    {prompt.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#787774' }}>
                    {prompt.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-end mt-5 pt-4" style={{ borderTop: '1px solid #f0efec' }}>
                    <span className="font-mono text-[10px] font-bold" style={{ color: '#6366f1' }}>
                      ver →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile link */}
        <div className="mt-8 md:hidden flex justify-center px-6">
          <Link
            to="/prompts"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest"
            style={{ color: '#787774' }}
          >
            ver todos los prompts <ArrowRight size={13} />
          </Link>
        </div>

      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </section>
  );
};

export default PromptGrid;
