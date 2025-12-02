# 📚 Documentazione ArtCertify

Documentazione tecnica completa dell'applicazione **ArtCertify** per certificazione digitale blockchain. Questa documentazione descrive l'architettura, i componenti e le integrazioni del sistema.

## 📋 Versione Documentazione

**Versione:** 2.0  
**Data Aggiornamento:** 2024  
**Stato:** Production Ready

## 🏗️ Struttura Gerarchica del Progetto

### 1. Services Layer (v2.0)

Il layer dei servizi contiene 9 servizi core che gestiscono le interazioni con sistemi esterni e la logica di business:

```
src/services/
├── algorand.ts              # v1.0 - Integrazione blockchain Algorand
├── authService.ts           # v2.0 - Autenticazione JWT con backend API
├── cidDecoder.ts            # v1.0 - Decodifica CID ARC-19 compliance
├── ipfsService.ts           # v1.0 - Integrazione Pinata IPFS
├── ipfsUrlService.ts        # v1.0 - Gestione URL IPFS e gateway
├── nftService.ts            # v1.0 - Gestione NFT e portfolio
├── peraWalletService.ts     # v1.0 - Integrazione Pera Wallet Connect
├── spidService.ts           # v1.0 - Integrazione SPID (placeholder)
└── walletService.ts         # v1.0 - Servizi wallet generici
```

### 2. Hooks Layer (v2.0)

Il layer degli hooks contiene 10 custom hooks per la gestione dello stato e della logica riutilizzabile:

```
src/hooks/
├── useAsyncState.ts             # v1.0 - Gestione stati asincroni
├── useDebounce.ts               # v1.0 - Debounce per input
├── useIPFSMetadata.ts           # v1.0 - Gestione metadata IPFS
├── useLocalStorage.ts           # v1.0 - Persistenza localStorage
├── usePeraCertificationFlow.ts  # v1.0 - Flusso certificazione con retry
├── usePeraWallet.ts             # v1.0 - Integrazione Pera Wallet
├── useProjectsCache.ts          # v1.0 - Cache progetti
├── useTransactionSigning.ts     # v2.0 - Firma transazioni + auth transaction
├── useWalletSignature.ts        # v2.0 - Gestione firma Terms & Conditions
└── useWalletValidation.ts       # v1.0 - Validazione wallet
```

### 3. Components Layer (v2.0)

Il layer dei componenti è organizzato gerarchicamente per categoria:

```
src/components/
├── ui/                          # v1.0 - Design System (30+ componenti)
│   ├── Alert.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── DataGrid.tsx
│   ├── EmptyState.tsx
│   ├── ErrorMessage.tsx
│   ├── FileUpload.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   ├── Modal.tsx
│   ├── Select.tsx
│   ├── Stepper.tsx
│   └── [altri 17 componenti]
│
├── forms/                       # v1.0 - Form specializzati
│   ├── ArtifactForm.tsx
│   ├── BaseCertificationForm.tsx
│   └── CertificationForm.tsx
│
├── modals/                      # v2.0 - Dialog e modal
│   ├── CertificationModal.tsx
│   ├── ModifyAttachmentsModal.tsx
│   ├── ModifyOrganizationModal.tsx
│   ├── TermsAndConditions.tsx   # v2.0
│   └── WalletSignatureModal.tsx # v2.0
│
├── asset/                       # v1.0 - Componenti gestione asset
│   ├── AssetDescription.tsx
│   ├── AssetHeader.tsx
│   ├── AssetInfoCard.tsx
│   ├── AttachmentsSection.tsx
│   └── TechnicalMetadata.tsx
│
├── layout/                      # v1.0 - Layout e struttura
│   ├── BackgroundLayout.tsx
│   └── ResponsiveLayout.tsx
│
└── [pages]                      # v1.0 - Pagine complete
    ├── DashboardPage.tsx
    ├── AssetDetailsPage.tsx
    ├── CertificationsPage.tsx
    ├── LoginPage.tsx
    ├── OrganizationOnboarding.tsx
    ├── OrganizationProfilePage.tsx
    ├── RolesPage.tsx
    └── SPIDCallbackPage.tsx
```

