# ⚙️ Configurazione Network Algorand

Documentazione completa del sistema di configurazione automatica di rete per CaputMundi ArtCertify. Il sistema supporta switch automatico tra TestNet e MainNet con validazione dei parametri e prevenzione di configurazioni miste.

## 🌐 Panoramica

Il sistema di configurazione automatica garantisce che tutti i parametri di rete (endpoints, chain ID, explorer URLs) siano configurati correttamente e consistentemente, eliminando errori di configurazione manuale e prevenendo mix pericolosi tra TestNet e MainNet.

### ✨ Caratteristiche Principali

- **🔄 Auto-Configuration**: Configurazione automatica basata su una singola variabile
- **🛡️ Error Prevention**: Prevenzione mix TestNet/MainNet
- **🔗 Endpoint Management**: Gestione automatica endpoint Algorand
- **🌐 Explorer Integration**: URL explorer dinamici
- **⚡ Validation**: Validazione runtime configurazione
- **🎯 Environment Safety**: Sicurezza configurazione per ambiente

## 🏗️ Architettura Configurazione

### **Variabile Master**

```bash
# Singola variabile che controlla tutto
VITE_ALGORAND_NETWORK=testnet  # oppure 'mainnet'
```

### **Configurazione Automatica per TestNet**

```typescript
// Quando VITE_ALGORAND_NETWORK=testnet
const testnetConfig = {
  network: 'testnet',
  chainId: 416002,
  algod: {
    server: 'https://testnet-api.algonode.cloud',
    port: 443,
    token: '' // Token opzionale
  },
  indexer: {
    server: 'https://testnet-idx.algonode.cloud', 
    port: 443,
    token: '' // Token opzionale
  },
  explorer: {
    baseUrl: 'https://testnet.explorer.perawallet.app',
    assetUrl: (assetId: number) => `${baseUrl}/asset/${assetId}`,
    txUrl: (txId: string) => `${baseUrl}/tx/${txId}`,
    accountUrl: (address: string) => `${baseUrl}/address/${address}`
  },
  features: {
    realMoney: false,
    debugging: true,
    rateLimit: 'relaxed'
  }
};
```

### **Configurazione Automatica per MainNet**

```typescript
// Quando VITE_ALGORAND_NETWORK=mainnet
const mainnetConfig = {
  network: 'mainnet',
  chainId: 416001,
  algod: {
    server: 'https://mainnet-api.algonode.cloud',
    port: 443,
    token: '' // Token opzionale
  },
  indexer: {
    server: 'https://mainnet-idx.algonode.cloud',
    port: 443, 
    token: '' // Token opzionale
  },
  explorer: {
    baseUrl: 'https://explorer.perawallet.app',
    assetUrl: (assetId: number) => `${baseUrl}/asset/${assetId}`,
    txUrl: (txId: string) => `${baseUrl}/tx/${txId}`,
    accountUrl: (address: string) => `${baseUrl}/address/${address}`
  },
  features: {
    realMoney: true,
    debugging: false,
    rateLimit: 'strict'
  }
};
```

## 🔧 Implementazione Sistema

### **1. Environment Configuration Service**

```typescript
// src/config/environment.ts
import { z } from 'zod';

// Schema validazione configurazione
const configSchema = z.object({
  algorandNetwork: z.enum(['testnet', 'mainnet']),
  pinataApiKey: z.string().min(1),
  pinataApiSecret: z.string().min(1),
  pinataJWT: z.string().min(1),
  pinataGateway: z.string().min(1),
  // Private key opzionale per testing
  privateKeyMnemonic: z.string().optional(),
});

// Validazione environment variables
export const validateConfig = (): Config => {
  const rawConfig = {
    algorandNetwork: import.meta.env.VITE_ALGORAND_NETWORK,
    pinataApiKey: import.meta.env.VITE_PINATA_API_KEY,
    pinataApiSecret: import.meta.env.VITE_PINATA_API_SECRET,
    pinataJWT: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
    privateKeyMnemonic: import.meta.env.VITE_PRIVATE_KEY_MNEMONIC,
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
};

// Configurazione network automatica
export const getNetworkConfig = (network: 'testnet' | 'mainnet') => {
  if (network === 'testnet') {
    return {
      name: 'TestNet',
      chainId: 416002,
      algodServer: 'https://testnet-api.algonode.cloud',
      algodPort: 443,
      indexerServer: 'https://testnet-idx.algonode.cloud',
      indexerPort: 443,
      explorerBaseUrl: 'https://testnet.explorer.perawallet.app',
      realMoney: false
    };
  } else {
    return {
      name: 'MainNet',
      chainId: 416001,
      algodServer: 'https://mainnet-api.algonode.cloud',
      algodPort: 443,
      indexerServer: 'https://mainnet-idx.algonode.cloud', 
      indexerPort: 443,
      explorerBaseUrl: 'https://explorer.perawallet.app',
      realMoney: true
    };
  }
};

// Export configurazione globale
export const config = {
  ...validateConfig(),
  network: getNetworkConfig(validateConfig().algorandNetwork)
};
```

