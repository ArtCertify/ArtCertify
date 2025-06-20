# 🔗 Integrazione Algorand Blockchain - Caput Mundi FE

Documentazione completa per l'integrazione con Algorand blockchain per la gestione di NFT soulbound e certificazioni digitali nel progetto Caput Mundi.

## 📋 Panoramica

L'integrazione con Algorand permette di:
- **✅ Creare NFT soulbound (SBT)** per certificazioni non trasferibili
- **✅ Gestire wallet** e visualizzare saldi/transazioni/asset
- **✅ Archiviare metadata** su IPFS tramite Pinata con ARC-19 compliance
- **✅ Validare certificazioni** tramite blockchain con CID decoding
- **✅ Versioning metadata** tramite reserve address updates
- **✅ Explorer integration** per debugging e trasparenza

## 🔧 Configurazione

### Variabili d'Ambiente Richieste

```bash
# Algorand Network Configuration
VITE_ALGORAND_NETWORK=testnet

# Algorand API Endpoints - TUTTI OBBLIGATORI
VITE_ALGOD_TOKEN=
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_INDEXER_TOKEN=
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
VITE_INDEXER_PORT=443

# Minting Configuration
VITE_PRIVATE_KEY_MNEMONIC=  # Account per minting
VITE_MANAGER_MNEMONIC=      # Account per gestione asset
```

### Configurazione Client Aggiornata

```typescript
// src/config/environment.ts
export const config = {
  algorandNetwork: getEnvVar('VITE_ALGORAND_NETWORK'),
  
  algod: {
    token: getEnvVar('VITE_ALGOD_TOKEN', true), // Allow empty for public nodes
    server: getEnvVar('VITE_ALGOD_SERVER'),
    port: parseInt(getEnvVar('VITE_ALGOD_PORT'))
  },
  
  indexer: {
    token: getEnvVar('VITE_INDEXER_TOKEN', true), // Allow empty for public nodes
    server: getEnvVar('VITE_INDEXER_SERVER'),
    port: parseInt(getEnvVar('VITE_INDEXER_PORT'))
  }
};
```

## 🏗️ Architettura Servizi Implementati

### 1. AlgorandService (`src/services/algorand.ts`)

**Servizio principale potenziato** per interagire con blockchain:

```typescript
class AlgorandService {
  // ✅ Client management
  getAlgod(): algosdk.Algodv2
  getIndexer(): algosdk.Indexer
  
  // ✅ Enhanced asset info with CID decoding
  async getAssetInfo(assetId: string): Promise<AssetInfo>
  
  // ✅ Versioning support
  async getAssetConfigHistory(assetId: number): Promise<any[]>
  async getAssetReserveHistory(assetId: number): Promise<string[]>
  
  // ✅ Creation transaction tracking
  private async getAssetCreationTransaction(assetId: number): Promise<unknown>
  
  // ✅ NFT metadata extraction
  private async extractNftMetadata(params: AssetParams): Promise<NftMetadata>
  
  // ✅ Explorer URLs for debugging
  getAssetExplorerUrl(assetId: string): string
  getAddressExplorerUrl(address: string): string
  getTransactionExplorerUrl(txId: string): string
}
```

### 2. NFTMintingService (`src/services/nftMintingService.ts`) ⭐ NUOVO

**Servizio specializzato per minting** con ARC-19 + ARC-3 compliance:

```typescript
class NFTMintingService {
  // ✅ Complete SBT minting with IPFS + ARC-19
  async mintCertificationSBT(params: CertificationMintParams): Promise<MintingResult>
  
  // ✅ ARC-19 compliant asset creation
  private async createARC19SBTAsset(params): Promise<{ assetId, txId, confirmedRound }>
  
  // ✅ CID to Address conversion (Python pattern)
  private fromCidToAddress(cidStr: string): string
  
  // ✅ Metadata versioning support
  async updateCertificationMetadata(params): Promise<{ txId, newMetadataCid, newReserveAddress }>
  
  // ✅ Asset reserve updates
  async updateAssetReserve(params): Promise<{ txId, confirmedRound }>
  
  // ✅ Service diagnostics
  async testService(): Promise<{ ipfs: boolean; algorand: boolean }>
}
```

