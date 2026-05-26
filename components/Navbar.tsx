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
    <nav
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderColor: '#e4e4e1',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <AlpacaIcon className="w-5 h-5" />
            <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontStyle: 'italic', fontWeight: 300, fontSize: 18, color: '#1a1a1a', lineHeight: 1 }}>
              alpacka<span style={{ fontStyle: 'normal', fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: '#a8a5a1' }}>.ai</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-0.5">
            <Link
              to="/prompts"
              className="text-[13px] font-medium px-3 py-2 rounded-lg transition-colors"
              style={{ color: '#787774' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#1a1a1a';
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f7f6f3';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#787774';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              prompts
            </Link>
            <Link
              to="/pricing"
              className="text-[13px] font-medium px-3 py-2 rounded-lg transition-colors"
              style={{ color: '#787774' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#1a1a1a';
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f7f6f3';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#787774';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              precios
            </Link>

            {user ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all"
                  style={{ backgroundColor: '#1a1a1a', color: 'white' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#333')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a1a')}
                >
                  {getInitials()}
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl z-20 overflow-hidden py-1.5"
                      style={{ backgroundColor: 'white', border: '1px solid #e4e4e1', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                    >
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0efec' }}>
                        <p className="font-mono text-[11px] truncate" style={{ color: '#a8a5a1' }}>{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-3 text-sm transition-colors"
                        style={{ color: '#1a1a1a' }}
                        onClick={() => setIsDropdownOpen(false)}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f7f6f3')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                      >
                        <User size={14} style={{ color: '#a8a5a1' }} /> mi cuenta
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors"
                        style={{ color: '#ef4444', borderTop: '1px solid #f0efec' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#fff5f5')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
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
                  className="text-[13px] font-medium px-3 py-2 rounded-lg transition-colors"
                  style={{ color: '#787774' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = '#1a1a1a';
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f7f6f3';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = '#787774';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  entrar
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="font-semibold text-[13px] px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: '#000', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#222')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#000')}
                >
                  acceso total
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: '#787774' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f7f6f3')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="md:hidden border-b px-5 pt-2 pb-7 space-y-px"
          style={{ backgroundColor: 'rgba(255,255,255,0.97)', borderColor: '#e4e4e1' }}
        >
          <Link
            to="/prompts"
            className="flex items-center py-3.5 text-sm font-medium"
            style={{ color: '#1a1a1a', borderBottom: '1px solid #f0efec' }}
            onClick={() => setIsOpen(false)}
          >
            prompts
          </Link>
          <Link
            to="/pricing"
            className="flex items-center py-3.5 text-sm font-medium"
            style={{ color: '#1a1a1a', borderBottom: '1px solid #f0efec' }}
            onClick={() => setIsOpen(false)}
          >
            precios
          </Link>
          {!user ? (
            <div className="pt-5 space-y-2.5">
              <button
                onClick={() => { navigate('/login'); setIsOpen(false); }}
                className="w-full py-3.5 text-sm font-semibold rounded-xl transition-colors"
                style={{ color: '#1a1a1a', border: '1px solid #e4e4e1', backgroundColor: 'white' }}
              >
                entrar
              </button>
              <button
                onClick={() => { navigate('/pricing'); setIsOpen(false); }}
                className="w-full py-3.5 text-sm font-semibold rounded-xl transition-all"
                style={{ backgroundColor: '#000', color: 'white' }}
              >
                acceso total
              </button>
            </div>
          ) : (
            <div className="pt-4 space-y-px">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 py-3.5 text-sm font-medium"
                style={{ color: '#1a1a1a' }}
                onClick={() => setIsOpen(false)}
              >
                <User size={14} style={{ color: '#a8a5a1' }} /> mi cuenta
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-3.5 text-sm font-medium w-full text-left"
                style={{ color: '#ef4444' }}
              >
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
