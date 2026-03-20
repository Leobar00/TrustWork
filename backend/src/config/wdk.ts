import dotenv from 'dotenv';

dotenv.config();

export const wdkConfig = {
  apiKey: process.env.WDK_API_KEY || '',
  network: process.env.WDK_NETWORK || 'testnet',
  contractAddress: process.env.WDK_CONTRACT_ADDRESS || '',
  rpcUrl: process.env.WDK_RPC_URL || 'https://testnet.tether.to',
  confirmations: 2,
  gasLimit: 100000,
  maxRetries: 3,
};

export const validateWdkConfig = () => {
  if (!wdkConfig.apiKey) {
    console.warn('⚠️  WDK_API_KEY not set. Blockchain features will be simulated.');
    return false;
  }
  return true;
};

export default wdkConfig;
