import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

const NotFound: React.FC = () => {
    useEffect(() => {
        document.title = 'Página no encontrada · 404 | Alpacka';
        return () => { document.title = 'Banco de Prompts de IA · +1.000 prompts para ChatGPT, Claude y Gemini | Alpacka'; };
    }, []);

    return (
        <div className="relative min-h-[70vh] overflow-x-clip bg-background bg-radial-glow font-space text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

            <div className="animate-fade-up relative mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">

                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]"></span>
                    <span>Error 404</span>
                </div>

                <p className="mb-4 font-mono text-7xl font-medium leading-none tracking-tight text-foreground sm:text-8xl">
                    4<span className="text-accent">0</span>4
                </p>

                <h1 className="mb-4 text-balance text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                    Esta página no existe o cambió de lugar.
                </h1>
                <p className="mb-10 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Puede que el enlace esté mal escrito o que hayamos movido el contenido.
                    Lo que seguro sigue en su sitio: más de 1.000 prompts listos para usar.
                </p>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <Link
                        to="/prompts"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_20px_oklch(0.86_0.09_90_/_0.2)] transition hover:opacity-90"
                    >
                        <Search size={15} />
                        Explorar los prompts
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-secondary"
                    >
                        <ArrowLeft size={15} />
                        Volver al inicio
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default NotFound;
