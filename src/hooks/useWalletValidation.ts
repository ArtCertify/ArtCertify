import { useState, useEffect } from 'react';
import { walletService } from '../services/walletService';
import { useAuth } from '../contexts/AuthContext';

export interface WalletValidationResult {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  hasMinimumFunds: boolean;
  balance: number;
  isEmptyAccount: boolean;
  canPerformCertification: boolean;
}

/**
 * Hook per validare se un wallet ha fondi sufficienti per operazioni blockchain
 */
export const useWalletValidation = (requiredBalance: number = 0.1) => {
  const { userAddress } = useAuth();
  const [validation, setValidation] = useState<WalletValidationResult>({
    isValid: false,
    isLoading: false,
    error: null,
    hasMinimumFunds: false,
    balance: 0,
    isEmptyAccount: true,
    canPerformCertification: false
  });

  const validateWallet = async () => {
    if (!userAddress) {
      setValidation(prev => ({
        ...prev,
        isValid: false,
        error: 'Wallet non connesso',
        canPerformCertification: false
      }));
      return;
    }

    setValidation(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(`🔍 Validating wallet ${userAddress} for certification...`);
      const walletInfo = await walletService.getWalletInfo(userAddress);
      
      const hasMinimumFunds = walletInfo.balance.algo >= requiredBalance;
      const canPerformCertification = !walletInfo.isEmptyAccount && hasMinimumFunds;

      setValidation({
        isValid: !walletInfo.isEmptyAccount,
        isLoading: false,
        error: null,
        hasMinimumFunds,
        balance: walletInfo.balance.algo,
        isEmptyAccount: walletInfo.isEmptyAccount,
        canPerformCertification
      });

      console.log(`💰 Wallet validation result:`, {
        balance: walletInfo.balance.algo,
        required: requiredBalance,
        isEmpty: walletInfo.isEmptyAccount,
        canCertify: canPerformCertification
      });

    } catch (error) {
      console.error('❌ Wallet validation failed:', error);
      setValidation(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Errore validazione wallet',
        canPerformCertification: false
      }));
    }
  };

  useEffect(() => {
    validateWallet();
  }, [userAddress, requiredBalance]);

  return {
    ...validation,
    refetch: validateWallet
  };
}; 