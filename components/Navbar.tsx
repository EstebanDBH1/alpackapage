import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AlpacaIcon from './AlpacaIcon';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Función de verificación de usuario corregida
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  useEffect(() => {
    checkUser();

    // Escuchar cambios en la sesión para actualizar el estado automáticamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Lógica de Logout corregida (supabase.auth.signOut)
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
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <AlpacaIcon className="w-8 h-8" />
            <span className="font-black text-xl tracking-tighter text-zinc-900 lowercase"></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/prompts" className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors lowercase">prompts</Link>
            <Link to="/pricing" className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors lowercase">precios</Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-9 h-9 bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-full flex items-center justify-center font-bold text-sm hover:bg-zinc-200 transition-all lowercase"
                >
                  {getInitials()}
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-zinc-200 rounded-2xl shadow-xl z-20 overflow-hidden py-2">
                      <div className="px-4 py-3 border-b border-zinc-50 mb-1">
                        <p className="text-[10px] font-mono text-zinc-400 truncate uppercase tracking-widest">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors lowercase"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User size={16} className="text-zinc-400" /> mi cuenta
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors border-t border-zinc-50 mt-1 lowercase text-left"
                      >
                        <LogOut size={16} /> salir
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-bold text-zinc-600 hover:text-zinc-900 px-4 py-2 lowercase transition-colors"
                >
                  entrar
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="bg-zinc-900 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-black transition-all lowercase"
                >
                  acceso total
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-900 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-zinc-100 px-4 pt-2 pb-6 space-y-4 shadow-xl">
          <Link to="/prompts" className="block py-3 text-lg font-bold text-zinc-900 lowercase border-b border-zinc-50" onClick={() => setIsOpen(false)}>prompts</Link>
          <Link to="/pricing" className="block py-3 text-lg font-bold text-zinc-900 lowercase border-b border-zinc-50" onClick={() => setIsOpen(false)}>precios</Link>
          {!user ? (
            <div className="pt-4 space-y-3">
              <button onClick={() => { navigate('/login'); setIsOpen(false); }} className="w-full py-4 text-lg font-bold text-zinc-900 border border-zinc-200 rounded-xl lowercase">entrar</button>
              <button onClick={() => { navigate('/pricing'); setIsOpen(false); }} className="w-full py-4 text-lg font-bold bg-zinc-900 text-white rounded-xl lowercase">acceso total</button>
            </div>
          ) : (
            <div className="pt-4 space-y-3">
              <Link to="/dashboard" className="block py-3 text-lg font-bold text-zinc-900 lowercase" onClick={() => setIsOpen(false)}>mi cuenta</Link>
              <button onClick={handleLogout} className="w-full py-4 text-lg font-bold text-red-500 text-left lowercase">salir</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;