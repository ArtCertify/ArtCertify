import React from 'react';
import { 
  ShieldCheckIcon, 
  CubeTransparentIcon, 
  LockClosedIcon 
} from '@heroicons/react/24/outline';
import CertificationBackgroundPattern from './CertificationBackgroundPattern';

const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl">
      {/* Background Pattern with Icons */}
      <CertificationBackgroundPattern 
        density="high"
        opacity="prominent"
        className="z-0"
      />
      
      {/* Background Gradient - single color as before */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-blue-900/70" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center">
          {/* Badge with shimmer effect - smaller */}
          <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/30 rounded-full mb-6 animate-fade-in-down backdrop-blur-sm hover:scale-105 transition-transform duration-300 cursor-default">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-primary-400 mr-1.5 animate-pulse" />
            <span className="text-primary-300 text-xs font-medium">Certificazione Blockchain su Algorand</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
          </div>

          {/* Main Heading with gradient animation - smaller */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight animate-fade-in-up">
            Certificazioni digitali
            <br />
            <span className="inline-block bg-gradient-to-r from-primary-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animated-gradient bg-300">
              immutabili e sicure
            </span>
            <br />
            <span className="text-slate-200">su Blockchain</span>
          </h1>

          {/* Subtitle - smaller */}
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            ArtCertify è la piattaforma professionale per creare 
            <span className="text-white font-semibold"> certificazioni digitali immutabili </span>
            di documenti, artefatti e contenuti attraverso la tecnologia 
            <span className="text-primary-400 font-semibold"> blockchain Algorand</span>.
          </p>

          {/* CTA Buttons - same style as login button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 animate-scale-in" style={{ animationDelay: '0.4s' }}>
             <a
               href="https://app.artcertify.com"
               target="_blank"
               rel="noopener noreferrer"
               className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
             >
              INIZIA ORA
            </a>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-200 flex items-center justify-center gap-3"
            >
              Scopri di più
            </button>
          </div>

           {/* Trust Indicators with stagger animation - smaller and more compact */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto stagger-fade-in">
             <div className="group relative flex flex-col items-center p-4 glass-effect rounded-xl border border-slate-700/50 hover:border-primary-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-default">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheckIcon className="w-5 h-5 text-primary-400 group-hover:animate-pulse" />
              </div>
              <h3 className="text-white font-bold mb-1.5 text-sm">100% Sicuro</h3>
              <p className="text-slate-300 text-xs text-center leading-relaxed">
                Certificazioni immutabili e verificabili su blockchain
              </p>
            </div>

             <div className="group relative flex flex-col items-center p-4 glass-effect rounded-xl border border-slate-700/50 hover:border-success-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-default">
              <div className="absolute inset-0 bg-gradient-to-br from-success-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-success-500/20 to-success-600/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <CubeTransparentIcon className="w-5 h-5 text-success-500 group-hover:animate-pulse" />
              </div>
              <h3 className="text-white font-bold mb-1.5 text-sm">Decentralizzato</h3>
              <p className="text-slate-300 text-xs text-center leading-relaxed">
                Storage IPFS distribuito per massima resilienza
              </p>
            </div>

             <div className="group relative flex flex-col items-center p-4 glass-effect rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-default">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <LockClosedIcon className="w-5 h-5 text-purple-400 group-hover:animate-pulse" />
              </div>
              <h3 className="text-white font-bold mb-1.5 text-sm">Privacy First</h3>
              <p className="text-slate-300 text-xs text-center leading-relaxed">
                Nessuna chiave privata memorizzata, solo tu hai il controllo
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

