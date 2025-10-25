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
    <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Domande Frequenti
          </h2>
          <p className="text-base text-slate-300">
            Trova le risposte alle domande più comuni su ArtCertify
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden transition-all duration-300 hover:border-primary-500/50"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/70 transition-colors"
              >
                <span className="text-base font-semibold text-white pr-6">
                  {faq.question}
                </span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-primary-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-5 pb-4 text-slate-300 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-10 text-center">
          <p className="text-slate-400 mb-3 text-sm">
            Non hai trovato la risposta che cercavi?
          </p>
          <a
            href="mailto:info@activadigital.it"
            className="inline-flex items-center text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors"
          >
            Contattaci
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