### **2. Algorand Service con Auto-Config**

```typescript
// src/services/algorand.ts
import algosdk from 'algosdk';
import { config } from '../config/environment';

class AlgorandService {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;

  constructor() {
    // Configurazione automatica basata su environment
    this.algodClient = new algosdk.Algodv2(
      '', // Token vuoto per endpoint pubblici
      config.network.algodServer,
      config.network.algodPort
    );

    this.indexerClient = new algosdk.Indexer(
      '', // Token vuoto per endpoint pubblici  
      config.network.indexerServer,
      config.network.indexerPort
    );

    // Validazione connessione al startup
    this.validateConnection();
  }

  // Validazione connessione rete
  private async validateConnection(): Promise<void> {
    try {
      const status = await this.algodClient.status().do();
      console.log(`✅ Connected to Algorand ${config.network.name}:`, {
        lastRound: status.lastRound,
        chainId: config.network.chainId,
        realMoney: config.network.realMoney
      });
    } catch (error) {
      console.error(`❌ Failed to connect to ${config.network.name}:`, error);
      throw new Error(`Network connection failed: ${config.network.name}`);
    }
  }

  // Metodi con configurazione automatica
  getAssetExplorerUrl(assetId: number): string {
    return `${config.network.explorerBaseUrl}/asset/${assetId}`;
  }

  getTransactionExplorerUrl(txId: string): string {
    return `${config.network.explorerBaseUrl}/tx/${txId}`;
  }

  getAccountExplorerUrl(address: string): string {
    return `${config.network.explorerBaseUrl}/address/${address}`;
  }

  // Getter per client configurati
  getAlgod(): algosdk.Algodv2 {
    return this.algodClient;
  }

  getIndexer(): algosdk.Indexer {
    return this.indexerClient;
  }

  // Info network corrente
  getNetworkInfo() {
    return {
      name: config.network.name,
      chainId: config.network.chainId,
      algodServer: config.network.algodServer,
      indexerServer: config.network.indexerServer,
      explorerBaseUrl: config.network.explorerBaseUrl,
      isMainNet: config.algorandNetwork === 'mainnet',
      isTestNet: config.algorandNetwork === 'testnet'
    };
  }
}

export const algorandService = new AlgorandService();
```

### **3. Pera Wallet Auto-Configuration**

```typescript
// src/services/peraWalletService.ts
import { PeraWalletConnect } from '@perawallet/connect';
import { config } from '../config/environment';

class PeraWalletService {
  private peraWallet: PeraWalletConnect;

  constructor() {
    // Configurazione automatica chain ID
    this.peraWallet = new PeraWalletConnect({
      shouldShowSignTxnToast: false,
      chainId: config.network.chainId, // 416002 (TestNet) o 416001 (MainNet)
      compactMode: false
    });

    console.log(`🔌 Pera Wallet configured for ${config.network.name} (Chain ID: ${config.network.chainId})`);
  }

  // Metodi wallet con network awareness
  getExplorerUrl(address: string): string {
    return `${config.network.explorerBaseUrl}/address/${address}`;
  }

  // Warning per MainNet
  async connect(): Promise<string[]> {
    if (config.network.realMoney) {
      console.warn('⚠️ Connecting to MainNet - Real money transactions!');
    }

    const accounts = await this.peraWallet.connect();
    
    if (accounts.length > 0) {
      console.log(`✅ Connected to ${config.network.name}:`, {
        address: accounts[0].slice(0, 8) + '...',
        network: config.network.name,
        explorerUrl: this.getExplorerUrl(accounts[0])
      });
    }

    return accounts;
  }
}

export default new PeraWalletService();
```

