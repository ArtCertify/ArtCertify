import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { SPIDReactButton } from '@dej611/spid-react-button';
import SPIDService, { SPID_PROVIDERS } from '../services/spidService';
import * as algosdk from 'algosdk';

// Import SPID button styles
import '@dej611/spid-react-button/dist/index.css';

interface LoginPageProps {
  onLogin: (address: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [address, setAddress] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateAlgorandAddress = (addr: string): boolean => {
    // Basic Algorand address validation (58 characters, base32)
    const algorandAddressRegex = /^[A-Z2-7]{58}$/;
    return algorandAddressRegex.test(addr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!address.trim()) {
      setError('Inserisci l\'indirizzo della tua organizzazione');
      return;
    }

    if (!validateAlgorandAddress(address.trim())) {
      setError('Indirizzo Algorand non valido. Deve essere di 58 caratteri.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call to validate address
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onLogin(address.trim());
      navigate('/');
    } catch {
      setError('Errore durante l\'accesso. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnvLogin = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get mnemonic from environment variables
      const mnemonic = import.meta.env.VITE_PRIVATE_KEY_MNEMONIC;
      
      if (!mnemonic) {
        setError('Mnemonic non configurata nel file .env. Aggiungi VITE_PRIVATE_KEY_MNEMONIC.');
        return;
      }

      // Derive address from mnemonic
      const account = algosdk.mnemonicToSecretKey(mnemonic);
      const algorandAddress = account.addr.toString();

      console.log('Login with .env private key:', algorandAddress);

      // Login with derived address
      onLogin(algorandAddress);
      navigate('/');
    } catch (error) {
      console.error('Error with .env login:', error);
      setError('Errore nella derivazione dell\'indirizzo dalla mnemonic .env');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSPIDLogin = async (providerEntry: { entityID: string; entityName: string }) => {
    try {
      setIsLoading(true);
      setError('');
      
      const spidService = SPIDService.getInstance();
      const authURL = await spidService.initiateSPIDLogin(providerEntry.entityID);
      
      // In a real implementation, this would redirect to the SPID provider
      // For demo purposes, we simulate the flow
      console.log('Redirecting to SPID provider:', authURL);
      
      // Simulate successful SPID authentication after a delay
      setTimeout(async () => {
        try {
          // Simulate the callback with demo data
          const mockCode = 'demo_auth_code_12345';
          const mockState = 'demo_state_67890';
          
          const result = await spidService.handleSPIDCallback(mockCode, mockState);
          
          if (result.success && result.algorandAddress) {
            onLogin(result.algorandAddress);
            navigate('/');
          } else {
            // Navigate to callback page to handle address linking
            navigate(`/auth/spid/callback?code=${mockCode}&state=${mockState}`);
          }
        } catch (error) {
          console.error('SPID demo error:', error);
          setError('Errore durante l\'autenticazione SPID');
        } finally {
          setIsLoading(false);
        }
      }, 2000);
      
    } catch (error) {
      console.error('SPID login error:', error);
      setError('Errore durante l\'inizializzazione SPID');
      setIsLoading(false);
    }
  };

  // Get supported providers for SPID button
  const supportedProviders = SPID_PROVIDERS.map(provider => provider.entityID);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo.png" alt="ArtCertify Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-white">ArtCertify</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="text-center mb-5">
            <h1 className="text-lg font-semibold text-white mb-1">
              Accedi al tuo account
            </h1>
          </div>

          {/* SPID Authentication Section */}
          <div className="mb-5">
            <h3 className="text-sm font-medium text-white mb-2">
              Accesso con Identità Digitale
            </h3>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-3">
              <p className="text-xs text-blue-400">
                <strong>Modalità Demo:</strong> L'autenticazione SPID è simulata per scopi dimostrativi.
              </p>
            </div>
            
            {/* SPID Button */}
            <div className="spid-button-container flex justify-center">
              <SPIDReactButton
                url="/auth/spid/{{idp}}"
                supported={supportedProviders}
                lang="it"
                size="sm"
                theme="negative"
                type="modal"
                fluid={false}
                onProviderClicked={(providerEntry, _loginURL, event) => {
                  event.preventDefault();
                  handleSPIDLogin(providerEntry);
                }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">oppure accedi con</span>
            </div>
          </div>

          {/* ENV Private Key Login */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleEnvLogin}
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center mb-3"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              🔑 .env p.key
            </button>
            <p className="text-xs text-slate-400 text-center">
              Accedi usando la mnemonic configurata nel file .env
            </p>
          </div>

          {/* Second Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">o inserisci manualmente</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Indirizzo Algorand Organizzazione
              </label>
              <div className="relative">
                <input
                  type={showAddress ? 'text' : 'password'}
                  placeholder="Inserisci l'indirizzo Algorand della tua organizzazione"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowAddress(!showAddress)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showAddress ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-1.5 text-sm text-red-400">{error}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Accesso in corso...
                </>
              ) : (
                'Accedi con Indirizzo'
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Password dimenticata?
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400 mb-1">
            Accedi con SPID per un'esperienza sicura e integrata,
          </p>
          <p className="text-sm text-slate-400">
            oppure inserisci direttamente l'indirizzo Algorand della tua organizzazione
          </p>
        </div>
      </div>

      {/* Custom CSS for SPID button */}
      <style>{`
        .spid-button-container {
          --spid-button-background: #1e293b;
          --spid-button-color: #f1f5f9;
          --spid-button-background-hover: #334155;
          --spid-button-background-active: #475569;
          --spid-button-color-active: #ffffff;
          --spid-button-scale: 1;
        }
        
        .spid-button-container .spid-button {
          margin: 0 auto;
          display: block;
        }
        
        /* Stili per rendere il modale SPID più compatto */
        .spid-modal {
          max-width: 500px !important;
          width: 90vw !important;
        }
        
        .spid-modal .spid-modal-content {
          padding: 1rem !important;
          max-height: 70vh !important;
          overflow-y: auto;
        }
        
        .spid-modal .spid-providers {
          gap: 0.5rem !important;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
        }
        
        .spid-modal .spid-provider {
          padding: 0.5rem !important;
          min-height: 60px !important;
        }
        
        .spid-modal .spid-provider img {
          max-height: 40px !important;
          max-width: 100px !important;
        }
        
        .spid-modal .spid-header {
          padding: 1rem !important;
          font-size: 1.1rem !important;
        }
        
        .spid-modal .spid-footer {
          padding: 0.75rem 1rem !important;
          font-size: 0.85rem !important;
        }
        
        /* Riduce lo spacing nel modale */
        .spid-modal h2 {
          margin-bottom: 0.75rem !important;
          font-size: 1.25rem !important;
        }
        
        /* Overlay più trasparente */
        .spid-modal-overlay {
          background-color: rgba(0, 0, 0, 0.6) !important;
        }
        
        /* Icona dell'omino in basso a destra più piccola e visibile */
        .spid-modal .spid-info-icon,
        .spid-modal .spid-avatar,
        .spid-modal .spid-help-icon {
          width: 40px !important;
          height: 40px !important;
          bottom: 20px !important;
          right: 20px !important;
          opacity: 0.8 !important;
          z-index: 9999 !important;
        }
        
        /* Assicura che l'icona sia visibile su tutti gli schermi */
        .spid-modal .spid-info-icon img,
        .spid-modal .spid-avatar img,
        .spid-modal .spid-help-icon img {
          max-width: 32px !important;
          max-height: 32px !important;
        }
        
                 /* Per schermi più grandi, posiziona meglio l'icona */
        @media (min-width: 768px) {
          .spid-modal .spid-info-icon,
          .spid-modal .spid-avatar,
          .spid-modal .spid-help-icon {
            bottom: 30px !important;
            right: 30px !important;
            width: 35px !important;
            height: 35px !important;
          }
          
          .spid-modal .spid-info-icon img,
          .spid-modal .spid-avatar img,
          .spid-modal .spid-help-icon img {
            max-width: 28px !important;
            max-height: 28px !important;
          }
        }
        
        /* Opzione alternativa: nascondere completamente l'icona se crea problemi */
        /*
        .spid-modal .spid-info-icon,
        .spid-modal .spid-avatar,
        .spid-modal .spid-help-icon {
          display: none !important;
        }
        */
      `}</style>
    </div>
  );
}; 