### 3. NFTService (`src/services/nftService.ts`) ⭐ NUOVO

**Gestione asset posseduti** con ottimizzazioni:

```typescript
class NFTService {
  // ✅ Optimized asset fetching with rate limiting
  async getOwnedAssets(address: string): Promise<AccountAssets>
  async getOwnedNFTs(address: string): Promise<AssetInfo[]>
  
  // ✅ Certificate identification
  async getOwnedCertificates(address: string): Promise<AssetInfo[]>
  
  // ✅ Ownership verification
  async ownsAsset(address: string, assetId: string): Promise<boolean>
  
  // ✅ Account info with enhanced details
  async getAccountInfo(address: string): Promise<AccountInfo>
  
  // ✅ Retry logic and rate limiting
  private async withRetry<T>(operation: () => Promise<T>): Promise<T>
}
```

### 4. CidDecoder (`src/services/cidDecoder.ts`) ⭐ AGGIORNATO

**ARC-19 compliance completa**:

```typescript
export class CidDecoder {
  // ✅ CID ↔ Address conversion (ARC-19)
  static fromCidToAddress(cidStr: string): string
  static decodeReserveAddressToCid(reserveAddress: string): CidInfo | null
  
  // ✅ Versioning extraction from reserves
  static async extractVersioningFromReserves(reserves: string[], configHistory: any[]): Promise<unknown[]>
  static async extractVersioningInfo(configHistory: any[]): Promise<unknown[]>
  
  // ✅ Reserve address validation
  static isValidReserveAddress(address: string): boolean
  static decodeReserveAddress(reserveAddress: string): string
}
```

## 🎨 NFT Soulbound (SBT) - ARC-19 + ARC-3

### Caratteristiche Implementate

Gli NFT soulbound seguono **esattamente** il pattern Python con:
- **✅ ARC-19 compliance**: CID convertito in reserve address
- **✅ ARC-3 metadata**: JSON su IPFS con template URL
- **✅ Non trasferibili**: `clawback` e `freeze` gestiti dal creatore
- **✅ Quantità fissa**: Total supply = 1, decimals = 0
- **✅ Versioning**: Reserve address aggiornabile per nuove versioni metadata

### Workflow Minting Completo

```typescript
// 1. Upload files + metadata to IPFS
const ipfsResult = await ipfsService.uploadCertificationAssets(
  files,
  certificationData,
  formData
);

// 2. Convert CID to reserve address (ARC-19)
const reserveAddress = CidDecoder.fromCidToAddress(ipfsResult.metadataHash);

// 3. Create asset with ARC-19 template URL
const createResult = await this.createARC19SBTAsset({
  mnemonic: params.mnemonic,
  assetName: params.assetName,
  unitName: params.unitName,
  reserveAddress: reserveAddress,
  metadataCid: ipfsResult.metadataHash
});

// 4. Return complete result
return {
  assetId: createResult.assetId,
  txId: createResult.txId,
  confirmedRound: createResult.confirmedRound,
  assetAddress: account.addr.toString(),
  metadataUrl: ipfsResult.metadataUrl,
  reserveAddress: reserveAddress,
  metadataCid: ipfsResult.metadataHash,
  ipfsHashes: { metadata, files }
};
```

### Struttura Metadata Certificazioni

