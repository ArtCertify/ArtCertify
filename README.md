# 🎨 ArtCertify - Certificazione Blockchain

**ArtCertify** è una piattaforma avanzata per la certificazione di documenti e artefatti su blockchain Algorand, sviluppata da **CaputMundi**. Utilizza NFT soulbound per garantire l'autenticità e la tracciabilità delle certificazioni.

![ArtCertify Logo](src/assets/logo.png)

## ✨ Caratteristiche Principali

### 🔐 **Certificazione Blockchain**
- **NFT Soulbound**: Certificazioni non trasferibili legate permanentemente al wallet
- **Blockchain Algorand**: Sicurezza e velocità della rete Algorand
- **Metadati IPFS**: Archiviazione decentralizzata dei dati
- **Tracciabilità completa**: Storico immutabile delle certificazioni

### 💳 **Gestione Wallet Avanzata**
- **Saldo in tempo reale**: Visualizzazione ALGO con conversione EUR
- **Storico transazioni**: Cronologia completa delle operazioni
- **Certificazioni soulbound**: Gestione NFT non trasferibili
- **Statistiche dettagliate**: Metriche del wallet e asset

### 🎨 **Design System Moderno**
- **Componenti riutilizzabili**: Sistema modulare e scalabile
- **Palette colori coerente**: Primary Blue, Success Green, Error Red, Warning Orange
- **Tipografia strutturata**: Gerarchia chiara con font Inter
- **Tooltip informativi**: Guida contestuale per ogni funzione
- **Animazioni fluide**: Transizioni e micro-interazioni

### 📱 **Responsive Design**
- **Mobile-first**: Ottimizzato per dispositivi mobili
- **Sidebar adattiva**: Navigazione collassabile
- **Layout flessibile**: Adattamento automatico alle dimensioni schermo
- **Touch-friendly**: Interfaccia ottimizzata per touch

## 🚨 Setup Obbligatorio - Variabili d'Ambiente

**IMPORTANTE**: L'applicazione richiede la configurazione di variabili d'ambiente per funzionare.

### 1. Crea il file `.env`

```bash
cp env.example .env
```

### 2. Configura le variabili

```bash
# Pinata IPFS Gateway Configuration
VITE_PINATA_GATEWAY=coffee-quiet-limpet-747.mypinata.cloud

# Algorand Network Configuration
VITE_ALGORAND_NETWORK=testnet

# Algorand API Endpoints
VITE_ALGOD_TOKEN=
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_INDEXER_TOKEN=
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
VITE_INDEXER_PORT=443
```

## 🚀 Installazione e Avvio

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build

