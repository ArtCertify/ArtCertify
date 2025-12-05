# 📁 Integrazione Storage - Caput Mundi FE

Documentazione completa per l'integrazione storage ibrida MINIO + IPFS per l'archiviazione di file e metadata delle certificazioni digitali.

## 📋 Panoramica

L'architettura di storage utilizza un approccio ibrido:

### **🏗️ Architettura Ibrida Storage**

- **📦 MINIO/S3 Storage**: File delle certificazioni (immagini, documenti, video, etc.)
  - URL formato: `https://s3.caputmundi.artcertify.com/{lowercase userAddress}/{filename.extension}`
  - Upload tramite presigned URLs con autenticazione JWT
  - Storage centralizzato S3-compatible per performance ottimizzate

- **🌐 IPFS Storage**: Solo metadata JSON delle certificazioni
  - Archiviazione decentralizzata tramite Pinata
  - Immutabilità tramite hash crittografici
  - ARC-19 compliance per Algorand NFT
  - Gateway personalizzati per accesso ottimizzato

### **🎯 Vantaggi Architettura Ibrida**

- **✅ Performance**: File su MINIO per accesso rapido e affidabile
- **✅ Immutabilità**: Metadata JSON su IPFS per garantire integrità
- **✅ Costi**: Riduzione costi IPFS caricando solo JSON (piccolo)
- **✅ Scalabilità**: MINIO gestisce meglio file di grandi dimensioni
- **✅ Compliance**: ARC-19 mantenuto con metadata IPFS
- **✅ Retrocompatibilità**: Organizzazioni continuano a usare IPFS per file

## 🔧 Configurazione

### Variabili d'Ambiente Richieste

```bash
# Backend API (richiesto per MINIO presigned URLs)
VITE_API_BASE_URL=https://caputmundi.artcertify.com  # URL del backend API

# Pinata IPFS Gateway Configuration (solo per metadata JSON)
VITE_PINATA_GATEWAY=your-gateway.mypinata.cloud

# Pinata API Configuration (solo per metadata JSON)
VITE_PINATA_API_KEY=your_api_key
VITE_PINATA_API_SECRET=your_api_secret
VITE_PINATA_JWT=your_jwt_token
```

### Setup MINIO Storage

1. **Backend API**: Il backend deve esporre endpoint per presigned URLs
   - Endpoint: `GET /api/v1/presigned/upload?filename={filename}`
   - Autenticazione: JWT Bearer token
   - Response: Presigned URL per upload diretto su MINIO

2. **MINIO Configuration**: Configurato lato backend
   - Base URL: `https://s3.caputmundi.artcertify.com`
   - Bucket structure: `/{lowercase userAddress}/{filename}`
   - Access control: Gestito tramite presigned URLs

### Setup Account Pinata

1. **Registrazione**: https://pinata.cloud/
2. **API Keys**: Dashboard > API Keys > New Key
3. **Gateway**: Dashboard > Gateways > Create Dedicated Gateway
4. **Permissions**: Admin access per upload/pin/unpin

## 🏗️ Architettura IPFS Service

### IPFSService (`src/services/ipfsService.ts`)

**Servizio completo per gestione IPFS** tramite Pinata:

```typescript
class IPFSService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly jwt: string;
  private readonly baseURL = 'https://api.pinata.cloud';

  // ✅ File upload with metadata
  async uploadFile(file: File, metadata?: IPFSFileMetadata): Promise<IPFSUploadResponse>
  
  // ✅ JSON upload with structured data
  async uploadJSON(jsonData: IPFSMetadata, metadata?: IPFSFileMetadata): Promise<IPFSUploadResponse>
  
  // ✅ Complete certification assets upload (MINIO per file, IPFS per JSON)
  async uploadCertificationAssets(
    files: File[],
    certificationData: IPFSMetadata['certification_data'],
    formData: Record<string, any>,
    userAddress?: string  // Richiesto per costruire URL MINIO
  ): Promise<CertificationUploadResult>
  
  // ✅ Organization version upload (IPFS per file - legacy)
  async uploadOrganizationVersion(
    files: File[],
    customJson: any,
    formData: Record<string, any>
  ): Promise<CertificationUploadResult>
  
  // ✅ Certification version upload (MINIO per file, IPFS per JSON)
  async uploadCertificationVersion(
    files: File[],
    customJson: any,
    formData: Record<string, any>,
    userAddress?: string  // Richiesto per costruire URL MINIO
  ): Promise<CertificationUploadResult>
  
  // ✅ URL generation for different gateways
  getIPFSUrl(hash: string): string
  getCustomGatewayUrl(hash: string, gateway?: string): string
  
  // ✅ Connection testing
  async testConnection(): Promise<boolean>
}
```

