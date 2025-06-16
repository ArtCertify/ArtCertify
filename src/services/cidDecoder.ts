import * as algosdk from 'algosdk';
const { decodeAddress, encodeAddress } = algosdk;

export interface DecodingResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface CidDecodingResult {
  success: boolean;
  cid?: string;
  gatewayUrl?: string;
  error?: string;
  details?: {
    version: number;
    codec: string;
    hashType: string;
    originalAddress: string;
  };
}

export interface AssetConfigTransaction {
  id: string;
  'round-time': number;
  'asset-config-transaction'?: {
    params?: {
      reserve?: string;
      manager?: string;
      freeze?: string;
      clawback?: string;
    };
  };
}

export class CidDecoder {
  

  
  /**
   * Decodifica un reserve address secondo lo standard ARC-0019 per ottenere il CID IPFS
   * Implementa la conversione da address a CID seguendo le specifiche ARC-0019
   */
  static decodeReserveAddressToCid(reserveAddress: string): CidDecodingResult {
    try {
      if (!reserveAddress || reserveAddress.length === 0) {
        return {
          success: false,
          error: 'Reserve address vuoto'
        };
      }

  

      // Verifica se è un indirizzo Algorand valido (58 caratteri)
      if (reserveAddress.length !== 58) {
        return {
          success: false,
          error: 'Reserve address non ha la lunghezza corretta per un indirizzo Algorand (58 caratteri)'
        };
      }

             try {
         // Decodifica l'indirizzo Algorand per ottenere i 32 bytes del digest
         const addressObj = decodeAddress(reserveAddress);
         
         // Secondo ARC-0019, il reserve address contiene il digest SHA-256 (32 bytes)
         // Dobbiamo ricostruire il CID v1 usando:
         // - version: 1 (CID v1)
         // - multicodec: 'raw' (0x55) per Pinata
         // - multihash: sha2-256 (0x12) + length (0x20) + digest (32 bytes)
         
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
        
      } catch (addressError) {
        return {
          success: false,
          error: `Indirizzo Algorand non valido: ${addressError}`
        };
      }
      
    } catch (error) {
      console.error('Error decoding reserve address to CID:', error);
      return {
        success: false,
        error: `Errore nella decodifica: ${error}`
      };
    }
  }

  /**
   * Converte un address Algorand (32 bytes digest) in CID v1
   * Implementa: from_address_to_cid(addr: str) -> str
   */
  private static fromAddressToCid(addressBytes: Uint8Array): string {
    try {
      // 1. Il digest è già nei 32 bytes dell'indirizzo decodificato
      const hashDigest = addressBytes;
      
      // 2. Crea il multihash: hash_type (0x12) + length (0x20) + digest (32 bytes)
      const multihashBytes = new Uint8Array(34); // 2 + 32 bytes
      multihashBytes[0] = 0x12; // sha2-256
      multihashBytes[1] = 0x20; // 32 bytes length
      multihashBytes.set(hashDigest, 2);
      
      // 3. Crea il CID v1: version (1) + codec (0x55 raw) + multihash
      const cidBytes = new Uint8Array(36); // 1 + 1 + 34 bytes
      cidBytes[0] = 0x01; // CID version 1
      cidBytes[1] = 0x55; // raw codec
      cidBytes.set(multihashBytes, 2);
      
      // 4. Codifica in base32 (senza padding)
      const base32Cid = this.encodeBase32(cidBytes);
      
      // 5. Aggiungi il prefixo 'b' per multibase base32
      return 'b' + base32Cid.toLowerCase();
      
    } catch (error) {
      throw new Error(`Errore nella conversione address to CID: ${error}`);
    }
  }