# Anteprima build
npm run preview
```

## 🏗️ Architettura del Progetto

```
src/
├── components/
│   ├── ui/                          # Design System Components
│   │   ├── base/                    # Componenti Base
│   │   │   ├── Button.tsx          # 4 varianti + loading + icone
│   │   │   ├── Card.tsx            # 3 varianti + header + azioni
│   │   │   ├── Input.tsx           # Form input con validazione
│   │   │   ├── Select.tsx          # Dropdown personalizzato
│   │   │   ├── Textarea.tsx        # Area di testo ridimensionabile
│   │   │   ├── Alert.tsx           # 4 tipi di notifiche
│   │   │   ├── Modal.tsx           # Modali responsive
│   │   │   ├── Badge.tsx           # Badge e etichette
│   │   │   └── Tooltip.tsx         # Tooltip informativi
│   │   │
│   │   ├── state/                   # Componenti di Stato
│   │   │   ├── LoadingSpinner.tsx  # Spinner di caricamento
│   │   │   ├── EmptyState.tsx      # Stati vuoti riutilizzabili
│   │   │   ├── ErrorMessage.tsx    # Messaggi di errore
│   │   │   ├── StatusBadge.tsx     # Badge di stato colorati
│   │   │   └── Skeleton.tsx        # Skeleton loading
│   │   │
│   │   ├── form/                    # Componenti Form
│   │   │   ├── FileUpload.tsx      # Drag & drop file
│   │   │   ├── FormHeader.tsx      # Header form con back button
│   │   │   ├── FormLayout.tsx      # Layout responsive form
│   │   │   └── OrganizationData.tsx # Dati organizzazione editabili
│   │   │
│   │   ├── layout/                  # Componenti Layout
│   │   │   ├── PageHeader.tsx      # Header pagina standardizzato
│   │   │   ├── SearchAndFilter.tsx # Barra ricerca e filtri
│   │   │   ├── TabsContainer.tsx   # Container tab responsive
│   │   │   └── SectionCard.tsx     # Card sezione con collapsible
│   │   │
│   │   ├── data/                    # Componenti Dati
│   │   │   ├── InfoField.tsx       # Campo informativo riutilizzabile
│   │   │   ├── DataGrid.tsx        # Griglia dati responsive
│   │   │   └── MetadataDisplay.tsx # Display metadata NFT
│   │   │
│   │   └── index.ts                # Esportazioni centralizzate
│   │
│   ├── layout/
│   │   └── ResponsiveLayout.tsx    # Layout principale con sidebar
│   │
│   ├── pages/                       # Pagine Principali
│   │   ├── DashboardPage.tsx       # Dashboard con SearchAndFilter
│   │   ├── WalletPage.tsx          # Wallet con TabsContainer
│   │   ├── OrganizationProfilePage.tsx # Profilo con PageHeader
│   │   ├── CertificationsPage.tsx  # Gestione certificazioni
│   │   ├── RolesPage.tsx           # Gestione ruoli con SearchAndFilter
│   │   ├── LoginPage.tsx           # Autenticazione
│   │   └── AssetDetailsPage.tsx    # Dettagli con DataGrid e MetadataDisplay
│   │
│   ├── asset/                       # Componenti Asset
│   │   ├── AssetHeader.tsx         # Header asset
│   │   ├── AssetInfoCard.tsx       # Card info asset
│   │   ├── AssetDescription.tsx    # Descrizione asset
│   │   ├── AttachmentsSection.tsx  # Sezione allegati
│   │   └── TechnicalMetadata.tsx   # Metadata tecnici
│   │
│   ├── modals/
│   │   └── ModifyAttachmentsModal.tsx # Gestione allegati
│   │
│   └── forms/
│       ├── DocumentForm.tsx        # Form documenti con Input riutilizzabili
│       └── ArtifactForm.tsx        # Form artefatti con Input riutilizzabili
│
├── hooks/                           # Custom Hooks
│   ├── useAsyncState.ts            # Gestione stati asincroni
│   ├── useDebounce.ts              # Debounce per ricerche
│   └── useLocalStorage.ts          # Persistenza localStorage
│
├── services/
│   ├── algorand.ts                 # API Algorand
│   ├── walletService.ts            # Servizi wallet
│   ├── nftService.ts               # Servizi NFT
│   ├── spidService.ts              # Integrazione SPID
│   └── cidDecoder.ts               # Decodifica CID IPFS
│
├── contexts/
│   └── AuthContext.tsx             # Gestione autenticazione
│
├── types/
│   ├── asset.ts                    # Tipi asset e NFT
│   └── cid.ts                      # Tipi CID IPFS
│
├── config/
│   └── environment.ts              # Configurazione ambiente
│
└── assets/
    ├── logo.png                    # Logo principale
    └── favicon/                    # Favicon e icone app
        ├── favicon.ico             # Favicon standard
        ├── favicon-16x16.png       # Favicon 16x16
        ├── favicon-32x32.png       # Favicon 32x32
        ├── apple-touch-icon.png    # Icona iOS
        ├── android-chrome-192x192.png # Icona Android 192x192
        └── android-chrome-512x512.png # Icona Android 512x512
```

## 🎨 Design System Rifattorizzato

### **Componenti Base UI**

#### **Button** - 4 varianti + stati
```tsx
<Button variant="primary" size="md" icon={<PlusIcon />} loading={false}>
  Crea Certificazione