```json
{
  "name": "Certificazione Artefatto - [Title]",
  "description": "Certificazione digitale per artefatto",
  "image": "ipfs://[file_hash]",
  "external_url": "https://caput-mundi.com/cert/[unique_id]",
  "attributes": [
    {
      "trait_type": "Tipo Asset",
      "value": "artefatto-digitale"
    },
    {
      "trait_type": "Organizzazione",
      "value": "Museo Arte"
    },
    {
      "trait_type": "Autore",
      "value": "Leonardo da Vinci"
    },
    {
      "trait_type": "Data Creazione",
      "value": "2024-01-15"
    }
  ],
  "properties": {
    "files": [
      {
        "name": "documento.pdf",
        "ipfsUrl": "ipfs://QmHash...",
        "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmHash..."
      }
    ]
  },
  "certification_data": {
    "asset_type": "artefatto-digitale",
    "unique_id": "ART-2024-001",
    "title": "Monna Lisa Digitale",
    "author": "Leonardo da Vinci",
    "creation_date": "2024-01-15",
    "organization": {
      "name": "Museo Arte",
      "code": "MA001",
      "type": "Museo",
      "city": "Roma"
    },
    "technical_specs": {
      "technology": "Pittura digitale",
      "dimensions": "1920x1080",
      "format": "JPG"
    },
    "files": [
      {
        "name": "monna_lisa.jpg",
        "hash": "QmHash...",
        "type": "image/jpeg",
        "size": 2048576
      }
    ]
  }
}
```

## 💳 Gestione Wallet Avanzata

### WalletService Aggiornato (`src/services/walletService.ts`)

```typescript
interface WalletInfo {
  address: string;
  balance: {
    algo: number;
    eurValue?: number;
  };
  minBalance: number;
  totalAssetsOptedIn: number;
  ownedAssets: AssetInfo[];
  recentTransactions: WalletTransaction[];
}

class WalletService {
  // ✅ Complete wallet info
  async getWalletInfo(address: string): Promise<WalletInfo>
  
  // ✅ Asset filtering
  async getOwnedCertificates(address: string): Promise<AssetInfo[]>
  
  // ✅ Transaction formatting
  formatTransactionType(type: string): string
  getTransactionDirection(tx: WalletTransaction, userAddress: string): 'sent' | 'received'
  
  // ✅ Amount formatting
  formatAlgo(microAlgos: number): string
  formatEur(eurAmount: number): string
}
```

### UI Integration

```typescript
// WalletPage.tsx - Enhanced features
const WalletPage: React.FC = () => {
  // ✅ Real-time wallet data
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  
  // ✅ Tab navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'assets'>('overview');

  // ✅ Balance visibility toggle
  const [showBalance, setShowBalance] = useState(true);
  
  // ✅ Auto-refresh capability
  const refreshWalletData = async () => {
    const info = await walletService.getWalletInfo(userAddress);
    setWalletInfo(info);
  };
  
  return (
    <ResponsiveLayout>
      {/* Balance card with privacy toggle */}
      {/* Assets tab with certificates */}
      {/* Transactions tab with history */}
    </ResponsiveLayout>
  );
};
```

## 🔍 Asset Information e Explorer

### Enhanced Asset Info

```typescript
interface AssetInfo {
  index: number;
  params: AssetParams;
  'created-at-round'?: number;
  'deleted-at-round'?: number;
  // ✅ Enhanced fields
  creationTransaction?: unknown;
  configHistory?: any[];
  versioningInfo?: unknown[];
  currentReserveInfo?: string;
  currentCidInfo?: unknown;
  nftMetadata?: NftMetadata;
  description?: string;
}
```

### Explorer Integration

```typescript
// Direct links to Algorand explorers
const assetUrl = algorandService.getAssetExplorerUrl(assetId);
const addressUrl = algorandService.getAddressExplorerUrl(address);
const txUrl = algorandService.getTransactionExplorerUrl(txId);

// Examples:
// https://testnet.algoexplorer.io/asset/123456
// https://testnet.algoexplorer.io/address/ABC...XYZ
// https://testnet.algoexplorer.io/tx/DEF...789
```

## 🧪 Testing e Diagnostica

### Service Testing