### Interfacce TypeScript

```typescript
export interface IPFSUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export interface IPFSFileMetadata {
  name?: string;
  keyvalues?: Record<string, string | number>;
}

export interface IPFSMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: Record<string, unknown>;
  certification_data?: {
    asset_type: string;
    unique_id: string;
    title: string;
    author: string;
    creation_date: string;
    organization: OrganizationInfo;
    technical_specs?: Record<string, string>;
    files?: Array<FileInfo>;
  };
}

export interface CertificationUploadResult {
  metadataHash: string;
  fileHashes: Array<FileInfo>;
  metadataUrl: string;
  individualFileUrls: Array<{
    name: string;
    s3StorageUrl?: string;  // URL MINIO per file certificazioni
    ipfsUrl?: string;       // URL IPFS (per retrocompatibilità e organizzazioni)
    gatewayUrl: string;     // URL gateway (MINIO o IPFS)
  }>;
}
```

## 🎯 Workflow Upload Completo

### **Architettura Ibrida: MINIO + IPFS**

Il workflow differisce tra **Certificazioni** e **Organizzazioni**:

#### **📋 Certificazioni (MINIO + IPFS)**

### 1. Upload File su MINIO

```typescript
// I file vengono caricati su MINIO PRIMA del processo di certificazione
// Questo avviene nella pagina "Nuova Certificazione" tramite MinIOService

import MinIOService from './minioServices';

const minioService = new MinIOService();

// Upload file su MINIO tramite presigned URL
await minioService.uploadCertificationToMinio(files);

// Il backend genera presigned URLs tramite:
// GET /api/v1/presigned/upload?filename={filename}
// Headers: Authorization: Bearer {JWT_TOKEN}
// Response: Presigned URL per upload diretto
```

### 2. Costruzione URL MINIO

```typescript
// Gli URL MINIO vengono costruiti nel formato:
const lowercaseAddress = userAddress.toLowerCase();
const fileName = encodeURIComponent(file.name);
const minioUrl = `https://s3.caputmundi.artcertify.com/${lowercaseAddress}/${fileName}`;

