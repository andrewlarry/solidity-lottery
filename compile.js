const path = require('path');
const fs = require('fs');
const { compile } = require('solc');

// Path to a smart contract
const contractPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const source = fs.readFileSync(contractPath, 'utf8');

module.exports = compile(source, 1).contracts[':Inbox'];

