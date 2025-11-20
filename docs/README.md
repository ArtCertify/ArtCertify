# 📚 Documentazione ArtCertify

Benvenuto nella documentazione completa di **ArtCertify**. Questa cartella contiene guide dettagliate per tutte le integrazioni e funzionalità dell'applicazione di certificazione digitale blockchain.

## 🚀 **STATO ATTUALE: PRODUCTION READY**

✅ **Implementazione Completa con Pera Wallet Connect**
- ✅ Autenticazione Pera Wallet Connect 1.4.2 integrata al 100%
- ✅ Smart retry system per certificazioni con step-specific recovery
- ✅ Stepper interattivo con informazioni real-time e link dinamici
- ✅ Sistema di versioning ottimizzato con riutilizzo IPFS
- ✅ UI/UX moderna con TailwindCSS 3.4.17 e Headless UI
- ✅ Zero private keys - sicurezza completa
- ✅ Build TypeScript senza errori e ottimizzazioni Vite

### 🔄 Evoluzione Architetturale Completata
- [x] **Migrazione da .env mnemonic a Pera Wallet** - Sicurezza massima
- [x] **Smart Retry System** - Recovery intelligente da fallimenti parziali
- [x] **Stepper Real-time** - Visualizzazione progresso e link dinamici
- [x] **Versioning Ottimizzato** - Riutilizzo IPFS cache per performance
- [x] **React 19.1.0 + TypeScript 5.8.3** - Stack moderno e performante
- [x] **Design System Completo** - 30+ componenti riutilizzabili
- [x] **Error Handling Avanzato** - UX robusta per edge cases
- [x] **Network Auto-Configuration** - Switch automatico TestNet/MainNet

## 📋 Indice Documentazione

### 🏗️ [Architettura](./ARCHITECTURE.md)
Documentazione completa dell'architettura dell'applicazione, pattern di sviluppo e decisioni di design.

**Contenuti Aggiornati:**
- Architettura a 3 layer (Presentation, Business Logic, Data)
- Pattern di integrazione (Service Layer, Factory, Repository)
- Smart Retry System e gestione errori
- Performance optimization e caching strategies
- Security architecture con Pera Wallet
- Testing strategy e deployment pipeline

### 🔗 [Integrazione Algorand](./ALGORAND_INTEGRATION.md)
Guida completa per l'integrazione blockchain Algorand con Soulbound Tokens (SBT).

**Contenuti Core:**
- ✅ Configurazione automatica network TestNet/MainNet
- ✅ Integrazione Pera Wallet Connect per firma transazioni
- ✅ Creazione SBT con ARC-3 + ARC-19 compliance
- ✅ Asset management e portfolio visualization
- ✅ Explorer integration e transaction tracking
- ✅ Performance optimization per API calls

### 🌐 [Integrazione IPFS](./IPFS_INTEGRATION.md)
Documentazione storage decentralizzato IPFS con Pinata gateway.

**Contenuti Aggiornati:**
- ✅ Setup Pinata completo con custom gateway
- ✅ Upload workflow ottimizzato con parallel processing
- ✅ ARC-19 CID to Address conversion integrata
- ✅ Caching IPFS per versioning performance
- ✅ Security best practices e content validation
- ✅ Error handling e fallback strategies

### 🔌 [Integrazione Pera Connect](./PERA_CONNECT_INTEGRATION.md) ⭐ NUOVO
Documentazione completa dell'integrazione Pera Wallet Connect come unico metodo di autenticazione.

**Contenuti:**
- ✅ Setup Pera Wallet Connect 1.4.2
- ✅ Autenticazione multi-platform (mobile QR + desktop)
- ✅ Transaction signing per MINTER role
- ✅ Session persistence e auto-reconnect
- ✅ Error handling e UX best practices
- ✅ Security model zero-private-keys

### 🔍 [CID Decoder](./CID_DECODER.md)
Sistema di decodifica CID che implementa lo standard ARC-19 per conversione bidirezionale.

**Contenuti Aggiornati:**
- ✅ Implementazione completa standard ARC-19
- ✅ Conversione address ↔ CID bidirezionale
- ✅ Versioning extraction da reserve addresses
- ✅ Integration con certificazione flow
- ✅ Validation e error handling robusti

