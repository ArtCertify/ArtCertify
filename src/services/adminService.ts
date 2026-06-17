import axios, { type AxiosResponse } from 'axios';
import { config } from '../config/environment';

export interface KeycloakTokenRequest {
  username: string;
  password: string;
}

export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
}

export interface Organization {
  address: string;
  name?: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface CreateOrganizationRequest {
  address: string;
  name?: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

/**
 * Service for handling admin operations
 */
class AdminService {
  private readonly ADMIN_TOKEN_KEY = 'admin_token';
  private readonly ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';

  private getBaseUrl(): string {
    return config.api?.baseUrl || '';
  }

  /**
   * Get admin token from localStorage
   */
  getAdminToken(): string | null {
    return localStorage.getItem(this.ADMIN_TOKEN_KEY);
  }

  /**
   * Save admin token to localStorage
   */
  saveAdminToken(token: string): void {
    localStorage.setItem(this.ADMIN_TOKEN_KEY, token);
  }

  /**
   * Save admin refresh token to localStorage
   */
  saveAdminRefreshToken(token: string): void {
    localStorage.setItem(this.ADMIN_REFRESH_TOKEN_KEY, token);
  }

  /**
   * Clear admin tokens from localStorage
   */
  clearAdminTokens(): void {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_REFRESH_TOKEN_KEY);
  }

  /**
   * Check if admin is authenticated
   */
  isAdminAuthenticated(): boolean {
    return this.getAdminToken() !== null;
  }

  /**
   * Login with Keycloak credentials
   */
  async loginWithKeycloak(username: string, password: string): Promise<KeycloakTokenResponse> {
    const baseUrl = this.getBaseUrl();
    
    if (!baseUrl) {
      throw new Error('API base URL not configured. Please set VITE_API_BASE_URL in your .env file.');
    }

    try {
      const requestBody: KeycloakTokenRequest = {
        username,
        password
      };

      const response: AxiosResponse<KeycloakTokenResponse> = await axios.post(
        `${baseUrl}/api/v1/auth/keycloak/token`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (!response.data?.access_token) {
        throw new Error('Invalid response from server: access_token not found');
      }

      // Save tokens to localStorage
      this.saveAdminToken(response.data.access_token);
      if (response.data.refresh_token) {
        this.saveAdminRefreshToken(response.data.refresh_token);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || error.response.data?.error || error.message;
          
          if (status === 401) {
            throw new Error('Credenziali non valide');
          } else if (status === 400) {
            throw new Error(`Richiesta non valida: ${message}`);
          } else if (status >= 500) {
            throw new Error('Errore del server. Riprova più tardi.');
          } else {
            throw new Error(`Errore di autenticazione: ${message}`);
          }
        } else if (error.request) {
          throw new Error('Impossibile raggiungere il server. Verifica la connessione e riprova.');
        } else {
          throw new Error(`Errore nella richiesta: ${error.message}`);
        }
      }
      
      throw error instanceof Error ? error : new Error('Errore sconosciuto durante l\'autenticazione');
    }
  }

  /**
   * Get all organizations
   */
  async getOrganizations(): Promise<Organization[]> {
    const baseUrl = this.getBaseUrl();
    const token = this.getAdminToken();
    
    if (!baseUrl) {
      throw new Error('API base URL not configured');
    }

    if (!token) {
      throw new Error('Admin token not found. Please login first.');
    }

    try {
      const response: AxiosResponse<Organization[]> = await axios.get(
        `${baseUrl}/api/v1/admin/organizations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          this.clearAdminTokens();
          throw new Error('Sessione scaduta. Effettua nuovamente il login.');
        }
        const message = error.response?.data?.message || error.response?.data?.error || error.message;
        throw new Error(`Errore nel recupero delle organizzazioni: ${message}`);
      }
      throw error instanceof Error ? error : new Error('Errore sconosciuto');
    }
  }

  /**
   * Create a new organization
   */
  async createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
    const baseUrl = this.getBaseUrl();
    const token = this.getAdminToken();
    
    if (!baseUrl) {
      throw new Error('API base URL not configured');
    }

    if (!token) {
      throw new Error('Admin token not found. Please login first.');
    }

    if (!data.address) {
      throw new Error('L\'indirizzo è obbligatorio');
    }

    try {
      const response: AxiosResponse<Organization> = await axios.post(
        `${baseUrl}/api/v1/admin/organizations`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          this.clearAdminTokens();
          throw new Error('Sessione scaduta. Effettua nuovamente il login.');
        }
        const message = error.response?.data?.message || error.response?.data?.error || error.message;
        throw new Error(`Errore nella creazione dell'organizzazione: ${message}`);
      }
      throw error instanceof Error ? error : new Error('Errore sconosciuto');
    }
  }

  /**
   * Delete an organization by address
   */
  async deleteOrganization(address: string): Promise<void> {
    const baseUrl = this.getBaseUrl();
    const token = this.getAdminToken();
    
    if (!baseUrl) {
      throw new Error('API base URL not configured');
    }

    if (!token) {
      throw new Error('Admin token not found. Please login first.');
    }

    if (!address) {
      throw new Error('L\'indirizzo è obbligatorio');
    }

    try {
      await axios.delete(
        `${baseUrl}/api/v1/admin/organizations/${address}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          timeout: 30000,
          validateStatus: (status) => {
            // Accept 204 (No Content) as success
            return status === 204 || status < 500;
          }
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          this.clearAdminTokens();
          throw new Error('Sessione scaduta. Effettua nuovamente il login.');
        }
        if (error.response?.status === 404) {
          throw new Error('Organizzazione non trovata');
        }
        const message = error.response?.data?.message || error.response?.data?.error || error.message;
        throw new Error(`Errore nella cancellazione dell'organizzazione: ${message}`);
      }
      throw error instanceof Error ? error : new Error('Errore sconosciuto');
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();

