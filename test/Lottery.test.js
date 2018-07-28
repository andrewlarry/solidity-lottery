const assert = require('assert');
const ganche = require('ganache-cli');
const Web3 = require('web3');

const provider = ganche.provider();
const web3 = new Web3(provider);

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode})
    .send({ from: accounts[0], gas: '2000000' });

  lottery.setProvider(provider);
});

describe('Lottery Contract', () => {
  it('Deploys contract', () => {
    assert.ok(lottery.options.address);
  });

  it('Allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({ from: accounts[0] });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('Allows multiple account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });


    const players = await lottery.methods.getPlayers().call({ from: accounts[0] });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it('Requires more than .01 ether to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.01', 'ether')
      });
      assert(false);
    } catch(err) {
      assert(err);
    }
  });

  it('Only the manager can call pickWinner()', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: account[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('Sends money to the winner and resets player array', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);

    const diff = finalBalance - initialBalance;
    assert(diff > web3.utils.toWei('1.8', 'ether'));

    const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
    assert.equal(0, players.length);
    assert.equal(0, await web3.eth.getBalance(lottery.options.address));
  });
});