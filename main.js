const { Blockchain , Transaction } = require("./blockchain");

const EC =require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('6966e6a49e9b2c6aad1b8ced7d40d54490f32e13f0df761c8773d274ebb2285a');

const mywalletAddress = myKey.getPublic('hex');

let iomt = new Blockchain();

const tx1 = new Transaction(mywalletAddress, 'public key goes here',10);
tx1.signTransaction(myKey);
iomt.addTransaction(tx1);


console.log('\n Starting the miner....');

iomt.minePendingTransaction('mywalletAddress');

console.log('\n Balance of ankur is ', iomt.getBalanceofAddress('mywalletAddress'));

console.log('\n Starting the miner again....');

iomt.minePendingTransaction('mywalletAddress');

console.log('\n Balance of ankur is ', iomt.getBalanceofAddress('mywalletAddress'));