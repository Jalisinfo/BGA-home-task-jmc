import client from './client';

/**
 * Generate a new wallet
 */
export const generateWallet = () => {
  return client.post('/api/wallets');
};