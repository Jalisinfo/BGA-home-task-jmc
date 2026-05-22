const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const FILE_PATH = path.join(process.cwd(), 'blockchain.json');

/**
 * Save blockchain state to disk
 */
const save = (blockchain) => {
  try {
    const data = {
      chain: blockchain.chain,
      pendingTransactions: blockchain.pendingTransactions,
      difficulty: blockchain.difficulty,
      miningReward: blockchain.miningReward,
    };

    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

    logger.info('Blockchain saved to disk');
  } catch (err) {
    logger.error('Save failed: ' + err.message);
  }
};

/**
 * Load blockchain state from disk
 */
const load = () => {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      logger.warn('No saved blockchain found');
      return null;
    }

    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);

  } catch (err) {
    logger.warn('Load failed or file corrupted: ' + err.message);
    return null;
  }
};

/**
 * Clear saved blockchain (testing)
 */
const clear = () => {
  try {
    if (fs.existsSync(FILE_PATH)) {
      fs.unlinkSync(FILE_PATH);
      logger.info('Blockchain cleared');
    }
  } catch (err) {
    logger.error('Clear failed: ' + err.message);
  }
};

module.exports = {
  save,
  load,
  clear,
};