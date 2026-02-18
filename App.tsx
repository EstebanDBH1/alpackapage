/// <reference types="vite/client" />
import React from 'react';
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

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text font-mono selection:bg-black selection:text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prompts" element={<Prompts />} />
            <Route path="/prompts/:id" element={<PromptDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;