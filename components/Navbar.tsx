import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AlpacaIcon from './AlpacaIcon';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('subscription_status')
        .eq('customer_id', user.id)
        .single();

      if (sub && (sub.subscription_status === 'active' || sub.subscription_status === 'trialing')) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } else {
      setIsSubscribed(false);
    }
  };

  React.useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUser();
      } else {
        setIsSubscribed(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    setIsOpen(false);
    navigate('/');
  };

  const getInitials = () => {
    if (!user) return '?';
    const name = user.user_metadata?.full_name || user.email;
    return name.charAt(0).toUpperCase();
  };

  const handleLoginClick = () => {
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-bg/90 backdrop-blur-md border-b border-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <Link to="/" className="font-bold text-xl tracking-tighter">
              <AlpacaIcon />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/prompts" className="text-sm font-bold hover:underline underline-offset-4 decoration-2">Prompts</Link>
            <Link to="/pricing" className="text-sm font-bold hover:underline underline-offset-4 decoration-2">Precios</Link>

            {/* User Actions */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 bg-black border-2 border-black text-white rounded-full flex items-center justify-center font-bold text-sm hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                  {getInitials()}
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-[10px] font-mono text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-3 text-xs font-bold hover:bg-black hover:text-white transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User size={14} /> Mi Cuenta
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-3 text-xs font-bold hover:bg-black hover:text-white transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors border-t border-gray-100"
                      >
                        <LogOut size={14} /> Salir
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="bg-brand-text text-brand-bg px-6 py-2 rounded-none border-2 border-black font-bold text-sm hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Entrar
              </button>
            )}

            {!user && (
              <button
                onClick={() => navigate('/pricing')}
                className="bg-brand-bg text-brand-text px-6 py-2 rounded-none border-2 border-black font-bold text-sm hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                Acceso Total
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-text hover:text-gray-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-brand-bg border-b border-brand-surface absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
            <Link to="/prompts" className="block px-3 py-2 text-base font-bold hover:bg-brand-surface w-full text-center" onClick={() => setIsOpen(false)}>Prompts</Link>
            <Link to="/pricing" className="block px-3 py-2 text-base font-bold hover:bg-brand-surface w-full text-center" onClick={() => setIsOpen(false)}>Precios</Link>

            {user ? (
              <>
                <div className="py-4 border-t border-brand-surface w-full flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg mb-2">
                    {getInitials()}
                  </div>
                  <p className="text-[10px] font-mono text-gray-400 mb-2">{user.email}</p>
                  <Link to="/dashboard" className="block px-3 py-2 text-base font-bold hover:bg-brand-surface w-full text-center" onClick={() => setIsOpen(false)}>Mi Cuenta</Link>
                  <Link to="/dashboard" className="block px-3 py-2 text-base font-bold hover:bg-brand-surface w-full text-center" onClick={() => setIsOpen(false)}>Dashboard</Link>
                  <button
                    onClick={handleLogout}
                    className="block px-3 py-2 text-base font-bold text-red-600 hover:bg-brand-surface w-full text-center"
                  >
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 pb-2 w-full space-y-3">
                <button
                  onClick={handleLoginClick}
                  className="bg-brand-text text-brand-bg px-8 py-3 rounded-none border-2 border-black font-bold text-sm w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Entrar
                </button>
                <button
                  onClick={() => { navigate('/pricing'); setIsOpen(false); }}
                  className="bg-brand-bg text-brand-text px-8 py-3 rounded-none border-2 border-black font-bold text-sm w-full"
                >
                  Acceso Total
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;