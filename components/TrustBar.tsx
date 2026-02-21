import React from 'react';

const TrustBar: React.FC = () => {
    return (
        <div className="py-12 border-y border-gray-100 bg-brand-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center font-mono text-[10px] text-gray-400 tracking-widest mb-10">
                    el estándar utilizado por las mentes más brillantes de la industria
                </p>

                <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-30 grayscale contrast-200">
                    <span className="text-xl md:text-3xl font-black font-sans tracking-tighter">openai</span>
                    <span className="text-xl md:text-3xl font-black font-serif italic">anthropic</span>
                    <span className="text-xl md:text-3xl font-black font-mono">mistral</span>
                    <span className="text-xl md:text-3xl font-black font-sans tracking-[0.2em] text-[12px] md:text-[18px]">midjourney</span>
                    <span className="text-xl md:text-3xl font-black font-serif">GOOGLE</span>
                </div>
            </div>
        </div>
    );
};

export default TrustBar;
