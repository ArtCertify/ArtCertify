import React from 'react';
import {
  DocumentCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CubeIcon,
  ArrowPathIcon,
  FingerPrintIcon,
  CloudArrowUpIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <ShieldCheckIcon className="w-5 h-5" />,
    title: 'Certificazioni Immutabili',
    description: 'Le certificazioni sono registrate permanentemente su blockchain Algorand e non possono essere modificate o cancellate.',
    color: 'primary'
  },
  {
    icon: <DocumentCheckIcon className="w-5 h-5" />,
    title: 'Standard ARC-3 e ARC-19',
    description: 'Piena compliance con gli standard Algorand per NFT e metadata, garantendo interoperabilità e compatibilità.',
    color: 'success'
  },
  {
    icon: <CloudArrowUpIcon className="w-5 h-5" />,
    title: 'Storage Decentralizzato',
    description: 'I tuoi file sono conservati su IPFS, una rete distribuita che garantisce disponibilità e resistenza alla censura.',
    color: 'purple'
  },
  {
    icon: <ArrowPathIcon className="w-5 h-5" />,
    title: 'Sistema di Versioning',
    description: 'Traccia tutte le modifiche e aggiornamenti delle tue certificazioni con cronologia completa e trasparente.',
    color: 'primary'
  },
  {
    icon: <FingerPrintIcon className="w-5 h-5" />,
    title: 'Autenticazione Sicura',
    description: 'Integrazione con Pera Wallet per autenticazione sicura senza memorizzare chiavi private.',
    color: 'success'
  },
  {
    icon: <CheckBadgeIcon className="w-5 h-5" />,
    title: 'Soulbound Tokens',
    description: 'Le certificazioni sono NFT non trasferibili, legati permanentemente al creatore per garantire autenticità.',
    color: 'purple'
  },
  {
    icon: <GlobeAltIcon className="w-5 h-5" />,
    title: 'Verifica Pubblica',
    description: 'Chiunque può verificare l\'autenticità di una certificazione attraverso blockchain explorer pubblici.',
    color: 'primary'
  },
  {
    icon: <ClockIcon className="w-5 h-5" />,
    title: 'Timestamp Certificato',
    description: 'Ogni certificazione include timestamp blockchain verificabile che attesta data e ora di creazione.',
    color: 'success'
  },
  {
    icon: <CubeIcon className="w-5 h-5" />,
    title: 'Metadata Ricchi',
    description: 'Supporto per metadata dettagliati inclusi descrizioni, allegati, immagini e informazioni tecniche.',
    color: 'purple'
  }
];

const FeaturesSection: React.FC = () => {
  const getColorClasses = (color: string) => {
    const colors = {
      primary: {
        bg: 'bg-primary-500/10',
        text: 'text-primary-400',
        border: 'border-primary-500/20 hover:border-primary-500/50'
      },
      success: {
        bg: 'bg-success-500/10',
        text: 'text-success-500',
        border: 'border-success-500/20 hover:border-success-500/50'
      },
      purple: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/20 hover:border-purple-500/50'
      }
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Tutto ciò di cui hai bisogno per
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent"> certificare</span>
          </h2>
          <p className="text-base text-slate-300 max-w-2xl mx-auto">
            Una piattaforma completa con tutte le funzionalità necessarie per certificare 
            e gestire documenti, artefatti e contenuti sulla blockchain.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            return (
              <div
                key={index}
                className={`p-5 bg-slate-800/50 backdrop-blur-sm rounded-lg border ${colors.border} transition-all duration-300 hover:scale-105 hover:shadow-lg`}
              >
                <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center mb-3 ${colors.text}`}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

