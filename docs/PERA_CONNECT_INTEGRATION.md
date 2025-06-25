# 🔗 Pera Connect Integration - CaputMundi ArtCertify

Documentazione per l'integrazione di [Pera Wallet Connect](https://github.com/perawallet/connect) come metodo di autenticazione e firma delle transazioni.

## 📋 Panoramica

L'integrazione implementa **Pera Connect** per due funzionalità principali:

1. **🔐 Autenticazione (Login)** - Il wallet connesso diventa l'identità dell'utente
2. **✍️ Firma Transazioni (MINTER)** - Il wallet connesso firma le transazioni blockchain

### Architettura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Login Page    │────▶│  Pera Connect    │────▶│  Dashboard      │
│                 │     │   QR Code /      │     │                 │
│                 │     │   Desktop App    │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Transaction      │
                        │ Signing (MINTER) │
                        └──────────────────┘
```

## 🚀 Implementazione

### Servizi Principali

#### 1. `peraWalletService.ts`
Servizio singleton per gestire la connessione Pera Wallet:

```typescript
import peraWalletService from '../services/peraWalletService';

// Connetti wallet
const accounts = await peraWalletService.connect();

// Firma transazione (MINTER)
const signedTxns = await peraWalletService.signTransaction(txGroups);

// Disconnetti
await peraWalletService.disconnect();
```

#### 2. `usePeraWallet.ts`
Hook React per l'integrazione:

```typescript
import { usePeraWallet } from '../hooks/usePeraWallet';

function MyComponent() {
  const {
    isConnected,
    isConnecting,
    accountAddress,
    connect,
    disconnect,
    signTransaction,
    error
  } = usePeraWallet();

  return (
    <button onClick={connect} disabled={isConnecting}>
      {isConnected ? 'Connesso' : 'Connetti Pera Wallet'}
    </button>
  );
}
```

### Componenti Aggiornati

#### `LoginPage.tsx`
- ✅ **Solo Pera Connect** - Rimossi SPID e login manuali  
- ✅ **QR Code Integration** - Supporto mobile e desktop
- ✅ **Auto-login** - Login automatico quando il wallet si connette
- ✅ **Session Persistence** - Riconnessione automatica

#### `AuthContext.tsx`
- ✅ **Integrazione Pera Wallet** - Sincronizzazione con eventi di disconnessione
- ✅ **Auto-logout** - Logout automatico quando il wallet si disconnette

## 🔧 Configurazione

### Pera Wallet Options

Configurazione in `peraWalletService.ts`:

```typescript
new PeraWalletConnect({
  chainId: 416002, // TestNet (416001 per MainNet)
  shouldShowSignTxnToast: true, // Mostra toast durante firma
  compactMode: false // UI compatta per schermi piccoli
});
```

### Reti Supportate

| Rete | Chain ID | Explorer |
|------|----------|----------|
| **TestNet** | 416002 | `https://testnet.explorer.perawallet.app/` |
| MainNet | 416001 | `https://explorer.perawallet.app/` |
| BetaNet | 416003 | `https://betanet.explorer.perawallet.app/` |

## 💻 Utilizzo

### 1. Autenticazione

```typescript
// Nel LoginPage
const { connect } = usePeraWallet();

const handleLogin = async () => {
  try {
    await connect(); // Mostra QR code o connette desktop
    // Auto-redirect al dashboard quando connesso
  } catch (error) {
    console.error('Connessione fallita:', error);
  }
};
```

### 2. Firma Transazioni (MINTER)

```typescript
// Esempio di firma transazione
import { useTransactionSigning } from '../hooks/useTransactionSigning';

function CertificationForm() {
  const { signAssetCreationTransaction, isSigning } = useTransactionSigning();

  const mintNFT = async () => {
    try {
      const txId = await signAssetCreationTransaction(
        'Certificato #001',
        'CERT001',
        1, // total supply
        0, // decimals
        'https://ipfs.io/ipfs/QmHash...' // asset URL
      );
      
      console.log('NFT creato:', txId);
    } catch (error) {
      console.error('Minting fallito:', error);
    }
  };

  return (
    <button onClick={mintNFT} disabled={isSigning}>
      {isSigning ? 'Firmando...' : 'Certifica Documento'}
    </button>
  );
}
```

## 📱 Esperienza Utente

### Mobile (QR Code)
1. L'utente clicca "Connetti Pera Wallet"
2. Appare un QR code
3. L'utente scansiona con Pera Wallet app
4. Approva la connessione su mobile
5. Automaticamente reindirizzato al dashboard

### Desktop
1. L'utente clicca "Connetti Pera Wallet"  
2. Pera Wallet Desktop si apre automaticamente
3. L'utente approva la connessione
4. Automaticamente reindirizzato al dashboard

### Firma Transazioni
1. L'applicazione crea una transazione
2. L'utente clicca per firmare
3. Pera Wallet mostra dettagli transazione
4. L'utente conferma/rifiuta
5. Transazione inviata alla rete

## 🔐 Sicurezza

### Ruolo MINTER
- ✅ **Chiavi Private Sicure** - Rimangono nel wallet dell'utente
- ✅ **Controllo Utente** - L'utente vede e approva ogni transazione  
- ✅ **No Storage** - Nessuna chiave memorizzata nell'applicazione
- ✅ **Session Management** - Sessioni sicure con auto-logout

### Best Practices
- ✅ **Validation** - Validazione indirizzi Algorand
- ✅ **Error Handling** - Gestione errori robusta
- ✅ **Event Cleanup** - Cleanup degli event listener
- ✅ **Network Feedback** - Feedback chiaro all'utente

## 📊 Monitoring & Debug

### Console Logging
Il servizio include logging dettagliato:

```
🔗 Initiating Pera Wallet connection...
✅ Connected to Pera Wallet: ADDR123...
📝 Signing transaction with Pera Wallet (MINTER)...
✅ Transaction signed successfully
📤 Sending signed transaction to network...
✅ Transaction sent successfully: TXN456...
```

### States Tracking
- `isConnected` - Stato connessione wallet
- `isConnecting` - Processo di connessione in corso
- `accountAddress` - Indirizzo wallet connesso (MINTER)
- `platform` - 'mobile' | 'web' | null
- `error` - Ultimo errore verificatosi

## 🛠️ Sviluppo

### Test della Connessione
```bash
npm run dev
# Aprire http://localhost:5173
# Testare connessione con Pera Wallet
```

### Dipendenze
```json
{
  "@perawallet/connect": "^1.4.2",
  "algosdk": "^3.3.1"
}
```

### File Principali
- `src/services/peraWalletService.ts` - Servizio core
- `src/hooks/usePeraWallet.ts` - Hook React  
- `src/hooks/useTransactionSigning.ts` - Hook per firma transazioni
- `src/components/LoginPage.tsx` - Pagina login
- `src/contexts/AuthContext.tsx` - Context autenticazione

## 🎯 Conclusioni

L'integrazione Pera Connect fornisce:

✅ **Autenticazione Semplice** - Un solo pulsante per connettersi  
✅ **UX Ottimale** - QR code per mobile, desktop diretto  
✅ **Sicurezza Massima** - Chiavi private rimangono nel wallet  
✅ **MINTER Sicuro** - Firma transazioni controllata dall'utente  
✅ **Session Persistence** - Riconnessione automatica  
✅ **Error Handling** - Gestione robusta degli errori  

La piattaforma è ora pronta per l'utilizzo in produzione con Pera Connect come unico metodo di autenticazione e firma transazioni. 