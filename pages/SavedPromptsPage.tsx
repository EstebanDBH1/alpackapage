import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SavedPrompts from '../components/SavedPrompts';
import { ChevronLeft, LayoutDashboard } from 'lucide-react';

const SavedPromptsPage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // getSession lee del almacenamiento local: la página aparece al instante
        supabase.auth.getSession().then(({ data: { session } }) => {
            const user = session?.user;
            if (!user) { navigate('/login?redirect=/guardados'); return; }
            setUser(user);
            setLoading(false);
        });
    }, [navigate]);

    if (loading) return (
        <div className="min-h-screen bg-background bg-radial-glow font-space">
            <div className="max-w-3xl mx-auto px-6 pt-16 space-y-4">
                <div className="h-4 w-20 animate-pulse rounded-full bg-card" />
                <div className="h-9 w-56 animate-pulse rounded-xl bg-card" />
                <div className="mt-8 grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 animate-pulse rounded-xl bg-card" />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen overflow-x-clip bg-background bg-radial-glow pb-24 font-space text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

            <div className="relative">
            {/* Sub-nav */}
            <div className="sticky top-[70px] z-40 border-b border-border/60 bg-background/80 backdrop-blur">
                <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ChevronLeft size={14} />
                        volver
                    </button>

                    <Link
                        to="/dashboard"
                        className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <LayoutDashboard size={13} />
                        dashboard
                    </Link>
                </div>
            </div>

            {/* Header */}
            <div className="max-w-3xl mx-auto px-6 pt-12 pb-8">
                <p className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]" />
                    tu colección
                </p>
                <h1 className="text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
                    Prompts guardados
                </h1>
                <p className="mt-3 text-base text-muted-foreground">
                    Todos los prompts que marcaste como favoritos.
                </p>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6">
                <SavedPrompts userId={user.id} />
            </div>
            </div>
        </div>
    );
};

export default SavedPromptsPage;
