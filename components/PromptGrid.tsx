import React from 'react';
import { supabase } from '../lib/supabase';
import { BadgeCheck, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const PromptGrid: React.FC = () => {
  const [prompts, setPrompts] = React.useState<any[]>([]);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    const fetchPrompts = async () => {
      const { data } = await supabase
        .rpc('get_public_prompts')
        .limit(10);

      if (data) setPrompts(data);
    };
    fetchPrompts();
  }, []);

  const marqueePrompts = [...prompts, ...prompts, ...prompts];

  if (prompts.length === 0) return null;

  return (
    <section className="bg-zinc-50 py-24 overflow-hidden border-y border-zinc-200">
      <div className="w-full">
        {/* Header de la sección */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-zinc-900 lowercase">dentro de la bóveda</h2>
            <p className="font-mono text-[10px] md:text-xs text-zinc-400 tracking-[0.2em] uppercase">accede a estos y miles más con tu suscripción</p>
          </div>

          <Link to="/prompts" className="hidden md:flex items-center text-sm font-bold text-zinc-900 hover:translate-x-1 transition-transform tracking-tighter lowercase">
            vista previa <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden">
          {/* Difuminado en los bordes para suavidad visual */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-zinc-50 to-transparent z-20 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-zinc-50 to-transparent z-20 pointer-events-none"></div>

          <div
            className="flex items-start gap-6 w-max animate-marquee py-6"
            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
          >
            {marqueePrompts.map((prompt, index) => (
              <Link
                to={`/prompts/${prompt.id}`}
                key={`${prompt.id}-${index}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="w-[280px] md:w-[320px] flex-shrink-0 group relative bg-white rounded-2xl border border-zinc-200 transition-all duration-500 hover:border-zinc-400 hover:shadow-2xl hover:shadow-zinc-200/50 block h-fit overflow-hidden"
              >
                {/* Imagen con tratamiento sutil */}
                {prompt.image_url && (
                  <div className="h-[180px] w-full overflow-hidden relative bg-zinc-100 border-b border-zinc-100">
                    <img
                      src={prompt.image_url}
                      alt={prompt.title}
                      className="w-full h-full object-cover grayscale opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100"
                    />
                    {prompt.is_premium && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-zinc-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">
                          <Lock size={12} className="text-zinc-400" />
                          <span className="text-[10px] font-bold tracking-widest uppercase">Premium</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Área de Contenido */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="font-bold text-base leading-snug tracking-tight text-zinc-900 lowercase line-clamp-2">
                      {prompt.title}
                    </h3>
                    <BadgeCheck size={18} className="text-zinc-400 flex-shrink-0 mt-0.5 group-hover:text-blue-500 transition-colors" />
                  </div>

                  <p className="text-zinc-500 text-sm font-sans leading-relaxed lowercase line-clamp-2 mb-6">
                    {prompt.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-zinc-50 pt-5 mt-auto">
                    <span className="font-mono text-[9px] bg-zinc-50 text-zinc-400 px-2 py-1 rounded border border-zinc-100 uppercase tracking-widest">
                      {prompt.category || 'general'}
                    </span>
                    <span className={`text-[10px] font-black tracking-tighter lowercase ${prompt.is_premium ? 'text-zinc-900' : 'text-zinc-400'}`}>
                      {prompt.is_premium ? 'exclusivo' : 'gratis'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 md:hidden flex justify-center px-4">
          <Link to="/prompts" className="flex items-center text-sm font-bold text-zinc-900 tracking-tighter lowercase">
            vista previa <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default PromptGrid;