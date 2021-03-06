const SHA256 = require('crypto-js/sha256');
const EC =require('elliptic').ec;
const ec = new EC('secp256k1');
class Transaction{
    constructor(fromAddress , toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress =toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey)
    {
        if(signingKey.getPublic('hex')!= this.fromAddress){
            throw new Error('You cannot sign transactions for the other wallets: ');
        }
        const hasTx = this.calculateHash();
        const sig =signingKey.sign(hasTx ,'base64');
        this.signature = sig.toDER('hex');
    }

    isValid()
    {
        if(this.fromAddress == null) return true;

        if(!this.signature || this.signature.length == 0)
        {
            throw new Error('No signature in this transaction');
        }
        if(this.signature  || this.signature.length == 0){
            const publicKey = ec.keyFromPublic(this.fromAddress ,'hex');
            return publicKey.verify(this.calculateHash(), this.signature);
        }
    }

}

class Block{
    constructor(timestamp,transaction,previousHash =''){
        this.timestamp=timestamp;
        this.transaction = transaction;
        this.previousHash = previousHash;
        this.hash=this.calculateHash();
        this.nonce = 0;

    }
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp+ + this.nonce+ JSON.stringify(this.transaction)).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty)!== Array(difficulty+1).join("0")){
            this.nonce++;
            this.hash=this.calculateHash();
        }
        console.log("Block mined: "+ this.hash);

        }
        hasValidTransaction(){
            for(const tx of this.transaction){
                if(!tx.isValid()){
                    return true;
                }
            }
        }
}

class Blockchain{
    constructor(){
        this.chain =[this.createGenesisBlock()];
        this.difficulty =2;
        this.pendingTransaction =[];
        this.miningReward =1;
        
    }

    createGenesisBlock()
    {
        return new Block(0,"01/10/2017", "Genesis Block","0");
    }
    
    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    minePendingTransaction(miningRewardAddress)
    {
        let block = new Block(Date.now(), this.pendingTransaction);
        block.mineBlock(this.difficulty);

        console.log("Block successfully mined : ")
        this.chain.push(block);

        this.pendingTransaction=[
            new Transaction (null, miningRewardAddress, this.miningReward)
        ];
    }

    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transation must include from and to address');
        }

        if(!transaction.isValid())
        {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransaction.push(transaction);
    }

    getBalanceofAddress(address){
        let balance = 0;
        
        for(const block of this.chain){
            for(const trans of block.transaction){
                if(trans.fromAddress == address){
                    balance = trans.amount;
                }

                if(trans.toAddress == address){
                    balance = trans.amount;
                }
            }

        }
        return balance;
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    isChainValid()
    {
        for(let i= 1; i<this.chain.length; i++)
        {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];
            
            if(!currentBlock.hasValidTransaction()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash())
            {
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash)
            {
                return false;
            }
        }
     return true;
    }

}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;