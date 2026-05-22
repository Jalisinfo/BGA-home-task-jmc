// This controller added By JMC for the Wallet

const { sendSuccess, sendError } = require('../utils/response');

const crypto = require('crypto');
const { ec: EC } = require('elliptic');
const ec = new EC('secp256k1');

const generateWallet = (req, res) => {
  try {
    const key = ec.genKeyPair();

    const publicKey = key.getPublic('hex');
    const privateKey = key.getPrivate('hex');

    return sendSuccess(res, {
      publicKey,
      privateKey,
    });
  } catch (err) {
    return sendError(res, 'Failed to generate wallet', 500);
  }
};

module.exports = { generateWallet };