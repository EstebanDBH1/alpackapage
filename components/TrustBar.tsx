import React from 'react';

const models = [
  { name: 'ChatGPT', note: 'OpenAI' },
  { name: 'Claude', note: 'Anthropic' },
  { name: 'Gemini', note: 'Google' },
  { name: 'Mistral', note: 'Mistral AI' },
  { name: 'Midjourney', note: 'Imágenes' },
  { name: 'DALL·E', note: 'OpenAI' },
  { name: 'Perplexity', note: 'Búsqueda' },
];

const TrustBar: React.FC = () => {
  return (
    <div className="py-10 border-y" style={{ backgroundColor: '#FAF9F5', borderColor: '#E3DCD3' }}>
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase flex-shrink-0" style={{ color: '#C8BEB5' }}>
            compatible con
          </p>
          <div className="w-px h-4 self-center hidden sm:block" style={{ backgroundColor: '#E3DCD3' }} />
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {models.map(m => (
              <div key={m.name} className="flex items-center gap-1.5">
                <span className="font-semibold text-sm" style={{ color: '#1D1B18' }}>{m.name}</span>
                <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: '#C8BEB5' }}>{m.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustBar;
