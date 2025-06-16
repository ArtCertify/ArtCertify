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
- **Palette colori coerente**: Primary Blue, Success Green, Error Red, Warning Orange
- **Tipografia strutturata**: Gerarchia chiara con font Inter
- **Componenti riutilizzabili**: Sistema modulare e scalabile
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
│   │   ├── Button.tsx              # 4 varianti + loading + icone
│   │   ├── Card.tsx                # 3 varianti + header + azioni
│   │   ├── Input.tsx               # Form input con validazione
│   │   ├── Select.tsx              # Dropdown personalizzato
│   │   ├── Textarea.tsx            # Area di testo ridimensionabile
│   │   ├── Alert.tsx               # 4 tipi di notifiche
│   │   ├── Modal.tsx               # Modali responsive
│   │   ├── FileUpload.tsx          # Drag & drop file
│   │   ├── Tooltip.tsx             # Tooltip informativi
│   │   └── index.ts                # Esportazioni
│   │
│   ├── layout/
│   │   └── ResponsiveLayout.tsx    # Layout principale con sidebar
│   │
│   ├── pages/
│   │   ├── DashboardPage.tsx       # Dashboard principale
│   │   ├── WalletPage.tsx          # Gestione wallet completa
│   │   ├── OrganizationProfilePage.tsx # Profilo organizzazione
│   │   ├── CertificationsPage.tsx  # Gestione certificazioni
│   │   ├── LoginPage.tsx           # Autenticazione
│   │   └── AssetDetailsPage.tsx    # Dettagli asset/certificazioni
│   │
│   ├── modals/
│   │   └── ModifyAttachmentsModal.tsx # Gestione allegati
│   │
│   └── forms/
│       ├── DocumentForm.tsx        # Form documenti
│       └── ArtifactForm.tsx        # Form artefatti
│
├── services/
│   ├── algorand.ts                 # API Algorand
│   ├── walletService.ts            # Servizi wallet
│   └── nftService.ts               # Servizi NFT
│
├── contexts/
│   └── AuthContext.tsx             # Gestione autenticazione
│
├── types/
│   └── asset.ts                    # Tipi TypeScript
│
└── config/
    └── environment.ts              # Configurazione ambiente

├── assets/
│   ├── logo.png                    # Logo principale
│   └── favicon/                    # Favicon e icone app
│       ├── favicon.ico             # Favicon standard
│       ├── favicon-16x16.png       # Favicon 16x16
│       ├── favicon-32x32.png       # Favicon 32x32
│       ├── apple-touch-icon.png    # Icona iOS
│       ├── android-chrome-192x192.png # Icona Android 192x192
│       └── android-chrome-512x512.png # Icona Android 512x512
```

## 🎨 Design System

### **Palette Colori**
- **Primary**: Blue 500 (#0ea5e9) - Azioni principali
- **Success**: Green 500 (#22c55e) - Operazioni riuscite
- **Error**: Red 500 (#ef4444) - Errori e warning critici
- **Warning**: Orange 500 (#f59e0b) - Avvisi e attenzioni
- **Info**: Blue 500 (#3b82f6) - Informazioni generali

### **Tipografia**
- **Page Title**: 30px Bold - Titoli principali
- **Section Title**: 24px Bold - Titoli sezioni
- **Subsection Title**: 18px Semibold - Sottotitoli
- **Body Regular**: 16px Regular - Testo principale
- **Body Secondary**: 14px Regular - Testo secondario
- **Label Form**: 14px Medium - Etichette form

### **Componenti UI**

#### **Button**
```tsx
<Button variant="primary" size="md" icon={<PlusIcon />} loading={false}>
  Crea Certificazione
</Button>
```

#### **Card**
```tsx
<Card variant="elevated" title="Saldo Wallet" icon={<WalletIcon />}>
  Contenuto della card
</Card>
```

#### **Input**
```tsx
<Input 
  label="Nome Organizzazione" 
  error="Campo obbligatorio"
  leftIcon={<UserIcon />}
