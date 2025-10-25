import { config } from '../config/environment';
import { CidDecoder } from './cidDecoder';

export interface IPFSUrlResult {
  success: boolean;
  cid?: string;
  ipfsUrl?: string;
  gatewayUrl?: string;
  error?: string;
}

export class IPFSUrlService {
  /**
   * Converte un hash IPFS in URL gateway usando il gateway configurato
   */
  static getGatewayUrl(hash: string): string {
    if (!hash) return '';
    
    // Rimuovi il prefisso ipfs:// se presente
    const cleanHash = hash.replace('ipfs://', '');
    
    
    // Usa sempre il gateway configurato per consistenza
    const gatewayUrl = config.pinataGateway;
    let url: string;
    
    if (gatewayUrl) {
      url = `https://${gatewayUrl}/ipfs/${cleanHash}`;
    } else {
      // Fallback al gateway pubblico
      url = `https://ipfs.io/ipfs/${cleanHash}`;
    }
    
    return url;
  }

  /**
   * Converte un hash IPFS in URL gateway ottimizzato per la visualizzazione JSON
   */
  static getJsonViewerUrl(hash: string): string {
    if (!hash) return '';
    
    // Rimuovi il prefisso ipfs:// se presente
    const cleanHash = hash.replace('ipfs://', '');
    
    // Usa il gateway configurato con parametri specifici per JSON
    const gatewayUrl = config.pinataGateway;
    let jsonUrl: string;
    
    if (gatewayUrl) {
      // Prova diversi approcci per forzare la visualizzazione JSON
      jsonUrl = `https://${gatewayUrl}/ipfs/${cleanHash}?format=json&view=true&download=false&inline=true&disposition=inline`;
    } else {
      // Fallback al gateway pubblico
      jsonUrl = `https://ipfs.io/ipfs/${cleanHash}?format=json&view=true&download=false&inline=true&disposition=inline`;
    }
    
    return jsonUrl;
  }

  /**
   * Converte un CID IPFS in URL gateway
   */
  static getCidGatewayUrl(cid: string): string {
    if (!cid) return '';
    
    const gatewayUrl = config.pinataGateway;
    if (gatewayUrl) {
      return `https://${gatewayUrl}/ipfs/${cid}`;
    }
    
    return `https://ipfs.io/ipfs/${cid}`;
  }

  /**
   * Decodifica un reserve address e restituisce l'URL gateway
   */
  static getReserveAddressUrl(reserveAddress: string): IPFSUrlResult {
    try {
      if (!reserveAddress) {
        console.error('❌ Reserve address is empty');
        return {
          success: false,
          error: 'Reserve address vuoto'
        };
      }

      const result = CidDecoder.decodeReserveAddressToCid(reserveAddress);
      
      if (result.success && result.cid) {
        const gatewayUrl = this.getGatewayUrl(result.cid);
        
        return {
          success: true,
          cid: result.cid,
          ipfsUrl: `ipfs://${result.cid}`,
          gatewayUrl
        };
      }

      console.error('❌ CID decode failed:', result.error);
      return {
        success: false,
        error: result.error || 'Errore nella decodifica del reserve address'
      };
    } catch (error) {
      return {
        success: false,
        error: `Errore nella decodifica: ${error}`
      };
    }
  }

  /**
   * Converte un hash IPFS in formato ipfs://
   */
  static getIpfsUrl(hash: string): string {
    if (!hash) return '';
    
    // Rimuovi il prefisso ipfs:// se già presente
    const cleanHash = hash.replace('ipfs://', '');
    return `ipfs://${cleanHash}`;
  }

  /**
   * Estrae l'hash da un URL IPFS
   */
  static extractHashFromUrl(url: string): string {
    if (!url) return '';
    
    // Se è già un hash, restituiscilo
    if (!url.includes('/')) {
      return url;
    }
    
    // Se è un URL ipfs://, estrai l'hash
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', '');
    }
    
    // Se è un URL gateway, estrai l'hash
    const match = url.match(/\/ipfs\/([^\/\?]+)/);
    if (match) {
      return match[1];
    }
    
    return url;
  }

  /**
   * Verifica se un URL è valido per IPFS
   */
  static isValidIpfsUrl(url: string): boolean {
    if (!url) return false;
    
    return url.startsWith('ipfs://') || 
           url.includes('/ipfs/') || 
           /^[a-zA-Z0-9]{46,}$/.test(url); // Hash CID base58
  }

  /**
   * Normalizza un URL IPFS in formato standard
   */
  static normalizeIpfsUrl(url: string): { ipfsUrl: string; gatewayUrl: string } {
    const hash = this.extractHashFromUrl(url);
    return {
      ipfsUrl: this.getIpfsUrl(hash),
      gatewayUrl: this.getGatewayUrl(hash)
    };
  }


}
