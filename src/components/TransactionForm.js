import React, { useState } from 'react';
import { ec as EC } from 'elliptic';
import SHA256 from 'crypto-js/sha256';

import './TransactionForm.css';
import { addTransaction } from '../api/blockchain.api';

const TransactionForm = ({ wallet, onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    fromAddress: '',
    toAddress: '',
    amount: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const ec = new EC('secp256k1');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!wallet?.privateKey) {
      setMessage('Wallet not loaded');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { fromAddress, toAddress, amount } = formData;

      const timestamp = Date.now();

      // MUST match backend EXACTLY
      const hash = SHA256(
        String(timestamp) +
        String(fromAddress) +
        String(toAddress) +
        String(amount)
      ).toString();

      const key = ec.keyFromPrivate(wallet.privateKey);
      const signature = key.sign(hash, 'hex').toDER('hex');
      await addTransaction({
        fromAddress,
        toAddress,
        amount: Number(amount),
        timestamp,
        signature,
      });

      setMessage('Transaction signed and sent successfully!');

      setFormData({
        fromAddress: '',
        toAddress: '',
        amount: '',
      });

      onTransactionAdded();

    } catch (err) {
      setMessage(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form">
      <h2 className="panel-title">Create Transaction</h2>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>From Address (Public Key)</label>
          <textarea
            name="fromAddress"
            value={formData.fromAddress}
            onChange={handleChange}
            rows={6}
            required
          />
        </div>

        <div className="form-group">
          <label>To Address</label>
          <textarea
            name="toAddress"
            value={formData.toAddress}
            onChange={handleChange}
            rows={6}
            required
          />
        </div>

        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        {message && (
          <div className="form-message">
            {message}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>

      </form>
    </div>
  );
};

export default TransactionForm;