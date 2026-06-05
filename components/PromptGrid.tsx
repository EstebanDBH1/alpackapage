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
    <section className="py-24 overflow-hidden bg-white border-y border-gray-200">
      <div className="w-full">

        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-12 flex justify-between items-end">
          <div>
            <span className="inline-flex items-center gap-2 border border-gray-200 px-3 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">biblioteca de prompts</span>
            </span>
            <h2
              className="font-space font-bold uppercase text-gray-900"
              style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', letterSpacing: '-0.01em', lineHeight: 1.15 }}
            >
              Prompts reales.<br />
              Listos para usar.
            </h2>
          </div>
          <Link
            to="/prompts"
            className="hidden md:flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest uppercase text-gray-400 hover:text-gray-900 transition-colors"
          >
            ver todos <ArrowRight size={13} />
          </Link>
        </div>

        {/* Marquee */}
        <div className="relative w-full overflow-hidden">
          {/* Edge fades */}
          <div
            className="absolute top-0 left-0 w-28 h-full z-20 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #ffffff, transparent)' }}
          />
          <div
            className="absolute top-0 right-0 w-28 h-full z-20 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #ffffff, transparent)' }}
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
                className="w-[280px] md:w-[300px] flex-shrink-0 flex flex-col bg-white border border-gray-200 hover:border-gray-900 transition-colors duration-200"
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              >
                {/* Image preview */}
                {prompt.image_url && (
                  <div className="w-full overflow-hidden flex-shrink-0">
                    <img
                      src={prompt.image_url}
                      alt={prompt.title}
                      className="w-full h-auto block"
                    />
                  </div>
                )}

                {/* Premium bar */}
                {prompt.is_premium && (
                  <div className="h-0.5 bg-gray-900" />
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Top: category + tier */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 bg-gray-100 text-gray-500 border border-gray-200">
                      {CATEGORY_EMOJIS[prompt.category?.toLowerCase()] ?? '•'} {prompt.category || 'general'}
                    </span>
                    {prompt.is_premium
                      ? (
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-900 text-white flex items-center gap-1">
                          <Lock size={8} /> pro
                        </span>
                      )
                      : (
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-400">
                          free
                        </span>
                      )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg leading-snug mb-3 line-clamp-2 flex-1 text-gray-900">
                    {prompt.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed line-clamp-2 text-gray-600">
                    {prompt.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-end mt-5 pt-4 border-t border-gray-100">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-900">
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
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-gray-900"
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
