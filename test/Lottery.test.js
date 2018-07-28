const assert = require('assert');
const ganche = require('ganache-cli');
const Web3 = require('web3');

const provider = ganche.provider();
const web3 = new Web3(provider);

const { interface, bytecode } = require('../compile');

let accounts;
let inbox; 
const INITIAL_STRING = 'Hi there!';

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Use one of those accounts to deploy contract

  // JSON.parse(interface) = JS object that represents the ABI
  inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: [INITIAL_STRING] })
    .send({ from: accounts[0], gas: '1000000' });

  inbox.setProvider(provider);
});

describe('Inbox', () => {
  it('Deploys a contract', () => {
    // Fails if argument is null or undefined
    assert.ok(inbox.options.address);
  });

  it('Initializes message with constructor argument', async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, INITIAL_STRING);
  });

  it('Sets a new message with the setMessage() method', async () => {
    await inbox.methods.setMessage('testing').send({ from: accounts[0] });
    const message = await inbox.methods.message().call();
    assert.equal(message, 'testing');
  });
});