  /**
   * Converte un CID in address Algorand (per test/verifica)
   * Implementa: from_cid_to_address(cid_str: str) -> str
   */
  private static fromCidToAddress(cidStr: string): string {
    try {
      // Rimuovi il prefisso multibase 'b'
      if (!cidStr.startsWith('b')) {
        throw new Error('CID deve iniziare con "b" (base32)');
      }
      
      const base32Part = cidStr.slice(1);
      const cidBytes = this.decodeBase32(base32Part);
      
      // Verifica la struttura del CID
      if (cidBytes.length < 36) {
        throw new Error('CID troppo corto');
      }
      
      if (cidBytes[0] !== 0x01) {
        throw new Error('Solo CID v1 supportato');
      }
      
      if (cidBytes[1] !== 0x55) {
        throw new Error('Solo codec raw supportato');
      }
      
      // Estrai il multihash
      const multihashBytes = cidBytes.slice(2);
      
      if (multihashBytes[0] !== 0x12 || multihashBytes[1] !== 0x20) {
        throw new Error('Solo SHA-256 supportato');
      }
      
             // Estrai il digest (32 bytes)
       const digest = multihashBytes.slice(2, 34);
       
       // Codifica come indirizzo Algorand
       return encodeAddress(new Uint8Array(digest));
      
    } catch (error) {
      throw new Error(`Errore nella conversione CID to address: ${error}`);
    }
  }

  /**
   * Codifica bytes in base32 (RFC 4648)
   */
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

  /**
   * Decodifica base32 in bytes (RFC 4648)
   */
  private static decodeBase32(base32: string): Uint8Array {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const cleanInput = base32.toUpperCase().replace(/=+$/, '');
    
    const bytes: number[] = [];
    let buffer = 0;
    let bitsLeft = 0;
    
    for (const char of cleanInput) {
      const value = alphabet.indexOf(char);
      if (value === -1) {
        throw new Error(`Carattere base32 non valido: ${char}`);
      }
      
      buffer = (buffer << 5) | value;
      bitsLeft += 5;
      
      if (bitsLeft >= 8) {
        bytes.push((buffer >> (bitsLeft - 8)) & 255);
        bitsLeft -= 8;
      }
    }
    
    return new Uint8Array(bytes);
  }

  /**
   * Metodo legacy per compatibilità con il codice esistente
   */
  static decodeReserveAddress(reserveAddress: string): string {
    const result = this.decodeReserveAddressToCid(reserveAddress);
    
    if (result.success) {
      return `CID IPFS v1: ${result.cid}\nURL Gateway: ${result.gatewayUrl}`;
    } else {
      return `Errore decodifica ARC-0019: ${result.error}`;
    }
  }



