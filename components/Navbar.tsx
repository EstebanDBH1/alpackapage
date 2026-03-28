import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AlpacaIcon from './AlpacaIcon';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsDropdownOpen(false);
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getInitials = () => {
    if (!user) return '?';
    const name = user.user_metadata?.full_name || user.email || '';
    return name.charAt(0).toLowerCase();
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-bg/90 backdrop-blur-xl border-b border-brand-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
            <AlpacaIcon className="w-6 h-6" />
            <span className="font-display italic font-light text-xl text-brand-text leading-none">
              alpacka<span className="not-italic font-sans font-bold text-[13px] text-brand-muted">.ai</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/prompts" className="text-[13px] font-medium text-brand-muted hover:text-brand-text transition-colors px-3 py-2 rounded-lg hover:bg-brand-surface">prompts</Link>
            <Link to="/pricing" className="text-[13px] font-medium text-brand-muted hover:text-brand-text transition-colors px-3 py-2 rounded-lg hover:bg-brand-surface">precios</Link>

            {user ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-8 h-8 bg-brand-text text-brand-bg rounded-full flex items-center justify-center font-semibold text-sm hover:bg-brand-dark transition-all"
                >
                  {getInitials()}
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-border rounded-2xl shadow-xl shadow-[#1A1410]/10 z-20 overflow-hidden py-1.5">
                      <div className="px-4 py-3 border-b border-brand-border">
                        <p className="text-[11px] text-brand-muted truncate font-mono">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-brand-text hover:bg-brand-surface transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User size={14} className="text-brand-muted" /> mi cuenta
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-brand-border text-left"
                      >
                        <LogOut size={14} /> salir
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => navigate('/login')}
                  className="text-[13px] font-medium text-brand-muted hover:text-brand-text px-3 py-2 rounded-lg hover:bg-brand-surface transition-colors"
                >
                  entrar
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="bg-brand-accent text-white px-4 py-2 rounded-lg font-semibold text-[13px] hover:bg-brand-accent-hover transition-all shadow-sm"
                >
                  acceso total
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-brand-muted p-2 rounded-lg hover:bg-brand-surface transition-colors">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-brand-bg/95 backdrop-blur-xl border-b border-brand-border px-5 pt-2 pb-7 space-y-px">
          <Link to="/prompts" className="flex items-center py-3.5 text-sm font-medium text-brand-text border-b border-brand-border/40" onClick={() => setIsOpen(false)}>prompts</Link>
          <Link to="/pricing" className="flex items-center py-3.5 text-sm font-medium text-brand-text border-b border-brand-border/40" onClick={() => setIsOpen(false)}>precios</Link>
          {!user ? (
            <div className="pt-5 space-y-2.5">
              <button onClick={() => { navigate('/login'); setIsOpen(false); }} className="w-full py-3.5 text-sm font-semibold text-brand-text border border-brand-border rounded-xl bg-white">entrar</button>
              <button onClick={() => { navigate('/pricing'); setIsOpen(false); }} className="w-full py-3.5 text-sm font-semibold bg-brand-accent text-white rounded-xl">acceso total</button>
            </div>
          ) : (
            <div className="pt-4 space-y-px">
              <Link to="/dashboard" className="flex items-center gap-2 py-3.5 text-sm font-medium text-brand-text" onClick={() => setIsOpen(false)}>
                <User size={14} className="text-brand-muted" /> mi cuenta
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 py-3.5 text-sm font-medium text-red-500 w-full text-left">
                <LogOut size={14} /> salir
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
