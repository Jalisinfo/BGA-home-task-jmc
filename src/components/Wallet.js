import React, { useEffect, useState } from 'react';
import './Wallet.css';

import { generateWallet } from '../api/wallet.api';
import { fetchBalance } from '../api/blockchain.api';

const WALLET_STORAGE_KEY = 'jmc_wallet';

const Wallet = ({ setWallet }) => {

  const [walletLocal, setWalletLocal] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  /**
   * Load wallet on first render (PERSISTENCE)
   */
  useEffect(() => {
    const saved = localStorage.getItem(WALLET_STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      setWalletLocal(parsed);
      setWallet(parsed);

      loadBalance(parsed.publicKey);
    }
  }, []);

  /**
   * Fetch balance helper
   */
  const loadBalance = async (publicKey) => {
    try {
      const res = await fetchBalance(publicKey);
      const balance =
        res?.data?.balance ??
        res?.balance ??
        0;
  
      setBalance(Number(balance));
  
    } catch (err) {
      console.error('Balance fetch failed:', err.message);
    }
  };

  /**
   * Generate wallet
   */
  const createWallet = async () => {
    setLoading(true);
    setMessage('');

    try {
      const data = await generateWallet();

      const walletObj = {
        publicKey: data.publicKey,
        privateKey: data.privateKey,
      };

      // SAVE TO LOCAL STORAGE
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletObj));

      // UPDATE STATE
      setWallet(walletObj);
      setWalletLocal(walletObj);

      await loadBalance(walletObj.publicKey);

      setMessage('Wallet generated successfully!');

    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Failed to generate wallet');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate NEW wallet (overwrite old)
   */
  const resetWallet = async () => {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    setWallet(null);
    setWalletLocal(null);
    setBalance(0);
    setMessage('Wallet reset. You can generate a new one.');
  };

  return (
    <div className="wallet-container">

      <h2 className="panel-title">Wallet Generator</h2>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className="wallet-button"
          onClick={createWallet}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Wallet'}
        </button>

        <button
          className="wallet-button secondary"
          onClick={resetWallet}
        >
          New Wallet
        </button>
      </div>

      {message && (
        <div className={`wallet-message ${
          message.includes('success') ? 'success' : 'error'
        }`}>
          {message}
        </div>
      )}

      {/* WALLET DISPLAY */}
      {walletLocal && (
        <div className="wallet-details">

          <div className="wallet-section">
            <h3>Public Key (Wallet Address)</h3>
            <textarea
              readOnly
              value={walletLocal.publicKey}
              rows={10}
              cols={80}
            />
          </div>

          <div className="wallet-section">
            <h3>Balance</h3>
            <h2>{balance}</h2>
          </div>

        </div>
      )}

    </div>
  );
};

export default Wallet;