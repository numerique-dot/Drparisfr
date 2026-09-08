import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Reservation from './pages/Reservation';
import Legal from './pages/Legal';
import ImageGenerator from './pages/ImageGenerator';
import BeforeAfterGallery from './pages/BeforeAfter';
import Testimonials from './pages/Testimonials';
import Workspace from './pages/Workspace';
import AdminDashboard from './pages/AdminDashboard';
import LoyaltyCardPage from './pages/LoyaltyCard';

// ScrollToTop component to reset scroll on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  useEffect(() => {
    // Migration: ensure user's browser loads the brand new nail art, lash extensions, and hand/foot care images
    const hasMigrated = localStorage.getItem('dr_nail_lash_v3');
    if (!hasMigrated) {
      localStorage.removeItem('dr_recent_realizations');
      localStorage.removeItem('dr_banner_configs');
      localStorage.setItem('dr_nail_lash_v3', 'true');
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/fidelite" element={<LoyaltyCardPage />} />
          <Route path="/carte-fidelite" element={<LoyaltyCardPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/avant-apres" element={<BeforeAfterGallery />} />
          <Route path="/studio" element={<ImageGenerator />} />
          <Route path="/temoignages" element={<Testimonials />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/mentions-legales" element={<Legal />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;