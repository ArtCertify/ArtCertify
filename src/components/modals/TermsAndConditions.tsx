import React from 'react';

interface TermsAndConditionsProps {
  walletAddress: string;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ walletAddress }) => {
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 max-h-64 overflow-y-auto">
      <h4 className="text-sm font-semibold text-white mb-3">Termini e Condizioni di Utilizzo</h4>
      
      <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
        <section>
          <h5 className="font-semibold text-slate-200 mb-1">1. ACCETTAZIONE DEI TERMINI</h5>
          <p>
            Accedendo e utilizzando il servizio ArtCertify, l'utente dichiara di aver letto, compreso e accettato integralmente 
            i presenti Termini e Condizioni. L'utilizzo del servizio implica l'accettazione incondizionata di tutte le disposizioni 
            contenute nel presente documento. Se non si accettano questi termini, è necessario astenersi dall'utilizzo del servizio.
          </p>
        </section>

        <section>
          <h5 className="font-semibold text-slate-200 mb-1">2. DESCRIZIONE DEL SERVIZIO</h5>
          <p>
            ArtCertify è una piattaforma di certificazione blockchain che consente agli utenti di certificare documenti e artefatti 
            culturali sulla blockchain Algorand e su IPFS (InterPlanetary File System). Il servizio utilizza tecnologie decentralizzate 
            per garantire l'immutabilità e la tracciabilità delle certificazioni.
          </p>
        </section>

        <section>
          <h5 className="font-semibold text-slate-200 mb-1">3. NATURA PUBBLICA DEI DATI ON-CHAIN E IPFS</h5>
          <p>
            L'utente è consapevole e accetta che tutti i dati e le informazioni scritte sulla blockchain Algorand sono pubblici, 
            immutabili e permanentemente accessibili a chiunque. Analogamente, i contenuti caricati su IPFS sono distribuiti in modo 
            decentralizzato e possono essere accessibili pubblicamente tramite hash IPFS. L'utente riconosce che:
          </p>
          <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
            <li>I dati on-chain sono permanentemente registrati e non possono essere modificati o eliminati</li>
            <li>I file caricati su IPFS possono essere accessibili pubblicamente tramite il loro hash CID</li>
            <li>Non è possibile rimuovere o rendere privati i dati una volta pubblicati</li>
            <li>L'utente è l'unico responsabile dei contenuti pubblicati</li>
          </ul>
        </section>

        <section>
          <h5 className="font-semibold text-slate-200 mb-1">4. ARCHIVIAZIONE DATI SU DATABASE CENTRALIZZATO</h5>
          <p>
            L'utente accetta che i metadati, le informazioni di certificazione e i dati relativi ai file caricati possano essere 
            archiviati su un database centralizzato gestito da ArtCertify. Questi dati includono, ma non sono limitati a:
          </p>
          <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
            <li>Metadati dei file (nome, dimensione, tipo, hash)</li>
            <li>Informazioni di certificazione e timestamp</li>
            <li>Dati dell'organizzazione e dell'utente</li>
            <li>Storico delle transazioni e modifiche</li>
            <li>Dati di autenticazione e identificazione</li>
          </ul>
          <p className="mt-1">
            L'utente riconosce che tali dati sono necessari per il funzionamento del servizio e accetta la loro archiviazione 
            su infrastrutture centralizzate.
          </p>
        </section>

        <section>
          <h5 className="font-semibold text-slate-200 mb-1">5. PROPRIETÀ DEL WALLET E RESPONSABILITÀ</h5>
          <p>
            L'utente dichiara e garantisce di essere il legittimo proprietario del wallet associato all'indirizzo {walletAddress} 
            e di avere il pieno controllo delle chiavi private. L'utente è l'unico responsabile della sicurezza e della custodia 
            delle credenziali di accesso al wallet. ArtCertify non è responsabile per perdite derivanti da:
          </p>
          <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
            <li>Accesso non autorizzato al wallet</li>
            <li>Perdita o compromissione delle chiavi private</li>
            <li>Transazioni non autorizzate</li>
            <li>Errori nell'utilizzo del wallet</li>
          </ul>
        </section>

        <section>
          <h5 className="font-semibold text-slate-200 mb-1">6. CONTENUTI DELL'UTENTE</h5>
          <p>
            L'utente garantisce di possedere tutti i diritti necessari sui contenuti caricati e certificati tramite ArtCertify. 
            L'utente si impegna a non caricare contenuti che:
          </p>
          <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
            <li>Violano diritti di proprietà intellettuale di terzi</li>
            <li>Sono illegali, diffamatori o offensivi</li>
            <li>Contengono malware o codice dannoso</li>
            <li>Violano leggi o normative applicabili</li>
          </ul>
        </section>

        <section>
          <h5 className="font-semibold text-slate-200 mb-1">7. PRIVACY E PROTEZIONE DEI DATI</h5>
          <p>
            ArtCertify rispetta la privacy degli utenti e tratta i dati personali in conformità con il Regolamento Generale sulla 
            Protezione dei Dati (GDPR) e le normative applicabili. Tuttavia, l'utente riconosce che:
          </p>
          <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
            <li>I dati on-chain sono pubblici e non possono essere resi privati</li>
            <li>I file su IPFS possono essere accessibili pubblicamente</li>
            <li>I metadati archiviati nel database centralizzato sono utilizzati per fornire il servizio</li>
            <li>ArtCertify può utilizzare dati aggregati e anonimi per migliorare il servizio</li>
          </ul>
        </section>

        <section>
          <h5 className="font-semibold text-slate-200 mb-1">8. LIMITAZIONI DI RESPONSABILITÀ</h5>
          <p>
            ArtCertify fornisce il servizio "così com'è" senza garanzie di alcun tipo. ArtCertify non è responsabile per:
          </p>
          <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
            <li>Perdite finanziarie derivanti dall'utilizzo del servizio</li>
            <li>Interruzioni o malfunzionamenti del servizio</li>
            <li>Perdita di dati o contenuti</li>
            <li>Modifiche alla blockchain o a IPFS che potrebbero influenzare i dati pubblicati</li>
            <li>Atti di terze parti o eventi di forza maggiore</li>
          </ul>
        </section>

        <section>
          <h5 className="font-semibold text-slate-200 mb-1">9. MODIFICHE AI TERMINI</h5>
          <p>
            ArtCertify si riserva il diritto di modificare i presenti Termini e Condizioni in qualsiasi momento. Le modifiche 
            entreranno in vigore dalla loro pubblicazione. L'utilizzo continuato del servizio dopo le modifiche implica 
            l'accettazione dei nuovi termini.
          </p>
        </section>

        <section>
          <h5 className="font-semibold text-slate-200 mb-1">10. LEGGE APPLICABILE E FORO COMPETENTE</h5>
          <p>
            I presenti Termini e Condizioni sono governati dalla legge italiana. Per qualsiasi controversia derivante da o 
            in relazione ai presenti termini, sarà competente esclusivamente il foro del luogo di residenza o domicilio 
            dell'utente, se consumatore, ovvero il foro di [Città, Italia] per gli altri casi.
          </p>
        </section>

        <section>
          <h5 className="font-semibold text-slate-200 mb-1">11. ACCETTAZIONE ESPRESSA</h5>
          <p>
            Con la firma della presente transazione, l'utente dichiara esplicitamente di aver letto, compreso e accettato 
            integralmente tutti i Termini e Condizioni sopra indicati, inclusa l'accettazione della natura pubblica dei dati 
            on-chain e IPFS, nonché dell'archiviazione dei dati su database centralizzato.
          </p>
        </section>
      </div>
    </div>
  );
};


