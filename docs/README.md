# 📚 Documentazione Caput Mundi FE

Benvenuto nella documentazione completa di **Caput Mundi Frontend**. Questa cartella contiene guide dettagliate per tutte le integrazioni e funzionalità dell'applicazione per la certificazione digitale tramite blockchain.

## 🚀 **STATO ATTUALE: PRODUCTION READY**

✅ **Implementazione Completa NFT + IPFS + Algorand**
- ✅ Servizi implementati e funzionanti al 100%
- ✅ UI integrata e responsive completa  
- ✅ Build passa senza errori TypeScript
- ✅ Documentazione completa e aggiornata
- ✅ Testing framework implementato
- ✅ ARC-19 + ARC-3 compliance completa

### 🔄 Implementazione Finale Completata
- [x] **IPFSService completo** - Pinata integration con ARC-19 compliance
- [x] **NFTMintingService** - ARC-19 + ARC-3 minting completo
- [x] **CidDecoder aggiornato** - ARC-19 CID ↔ Address conversion
- [x] **AlgorandService potenziato** - Enhanced asset info con versioning
- [x] **NFTService nuovo** - Asset management e certificate identification
- [x] **Forms completamente integrati** - Upload e minting workflow
- [x] **Wallet UI enhanced** - Asset display e transaction management
- [x] **Error handling completo** - User experience ottimizzata
- [x] **Rate limiting** - Performance e API optimization
- [x] **TypeScript types** - Type safety completa

## 📋 Indice Documentazione

### 🏗️ [Architettura](./ARCHITECTURE.md)
Documentazione completa dell'architettura dell'applicazione, inclusi pattern architetturali, flussi di dati e decisioni di design.

**Contenuti:**
- Architettura generale e stack tecnologico
- Flussi di dati e sequence diagrams
- Pattern di integrazione (Service Layer, Repository, Factory)
- Performance patterns e caching strategy
- Security architecture e monitoring
- Testing strategy e deployment

### 🔗 [Integrazione Algorand](./ALGORAND_INTEGRATION.md)
Guida completa per l'integrazione con la blockchain Algorand per NFT soulbound e certificazioni digitali.

**Contenuti Aggiornati:**
- ✅ Configurazione Algorand TestNet completa
- ✅ Architettura servizi (AlgorandService, NFTMintingService, NFTService)
- ✅ Creazione NFT soulbound con ARC-19 + ARC-3 compliance
- ✅ Gestione wallet avanzata e asset management
- ✅ Explorer integration per debugging
- ✅ Rate limiting e performance optimization

### 🌐 [Integrazione IPFS](./IPFS_INTEGRATION.md)
Documentazione per l'integrazione IPFS utilizzando Pinata per storage decentralizzato.

**Contenuti Aggiornati:**
- ✅ Setup Pinata completo con regional replication
- ✅ Upload workflow certificazioni con metadata strutturati
- ✅ ARC-19 CID to Address conversion integration
- ✅ Multiple gateway support e fallback strategies
- ✅ Parallel uploads con rate limiting
- ✅ Security best practices e content validation

### 🎨 [NFT Minting Service](./NFT_MINTING_SERVICE.md) ⭐ NUOVO
Servizio completo per la creazione di certificazioni digitali soulbound con integrazione Algorand e IPFS.

**Contenuti:**
- ✅ Architettura e flusso completo di minting ARC-19 + ARC-3
- ✅ Creazione certificazioni documenti e artefatti
- ✅ Workflow IPFS → CID → Reserve Address → Asset Creation
- ✅ Metadata versioning e aggiornamenti certificazioni
- ✅ Service diagnostics e testing integrato
- ✅ Performance optimization e monitoring

### 🔍 [CID Decoder](./CID_DECODER.md)
Sistema di decodifica CID che implementa lo standard ARC-0019 per la conversione tra indirizzi Algorand e Content Identifiers IPFS.

**Contenuti Aggiornati:**
- ✅ Implementazione completa standard ARC-0019
- ✅ Conversione address ↔ CID bidirezionale
- ✅ Versioning extraction da reserve addresses
- ✅ Reserve address validation e decoding
- ✅ Integration con NFTMintingService



### 🎨 [Design System](./DESIGN_SYSTEM.md)
Documentazione completa del Design System rifattorizzato con componenti riutilizzabili.

**Contenuti:**
- Architettura componenti (base, state, form, layout, data)
- Palette colori e tipografia
- Componenti base (Button, Card, Input, etc.)
- Componenti layout (PageHeader, SearchAndFilter, TabsContainer)
- Pattern di utilizzo e customizzazione
- Responsive design e accessibility

### 🪝 [Custom Hooks](./CUSTOM_HOOKS.md)
Documentazione dei custom hooks per funzionalità riutilizzabili.

**Contenuti:**
- useAsyncState: Gestione stati asincroni
- useDebounce: Debounce per input e ricerche
- useLocalStorage: Persistenza dati
- Composizione hooks e pattern avanzati
- Testing e performance

## 🚀 Quick Start per Sviluppatori

### 1. Setup Ambiente
```bash
# Clona repository
git clone <repository-url>
cd caput-mundi-fe

# Installa dipendenze
npm install

# Configura variabili d'ambiente
cp env.example .env
# Configura tutte le variabili richieste in .env
```

