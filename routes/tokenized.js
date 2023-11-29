const target = require('../controllers/tokenized');

module.exports=[
    { url: "abi", controller: target.getCompileContractSolidity, auth:[]},
    { url: "nettest", controller: target.testNetwork, auth: []},
    { url: "deploycontract", controller: target.deployContract, type: 'POST', auth: ['user']},
    { url: "testsetowner", controller: target.testTokenezed, auth:[]},
    { url: "p2p_platforms", controller: target.p2p_platforms_list, auth:['']},
    { url: "p2p_selected/:id",  type: 'POST', controller: target.setSelectedPlatform, auth:['user'] },
    { url: "new_owner/:id_obj",  type: 'POST', controller: target.setNewOwner, auth:['user'] },
]