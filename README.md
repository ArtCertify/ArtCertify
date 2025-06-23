# 🎨 CaputMundi ArtCertify - Certificazione Blockchain

**CaputMundi ArtCertify** è una piattaforma avanzata per la certificazione di documenti e artefatti culturali su blockchain Algorand, sviluppata da **CaputMundi**. Utilizza NFT soulbound (SBT) per garantire l'autenticità, la tracciabilità e la non-trasferibilità delle certificazioni digitali.

![ArtCertify Logo](src/assets/logo.png)

## ✨ Caratteristiche Principali

### 🔐 **Certificazione Blockchain Avanzata**
- **NFT Soulbound (SBT)**: Certificazioni non trasferibili legate permanentemente al wallet
- **Compliance ARC-19 + ARC-3**: Standard Algorand per NFT con metadati IPFS
- **Template URL ARC-19**: `template-ipfs://{ipfscid:1:raw:reserve:sha2-256}` per massima compatibilità
- **Blockchain Algorand**: Sicurezza, velocità e sostenibilità della rete Algorand
- **Metadati IPFS**: Archiviazione decentralizzata tramite Pinata Gateway
- **Versioning**: Sistema completo di versionamento asset con storico immutabile

### 💳 **Gestione Wallet Completa**
- **Integrazione Multi-Wallet**: Pera Wallet, AlgoSigner e altri provider
- **Saldo Real-time**: Visualizzazione ALGO con conversione EUR automatica
- **Storico Transazioni**: Cronologia completa delle operazioni blockchain
- **Asset Management**: Gestione certificazioni soulbound e asset normali
- **Portfolio Analytics**: Statistiche dettagliate del portafoglio

### 🎨 **Design System Moderno**
- **59 Componenti UI**: Sistema modulare e scalabile con export centralizzato
- **Atomic Design**: Organizzazione atoms, molecules, organisms, templates
- **Palette Colori Completa**: Primary Blue, Success Green, Error Red, Warning Orange, Info Blue
- **Typography Scale**: 6 livelli tipografici da Page Title (30px) a Body Secondary (14px)
- **Responsive Mobile-First**: Layout adattivo con breakpoints customizzati
- **Animazioni Fluide**: Fade-in, slide-up, scale-in con keyframes CSS
- **Dark Theme**: Tema scuro ottimizzato per l'esperienza utente

### 📱 **Esperienza Utente Avanzata**
- **Skeleton Loading**: Loading states per ogni componente
- **Empty States**: Stati vuoti informativi e guidati
- **Error Handling**: Gestione errori completa con recovery actions
- **Progress Tracking**: Stepper per flussi multi-step
- **Real-time Feedback**: Status updates durante le operazioni
- **Tooltips Contextual**: Guida contestuale integrata

## 🚨 Setup Obbligatorio - Variabili d'Ambiente

**CRITICO**: L'applicazione richiede la configurazione completa delle variabili d'ambiente per funzionare.

### 1. Copia il file template

```bash
cp env.example .env
```

### 2. Configura tutte le variabili obbligatorie

```bash
# Pinata IPFS Gateway Configuration (OBBLIGATORIO)
VITE_PINATA_GATEWAY=coffee-quiet-limpet-747.mypinata.cloud

# Pinata API Configuration for IPFS (OBBLIGATORIO)
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_API_SECRET=your_pinata_api_secret
VITE_PINATA_JWT=your_pinata_jwt_token

# Private Key Mnemonics (OBBLIGATORIO per minting)
VITE_PRIVATE_KEY_MNEMONIC=your_minter_mnemonic_phrase
VITE_MANAGER_MNEMONIC=your_manager_mnemonic_phrase

# Algorand Network Configuration (OBBLIGATORIO)
VITE_ALGORAND_NETWORK=testnet

# Algorand API Endpoints (TUTTI OBBLIGATORI)
VITE_ALGOD_TOKEN=
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_INDEXER_TOKEN=
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
VITE_INDEXER_PORT=443
```

### 3. Come ottenere le credenziali

