import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { SPIDReactButton } from '@dej611/spid-react-button';
import SPIDService, { SPID_PROVIDERS } from '../services/spidService';

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

  const handleSPIDLogin = async (providerEntry: any) => {
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.png" alt="ArtCertify Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold text-white">ArtCertify</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-white mb-2">
              Accedi al tuo account
            </h1>
          </div>

          {/* SPID Authentication Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-white mb-3">
              Accesso con Identità Digitale
            </h3>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
              <p className="text-xs text-blue-400 mb-2">
                <strong>Modalità Demo:</strong> L'autenticazione SPID è simulata per scopi dimostrativi.
              </p>
            </div>
            
            {/* SPID Button */}
            <div className="spid-button-container flex justify-center">
              <SPIDReactButton
                url="/auth/spid/{{idp}}"
                supported={supportedProviders}
                lang="it"
                size="md"
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
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">oppure accedi con</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
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
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center"
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
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400 mb-2">
            Accedi con SPID per un'esperienza sicura e integrata,
          </p>
          <p className="text-sm text-slate-400">
            oppure inserisci direttamente l'indirizzo Algorand della tua organizzazione
          </p>
        </div>

        {/* Demo Info */}
        <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">Modalità Demo - Indirizzi di Test:</h4>
          <div className="space-y-1 text-xs text-slate-400">
            <p><strong>Organizzazione Demo:</strong></p>
            <p className="font-mono break-all">KYN4QYQCC3ZCXNBJMT5KAVAF5SUAJBLR7VXTAHPIBJ24HFFLTMMTT33JNM</p>
          </div>
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
      `}</style>
    </div>
  );
}; 