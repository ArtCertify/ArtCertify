import React from 'react';
import {
  WalletIcon,
  DocumentPlusIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: <WalletIcon className="w-8 h-8" />,
    title: 'Connetti il Wallet',
    description: 'Connetti il tuo Pera Wallet in modo sicuro. Non memorizziamo mai le tue chiavi private.'
  },
  {
    number: 2,
    icon: <DocumentPlusIcon className="w-8 h-8" />,
    title: 'Compila il Form',
    description: 'Inserisci i dettagli del documento: titolo, descrizione, autore e altre informazioni rilevanti.'
  },
  {
    number: 3,
    icon: <CloudArrowUpIcon className="w-8 h-8" />,
    title: 'Carica File',
    description: 'Carica immagini, documenti e allegati che verranno conservati su IPFS in modo decentralizzato.'
  },
  {
    number: 4,
    icon: <ShieldCheckIcon className="w-8 h-8" />,
    title: 'Firma su Blockchain',
    description: 'Approva la transazione con il tuo wallet. La certificazione viene registrata su Algorand.'
  },
  {
    number: 5,
    icon: <CheckCircleIcon className="w-8 h-8" />,
    title: 'Certificazione Completa',
    description: 'Il tuo documento è ora certificato! Ricevi un NFT immutabile con link pubblico verificabile.'
  }
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 dots-pattern opacity-20" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full mb-4">
            <span className="text-primary-400 text-sm font-medium">Processo Semplificato</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Come Funziona
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Certificare i tuoi documenti su blockchain è semplice e veloce. 
            Segui questi 5 passaggi per creare la tua prima certificazione.
          </p>
        </div>

        {/* Steps with modern design */}
        <div className="relative">
          {/* Animated connection line - Desktop only */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/50 via-purple-500/50 to-primary-500/50 shimmer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10 stagger-fade-in">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center group"
              >
                {/* Step Number Badge */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl group-hover:bg-primary-500/30 transition-colors duration-300" />
                  <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/30 rounded-full text-primary-400 text-sm font-bold group-hover:scale-110 group-hover:border-primary-500 transition-all duration-300">
                    {step.number}
                  </div>
                </div>

                {/* Icon Container - Enhanced with glow */}
                <div className="relative mb-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-primary-500/10 via-blue-500/10 to-purple-500/10 border-2 border-primary-500/30 rounded-2xl flex items-center justify-center text-primary-400 group-hover:border-primary-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl backdrop-blur-sm">
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="text-base font-bold text-white mb-3 group-hover:text-primary-300 transition-colors duration-300">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - same style as login button */}
        <div className="mt-16 text-center animate-fade-in-up">
          <a
            href="https://app.artcertify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            INIZIA A CERTIFICARE
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