</Button>
```

#### **Card** - Layout standardizzato
```tsx
<Card variant="elevated" title="Saldo Wallet" icon={<WalletIcon />}>
  Contenuto della card
</Card>
```

#### **Input** - Form unificato
```tsx
<Input 
  label="Nome Organizzazione" 
  error="Campo obbligatorio"
  leftIcon={<UserIcon />}
  variant="default"
/>
```

### **Componenti Layout**

#### **PageHeader** - Header standardizzato
```tsx
<PageHeader
  title="Gestione Wallet"
  description="Visualizza saldo e transazioni"
  actions={<Button>Aggiorna</Button>}
/>
```

#### **SearchAndFilter** - Ricerca unificata
```tsx
<SearchAndFilter
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  filterOptions={[
    { value: 'all', label: 'Tutti' },
    { value: 'document', label: 'Documenti' }
  ]}
  resultCount={filteredItems.length}
  showClearFilters={hasActiveFilters}
/>
```

#### **TabsContainer** - Tab responsive
```tsx
<TabsContainer
  tabs={[
    { id: 'overview', label: 'Panoramica', content: <Overview /> },
    { id: 'transactions', label: 'Transazioni', content: <Transactions /> }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  responsive={true}
/>
```

#### **SectionCard** - Sezioni strutturate
```tsx
<SectionCard 
  title="Informazioni Asset"
  icon={<DocumentIcon />}
  collapsible={true}
>
  <DataGrid fields={assetFields} />
</SectionCard>
```

### **Componenti Dati**

#### **InfoField** - Campi informativi
```tsx
<InfoField
  label="ID Certificazione"
  value="CERT-12345"
  variant="default"
  copyable={true}
  icon={<IdIcon />}
/>
```

#### **DataGrid** - Griglia responsive
```tsx
<DataGrid
  fields={[
    { key: 'id', label: 'ID', value: 'CERT-123' },
    { key: 'date', label: 'Data', value: '2024-01-15' }
  ]}
  columns={3}
  variant="default"
/>
```

#### **MetadataDisplay** - Metadata NFT
```tsx
<MetadataDisplay
  metadata={nftMetadata}
  cidInfo={cidData}
  title="Metadata NFT"
/>
```

### **Componenti Stato**

#### **EmptyState** - Stati vuoti
```tsx
<EmptyState
  title="Nessuna certificazione"
  description="Crea la tua prima certificazione"
  action={<Button>Crea Certificazione</Button>}
  icon={<DocumentIcon />}
/>
```

#### **StatusBadge** - Badge di stato
```tsx
<StatusBadge
  status="success"
  label="Certificato"
  variant="dot"
  size="md"
/>
```

## 🔧 Custom Hooks

### **useAsyncState** - Gestione stati asincroni
```tsx
const { data, loading, error, execute } = useAsyncState<AssetInfo>();

useEffect(() => {
  execute(() => algorandService.getAssetInfo(assetId));
}, [assetId, execute]);
```

### **useDebounce** - Debounce per ricerche
```tsx
const debouncedSearchTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  // Esegui ricerca solo dopo 300ms di inattività
  performSearch(debouncedSearchTerm);
}, [debouncedSearchTerm]);
```

### **useLocalStorage** - Persistenza dati
```tsx
const [preferences, setPreferences] = useLocalStorage('userPrefs', {
  theme: 'dark',
  language: 'it'
});
```

## 💳 Funzionalità Wallet Ottimizzate

### **Dashboard Wallet**
- **PageHeader**: Titolo, descrizione e azioni standardizzate
- **TabsContainer**: Tab responsive (Bilancio, Transazioni, Certificazioni)
- **StatusBadge**: Stati colorati per certificazioni
- **EmptyState**: Gestione stati vuoti elegante

### **Gestione Transazioni**
- **SearchAndFilter**: Ricerca e filtri unificati
- **DataGrid**: Visualizzazione dati strutturata
- **InfoField**: Dettagli transazione con copy/paste

### **Certificazioni NFT**
- **MetadataDisplay**: Visualizzazione metadata completa
- **SectionCard**: Sezioni collassabili
- **StatusBadge**: Stati certificazione

## 🔧 Funzionalità Principali Rifattorizzate

### **Dashboard**
- **SearchAndFilter**: Ricerca unificata con filtri
- **EmptyState**: Gestione stati vuoti intelligente
- **PageHeader**: Header standardizzato con azioni

### **Gestione Ruoli**
- **SearchAndFilter**: Ricerca utenti e filtri ruolo
- **DataGrid**: Visualizzazione utenti responsive
- **StatusBadge**: Badge ruoli colorati

### **Profilo Organizzazione**
- **PageHeader**: Header con azioni edit/save
- **SectionCard**: Sezioni strutturate
- **Input/Textarea**: Form components riutilizzabili

### **Asset Details**
- **DataGrid**: Informazioni asset strutturate
- **MetadataDisplay**: Metadata NFT completi
- **SectionCard**: Sezioni organizzate

## 📱 Mobile Optimization

### **Responsive Breakpoints**
```css
/* Mobile */
@media (max-width: 767px) {
  /* TabsContainer: layout verticale */
  /* SearchAndFilter: stack verticale */
  /* DataGrid: 1 colonna */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* TabsContainer: layout orizzontale */
  /* DataGrid: 2 colonne */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Layout completo */
  /* DataGrid: 3-4 colonne */
}
```

### **Mobile-First Components**
- **TabsContainer**: Tab responsive con overflow gestito
- **SearchAndFilter**: Stack verticale su mobile
- **DataGrid**: Colonne adattive
- **SectionCard**: Padding ridotto su mobile
- **PageHeader**: Stack verticale azioni su mobile

## 🛠️ Tecnologie

- **React 19** + **TypeScript** - Framework e type safety
- **Vite** - Build tool veloce e moderno
- **Tailwind CSS** - Utility-first CSS framework
- **Algorand SDK** - Integrazione blockchain
- **React Router** - Navigazione SPA
- **Heroicons** - Icone moderne e accessibili

## 📊 Metriche Performance

### **Bundle Size Ottimizzato**
- **Componenti modulari**: Import solo necessari
- **Tree shaking**: Eliminazione codice non utilizzato
- **Code splitting**: Caricamento lazy delle pagine

### **Riutilizzabilità**
- **95% componenti riutilizzabili**: Design system completo
- **Riduzione codice duplicato**: Pattern standardizzati
- **Manutenibilità**: Componenti centralizzati

### **Accessibilità**
- **Tooltip informativi**: Guida contestuale
- **Keyboard navigation**: Navigazione da tastiera
- **Screen reader**: Supporto lettori schermo
- **Color contrast**: Contrasto colori ottimale

## 🚀 Deployment

### **Build Ottimizzata**
```bash
npm run build
# Output: dist/ folder pronto per deploy
```

### **Environment Variables**
- **Development**: `.env.local`
- **Production**: Configurazione server
- **Testing**: `.env.test`

## 📈 Roadmap Futura

### **Componenti Avanzati**
- [ ] **DataTable**: Tabella con sorting e paginazione
- [ ] **Calendar**: Calendario per date
- [ ] **Charts**: Grafici per analytics
- [ ] **Notification**: Sistema notifiche toast

### **Performance**
- [ ] **Virtual Scrolling**: Liste grandi
- [ ] **Image Optimization**: Lazy loading immagini
- [ ] **Service Worker**: Cache e offline

### **Integrazione**
- [ ] **SPID**: Autenticazione SPID completa
- [ ] **Multi-language**: Internazionalizzazione
- [ ] **Dark/Light**: Theme switcher
- [ ] **Analytics**: Tracking eventi utente

---

**Sviluppato con ❤️ da Artence**
