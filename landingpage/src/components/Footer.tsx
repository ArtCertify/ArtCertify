import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <img src="/logo.png" alt="ArtCertify Logo" className="w-7 h-7 object-contain" />
              <span className="text-lg font-bold text-white">ArtCertify</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              Piattaforma professionale per certificare documenti, 
              artefatti e contenuti sulla blockchain Algorand.
            </p>
            <a
              href="https://app.artcertify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              APRI APP
            </a>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Esplora</h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-slate-400 text-sm hover:text-white transition-colors"
                >
                  Soluzioni
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-slate-400 text-sm hover:text-white transition-colors"
                >
                  Come Funziona
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-slate-400 text-sm hover:text-white transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Risorse</h3>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://www.algorand.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 text-sm hover:text-white transition-colors"
                >
                  Algorand
                </a>
              </li>
              <li>
                <a
                  href="https://perawallet.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 text-sm hover:text-white transition-colors"
                >
                  Pera Wallet
                </a>
              </li>
              <li>
                <a
                  href="https://ipfs.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 text-sm hover:text-white transition-colors"
                >
                  IPFS
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-slate-400 text-xs">
              © {currentYear} ArtCertify. Sviluppato da{' '}
              <a
                href="https://www.activadigital.it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Activa Digital
              </a>
            </p>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