### ⚙️ [Configurazione Network](./NETWORK_CONFIGURATION.md) ⭐ NUOVO
Guida completa per configurazione automatica network Algorand.

**Contenuti:**
- ✅ Switch automatico TestNet/MainNet
- ✅ Endpoint configuration automatica
- ✅ Chain ID e explorer URL dinamici
- ✅ Validazione configurazione ambiente
- ✅ Best practices deployment

### 🎨 [Design System](./DESIGN_SYSTEM.md)
Sistema di design completo con componenti TailwindCSS riutilizzabili.

**Contenuti Completi:**
- 30+ componenti UI modulari e accessibili
- Sistema colori e tipografia consistente
- Layout responsive e mobile-first
- Pattern di utilizzo e customizzazione
- Accessibility e WCAG compliance
- Storybook integration (futuro)

### 🪝 [Custom Hooks](./CUSTOM_HOOKS.md)
Documentazione custom hooks per logica business riutilizzabile.

**Contenuti Aggiornati:**
- **usePeraCertificationFlow**: Hook principale per certificazioni con smart retry
- **usePeraWallet**: Hook integrazione Pera Wallet Connect
- **useTransactionSigning**: Hook firma transazioni con error handling
- **useAsyncState**: Gestione stati asincroni con loading/error
- **useDebounce**: Debounce per input e ricerche
- **useLocalStorage**: Persistenza dati tipizzata

## 🚀 Quick Start per Sviluppatori

### 1. Setup Ambiente
```bash
# Clona repository
git clone <repository-url>
cd artcertify

# Installa dipendenze
npm install

# Configura variabili d'ambiente
cp env.example .env.local
# Configura le variabili richieste
```

### 2. Configurazione Essenziale
```bash
# Network Algorand (Auto-configuration)
VITE_ALGORAND_NETWORK=testnet  # o mainnet

# Pinata IPFS (OBBLIGATORIO)
VITE_PINATA_API_KEY=your_api_key
VITE_PINATA_API_SECRET=your_api_secret  
VITE_PINATA_JWT=your_jwt_token
VITE_PINATA_GATEWAY=your-gateway.mypinata.cloud

# Optional: Private key per testing quick login
VITE_PRIVATE_KEY_MNEMONIC=your_test_mnemonic
```

### 3. Workflow Sviluppo
```bash
# Build verification (IMPORTANTE)
npm run build

# Avvia development server
npm run dev

# Test funzionalità principali:
# 1. Login con Pera Wallet
# 2. Creazione certificazione
# 3. Visualizzazione portfolio
# 4. Asset details con CID decoding
```

## 🏗️ Architettura Servizi Attuali

### Core Services Implementati
```
src/services/
├── peraWalletService.ts      ✅ NUOVO - Pera Wallet Connect integration
├── ipfsService.ts            ✅ COMPLETO - Pinata + ARC-19 integration
├── algorand.ts               ✅ AGGIORNATO - Enhanced asset management
├── cidDecoder.ts             ✅ AGGIORNATO - ARC-19 full compliance
├── walletService.ts          ✅ AGGIORNATO - Multi-wallet support
├── nftService.ts             ✅ COMPLETO - Asset portfolio management
└── spidService.ts            ✅ PLACEHOLDER - Future authentication
```

### Custom Hooks Ecosystem
```
src/hooks/
├── usePeraCertificationFlow.ts  ✅ NUOVO - Smart retry certification flow
├── usePeraWallet.ts             ✅ NUOVO - Pera Wallet integration
├── useTransactionSigning.ts     ✅ NUOVO - Transaction signing flow
├── useAsyncState.ts             ✅ ESISTENTE - Async state management
├── useDebounce.ts               ✅ ESISTENTE - Input debouncing
└── useLocalStorage.ts           ✅ ESISTENTE - Storage persistence
```