### 4. Contexts Layer (v1.0)

Gestione stato globale dell'applicazione:

```
src/contexts/
├── AuthContext.tsx          # v1.0 - Context autenticazione
└── OrganizationContext.tsx   # v1.0 - Context organizzazione
```

### 5. Types Layer (v1.0)

Definizioni TypeScript per type safety:

```
src/types/
├── asset.ts                 # v1.0 - Tipi asset, NFT e metadata
└── cid.ts                   # v1.0 - Tipi CID IPFS e decodifica
```

## 📋 Indice Documentazione

### 🏗️ [Architettura](./ARCHITECTURE.md) - v2.0
Documentazione completa dell'architettura dell'applicazione, pattern di sviluppo e decisioni di design.

**Contenuti:**
- Architettura a 3 layer (Presentation, Business Logic, Data)
- Pattern di integrazione (Service Layer, Factory, Repository)
- Smart Retry System e gestione errori
- Performance optimization e caching strategies
- Security architecture con Pera Wallet
- Testing strategy e deployment pipeline

### 🔗 [Integrazione Algorand](./ALGORAND_INTEGRATION.md) - v1.0
Guida completa per l'integrazione blockchain Algorand con Soulbound Tokens (SBT).

**Contenuti:**
- Configurazione automatica network TestNet/MainNet
- Integrazione Pera Wallet Connect per firma transazioni
- Creazione SBT con ARC-3 + ARC-19 compliance
- Asset management e portfolio visualization
- Explorer integration e transaction tracking
- Performance optimization per API calls

### 🌐 [Integrazione IPFS](./IPFS_INTEGRATION.md) - v1.0
Documentazione storage decentralizzato IPFS con Pinata gateway.

**Contenuti:**
- Setup Pinata completo con custom gateway
- Upload workflow ottimizzato con parallel processing
- ARC-19 CID to Address conversion integrata
- Caching IPFS per versioning performance
- Security best practices e content validation
- Error handling e fallback strategies

### 🔌 [Integrazione Pera Connect](./PERA_CONNECT_INTEGRATION.md) - v1.0
Documentazione completa dell'integrazione Pera Wallet Connect come metodo di autenticazione.

**Contenuti:**
- Setup Pera Wallet Connect 1.4.2
- Autenticazione multi-platform (mobile QR + desktop)
- Transaction signing per MINTER role
- Session persistence e auto-reconnect
- Error handling e UX best practices
- Security model zero-private-keys

### 🔐 [Autenticazione JWT Backend](./AUTH_JWT_INTEGRATION.md) - v2.0
Documentazione completa dell'integrazione con backend API per autenticazione JWT tramite firma transazione Algorand.

**Contenuti:**
- Autenticazione con backend tramite firma transazione
- WalletSignatureModal per Terms & Conditions
- useWalletSignature hook per gestione stato firma
- authService per comunicazione con backend API
- JWT token management e storage
- Integrazione con endpoint `/api/v1/auth/algorand`

### 🔍 [CID Decoder](./CID_DECODER.md) - v1.0
Sistema di decodifica CID che implementa lo standard ARC-19 per conversione bidirezionale.

**Contenuti:**
- Implementazione completa standard ARC-19
- Conversione address ↔ CID bidirezionale
- Versioning extraction da reserve addresses
- Integration con certificazione flow
- Validation e error handling robusti

### ⚙️ [Configurazione Network](./NETWORK_CONFIGURATION.md) - v1.0
Guida completa per configurazione automatica network Algorand.

**Contenuti:**
- Switch automatico TestNet/MainNet
- Endpoint configuration automatica
- Chain ID e explorer URL dinamici
- Validazione configurazione ambiente
- Best practices deployment

### 🎨 [Design System](./DESIGN_SYSTEM.md) - v1.0
Sistema di design completo con componenti TailwindCSS riutilizzabili.

**Contenuti:**
- 30+ componenti UI modulari e accessibili
- Sistema colori e tipografia consistente
- Layout responsive e mobile-first
- Pattern di utilizzo e customizzazione
- Accessibility e WCAG compliance

