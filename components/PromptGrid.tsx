import React from 'react';
import { supabase } from '../lib/supabase';
import { BadgeCheck, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const PromptGrid: React.FC = () => {
  const [prompts, setPrompts] = React.useState<any[]>([]);

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
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">dentro de la bóveda</h2>
            <p className="font-mono text-sm text-gray-500">accede a estos y miles más con tu suscripción.</p>
          </div>

          <Link to="/prompts" className="hidden md:flex items-center text-sm font-bold text-brand-text hover:translate-x-1 transition-transform ml-4">
            VISTA PREVIA <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-6 w-max animate-marquee hover:pause">
            {marqueePrompts.map((prompt, index) => (
              <Link
                to={`/prompts/${prompt.id}`}
                key={`${prompt.id}-${index}`}
                className="w-[280px] md:w-[320px] flex-shrink-0 group relative bg-brand-bg rounded-lg overflow-hidden border border-transparent hover:border-black transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl block"
              >
                {/* Image or Text Preview Area */}
                <div className="aspect-square w-full overflow-hidden relative bg-white border-b border-gray-100 flex items-start justify-start">
                  {prompt.image_url ? (
                    <img
                      src={prompt.image_url}
                      alt={prompt.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full p-6 bg-[#FDFCFC] group-hover:bg-[#F5F3F1] transition-colors overflow-hidden relative">
                      {/* Text Preview Snippet - No Icon Placeholder */}
                      <div className="font-mono text-[10px] leading-relaxed text-gray-400 select-none break-words opacity-70">
                        {prompt.content || prompt.description}
                      </div>
                      {/* Fade effect at bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent group-hover:from-[#F5F3F1]" />

                      {/* Category Tag overlay */}
                      <div className="absolute bottom-4 left-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300 border border-gray-200 px-1 py-0.5 rounded">
                          {prompt.category?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <span className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded flex items-center gap-1">
                      <Lock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Premium</span>
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-sm truncate">{prompt.title}</h3>
                    <BadgeCheck size={14} className="text-blue-500 flex-shrink-0" />
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 font-sans leading-relaxed">
                    {prompt.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex gap-1">
                      <span className="text-[9px] bg-[#F5F3F1] px-2 py-1 rounded text-gray-600 font-mono uppercase">
                        {prompt.category}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 md:hidden flex justify-center px-4">
          <Link to="/prompts" className="flex items-center text-sm font-bold text-brand-text">
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
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PromptGrid;