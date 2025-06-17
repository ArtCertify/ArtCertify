# 🌐 Integrazione IPFS con Pinata

Documentazione completa per l'integrazione IPFS utilizzando Pinata come gateway e servizio di pinning per ArtCertify.

## 📋 Panoramica

L'integrazione IPFS permette di:
- **Archiviare metadata NFT** in modo decentralizzato
- **Garantire immutabilità** dei dati certificati
- **Ridurre costi** rispetto a storage on-chain
- **Migliorare performance** con gateway ottimizzati

## 🔧 Configurazione

### Variabili d'Ambiente

```bash
# Pinata IPFS Gateway Configuration
VITE_PINATA_GATEWAY=coffee-quiet-limpet-747.mypinata.cloud

# Pinata API (per upload - solo backend)
PINATA_API_KEY=your_api_key
PINATA_SECRET_API_KEY=your_secret_key
PINATA_JWT=your_jwt_token
```

### Setup Pinata Account

1. **Registrazione**: https://pinata.cloud/
2. **API Keys**: Genera chiavi API nel dashboard
3. **Gateway**: Configura gateway personalizzato
4. **Billing**: Configura piano (free tier disponibile)

## 🏗️ Architettura

### Flusso Dati

```
Frontend → Backend API → Pinata → IPFS Network
    ↓                              ↓
Algorand ← CID Hash ← Gateway URL ← IPFS
```

### Componenti

```typescript
// Servizio CID Decoder
class CIDDecoder {
  decodeCID(url: string): CIDInfo
  validateCID(cid: string): boolean
  getGatewayUrl(cid: string): string
}

// Servizio NFT con IPFS
class NFTService {
  uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string>
  fetchMetadataFromIPFS(url: string): Promise<NFTMetadata>
  validateIPFSUrl(url: string): boolean
}
```

## 📤 Upload Metadata

### Struttura Metadata NFT

```json
{
  "name": "Certificazione Documento - Contratto Affitto",
  "description": "Certificazione digitale per documento legale",
  "image": "ipfs://QmYourImageHash",
  "external_url": "https://artcertify.com/cert/12345",
  "attributes": [
    {
      "trait_type": "Tipo Certificazione",
      "value": "Documento"
    },
    {
      "trait_type": "Organizzazione",
      "value": "Studio Legale Roma"
    },
    {
      "trait_type": "Data Certificazione",
      "value": "2024-01-15"
    },
    {
      "trait_type": "Hash Documento",
      "value": "sha256:abcd1234..."
    }
  ],
  "properties": {
    "certification_type": "document",
    "organization_id": "ORG-001",
    "document_hash": "sha256:abcd1234efgh5678",
    "created_at": "2024-01-15T10:30:00Z",
    "creator_address": "ALGORAND_ADDRESS",
    "version": "1.0"
  }
}
```

### Processo Upload

#### 1. Preparazione Metadata