## 🛡️ Sicurezza e Validazione

### **Prevenzione Errori di Configurazione**

```typescript
// Validazione runtime per prevenire configurazioni pericolose
export const validateNetworkConsistency = () => {
  const errors: string[] = [];

  // Verifica coerenza chain ID
  if (config.algorandNetwork === 'testnet' && config.network.chainId !== 416002) {
    errors.push('TestNet requires Chain ID 416002');
  }
  
  if (config.algorandNetwork === 'mainnet' && config.network.chainId !== 416001) {
    errors.push('MainNet requires Chain ID 416001');
  }

  // Verifica endpoint coerenti
  const isTestnetEndpoint = config.network.algodServer.includes('testnet');
  const isMainnetConfig = config.algorandNetwork === 'mainnet';
  
  if (isMainnetConfig && isTestnetEndpoint) {
    errors.push('MainNet configuration with TestNet endpoint detected');
  }
  
  if (!isMainnetConfig && !isTestnetEndpoint) {
    errors.push('TestNet configuration with MainNet endpoint detected');
  }

  if (errors.length > 0) {
    throw new Error(`Network configuration errors: ${errors.join(', ')}`);
  }
};

// Validazione automatica al startup
validateNetworkConsistency();
```

### **Environment Safety Checks**

```typescript
// Controlli sicurezza per deployment
export const performSafetyChecks = () => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Production checks
  if (import.meta.env.PROD) {
    if (config.algorandNetwork === 'testnet') {
      warnings.push('Production build using TestNet');
    }
    
    if (config.privateKeyMnemonic) {
      errors.push('Private key mnemonic found in production build');
    }
  }

  // Development checks
  if (import.meta.env.DEV) {
    if (config.algorandNetwork === 'mainnet') {
      warnings.push('Development build using MainNet - Real money!');
    }
  }

  // Log warnings
  warnings.forEach(warning => console.warn(`⚠️ ${warning}`));
  
  // Throw on errors
  if (errors.length > 0) {
    throw new Error(`Safety check failed: ${errors.join(', ')}`);
  }
};
```

## 📋 Environment Templates

### **Template .env.local per Development**

```bash
# ===========================================
# CONFIGURAZIONE NETWORK ALGORAND
# ===========================================
# Imposta network type: 'testnet' per sviluppo, 'mainnet' per produzione
VITE_ALGORAND_NETWORK=testnet

# ===========================================
# ⚠️  TUTTI GLI ENDPOINT SONO AUTOMATICI! ⚠️
# ===========================================
# Non serve configurare manualmente:
# - ALGOD_SERVER: Auto-detected da VITE_ALGORAND_NETWORK
# - INDEXER_SERVER: Auto-detected da VITE_ALGORAND_NETWORK  
# - CHAIN_ID: Auto-detected da VITE_ALGORAND_NETWORK
# - EXPLORER_URL: Auto-detected da VITE_ALGORAND_NETWORK

# ===========================================
# PINATA IPFS CONFIGURATION (REQUIRED)
# ===========================================
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_API_SECRET=your_pinata_api_secret
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_PINATA_GATEWAY=your-gateway.mypinata.cloud

# ===========================================
# OPTIONAL: TESTING QUICK LOGIN
# ===========================================
# Solo per testing rapido - NON USARE IN PRODUZIONE
VITE_PRIVATE_KEY_MNEMONIC=your_test_account_25_words_mnemonic

# ===========================================
# 🎯 COME CAMBIARE RETE
# ===========================================
# Per TestNet (sviluppo):
# VITE_ALGORAND_NETWORK=testnet
# 
# Per MainNet (produzione):  
# VITE_ALGORAND_NETWORK=mainnet
#
# Riavvia l'applicazione dopo il cambio!
```

