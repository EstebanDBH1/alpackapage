import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bot, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  React.useEffect(() => {
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
        }
      }
    };

    checkUser();
  }, []);

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
              Alpacka.<span className="">ai</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/prompts" className="text-sm font-bold hover:underline underline-offset-4 decoration-2">Prompts</Link>
            <Link to="/pricing" className="text-sm font-bold hover:underline underline-offset-4 decoration-2">Precios</Link>

            {/* User Actions */}
            {user && (
              <Link to="/dashboard" className="text-sm font-bold hover:underline underline-offset-4 decoration-2 flex items-center gap-2">
                <User size={16} /> Mi Cuenta
              </Link>
            )}

            {!isSubscribed && (
              <button
                onClick={handleLoginClick}
                className="bg-brand-text text-brand-bg px-6 py-2 rounded-sm font-bold text-sm hover:opacity-80 transition-opacity"
              >
                Obtener Acceso ($3.90/mes)
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

            {user && (
              <Link to="/dashboard" className="block px-3 py-2 text-base font-bold hover:bg-brand-surface w-full text-center" onClick={() => setIsOpen(false)}>Mi Cuenta</Link>
            )}

            {!isSubscribed && (
              <div className="pt-4 pb-2 w-full">
                <button
                  onClick={handleLoginClick}
                  className="bg-brand-text text-brand-bg px-8 py-3 rounded-sm font-bold text-sm w-full"
                >
                  Obtener Acceso ($3.90/mes)
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