```typescript
// src/services/nftService.ts
const prepareMetadata = (data: CertificationData): NFTMetadata => {
  return {
    name: `Certificazione ${data.type} - ${data.name}`,
    description: `Certificazione digitale per ${data.type.toLowerCase()}`,
    image: data.imageUrl ? `ipfs://${data.imageUrl}` : undefined,
    external_url: `https://artcertify.com/cert/${data.id}`,
    attributes: [
      {
        trait_type: "Tipo Certificazione",
        value: data.type
      },
      {
        trait_type: "Organizzazione",
        value: data.organization.name
      },
      {
        trait_type: "Data Certificazione",
        value: new Date().toISOString().split('T')[0]
      },
      {
        trait_type: "Hash Documento",
        value: data.documentHash
      }
    ],
    properties: {
      certification_type: data.type.toLowerCase(),
      organization_id: data.organization.id,
      document_hash: data.documentHash,
      created_at: new Date().toISOString(),
      creator_address: data.creatorAddress,
      version: "1.0"
    }
  };
};
```

#### 2. Upload a Pinata

```typescript
// Backend API endpoint
const uploadToPinata = async (metadata: NFTMetadata): Promise<string> => {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  
  const data = {
    pinataContent: metadata,
    pinataMetadata: {
      name: `ArtCertify-${metadata.name}`,
      keyvalues: {
        app: 'artcertify',
        type: metadata.properties?.certification_type || 'unknown',
        organization: metadata.properties?.organization_id || 'unknown'
      }
    },
    pinataOptions: {
      cidVersion: 1
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PINATA_JWT}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.IpfsHash;
};
```

#### 3. Frontend Integration

```typescript
// src/services/nftService.ts
export class NFTService {
  async createDocumentCertification(data: DocumentData): Promise<number> {
    try {
      // 1. Prepara metadata
      const metadata = this.prepareMetadata(data);
      
      // 2. Upload metadata a IPFS
      const ipfsHash = await this.uploadMetadataToIPFS(metadata);
      const metadataUrl = `ipfs://${ipfsHash}`;
      
      // 3. Crea NFT su Algorand con URL IPFS
      const assetId = await algorandService.createAsset({
        name: metadata.name,
        unitName: 'CERT',
        total: 1,
        decimals: 0,
        url: metadataUrl,
        metadataHash: undefined, // Opzionale: hash dei metadata
        manager: creatorAddress,
        reserve: creatorAddress,
        freeze: creatorAddress,
        clawback: creatorAddress
      });
      
      return assetId;
    } catch (error) {
      console.error('Error creating certification:', error);
      throw error;
    }
  }

  private async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      throw new Error('Failed to upload metadata to IPFS');
    }

    const result = await response.json();
    return result.ipfsHash;
  }
}
```

## 📥 Fetch Metadata

### CID Decoder

```typescript
// src/services/cidDecoder.ts
export interface CIDInfo {
  success: boolean;
  cid: string;
  gatewayUrl: string;
  error?: string;
}

