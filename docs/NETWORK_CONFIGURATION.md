# Network Configuration System

## Overview

CaputMundi ArtCertify now supports both **TestNet** and **MainNet** environments through a centralized configuration system. The active network is determined by the `VITE_ALGORAND_NETWORK` environment variable.

## Configuration

### Environment Variable

Set the network type in your `.env` file:

```bash
# For TestNet (safe for development/testing)
VITE_ALGORAND_NETWORK=testnet

# For MainNet (real transactions with real money)
VITE_ALGORAND_NETWORK=mainnet
```

### Automatic Network Features

Based on the `VITE_ALGORAND_NETWORK` setting, the system automatically configures:

#### TestNet Configuration (`VITE_ALGORAND_NETWORK=testnet`)
- **Chain ID**: 416002 ✅ *Verified from official Algorand/Pera documentation*
- **Explorer**: https://testnet.explorer.perawallet.app ✅ *Official Pera Explorer*
- **Default Algod**: https://testnet-api.algonode.cloud:443 ✅ *Official Algonode endpoint*
- **Default Indexer**: https://testnet-idx.algonode.cloud:443 ✅ *Official Algonode endpoint*
- **Status**: Safe for testing - transactions use fake money

#### MainNet Configuration (`VITE_ALGORAND_NETWORK=mainnet`)
- **Chain ID**: 416001 ✅ *Verified from official Algorand/Pera documentation*
- **Explorer**: https://explorer.perawallet.app ✅ *Official Pera Explorer*
- **Default Algod**: https://mainnet-api.algonode.cloud:443 ✅ *Official Algonode endpoint*
- **Default Indexer**: https://mainnet-idx.algonode.cloud:443 ✅ *Official Algonode endpoint*
- **Status**: ⚠️ **REAL TRANSACTIONS** - uses real money

## Implementation Details

### Centralized Configuration (`src/config/environment.ts`)

The system provides:
- **Network Type Detection**: Validates and normalizes the network setting
- **Chain ID Management**: Automatically sets the correct Pera Wallet chain ID
- **Explorer URL Helpers**: Functions to generate correct explorer links
- **API Endpoint Defaults**: Falls back to appropriate endpoints if not specified

### Helper Functions

```typescript
import { getAssetExplorerUrl, getTransactionExplorerUrl, getAddressExplorerUrl } from '../config/environment';

// Generate network-appropriate URLs
const assetUrl = getAssetExplorerUrl(assetId);
const txUrl = getTransactionExplorerUrl(txId);
const addressUrl = getAddressExplorerUrl(address);
```

### Configuration Object

```typescript
import { config } from '../config/environment';

// Access network info
config.algorandNetwork        // 'testnet' | 'mainnet'
config.network.chainId        // 416002 (testnet) | 416001 (mainnet)
config.network.explorerUrl    // Appropriate explorer URL
config.network.isMainnet      // boolean
config.network.isTestnet      // boolean

// API endpoints
config.algod.server          // Algod API endpoint
config.indexer.server        // Indexer API endpoint
```

## Updated Components

### Services
- **`algorand.ts`**: Uses centralized explorer URL helpers
- **`peraWalletService.ts`**: Uses dynamic chain ID from config

### Hooks
- **`useTransactionSigning.ts`**: Uses centralized API endpoints
- **`usePeraCertificationFlow.ts`**: Uses centralized explorer URLs

### Application Startup
- **`main.tsx`**: Logs current network configuration at startup

## Network Switching

To switch networks:

1. **Update `.env` file**:
   ```bash
   # Change from testnet to mainnet
   VITE_ALGORAND_NETWORK=mainnet
   
   # Update API endpoints (optional - defaults provided)
   VITE_ALGOD_SERVER=https://mainnet-api.algonode.cloud
   VITE_INDEXER_SERVER=https://mainnet-idx.algonode.cloud
   ```

2. **Restart the application** for changes to take effect

3. **Verify configuration** in browser console:
   ```
   🔧 CaputMundi Configuration:
     🌐 Network: MAINNET
     🔗 Chain ID: 416001
     🔍 Explorer: https://explorer.perawallet.app
     📡 Algod: https://mainnet-api.algonode.cloud:443
     📊 Indexer: https://mainnet-idx.algonode.cloud:443
     🔴 Running on MAINNET - transactions are REAL
   ```

## Safety Features

### Network Validation
- Invalid network values throw errors during startup
- Configuration validation ensures all required values are present

### Clear Visual Indicators
- Console logs clearly indicate if running on TestNet or MainNet
- MainNet shows warning that transactions are REAL

### Environment Examples
The `env.example` file provides clear examples for both networks with detailed comments.

## Best Practices

1. **Always use TestNet for development**
2. **Double-check network setting before MainNet deployment**
3. **Monitor console logs to verify correct network**
4. **Use separate `.env` files for different environments**
5. **Never commit real API keys or MainNet configurations to version control**

## Migration Notes

The system is backward compatible. Existing installations will:
- Continue working with current `.env` settings
- Use TestNet by default if `VITE_ALGORAND_NETWORK` is not set
- Automatically apply appropriate defaults based on network type 