/>
```

#### **Tooltip**
```tsx
<Tooltip content="Spiegazione dettagliata della funzione">
  <Button>Azione</Button>
</Tooltip>
```

## 💳 Funzionalità Wallet

### **Dashboard Wallet**
- **Saldo disponibile**: ALGO con conversione EUR in tempo reale
- **Saldo minimo**: Requisito Algorand per wallet attivo
- **Certificazioni soulbound**: Conteggio NFT non trasferibili
- **Controlli privacy**: Nascondi/mostra saldo

### **Transazioni**
- **Storico completo**: Tutte le transazioni ALGO
- **Dettagli transazione**: Importo, commissioni, timestamp
- **Direzione**: Entrata/uscita con icone colorate
- **Note**: Messaggi allegati alle transazioni

### **Certificazioni**
- **NFT soulbound**: Certificazioni non trasferibili
- **Metadati**: Nome, simbolo, quantità totale
- **ID univoco**: Identificativo blockchain
- **Icone personalizzate**: Visual identity per ogni tipo

## 🔧 Funzionalità Principali

### **Autenticazione**
- **Wallet Algorand**: Login con indirizzo wallet
- **Validazione**: Controllo formato indirizzo (58 caratteri)
- **Persistenza**: Sessione mantenuta in localStorage
- **SPID Integration**: Preparato per integrazione SPID

### **Gestione Certificazioni**
- **Creazione**: Form guidati per documenti e artefatti
- **Visualizzazione**: Dettagli completi con metadati IPFS
- **Modifica**: Aggiornamento allegati e informazioni
- **Ricerca**: Filtri avanzati per tipo e data

### **Profilo Organizzazione**
- **Dati aziendali**: Nome, tipo, P.IVA, contatti
- **Indirizzo**: Gestione completa indirizzo sede
- **Modifica**: Form editabile con validazione
- **Persistenza**: Salvataggio automatico modifiche

## 🛠️ Tecnologie

- **React 19** + **TypeScript** - Framework e type safety
- **Vite** - Build tool veloce e moderno
- **Tailwind CSS** - Utility-first CSS framework
- **Algorand SDK** - Integrazione blockchain
- **React Router** - Navigazione SPA
- **Heroicons** - Icone moderne e accessibili

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  /* Layout mobile con sidebar nascosta */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Layout tablet con sidebar collassabile */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Layout desktop con sidebar fissa */
}
```

## 🎯 Asset di Test

L'applicazione è configurata per l'asset **740976269** su Algorand TestNet:
- **Explorer**: https://testnet.explorer.perawallet.app/asset/740976269/
- **Metadati IPFS**: Caricamento automatico da gateway Pinata
- **Dati real-time**: Aggiornamento dalla blockchain

## 🚀 Deployment

### **Build di Produzione**
```bash
npm run build
```

### **Variabili d'Ambiente Produzione**
```bash
VITE_ALGORAND_NETWORK=mainnet
VITE_ALGOD_SERVER=https://mainnet-api.algonode.cloud
VITE_INDEXER_SERVER=https://mainnet-idx.algonode.cloud
```

## 📋 TODO e Roadmap

### **Prossime Funzionalità**
- [ ] Integrazione SPID completa
- [ ] Notifiche push per nuove certificazioni
- [ ] Export PDF certificazioni
- [ ] Dashboard analytics avanzate
- [ ] Multi-wallet support
- [ ] Integrazione WalletConnect

### **Miglioramenti UX**
- [ ] Onboarding guidato
- [ ] Tutorial interattivi
- [ ] Modalità offline
- [x] PWA support (manifest.json implementato)
- [ ] Dark/Light theme toggle

## 🤝 Contributi

Per contribuire al progetto:

1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push del branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è proprietà di **CaputMundi**. Tutti i diritti riservati.

## 📞 Supporto

Per supporto tecnico o domande:
- **Email**: support@caputmundi.com
- **Documentazione**: Consulta `ENV_SETUP.md` per setup dettagliato
- **Issues**: Apri un issue su GitHub per bug report

---

**Sviluppato con ❤️ da ARTENCE**
