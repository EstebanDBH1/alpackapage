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

  // Marquee should loop seamlessly, so duplicate the array
  const marqueePrompts = [...prompts, ...prompts, ...prompts];

  if (prompts.length === 0) return null;

  return (
    <section className="bg-[#F5F3F1] py-24 overflow-hidden">
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2 uppercase">dentro de la bóveda</h2>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">accede a estos y miles más con tu suscripción.</p>
          </div>

          <Link to="/prompts" className="hidden md:flex items-center text-sm font-bold text-brand-text hover:translate-x-1 transition-transform ml-4 uppercase tracking-tighter">
            VISTA PREVIA <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden">
          {/* Edge Fades */}
          <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-[#F5F3F1] to-transparent z-20 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-[#F5F3F1] to-transparent z-20 pointer-events-none"></div>

          <div
            className="flex items-start gap-6 w-max animate-marquee py-4"
            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
          >
            {marqueePrompts.map((prompt, index) => (
              <Link
                to={`/prompts/${prompt.id}`}
                key={`${prompt.id}-${index}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="w-[280px] md:w-[320px] flex-shrink-0 group relative bg-white rounded-none overflow-hidden border border-gray-200 hover:border-black transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl block h-fit"
              >
                {/* Only show Image if it exists */}
                {prompt.image_url && (
                  <div className="h-[150px] w-full overflow-hidden relative bg-white border-b border-gray-100 flex items-start justify-start">
                    <img
                      src={prompt.image_url}
                      alt={prompt.title}
                      className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0"
                    />
                    <div className="absolute top-2 right-2 z-10">
                      <span className={`bg-black/70 backdrop-blur-sm text-white px-2 py-1 flex items-center gap-1`}>
                        <Lock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{prompt.is_premium ? 'PRO' : 'FREE'}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Content Area */}
                <div className="p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-base leading-tight line-clamp-2 tracking-tight group-hover:text-black transition-colors">{prompt.title}</h3>
                    <BadgeCheck size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-none mb-4 font-sans leading-relaxed">
                    {prompt.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2 text-[10px]">
                    <span className="font-black bg-[#F5F3F1] px-2 py-1 rounded-none text-gray-500 font-mono uppercase tracking-widest border border-gray-100">
                      {prompt.category || 'General'}
                    </span>
                    <span className={`font-bold uppercase tracking-wider ${prompt.is_premium ? 'text-black' : 'text-green-600'}`}>
                      {prompt.is_premium ? 'PRO' : 'FREE'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 md:hidden flex justify-center px-4">
          <Link to="/prompts" className="flex items-center text-sm font-bold text-brand-text uppercase tracking-tighter">
            VISTA PREVIA <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Move by one-third of the total width since we triplicated the array */
            transform: translateX(-33.33%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default PromptGrid;