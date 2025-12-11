import axios, { type AxiosResponse } from 'axios';
import { config } from '../config/environment';

export interface AlgorandAuthRequest {
  address: string;
  signedTxnBase64: string;
}

export interface AlgorandAuthResponse {
  token: string;
  // Add other fields if the backend returns more data
}

/**
 * Service for handling authentication with the backend API
 */
class AuthService {
  private getBaseUrl(): string {
    // Get base URL from config, fallback to empty string if not set
    return config.api?.baseUrl || '';
  }

  /**
   * Authenticate with Algorand wallet signature
   * Sends the signed transaction to the backend to receive a JWT token
   */
  async authenticateWithAlgorand(
    address: string,
    signedTxnBase64: string
  ): Promise<string> {
    const baseUrl = this.getBaseUrl();
    
    if (!baseUrl) {
      throw new Error('API base URL not configured. Please set VITE_API_BASE_URL in your .env file.');
    }

    try {
      const requestBody: AlgorandAuthRequest = {
        address,
        signedTxnBase64
      };

      const response: AxiosResponse<AlgorandAuthResponse> = await axios.post(
        `${baseUrl}/api/v1/auth/algorand`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (!response.data?.token) {
        throw new Error('Invalid response from server: token not found');
      }

      return response.data.token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const message = error.response.data?.message || error.response.data?.error || error.message;
          
          if (status === 401) {
            throw new Error('Autenticazione fallita: la firma della transazione non è valida');
          } else if (status === 400) {
            throw new Error(`Richiesta non valida: ${message}`);
          } else if (status >= 500) {
            throw new Error('Errore del server. Riprova più tardi.');
          } else {
            throw new Error(`Errore di autenticazione: ${message}`);
          }
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('Impossibile raggiungere il server. Verifica la connessione e riprova.');
        } else {
          // Error setting up the request
          throw new Error(`Errore nella richiesta: ${error.message}`);
        }
      }
      
      // Non-Axios error
      throw error instanceof Error ? error : new Error('Errore sconosciuto durante l\'autenticazione');
    }
  }

  /**
   * Save JWT token to localStorage
   */
  saveToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  /**
   * Remove JWT token from localStorage
   */
  clearToken(): void {
    localStorage.removeItem('jwt_token');
  }

  /**
   * Check if a token exists
   */
  hasToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Decode JWT token payload (without verification)
   * JWT format: header.payload.signature
   */
  private decodeTokenPayload(token: string): any | null {
    try {
      // Split token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode payload (second part)
      const payload = parts[1];
      
      // Replace URL-safe base64 characters
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      
      // Add padding if needed
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      
      // Decode base64
      const decoded = atob(padded);
      
      // Parse JSON
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  /**
   * Validate token with server by making a lightweight request to presigned URL endpoint
   * This is the most reliable way to check if token is actually valid on the server
   * @returns Promise<boolean> true if token is valid, false otherwise
   */
  async validateTokenWithServer(): Promise<boolean> {
    const token = this.getToken();
    const baseUrl = this.getBaseUrl();
    
    if (!token) {
      console.warn('[JWT Server Validation] ❌ Token non trovato');
      return false;
    }

    if (!baseUrl) {
      console.warn('[JWT Server Validation] ❌ Base URL non configurata, impossibile validare con server');
      return false;
    }

    try {
      const validationUrl = `${baseUrl}/api/v1/presigned/upload?filename=__token_validation_check__`;
      console.log('[JWT Server Validation] Verifica token con server (GET presigned URL)...');
      console.log(`[JWT Server Validation] URL richiesta: ${validationUrl}`);
      
      // Make a lightweight request to presigned URL endpoint to validate token
      // Using a dummy filename that won't actually be used
      const response = await axios.get(
        validationUrl,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/plain'
          },
          timeout: 5000, // Short timeout for validation check
          validateStatus: (status) => {
            // Consider 200-299 and 400 (bad request but token is valid) as success
            // 401 means token is invalid
            return status < 500;
          }
        }
      );

      // If we get 401, token is invalid
      if (response.status === 401) {
        console.warn('[JWT Server Validation] ❌ Server ha rifiutato il token (401 Unauthorized)');
        return false;
      }

      // If we get 200 or 400 (bad request but token validated), token is valid
      const presignedUrl = response.data;
      console.log(`[JWT Server Validation] ✅ Token valido (status: ${response.status})`);
      console.log(`[JWT Server Validation] 📋 Presigned URL ricevuto: ${presignedUrl}`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.warn('[JWT Server Validation] ❌ Token non valido (401 Unauthorized)');
          return false;
        }
        // Network error or other error - don't invalidate token based on network issues
        console.warn('[JWT Server Validation] ⚠️ Errore durante validazione server:', error.message);
        console.log('[JWT Server Validation] ⚠️ Considero token valido (errore di rete, non di autenticazione)');
        // Return true to avoid false positives from network errors
        return true;
      }
      
      console.warn('[JWT Server Validation] ⚠️ Errore sconosciuto durante validazione:', error);
      // Return true to avoid false positives
      return true;
    }
  }

  /**
   * Check if JWT token is valid by reading exp field from JWT payload
   * The exp field is set by backend when generating JWT (86400 seconds = 1 day)
   * @returns true if token is valid (not expired), false otherwise
   */
  isTokenValid(): boolean {
    console.log('[JWT Validation] Inizio verifica validità token JWT (lettura campo exp)');
    const token = this.getToken();
    
    // Check if token exists
    if (!token) {
      console.warn('[JWT Validation] ❌ Token non trovato in localStorage');
      return false;
    }

    console.log('[JWT Validation] Token trovato, decodifica payload per leggere campo exp...');

    // Decode token payload
    const payload = this.decodeTokenPayload(token);
    if (!payload) {
      console.error('[JWT Validation] ❌ Impossibile decodificare il payload del token (formato non valido)');
      return false;
    }

    console.log('[JWT Validation] Payload decodificato con successo');

    // Check expiration (exp is in seconds since epoch)
    // IMPORTANTE: La scadenza viene inserita dal backend quando genera il JWT durante il login
    // Durata token: 86400 secondi = 1 giorno (impostata dal backend)
    // Il campo 'exp' è un timestamp Unix (in secondi) che indica quando il token scade
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Calculate time remaining in different units
      const daysUntilExpiration = Math.floor(timeUntilExpiration / (1000 * 60 * 60 * 24));
      const hoursUntilExpiration = Math.floor((timeUntilExpiration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesUntilExpiration = Math.floor((timeUntilExpiration % (1000 * 60 * 60)) / (1000 * 60));
      const secondsUntilExpiration = Math.floor((timeUntilExpiration % (1000 * 60)) / 1000);
      
      // Format expire time
      const expireDate = new Date(expirationTime);
      const expireTimeFormatted = expireDate.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
      
      // Format time remaining
      let timeRemainingFormatted = '';
      if (daysUntilExpiration > 0) {
        timeRemainingFormatted = `${daysUntilExpiration} giorno/i, ${hoursUntilExpiration} ora/e, ${minutesUntilExpiration} minuto/i`;
      } else if (hoursUntilExpiration > 0) {
        timeRemainingFormatted = `${hoursUntilExpiration} ora/e, ${minutesUntilExpiration} minuto/i, ${secondsUntilExpiration} secondo/i`;
      } else if (minutesUntilExpiration > 0) {
        timeRemainingFormatted = `${minutesUntilExpiration} minuto/i, ${secondsUntilExpiration} secondo/i`;
      } else {
        timeRemainingFormatted = `${secondsUntilExpiration} secondo/i`;
      }
      
      console.log(`[JWT Validation] 📅 Campo exp (timestamp Unix): ${payload.exp}`);
      console.log(`[JWT Validation] ⏰ Expire time: ${expireTimeFormatted}`);
      console.log(`[JWT Validation] ⏳ Tempo rimanente: ${timeRemainingFormatted}`);
      console.log(`[JWT Validation] 📊 Durata token impostata dal backend: 86400 secondi (1 giorno)`);
      
      // Token is expired if current time is greater than expiration time
      // Add a small buffer (5 seconds) to account for clock skew
      if (currentTime >= expirationTime - 5000) {
        console.warn(`[JWT Validation] ❌ Token scaduto!`);
        console.warn(`[JWT Validation] ❌ Expire time era: ${expireTimeFormatted}`);
        console.warn(`[JWT Validation] ❌ Ora corrente: ${new Date(currentTime).toLocaleString('it-IT')}`);
        return false;
      }
    } else {
      console.warn('[JWT Validation] ⚠️ Token senza campo exp (expiration), considerato valido ma potrebbe essere un problema');
    }

    // Token is valid (not expired according to exp field)
    console.log('[JWT Validation] ✅ Token valido (campo exp nel JWT indica che non è scaduto)');
    return true;
  }

  /**
   * Clear all authentication data including JWT, wallet signatures, cache, cookies, and sessionStorage
   * This should be called on logout or when connecting a new wallet
   * @param previousAddress Optional previous wallet address to clear signature data for
   */
  clearAllAuthData(previousAddress?: string | null): void {
    try {
      // Clear JWT token
      this.clearToken();

      // Clear wallet signature data for previous address (if provided) or all addresses
      if (previousAddress) {
        localStorage.removeItem(`wallet_signature_${previousAddress}`);
        localStorage.removeItem(`wallet_signature_base64_${previousAddress}`);
        localStorage.removeItem(`wallet_signature_tx_${previousAddress}`);
      } else {
        // Clear all wallet signature data (iterate through localStorage keys)
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith('wallet_signature_') ||
            key.startsWith('wallet_signature_base64_') ||
            key.startsWith('wallet_signature_tx_')
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }

      // Clear projects cache
      localStorage.removeItem('artcertify_projects_cache');

      // Clear wallet connection data
      localStorage.removeItem('algorand_address');
      localStorage.removeItem('pera_wallet_connected');
      localStorage.removeItem('pera_wallet_account');

      // Clear SPID session data
      sessionStorage.removeItem('spid_auth_state');
      localStorage.removeItem('spid_user_session');

      // Clear all cookies
      document.cookie.split(';').forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        // Clear cookie for current domain and all paths
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        // Also try to clear for parent domain
        const hostnameParts = window.location.hostname.split('.');
        if (hostnameParts.length > 1) {
          const parentDomain = '.' + hostnameParts.slice(-2).join('.');
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${parentDomain}`;
        }
      });
    } catch (error) {
      console.error('Error clearing authentication data:', error);
      // Continue anyway - try to clear as much as possible
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

