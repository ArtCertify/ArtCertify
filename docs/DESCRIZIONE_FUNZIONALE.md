# Descrizione Funzionale ArtCertify

## Documento Tecnico - Servizi e Funzionalità

**Versione:** 1.0  
**Data:** 2024  
**Scopo:** Documentazione funzionale dei servizi dell'applicazione ArtCertify per certificazione digitale blockchain

---

## Indice

1. [Panoramica Generale](#panoramica-generale)
2. [Servizio Integrazione Algorand](#servizio-integrazione-algorand)
3. [Servizio Storage IPFS](#servizio-storage-ipfs)
4. [Servizio Minting Certificazioni](#servizio-minting-certificazioni)
5. [Servizio Autenticazione Pera Wallet](#servizio-autenticazione-pera-wallet)
6. [Servizio Configurazione Network](#servizio-configurazione-network)
7. [Servizio Decodifica CID](#servizio-decodifica-cid)
8. [Architettura Applicazione](#architettura-applicazione)

---

## Panoramica Generale

ArtCertify è un'applicazione web per la certificazione digitale di artefatti e documenti mediante blockchain Algorand. Il sistema utilizza Soulbound Tokens (SBT) non trasferibili per garantire l'autenticità e l'immutabilità delle certificazioni, con storage decentralizzato IPFS per metadata e file allegati.

### Obiettivi Funzionali

- **Certificazione Digitale Immutabile**: Creazione di certificazioni blockchain non modificabili
- **Storage Decentralizzato**: Archiviazione permanente di metadata e file su IPFS
- **Autenticazione Sicura**: Connessione wallet senza gestione chiavi private
- **Versioning Certificazioni**: Aggiornamento controllato delle certificazioni esistenti
- **Verifica Trasparente**: Accesso pubblico alle certificazioni tramite explorer blockchain

---

## Servizio Integrazione Algorand

### Descrizione

Il servizio di integrazione Algorand rappresenta il ponte fondamentale tra l'applicazione ArtCertify e la blockchain Algorand. Questo servizio è responsabile di tutte le operazioni che coinvolgono la blockchain, dalla creazione di asset certificati alla loro consultazione e verifica.

La blockchain Algorand viene utilizzata come registro immutabile e pubblico per le certificazioni digitali. Ogni certificazione creata nell'applicazione viene registrata come un Soulbound Token (SBT) sulla blockchain, garantendo che non possa essere trasferita o modificata una volta creata. Il servizio gestisce l'intero ciclo di vita degli asset blockchain, dalla loro creazione iniziale fino alla consultazione e verifica da parte degli utenti.

Il servizio opera in stretta integrazione con altri componenti dell'applicazione: riceve i dati delle certificazioni dal servizio di minting, utilizza i CID IPFS per collegare i metadata, e fornisce informazioni agli utenti per la verifica delle certificazioni. Inoltre, gestisce la visualizzazione del portfolio di certificazioni possedute dall'utente e la cronologia delle transazioni effettuate.

L'importanza di questo servizio risiede nel fatto che è l'unico componente che interagisce direttamente con la blockchain, rendendo le certificazioni permanenti, verificabili pubblicamente e immutabili. Senza questo servizio, le certificazioni non avrebbero la garanzia di autenticità e permanenza che la blockchain fornisce.

### Scopo Funzionale

Il servizio di integrazione Algorand gestisce tutte le interazioni con la blockchain Algorand per la creazione, gestione e consultazione di asset certificati.

### Funzionalità Principali

#### Gestione Asset Blockchain

- **Creazione Asset Soulbound**: Generazione di token non trasferibili (SBT) per certificazioni
- **Configurazione Asset**: Impostazione parametri asset (nome, unità, metadata URL)
- **Query Asset**: Recupero informazioni complete su asset esistenti
- **Gestione Reserve Address**: Aggiornamento indirizzi di riserva per versioning metadata

#### Integrazione Explorer

- **Link Diretti**: Generazione automatica di link verso explorer blockchain per verifica pubblica
- **Visualizzazione Transazioni**: Accesso diretto alle transazioni di creazione e modifica
- **Verifica Certificazioni**: Validazione pubblica delle certificazioni tramite explorer

#### Gestione Wallet

- **Visualizzazione Saldo**: Consultazione saldo ALGO e asset posseduti
- **Portfolio Asset**: Elenco completo di certificazioni possedute dall'utente
- **Storia Transazioni**: Cronologia completa delle operazioni effettuate

### Utilità nell'Applicazione

Il servizio Algorand è il **cuore blockchain** dell'applicazione, responsabile di:

- Rendere le certificazioni **immutabili** e verificabili pubblicamente
- Garantire la **tracciabilità** di ogni operazione tramite transazioni blockchain
- Fornire **trasparenza** attraverso l'integrazione con explorer pubblici
- Abilitare il **versioning** delle certificazioni mantenendo la cronologia completa

### Flusso Operativo

1. **Creazione Certificazione**: Il servizio crea un asset SBT sulla blockchain con metadata IPFS
2. **Configurazione**: Imposta i parametri dell'asset per renderlo non trasferibile
3. **Registrazione**: La certificazione diventa permanente e verificabile sulla blockchain
4. **Consultazione**: Gli utenti possono verificare l'autenticità tramite explorer blockchain

---

## Servizio Storage IPFS

### Descrizione

Il servizio Storage IPFS è responsabile dell'archiviazione permanente e decentralizzata di tutti i contenuti associati alle certificazioni digitali. A differenza di sistemi di storage tradizionali basati su server centralizzati, IPFS (InterPlanetary File System) utilizza una rete peer-to-peer distribuita che garantisce la permanenza e l'accessibilità dei contenuti indipendentemente dalla disponibilità di singoli server.

Quando un utente crea una certificazione, tutti i file allegati (documenti, immagini, video, modelli 3D) e i metadata strutturati vengono caricati su IPFS. Ogni file riceve un Content Identifier (CID) univoco basato sul suo contenuto, che funge sia da identificatore che da garanzia di integrità. Se il contenuto del file cambia, anche il CID cambia, rendendo impossibile modificare un file senza che la modifica sia rilevabile.

Il servizio utilizza Pinata come gateway principale per l'upload e l'accesso ai contenuti IPFS. Pinata fornisce un'infrastruttura affidabile che garantisce la persistenza dei contenuti sulla rete IPFS, evitando che i file vengano persi quando i nodi IPFS temporanei si disconnettono. Inoltre, il servizio gestisce gateway alternativi per garantire l'accessibilità dei contenuti anche in caso di problemi con il gateway principale.

I metadata delle certificazioni vengono strutturati secondo lo standard ARC-3, che definisce il formato standard per i metadata degli NFT su Algorand. Questa strutturazione garantisce la compatibilità con altri sistemi e strumenti che operano con NFT Algorand, facilitando l'interoperabilità e la verifica delle certificazioni.

L'importanza di questo servizio risiede nel fatto che, mentre la blockchain Algorand registra l'esistenza e le proprietà di una certificazione, i contenuti effettivi (file e metadata dettagliati) sono troppo grandi per essere memorizzati direttamente sulla blockchain. IPFS risolve questo problema fornendo uno storage permanente e decentralizzato che si integra perfettamente con la blockchain.

### Scopo Funzionale

Il servizio IPFS gestisce l'archiviazione decentralizzata di metadata e file delle certificazioni, garantendo immutabilità e accessibilità permanente dei contenuti.

### Funzionalità Principali

#### Upload File e Metadata

- **Upload File Individuali**: Caricamento di singoli file (documenti, immagini, video) su IPFS
- **Upload Metadata Strutturati**: Archiviazione di metadata JSON conformi allo standard ARC-3
- **Upload Batch Certificazioni**: Processo completo di upload per certificazioni con multipli file
- **Gestione Gateway**: Accesso ai contenuti tramite gateway personalizzati e pubblici

#### Gestione Gateway

- **Gateway Personalizzati**: Utilizzo di gateway dedicati per performance ottimizzate
- **Fallback Automatico**: Sistema di fallback su gateway alternativi in caso di indisponibilità
- **URL Generazione**: Creazione automatica di URL IPFS e gateway per accesso ai contenuti

#### Metadata Strutturati

- **Standard ARC-3**: Conformità completa allo standard NFT Algorand per metadata
- **Struttura Certificazioni**: Organizzazione dati certificazione in formato standardizzato
- **Versioning Support**: Tracciamento versioni multiple dei metadata

### Utilità nell'Applicazione

Il servizio IPFS fornisce:

- **Storage Permanente**: I file e metadata sono archiviati in modo permanente e immutabile
- **Decentralizzazione**: I contenuti non dipendono da server centralizzati
- **Verificabilità**: Ogni file ha un hash univoco che garantisce l'integrità
- **Accessibilità**: I contenuti sono accessibili da qualsiasi gateway IPFS nel mondo

### Flusso Operativo

1. **Preparazione**: I file vengono preparati per l'upload con metadata associati
2. **Upload**: I file vengono caricati su IPFS tramite gateway Pinata
3. **Hash Generazione**: Ogni file riceve un Content Identifier (CID) univoco
4. **Registrazione**: I CID vengono registrati nella blockchain come parte della certificazione
5. **Accesso**: I contenuti sono accessibili tramite gateway IPFS usando i CID

---

## Servizio Minting Certificazioni

### Descrizione

Il servizio di minting è il coordinatore centrale che orchestra l'intero processo di creazione di una certificazione digitale. Questo servizio non esegue direttamente le operazioni tecniche, ma coordina e sincronizza tutti gli altri servizi per garantire che una certificazione venga creata correttamente dall'inizio alla fine.

Quando un utente compila un form di certificazione e carica i file, il servizio di minting prende in carico l'intero processo. Prima di tutto, valida tutti i dati forniti dall'utente per assicurarsi che siano completi e corretti. Successivamente, coordina l'upload dei file su IPFS tramite il servizio di storage, garantendo che tutti i file vengano caricati correttamente e che i CID vengano ottenuti.

Una volta che i file sono su IPFS, il servizio struttura i metadata secondo gli standard richiesti (ARC-3 per Algorand) e li carica anch'essi su IPFS. Il CID dei metadata viene quindi convertito in un reserve address utilizzando il servizio di decodifica CID, seguendo lo standard ARC-19.

Con tutti i dati preparati, il servizio coordina la creazione dell'asset SBT sulla blockchain Algorand. Questo processo richiede due transazioni separate: prima la creazione dell'asset, poi la configurazione del reserve address. Il servizio gestisce entrambe le transazioni, assicurandosi che vengano completate in sequenza e che l'asset risultante sia correttamente configurato come non trasferibile.

Il servizio supporta anche il versioning delle certificazioni esistenti. Quando un utente desidera aggiornare una certificazione, il servizio crea una nuova versione dei metadata su IPFS, aggiorna il reserve address dell'asset sulla blockchain, ma mantiene traccia di tutte le versioni precedenti, garantendo che la cronologia completa sia sempre accessibile.

L'importanza di questo servizio risiede nella sua capacità di garantire la coerenza e la correttezza dell'intero processo di certificazione. Senza questo coordinamento, sarebbe molto facile commettere errori che potrebbero rendere una certificazione non valida o non verificabile.

### Scopo Funzionale

Il servizio di minting coordina l'intero processo di creazione di certificazioni digitali, integrando upload IPFS, creazione asset blockchain e gestione versioning.

### Funzionalità Principali

#### Creazione Certificazioni Documenti

- **Processo Completo**: Coordinamento di upload IPFS, creazione asset e configurazione blockchain
- **Validazione Dati**: Verifica completezza e correttezza dei dati di certificazione
- **Gestione File**: Upload e organizzazione di file allegati alla certificazione
- **Metadata Generazione**: Creazione automatica di metadata conformi agli standard

#### Creazione Certificazioni Artefatti

- **Supporto Multi-Tipo**: Gestione di artefatti digitali, video, modelli 3D e altri formati
- **Metadata Specializzati**: Generazione di metadata specifici per tipo di artefatto
- **Specifiche Tecniche**: Tracciamento di specifiche tecniche (dimensioni, formato, tecnologia)

#### Gestione Versioning

- **Aggiornamento Certificazioni**: Modifica di certificazioni esistenti mantenendo la cronologia
- **Tracciamento Versioni**: Conservazione di tutte le versioni precedenti dei metadata
- **Reserve Address Updates**: Aggiornamento degli indirizzi di riserva per nuove versioni

### Utilità nell'Applicazione

Il servizio di minting è il **coordinatore centrale** che:

- **Orchestra** l'intero processo di certificazione da inizio a fine
- **Garantisce** la coerenza tra storage IPFS e blockchain
- **Abilita** il versioning mantenendo l'immutabilità delle versioni precedenti
- **Fornisce** un'interfaccia unificata per diversi tipi di certificazioni

### Flusso Operativo

1. **Raccolta Dati**: L'utente compila il form di certificazione con dati e file
2. **Validazione**: Il sistema valida completezza e correttezza dei dati
3. **Upload IPFS**: I file vengono caricati su IPFS e si ottengono i CID
4. **Preparazione Metadata**: I metadata vengono strutturati secondo standard ARC-3
5. **Upload Metadata**: I metadata vengono caricati su IPFS
6. **Conversione CID**: Il CID dei metadata viene convertito in reserve address
7. **Creazione Asset**: Viene creato l'asset SBT sulla blockchain
8. **Configurazione**: L'asset viene configurato con il reserve address corretto
9. **Completamento**: La certificazione è completa e verificabile

---

## Servizio Autenticazione Pera Wallet

### Descrizione

Il servizio di autenticazione Pera Wallet rappresenta il sistema di sicurezza fondamentale dell'applicazione ArtCertify. A differenza di sistemi di autenticazione tradizionali che richiedono username e password, questo servizio utilizza la tecnologia blockchain per autenticare gli utenti tramite il loro wallet digitale.

Pera Wallet è il wallet ufficiale per l'ecosistema Algorand, disponibile sia come applicazione mobile che come estensione desktop. Il servizio si integra con Pera Wallet per permettere agli utenti di connettersi all'applicazione semplicemente autorizzando la connessione dal loro wallet. Una volta connessi, gli utenti possono eseguire operazioni sulla blockchain senza mai dover esporre o gestire le loro chiavi private nell'applicazione web.

Questo approccio offre un livello di sicurezza superiore rispetto ai sistemi tradizionali. Le chiavi private dell'utente rimangono sempre e solo nel loro wallet, che è protetto da password biometriche o PIN. L'applicazione web non ha mai accesso alle chiavi private, eliminando completamente il rischio che queste vengano compromesse attraverso l'applicazione.

Quando un utente deve firmare una transazione blockchain (ad esempio, per creare una certificazione), il servizio prepara la transazione e la invia al wallet dell'utente per la firma. L'utente vede i dettagli della transazione nel proprio wallet e può approvarla o rifiutarla. Solo dopo l'approvazione esplicita dell'utente, la transazione viene firmata e inviata alla blockchain.

Il servizio gestisce anche la persistenza della sessione, permettendo agli utenti di rimanere connessi tra le sessioni del browser. Quando un utente ritorna all'applicazione, il servizio tenta automaticamente di riconnettersi al wallet se la sessione è ancora valida, migliorando l'esperienza utente senza compromettere la sicurezza.

L'importanza di questo servizio è fondamentale per la sicurezza dell'intera applicazione. Senza un sistema di autenticazione sicuro basato su wallet, l'applicazione non potrebbe operare sulla blockchain in modo sicuro, e gli utenti non avrebbero il controllo completo sulle loro operazioni.

### Scopo Funzionale

Il servizio Pera Wallet gestisce l'autenticazione sicura degli utenti tramite connessione wallet, eliminando la necessità di gestire chiavi private nell'applicazione.

### Funzionalità Principali

#### Connessione Wallet

- **Multi-Platform**: Supporto per connessione mobile (QR Code) e desktop (app nativa)
- **Session Persistence**: Mantenimento della sessione tra ricaricamenti pagina
- **Auto-Reconnect**: Riconnessione automatica quando disponibile

#### Firma Transazioni

- **Firma Sicura**: Tutte le transazioni vengono firmate direttamente dal wallet utente
- **Approvazione Utente**: Ogni transazione richiede esplicita approvazione dell'utente
- **Gestione Errori**: Gestione robusta di errori di connessione e firma

#### Gestione Ruoli

- **Ruolo MINTER**: Identificazione utenti autorizzati a creare certificazioni
- **Verifica Permessi**: Controllo dei permessi prima di operazioni critiche
- **Gestione Sessioni**: Isolamento delle sessioni per sicurezza

### Utilità nell'Applicazione

Il servizio Pera Wallet fornisce:

- **Sicurezza Massima**: Nessuna chiave privata è mai gestita dall'applicazione
- **Controllo Utente**: L'utente mantiene il controllo completo delle proprie chiavi
- **Esperienza Utente**: Connessione semplice e intuitiva con feedback visivo
- **Compatibilità**: Supporto per tutti i dispositivi (mobile e desktop)

### Flusso Operativo

1. **Inizializzazione**: L'applicazione si connette al servizio Pera Wallet
2. **Richiesta Connessione**: L'utente richiede la connessione del wallet
3. **Autorizzazione**: L'utente autorizza la connessione tramite app Pera Wallet
4. **Sessione Attiva**: La sessione viene mantenuta per le operazioni successive
5. **Firma Transazioni**: Per ogni operazione blockchain, l'utente firma tramite wallet
6. **Disconnessione**: L'utente può disconnettersi in qualsiasi momento

---

## Servizio Configurazione Network

### Descrizione

Il servizio di configurazione network è un componente critico che gestisce automaticamente tutti i parametri necessari per connettersi correttamente alla blockchain Algorand. La blockchain Algorand opera su due reti principali: TestNet (rete di test) e MainNet (rete di produzione). Queste reti hanno endpoint diversi, Chain ID diversi, e explorer diversi, e mescolare configurazioni tra le due reti può causare errori gravi o addirittura perdite finanziarie.

Tradizionalmente, configurare un'applicazione per operare su una blockchain richiede di specificare manualmente molti parametri: gli endpoint per i nodi blockchain, gli endpoint per gli indexer, i Chain ID, gli URL degli explorer, e altri parametri tecnici. Questo processo è propenso a errori, specialmente quando si passa da un ambiente di sviluppo (TestNet) a un ambiente di produzione (MainNet).

Il servizio di configurazione network risolve questo problema permettendo agli sviluppatori e agli amministratori di sistema di specificare semplicemente quale rete utilizzare (TestNet o MainNet) attraverso una singola variabile di ambiente. Il servizio legge questa variabile e configura automaticamente tutti gli altri parametri necessari, garantendo che tutti i componenti dell'applicazione utilizzino la stessa rete.

Il servizio include anche validazione automatica della configurazione. All'avvio dell'applicazione, verifica che tutti i parametri siano coerenti tra loro e che non ci siano configurazioni miste. Ad esempio, se la variabile indica MainNet ma uno degli endpoint punta a TestNet, il servizio rileva questa inconsistenza e impedisce l'avvio dell'applicazione, prevenendo potenziali errori.

Inoltre, il servizio include controlli di sicurezza specifici per l'ambiente di produzione. Ad esempio, verifica che non ci siano chiavi private di test configurate quando l'applicazione è in modalità produzione, e avvisa se si sta utilizzando MainNet in un ambiente di sviluppo, dove normalmente si dovrebbe usare TestNet.

L'importanza di questo servizio risiede nella sua capacità di prevenire errori costosi e pericolosi. Una configurazione errata potrebbe causare il tentativo di creare certificazioni sulla rete sbagliata, o peggio, potrebbe esporre l'applicazione a rischi di sicurezza. Il servizio elimina questi rischi automatizzando e validando la configurazione.

### Scopo Funzionale

Il servizio di configurazione network gestisce automaticamente la configurazione della rete blockchain (TestNet o MainNet) e previene errori di configurazione.

### Funzionalità Principali

#### Auto-Configurazione

- **Switch Automatico**: Configurazione automatica di tutti i parametri basata su una singola variabile
- **Endpoint Management**: Gestione automatica di endpoint Algod, Indexer e Explorer
- **Chain ID Detection**: Rilevamento automatico del Chain ID corretto per la rete

#### Validazione Configurazione

- **Consistency Check**: Verifica coerenza tra tutti i parametri di configurazione
- **Error Prevention**: Prevenzione di configurazioni miste TestNet/MainNet
- **Safety Checks**: Controlli di sicurezza per deployment production

#### Gestione Ambienti

- **Development**: Configurazione ottimizzata per sviluppo con TestNet
- **Staging**: Configurazione per testing con TestNet
- **Production**: Configurazione sicura per produzione con MainNet

### Utilità nell'Applicazione

Il servizio di configurazione network:

- **Elimina Errori**: Previene configurazioni errate che potrebbero causare perdite
- **Semplifica Deployment**: Una singola variabile controlla tutta la configurazione
- **Garantisce Sicurezza**: Previene operazioni su rete sbagliata
- **Facilita Sviluppo**: Sviluppatori non devono gestire manualmente endpoint

### Flusso Operativo

1. **Lettura Configurazione**: Il sistema legge la variabile di ambiente network
2. **Auto-Configurazione**: Tutti i parametri vengono configurati automaticamente
3. **Validazione**: Il sistema verifica la coerenza della configurazione
4. **Inizializzazione**: I servizi vengono inizializzati con la configurazione corretta
5. **Monitoring**: Il sistema monitora la configurazione durante l'esecuzione

---

## Servizio Decodifica CID

### Descrizione

Il servizio di decodifica CID è un componente tecnico specializzato che implementa lo standard ARC-19 di Algorand per la conversione tra Content Identifiers (CID) IPFS e indirizzi Algorand. Questo standard è fondamentale per il funzionamento del sistema di versioning delle certificazioni e per la corretta integrazione tra storage IPFS e blockchain Algorand.

Quando i metadata di una certificazione vengono caricati su IPFS, ricevono un CID univoco che identifica quel contenuto specifico. Tuttavia, la blockchain Algorand non può memorizzare direttamente i CID IPFS nei suoi asset. Invece, lo standard ARC-19 definisce un metodo per convertire un CID in un indirizzo Algorand valido, che può essere memorizzato nel campo "reserve address" di un asset.

Il servizio implementa questa conversione in entrambe le direzioni: può convertire un CID IPFS in un indirizzo Algorand (per memorizzare il riferimento nella blockchain) e può convertire un indirizzo Algorand di riserva in un CID IPFS (per recuperare i metadata da IPFS quando si visualizza una certificazione).

La conversione funziona estraendo il digest hash dal CID IPFS e utilizzandolo per generare un indirizzo Algorand valido. Questo processo è deterministico: lo stesso CID produrrà sempre lo stesso indirizzo Algorand, garantendo la coerenza. Inoltre, la conversione è reversibile, permettendo di recuperare il CID originale dall'indirizzo Algorand.

Il servizio è essenziale per il sistema di versioning delle certificazioni. Quando una certificazione viene aggiornata, i nuovi metadata vengono caricati su IPFS ottenendo un nuovo CID. Questo nuovo CID viene convertito in un nuovo indirizzo Algorand, che viene poi aggiornato nel reserve address dell'asset. Il vecchio reserve address (e quindi il vecchio CID) rimane nella cronologia delle transazioni, permettendo di accedere a tutte le versioni precedenti della certificazione.

Il servizio include anche funzionalità per estrarre la cronologia completa delle versioni di una certificazione analizzando tutte le transazioni di configurazione dell'asset. Questo permette agli utenti di vedere come una certificazione è cambiata nel tempo e di accedere a versioni storiche dei metadata.

L'importanza di questo servizio risiede nel fatto che è l'unico componente che può tradurre tra il formato IPFS (CID) e il formato Algorand (indirizzi), permettendo ai due sistemi di comunicare efficacemente. Senza questo servizio, non sarebbe possibile collegare i contenuti IPFS agli asset blockchain, e il sistema di versioning non potrebbe funzionare.

### Scopo Funzionale

Il servizio di decodifica CID implementa lo standard ARC-19 per la conversione bidirezionale tra Content Identifiers IPFS e indirizzi Algorand, abilitando il versioning delle certificazioni.

### Funzionalità Principali

#### Conversione CID ↔ Address

- **CID to Address**: Conversione di Content Identifier IPFS in indirizzo Algorand reserve
- **Address to CID**: Conversione inversa di indirizzo Algorand in CID IPFS
- **Validazione**: Verifica della correttezza delle conversioni

#### Estrazione Versioning

- **Cronologia Versioni**: Estrazione della cronologia completa delle versioni di una certificazione
- **Metadata Versioning**: Recupero dei metadata per ogni versione
- **Link Versioni**: Generazione di link IPFS per ogni versione storica

#### Gestione Reserve Address

- **Decodifica Reserve**: Estrazione di informazioni dai reserve address degli asset
- **Validazione Formato**: Verifica della conformità agli standard ARC-19
- **Gateway URL**: Generazione di URL gateway per accesso ai contenuti

### Utilità nell'Applicazione

Il servizio CID Decoder:

- **Abilita Versioning**: Permette l'aggiornamento delle certificazioni mantenendo la storia
- **Garantisce Compatibilità**: Assicura conformità con standard ARC-19
- **Facilita Verifica**: Permette la verifica dei contenuti IPFS dalle transazioni blockchain
- **Supporta Tracciabilità**: Mantiene traccia completa di tutte le modifiche

### Flusso Operativo

1. **Upload Metadata**: I metadata vengono caricati su IPFS ottenendo un CID
2. **Conversione**: Il CID viene convertito in reserve address secondo ARC-19
3. **Registrazione**: Il reserve address viene registrato nell'asset blockchain
4. **Recupero**: Per visualizzare i metadata, il reserve address viene riconvertito in CID
5. **Accesso**: I metadata vengono recuperati da IPFS usando il CID

---

## Architettura Applicazione

### Descrizione

L'architettura di ArtCertify è progettata per separare chiaramente le responsabilità tra i diversi componenti dell'applicazione, facilitando la manutenzione, il testing e l'evoluzione del sistema. L'applicazione segue un'architettura a tre livelli che separa la presentazione (interfaccia utente), la logica di business (regole e workflow), e l'accesso ai dati (servizi esterni e storage).

Questa separazione permette a ciascun livello di evolversi indipendentemente dagli altri, facilitando l'aggiunta di nuove funzionalità o la modifica di quelle esistenti senza impattare l'intero sistema. Inoltre, questa architettura facilita il testing, poiché ogni livello può essere testato in isolamento, e migliora la sicurezza, poiché le operazioni critiche sono isolate in livelli specifici.

I servizi descritti in questo documento operano principalmente nel livello dati, fornendo interfacce standardizzate per interagire con la blockchain, lo storage IPFS, e i sistemi di autenticazione. Il livello di logica di business utilizza questi servizi per implementare i workflow complessi dell'applicazione, come il processo di creazione di una certificazione. Il livello di presentazione utilizza la logica di business per fornire all'utente un'interfaccia intuitiva e reattiva.

L'architettura supporta anche strategie di ottimizzazione delle performance, come il caching multi-livello, il lazy loading dei componenti, e il code splitting. Queste ottimizzazioni garantiscono che l'applicazione rimanga veloce e responsiva anche quando gestisce grandi quantità di dati o operazioni complesse sulla blockchain.

### Struttura Generale

L'applicazione ArtCertify segue un'architettura a tre livelli:

#### Livello Presentazione

- **Componenti UI**: Interfaccia utente reattiva e responsiva
- **Form Certificazioni**: Form per creazione e modifica certificazioni
- **Visualizzazione Asset**: Pagine per visualizzazione dettagli certificazioni
- **Dashboard**: Pannello di controllo principale

#### Livello Logica Business

- **Custom Hooks**: Logica riutilizzabile per operazioni comuni
- **Context Management**: Gestione stato globale applicazione
- **Workflow Orchestration**: Coordinamento dei flussi operativi complessi

#### Livello Dati

- **Servizi Blockchain**: Integrazione con Algorand blockchain
- **Servizi Storage**: Integrazione con IPFS per storage decentralizzato
- **Servizi Autenticazione**: Gestione autenticazione wallet
- **Cache Locale**: Ottimizzazione performance con cache client-side

### Flussi Operativi Principali

#### Flusso Creazione Certificazione

1. L'utente compila il form di certificazione
2. I file vengono caricati su IPFS
3. I metadata vengono strutturati e caricati su IPFS
4. Il CID viene convertito in reserve address
5. L'asset SBT viene creato sulla blockchain
6. L'asset viene configurato con il reserve address
7. La certificazione è completa e verificabile

#### Flusso Visualizzazione Certificazione

1. L'utente accede alla pagina dettagli certificazione
2. Il sistema recupera le informazioni asset dalla blockchain
3. Il reserve address viene decodificato per ottenere il CID
4. I metadata vengono recuperati da IPFS usando il CID
5. I file allegati vengono recuperati da IPFS
6. Tutte le informazioni vengono visualizzate all'utente

#### Flusso Aggiornamento Certificazione

1. L'utente richiede la modifica di una certificazione esistente
2. Il sistema recupera la versione corrente
3. I nuovi dati vengono caricati su IPFS
4. Il nuovo CID viene convertito in nuovo reserve address
5. L'asset viene aggiornato con il nuovo reserve address
6. La cronologia versioni viene preservata

### Sicurezza e Best Practices

#### Sicurezza

- **Zero Private Keys**: Nessuna chiave privata è mai gestita dall'applicazione
- **User Control**: Tutte le transazioni richiedono approvazione esplicita
- **Network Validation**: Validazione automatica della configurazione network
- **Input Validation**: Validazione rigorosa di tutti gli input utente

#### Performance

- **Caching Strategy**: Cache multi-livello per ottimizzare performance
- **Lazy Loading**: Caricamento lazy dei componenti pesanti
- **Code Splitting**: Divisione del codice per ridurre bundle size
- **Optimistic Updates**: Aggiornamenti ottimistici per migliorare UX

#### Manutenibilità

- **Modularità**: Architettura modulare per facilitare manutenzione
- **Type Safety**: TypeScript per prevenire errori a compile-time
- **Documentazione**: Documentazione completa di tutti i servizi
- **Testing**: Strategia di testing per garantire qualità

---

## Conclusioni

L'applicazione ArtCertify fornisce un sistema completo per la certificazione digitale blockchain, caratterizzato da:

- **Immutabilità**: Le certificazioni sono permanenti e non modificabili
- **Trasparenza**: Tutte le operazioni sono verificabili pubblicamente
- **Sicurezza**: Autenticazione sicura senza gestione chiavi private
- **Flessibilità**: Supporto per diversi tipi di certificazioni
- **Versioning**: Possibilità di aggiornare certificazioni mantenendo la storia

Ogni servizio contribuisce in modo specifico al funzionamento complessivo dell'applicazione, garantendo un sistema robusto, sicuro e scalabile per la certificazione digitale.

---

**Fine Documento**

