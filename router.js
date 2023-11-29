const auth_mw = require('./controllers/auth/auth_ver')['authenticateToken'];

var normalizedPath = require("path").join(__dirname, "routes");


const routes = [];

require("fs").readdirSync(normalizedPath).forEach(route=>{
    routes.push(...require("./routes/" + route) );
});


module.exports = function(app){
    const prefix = "/v1/";

    const excludes_pref = [
    ];

    for(let route of routes) {

        if(typeof route.controller !== 'function') {
            console.log(`route not has function ${JSON.stringify(route)}`);
            continue;
        }

        
        const url = !excludes_pref.includes(route.url) ? prefix+route.url : "/"+route.url;
        
        if(route.type && route.type == 'POST') {
            app.post(url, auth_mw(route.auth), route.controller );
            continue;
        }

        if(route.type && route.type == 'PUT') {
            app.put(url, auth_mw(route.auth), route.controller );
            continue;
        }

        if(route.type && route.type == 'DELETE') {
            app.delete(url, auth_mw(route.auth), route.controller );
            continue;
        }

        app.get(url, auth_mw(route.auth), route.controller);
    }
};