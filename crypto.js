const crypto = require('crypto');

//simple helper for sha256
function sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

//VDF implementation - simulated with repeated hashing
//real one would use rsa groups but this works for a poc
class SimpleVDF {
    constructor(difficulty) {
        this.difficulty = difficulty;
    }

    //this is the "delay" part
    execute(input) {
        let curr = input;
        for (let i = 0; i < this.difficulty; i++) {
            curr = sha256(curr);
        }
        return curr;
    }

    //simulating fast verification
    verify(input, output) {
        //in a real vdf this would be way faster than execute()
        //here we just redo it for the sake of the demo logic
        return this.execute(input) === output;
    }
}

module.exports = { sha256, SimpleVDF };
