# 🔗 Integrazione Algorand Blockchain

Questa documentazione spiega come l'applicazione ArtCertify si integra con la blockchain Algorand per la gestione di NFT soulbound e certificazioni digitali.

## 📋 Panoramica

L'integrazione con Algorand permette di:
- **Creare NFT soulbound** per certificazioni non trasferibili
- **Gestire wallet** e visualizzare saldi/transazioni
- **Archiviare metadata** su IPFS tramite Pinata
- **Validare certificazioni** tramite blockchain

## 🔧 Configurazione

### Variabili d'Ambiente

```bash
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

### Configurazione Client

```typescript
// src/config/environment.ts
export const algorandConfig = {
  network: import.meta.env.VITE_ALGORAND_NETWORK || 'testnet',
  algod: {
    token: import.meta.env.VITE_ALGOD_TOKEN || '',
    server: import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud',
    port: parseInt(import.meta.env.VITE_ALGOD_PORT || '443')
  },
  indexer: {
    token: import.meta.env.VITE_INDEXER_TOKEN || '',
    server: import.meta.env.VITE_INDEXER_SERVER || 'https://testnet-idx.algonode.cloud',
    port: parseInt(import.meta.env.VITE_INDEXER_PORT || '443')
  }
};
```

## 🏗️ Architettura Servizi

### AlgorandService (`src/services/algorand.ts`)

Servizio principale per interagire con la blockchain:

```typescript
class AlgorandService {
  // Inizializzazione client
  private initializeClients(): void
  
  // Gestione wallet
  getAccountInfo(address: string): Promise<AccountInfo>
  getAccountBalance(address: string): Promise<number>
  
  // Gestione asset/NFT
  getAssetInfo(assetId: number): Promise<AssetInfo>
  getAccountAssets(address: string): Promise<AssetHolding[]>
  
  // Transazioni
  getAccountTransactions(address: string): Promise<Transaction[]>
  
  // Creazione NFT
  createNFT(params: NFTCreationParams): Promise<number>
}
```

### WalletService (`src/services/walletService.ts`)

Gestione specifiche del wallet:

```typescript
class WalletService {
  // Validazione
  validateAddress(address: string): boolean
  
  // Formattazione
  formatAlgoAmount(microAlgos: number): string
  convertAlgoToEur(algos: number): Promise<number>
  
  // Statistiche
  calculateWalletStats(account: AccountInfo): WalletStats
}
```

### NFTService (`src/services/nftService.ts`)

Gestione NFT e certificazioni:

```typescript
class NFTService {
  // Creazione certificazioni
  createDocumentCertification(data: DocumentData): Promise<number>
  createArtifactCertification(data: ArtifactData): Promise<number>
  
  // Metadata IPFS
  uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string>
  