### **Template .env.production**

```bash
# Production configuration per MainNet
VITE_ALGORAND_NETWORK=mainnet

# Pinata production keys
VITE_PINATA_API_KEY=production_api_key
VITE_PINATA_API_SECRET=production_api_secret
VITE_PINATA_JWT=production_jwt_token
VITE_PINATA_GATEWAY=production-gateway.mypinata.cloud

# NO private keys in production
# VITE_PRIVATE_KEY_MNEMONIC= # COMMENTED OUT
```

## 🚀 Deployment Configuration

### **Staging Environment**

```bash
# Staging usa TestNet per testing sicuro
VITE_ALGORAND_NETWORK=testnet

# Pinata staging keys
VITE_PINATA_API_KEY=staging_api_key
VITE_PINATA_API_SECRET=staging_api_secret
VITE_PINATA_JWT=staging_jwt_token
VITE_PINATA_GATEWAY=staging-gateway.mypinata.cloud
```

### **Production Environment**

```bash
# Production MUST use MainNet
VITE_ALGORAND_NETWORK=mainnet

# Production Pinata keys
VITE_PINATA_API_KEY=prod_api_key
VITE_PINATA_API_SECRET=prod_api_secret
VITE_PINATA_JWT=prod_jwt_token
VITE_PINATA_GATEWAY=prod-gateway.mypinata.cloud
```

### **CI/CD Pipeline Integration**

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Environment
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "VITE_ALGORAND_NETWORK=mainnet" >> .env.production
          else
            echo "VITE_ALGORAND_NETWORK=testnet" >> .env.staging
          fi
          
      - name: Validate Configuration
        run: |
          npm run build
          # Validates configuration automatically
          
      - name: Safety Checks
        run: |
          # Ensure no private keys in production
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            if grep -q "PRIVATE_KEY" .env.production; then
              echo "❌ Private keys found in production config"
              exit 1
            fi
          fi
```

## 🧪 Testing Network Configuration

### **Test Suite per Configurazione**

```typescript
// tests/networkConfig.test.ts
import { config, validateNetworkConsistency, getNetworkConfig } from '../src/config/environment';

describe('Network Configuration', () => {
  describe('TestNet Configuration', () => {
    beforeAll(() => {
      process.env.VITE_ALGORAND_NETWORK = 'testnet';
    });

    it('should configure TestNet correctly', () => {
      const networkConfig = getNetworkConfig('testnet');
      
      expect(networkConfig.chainId).toBe(416002);
      expect(networkConfig.algodServer).toBe('https://testnet-api.algonode.cloud');
      expect(networkConfig.explorerBaseUrl).toBe('https://testnet.explorer.perawallet.app');
      expect(networkConfig.realMoney).toBe(false);
    });

    it('should validate TestNet consistency', () => {
      expect(() => validateNetworkConsistency()).not.toThrow();
    });
  });

  describe('MainNet Configuration', () => {
    beforeAll(() => {
      process.env.VITE_ALGORAND_NETWORK = 'mainnet';
    });

    it('should configure MainNet correctly', () => {
      const networkConfig = getNetworkConfig('mainnet');
      
      expect(networkConfig.chainId).toBe(416001);
      expect(networkConfig.algodServer).toBe('https://mainnet-api.algonode.cloud');
      expect(networkConfig.explorerBaseUrl).toBe('https://explorer.perawallet.app');
      expect(networkConfig.realMoney).toBe(true);
    });

    it('should validate MainNet consistency', () => {
      expect(() => validateNetworkConsistency()).not.toThrow();
    });
  });

  describe('Error Prevention', () => {
    it('should prevent mixed configuration', () => {
      // Simulate mixed config
      process.env.VITE_ALGORAND_NETWORK = 'mainnet';
      const badConfig = {
        ...config,
        network: { ...getNetworkConfig('testnet') }
      };

      expect(() => validateNetworkConsistency()).toThrow();
    });
  });
});
```

### **Manual Testing Checklist**

```bash
# 1. Test TestNet Configuration
VITE_ALGORAND_NETWORK=testnet npm run dev
# ✅ Verificare: Chain ID 416002, TestNet endpoints, TestNet explorer

