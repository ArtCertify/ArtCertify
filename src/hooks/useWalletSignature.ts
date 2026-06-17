import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to check if the user has signed the wallet authentication transaction
 * Returns whether the user has accepted terms and signed the transaction
 */
export const useWalletSignature = () => {
  const { userAddress } = useAuth();
  const [hasSigned, setHasSigned] = useState(false);
  const [signedTxBase64, setSignedTxBase64] = useState<string | null>(null);
  const [signedTxId, setSignedTxId] = useState<string | null>(null);

  const checkSignature = useCallback(() => {
    if (!userAddress) {
      setHasSigned(false);
      setSignedTxBase64(null);
      setSignedTxId(null);
      return;
    }

    // Check if user has signed for this wallet address
    const signatureStatus = localStorage.getItem(`wallet_signature_${userAddress}`);
    const base64 = localStorage.getItem(`wallet_signature_base64_${userAddress}`);
    const txId = localStorage.getItem(`wallet_signature_tx_${userAddress}`);

    setHasSigned(signatureStatus === 'true');
    setSignedTxBase64(base64);
    setSignedTxId(txId);
  }, [userAddress]);

  useEffect(() => {
    checkSignature();

    // Listen for storage changes (when signature is completed in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `wallet_signature_${userAddress}` || 
          e.key === `wallet_signature_base64_${userAddress}` ||
          e.key === `wallet_signature_tx_${userAddress}`) {
        checkSignature();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event for same-tab updates
    const handleSignatureUpdate = () => {
      checkSignature();
    };

    window.addEventListener('walletSignatureUpdated', handleSignatureUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('walletSignatureUpdated', handleSignatureUpdate);
    };
  }, [userAddress, checkSignature]);

  return {
    hasSigned,
    signedTxBase64,
    signedTxId,
    refresh: checkSignature
  };
};

