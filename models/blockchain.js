const crypto = require('crypto');

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class Transaction {
  constructor(fromAddress, toAddress, amount, signature = '', timestamp = Date.now()) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.signature = signature;
    this.timestamp = timestamp;
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        String(this.timestamp) +
        String(this.fromAddress) +
        String(this.toAddress) +
        String(this.amount)
      )
      .digest('hex');
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }
  
    const hashTx = this.calculateHash();
  
    const sig = signingKey.sign(hashTx, 'hex');
  
    this.signature = sig.toDER('hex');
  }
  
  isValid() {

    if (this.fromAddress === null) {
      return true;
    }
  
    if (!this.signature || this.signature.length === 0) {
      return false;
    }
  
    try {
  
      const EC = require('elliptic').ec;
      const ec = new EC('secp256k1');
  
      /**
       * Rebuild public key from wallet address
       */
      const publicKey = ec.keyFromPublic(
        this.fromAddress,
        'hex'
      );
  
      /**
       * Verify transaction hash against signature
       */
      return publicKey.verify(
        this.calculateHash(),
        this.signature
      );
  
    } catch (err) {
  
      return false;
    }
  }
}

class Blockchain {
  constructor(difficulty, miningReward) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty || 2;
    this.pendingTransactions = [];
    this.miningReward = miningReward || 100;
  }

  createGenesisBlock() {
    return new Block(Date.now(), [], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    this.chain.push(block);
    this.pendingTransactions = [];

    //JMC ADDED this for Persistence...
    const persistenceService = require('../services/persistence.service');
    persistenceService.save(this);
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    /* JMC Added
    const senderBalance = this.getBalanceOfAddress(transaction.fromAddress);
    if (senderBalance < transaction.amount) {
      throw new Error('Insufficient balance');
    }
    */

    /*if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }*/

    // 🔐 IMPORTANT: signature validation MUST happen here
    if (typeof transaction.isValid === 'function') {
      if (!transaction.isValid()) {
        throw new Error('Invalid signature');
      }
    }

    this.pendingTransactions.push(transaction);

    //JMC ADDED THESE for Persistence...
    const persistenceService = require('../services/persistence.service');
    persistenceService.save(this);

  }

  getBalanceOfAddress(address) {
    let balance = 0;
  
    const normalize = (v) => (v ? String(v).trim() : '');
    const addr = normalize(address);
  
    for (const block of this.chain) {
      if (!block.transactions) continue;
  
      for (const trans of block.transactions) {
        const from = normalize(trans.fromAddress);
        const to = normalize(trans.toAddress);
  
        const amount = Number(trans.amount) || 0;
  
        if (from === addr) {
          balance -= amount;
        }
  
        if (to === addr) {
          balance += amount;
        }
      }
    }
  
    return balance;
  }
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (!current.hasValidTransactions()) return false;
      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
    }

    return true;
  }

  getAllTransactions() {
    return this.chain.flatMap((block) => block.transactions);
  }
}

module.exports = { Blockchain, Block, Transaction };
