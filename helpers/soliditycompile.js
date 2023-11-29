const path = require('path');
const fs = require('fs');
const solc = require('solc');

const { contract } = require('../conf/w3ether.json');

const CONTRACT_FILE = contract.fileName;

const Path = path.resolve(__dirname, '../contracts', CONTRACT_FILE);
const source = fs.readFileSync(Path, 'UTF-8');

var input = {
    language: 'Solidity',
    sources: {
        [CONTRACT_FILE] : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
}; 

module.exports = solc.compile(JSON.stringify(input));