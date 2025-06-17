# 🔍 CID Decoder ArtCertify

Documentazione completa del sistema di decodifica CID per ArtCertify, che implementa lo standard ARC-0019 per la conversione tra indirizzi Algorand e Content Identifiers IPFS.

## 📋 Panoramica

Il CID Decoder è un servizio critico che:
- Converte indirizzi Algorand in CID IPFS secondo ARC-0019
- Estrae metadati NFT da transazioni blockchain
- Gestisce il versioning dei contenuti IPFS
- Fornisce URL gateway per l'accesso ai contenuti

## 🔄 Standard ARC-0019

### Specifiche Tecniche

Lo standard ARC-0019 definisce come memorizzare riferimenti IPFS negli NFT Algorand:

```
Reserve Address = Algorand Address encoding of SHA-256 digest
CID v1 = version (1) + codec (0x55 raw) + multihash (0x12 + 0x20 + digest)
```

### Struttura CID

```
CID v1 Structure:
┌─────────┬──────────┬─────────────────────────────┐
│ Version │  Codec   │         Multihash           │
│   (1)   │ (0x55)   │  (0x12 + 0x20 + 32 bytes)  │
└─────────┴──────────┴─────────────────────────────┘
```

## 🛠️ Implementazione

### Classe CidDecoder

