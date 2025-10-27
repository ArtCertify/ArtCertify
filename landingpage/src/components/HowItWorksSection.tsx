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
    <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Come Funziona
          </h2>
          <p className="text-base text-slate-300 max-w-2xl mx-auto">
            Certificare i tuoi documenti su blockchain è semplice e veloce. 
            Segui questi 5 passaggi per creare la tua prima certificazione.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Hidden on mobile */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500/20 via-primary-500/50 to-primary-500/20 transform -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center group"
              >
                {/* Step Number - Clean number only */}
                <div className="relative mb-3">
                  <div className="text-primary-400 text-lg font-bold group-hover:text-primary-300 transition-colors duration-300">
                    {step.number}
                  </div>
                </div>

                {/* Icon Container - Main focus */}
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500/10 to-purple-500/10 border-2 border-primary-500/30 rounded-xl flex items-center justify-center text-primary-400 mb-4 group-hover:border-primary-500 group-hover:bg-gradient-to-br group-hover:from-primary-500/20 group-hover:to-purple-500/20 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  {step.icon}
                </div>

                {/* Step Title */}
                <h3 className="text-base font-semibold text-white mb-2">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-slate-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <a
            href="https://app.artcertify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-xl hover:shadow-primary-500/50 hover:scale-105"
          >
            Inizia a Certificare
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