// Esempio:
// https://s3.caputmundi.artcertify.com/vs6jshyleixfflv57zj2idaysrg2fir3zi4jdyrv4vzwdnzosgv5jdamui/Grey%20wallpaper%20desktop.jpeg
```

### 3. Creazione Metadata JSON con URL MINIO

```typescript
// Struttura metadata completa per ARC-3 + certificazioni
// I file ora puntano a URL MINIO invece di IPFS
const metadata: IPFSMetadata = {
  name: `Certificazione ${certificationData.asset_type} - ${certificationData.title}`,
  description: `Certificazione digitale per ${certificationData.asset_type}`,
  image: minioUrl,  // URL MINIO invece di IPFS
  external_url: `https://gateway.pinata.cloud/ipfs/${certificationData.unique_id}`,
  
  // ARC-3 attributes
  attributes: [
    { trait_type: "Tipo Asset", value: certificationData.asset_type },
    { trait_type: "Organizzazione", value: certificationData.organization.name },
    { trait_type: "Autore", value: certificationData.author },
    { trait_type: "Data Creazione", value: certificationData.creation_date }
  ],
  
  // File links con URL MINIO
  properties: {
    form_data: { ...formData },
    files_metadata: [
      {
        name: file.name,
        s3StorageUrl: minioUrl,  // URL MINIO
        gatewayUrl: minioUrl     // URL MINIO (per retrocompatibilità)
      }
    ],
    storage_info: {
      uploaded_at: new Date().toISOString(),
      total_files: files.length,
      storage_type: 'minio',
      base_url: 'https://s3.caputmundi.artcertify.com'
    }
  },
  
  // Extended certification data
  certification_data: {
    ...certificationData,
    files: fileHashes  // Hash vuoto per file MINIO
  }
};
```

#### **🏢 Organizzazioni (IPFS Legacy)**

Le organizzazioni continuano a caricare i file su IPFS:

```typescript
// Upload ogni file separatamente su IPFS con metadata specifici
for (const file of files) {
  const uploadResult = await this.uploadFile(file, {
    name: `ORG_${formData.assetName || 'file'}_${file.name}`,
    keyvalues: {
      asset_id: formData.assetName || '',
      file_type: file.type,
      file_size: file.size.toString(),
      upload_timestamp: new Date().toISOString()
    }
  });

  fileHashes.push({
    name: file.name,
    hash: uploadResult.IpfsHash,
    type: file.type,
    size: file.size
  });
  
  individualFileUrls.push({
    name: file.name,
    ipfsUrl: `ipfs://${uploadResult.IpfsHash}`,
    gatewayUrl: IPFSUrlService.getGatewayUrl(uploadResult.IpfsHash)
  });
}
```

### 4. Upload Metadata JSON su IPFS

```typescript
// Solo il JSON dei metadati viene caricato su IPFS
// I file sono già su MINIO e i loro URL sono nel JSON
const metadataUploadResult = await this.uploadJSON(metadata, {
  name: `metadata_${certificationData.unique_id}`,
  keyvalues: {
    asset_type: certificationData.asset_type,
    unique_id: certificationData.unique_id,
    organization: certificationData.organization.code,
    upload_type: 'certification_metadata',
    files_count: fileHashes.length.toString(),
    storage_type: 'minio'  // Indica che i file sono su MINIO
  }
});
```

### 5. Risultato Completo

```typescript
return {
  metadataHash: metadataUploadResult.IpfsHash,  // Hash del JSON su IPFS
  fileHashes: fileHashes,  // Info file (hash vuoto per MINIO)
  metadataUrl: `ipfs://${metadataUploadResult.IpfsHash}`,
  individualFileUrls: individualFileUrls  // Array con s3StorageUrl per MINIO
};
```

## 🔄 MINIO Service Integration

### MinIOService (`src/services/minioServices.ts`)

**Servizio per upload file su MINIO tramite presigned URLs**:

```typescript
class MinIOService {
  // ✅ Ottiene presigned URL dal backend
  private async getPresignedUrl(fileName: string): Promise<string>
  
  // ✅ Upload file singolo su MINIO
  private async uploadFile(file: File): Promise<{ url: string, etag: string | undefined }>
  
  // ✅ Upload multipli file per certificazioni
  public async uploadCertificationToMinio(files: File[]): Promise<void>
}
```

### Workflow Upload MINIO

```typescript
// 1. Richiesta presigned URL al backend
const presignedUrl = await axios.get(
  `${API_BASE_URL}/api/v1/presigned/upload?filename=${encodeURIComponent(fileName)}`,
  {
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Accept': 'text/plain'
    }
  }
);

// 2. Upload diretto su MINIO usando presigned URL
await axios.put(presignedUrl, file, {
  headers: { 'Content-Type': file.type }
});

// 3. Costruzione URL pubblico MINIO
const minioUrl = `https://s3.caputmundi.artcertify.com/${lowercaseUserAddress}/${fileName}`;
```

## 🔗 ARC-19 Integration

### CID to Address Conversion

```typescript
// Il metadata hash viene convertito in reserve address per ARC-19
const reserveAddress = CidDecoder.fromCidToAddress(metadataHash);

