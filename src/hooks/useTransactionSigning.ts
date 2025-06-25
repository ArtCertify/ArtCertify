import { useState } from 'react';
import { usePeraWallet } from './usePeraWallet';
import algosdk from 'algosdk';
import { config } from '../config/environment';

export interface TransactionSigningState {
  isSigning: boolean;
  lastSignedTxId: string | null;
  error: string | null;
}

/**
 * Hook for demonstrating transaction signing with Pera Wallet (MINTER role)
 * This is a example implementation showing how to use Pera Connect for signing
 */
export const useTransactionSigning = () => {
  const { isConnected, accountAddress, signTransaction } = usePeraWallet();
  const [state, setState] = useState<TransactionSigningState>({
    isSigning: false,
    lastSignedTxId: null,
    error: null
  });

  /**
   * Example: Sign a simple payment transaction
   */
  const signPaymentTransaction = async (
    toAddress: string,
    amount: number,
    note?: string
  ): Promise<string | null> => {
    if (!isConnected || !accountAddress) {
      throw new Error('Pera Wallet not connected');
    }

    setState(prev => ({ ...prev, isSigning: true, error: null }));

    try {
      // Create Algod client (usa configurazione centralizzata)
      const algodClient = new algosdk.Algodv2(
        config.algod.token,
        config.algod.server,
        config.algod.port
      );

      // Get suggested parameters
      const suggestedParams = await algodClient.getTransactionParams().do();

      // Create payment transaction
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: accountAddress,
        receiver: toAddress,
        amount: amount,
        note: note ? new Uint8Array(Buffer.from(note)) : undefined,
        suggestedParams
      });

      // Prepare transaction for signing (Pera Connect format)
      const txGroup = [{ 
        txn, 
        signers: [accountAddress] 
      }];
      
      // Sign with Pera Wallet
      const signedTxns = await signTransaction([txGroup]);

      // Send transaction
      const result = await algodClient.sendRawTransaction(signedTxns[0]).do();
      const txId = result.txid;
      
      setState(prev => ({ 
        ...prev, 
        isSigning: false, 
        lastSignedTxId: txId,
        error: null 
      }));

      return txId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({ 
        ...prev, 
        isSigning: false, 
        error: errorMessage 
      }));

      throw error;
    }
  };

  /**
   * Example: Sign an asset creation transaction (for NFT minting)
   */
  const signAssetCreationTransaction = async (
    assetName: string,
    unitName: string,
    total: number = 1,
    decimals: number = 0,
    assetURL?: string,
    managerAddress?: string
  ): Promise<string | null> => {
    if (!isConnected || !accountAddress) {
      throw new Error('Pera Wallet not connected');
    }

    setState(prev => ({ ...prev, isSigning: true, error: null }));

    try {
      // Create Algod client (usa configurazione centralizzata)
      const algodClient = new algosdk.Algodv2(
        config.algod.token,
        config.algod.server,
        config.algod.port
      );

      const suggestedParams = await algodClient.getTransactionParams().do();

      // Create asset creation transaction
      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        sender: accountAddress, // MINTER creates and signs
        suggestedParams,
        defaultFrozen: false,
        unitName: unitName,
        assetName: assetName,
        manager: managerAddress || accountAddress,
        reserve: managerAddress || accountAddress,
        freeze: managerAddress || accountAddress,
        clawback: managerAddress || accountAddress,
        assetURL: assetURL,
        total: total,
        decimals: decimals
      });

      // Prepare for signing
      const txGroup = [{ 
        txn, 
        signers: [accountAddress] 
      }];
      
      // Sign with Pera Wallet
      const signedTxns = await signTransaction([txGroup]);

      // Send transaction
      const result = await algodClient.sendRawTransaction(signedTxns[0]).do();
      const txId = result.txid;
      
      setState(prev => ({ 
        ...prev, 
        isSigning: false, 
        lastSignedTxId: txId,
        error: null 
      }));

      return txId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({ 
        ...prev, 
        isSigning: false, 
        error: errorMessage 
      }));

      throw error;
    }
  };

  /**
   * Clear the last transaction and error state
   */
  const clearState = () => {
    setState({
      isSigning: false,
      lastSignedTxId: null,
      error: null
    });
  };



  return {
    // State
    ...state,
    isWalletConnected: isConnected,
    signerAddress: accountAddress,
    
    // Methods
    signPaymentTransaction,
    signAssetCreationTransaction,
    clearState
  };
}; 