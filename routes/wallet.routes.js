//This Router added By JMC for the Wallet

const express = require('express');

const router = express.Router();

const { generateWallet } = require('../controllers/wallet.controller');

router.post('/', generateWallet);

module.exports = router;