### UI Components Architecture
```
src/components/
├── ui/                          ✅ 30+ componenti base riutilizzabili
├── forms/                       ✅ Form certificazione integrati
├── modals/                      ✅ Modal con stepper interattivo
├── asset/                       ✅ Componenti gestione asset
├── layout/                      ✅ Layout responsive
└── [pages]                      ✅ Pagine complete con routing
```

## 📖 Guide di Lettura per Ruolo

### 👨‍💻 Frontend Developers
1. **[Design System](./DESIGN_SYSTEM.md)** - Componenti UI e pattern
2. **[Custom Hooks](./CUSTOM_HOOKS.md)** - Logica business riutilizzabile  
3. **[Pera Connect Integration](./PERA_CONNECT_INTEGRATION.md)** - Autenticazione
4. **[Architettura](./ARCHITECTURE.md)** - Struttura generale e pattern

### ⛓️ Blockchain Developers  
1. **[Integrazione Algorand](./ALGORAND_INTEGRATION.md)** - Blockchain core
2. **[Integrazione IPFS](./IPFS_INTEGRATION.md)** - Storage decentralizzato
3. **[CID Decoder](./CID_DECODER.md)** - Standard ARC-19
4. **[Network Configuration](./NETWORK_CONFIGURATION.md)** - Setup network

### 🚀 DevOps/Deployment
1. **[Network Configuration](./NETWORK_CONFIGURATION.md)** - Environment setup
2. **[Integrazione Algorand](./ALGORAND_INTEGRATION.md)** - Network requirements
3. **[Pera Connect Integration](./PERA_CONNECT_INTEGRATION.md)** - Security model
4. **[Architettura](./ARCHITECTURE.md)** - Deployment strategies

### 📊 Product Managers
1. **[Pera Connect Integration](./PERA_CONNECT_INTEGRATION.md)** - User experience
2. **[Design System](./DESIGN_SYSTEM.md)** - UI/UX overview
3. **[Architettura](./ARCHITECTURE.md)** - Technical capabilities
4. **[Network Configuration](./NETWORK_CONFIGURATION.md)** - Environment options

## 🔧 Testing e Diagnostica

### Workflow Completo Testing
```bash
# 1. Verifica build
npm run build
# ✅ Deve completare senza errori TypeScript

# 2. Avvia applicazione
npm run dev

# 3. Test workflow principale:
# - Login Pera Wallet ✅
# - Creazione certificazione ✅  
# - Smart retry su fallimenti ✅
# - Visualizzazione portfolio ✅
# - Asset details + versioning ✅
```

### Test Funzionalità Chiave

#### ✅ Test Autenticazione
1. Vai su http://localhost:5173/login
2. Clicca "Connetti con Pera Wallet"
3. Scansiona QR code o connetti desktop
4. Verifica reindirizzamento dashboard

#### ✅ Test Certificazione Completa
1. Dashboard > "Crea Certificazione"
2. Compila form artefatto/documento
3. Carica file allegati
4. Avvia stepper certificazione
5. Firma transazioni con Pera Wallet
6. Verifica asset creato con link

#### ✅ Test Portfolio e Versioning
1. Vai su "Wallet" tab
2. Verifica asset portfolio
3. Clicca su asset per dettagli
4. Testa modifica allegati
5. Verifica cronologia versioning

## 🚨 Troubleshooting Comune

### ❌ Errori Build
```bash
# Pulisci e reinstalla
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### ❌ Pera Wallet Connection Issues
- Verifica network configuration (TestNet vs MainNet)
- Controlla versione Pera Wallet aggiornata
- Assicurati che wallet abbia saldo per transazioni

### ❌ IPFS Upload Failures  
- Verifica credenziali Pinata in `.env.local`
- Controlla rate limits API Pinata
- Verifica connettività gateway

### ❌ Transaction Failures
- Controlla saldo account per fee
- Verifica network congestion
- Controlla logs console per dettagli specifici

---

## 📞 Supporto

Per supporto tecnico o domande sulla documentazione:
- **📧 Email**: [info@artcertify.com](mailto:info@artcertify.com)
- **🌐 Website**: [www.artcertify.com](https://www.artcertify.com)
- **🐛 Issues**: Repository issues per bug report e feature request

**🚀 Happy Coding con ArtCertify!** 