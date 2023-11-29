const target = require('../controllers/realestate');

module.exports=[
    { url: "my_real_estate", controller: target.my_real_estate, auth:['user'] },
    { url: "objects", controller: target.getObjects, auth:['user'] },
    { url: "details/:id", controller: target.getDetails, auth:['user'] },
    { url: "object", controller: target.saveNewObject, type: 'POST', auth:['user']},
    { url: "object/:id", controller: target.updateObject, type: 'PUT', auth:['user']},
    { url: "object_tokenized", controller: target.getDetailsTokenized, auth:['user'] }
]