```typescript
// src/services/cidDecoder.ts
export class CidDecoder {
  /**
   * Decodifica un reserve address secondo ARC-0019
   */
  static decodeReserveAddressToCid(reserveAddress: string): CidDecodingResult {
    try {
      // Valida lunghezza indirizzo Algorand (58 caratteri)
      if (reserveAddress.length !== 58) {
        return {
          success: false,
          error: 'Reserve address non ha la lunghezza corretta'
        };
      }

      // Decodifica l'indirizzo per ottenere il digest SHA-256
      const addressObj = decodeAddress(reserveAddress);
      
      // Converte il digest in CID v1
      const cid = this.fromAddressToCid(addressObj.publicKey);
      const gatewayUrl = `https://${cid}.ipfs.dweb.link/`;
      
      return {
        success: true,
        cid: cid,
        gatewayUrl: gatewayUrl,
        details: {
          version: 1,
          codec: 'raw',
          hashType: 'sha2-256',
          originalAddress: reserveAddress
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Errore nella decodifica: ${error}`
      };
    }
  }
}
```

### Conversione Address → CID

```typescript
private static fromAddressToCid(addressBytes: Uint8Array): string {
  // 1. Il digest SHA-256 è nei 32 bytes dell'indirizzo
  const hashDigest = addressBytes;
  
  // 2. Crea multihash: hash_type (0x12) + length (0x20) + digest
  const multihashBytes = new Uint8Array(34);
  multihashBytes[0] = 0x12; // sha2-256
  multihashBytes[1] = 0x20; // 32 bytes length
  multihashBytes.set(hashDigest, 2);
  
  // 3. Crea CID v1: version (1) + codec (0x55) + multihash
  const cidBytes = new Uint8Array(36);
  cidBytes[0] = 0x01; // CID version 1
  cidBytes[1] = 0x55; // raw codec
  cidBytes.set(multihashBytes, 2);
  
  // 4. Codifica in base32 con prefisso multibase 'b'
  const base32Cid = this.encodeBase32(cidBytes);
  return 'b' + base32Cid.toLowerCase();
}
```

### Codifica Base32

```typescript
private static encodeBase32(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;
    
    while (bitsLeft >= 5) {
      result += alphabet[(buffer >> (bitsLeft - 5)) & 31];
      bitsLeft -= 5;
    }
  }
  
  if (bitsLeft > 0) {
    result += alphabet[(buffer << (5 - bitsLeft)) & 31];
  }
  
  return result;
}
```

## 📱 Utilizzo Pratico

### Decodifica Base

```typescript
import { CidDecoder } from '../services/cidDecoder';

// Decodifica reserve address da NFT
const reserveAddress = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const result = CidDecoder.decodeReserveAddressToCid(reserveAddress);

if (result.success) {
  console.log('CID:', result.cid);
  console.log('Gateway URL:', result.gatewayUrl);
  console.log('Dettagli:', result.details);
} else {
  console.error('Errore:', result.error);
}
```

### Integrazione con Componenti

```tsx
// Componente per visualizzare metadati IPFS
const MetadataDisplay: React.FC<{ reserveAddress: string }> = ({ reserveAddress }) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMetadata = async () => {
      setLoading(true);
      
      // Decodifica reserve address
      const cidResult = CidDecoder.decodeReserveAddressToCid(reserveAddress);
      
      if (cidResult.success && cidResult.gatewayUrl) {
        try {
          // Carica metadati da IPFS
          const response = await fetch(cidResult.gatewayUrl);
          const data = await response.json();
          setMetadata(data);
        } catch (error) {
          console.error('Errore caricamento metadati:', error);
        }
      }
      
      setLoading(false);
    };

    if (reserveAddress) {
      loadMetadata();
    }
  }, [reserveAddress]);

  if (loading) return <LoadingSpinner />;
  if (!metadata) return <div>Nessun metadato disponibile</div>;

  return (
    <div className="metadata-display">
      <h3>Metadati IPFS</h3>
      <pre>{JSON.stringify(metadata, null, 2)}</pre>
    </div>
  );
};
```

### Analisi Reserve Address

```typescript
// Analizza tipo di contenuto nel reserve address
const analysis = CidDecoder.analyzeReserveAddress(reserveAddress);

console.log('Tipo:', analysis.type);        // 'ipfs', 'url', 'template', etc.
console.log('Contenuto:', analysis.content); // CID o URL estratto
console.log('Dettagli:', analysis.details);  // Array di informazioni aggiuntive
```

## 🔄 Gestione Versioning

### Estrazione Cronologia Versioni

```typescript
// Estrae versioning da transazioni di configurazione asset
const versionHistory = await CidDecoder.extractVersioningFromReserves(
  reserves,      // Array di reserve addresses
  configHistory  // Cronologia transazioni config
);

versionHistory.forEach((version, index) => {
  console.log(`Versione ${index + 1}:`, {
    timestamp: version.timestamp,
    cid: version.cid,
    changes: version.changes
  });
});
```

### Rilevamento Modifiche

```typescript
// Rileva modifiche tra versioni consecutive
const changes = CidDecoder.detectReserveChanges(reserves, currentIndex);

changes.forEach(change => {
  console.log('Modifica rilevata:', change);
});
```

## 🧪 Testing e Validazione

### Test di Conversione

```typescript
// Testa conversione bidirezionale address ↔ CID
const testResult = CidDecoder.testConversion(reserveAddress);

console.log('Test risultato:', {
  success: testResult.success,
  originalAddress: testResult.originalAddress,
  generatedCid: testResult.generatedCid,
  reconstructedAddress: testResult.reconstructedAddress,
  matches: testResult.matches
});
```

### Validazione Indirizzo

```typescript
// Verifica validità indirizzo Algorand
const isValid = CidDecoder.isValidAlgorandAddress(address);

if (!isValid) {
  throw new Error('Indirizzo Algorand non valido');
}
```

## 🔧 Tipi e Interfacce

### CidDecodingResult

```typescript
interface CidDecodingResult {
  success: boolean;
  cid?: string;           // CID IPFS generato
  gatewayUrl?: string;    // URL gateway per accesso
  error?: string;         // Messaggio errore
  details?: {
    version: number;      // Versione CID (sempre 1)
    codec: string;        // Codec utilizzato ('raw')
    hashType: string;     // Tipo hash ('sha2-256')
    originalAddress: string; // Indirizzo originale
  };
}
```

### AssetConfigTransaction

```typescript
interface AssetConfigTransaction {
  id: string;
  'round-time': number;
  'asset-config-transaction'?: {
    params?: {
      reserve?: string;   // Reserve address
      manager?: string;   // Manager address
      freeze?: string;    // Freeze address
      clawback?: string;  // Clawback address
    };
  };
}
```

## 🚀 Esempi Avanzati

### Caricamento Metadati con Cache

```typescript
class MetadataService {
  private cache = new Map<string, any>();
  
  async loadMetadataFromReserve(reserveAddress: string): Promise<any> {
    // Controlla cache
    if (this.cache.has(reserveAddress)) {
      return this.cache.get(reserveAddress);
    }
    
    // Decodifica CID
    const cidResult = CidDecoder.decodeReserveAddressToCid(reserveAddress);
    
    if (!cidResult.success) {
      throw new Error(`Decodifica fallita: ${cidResult.error}`);
    }
    
    try {
      // Carica da IPFS
      const response = await fetch(cidResult.gatewayUrl!);
      const metadata = await response.json();
      
      // Salva in cache
      this.cache.set(reserveAddress, metadata);
      
      return metadata;
    } catch (error) {
      throw new Error(`Errore caricamento IPFS: ${error}`);
    }
  }
}
```

### Batch Processing

```typescript
// Processa multiple reserve addresses in parallelo
const processBatchReserves = async (reserveAddresses: string[]) => {
  const results = await Promise.allSettled(
    reserveAddresses.map(async (address) => {
      const cidResult = CidDecoder.decodeReserveAddressToCid(address);
      
      if (cidResult.success) {
        const response = await fetch(cidResult.gatewayUrl!);
        return {
          address,
          cid: cidResult.cid,
          metadata: await response.json()
        };
      }
      
      return {
        address,
        error: cidResult.error
      };
    })
  );
  
  return results.map((result, index) => ({
    address: reserveAddresses[index],
    ...(result.status === 'fulfilled' ? result.value : { error: result.reason })
  }));
};
```

### Hook React per Metadati

```typescript
// Custom hook per caricare metadati da reserve address
const useMetadataFromReserve = (reserveAddress: string) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [cid, setCid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reserveAddress) return;

    const loadMetadata = async () => {
      setLoading(true);
      setError(null);

      try {
        // Decodifica CID
        const cidResult = CidDecoder.decodeReserveAddressToCid(reserveAddress);
        
        if (!cidResult.success) {
          throw new Error(cidResult.error);
        }

        setCid(cidResult.cid!);

        // Carica metadati
        const response = await fetch(cidResult.gatewayUrl!);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setMetadata(data);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [reserveAddress]);

  return { metadata, cid, loading, error };
};
```

## 📊 Performance e Ottimizzazioni

### Caching Strategy

- **Memory Cache**: Risultati decodifica in memoria
- **LocalStorage**: Metadati IPFS persistenti
- **Service Worker**: Cache HTTP per gateway IPFS

### Rate Limiting

```typescript
class RateLimitedDecoder {
  private lastRequest = 0;
  private minInterval = 100; // 100ms tra richieste

  async decodeWithRateLimit(reserveAddress: string): Promise<CidDecodingResult> {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    
    if (elapsed < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - elapsed)
      );
    }
    
    this.lastRequest = Date.now();
    return CidDecoder.decodeReserveAddressToCid(reserveAddress);
  }
}
```

### Batch Optimization

```typescript
// Ottimizza caricamento batch con retry e timeout
const optimizedBatchLoad = async (
  addresses: string[],
  options: {
    timeout?: number;
    maxRetries?: number;
    batchSize?: number;
  } = {}
) => {
  const { timeout = 5000, maxRetries = 3, batchSize = 10 } = options;
  
  // Processa in batch per evitare sovraccarico
  const batches = [];
  for (let i = 0; i < addresses.length; i += batchSize) {
    batches.push(addresses.slice(i, i + batchSize));
  }
  
  const results = [];
  
  for (const batch of batches) {
    const batchResults = await Promise.allSettled(
      batch.map(address => 
        withRetry(
          () => processWithTimeout(address, timeout),
          maxRetries
        )
      )
    );
    
    results.push(...batchResults);
  }
  
  return results;
};
```

## 🔒 Sicurezza

### Validazione Input

```typescript
// Validazione rigorosa input
static validateReserveAddress(address: string): boolean {
  // Controlla formato base
  if (!address || typeof address !== 'string') return false;
  
  // Controlla lunghezza
  if (address.length !== 58) return false;
  
  // Controlla caratteri validi (base32)
  const base32Regex = /^[A-Z2-7]+$/;
  if (!base32Regex.test(address)) return false;
  
  // Testa decodifica
  try {
    decodeAddress(address);
    return true;
  } catch {
    return false;
  }
}
```

### Sanitizzazione Output

```typescript
// Sanitizza output per prevenire XSS
static sanitizeMetadata(metadata: any): any {
  if (typeof metadata === 'string') {
    return metadata.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  if (Array.isArray(metadata)) {
    return metadata.map(item => this.sanitizeMetadata(item));
  }
  
  if (typeof metadata === 'object' && metadata !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(metadata)) {
      sanitized[key] = this.sanitizeMetadata(value);
    }
    return sanitized;
  }
  
  return metadata;
}
```

## 🐛 Troubleshooting

### Errori Comuni

| Errore | Causa | Soluzione |
|--------|-------|-----------|
| `Reserve address vuoto` | Input nullo/vuoto | Verificare input non sia null/undefined |
| `Lunghezza non corretta` | Address non 58 caratteri | Verificare formato indirizzo Algorand |
| `Indirizzo non valido` | Checksum errato | Controllare integrità indirizzo |
| `CID troppo corto` | Decodifica fallita | Verificare implementazione base32 |
| `Gateway timeout` | IPFS non raggiungibile | Provare gateway alternativi |

### Debug Mode

```typescript
// Abilita logging dettagliato
const DEBUG_CID_DECODER = process.env.NODE_ENV === 'development';

static debugLog(message: string, data?: any) {
  if (DEBUG_CID_DECODER) {
    console.log(`[CidDecoder] ${message}`, data);
  }
}
```

---

**CID Decoder per ArtCertify - Implementazione completa ARC-0019** 