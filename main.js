const { Plotter } = require('./plotter');
const { PoSpaceChain, Block } = require('./consensus');
const { SimpleVDF } = require('./crypto');

//set up the sim
const vdfDiff = 10000; //how much "time" per block
const chain = new PoSpaceChain(vdfDiff);
const vdf = new SimpleVDF(vdfDiff);

//create a couple of miners
const minerA = new Plotter("miner_a", 100);
const minerB = new Plotter("miner_b", 100);

console.log("plotting...");
minerA.generate();
minerB.generate();

async function simulate() {
    console.log("starting consensus sim...");
    
    for (let i = 0; i < 3; i++) {
        const lastBlock = chain.getLatestBlock();
        const challenge = lastBlock.getHash();

        console.log(`\n--- Round ${i+1} (Challenge: ${challenge.substring(0,10)}...) ---`);

        //both miners look for proofs in their space
        const proofA = minerA.getBestProof(challenge);
        const proofB = minerB.getBestProof(challenge);

        //whoever has the better quality wins the right to run the VDF
        const winner = proofA.quality < proofB.quality ? {id: "miner_a", proof: proofA} : {id: "miner_b", proof: proofB};
        
        console.log(`winner: ${winner.id} (quality: ${winner.proof.quality.toString().substring(0,10)}...)`);
        console.log("running VDF for fairness...");
        
        //simulating the wait
        const startTime = Date.now();
        const vdfOut = vdf.execute(winner.proof.quality.toString());
        const duration = Date.now() - startTime;

        const newBlock = new Block(challenge, winner.id, winner.proof, vdfOut);
        
        if (chain.addBlock(newBlock)) {
            console.log(`block added! hash: ${newBlock.getHash().substring(0,15)}... (took ${duration}ms)`);
        }
    }

    console.log("\nfinal chain length:", chain.chain.length);
}

simulate().catch(console.error);