### 🪝 [Custom Hooks](./CUSTOM_HOOKS.md) - v2.0
Documentazione custom hooks per logica business riutilizzabile.

**Contenuti:**
- usePeraCertificationFlow: Hook principale per certificazioni con smart retry
- usePeraWallet: Hook integrazione Pera Wallet Connect
- useTransactionSigning: Hook firma transazioni con error handling (v2.0: aggiunta auth transaction)
- useWalletSignature: Hook gestione firma Terms & Conditions e stato autenticazione (v2.0)
- useAsyncState: Gestione stati asincroni con loading/error
- useDebounce: Debounce per input e ricerche
- useLocalStorage: Persistenza dati tipizzata
- useIPFSMetadata: Gestione metadata IPFS
- useProjectsCache: Cache progetti
- useWalletValidation: Validazione wallet

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

# Backend API (OPZIONALE - Richiesto per autenticazione JWT)
VITE_API_BASE_URL=http://localhost:8088  # URL del backend API

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

## 📊 Matrice Versioning Componenti

### Services (v2.0)
| Servizio | Versione | Descrizione |
|----------|----------|-------------|
| `algorand.ts` | v1.0 | Integrazione blockchain Algorand |
| `authService.ts` | v2.0 | Autenticazione JWT con backend API |
| `cidDecoder.ts` | v1.0 | Decodifica CID ARC-19 compliance |
| `ipfsService.ts` | v1.0 | Integrazione Pinata IPFS |
| `ipfsUrlService.ts` | v1.0 | Gestione URL IPFS e gateway |
| `nftService.ts` | v1.0 | Gestione NFT e portfolio |
| `peraWalletService.ts` | v1.0 | Integrazione Pera Wallet Connect |
| `spidService.ts` | v1.0 | Integrazione SPID (placeholder) |
| `walletService.ts` | v1.0 | Servizi wallet generici |

### Hooks (v2.0)
| Hook | Versione | Descrizione |
|------|----------|-------------|
| `useAsyncState.ts` | v1.0 | Gestione stati asincroni |
| `useDebounce.ts` | v1.0 | Debounce per input |
| `useIPFSMetadata.ts` | v1.0 | Gestione metadata IPFS |
| `useLocalStorage.ts` | v1.0 | Persistenza localStorage |
| `usePeraCertificationFlow.ts` | v1.0 | Flusso certificazione con retry |
| `usePeraWallet.ts` | v1.0 | Integrazione Pera Wallet |
| `useProjectsCache.ts` | v1.0 | Cache progetti |
| `useTransactionSigning.ts` | v2.0 | Firma transazioni + auth transaction |
| `useWalletSignature.ts` | v2.0 | Gestione firma Terms & Conditions |
| `useWalletValidation.ts` | v1.0 | Validazione wallet |

### Components (v2.0)
| Categoria | Versione | Componenti |
|-----------|----------|------------|
| `ui/` | v1.0 | 30+ componenti base riutilizzabili |
| `forms/` | v1.0 | 3 form specializzati |
| `modals/` | v2.0 | 5 modal (v2.0: aggiunti TermsAndConditions, WalletSignatureModal) |
| `asset/` | v1.0 | 5 componenti gestione asset |
| `layout/` | v1.0 | 2 layout responsive |
| `[pages]` | v1.0 | 8 pagine complete |

## 📖 Guide di Lettura per Ruolo

### 👨‍💻 Frontend Developers
1. **[Design System](./DESIGN_SYSTEM.md)** - Componenti UI e pattern
2. **[Custom Hooks](./CUSTOM_HOOKS.md)** - Logica business riutilizzabile  
3. **[Pera Connect Integration](./PERA_CONNECT_INTEGRATION.md)** - Autenticazione wallet
4. **[Autenticazione JWT](./AUTH_JWT_INTEGRATION.md)** - Integrazione backend API
5. **[Architettura](./ARCHITECTURE.md)** - Struttura generale e pattern

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