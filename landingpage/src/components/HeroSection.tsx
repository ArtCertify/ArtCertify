import React from 'react';
import { 
  ShieldCheckIcon, 
  CubeTransparentIcon, 
  LockClosedIcon 
} from '@heroicons/react/24/outline';
import CertificationBackgroundPattern from './CertificationBackgroundPattern';

const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl">
      {/* Background Pattern with Icons - highly visible */}
      <CertificationBackgroundPattern 
        density="high"
        opacity="prominent"
        className="z-0"
      />
      
      {/* Background Gradient - very reduced opacity to show icons clearly */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-blue-900/70" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full mb-8 animate-fade-in">
            <ShieldCheckIcon className="w-4 h-4 text-primary-400 mr-2" />
            <span className="text-primary-300 text-xs font-medium">Certificazione Blockchain su Algorand</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight animate-fade-in">
            Certificazioni digitali
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              immutabili e sicure su Blockchain
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            ArtCertify è la piattaforma professionale per creare certificazioni digitali immutabili 
            di documenti, artefatti e contenuti attraverso la tecnologia blockchain Algorand.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16 animate-slide-up">
             <a
               href="https://app.artcertify.com"
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200 min-w-[180px] justify-center"
             >
              Inizia Ora
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 hover:border-slate-600 transition-all duration-200 min-w-[180px] justify-center"
            >
              Scopri di più
            </button>
          </div>

           {/* Trust Indicators */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
             <div className="flex flex-col items-center p-6 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-primary-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center mb-3">
                <ShieldCheckIcon className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-white font-semibold mb-1 text-sm">100% Sicuro</h3>
              <p className="text-slate-400 text-xs text-center">
                Certificazioni immutabili e verificabili su blockchain
              </p>
            </div>

             <div className="flex flex-col items-center p-6 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-success-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 bg-success-500/10 rounded-lg flex items-center justify-center mb-3">
                <CubeTransparentIcon className="w-5 h-5 text-success-500" />
              </div>
              <h3 className="text-white font-semibold mb-1 text-sm">Decentralizzato</h3>
              <p className="text-slate-400 text-xs text-center">
                Storage IPFS distribuito per massima resilienza
              </p>
            </div>

             <div className="flex flex-col items-center p-6 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3">
                <LockClosedIcon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-1 text-sm">Privacy First</h3>
              <p className="text-slate-400 text-xs text-center">
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

