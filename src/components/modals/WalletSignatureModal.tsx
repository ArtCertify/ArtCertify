import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useTransactionSigning } from '../../hooks/useTransactionSigning';
import { authService } from '../../services/authService';
import { TermsAndConditions } from './TermsAndConditions';
import { CheckCircleIcon, ExclamationCircleIcon, ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface WalletSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
}

export const WalletSignatureModal: React.FC<WalletSignatureModalProps> = ({
  isOpen,
  onClose,
  walletAddress
}) => {
  const { signAuthTransaction, isSigning, error: signingError } = useTransactionSigning();
  const [isSigned, setIsSigned] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [signedTxBase64, setSignedTxBase64] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Reset all state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsSigned(false);
      setTxId(null);
      setSignedTxBase64(null);
      setCopied(false);
      setAcceptedTerms(false);
      setError(null);
      setIsAuthenticating(false);
    }
  }, [isOpen]);

  // Helper function to parse and format error messages
  const formatErrorMessage = (error: unknown): string => {
    if (!(error instanceof Error)) {
      return 'Errore durante la firma della transazione';
    }

    const errorMessage = error.message;

    // Check for user rejection
    if (errorMessage.includes('User rejected') || errorMessage.includes('rejected')) {
      return 'Firma della transazione annullata dall\'utente.';
    }

    // Check for network errors
    if (errorMessage.includes('Network request error') || errorMessage.includes('status 400')) {
      return 'Errore di rete durante la firma della transazione. Verifica la connessione e riprova.';
    }

    // Return a simplified version of the error message
    if (errorMessage.length > 200) {
      return 'Errore durante la firma della transazione. Riprova.';
    }

    return errorMessage;
  };

  const handleSign = async () => {
    if (!acceptedTerms) {
      setError('È necessario accettare i Termini e Condizioni per procedere');
      return;
    }

    try {
      setError(null);
      
      // Firma la transazione di autenticazione (Payment 0 Algo con nota JSON)
      // La transazione contiene domain, nonce, timestamp, expirySeconds nella nota
      // La transazione è gratuita (0 Algo, self transaction) e viene codificata in base64 (msgpack)
      const result = await signAuthTransaction();

      if (result.txId && result.signedTxBase64) {
        setTxId(result.txId);
        setSignedTxBase64(result.signedTxBase64);
        
        // Salva in localStorage che l'utente ha firmato
        if (walletAddress) {
          localStorage.setItem(`wallet_signature_${walletAddress}`, 'true');
          localStorage.setItem(`wallet_signature_tx_${walletAddress}`, result.txId);
          localStorage.setItem(`wallet_signature_base64_${walletAddress}`, result.signedTxBase64);
        }
        
        // Try to authenticate with backend to get JWT token
        setIsAuthenticating(true);
        try {
          if (!walletAddress) {
            throw new Error('Wallet address non disponibile');
          }
          const jwtToken = await authService.authenticateWithAlgorand(
            walletAddress,
            result.signedTxBase64
          );
          
          // Save JWT token to localStorage (overwrites previous token if exists)
          authService.saveToken(jwtToken);
          
          // Verify token is valid after saving
          const isTokenValid = authService.isTokenValid();
          
          // Dispatch event to notify AuthContext that token is now valid
          window.dispatchEvent(new CustomEvent('jwtTokenUpdated', {
            detail: { isValid: isTokenValid, token: jwtToken }
          }));
          
          setIsSigned(true);
        } catch (authError) {
          // If authentication fails, still mark as signed (message is signed)
          // but show error message
          setIsSigned(true);
          const authErrorMessage = authError instanceof Error ? authError.message : 'Errore durante l\'autenticazione con il server';
          setError(`Transazione firmata con successo, ma l'autenticazione con il server è fallita: ${authErrorMessage}`);
          // Authentication error - handled by error state
        } finally {
          setIsAuthenticating(false);
        }
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('walletSignatureUpdated'));
      }
    } catch (err) {
      // Format error message - this will be shown instead of signingError from hook
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    // Se l'utente ha firmato, chiudi il modale
    if (isSigned) {
      onClose();
    } else {
      // Altrimenti, chiudi comunque ma senza salvare la firma
      onClose();
    }
  };

  const handleCopyBase64 = async () => {
    if (signedTxBase64) {
      try {
        await navigator.clipboard.writeText(signedTxBase64);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Failed to copy - ignore
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Conferma Proprietà Wallet"
      size="lg"
      closeOnOverlayClick={!isSigning}
    >
      <div className="space-y-4">
        {!isSigned ? (
          <>
            <div className="text-center">
              <p className="text-slate-300 text-sm mb-4">
                Per completare la connessione, conferma di essere il proprietario del wallet firmando una transazione di autenticazione.
              </p>
              {walletAddress && (
                <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-slate-400 mb-2">Indirizzo Wallet:</p>
                  <p className="text-sm font-mono text-slate-200 break-all">
                    {walletAddress}
                  </p>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            {walletAddress && <TermsAndConditions walletAddress={walletAddress} />}

            {/* Checkbox accettazione T&C */}
            <div className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={isSigning}
                className="mt-0.5 w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="accept-terms" className="text-xs text-slate-300 cursor-pointer flex-1">
                Dichiaro di aver letto, compreso e accettato integralmente i <span className="font-semibold text-white">Termini e Condizioni</span> sopra indicati. 
                Accetto che i dati vengano pubblicati on-chain e su IPFS pubblicamente, e che i metadati dei file vengano archiviati su database centralizzato. 
                {walletAddress && (
                  <>Confermo di essere il legittimo proprietario del wallet {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 8)}.</>
                )}
              </label>
            </div>

            {(error || signingError) && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-400 text-sm font-medium">Errore</p>
                  <p className="text-red-300 text-xs mt-1">
                    {/* Prefer local error (already formatted), otherwise format signingError from hook */}
                    {error || (signingError ? formatErrorMessage(new Error(signingError)) : '')}
                  </p>
                </div>
              </div>
            )}

            {isAuthenticating && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                <p className="text-blue-400 text-sm">
                  Autenticazione con il server in corso...
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSigning}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                variant="primary"
                onClick={handleSign}
                loading={isSigning || isAuthenticating}
                disabled={isSigning || isAuthenticating || !acceptedTerms}
                className="flex-1"
              >
                {isAuthenticating ? 'Autenticazione...' : 'SIGN'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircleIcon className="w-16 h-16 text-green-400" />
              </div>
              <p className="text-green-400 font-medium mb-2">
                Transazione firmata con successo!
              </p>
              <p className="text-slate-300 text-sm mb-4">
                La transazione di autenticazione è stata firmata e codificata correttamente.
              </p>
              {txId && (
                <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-slate-400 mb-1">Signature ID:</p>
                  <p className="text-xs font-mono text-slate-200 break-all">
                    {txId}
                  </p>
                </div>
              )}
              {signedTxBase64 && (
                <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-400">Transazione Firmata (Base64 - MsgPack):</p>
                    <button
                      onClick={handleCopyBase64}
                      className="text-slate-400 hover:text-white transition-colors p-1 rounded"
                      title="Copia negli appunti"
                    >
                      {copied ? (
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-400" />
                      ) : (
                        <ClipboardIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-900/50 rounded p-2 max-h-32 overflow-y-auto">
                    <p className="text-xs font-mono text-slate-200 break-all whitespace-pre-wrap">
                      {signedTxBase64}
                    </p>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-400 mt-1">Copiato!</p>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="primary"
              onClick={handleClose}
              className="w-full"
            >
              Continua
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};