# 2. Test MainNet Configuration  
VITE_ALGORAND_NETWORK=mainnet npm run dev
# ✅ Verificare: Chain ID 416001, MainNet endpoints, MainNet explorer

# 3. Test Invalid Configuration
VITE_ALGORAND_NETWORK=invalid npm run dev
# ✅ Dovrebbe fallire con errore validazione

# 4. Test Build Consistency
npm run build
# ✅ Build dovrebbe validare automaticamente configuration
```

## 📊 Monitoring e Diagnostica

### **Runtime Configuration Display**

```typescript
// Componente per visualizzare configurazione corrente
export const NetworkStatus: React.FC = () => {
  const networkInfo = algorandService.getNetworkInfo();
  
  return (
    <Card className="p-4 border-l-4 border-blue-500">
      <h3 className="font-bold text-lg mb-2">Network Configuration</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Network: <span className="font-mono">{networkInfo.name}</span></div>
        <div>Chain ID: <span className="font-mono">{networkInfo.chainId}</span></div>
        <div>Real Money: <span className={networkInfo.isMainNet ? "text-red-500 font-bold" : "text-green-500"}>{networkInfo.isMainNet ? "YES" : "NO"}</span></div>
        <div>Explorer: <a href={networkInfo.explorerBaseUrl} target="_blank" className="text-blue-500 hover:underline">Open</a></div>
      </div>
      
      {networkInfo.isMainNet && (
        <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
          ⚠️ MainNet Active - Real money transactions!
        </div>
      )}
    </Card>
  );
};
```

### **Configuration Logging**

```typescript
// Logging configurazione per debugging
export const logNetworkConfiguration = () => {
  const info = {
    environment: import.meta.env.MODE,
    network: config.algorandNetwork,
    chainId: config.network.chainId,
    algodServer: config.network.algodServer,
    indexerServer: config.network.indexerServer,
    explorerBaseUrl: config.network.explorerBaseUrl,
    realMoney: config.network.realMoney,
    timestamp: new Date().toISOString()
  };

  console.log('🌐 Network Configuration:', info);
  
  // In production, invia a monitoring service
  if (import.meta.env.PROD) {
    analytics.track('network_configuration_loaded', info);
  }
};
```

## 🎯 Best Practices

### **Development Workflow**

1. **Sempre TestNet per Development**
```bash
# .env.local per development
VITE_ALGORAND_NETWORK=testnet
```

2. **Staging con TestNet**
```bash
# .env.staging
VITE_ALGORAND_NETWORK=testnet
```

3. **Production con MainNet**
```bash
# .env.production
VITE_ALGORAND_NETWORK=mainnet
```

### **Safety Guidelines**

- ✅ **Mai** mescolare TestNet/MainNet endpoints
- ✅ **Sempre** validare configurazione al startup
- ✅ **Mai** committare chiavi private production
- ✅ **Sempre** usare TestNet per testing
- ✅ **Sempre** verificare network prima deployment

### **Error Handling**

```typescript
// Graceful error handling per network issues
export const handleNetworkError = (error: any) => {
  if (error.message.includes('Network connection failed')) {
    return {
      message: `Impossibile connettersi a ${config.network.name}. Verifica la connessione internet.`,
      action: 'retry',
      severity: 'error'
    };
  }
  
  if (error.message.includes('configuration errors')) {
    return {
      message: 'Configurazione di rete non valida. Contatta il supporto.',
      action: 'contact_support',
      severity: 'fatal'
    };
  }
  
  return {
    message: 'Errore di rete sconosciuto.',
    action: 'retry',
    severity: 'warning'
  };
};
```

---

## 📞 Supporto

Per supporto sulla configurazione di rete:

- **📧 Email**: [info@artcertify.com](mailto:info@artcertify.com)
- **📚 Algorand Docs**: [Algorand Developer Portal](https://developer.algorand.org)
- **🌐 Algonode**: [Algonode API Documentation](https://algonode.io)
- **🔍 Explorer**: [Pera Explorer](https://explorer.perawallet.app)

**⚙️ Network Configuration - Automazione e sicurezza per CaputMundi ArtCertify!** 