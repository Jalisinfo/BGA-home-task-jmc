import React, { useState } from 'react';
import './Wallet.css';

import { generateWallet } from '../api/wallet.api';
import { fetchBalance } from '../api/blockchain.api';

const Wallet = ({ setWallet }) => {

  const [walletLocal, setWalletLocal] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createWallet = async () => {
    setLoading(true);
    setMessage('');

    try {
      const data = await generateWallet();

      const walletObj = {
        publicKey: data.publicKey,
        privateKey: data.privateKey,
      };

      // store globally (App)
      setWallet(walletObj);

      // store locally (for display)
      setWalletLocal(walletObj);

      // fetch balance
      const balanceResponse = await fetchBalance(data.publicKey);
      const balanceData = balanceResponse.data || balanceResponse;

      setBalance(balanceData.balance ?? 0);

      setMessage('Wallet generated successfully!');

    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Failed to generate wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-container">

      <h2 className="panel-title">Wallet Generator</h2>

      <button
        className="wallet-button"
        onClick={createWallet}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Wallet'}
      </button>

      {message && (
        <div className={`wallet-message ${
          message.includes('success') ? 'success' : 'error'
        }`}>
          {message}
        </div>
      )}

      {/* 🔥 DISPLAY WALLET INFO */}
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