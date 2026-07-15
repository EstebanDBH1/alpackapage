/// <reference types="vite/client" />
import React from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Code-splitting por ruta: cada página se descarga solo cuando se visita.
const Login = React.lazy(() => import('./pages/Login'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Prompts = React.lazy(() => import('./pages/Prompts'));
const PromptDetail = React.lazy(() => import('./pages/PromptDetail'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess'));
const SavedPromptsPage = React.lazy(() => import('./pages/SavedPromptsPage'));
const Ebook = React.lazy(() => import('./pages/Ebook'));

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

// La home es una landing autocontenida: trae su propio header y footer.
const STANDALONE_ROUTES = ['/', '/ebook'];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const isStandalone = STANDALONE_ROUTES.includes(pathname);

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-space antialiased selection:bg-primary selection:text-primary-foreground">
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
        <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
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
        </React.Suspense>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;