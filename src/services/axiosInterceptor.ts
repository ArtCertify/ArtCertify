import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';

/**
 * Trigger logout when JWT token is invalid
 */
const triggerLogout = () => {
  console.log('[Axios Interceptor] 🚪 Dispatch evento jwtTokenInvalid per triggerare logout');
  // Dispatch event to notify AuthContext to perform logout
  window.dispatchEvent(new CustomEvent('jwtTokenInvalid', {
    detail: { message: 'Il token JWT non è valido. Esecuzione del logout.' }
  }));
};

/**
 * Setup axios interceptor to handle JWT token validation
 * This interceptor:
 * 1. Validates token before requests - triggers logout if invalid
 * 2. Handles 401 errors by triggering logout
 */
export const setupAxiosInterceptor = () => {
  // Request interceptor: Validate token before requests
  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Only validate token for requests to our API
      const baseUrl = config.baseURL || '';
      const url = config.url || '';
      const isApiRequest = baseUrl.includes('/api/') || url.includes('/api/');

      if (isApiRequest) {
        console.log(`[Axios Interceptor] Verifica token prima della richiesta: ${config.method?.toUpperCase()} ${url}`);
        
        // First, quick client-side check
        const isValidLocal = authService.isTokenValid();
        if (!isValidLocal) {
          // Token is invalid locally, trigger logout
          console.error('[Axios Interceptor] ❌ Token non valido (controllo locale), trigger logout e rifiuto richiesta');
          triggerLogout();
          // Reject the request
          return Promise.reject(new Error('JWT token non valido'));
        }

        // Get token and add to request
        // Note: Server will validate token and return 401 if invalid
        const token = authService.getToken();
        if (token) {
          console.log('[Axios Interceptor] ✅ Token valido localmente, aggiunto header Authorization alla richiesta');
          console.log('[Axios Interceptor] ⚠️ Il server validerà il token e restituirà 401 se non valido');
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          // No token available, trigger logout
          console.error('[Axios Interceptor] ❌ Token non trovato, trigger logout');
          triggerLogout();
          return Promise.reject(new Error('Token JWT non trovato'));
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor: Handle 401 errors by triggering logout
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Only handle 401 errors for API requests
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        // Check if this is an API request
        const baseUrl = originalRequest.baseURL || '';
        const url = originalRequest.url || '';
        const isApiRequest = baseUrl.includes('/api/') || url.includes('/api/');

        if (isApiRequest) {
          console.error(`[Axios Interceptor] ❌ Ricevuto errore 401 (Unauthorized) per ${originalRequest.url}`);
          console.log('[Axios Interceptor] Token rifiutato dal server, trigger logout');
          
          // Mark request as retried to prevent infinite loops
          originalRequest._retry = true;
          
          // Clear invalid token
          authService.clearToken();
          
          // Trigger logout
          triggerLogout();
        }
      }

      // Reject the error normally
      return Promise.reject(error);
    }
  );
};