### 2. Configurazione Completa Richiesta
```bash
# Algorand Network (OBBLIGATORIO)
VITE_ALGORAND_NETWORK=testnet
VITE_ALGOD_TOKEN=
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_INDEXER_TOKEN=
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
VITE_INDEXER_PORT=443

# Pinata IPFS (OBBLIGATORIO)
VITE_PINATA_API_KEY=your_api_key
VITE_PINATA_API_SECRET=your_api_secret  
VITE_PINATA_JWT=your_jwt_token
VITE_PINATA_GATEWAY=your-gateway.mypinata.cloud

# Minting Accounts (OBBLIGATORIO)
VITE_PRIVATE_KEY_MNEMONIC=your_minting_account_mnemonic
VITE_MANAGER_MNEMONIC=your_manager_account_mnemonic
```

### 3. Comandi Sviluppo
```bash
# Verifica build (IMPORTANTE)
npm run build

# Avvia server di sviluppo
npm run dev

# Test servizi
# Vai su http://localhost:5174 e testa:
# - Form certificazioni
# - Wallet connection
# - Asset display
```

## 🏗️ Architettura Servizi Implementati

### Core Services
```
src/services/
├── ipfsService.ts        ✅ NUOVO - Pinata integration completa
├── nftMintingService.ts  ✅ NUOVO - ARC-19 + ARC-3 minting
├── algorand.ts           ✅ AGGIORNATO - Enhanced features
├── cidDecoder.ts         ✅ AGGIORNATO - ARC-19 support
├── nftService.ts         ✅ NUOVO - Asset management
├── walletService.ts      ✅ ESISTENTE - Wallet management
└── spidService.ts        ✅ ESISTENTE - SPID authentication
```

### UI Components Integrati
```
src/components/
├── forms/
│   ├── ArtifactForm.tsx  ✅ INTEGRATO - Minting workflow completo
│   └── DocumentForm.tsx  ✅ INTEGRATO - Document certification
├── WalletPage.tsx        ✅ AGGIORNATO - Enhanced asset display
├── AssetDetailsPage.tsx  ✅ AGGIORNATO - CID decoding integrato
└── ui/                   ✅ AGGIORNATI - Enhanced components
```

## 📖 Guide di Lettura per Ruolo

### 👨‍💻 Sviluppatori Frontend
1. **[Design System](./DESIGN_SYSTEM.md)** - Componenti e pattern UI
2. **[Custom Hooks](./CUSTOM_HOOKS.md)** - Logica riutilizzabile
3. **[NFT Minting Service](./NFT_MINTING_SERVICE.md)** - Overview integrazione blockchain
4. **[Architettura](./ARCHITECTURE.md)** - Struttura generale

### ⛓️ Sviluppatori Blockchain
1. **[NFT Minting Service](./NFT_MINTING_SERVICE.md)** - Servizio core per certificazioni
2. **[Integrazione Algorand](./ALGORAND_INTEGRATION.md)** - Blockchain integration
3. **[Integrazione IPFS](./IPFS_INTEGRATION.md)** - Storage decentralizzato
4. **[CID Decoder](./CID_DECODER.md)** - Standard ARC-0019

### 🚀 DevOps/Deployment
1. **[NFT Minting Service](./NFT_MINTING_SERVICE.md)** - Configuration requirements
2. **[Integrazione Algorand](./ALGORAND_INTEGRATION.md)** - Network configuration
3. **[Architettura](./ARCHITECTURE.md)** - Deployment architecture

### 📊 Product Managers
1. **[NFT Minting Service](./NFT_MINTING_SERVICE.md)** - Stato e funzionalità
2. **[Design System](./DESIGN_SYSTEM.md)** - UI/UX overview
3. **[Architettura](./ARCHITECTURE.md)** - Technical overview

## 🔧 Testing e Diagnostica

### Workflow Completo Testing
```bash
# 1. Verifica build
npm run build
# ✅ Deve completare senza errori

# 2. Avvia applicazione
npm run dev

# 3. Test servizi integration
# Nel browser, vai alla console e testa:
const nftMintingService = new NFTMintingService();
const testResult = await nftMintingService.testService();
console.log('Services test:', testResult);
```

### Test Funzionalità Chiave

#### ✅ Test Upload File + Minting
1. Vai su "Crea Certificazione Artefatto"
2. Compila tutti i campi richiesti
3. Carica file di test
4. Clicca "Crea Certificazione"
5. Verifica risultato con Asset ID

#### ✅ Test Wallet Integration
1. Vai su "Wallet"
2. Connetti wallet (o usa demo mode)
3. Verifica visualizzazione saldi
4. Controlla tab "Asset" per certificazioni

#### ✅ Test Asset Details
1. Vai su Asset Details con un Asset ID valido
2. Verifica CID decoding funziona
3. Controlla metadata display
4. Verifica explorer links

## 🚨 Problemi Comuni e Soluzioni

### ❌ Build Errors
```bash
# Pulisci e reinstalla
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### ❌ IPFS Upload Fails
- Verifica API keys Pinata in .env
- Controlla limiti file size (max 10MB)
- Verifica connessione internet

### ❌ Algorand Connection Fails
- Verifica ALGOD/INDEXER endpoints in .env
- Controlla network (testnet vs mainnet)
- Verifica formato mnemonic (25 parole)

### ❌ Minting Fails
- Verifica saldo account (min 0.1 ALGO)
- Controlla mnemonic account in .env
- Verifica tutti i campi form compilati

## 🎯 Roadmap e Next Steps

### 🚦 Ready for Production Testing
Il sistema è **completamente implementato** e pronto per:
1. ✅ Testing completo in TestNet
2. ✅ User acceptance testing  
3. ✅ Performance testing
4. ✅ Security audit
5. ✅ Deployment preparation

### 🔮 Future Enhancements
- [ ] Batch minting per certificazioni multiple
- [ ] Advanced asset search e filtering
- [ ] MetaMask wallet integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

**Documentazione completa per Caput Mundi FE - Sistema completo per certificazioni digitali blockchain-based** 