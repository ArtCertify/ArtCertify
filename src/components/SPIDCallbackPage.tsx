import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SPIDService, { type SPIDAuthResult, type SPIDUserAttributes } from '../services/spidService';
import LoadingSpinner from './ui/LoadingSpinner';
import BackgroundLayout from './layout/BackgroundLayout';

export const SPIDCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<SPIDUserAttributes | null>(null);
  const [needsAddressLinking, setNeedsAddressLinking] = useState(false);
  const [algorandAddress, setAlgorandAddress] = useState('');

  useEffect(() => {
    handleSPIDCallback();
  }, []);

  const handleSPIDCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Check for OAuth error
      if (error) {
        setError(`Errore SPID: ${error}`);
        setIsProcessing(false);
        return;
      }

      if (!code || !state) {
        setError('Parametri di autenticazione mancanti');
        setIsProcessing(false);
        return;
      }

      // Process SPID callback
      const spidService = SPIDService.getInstance();
      const result: SPIDAuthResult = await spidService.handleSPIDCallback(code, state);

      if (result.success && result.userAttributes) {
        setUserInfo(result.userAttributes);

        // Check if user has an associated Algorand address
        if (result.algorandAddress && result.algorandAddress !== 'DEMO7SPID7ADDRESS7WOULD7BE7GENERATED7OR7MAPPED7HERE777') {
          // User has a linked address, proceed with login
          login(result.algorandAddress);
          navigate('/');
        } else {
          // User needs to link their Algorand address
          setNeedsAddressLinking(true);
        }
      } else {
        setError(result.error || 'Autenticazione SPID fallita');
      }
    } catch (err) {
      console.error('SPID callback error:', err);
      setError('Errore durante l\'elaborazione della risposta SPID');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddressLinking = async () => {
    if (!userInfo || !algorandAddress.trim()) {
      setError('Inserisci un indirizzo Algorand valido');
      return;
    }

    // Basic Algorand address validation
    if (!/^[A-Z2-7]{58}$/.test(algorandAddress.trim())) {
      setError('Indirizzo Algorand non valido. Deve essere di 58 caratteri.');
      return;
    }

    try {
      const spidService = SPIDService.getInstance();
      const success = await spidService.linkAlgorandAddress(
        userInfo.codiceFiscale,
        algorandAddress.trim()
      );

      if (success) {
        // Proceed with login
        login(algorandAddress.trim());
        navigate('/');
      } else {
        setError('Errore durante il collegamento dell\'indirizzo');
      }
    } catch (err) {
      console.error('Address linking error:', err);
      setError('Errore durante il collegamento dell\'indirizzo');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isProcessing) {
    return (
      <BackgroundLayout 
        className="min-h-screen bg-slate-900 flex items-center justify-center px-4"
        backgroundDensity="low"
        backgroundOpacity="subtle"
        fullScreen={true}
      >
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h2 className="text-xl font-semibold text-white mt-4">
            Elaborazione autenticazione SPID...
          </h2>
          <p className="text-slate-400 mt-2">
            Attendere mentre verifichiamo le credenziali
          </p>
        </div>
      </BackgroundLayout>
    );
  }

  if (error) {
    return (
      <BackgroundLayout 
        className="min-h-screen bg-slate-900 flex items-center justify-center px-4"
        backgroundDensity="low"
        backgroundOpacity="subtle"
        fullScreen={true}
      >
        <div className="max-w-md w-full bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Errore di Autenticazione
          </h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={handleBackToLogin}
            className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Torna al Login
          </button>
        </div>
      </BackgroundLayout>
    );
  }

  if (needsAddressLinking && userInfo) {
    return (
      <BackgroundLayout 
        className="min-h-screen bg-slate-900 flex items-center justify-center px-4"
        backgroundDensity="low"
        backgroundOpacity="subtle"
        fullScreen={true}
      >
        <div className="max-w-lg w-full bg-slate-800 rounded-xl border border-slate-700 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Autenticazione SPID Completata
            </h2>
            <p className="text-slate-400 mb-4">
              Benvenuto, <strong className="text-white">{userInfo.nome} {userInfo.cognome}</strong>
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-white mb-2">Informazioni Utente:</h3>
            <div className="space-y-1 text-sm text-slate-300">
              <p><span className="text-slate-400">Codice Fiscale:</span> {userInfo.codiceFiscale}</p>
              {userInfo.email && <p><span className="text-slate-400">Email:</span> {userInfo.email}</p>}
              {userInfo.organizzazione && (
                <p><span className="text-slate-400">Organizzazione:</span> {userInfo.organizzazione}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Collega il tuo Indirizzo Algorand
              </label>
              <p className="text-sm text-slate-400 mb-3">
                Per accedere alla piattaforma, devi collegare la tua identità SPID 
                con un indirizzo Algorand dell'organizzazione.
              </p>
              <input
                type="text"
                placeholder="Inserisci l'indirizzo Algorand della tua organizzazione"
                value={algorandAddress}
                onChange={(e) => setAlgorandAddress(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBackToLogin}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleAddressLinking}
                disabled={!algorandAddress.trim()}
                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Collega e Accedi
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400">
              <strong>Nota:</strong> Il collegamento tra identità SPID e indirizzo Algorand 
              è necessario per garantire la sicurezza e tracciabilità delle operazioni sulla blockchain.
            </p>
          </div>
        </div>
      </BackgroundLayout>
    );
  }

  return null;
}; 