import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-900/95 backdrop-blur-sm shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/logo.png" alt="ArtCertify Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-white">ArtCertify</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-slate-300 hover:text-white transition-colors duration-200"
            >
              Soluzioni
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-slate-300 hover:text-white transition-colors duration-200"
            >
              Come Funziona
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="text-slate-300 hover:text-white transition-colors duration-200"
            >
              FAQ
            </button>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <a
              href="https://app.artcertify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              APRI APP
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-slate-800 animate-slide-up">
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Soluzioni
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Come Funziona
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              FAQ
            </button>
            <a
              href="https://app.artcertify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block mx-4 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-center font-medium rounded-lg transition-all duration-200"
            >
              APRI APP
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