```typescript
// NFT Minting Service Test
const testResult = await nftMintingService.testService();
console.log('IPFS Connection:', testResult.ipfs);
console.log('Algorand Connection:', testResult.algorand);

// Environment Validation
import { validateConfig } from '../config/environment';
const isValid = validateConfig();
console.log('Configuration valid:', isValid);
```

### Error Handling

```typescript
try {
  const result = await nftMintingService.mintCertificationSBT(params);
  console.log('✅ SBT minted:', result.assetId);
  } catch (error) {
  if (error.message.includes('insufficient funds')) {
    // Handle low balance
  } else if (error.message.includes('IPFS')) {
    // Handle IPFS issues
  } else {
    // Handle other errors
  }
}
```

## 🚦 Rate Limiting e Performance

### Ottimizzazioni Implementate

```typescript
class NFTService {
  private readonly RATE_LIMIT_DELAY = 200; // ms between requests
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // ms

  // ✅ Rate limiting
  private sleep(ms: number): Promise<void>
  
  // ✅ Retry logic with exponential backoff
  private async withRetry<T>(operation: () => Promise<T>): Promise<T>
  
  // ✅ Batch processing for large datasets
  // Commented out for now, available for future use
}
```

### Batch Operations

```typescript
// Process assets in batches to avoid API limits
const SEARCH_BATCH_SIZE = 20;

for (let i = 0; i < nftAssets.length; i += SEARCH_BATCH_SIZE) {
  const batch = nftAssets.slice(i, i + SEARCH_BATCH_SIZE);
  const batchResults = await Promise.allSettled(batchPromises);
  
  // Delay between batches
  if (i + SEARCH_BATCH_SIZE < nftAssets.length) {
    await this.sleep(this.RATE_LIMIT_DELAY * 3);
  }
}
```

## 📊 Monitoring e Analytics

### Asset Creation Tracking

```typescript
interface MintingResult {
  assetId: number;
  txId: string;
  confirmedRound: number;
  assetAddress: string;
  metadataUrl?: string;
  reserveAddress: string;
  metadataCid: string;
  ipfsHashes?: {
    metadata: string;
    files: Array<{ name: string; hash: string }>;
};
}
```

### Transaction Monitoring

```typescript
// Get asset transactions for auditing
const transactions = await algorandService.getAssetTransactions(assetId);
  
// Monitor asset config changes
const configHistory = await algorandService.getAssetConfigHistory(assetId);
  
// Track reserve address changes (versioning)
const reserveHistory = await algorandService.getAssetReserveHistory(assetId);
```

## 🔐 Security Considerations

### Private Key Management

```typescript
// ⚠️ Environment variables only - NEVER hardcode
const mnemonic = import.meta.env.VITE_PRIVATE_KEY_MNEMONIC;
if (!mnemonic) {
  throw new Error('Mnemonic non configurata nel file .env');
  }

// ✅ Account derivation
const account = algosdk.mnemonicToSecretKey(mnemonic);
```

### Asset Security

```typescript
// ✅ SBT configuration for non-transferability
const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParams(
  account.addr,        // creator
  undefined,           // note
  1,                   // total supply
  0,                   // decimals  
  false,              // default frozen
  account.addr,        // manager (can modify reserve)
  reserveAddress,      // reserve (ARC-19 CID)
  account.addr,        // freeze (prevent transfers)
  account.addr,        // clawback (revoke if needed)
  // ... other params
);
```

## 🎯 Stato Implementazione

### ✅ Completato
- [x] Algorand client integration
- [x] Asset creation (ARC-19 + ARC-3)
- [x] CID ↔ Address conversion
- [x] IPFS metadata upload
- [x] Wallet management UI
- [x] Asset info extraction
- [x] Explorer integration
- [x] Error handling
- [x] Rate limiting
- [x] TypeScript types
- [x] Documentation

### 🚦 Ready for Production Testing

Il sistema è **completamente funzionale** e pronto per testing in ambiente TestNet con configurazione appropriata delle variabili d'ambiente. 