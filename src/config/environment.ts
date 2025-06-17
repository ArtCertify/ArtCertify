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



// Environment configuration - ALL VALUES MUST COME FROM .env
export const config = {
  // Pinata IPFS Gateway
  pinataGateway: getEnvVar('VITE_PINATA_GATEWAY'),
  
  // Algorand Network
  algorandNetwork: getEnvVar('VITE_ALGORAND_NETWORK'),
  
  // Algorand API endpoints
  algod: {
    token: getEnvVar('VITE_ALGOD_TOKEN', true), // Allow empty for public services
    server: getEnvVar('VITE_ALGOD_SERVER'),
    port: parseInt(getEnvVar('VITE_ALGOD_PORT'))
  },
  
  indexer: {
    token: getEnvVar('VITE_INDEXER_TOKEN', true), // Allow empty for public services
    server: getEnvVar('VITE_INDEXER_SERVER'),
    port: parseInt(getEnvVar('VITE_INDEXER_PORT'))
  }
};

// Validation function to ensure required config is present
export const validateConfig = () => {
  try {
    // Try to access all config values - this will throw if any are missing
    // Using void to suppress linter warnings about unused expressions
    void config.algorandNetwork;
    void config.algod.token;
    void config.algod.server;
    void config.algod.port;
    void config.indexer.token;
    void config.indexer.server;
    void config.indexer.port;

    console.log('✅ All required environment variables are present');
    return true;
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    return false;
  }
};

// Log current configuration (for debugging)
export const logConfig = () => {
  // Only log in production to reduce console noise during development
  if (import.meta.env.MODE === 'production') {
    console.log('🔧 Current Configuration:');
    console.log('  Algorand Network:', config.algorandNetwork);
    console.log('  Algod Server:', config.algod.server);
    console.log('  Indexer Server:', config.indexer.server);
  }
}; 