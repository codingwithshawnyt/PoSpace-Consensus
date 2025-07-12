const { sha256 } = require('./crypto');

//this simulates the "plotting" phase
//provers store these values to prove they have disk space
class Plotter {
    constructor(id, size) {
        this.id = id;
        this.size = size;
        this.data = new Map();
    }

    //generate some "plots" based on the miner id
    generate() {
        //each entry is a proof of space bit
        for (let i = 0; i < this.size; i++) {
            const key = sha256(`${this.id}-${i}`);
            this.data.set(key, i);
        }
    }

    //find the best match for a challenge
    getBestProof(challenge) {
        let bestQuality = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
        let bestProof = null;

        for (let [plotKey, index] of this.data) {
            //xor distance or just hash distance
            const quality = BigInt('0x' + sha256(plotKey + challenge));
            if (quality < bestQuality) {
                bestQuality = quality;
                bestProof = { plotKey, index, quality };
            }
        }
        return bestProof;
    }
}

module.exports = { Plotter };
