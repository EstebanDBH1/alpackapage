import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';
import SavedPrompts from '../components/SavedPrompts';
import { ChevronLeft, LayoutDashboard } from 'lucide-react';

const SavedPromptsPage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) { navigate('/login?redirect=/guardados'); return; }
            setUser(user);
            setLoading(false);
        });
    }, [navigate]);

    if (loading) return (
        <div className="min-h-screen" style={{ backgroundColor: '#FAF9F5' }}>
            <div className="max-w-3xl mx-auto px-6 pt-16 space-y-4">
                <div className="h-4 w-20 rounded-full animate-pulse" style={{ backgroundColor: '#E3DCD3' }} />
                <div className="h-9 w-56 rounded-xl animate-pulse" style={{ backgroundColor: '#E3DCD3' }} />
                <div className="grid grid-cols-2 gap-3 mt-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 rounded-xl animate-pulse" style={{ backgroundColor: '#F0EAE1' }} />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: '#FAF9F5' }}>
            <Helmet>
                <title>Prompts guardados | alpacka.ai</title>
            </Helmet>

            {/* Sub-nav */}
            <div
                className="sticky top-16 z-40 border-b backdrop-blur-md"
                style={{ backgroundColor: 'rgba(250,249,245,0.92)', borderColor: '#E3DCD3' }}
            >
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest uppercase transition-colors"
                        style={{ color: '#8B7E74' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C96A3C')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#8B7E74')}
                    >
                        <ChevronLeft size={14} />
                        volver
                    </button>

                    <Link
                        to="/dashboard"
                        className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest uppercase transition-colors"
                        style={{ color: '#8B7E74' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C96A3C')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#8B7E74')}
                    >
                        <LayoutDashboard size={13} />
                        dashboard
                    </Link>
                </div>
            </div>

            {/* Header */}
            <div className="max-w-3xl mx-auto px-6 pt-12 pb-8">
                <p className="font-mono text-[11px] tracking-[0.18em] uppercase mb-4 flex items-center gap-2" style={{ color: '#8B7E74' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    tu colección
                </p>
                <h1 className="font-display font-bold leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#1D1B18' }}>
                    Prompts guardados
                </h1>
                <p className="text-base mt-3" style={{ color: '#8B7E74' }}>
                    Todos los prompts que marcaste como favoritos.
                </p>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6">
                <SavedPrompts userId={user.id} />
            </div>
        </div>
    );
};

export default SavedPromptsPage;
