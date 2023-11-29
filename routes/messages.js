const target = require('../controllers/messages');

module.exports=[
    { url: "messages", controller: target.getAll, auth:['user'] }
]