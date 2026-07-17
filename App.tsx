/// <reference types="vite/client" />
import React from 'react';
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
const Admin = React.lazy(() => import('./pages/Admin'));
const Skills = React.lazy(() => import('./pages/Skills'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const AdminBlog = React.lazy(() => import('./pages/AdminBlog'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Checkout = React.lazy(() => import('./pages/Checkout'));

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Canonical por ruta. El dominio canónico es www.alpackaai.xyz: sin esto,
// cada ruta de la SPA heredaría un mismo canonical estático (y Google
// trataría todas las páginas como duplicados de la home).
const CANONICAL_ORIGIN = 'https://www.alpackaai.xyz';

const Canonical = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    // pathname sin query string: /login?redirect=... canonicaliza a /login
    link.href = `${CANONICAL_ORIGIN}${pathname}`;
  }, [pathname]);

  return null;
};

// Transición sutil entre páginas: fade CSS que se re-dispara al cambiar la key
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();

  // Las rutas de listado/categoría de prompts comparten la misma vista:
  // no disparamos la transición al cambiar de categoría (eso ya se anima dentro).
  const transitionKey = React.useMemo(() => {
    if (pathname === '/prompts' || pathname.startsWith('/prompts/categoria')) return '/prompts';
    return pathname;
  }, [pathname]);

  return <div key={transitionKey} className="animate-fade-in">{children}</div>;
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
      <Canonical />
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
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/ebook" element={<Ebook />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </React.Suspense>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;