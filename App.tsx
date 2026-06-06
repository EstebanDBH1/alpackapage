/// <reference types="vite/client" />
import React from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Pricing from './pages/Pricing';
import Prompts from './pages/Prompts';
import PromptDetail from './pages/PromptDetail';
import Dashboard from './pages/Dashboard';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import PaymentSuccess from './pages/PaymentSuccess';
import SavedPromptsPage from './pages/SavedPromptsPage';
import Ebook from './pages/Ebook';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Transición sutil entre páginas (solo opacidad, para no romper los elementos sticky)
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const ref = React.useRef<HTMLDivElement>(null);

  // Las rutas de listado/categoría de prompts comparten la misma vista:
  // no disparamos la transición al cambiar de categoría (eso ya se anima dentro).
  const transitionKey = React.useMemo(() => {
    if (pathname === '/prompts' || pathname.startsWith('/prompts/categoria')) return '/prompts';
    return pathname;
  }, [pathname]);

  useGSAP(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      gsap.set(ref.current, { opacity: 1 });
      return;
    }
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
  }, { dependencies: [transitionKey] });

  return <div ref={ref}>{children}</div>;
};

const STANDALONE_ROUTES = ['/ebook'];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const isStandalone = STANDALONE_ROUTES.includes(pathname);

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text font-sans antialiased selection:bg-zinc-900 selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prompts" element={<Prompts />} />
          <Route path="/prompts/categoria/:category" element={<Prompts />} />
          <Route path="/prompts/:id" element={<PromptDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guardados" element={<SavedPromptsPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/ebook" element={<Ebook />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;