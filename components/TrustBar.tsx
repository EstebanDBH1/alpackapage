import React from 'react';

const TrustBar: React.FC = () => {
    return (
        <div className="py-12 md:py-14 bg-white border-y border-brand-border">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center font-mono text-[10px] text-brand-muted/40 tracking-[0.2em] mb-10 uppercase">
                    compatible con los mejores modelos del mundo
                </p>
                <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
                    {['openai', 'anthropic', 'mistral', 'midjourney', 'google'].map((brand, i) => (
                        <span
                            key={brand}
                            className="text-base md:text-lg font-bold text-brand-text/20 tracking-tight hover:text-brand-text/35 transition-colors cursor-default select-none"
                            style={{ fontStyle: brand === 'anthropic' ? 'italic' : 'normal', fontFamily: brand === 'mistral' ? '"Space Mono", monospace' : undefined }}
                        >
                            {brand}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrustBar;
