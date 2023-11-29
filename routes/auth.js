const target = require('../controllers/auth/auth_ver');

module.exports=[
    { url: "ray", controller: target.getRayWebToken, auth:[] },
    { url: "verify", controller: target.verifySign, type: "POST", auth:[] },
    { url: "sign", controller: target.signOverRay, type: "POST", auth: [] },
    { url: "jwt", controller: target.checkJWT, type: "POST", auth: []},
    { url: "profile", controller: target.createUpdateUser, type: "PUT", auth:["user"]},
    { url: "profile", controller: target.getProfile, auth:["user"]},
    { url: "profile", controller: target.getProfile, type: "DELETE", auth:["user"]},
]