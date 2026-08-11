import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SavedPrompts from '../components/SavedPrompts';
import { ChevronLeft, LayoutDashboard } from 'lucide-react';
import {
    BG, BG_WARM, TEXT, TEXT_MED, BORDER, ACCENT, FONT,
    useEuclidFont, LandingStyles,
} from '../components/darkKit';

const SavedPromptsPage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEuclidFont();

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
        <div className="bp-scope" style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: FONT }}>
            <LandingStyles />
            <div className="mx-auto max-w-3xl px-5 sm:px-8 pt-16 space-y-4">
                <div className="animate-pulse" style={{ height: 14, width: 90, borderRadius: 7, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }} />
                <div className="animate-pulse" style={{ height: 40, width: 260, borderRadius: 12, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }} />
                <div className="grid grid-cols-2 gap-3" style={{ marginTop: 28 }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse" style={{ height: 104, borderRadius: 14, backgroundColor: BG_WARM, border: `1px solid ${BORDER}` }} />
                    ))}
                </div>
            </div>
        </div>
    );

    const subNavLink: React.CSSProperties = {
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontSize: 13.5, color: TEXT_MED, textDecoration: 'none',
        background: 'none', border: 'none', cursor: 'pointer',
    };

    return (
        <div className="bp-scope" style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh', fontFamily: FONT, paddingBottom: 60 }}>
            <LandingStyles />

            {/* Sub-nav */}
            <div
                style={{
                    position: 'sticky', top: 0, zIndex: 40,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                    borderTop: `1px solid ${BORDER}`,
                    borderBottom: `1px solid ${BORDER}`,
                }}
            >
                <div className="mx-auto max-w-3xl px-5 sm:px-8 flex items-center justify-between" style={{ height: 52 }}>
                    <button onClick={() => navigate(-1)} style={subNavLink}>
                        <ChevronLeft size={15} /> Volver
                    </button>
                    <Link to="/dashboard" style={subNavLink}>
                        <LayoutDashboard size={14} /> Mi cuenta
                    </Link>
                </div>
            </div>

            {/* Header */}
            <div className="mx-auto max-w-3xl px-5 sm:px-8 pt-12 pb-7">
                <div
                    className="inline-flex items-center gap-2 rounded-full"
                    style={{ backgroundColor: BG_WARM, border: `1px solid ${BORDER}`, padding: '5px 13px', marginBottom: 18 }}
                >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: ACCENT }} />
                    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: TEXT_MED }}>
                        Tu colección
                    </span>
                </div>

                <h1
                    style={{
                        fontWeight: 600,
                        fontSize: 'clamp(1.9rem, 4vw, 2.6rem)',
                        lineHeight: 1.1,
                        letterSpacing: '-0.035em',
                        marginBottom: 12,
                    }}
                >
                    Prompts guardados
                </h1>
                <p style={{ color: TEXT_MED, fontSize: 16, lineHeight: 1.7 }}>
                    Todos los prompts que marcaste como favoritos.
                </p>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-3xl px-5 sm:px-8">
                <SavedPrompts userId={user.id} />
            </div>
        </div>
    );
};

export default SavedPromptsPage;