  // Validazione
  validateCertification(assetId: number): Promise<boolean>
}
```

## 🎨 NFT Soulbound

### Caratteristiche

Gli NFT soulbound hanno le seguenti proprietà:
- **Non trasferibili**: `clawback` e `freeze` gestiti dal creatore
- **Metadata immutabili**: Hash IPFS nel campo URL
- **Quantità fissa**: Total supply = 1
- **Identificazione univoca**: Asset ID blockchain

### Struttura Metadata

```json
{
  "name": "Certificazione Documento - [Nome]",
  "description": "Certificazione digitale per documento",
  "image": "ipfs://[hash_immagine]",
  "external_url": "https://artcertify.com/cert/[id]",
  "attributes": [
    {
      "trait_type": "Tipo",
      "value": "Documento"
    },
    {
      "trait_type": "Organizzazione",
      "value": "Museo Arte"
    },
    {
      "trait_type": "Data Certificazione",
      "value": "2024-01-15"
    }
  ],
  "properties": {
    "certification_type": "document",
    "organization_id": "ORG-001",
    "document_hash": "sha256:[hash]",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### Processo di Creazione

1. **Preparazione Metadata**
   ```typescript
   const metadata = {
     name: `Certificazione ${type} - ${name}`,
     description: `Certificazione digitale per ${type.toLowerCase()}`,
     attributes: buildAttributes(data),
     properties: buildProperties(data)
   };
   ```

2. **Upload IPFS**
   ```typescript
   const ipfsHash = await uploadMetadataToIPFS(metadata);
   const metadataUrl = `ipfs://${ipfsHash}`;
   ```

3. **Creazione Asset**
   ```typescript
   const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParams(
     creatorAddress,
     undefined, // note
     1, // total supply
     0, // decimals
     false, // default frozen
     creatorAddress, // manager
     creatorAddress, // reserve
     creatorAddress, // freeze
     creatorAddress, // clawback
     metadata.name, // unit name
     metadata.name, // asset name
     metadataUrl, // URL
     undefined, // metadata hash
     suggestedParams
   );
   ```

## 💳 Gestione Wallet

### Informazioni Account

```typescript
interface AccountInfo {
  address: string;
  amount: number; // microAlgos
  minBalance: number;
  assets: AssetHolding[];
  createdAssets: Asset[];
  participation?: AccountParticipation;
}
```

### Visualizzazione Saldo

```typescript
// Conversione microAlgos -> ALGO
const algoBalance = microAlgos / 1_000_000;

// Conversione ALGO -> EUR (tramite API)
const eurBalance = await convertAlgoToEur(algoBalance);
```

### Transazioni

```typescript
interface Transaction {
  id: string;
  sender: string;
  receiver?: string;
  amount: number;
  fee: number;
  roundTime: number;
  txType: string;
  note?: string;
}
```

## 🔍 Asset Discovery

### Ricerca Asset

```typescript
// Per asset ID specifico
const asset = await algorandService.getAssetInfo(assetId);

// Per account specifico
const assets = await algorandService.getAccountAssets(address);

// Filtro certificazioni (NFT con supply = 1)
const certifications = assets.filter(asset => 
  asset.amount === 1 && 
  asset['asset-params']?.total === 1
);
```

### Validazione Certificazioni

```typescript
const validateCertification = async (assetId: number): Promise<boolean> => {
  try {
    const asset = await getAssetInfo(assetId);
    
    // Verifica caratteristiche soulbound
    const isSoulbound = 
      asset.params.total === 1 &&
      asset.params.clawback === asset.params.creator &&
      asset.params.freeze === asset.params.creator;
    
    // Verifica metadata IPFS
    const hasValidMetadata = asset.params.url?.startsWith('ipfs://');
    
    return isSoulbound && hasValidMetadata;
  } catch (error) {
    return false;
  }
};
```

## 🌐 Integrazione IPFS

### Configurazione Pinata

```bash
VITE_PINATA_GATEWAY=coffee-quiet-limpet-747.mypinata.cloud
```

### Upload Metadata

```typescript
const uploadMetadataToIPFS = async (metadata: NFTMetadata): Promise<string> => {
  const response = await fetch('/api/pinata/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata)
  });
  
  const result = await response.json();
  return result.IpfsHash;
};
```

### Recupero Metadata

```typescript
const fetchMetadataFromIPFS = async (ipfsUrl: string): Promise<NFTMetadata> => {
  const hash = ipfsUrl.replace('ipfs://', '');
  const gatewayUrl = `https://${PINATA_GATEWAY}/ipfs/${hash}`;
  
  const response = await fetch(gatewayUrl);
  return response.json();
};
```

## 🔒 Sicurezza

### Validazione Indirizzi

```typescript
const validateAlgorandAddress = (address: string): boolean => {
  // Controllo lunghezza (58 caratteri)
  if (address.length !== 58) return false;
  
  // Controllo caratteri validi (Base32)
  const base32Regex = /^[A-Z2-7]+$/;
  if (!base32Regex.test(address)) return false;
  
  // Validazione checksum (tramite algosdk)
  try {
    algosdk.decodeAddress(address);
    return true;
  } catch {
    return false;
  }
};
```

### Gestione Errori

```typescript
try {
  const result = await algorandService.getAssetInfo(assetId);
  return result;
} catch (error) {
  if (error.status === 404) {
    throw new Error('Asset non trovato');
  } else if (error.status === 429) {
    throw new Error('Troppi tentativi, riprova più tardi');
  } else {
    throw new Error('Errore di connessione alla blockchain');
  }
}
```

## 📊 Monitoraggio

### Metriche Blockchain

- **Tempo di conferma**: ~4.5 secondi per blocco
- **Costo transazione**: ~0.001 ALGO
- **Throughput**: ~1000 TPS
- **Finalità**: Immediata dopo conferma

### Logging

```typescript
const logBlockchainOperation = (operation: string, data: any) => {
  console.log(`[Algorand] ${operation}:`, {
    timestamp: new Date().toISOString(),
    network: algorandConfig.network,
    ...data
  });
};
```

## 🧪 Testing

### Asset di Test

Asset ID: **740976269** (TestNet)
- **Explorer**: https://testnet.explorer.perawallet.app/asset/740976269/
- **Metadata**: Caricati su IPFS
- **Tipo**: NFT soulbound di esempio

### Wallet di Test

Per testing utilizzare wallet TestNet con:
- **Faucet**: https://testnet.algoexplorer.io/dispenser
- **Saldo minimo**: 0.1 ALGO per operazioni
- **Asset opt-in**: Necessario per ricevere NFT

## 🚀 Deploy

### Mainnet

Per deploy su Mainnet:

```bash
# Cambia configurazione
VITE_ALGORAND_NETWORK=mainnet
VITE_ALGOD_SERVER=https://mainnet-api.algonode.cloud
VITE_INDEXER_SERVER=https://mainnet-idx.algonode.cloud

# Costi reali
# - Creazione asset: 0.001 ALGO
# - Transazione: 0.001 ALGO
# - Opt-in asset: 0.001 ALGO
```

### Ottimizzazioni

- **Caching**: Cache asset info per ridurre chiamate API
- **Batch requests**: Raggruppa richieste multiple
- **Error handling**: Retry automatico con backoff
- **Rate limiting**: Rispetta limiti API node

---

**Documentazione tecnica per l'integrazione Algorand in ArtCertify** 