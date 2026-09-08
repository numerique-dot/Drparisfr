import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Facebook, Instagram, Clock, MapPin, Phone, Cookie, Calendar, ArrowUp, MessageCircle, Shield } from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import { useLanguage } from '../lib/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { OpeningStatus } from './OpeningStatus';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowCookieBanner(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => location.pathname === path ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary transition-colors';

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowCookieBanner(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group" onClick={closeMenu}>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-primary transition-colors">
                {COMPANY_INFO.name}
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-5">
              <Link to="/" className={isActive('/')}>{t('home')}</Link>
              <Link to="/services" className={isActive('/services')}>{t('services')}</Link>
              <Link to="/fidelite" className={isActive('/fidelite')}>{t('loyaltyCard')}</Link>
              <Link to="/avant-apres" className={isActive('/avant-apres')}>{t('beforeAfter')}</Link>
              <Link to="/workspace" className={isActive('/workspace')}>{t('clientSpace')}</Link>
              <Link to="/contact" className={isActive('/contact')}>{t('contact')}</Link>
              
              {/* Merchant Admin Link */}
              <Link
                to="/admin"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${
                  location.pathname === '/admin'
                    ? 'bg-purple-900 text-white border-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-primary hover:bg-purple-50 border-slate-200'
                }`}
                title={t('adminSpace')}
              >
                <Shield size={12} className="text-primary" />
                <span className="hidden xl:inline">{t('adminSpace')}</span>
              </Link>
              
              {/* Live Opening Status */}
              <OpeningStatus variant="navbar" className="shrink-0" />

              {/* Language Switcher Component (French, English, Chinese) */}
              <LanguageSwitcher variant="pill" className="shrink-0" />

              <Link 
                to="/reservation" 
                className="bg-primary text-white px-4 py-2 rounded-full hover:bg-accent hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-sm font-bold tracking-wide shadow-md transform hover:-translate-y-0.5 shrink-0"
              >
                {t('bookAppointment')}
              </Link>
            </nav>

            {/* Mobile menu button, Opening Status & Mobile Language Switcher */}
            <div className="md:hidden flex items-center space-x-2">
              <OpeningStatus variant="compact" />
              <LanguageSwitcher variant="mobile" />
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-primary focus:outline-none p-2 rounded-full hover:bg-purple-50 transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-purple-100 absolute w-full shadow-xl rounded-b-2xl animate-fade-in">
            <div className="px-4 pt-3 pb-6 space-y-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 px-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('salonStatusTitle')}</span>
                <OpeningStatus variant="compact" />
              </div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 px-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Langue / Language</span>
                <LanguageSwitcher variant="pill" />
              </div>
              <Link to="/" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-purple-50">{t('home')}</Link>
              <Link to="/services" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-purple-50">{t('services')}</Link>
              <Link to="/fidelite" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-purple-50">{t('loyaltyCard')}</Link>
              <Link to="/avant-apres" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-purple-50">{t('beforeAfter')}</Link>
              <Link to="/workspace" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-purple-50">{t('clientSpace')}</Link>
              <Link to="/contact" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-purple-50">{t('contact')}</Link>
              <Link
                to="/admin"
                onClick={closeMenu}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-purple-900 hover:bg-purple-100 bg-purple-50/80 border border-purple-200 mt-2"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  {t('adminSpace')}
                </span>
                <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                  {language === 'zh' ? '商家专区' : language === 'en' ? 'Merchant' : 'Admin'}
                </span>
              </Link>
              <Link to="/reservation" onClick={closeMenu} className="block px-3 py-3 mt-4 text-center rounded-full text-base font-bold bg-primary text-white shadow-md hover:bg-accent transition-all">
                {t('bookAppointment')}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-24 md:pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-12 pb-6 border-t-4 border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-accent">{t('findUs')}</h3>
              <div className="space-y-3">
                <p className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-purple-400 mt-1" />
                  <span>{COMPANY_INFO.address}</span>
                </p>
                <p className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-purple-400" />
                  <a href={`tel:${COMPANY_INFO.phone.replace(/ /g, '')}`} className="hover:text-accent transition">{COMPANY_INFO.phone}</a>
                </p>
                <p className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-purple-400" />
                  <span>{COMPANY_INFO.schedule}<br /><span className="text-gray-400">{COMPANY_INFO.scheduleSunday}</span></span>
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="md:text-center">
              <h3 className="text-lg font-semibold mb-4 text-accent">{t('quickLinks')}</h3>
              <ul className="space-y-2">
                <li><Link to="/services" className="hover:text-purple-300 transition">{t('services')}</Link></li>
                <li><Link to="/fidelite" className="hover:text-purple-300 transition">{t('loyaltyCard')}</Link></li>
                <li><Link to="/avant-apres" className="hover:text-purple-300 transition">{t('beforeAfter')}</Link></li>
                <li><Link to="/workspace" className="hover:text-purple-300 transition">{t('clientSpace')}</Link></li>
                <li><Link to="/reservation" className="hover:text-purple-300 transition">{t('bookAppointment')}</Link></li>
                <li><Link to="/contact" className="hover:text-purple-300 transition">{t('contact')}</Link></li>
                <li>
                  <Link to="/admin" className="text-accent hover:text-white transition flex items-center md:justify-center gap-1.5 font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{t('adminSpace')} {language === 'zh' ? '(商家管理后台)' : ''}</span>
                  </Link>
                </li>
                <li><Link to="/mentions-legales" className="hover:text-purple-300 transition">Mentions Légales & RGPD</Link></li>
              </ul>
            </div>

            {/* Social */}
            <div className="md:text-right">
              <h3 className="text-lg font-semibold mb-4 text-accent">{t('followUs')}</h3>
              <div className="flex space-x-4 md:justify-end">
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary transition" aria-label="TikTok">
                  <span className="font-bold w-5 h-5 flex items-center justify-center">T</span>
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary transition" aria-label="X (Twitter)">
                  <span className="font-bold w-5 h-5 flex items-center justify-center">X</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {COMPANY_INFO.name}. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Bar (Mobile-first quick actions) */}
      <div 
        className="fixed left-4 right-4 z-40 md:hidden transition-all duration-500 ease-out transform"
        style={{ bottom: showCookieBanner ? 'calc(5.5rem + 16px)' : '16px' }}
      >
        <div className="bg-slate-910 bg-slate-900/95 backdrop-blur-md border border-purple-500/30 text-white rounded-full py-3.5 px-6 shadow-[0_10px_35px_rgba(147,51,234,0.15)] flex items-center justify-around gap-2 max-w-md mx-auto">
          {/* Call option */}
          <a
            href={`tel:${COMPANY_INFO.phone.replace(/ /g, '')}`}
            className="flex flex-col items-center justify-center gap-1.5 flex-1 px-2 text-center text-gray-300 hover:text-white active:scale-95 transition-all"
            id="quick-action-call"
          >
            <div className="bg-purple-950/50 p-2 rounded-full border border-purple-500/20">
              <Phone className="w-4 h-4 text-accent" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase">Appeler</span>
          </a>
          
          <div className="w-[1px] h-8 bg-purple-500/20"></div>

          {/* Google Maps Itinerary */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(COMPANY_INFO.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 flex-1 px-2 text-center text-gray-300 hover:text-white active:scale-95 transition-all"
            id="quick-action-itinerary"
          >
            <div className="bg-purple-950/50 p-2 rounded-full border border-purple-500/20">
              <MapPin className="w-4 h-4 text-accent" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase">Itinéraire</span>
          </a>

          <div className="w-[1px] h-8 bg-purple-500/20"></div>

          {/* Quick Booking Link */}
          <Link
            to="/reservation"
            className="flex flex-col items-center justify-center gap-1.5 flex-1 px-2 text-center text-gray-300 hover:text-white active:scale-95 transition-all"
            id="quick-action-book"
          >
            <div className="bg-primary/30 p-2 rounded-full border border-primary/40 relative">
              <Calendar className="w-4 h-4 text-accent animate-pulse" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-accent font-extrabold">Réserver</span>
          </Link>
        </div>
      </div>

      {/* Floating WhatsApp Contact & Booking Button (Fixed Bottom-Right) */}
      <div 
        className={`fixed z-50 flex flex-col items-end gap-2.5 right-4 sm:right-6 md:right-8 transition-all duration-300 ${
          showCookieBanner ? 'bottom-56 sm:bottom-48' : 'bottom-[88px] sm:bottom-24 md:bottom-8'
        }`}
        id="whatsapp-button-container"
      >
        {/* Interactive Prompt Speech Bubble */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 text-white rounded-2xl py-2 px-3.5 shadow-2xl text-right relative select-none hidden sm:block group-hover:scale-102 transition-all">
          <p className="text-[11px] leading-tight text-purple-100 font-medium">
            Prendre RDV ou poser une question ? <strong className="text-emerald-400 block font-black">Écrivez-nous sur WhatsApp</strong>
          </p>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">07 87 32 49 22</span>
          {/* Bubble Peak */}
          <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-slate-900 border-r border-b border-emerald-500/30 rotate-45"></div>
        </div>

        <a
          href="https://wa.me/33787324922"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center gap-2.5 p-3 sm:px-4 sm:py-3 rounded-full shadow-[0_6px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.65)] transition-all duration-300 hover:scale-105 active:scale-95 group border-2 border-white/30"
          id="floating-whatsapp-btn"
          title="Ouvrir une conversation WhatsApp directement avec le salon (07 87 32 49 22)"
          aria-label="Contacter le salon sur WhatsApp (07 87 32 49 22)"
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]" />
            </div>
          </div>
          <span className="text-xs sm:text-sm font-black tracking-wide hidden sm:inline text-white">
            WhatsApp
          </span>
        </a>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed right-4 sm:right-6 md:right-8 z-40 bg-white/95 text-slate-800 p-2.5 sm:p-3 rounded-full shadow-lg border border-purple-100 hover:bg-primary hover:text-white hover:border-primary hover:shadow-purple-500/30 active:scale-90 transition-all duration-300 group ${
          showScrollTop ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-75 pointer-events-none'
        } ${
          showCookieBanner 
            ? 'bottom-72 sm:bottom-64' 
            : 'bottom-36 sm:bottom-40 md:bottom-24'
        }`}
        aria-label="Retour en haut"
        id="scroll-to-top"
      >
        <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
      </button>

      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md text-white p-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-purple-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="bg-gray-800 p-2.5 rounded-full hidden sm:block shrink-0">
                 <Cookie className="h-6 w-6 text-accent" />
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {t('cookieBannerText')}
                <br className="hidden md:block" />
                En continuant votre navigation, vous acceptez notre <Link to="/mentions-legales" className="underline text-white hover:text-accent transition-colors">{t('cookieBannerPrivacy')}</Link>.
              </p>
            </div>
            <div className="flex w-full sm:w-auto gap-3">
                <button 
                  onClick={acceptCookies}
                  className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-accent transition transform active:scale-95 shadow-lg"
                >
                  {t('accept')}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;