  /**
   * Valida se una stringa è un indirizzo Algorand valido
   */
  static isValidAlgorandAddress(address: string): boolean {
    try {
      decodeAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Legge ricorsivamente le versioni precedenti dal campo prev_version
   */
  static async readVersionHistory(cid: string): Promise<any[]> {
    // Skip IPFS calls to avoid CORS and timeout errors
    return []; // Return empty array to avoid CORS issues

    const versions: any[] = [];
    let currentCid = cid;
    let depth = 0;
    const maxDepth = 10; // Limite per evitare loop infiniti

    while (currentCid && depth < maxDepth) {
      try {
        const gatewayUrl = `https://${currentCid}.ipfs.dweb.link/`;
        const response = await fetch(gatewayUrl);
        
        if (!response.ok) {
          break;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          break;
        }

        const metadata = await response.json();
        
        // Aggiungi questa versione alla lista
        versions.push({
          cid: currentCid,
          gatewayUrl: gatewayUrl,
          metadata: metadata,
          version: depth + 1
        });

        // Cerca la versione precedente
        const prevVersion = metadata.properties?.prev_version;
        if (prevVersion && typeof prevVersion === 'string') {
          // Estrai il CID dall'URL IPFS
          if (prevVersion.startsWith('ipfs://')) {
            currentCid = prevVersion.replace('ipfs://', '');
          } else {
            currentCid = prevVersion;
          }
        } else {
          // Nessuna versione precedente trovata
          break;
        }

        depth++;
      } catch (error) {
        // Errore nel fetch, interrompi la ricerca
        break;
      }
    }

    return versions;
  }

  /**
   * Estrae informazioni di versioning da una lista di reserve addresses in ordine cronologico
   * Segue l'approccio: reserves = map(lambda t: t['asset-config-transaction']['params']['reserve'], transactions)
   */
  static async extractVersioningFromReserves(reserves: string[], configHistory: AssetConfigTransaction[]): Promise<unknown[]> {
    const versioningPromises = reserves.map(async (reserveAddress, index) => {
      // Find the corresponding transaction for this reserve address
      // Note: API returns camelCase (assetConfigTransaction) not kebab-case (asset-config-transaction)
      const correspondingTxn = configHistory.find((config: any) => 
        config.assetConfigTransaction?.params?.reserve === reserveAddress
      );
      
      const decodingResult = reserveAddress ? this.decodeReserveAddressToCid(reserveAddress) : null;
      
      // Try different possible timestamp field names
      const timestamp = correspondingTxn ? (
        (correspondingTxn as any).roundTime || 
        (correspondingTxn as any)['round-time'] || 
        (correspondingTxn as any).confirmedRound || 
        (correspondingTxn as any)['confirmed-round']
      ) : null;
      
      // Enhanced versioning info with CID details
      const versionInfo = {
        version: index + 1,
        transactionId: correspondingTxn?.id || `unknown-${index}`,
        timestamp: timestamp,
        reserveAddress: reserveAddress || '',
        cidInfo: decodingResult,
        changes: index === 0 ? ['Creazione iniziale'] : this.detectReserveChanges(reserves, index)
      };

      // Add detailed CID information if decoding was successful
      if (decodingResult?.success) {
        // Leggi la storia delle versioni precedenti per questo CID
        let versionHistory: any[] = [];
        try {
          versionHistory = await this.readVersionHistory(decodingResult.cid!);
        } catch (error) {
          // Se fallisce la lettura della storia, continua senza
        }

        return {
          ...versionInfo,
          cid: decodingResult.cid,
          gatewayUrl: decodingResult.gatewayUrl,
          decodedInfo: `CID v1: ${decodingResult.cid}\nGateway: ${decodingResult.gatewayUrl}`,
          cidDetails: decodingResult.details,
          versionHistory: versionHistory
        };
      } else {
        return {
          ...versionInfo,
          decodedInfo: decodingResult?.error || 'Nessuna informazione CID disponibile'
        };
      }
    });

    return Promise.all(versioningPromises);
  }

  /**
   * Estrae informazioni di versioning da una lista di reserve addresses (metodo originale)
   */
  static async extractVersioningInfo(configHistory: AssetConfigTransaction[]): Promise<unknown[]> {
    const versioningPromises = configHistory.map(async (config, index) => {
      const configAny = config as any;
      // Note: API returns camelCase (assetConfigTransaction) not kebab-case (asset-config-transaction)
      const reserveAddress = configAny.assetConfigTransaction?.params?.reserve;
      const decodingResult = reserveAddress ? this.decodeReserveAddressToCid(reserveAddress) : null;
      
      // Try different possible timestamp field names
      const timestamp = configAny.roundTime || configAny['round-time'] || configAny.confirmedRound || configAny['confirmed-round'];
      
      // Enhanced versioning info with CID details
      const versionInfo = {
        version: index + 1,
        transactionId: configAny.id,
        timestamp: timestamp,
        reserveAddress: reserveAddress || '',
        cidInfo: decodingResult,
        changes: this.detectChanges(configHistory, index)
      };

      // Add detailed CID information if decoding was successful
      if (decodingResult?.success) {
        // Leggi la storia delle versioni precedenti per questo CID
        let versionHistory: any[] = [];
        try {
          versionHistory = await this.readVersionHistory(decodingResult.cid!);
        } catch (error) {
          // Se fallisce la lettura della storia, continua senza
        }

        return {
          ...versionInfo,
          cid: decodingResult.cid,
          gatewayUrl: decodingResult.gatewayUrl,
          decodedInfo: `CID v1: ${decodingResult.cid}\nGateway: ${decodingResult.gatewayUrl}`,
          cidDetails: decodingResult.details,
          versionHistory: versionHistory
        };
      } else {
        return {
          ...versionInfo,
          decodedInfo: decodingResult?.error || 'Nessuna informazione CID disponibile'
        };
      }
    });

    return Promise.all(versioningPromises);
  }

  /**
   * Rileva i cambiamenti tra reserve addresses
   */
  private static detectReserveChanges(reserves: string[], currentIndex: number): string[] {
    const changes: string[] = [];
    
    if (currentIndex === 0) {
      changes.push('Creazione iniziale');
      return changes;
    }

    const currentReserve = reserves[currentIndex];
    const previousReserve = reserves[currentIndex - 1];

    if (currentReserve !== previousReserve) {
      changes.push('Reserve address modificato (nuovo CID)');
      
      // Try to decode both to see what changed
      const currentCid = this.decodeReserveAddressToCid(currentReserve);
      const previousCid = this.decodeReserveAddressToCid(previousReserve);
      
      if (currentCid.success && previousCid.success) {
        changes.push(`CID aggiornato: ${previousCid.cid?.substring(0, 10)}... → ${currentCid.cid?.substring(0, 10)}...`);
      } else if (currentCid.success && !previousCid.success) {
        changes.push('CID aggiunto (precedentemente non decodificabile)');
      } else if (!currentCid.success && previousCid.success) {
        changes.push('CID rimosso (ora non decodificabile)');
      }
    } else {
      changes.push('Configurazione aggiornata (stesso reserve address)');
    }

    return changes;
  }

  /**
   * Rileva i cambiamenti tra versioni (metodo originale)
   */
  private static detectChanges(configHistory: AssetConfigTransaction[], currentIndex: number): string[] {
    const changes: string[] = [];
    
    if (currentIndex === 0) {
      changes.push('Creazione iniziale');
      return changes;
    }

    const current = (configHistory[currentIndex] as any)['asset-config-transaction']?.params;
    const previous = (configHistory[currentIndex - 1] as any)['asset-config-transaction']?.params;

    if (!current || !previous) return changes;

    if (current.reserve !== previous.reserve) {
      changes.push('Reserve address modificato (nuovo CID)');
    }

    if (current.manager !== previous.manager) {
      changes.push('Manager modificato');
    }

    if (current.freeze !== previous.freeze) {
      changes.push('Freeze address modificato');
    }

    if (current.clawback !== previous.clawback) {
      changes.push('Clawback address modificato');
    }

    if (changes.length === 0) {
      changes.push('Configurazione aggiornata');
    }

    return changes;
  }

  /**
   * Analizza il contenuto di un reserve address secondo ARC-0019
   */
  static analyzeReserveAddress(reserveAddress: string): {
    type: string;
    content: string;
    details: string[];
  } {
    const details: string[] = [];
    
    if (!reserveAddress) {
      return {
        type: 'empty',
        content: 'Vuoto',
        details: ['Nessun reserve address impostato']
      };
    }

    details.push(`Lunghezza: ${reserveAddress.length} caratteri`);

    // Verifica se è un indirizzo Algorand (potenziale ARC-0019)
    if (reserveAddress.length === 58) {
      if (this.isValidAlgorandAddress(reserveAddress)) {
        const cidResult = this.decodeReserveAddressToCid(reserveAddress);
        
        if (cidResult.success) {
          return {
            type: 'arc19_cid',
            content: cidResult.cid!,
            details: [
              ...details, 
              'Indirizzo Algorand valido (ARC-0019)',
              `CID v1: ${cidResult.cid}`,
              `Gateway URL: ${cidResult.gatewayUrl}`,
              `Codec: ${cidResult.details?.codec}`,
              `Hash: ${cidResult.details?.hashType}`
            ]
          };
        } else {
          return {
            type: 'algorand_address',
            content: reserveAddress,
            details: [...details, 'Indirizzo Algorand valido (non ARC-0019)', `Errore CID: ${cidResult.error}`]
          };
        }
      }
    }

    return {
      type: 'raw',
      content: reserveAddress,
      details: [...details, 'Valore grezzo (non ARC-0019)']
    };
  }

  /**
   * Test della conversione bidirezionale CID <-> Address
   */
  static testConversion(reserveAddress: string): {
    success: boolean;
    originalAddress: string;
    generatedCid: string;
    reconstructedAddress: string;
    matches: boolean;
    error?: string;
  } {
    try {
      const cidResult = this.decodeReserveAddressToCid(reserveAddress);
      
      if (!cidResult.success) {
        return {
          success: false,
          originalAddress: reserveAddress,
          generatedCid: '',
          reconstructedAddress: '',
          matches: false,
          error: cidResult.error
        };
      }
      
      const reconstructedAddress = this.fromCidToAddress(cidResult.cid!);
      const matches = reconstructedAddress === reserveAddress;
      
      return {
        success: true,
        originalAddress: reserveAddress,
        generatedCid: cidResult.cid!,
        reconstructedAddress: reconstructedAddress,
        matches: matches
      };
      
    } catch (error) {
      return {
        success: false,
        originalAddress: reserveAddress,
        generatedCid: '',
        reconstructedAddress: '',
        matches: false,
        error: `Errore nel test: ${error}`
      };
    }
  }
} 