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
    <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-primary-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full mb-4">
            <span className="text-primary-400 text-sm font-medium">Funzionalità Complete</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Tutto ciò di cui hai bisogno per
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animated-gradient bg-300">
              certificare
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Una piattaforma completa con tutte le funzionalità necessarie per certificare 
            e gestire documenti, artefatti e contenuti sulla blockchain.
          </p>
        </div>

        {/* Features Grid with stagger animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade-in">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            return (
              <div
                key={index}
                className={`group relative p-6 glass-effect rounded-2xl border ${colors.border} transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-default overflow-hidden`}
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color === 'primary' ? 'from-primary-500/5' : feature.color === 'success' ? 'from-success-500/5' : 'from-purple-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer" />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 ${colors.text} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
                
                {/* Decorative corner accent */}
                <div className={`absolute top-0 right-0 w-20 h-20 ${feature.color === 'primary' ? 'bg-primary-500/5' : feature.color === 'success' ? 'bg-success-500/5' : 'bg-purple-500/5'} rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

