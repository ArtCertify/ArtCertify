# 📚 Documentazione ArtCertify

Benvenuto nella documentazione completa di ArtCertify. Questa cartella contiene guide dettagliate per tutte le integrazioni e funzionalità dell'applicazione.

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

**Contenuti:**
- Configurazione e setup Algorand
- Architettura servizi (AlgorandService, WalletService, NFTService)
- Creazione e gestione NFT soulbound
- Gestione wallet e transazioni
- Asset discovery e validazione certificazioni
- Sicurezza e monitoraggio blockchain

### 🌐 [Integrazione IPFS](./IPFS_INTEGRATION.md)
Documentazione per l'integrazione IPFS utilizzando Pinata come gateway e servizio di pinning.

**Contenuti:**
- Setup Pinata e configurazione IPFS
- Upload e fetch metadata NFT
- CID decoder e validazione
- Componenti UI per metadata display
- Sicurezza e rate limiting
- Caching e ottimizzazioni

### 🔍 [CID Decoder](./CID_DECODER.md)
Sistema di decodifica CID che implementa lo standard ARC-0019 per la conversione tra indirizzi Algorand e Content Identifiers IPFS.

**Contenuti:**
- Implementazione standard ARC-0019
- Conversione address ↔ CID bidirezionale
- Gestione versioning contenuti IPFS
- Testing e validazione
- Performance e ottimizzazioni
- Sicurezza e troubleshooting

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

### 🔐 [Integrazione SPID](../SPID_INTEGRATION.md)
Documentazione per l'integrazione del sistema di autenticazione SPID (Sistema Pubblico di Identità Digitale).

**Contenuti:**
- Setup e configurazione SPID
- Flusso di autenticazione
- Gestione metadati e certificati
- Testing e deployment

## 🚀 Quick Start

### 1. Setup Ambiente
```bash
# Clona repository
git clone <repository-url>
cd caput-mundi-fe

# Installa dipendenze
npm install

# Configura variabili d'ambiente
cp env.example .env
# Modifica .env con le tue configurazioni
```

### 2. Configurazione Minima
```bash
# Algorand TestNet (obbligatorio)
VITE_ALGORAND_NETWORK=testnet
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud

# Pinata IPFS (obbligatorio)
VITE_PINATA_GATEWAY=coffee-quiet-limpet-747.mypinata.cloud
```

### 3. Avvio Sviluppo
```bash
# Avvia server di sviluppo
npm run dev

# Build per produzione
npm run build

# Preview build
npm run preview
```

## 📖 Guide di Lettura

### Per Sviluppatori Frontend
1. **[Design System](./DESIGN_SYSTEM.md)** - Componenti e pattern UI
2. **[Custom Hooks](./CUSTOM_HOOKS.md)** - Logica riutilizzabile
3. **[Architettura](./ARCHITECTURE.md)** - Struttura generale

### Per Sviluppatori Blockchain
1. **[Integrazione Algorand](./ALGORAND_INTEGRATION.md)** - Blockchain integration
2. **[Integrazione IPFS](./IPFS_INTEGRATION.md)** - Storage decentralizzato
3. **[CID Decoder](./CID_DECODER.md)** - Standard ARC-0019 e conversioni
4. **[Architettura](./ARCHITECTURE.md)** - Flussi di dati

### Per DevOps/Deployment
1. **[Architettura](./ARCHITECTURE.md)** - Deployment architecture
2. **[Integrazione Algorand](./ALGORAND_INTEGRATION.md)** - Network configuration
3. **[Integrazione SPID](../SPID_INTEGRATION.md)** - Identity integration

### Per Product Managers
1. **[Architettura](./ARCHITECTURE.md)** - Panoramica generale
2. **[Design System](./DESIGN_SYSTEM.md)** - Componenti UI
3. **[Integrazione Algorand](./ALGORAND_INTEGRATION.md)** - Funzionalità blockchain

## 🔧 Troubleshooting

### Problemi Comuni

#### Errori di Compilazione
```bash
# Pulisci cache e reinstalla
rm -rf node_modules package-lock.json
npm install

# Verifica TypeScript
npm run type-check
```

#### Problemi Algorand
- Verifica configurazione rete in `.env`
- Controlla connessione ai node Algorand
- Valida formato indirizzi wallet (58 caratteri)

#### Problemi IPFS
- Verifica gateway Pinata configurato
- Controlla formato CID (Qm... o b...)
- Verifica rate limiting

#### Problemi UI
- Controlla import componenti da `./ui`
- Verifica props richieste componenti
- Controlla responsive breakpoints

### Debug Tools

```bash
# Logging dettagliato
VITE_DEBUG=true npm run dev

# Analisi bundle
npm run build -- --analyze

# Test componenti
npm run test

# Lint e format
npm run lint
npm run format
```

## 📊 Metriche e Performance

### Bundle Size Target
- **Total**: < 1MB gzipped
- **Initial**: < 300KB gzipped
- **Chunks**: < 100KB per chunk

### Performance Target
- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **FID**: < 100ms

### Accessibility Target
- **WCAG 2.1 AA**: Compliant
- **Contrast ratio**: 4.5:1 minimum
- **Keyboard navigation**: Complete
- **Screen reader**: Full support

## 🤝 Contributing

### Development Workflow
1. Leggi documentazione pertinente
2. Crea branch feature da `main`
3. Implementa seguendo design system
4. Aggiungi test per nuove funzionalità
5. Aggiorna documentazione se necessario
6. Crea pull request

### Code Standards
- **TypeScript**: Strict mode abilitato
- **ESLint**: Configurazione React/TypeScript
- **Prettier**: Formattazione automatica
- **Conventional Commits**: Format commit messages

### Testing Requirements
- **Unit tests**: Componenti isolati
- **Integration tests**: Flussi completi
- **E2E tests**: User journeys critici
- **Coverage**: > 80% per nuove funzionalità

## 📞 Supporto

### Contatti Team
- **Frontend**: Documentazione Design System
- **Blockchain**: Documentazione Algorand/IPFS
- **DevOps**: Documentazione Architettura
- **Product**: Tutte le documentazioni

### Risorse Esterne
- **Algorand**: https://developer.algorand.org/
- **IPFS**: https://docs.ipfs.io/
- **Pinata**: https://docs.pinata.cloud/
- **React**: https://react.dev/
- **Tailwind**: https://tailwindcss.com/

---

**Documentazione completa per ArtCertify - Tutto quello che serve per sviluppare, deployare e mantenere l'applicazione** 