import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { usePeraWallet } from '../hooks/usePeraWallet';
import BackgroundLayout from './layout/BackgroundLayout';
import { WalletSignatureModal } from './modals/WalletSignatureModal';

interface LoginPageProps {
  onLogin: (address: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const {
    isConnected,
    isConnecting,
    accountAddress,
    platform,
    connect,
    error
  } = usePeraWallet();
  
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const hasCheckedSignature = useRef(false);
  const hasNavigated = useRef(false);

  // Check if wallet has already signed when connected
  useEffect(() => {
    if (isConnected && accountAddress && !hasCheckedSignature.current) {
      hasCheckedSignature.current = true;
      
      // Check if user has already signed for this wallet
      const hasSigned = localStorage.getItem(`wallet_signature_${accountAddress}`) === 'true';
      
      if (!hasSigned) {
        // Show signature modal
        setShowSignatureModal(true);
      } else {
        // Already signed, proceed with login
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          onLogin(accountAddress);
          navigate('/');
        }
      }
    }
  }, [isConnected, accountAddress, onLogin, navigate]);

  // Handle signature modal close
  const handleSignatureModalClose = () => {
    setShowSignatureModal(false);
    // Proceed with login after modal is closed (whether signed or not)
    if (accountAddress && !hasNavigated.current) {
      hasNavigated.current = true;
      onLogin(accountAddress);
      navigate('/');
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      // Connection error handled by usePeraWallet hook
    }
  };

  return (
    <BackgroundLayout 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center px-4"
      backgroundDensity="low"
      backgroundOpacity="subtle"
      fullScreen={true}
    >
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/logo.png" alt="ArtCertify Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold text-white">ArtCertify</span>
          </div>
          <p className="text-slate-300 text-sm">
            Certificazione blockchain per documenti e artefatti culturali
          </p>
        </div>

        {/* Pera Connect Card */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-white mb-2">
              Connetti il tuo Wallet
            </h1>
            <p className="text-slate-400 text-sm">
              Utilizza Pera Wallet per accedere alla piattaforma di certificazione
            </p>
          </div>

          {/* Connection Button */}
          <div className="mb-6">
            <button
              onClick={handleConnect}
              disabled={isConnecting || isConnected}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-800 disabled:to-blue-900 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connessione in corso...</span>
                </>
              ) : isConnected ? (
                <>
                  <WalletIcon className="w-5 h-5" />
                  <span>Wallet Connesso</span>
                </>
              ) : (
                <>
                  <WalletIcon className="w-5 h-5" />
                  <span>Connetti Pera Wallet</span>
                </>
              )}
            </button>
          </div>

          {/* Connection Status */}
          {isConnected && accountAddress && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium text-sm">Wallet Connesso</span>
              </div>
              <p className="text-slate-300 text-xs font-mono">
                {accountAddress}
              </p>
              {platform && (
                <p className="text-slate-400 text-xs mt-1">
                  Piattaforma: {platform === 'mobile' ? 'Mobile' : 'Desktop'}
                </p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* How to Connect */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-white font-medium mb-4 text-center">Come connettere:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <DevicePhoneMobileIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Mobile</p>
                  <p className="text-slate-400 text-xs">
                    Scansiona il QR code con l'app Pera Wallet per connettere il tuo wallet mobile
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <ComputerDesktopIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Desktop</p>
                  <p className="text-slate-400 text-xs">
                    Connessione diretta se hai Pera Wallet Desktop installato
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Download Links */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-slate-400 text-xs text-center mb-3">
              Non hai ancora Pera Wallet?
            </p>
            <div className="flex gap-2 justify-center">
              <a
                href="https://perawallet.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs underline"
              >
                Scarica per iOS/Android
              </a>
              <span className="text-slate-500 text-xs">•</span>
              <a
                href="https://perawallet.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs underline"
              >
                Desktop App
              </a>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-xs">
            Pera Wallet è il metodo sicuro per gestire i tuoi asset Algorand
          </p>
        </div>
      </div>

      {/* Wallet Signature Modal */}
      {accountAddress && (
        <WalletSignatureModal
          isOpen={showSignatureModal}
          onClose={handleSignatureModalClose}
          walletAddress={accountAddress}
        />
      )}
    </BackgroundLayout>
  );
}; 