**Pinata (IPFS):**
1. Registrati su [Pinata](https://pinata.cloud)
2. Ottieni API Key, Secret e JWT dal dashboard
3. Configura un gateway dedicato

**Algorand:**
- Le configurazioni pubbliche sono già impostate per TestNet
- Per MainNet, aggiorna i server con gli endpoint appropriati

## 🚀 Installazione e Avvio

```bash
# Clona il repository
git clone https://gitlab.ccoe.activadigital.it/activa-digital/Artence/extras/poc-artcertify.git
cd poc-artcertify

# Installa le dipendenze
npm install

# Configura le variabili d'ambiente
cp env.example .env
# Modifica .env con le tue credenziali

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build

# Anteprima build di produzione
npm run preview

# Linting del codice
npm run lint
```

## 🏗️ Architettura del Progetto

```
src/
├── components/
│   ├── ui/                          # Design System (59 componenti)
│   │   ├── Alert.tsx               # 4 tipi di notifiche (success, error, warning, info)
│   │   ├── AssetDetailsSkeleton.tsx # Skeleton per pagina asset
│   │   ├── Badge.tsx               # Badge e etichette colorate
│   │   ├── Button.tsx              # 4 varianti + loading + icone
│   │   ├── Card.tsx                # 3 varianti + header + azioni
│   │   ├── DataGrid.tsx            # Griglia dati responsive
│   │   ├── DateInput.tsx           # Input data con validazione
│   │   ├── EmptyState.tsx          # Stati vuoti riutilizzabili
│   │   ├── ErrorMessage.tsx        # Messaggi di errore standardizzati
│   │   ├── FileUpload.tsx          # Drag & drop file con preview
│   │   ├── FormHeader.tsx          # Header form con back button
│   │   ├── FormLayout.tsx          # Layout responsive per form
│   │   ├── InfoCard.tsx            # Card informative
│   │   ├── InfoField.tsx           # Campo informativo riutilizzabile
│   │   ├── Input.tsx               # Form input con validazione
│   │   ├── IPFSFileCard.tsx        # Card per file IPFS con azioni
│   │   ├── LoadingSpinner.tsx      # Spinner di caricamento
│   │   ├── MetadataDisplay.tsx     # Display metadata NFT
│   │   ├── Modal.tsx               # Modali responsive con backdrop
│   │   ├── OrganizationData.tsx    # Dati organizzazione editabili
│   │   ├── PageHeader.tsx          # Header pagina standardizzato
│   │   ├── SearchAndFilter.tsx     # Barra ricerca e filtri
│   │   ├── SectionCard.tsx         # Card sezione con collapsible
│   │   ├── Select.tsx              # Dropdown personalizzato
│   │   ├── Skeleton.tsx            # 7 varianti skeleton loading
│   │   ├── StatusBadge.tsx         # Badge di stato colorati
│   │   ├── Stepper.tsx             # Stepper per flussi multi-step
│   │   ├── TabsContainer.tsx       # Container tab responsive
│   │   ├── Textarea.tsx            # Area di testo ridimensionabile
│   │   ├── Tooltip.tsx             # Tooltip informativi
│   │   ├── TruncatedText.tsx       # Testo troncato con expand
│   │   ├── VersionCard.tsx         # Card per versioni asset
│   │   └── index.ts                # Export centralizzato
│   │
│   ├── layout/
│   │   └── ResponsiveLayout.tsx    # Layout principale con sidebar collassabile
│   │
│   ├── pages/                       # 7 Pagine Principali
│   │   ├── DashboardPage.tsx       # Dashboard con overview certificazioni
│   │   ├── WalletPage.tsx          # Gestione wallet con tab
│   │   ├── AssetDetailsPage.tsx    # Dettagli asset con versioning
│   │   ├── CertificationsPage.tsx  # Lista e gestione certificazioni
│   │   ├── OrganizationProfilePage.tsx # Profilo organizzazione
│   │   ├── RolesPage.tsx           # Gestione ruoli e permessi
│   │   ├── LoginPage.tsx           # Autenticazione wallet
│   │   └── SPIDCallbackPage.tsx    # Callback SPID (futuro)
│   │
│   ├── asset/                       # Componenti Specifici Asset
│   │   ├── AssetHeader.tsx         # Header con info principali
│   │   ├── AssetInfoCard.tsx       # Card informazioni asset
│   │   ├── AssetDescription.tsx    # Descrizione e metadata
│   │   ├── AttachmentsSection.tsx  # Gestione allegati IPFS
│   │   └── TechnicalMetadata.tsx   # Metadata tecnici blockchain
│   │
│   ├── forms/                       # Form Specializzati
│   │   ├── ArtifactForm.tsx        # Form creazione artefatti
│   │   ├── DocumentForm.tsx        # Form creazione documenti
│   │   └── BaseCertificationForm.tsx # Form base certificazioni
│   │
│   ├── modals/
│   │   ├── CertificationModal.tsx  # Modal processo certificazione
│   │   └── ModifyAttachmentsModal.tsx # Modal modifica allegati
│   │
│   ├── CertificateCard.tsx         # Card certificato singolo
│   └── VersioningSection.tsx       # Sezione versioning asset
│
├── hooks/                           # 4 Custom Hooks
│   ├── useAsyncState.ts            # Gestione stati asincroni
│   ├── useCertificationFlow.ts     # Flusso certificazione completo
│   ├── useDebounce.ts              # Debounce per ricerche
│   └── useLocalStorage.ts          # Persistenza localStorage
│
├── services/                        # 7 Servizi Core
│   ├── algorand.ts                 # API Algorand + asset info
│   ├── nftMintingService.ts        # Minting SBT ARC-19+ARC-3
│   ├── ipfsService.ts              # Integrazione Pinata IPFS
│   ├── nftService.ts               # Gestione NFT
│   ├── walletService.ts            # Servizi wallet
│   ├── cidDecoder.ts               # Decodifica CID ARC-19
│   └── spidService.ts              # Integrazione SPID (futuro)
│
├── contexts/
│   └── AuthContext.tsx             # Gestione autenticazione globale
│
├── types/                          # Definizioni TypeScript
│   ├── asset.ts                    # Tipi asset e NFT
│   └── cid.ts                      # Tipi CID IPFS
│
├── config/
│   └── environment.ts              # Configurazione ambiente validata
│
├── lib/
│   └── utils.ts                    # Utility functions
│
└── assets/
    ├── logo.png                    # Logo principale
    └── favicon/                    # Favicon completo
        ├── favicon.ico             # Favicon standard
        ├── favicon-16x16.png       # Favicon 16x16
        ├── favicon-32x32.png       # Favicon 32x32
        ├── apple-touch-icon.png    # Icona iOS
        ├── android-chrome-192x192.png # Icona Android 192x192
        └── android-chrome-512x512.png # Icona Android 512x512
```

## 🎨 Design System

### **Stack Tecnologico**

```typescript
Frontend Framework:
├── React 19 + TypeScript     # Framework moderno
├── Vite 6.3.5               # Build tool veloce
├── React Router 7.6.2       # Routing SPA
└── TailwindCSS 3.4.17      # Utility-first CSS

Blockchain Integration:
├── AlgoKit Utils 9.1.0      # Algorand utilities
├── Algorand SDK 3.3.1       # Core blockchain
├── Pera Wallet 1.4.2        # Wallet integration
└── Use-Wallet 4.1.0        # Multi-wallet support

IPFS & Storage:
├── Multiformats 13.3.7      # CID manipulation
├── Uint8arrays 5.1.0        # Binary data handling
└── Pinata API               # IPFS pinning service

UI & UX:
├── Headless UI 2.2.4        # Accessible components
├── Heroicons 2.2.0          # Icon library
├── Lucide React 0.518.0     # Additional icons
└── CLSX + Tailwind Merge    # Class name utilities
```

### **Componenti Base - Esempi d'Uso**

```tsx
// Button - 4 varianti + stati
<Button 
  variant="primary" 
  size="md" 
  icon={<PlusIcon />} 
  loading={isCreating}
  onClick={handleCreate}
>
  Crea Certificazione
</Button>

// Card - Layout standardizzato
<Card 
  variant="elevated" 
  title="Saldo Wallet" 
  icon={<WalletIcon />}
  actions={<Button variant="ghost">Aggiorna</Button>}
>
  <p className="text-2xl font-bold">{balance} ALGO</p>
</Card>

// Form Input - Validazione integrata
<Input
  label="Nome Asset"
  value={assetName}
  onChange={setAssetName}
  error={errors.assetName}
  required
  helpText="Nome identificativo per l'asset"
/>

// Alert - 4 tipi di notifiche
<Alert 
  type="success" 
  title="Certificazione Creata"
  message="Asset creato con successo sulla blockchain"
  dismissible
/>
```

### **Architettura Componenti UI**

```
Design System (59 componenti)
├── Base Components (13)        # Button, Input, Card, Modal, etc.
├── Layout Components (4)       # PageHeader, Sidebar, TabsContainer
├── Data Components (8)         # DataGrid, InfoField, MetadataDisplay
├── Form Components (7)         # FileUpload, FormLayout, DateInput
├── State Components (6)        # Loading, Empty, Error, Skeleton
├── Specialized (12)            # IPFSFileCard, VersionCard, etc.
└── Navigation (9)              # Stepper, Badge, StatusBadge
```

## 🔧 Servizi e Integrazioni

### **AlgorandService** - Integrazione Blockchain
```typescript
// Ottenere informazioni asset con metadata IPFS
const assetInfo = await algorandService.getAssetInfo(assetId);
// Include: params, creation transaction, config history, versioning

// Storico reserve addresses per versioning
const reserveHistory = await algorandService.getAssetReserveHistory(assetId);

// Links a Algorand Explorer
const explorerUrl = algorandService.getAssetExplorerUrl(assetId);
```

### **NFTMintingService** - Minting SBT Compliant
```typescript
// Minting certificazione SBT completa
const result = await nftMintingService.mintCertificationSBT({
  mnemonic: walletMnemonic,
  certificationData: metadata,
  files: uploadedFiles,
  assetName: "Art Certificate #123",
  unitName: "ARTCERT",
  formData: formValues
});
// Risultato: assetId, txId, metadataUrl, ipfsHashes

// Aggiornamento metadata con versioning
const updateResult = await nftMintingService.updateCertificationMetadata({
  assetId: existingAssetId,
  mnemonic: managerMnemonic,
  newCertificationData: updatedMetadata,
  newFiles: newAttachments,
  formData: updatedFormData
});
```

### **IPFSService** - Storage Decentralizzato
```typescript
// Upload certificazione completa
const ipfsResult = await ipfsService.uploadCertificationAssets(
  files,
  certificationData,
  formData
);
// Risultato: metadataHash, fileHashes, metadataUrl, individualFileUrls

// Upload singolo file
const fileResult = await ipfsService.uploadFile(file, {
  name: "certificate_attachment.pdf",
  keyvalues: { type: "attachment", asset_id: "123" }
});
```

### **CidDecoder** - Compliance ARC-19
```typescript
// Conversione CID a indirizzo Algorand
const reserveAddress = CidDecoder.fromCidToAddress(metadataHash);

// Decodifica reserve address a CID
const cidInfo = CidDecoder.decodeReserveAddressToCid(reserveAddress);

// Estrazione versioning da storico reserve
const versioningInfo = await CidDecoder.extractVersioningFromReserves(
  reserveHistory, 
  configHistory
);
```

## 🎯 Flussi Operativi Principali

### **Creazione Certificazione**
1. **Form Input**: L'utente compila il form certificazione
2. **Validation**: Validazione dati lato client
3. **IPFS Upload**: Upload file e metadata su IPFS
4. **CID Conversion**: Conversione CID in reserve address
5. **Asset Creation**: Creazione SBT con template URL ARC-19
6. **Confirmation**: Attesa conferma blockchain
7. **Display**: Visualizzazione certificazione creata

### **Versioning Asset**
1. **Asset Selection**: Selezione asset esistente
2. **Modification**: Modifica metadata o allegati
3. **IPFS Upload**: Upload nuova versione su IPFS
4. **Reserve Update**: Aggiornamento reserve address
5. **History Tracking**: Tracciamento versioni precedenti
6. **Visualization**: Display cronologia versioning

### **Wallet Integration**
1. **Connection**: Connessione wallet (Pera/AlgoSigner)
2. **Address Validation**: Validazione indirizzo Algorand
3. **Balance Query**: Query saldo e asset
4. **Transaction History**: Recupero storico transazioni
5. **Asset Portfolio**: Visualizzazione portfolio NFT

## 📚 Documentazione Estesa

Il progetto include documentazione dettagliata in `/docs/`:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architettura completa dell'applicazione
- **[ALGORAND_INTEGRATION.md](docs/ALGORAND_INTEGRATION.md)** - Integrazione blockchain Algorand
- **[IPFS_INTEGRATION.md](docs/IPFS_INTEGRATION.md)** - Integrazione IPFS e Pinata
- **[NFT_MINTING_SERVICE.md](docs/NFT_MINTING_SERVICE.md)** - Servizio minting NFT
- **[CID_DECODER.md](docs/CID_DECODER.md)** - Decodifica CID e compliance ARC-19
- **[CUSTOM_HOOKS.md](docs/CUSTOM_HOOKS.md)** - Custom hooks React
- **[DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** - Sistema di design completo

## 🔒 Sicurezza e Compliance

### **Blockchain Security**
- ✅ **Soulbound Tokens**: NFT non trasferibili
- ✅ **Immutable Metadata**: Hash IPFS immutabili
- ✅ **Multi-signature Support**: Gestione multi-sig
- ✅ **Network Validation**: Validazione transazioni

### **Data Protection**
- ✅ **IPFS Decentralization**: Storage distribuito
- ✅ **Client-side Encryption**: Crittografia lato client
- ✅ **No Private Keys Storage**: Nessuna chiave privata salvata
- ✅ **CORS Protection**: Protezione cross-origin

### **Standards Compliance**
- ✅ **ARC-3**: NFT Metadata Standard
- ✅ **ARC-19**: Template URL Standard
- ✅ **IPFS CID v1**: Content Identifier v1
- ✅ **JSON Schema**: Validazione metadata

## 🚀 Deployment

### **Build di Produzione**
```bash
# Build ottimizzato
npm run build

# Verifica bundle
npm run preview

# Deploy su servizio statico
# Output in /dist/ pronto per deployment
```

### **Variabili d'Ambiente Produzione**
```bash
# Aggiorna per MainNet
VITE_ALGORAND_NETWORK=mainnet
VITE_ALGOD_SERVER=https://mainnet-api.algonode.cloud
VITE_INDEXER_SERVER=https://mainnet-idx.algonode.cloud

# Gateway IPFS personalizzato
VITE_PINATA_GATEWAY=your-custom-gateway.mypinata.cloud
```

## 🤝 Contribuire

1. **Fork** del repository
2. **Crea** un branch feature (`git checkout -b feature/nuova-funzionalita`)
3. **Commit** delle modifiche (`git commit -m 'Aggiunge nuova funzionalità'`)
4. **Push** del branch (`git push origin feature/nuova-funzionalita`)
5. **Apri** una Pull Request

## 📄 Licenza

Questo progetto è sviluppato da **CaputMundi** per **Activa Digital**. Tutti i diritti riservati.

## 📞 Supporto

Per supporto tecnico o domande:
- **Email**: info@caputmundi.it
- **Repository**: https://gitlab.ccoe.activadigital.it/activa-digital/Artence/extras/poc-artcertify
- **Documentazione**: [docs/](docs/)

---

**🎨 CaputMundi ArtCertify** - *Certificazione Digitale del Patrimonio Culturale*