// Questo reserve address viene utilizzato nell'asset Algorand
const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParams(
  account.addr,
  undefined,
  1, // total
  0, // decimals
  false, // default frozen
  account.addr, // manager
  reserveAddress, // reserve (ARC-19 compliance)
  account.addr, // freeze
  account.addr, // clawback
  unitName,
  assetName,
  `template-ipfs://{ipfscid:1:raw:reserve:sha2-256}`, // ARC-19 template URL
  undefined,
  suggestedParams
);
```

## 🌐 Gateway Management

### Multiple Gateway Support

```typescript
// Default IPFS gateway
getIPFSUrl(hash: string): string {
  return `ipfs://${hash}`;
}

// Custom gateway (Pinata dedicated)
getCustomGatewayUrl(hash: string, gateway?: string): string {
  const gatewayDomain = gateway || import.meta.env.VITE_PINATA_GATEWAY;
  
  if (!gatewayDomain) {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  
  return `https://${gatewayDomain}/ipfs/${hash}`;
}

// Esempi di URL generati:
// ipfs://QmHash...
// https://your-gateway.mypinata.cloud/ipfs/QmHash...
// https://gateway.pinata.cloud/ipfs/QmHash...
```

### Fallback Gateways

```typescript
const FALLBACK_GATEWAYS = [
  'gateway.pinata.cloud',
  'cloudflare-ipfs.com',
  'dweb.link',
  'ipfs.io'
];

// Retry logic per accesso a contenuti IPFS
async function fetchWithFallback(hash: string) {
  for (const gateway of FALLBACK_GATEWAYS) {
    try {
      const url = `https://${gateway}/ipfs/${hash}`;
      const response = await fetch(url, { timeout: 5000 });
      if (response.ok) return response.json();
    } catch (error) {
      console.warn(`Gateway ${gateway} failed for ${hash}`);
    }
  }
  throw new Error('All gateways failed');
}
```

## 📊 Pinata Configuration

### Regional Replication

```typescript
// Configurazione ridondanza per upload
const pinataOptions = {
  cidVersion: 1,
  customPinPolicy: {
    regions: [
      {
        id: 'FRA1', // Frankfurt
        desiredReplicationCount: 1
      },
      {
        id: 'NYC1', // New York
        desiredReplicationCount: 1
      }
    ]
  }
};
```

### File Metadata Tracking

```typescript
// Metadata associati a ogni file per tracking
const fileMetadata = {
  name: `${certificationData.unique_id}_${file.name}`,
  keyvalues: {
    asset_id: certificationData.unique_id,
    file_type: file.type,
    file_size: file.size.toString(),
    upload_timestamp: new Date().toISOString(),
    organization: certificationData.organization.code,
    asset_type: certificationData.asset_type
  }
};
```

## 🔒 Security e Best Practices

### API Key Management

```typescript
constructor() {
  // ✅ Environment variables only
  this.apiKey = import.meta.env.VITE_PINATA_API_KEY;
  this.apiSecret = import.meta.env.VITE_PINATA_API_SECRET;
  this.jwt = import.meta.env.VITE_PINATA_JWT;

  // ✅ Validation
  if (!this.apiKey || !this.apiSecret || !this.jwt) {
    throw new Error('Pinata API credentials not found in environment variables');
  }
}
```

### Content Validation

```typescript
// Validazione file prima dell'upload
const validateFile = (file: File): boolean => {
  // Size limit (10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File troppo grande (max 10MB)');
  }
  
  // Allowed types
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf', 'text/plain',
    'video/mp4', 'video/quicktime',
    'model/gltf+json', 'model/gltf-binary'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo file non supportato');
  }
  
  return true;
};
```

### Hash Verification

```typescript
// Verifica integrità dopo upload
const verifyUpload = async (hash: string, originalFile: File): Promise<boolean> => {
  try {
    const ipfsUrl = this.getCustomGatewayUrl(hash);
    const response = await fetch(ipfsUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    // Compare file sizes (basic check)
    return arrayBuffer.byteLength === originalFile.size;
  } catch (error) {
    console.error('Upload verification failed:', error);
    return false;
  }
};
```

## 🧪 Testing e Diagnostica

### Connection Testing

```typescript
async testConnection(): Promise<boolean> {
  try {
    const response = await axios.get(`${this.baseURL}/data/testAuthentication`, {
      headers: {
        'pinata_api_key': this.apiKey,
        'pinata_secret_api_key': this.apiSecret,
      },
      timeout: 10000,
    });

    return response.status === 200 && response.data.message === 'Congratulations! You are communicating with the Pinata API!';
  } catch (error) {
    console.error('Pinata connection test failed:', error);
    return false;
  }
}
```

### Upload Testing

```typescript
// Test complete upload workflow (Certificazioni - MINIO + IPFS)
const testCertificationUploadWorkflow = async () => {
  const userAddress = 'VS6JSHYL...'; // Lowercase user address
  
  // 1. Upload file su MINIO
  const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
  const minioService = new MinIOService();
  await minioService.uploadCertificationToMinio([testFile]);
  
  // 2. Costruisci URL MINIO
  const minioUrl = `https://s3.caputmundi.artcertify.com/${userAddress.toLowerCase()}/${encodeURIComponent(testFile.name)}`;
  console.log('MINIO URL:', minioUrl);
  
  // 3. Test JSON upload su IPFS (solo metadata)
  const testMetadata = { 
    name: 'Test', 
    description: 'Test metadata',
    image: minioUrl,  // URL MINIO invece di IPFS
    properties: {
      files_metadata: [{
        name: testFile.name,
        s3StorageUrl: minioUrl,
        gatewayUrl: minioUrl
      }]
    }
  };
  const jsonResult = await ipfsService.uploadJSON(testMetadata);
  console.log('JSON upload test (IPFS):', jsonResult.IpfsHash);
  
  // 4. Test URL generation
  const ipfsUrl = ipfsService.getIPFSUrl(jsonResult.IpfsHash);
  const gatewayUrl = ipfsService.getCustomGatewayUrl(jsonResult.IpfsHash);
  console.log('URLs generated:', { ipfsUrl, gatewayUrl, minioUrl });
};

// Test upload workflow (Organizzazioni - IPFS legacy)
const testOrganizationUploadWorkflow = async () => {
  // 1. Test file upload su IPFS
  const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
  const fileResult = await ipfsService.uploadFile(testFile);
  console.log('File upload test (IPFS):', fileResult.IpfsHash);
  
  // 2. Test JSON upload
  const testMetadata = { name: 'Test', description: 'Test metadata' };
  const jsonResult = await ipfsService.uploadJSON(testMetadata);
  console.log('JSON upload test (IPFS):', jsonResult.IpfsHash);
};
```

## 📈 Performance Optimization

### Parallel Uploads

```typescript
// Upload multipli file in parallelo con rate limiting
const uploadFiles = async (files: File[]): Promise<FileInfo[]> => {
  const CONCURRENT_UPLOADS = 3; // Limite concorrenza
  const results: FileInfo[] = [];
  
  for (let i = 0; i < files.length; i += CONCURRENT_UPLOADS) {
    const batch = files.slice(i, i + CONCURRENT_UPLOADS);
    
    const batchPromises = batch.map(async (file, index) => {
      // Delay progressivo per evitare rate limiting
      await new Promise(resolve => setTimeout(resolve, index * 100));
      
      const result = await this.uploadFile(file, {
        name: `file_${i + index}_${file.name}`,
        keyvalues: { batch: `${Math.floor(i / CONCURRENT_UPLOADS)}` }
      });
      
      return {
        name: file.name,
        hash: result.IpfsHash,
        type: file.type,
        size: file.size
      };
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Delay tra batch
    if (i + CONCURRENT_UPLOADS < files.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
};
```

### Caching Strategy

```typescript
// Cache per metadata frequentemente accessibili
const metadataCache = new Map<string, IPFSMetadata>();

const getCachedMetadata = async (hash: string): Promise<IPFSMetadata | null> => {
  // Check cache first
  if (metadataCache.has(hash)) {
    return metadataCache.get(hash)!;
  }
  
  try {
    const url = ipfsService.getCustomGatewayUrl(hash);
    const response = await fetch(url);
    const metadata = await response.json();
    
    // Cache result
    metadataCache.set(hash, metadata);
    return metadata;
  } catch (error) {
    console.error('Metadata fetch failed:', error);
    return null;
  }
};
```

## 🔍 Monitoring e Analytics

### Upload Tracking

```typescript
interface UploadStats {
  totalFiles: number;
  totalSize: number;
  successfulUploads: number;
  failedUploads: number;
  averageUploadTime: number;
  errorsByType: Record<string, number>;
}

class UploadMonitor {
  private stats: UploadStats = {
    totalFiles: 0,
    totalSize: 0,
    successfulUploads: 0,
    failedUploads: 0,
    averageUploadTime: 0,
    errorsByType: {}
  };
  
  recordUpload(file: File, success: boolean, uploadTime: number, error?: Error) {
    this.stats.totalFiles++;
    this.stats.totalSize += file.size;
    
    if (success) {
      this.stats.successfulUploads++;
    } else {
      this.stats.failedUploads++;
      
      if (error) {
        const errorType = error.message.includes('timeout') ? 'timeout' : 'unknown';
        this.stats.errorsByType[errorType] = (this.stats.errorsByType[errorType] || 0) + 1;
      }
    }
    
    // Update average upload time
    this.stats.averageUploadTime = 
      (this.stats.averageUploadTime * (this.stats.successfulUploads - 1) + uploadTime) / 
      this.stats.successfulUploads;
  }
  
  getStats(): UploadStats {
    return { ...this.stats };
  }
}
```

## 🎯 Stato Implementazione

### ✅ Completato
- [x] Pinata API integration completa (solo per metadata JSON)
- [x] MINIO Service integration con presigned URLs
- [x] Hybrid storage architecture (MINIO + IPFS)
- [x] File upload su MINIO per certificazioni
- [x] JSON upload strutturato su IPFS
- [x] Certificazioni upload workflow (MINIO + IPFS)
- [x] Organizzazioni upload workflow (IPFS legacy)
- [x] ARC-19 CID handling
- [x] Multiple gateway support
- [x] Error handling e retry logic
- [x] Connection testing
- [x] TypeScript interfaces complete
- [x] Security best practices
- [x] URL MINIO construction e gestione
- [x] Retrocompatibilità con file IPFS esistenti

### 🚦 Ready for Production

Il servizio storage ibrido è **completamente funzionale** e integrato con:
- ✅ NFT Minting Service per ARC-19 compliance
- ✅ Form UI per upload certificazioni (MINIO)
- ✅ Asset display per visualizzazione metadata (MINIO + IPFS)
- ✅ Error handling per user experience ottimale
- ✅ Versioning support per entrambi i tipi di storage

### 🔄 Integration Points

```typescript
// Used by CertificationForm - Upload su MINIO
const minioService = new MinIOService();
await minioService.uploadCertificationToMinio(files);

// Used by NFTMintingService - Upload metadata JSON su IPFS
const ipfsResult = await ipfsService.uploadCertificationAssets(
  files, 
  certificationData, 
  formData,
  userAddress  // Per costruire URL MINIO
);

// Used by AssetDetailsPage - Lettura metadata (supporta MINIO e IPFS)
const metadata = await getCachedMetadata(assetInfo.currentCidInfo?.hash);
// metadata.image può essere URL MINIO o IPFS

// Used by OrganizationProfilePage - Upload su IPFS (legacy)
const orgResult = await ipfsService.uploadOrganizationVersion(files, customJson, formData);
``` 