export const decodeCID = (url: string): CIDInfo => {
  try {
    // Gestisce formati: ipfs://QmHash, https://gateway/ipfs/QmHash
    let cid: string;
    
    if (url.startsWith('ipfs://')) {
      cid = url.replace('ipfs://', '');
    } else if (url.includes('/ipfs/')) {
      cid = url.split('/ipfs/')[1];
    } else {
      throw new Error('Invalid IPFS URL format');
    }

    // Valida CID
    if (!isValidCID(cid)) {
      throw new Error('Invalid CID format');
    }

    const gatewayUrl = `https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${cid}`;

    return {
      success: true,
      cid,
      gatewayUrl
    };
  } catch (error) {
    return {
      success: false,
      cid: '',
      gatewayUrl: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const isValidCID = (cid: string): boolean => {
  // CID v0: inizia con Qm, 46 caratteri
  const cidV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  
  // CID v1: più complesso, inizia con b (base32) o z (base58)
  const cidV1Regex = /^b[a-z2-7]{58}$|^z[1-9A-HJ-NP-Za-km-z]+$/;
  
  return cidV0Regex.test(cid) || cidV1Regex.test(cid);
};
```

### Fetch da Gateway

```typescript
// src/services/nftService.ts
export const fetchMetadataFromIPFS = async (ipfsUrl: string): Promise<NFTMetadata | null> => {
  try {
    const cidInfo = decodeCID(ipfsUrl);
    
    if (!cidInfo.success) {
      console.error('Invalid IPFS URL:', cidInfo.error);
      return null;
    }

    const response = await fetch(cidInfo.gatewayUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const metadata = await response.json();
    
    // Valida struttura metadata
    if (!isValidNFTMetadata(metadata)) {
      throw new Error('Invalid NFT metadata structure');
    }

    return metadata;
  } catch (error) {
    console.error('Error fetching IPFS metadata:', error);
    return null;
  }
};

const isValidNFTMetadata = (data: any): data is NFTMetadata => {
  return (
    typeof data === 'object' &&
    typeof data.name === 'string' &&
    typeof data.description === 'string'
  );
};
```

## 🎨 Componenti UI

### MetadataDisplay Component

```tsx
// src/components/ui/MetadataDisplay.tsx
interface MetadataDisplayProps {
  metadata: NFTMetadata | null;
  cidInfo?: CIDInfo;
  loading?: boolean;
  error?: string;
}

const MetadataDisplay: React.FC<MetadataDisplayProps> = ({
  metadata,
  cidInfo,
  loading,
  error
}) => {
  if (loading) {
    return (
      <SectionCard title="Metadata NFT">
        <div className="space-y-3">
          <Skeleton height={20} />
          <Skeleton height={40} />
          <Skeleton height={60} />
        </div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Metadata NFT">
        <ErrorMessage 
          message={`Errore caricamento metadata: ${error}`}
          variant="warning"
        />
      </SectionCard>
    );
  }

  if (!metadata) {
    return (
      <SectionCard title="Metadata NFT">
        <EmptyState
          title="Nessun metadata"
          description="Metadata NFT non disponibili"
          icon={<DocumentIcon />}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Metadata NFT">
      <div className="space-y-4">
        {/* Basic Info */}
        <InfoField label="Nome" value={metadata.name} />
        <InfoField label="Descrizione" value={metadata.description} />
        
        {/* External URL */}
        {metadata.external_url && (
          <InfoField
            label="URL Esterno"
            value={
              <a 
                href={metadata.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {metadata.external_url}
              </a>
            }
          />
        )}

        {/* Image */}
        {metadata.image && (
          <InfoField
            label="Immagine"
            value={
              <div>
                <p className="text-xs text-slate-400 mb-2">{metadata.image}</p>
                <a 
                  href={metadata.image.startsWith('ipfs://') 
                    ? decodeCID(metadata.image).gatewayUrl 
                    : metadata.image
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Visualizza Immagine →
                </a>
              </div>
            }
          />
        )}

        {/* Attributes */}
        {metadata.attributes && metadata.attributes.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-300 mb-3">Attributi:</p>
            <div className="bg-slate-700 rounded-lg p-4 space-y-2">
              {metadata.attributes.map((attr, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">{attr.trait_type}:</span>
                  <span className="text-sm text-slate-200 font-medium">{attr.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IPFS Info */}
        {cidInfo?.success && (
          <div className="border-t border-slate-700 pt-4">
            <InfoField
              label="CID IPFS"
              value={
                <div>
                  <p className="font-mono text-xs text-slate-300 mb-2">{cidInfo.cid}</p>
                  <a 
                    href={cidInfo.gatewayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Visualizza su IPFS →
                  </a>
                </div>
              }
            />
          </div>
        )}
      </div>
    </SectionCard>
  );
};
```

### IPFS Status Indicator

```tsx
const IPFSStatusIndicator: React.FC<{ cidInfo: CIDInfo }> = ({ cidInfo }) => {
  if (!cidInfo.success) {
    return (
      <StatusBadge
        status="error"
        label="IPFS Non Valido"
        icon={<ExclamationTriangleIcon />}
      />
    );
  }

  return (
    <StatusBadge
      status="success"
      label="IPFS Verificato"
      icon={<CheckCircleIcon />}
    />
  );
};
```

## 🔒 Sicurezza

### Validazione CID

```typescript
const validateCIDSecurity = (cid: string): boolean => {
  // Verifica lunghezza
  if (cid.length < 46 || cid.length > 100) {
    return false;
  }

  // Verifica caratteri validi
  const validChars = /^[a-zA-Z0-9]+$/;
  if (!validChars.test(cid)) {
    return false;
  }

  // Verifica prefissi CID validi
  const validPrefixes = ['Qm', 'b', 'z'];
  const hasValidPrefix = validPrefixes.some(prefix => cid.startsWith(prefix));
  
  return hasValidPrefix;
};
```

### Sanitizzazione URL

```typescript
const sanitizeIPFSUrl = (url: string): string => {
  // Rimuovi protocolli pericolosi
  const sanitized = url.replace(/^(javascript|data|vbscript):/i, '');
  
  // Assicurati che sia IPFS
  if (!sanitized.startsWith('ipfs://') && !sanitized.includes('/ipfs/')) {
    throw new Error('URL non è IPFS valido');
  }

  return sanitized;
};
```

### Rate Limiting

```typescript
class IPFSRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests = 100; // per minuto
  private readonly windowMs = 60 * 1000; // 1 minuto

  canMakeRequest(clientId: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(clientId) || [];
    
    // Rimuovi richieste vecchie
    const recentRequests = requests.filter(time => now - time < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Aggiungi nuova richiesta
    recentRequests.push(now);
    this.requests.set(clientId, recentRequests);
    
    return true;
  }
}
```

## 📊 Monitoraggio

### Metriche IPFS

```typescript
interface IPFSMetrics {
  uploadCount: number;
  downloadCount: number;
  errorRate: number;
  averageUploadTime: number;
  averageDownloadTime: number;
  totalStorageUsed: number;
}

class IPFSMonitor {
  private metrics: IPFSMetrics = {
    uploadCount: 0,
    downloadCount: 0,
    errorRate: 0,
    averageUploadTime: 0,
    averageDownloadTime: 0,
    totalStorageUsed: 0
  };

  trackUpload(startTime: number, size: number, success: boolean) {
    const duration = Date.now() - startTime;
    
    this.metrics.uploadCount++;
    if (success) {
      this.metrics.totalStorageUsed += size;
      this.updateAverageUploadTime(duration);
    } else {
      this.updateErrorRate();
    }
  }

  trackDownload(startTime: number, success: boolean) {
    const duration = Date.now() - startTime;
    
    this.metrics.downloadCount++;
    if (success) {
      this.updateAverageDownloadTime(duration);
    } else {
      this.updateErrorRate();
    }
  }

  getMetrics(): IPFSMetrics {
    return { ...this.metrics };
  }
}
```

### Logging

```typescript
const logIPFSOperation = (operation: string, data: any) => {
  console.log(`[IPFS] ${operation}:`, {
    timestamp: new Date().toISOString(),
    gateway: import.meta.env.VITE_PINATA_GATEWAY,
    ...data
  });
};
```

## 🧪 Testing

### Mock IPFS per Testing

```typescript
// src/services/__mocks__/ipfs.ts
export const mockIPFSService = {
  uploadMetadata: jest.fn().mockResolvedValue('QmMockHash123'),
  fetchMetadata: jest.fn().mockResolvedValue({
    name: 'Test NFT',
    description: 'Test Description',
    attributes: []
  }),
  decodeCID: jest.fn().mockReturnValue({
    success: true,
    cid: 'QmMockHash123',
    gatewayUrl: 'https://mock-gateway.com/ipfs/QmMockHash123'
  })
};
```

### Test Integration

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { MetadataDisplay } from '../MetadataDisplay';

describe('MetadataDisplay', () => {
  it('should display metadata correctly', async () => {
    const mockMetadata = {
      name: 'Test Certification',
      description: 'Test Description',
      attributes: [
        { trait_type: 'Type', value: 'Document' }
      ]
    };

    render(<MetadataDisplay metadata={mockMetadata} />);

    expect(screen.getByText('Test Certification')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Type:')).toBeInTheDocument();
    expect(screen.getByText('Document')).toBeInTheDocument();
  });
});
```

## 🚀 Ottimizzazioni

### Caching

```typescript
class IPFSCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly ttl = 5 * 60 * 1000; // 5 minuti

  get(cid: string): any | null {
    const cached = this.cache.get(cid);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(cid);
      return null;
    }

    return cached.data;
  }

  set(cid: string, data: any): void {
    this.cache.set(cid, {
      data,
      timestamp: Date.now()
    });
  }
}
```

### Retry Logic

```typescript
const fetchWithRetry = async (url: string, maxRetries = 3): Promise<Response> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      
      if (i === maxRetries - 1) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Backoff esponenziale
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  
  throw new Error('Max retries exceeded');
};
```

---

**Integrazione IPFS completa per ArtCertify - Storage decentralizzato e sicuro** 