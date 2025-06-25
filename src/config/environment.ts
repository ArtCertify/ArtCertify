// Helper function to safely access environment variables (NO FALLBACKS)
const getEnvVar = (key: string, allowEmpty: boolean = false): string => {
  let value: string | undefined;
  
  // Check if we're in a Vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    value = import.meta.env[key];
  } else {
    // Fallback for Node.js environment (testing)
    value = process.env[key];
  }
  
  if (value === undefined || (!allowEmpty && value === '')) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || '';
};

// Network configuration type
type NetworkType = 'testnet' | 'mainnet';

// Network-specific configurations
const getNetworkConfig = (network: NetworkType) => {
  switch (network) {
    case 'mainnet':
      return {
        chainId: 416001, // MainNet chain ID
        explorerUrl: 'https://explorer.perawallet.app',
        algodDefault: {
          server: 'https://mainnet-api.algonode.cloud',
          port: 443
        },
        indexerDefault: {
          server: 'https://mainnet-idx.algonode.cloud', 
          port: 443
        }
      };
    case 'testnet':
      return {
        chainId: 416002, // TestNet chain ID  
        explorerUrl: 'https://testnet.explorer.perawallet.app',
        algodDefault: {
          server: 'https://testnet-api.algonode.cloud',
          port: 443
        },
        indexerDefault: {
          server: 'https://testnet-idx.algonode.cloud',
          port: 443
        }
      };
    default:
      throw new Error(`Unsupported network: ${network}. Use 'testnet' or 'mainnet'`);
  }
};

// Main environment configuration
const algorandNetworkRaw = getEnvVar('VITE_ALGORAND_NETWORK').toLowerCase();
if (algorandNetworkRaw !== 'testnet' && algorandNetworkRaw !== 'mainnet') {
  throw new Error(`Invalid VITE_ALGORAND_NETWORK: ${algorandNetworkRaw}. Must be 'testnet' or 'mainnet'`);
}
const algorandNetwork = algorandNetworkRaw as NetworkType;

// Get network-specific configuration
const networkConfig = getNetworkConfig(algorandNetwork);

// Environment configuration - ALL VALUES MUST COME FROM .env
export const config = {
  // Pinata IPFS Gateway
  pinataGateway: getEnvVar('VITE_PINATA_GATEWAY'),
  
  // Algorand Network
  algorandNetwork,
  
  // Network-specific configuration
  network: {
    chainId: networkConfig.chainId,
    explorerUrl: networkConfig.explorerUrl,
    isMainnet: algorandNetwork === 'mainnet',
    isTestnet: algorandNetwork === 'testnet'
  },
  
  // Algorand API endpoints - ALWAYS use network-specific defaults (automatic switching)
  algod: {
    token: getEnvVar('VITE_ALGOD_TOKEN', true), // Allow empty for public services
    server: networkConfig.algodDefault.server, // Always use network-based default
    port: networkConfig.algodDefault.port // Always use network-based default
  },
  
  indexer: {
    token: getEnvVar('VITE_INDEXER_TOKEN', true), // Allow empty for public services  
    server: networkConfig.indexerDefault.server, // Always use network-based default
    port: networkConfig.indexerDefault.port // Always use network-based default
  }
};

// Helper functions for network-specific URLs
export const getExplorerUrl = () => config.network.explorerUrl;

export const getAssetExplorerUrl = (assetId: number | string) => 
  `${config.network.explorerUrl}/asset/${assetId}`;

export const getTransactionExplorerUrl = (txId: string) => 
  `${config.network.explorerUrl}/tx/${txId}`;

export const getAddressExplorerUrl = (address: string) => 
  `${config.network.explorerUrl}/address/${address}`;

// Validation function to ensure required config is present
export const validateConfig = () => {
  try {
    // Try to access all config values - this will throw if any are missing
    // Using void to suppress linter warnings about unused expressions
    void config.algorandNetwork;
    void config.network.chainId;
    void config.algod.token;
    void config.algod.server;
    void config.algod.port;
    void config.indexer.token;
    void config.indexer.server;
    void config.indexer.port;

    return true;
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    return false;
  }
};

 