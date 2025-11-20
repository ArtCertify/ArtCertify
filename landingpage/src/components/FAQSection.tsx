import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Cos\'è ArtCertify?',
    answer: 'ArtCertify è una piattaforma di certificazione digitale basata su blockchain Algorand che permette di creare certificazioni immutabili e verificabili per documenti, artefatti e contenuti. Ogni certificazione è un NFT non trasferibile (Soulbound Token) che garantisce autenticità e proprietà.'
  },
  {
    question: 'Come funziona la certificazione su blockchain?',
    answer: 'Quando crei una certificazione, i metadati del documento vengono caricati su IPFS (storage decentralizzato) e viene creato un NFT sulla blockchain Algorand. Questo NFT contiene tutte le informazioni del documento ed è immutabile, il che significa che non può essere modificato o cancellato. La blockchain Algorand garantisce trasparenza e verificabilità pubblica.'
  },
  {
    question: 'Cos\'è un Soulbound Token (SBT)?',
    answer: 'Un Soulbound Token è un tipo speciale di NFT che non può essere trasferito ad altri wallet. Questo garantisce che la certificazione rimanga sempre legata al creatore originale, preservando l\'autenticità e prevenendo contraffazioni o rivendite non autorizzate.'
  },
  {
    question: 'Che wallet posso usare?',
    answer: 'Attualmente supportiamo Pera Wallet, il wallet ufficiale dell\'ecosistema Algorand. È disponibile sia come app mobile (iOS e Android) che come estensione browser. Non memorizziamo mai le tue chiavi private - tutto rimane sotto il tuo controllo.'
  },
  {
    question: 'Quanto costa certificare un\'opera?',
    answer: 'La creazione di una certificazione richiede il pagamento delle fee di transazione sulla blockchain Algorand, che sono estremamente basse (frazioni di centesimo). Non ci sono costi aggiuntivi da parte della piattaforma ArtCertify. Hai solo bisogno di qualche ALGO nel tuo wallet per coprire le fee di transazione.'
  },
  {
    question: 'Cosa succede ai miei file?',
    answer: 'I tuoi file vengono caricati su IPFS (InterPlanetary File System), una rete di storage decentralizzata. I file sono distribuiti su più nodi nella rete, garantendo disponibilità permanente e resistenza alla censura. L\'hash IPFS viene registrato sulla blockchain come prova di esistenza.'
  },
  {
    question: 'Posso modificare una certificazione dopo averla creata?',
    answer: 'La certificazione originale sulla blockchain è immutabile. Tuttavia, puoi creare nuove versioni aggiornando i metadata o gli allegati. Il sistema di versioning tiene traccia di tutte le modifiche, creando una cronologia completa e trasparente delle evoluzioni del documento.'
  },
  {
    question: 'Come posso verificare l\'autenticità di una certificazione?',
    answer: 'Ogni certificazione ha un ID univoco sulla blockchain Algorand. Puoi verificarla attraverso blockchain explorer pubblici come AlgoExplorer o l\'explorer di Pera Wallet. Questo permette a chiunque di verificare autenticità, proprietà e storico della certificazione in modo completamente trasparente.'
  },
  {
    question: 'I miei dati sono sicuri?',
    answer: 'Sì, la sicurezza è la nostra priorità. Non memorizziamo mai le tue chiavi private - rimangono sempre nel tuo wallet. I file sono conservati su IPFS distribuito e gli hash sulla blockchain Algorand. Utilizziamo standard di sicurezza enterprise e best practices per proteggere la tua privacy.'
  },
  {
    question: 'Posso usare ArtCertify per scopi commerciali?',
    answer: 'Assolutamente sì! ArtCertify è progettato per professionisti, aziende, istituzioni e organizzazioni che necessitano di certificazioni autentiche e verificabili. Le certificazioni possono essere utilizzate per transazioni, documentazione legale, assicurazioni e qualsiasi altro scopo che richieda prova di autenticità.'
  }
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full mb-4">
            <span className="text-primary-400 text-sm font-medium">Supporto</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Domande Frequenti
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Trova le risposte alle domande più comuni su ArtCertify
          </p>
        </div>

        {/* FAQ Items with enhanced design */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group glass-effect rounded-2xl border overflow-hidden transition-all duration-300 ${
                openIndex === index 
                  ? 'border-primary-500/50 shadow-lg shadow-primary-500/20' 
                  : 'border-slate-700/50 hover:border-primary-500/30'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-800/30 transition-all duration-300"
              >
                <span className={`text-base font-bold pr-6 transition-colors duration-300 ${
                  openIndex === index ? 'text-primary-300' : 'text-white group-hover:text-primary-400'
                }`}>
                  {faq.question}
                </span>
                <div className="relative flex-shrink-0">
                  {openIndex === index && (
                    <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-md" />
                  )}
                  <ChevronDownIcon
                    className={`relative w-6 h-6 text-primary-400 transition-all duration-300 ${
                      openIndex === index ? 'transform rotate-180 scale-110' : 'group-hover:scale-110'
                    }`}
                  />
                </div>
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-500 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 text-slate-300 text-sm leading-relaxed border-t border-slate-700/50 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA with enhanced design */}
        <div className="mt-12 text-center">
          <div className="glass-effect rounded-2xl border border-slate-700/50 p-8 hover:border-primary-500/30 transition-all duration-300">
            <p className="text-slate-300 mb-4 text-base">
              Non hai trovato la risposta che cercavi?
            </p>
            <a
              href="mailto:info@artcertify.com"
              className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500/10 to-purple-500/10 hover:from-primary-500/20 hover:to-purple-500/20 border border-primary-500/30 hover:border-primary-500/50 rounded-xl text-primary-400 hover:text-primary-300 font-semibold transition-all duration-300 hover:scale-105"
            >
              Contattaci
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

