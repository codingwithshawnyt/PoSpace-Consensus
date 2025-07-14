const { sha256, SimpleVDF } = require('./crypto');

class Block {
    constructor(prevHash, minerId, posProof, vdfOutput) {
        this.prevHash = prevHash;
        this.minerId = minerId;
        this.posProof = posProof; //proof of space from plotter
        this.vdfOutput = vdfOutput; //proof of time
        this.timestamp = Date.now();
    }

    getHash() {
        const proofCopy = this.posProof ? { ...this.posProof, quality: this.posProof.quality.toString() } : null;
        return sha256(this.prevHash + this.minerId + JSON.stringify(proofCopy) + this.vdfOutput);
    }
}

class PoSpaceChain {
    constructor(vdfDifficulty) {
        this.chain = [this.createGenesis()];
        this.vdf = new SimpleVDF(vdfDifficulty);
    }

    createGenesis() {
        return new Block("0", "genesis", null, "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    //verify a new block
    addBlock(newBlock) {
        const lastBlock = this.getLatestBlock();
        
        //1. check link
        if (newBlock.prevHash !== lastBlock.getHash()) return false;

        //2. verify the vdf "time" proof
        //the input to the vdf is the pos proof quality
        if (!this.vdf.verify(newBlock.posProof.quality.toString(), newBlock.vdfOutput)) {
            //console.log("invalid vdf proof");
            return false;
        }

        this.chain.push(newBlock);
        return true;
    }
}

module.exports = { PoSpaceChain, Block };
