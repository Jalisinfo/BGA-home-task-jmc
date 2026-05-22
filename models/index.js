const config = require('../config');
const logger = require('../utils/logger');
const { Blockchain, Block, Transaction } = require('./blockchain');

const persistenceService = require('../services/persistence.service');
const loadedState = persistenceService.load();

let blockchain;

if (loadedState) {
  try {

    /**
     * Validate basic structure BEFORE rehydration
     */
    if (!loadedState.chain || !Array.isArray(loadedState.chain)) {
      throw new Error('Invalid blockchain structure');
    }

    blockchain = new Blockchain(
      config.blockchain.difficulty,
      config.blockchain.miningReward
    );

    /**
     * Rehydrate blockchain chain safely
     */
    blockchain.chain = loadedState.chain.map((blockData) => {

      const transactions = (blockData.transactions || []).map((txData) => {
        const tx = new Transaction(
          txData.fromAddress,
          txData.toAddress,
          txData.amount
        );

        tx.timestamp = txData.timestamp;
        tx.signature = txData.signature;

        return tx;
      });

      const block = new Block(
        blockData.timestamp,
        transactions,
        blockData.previousHash
      );

      block.hash = blockData.hash;
      block.nonce = blockData.nonce;

      return block;
    });

    /**
     * Rehydrate pending transactions safely
     */
    blockchain.pendingTransactions =
      (loadedState.pendingTransactions || []).map((txData) => {
        const tx = new Transaction(
          txData.fromAddress,
          txData.toAddress,
          txData.amount
        );

        tx.timestamp = txData.timestamp;
        tx.signature = txData.signature;

        return tx;
      });

    /**
     * Restore settings safely
     */
    blockchain.difficulty =
      loadedState.difficulty ?? config.blockchain.difficulty;

    blockchain.miningReward =
      loadedState.miningReward ?? config.blockchain.miningReward;

    /**
     * FINAL VALIDATION (critical safety layer)
     */
    if (!blockchain.isChainValid()) {

      logger.warn(
        '⚠️ Loaded blockchain failed validation. Resetting to fresh chain.'
      );

      blockchain = new Blockchain(
        config.blockchain.difficulty,
        config.blockchain.miningReward
      );

    } else {

      logger.info(
        '✅ Blockchain restored successfully from persistence storage.'
      );
    }

  } catch (error) {

    logger.warn(
      `⚠️ Failed to restore blockchain (corrupt/invalid state): ${error.message}`
    );

    blockchain = new Blockchain(
      config.blockchain.difficulty,
      config.blockchain.miningReward
    );
  }

} else {

  logger.info(
    'ℹ️ No persisted blockchain found. Starting fresh blockchain.'
  );

  blockchain = new Blockchain(
    config.blockchain.difficulty,
    config.blockchain.miningReward
  );
}

module.exports = {
  blockchain,
  Blockchain,
  Block,
  Transaction,
};