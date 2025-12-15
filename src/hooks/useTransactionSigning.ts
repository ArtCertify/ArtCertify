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
   * Sign authentication transaction for JWT generation
   * Creates a Payment transaction (0 Algo, self) with JSON note containing domain, nonce, timestamp, expirySeconds
   * Signs the transaction using Pera Wallet and encodes it to base64 (msgpack -> base64)
   * Matches the Java backend implementation format
   */
  const signAuthTransaction = async (): Promise<{ signedTxBase64: string; txId: string }> => {
    if (!isConnected || !accountAddress) {
      throw new Error('Pera Wallet not connected');
    }

    setState(prev => ({ ...prev, isSigning: true, error: null }));

    try {
      // Create Algod client
      const algodClient = new algosdk.Algodv2(
        config.algod.token,
        config.algod.server,
        config.algod.port
      );

      // Get suggested parameters
      const suggestedParams = await algodClient.getTransactionParams().do();

      // Create auth note JSON (matching backend Java format)
      const authNote = {
        domain: typeof window !== 'undefined' ? window.location.origin : '',
        nonce: crypto.randomUUID(),
        timestamp: Math.floor(Date.now() / 1000), // epoch seconds
        expirySeconds: 1000
      };
      const noteJson = JSON.stringify(authNote);

      // Create payment transaction: 0 Algo, receiver = sender (self transaction)
      // This matches the Java implementation: Transaction.PaymentTransactionBuilder()
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: accountAddress,
        receiver: accountAddress, // Self transaction
        amount: 0, // 0 Algo (no fees for auth)
        note: new Uint8Array(Buffer.from(noteJson, 'utf-8')), // JSON note in transaction
        suggestedParams
      });

      // Prepare transaction for signing (Pera Connect format)
      const txGroup = [{ 
        txn, 
        signers: [accountAddress] 
      }];
      
      // Sign with Pera Wallet
      // This returns a Uint8Array which is the signed transaction in msgpack format
      const signedTxns = await signTransaction([txGroup]);
      const signedTxn = signedTxns[0];

      if (!signedTxn || signedTxn.length === 0) {
        throw new Error('Firma della transazione fallita');
      }

      // Encode signed transaction to base64
      // The signed transaction is already in msgpack format (Uint8Array)
      // We just need to convert it to base64, matching Java: Base64.getEncoder().encodeToString(Encoder.encodeToMsgPack(signedTx))
      const signedTxBase64 = Buffer.from(signedTxn).toString('base64');

      // Optionally send transaction to blockchain to get real txId
      // For auth purposes, we can use a generated ID or send it to get the real txId
      let txId: string;
      try {
        // Send transaction to blockchain to get real transaction ID
        const result = await algodClient.sendRawTransaction(signedTxn).do();
        txId = result.txid;
      } catch (sendError) {
        // If sending fails, generate a signature ID (transaction is still valid for auth)
        // Failed to send auth transaction - using generated ID
        txId = `sig_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
      }
      
      setState(prev => ({ 
        ...prev, 
        isSigning: false, 
        lastSignedTxId: txId,
        error: null 
      }));

      return { signedTxBase64, txId };

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
    signAuthTransaction,
    clearState
  };
}; 