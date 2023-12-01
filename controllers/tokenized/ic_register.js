const {readFileSync} = require("fs");

const fetch= require("node-fetch");

const { canister_name, canister_ids, host, idl_factory, prived_key } = require("../../conf/ic.json");

const pkgAgent= require('@dfinity/agent');

const pkgPrincipal= require('@dfinity/principal');

const { Secp256k1KeyIdentity } = require("@dfinity/identity-secp256k1");

const sha256 = require("sha256");

const {Principal} = pkgPrincipal;

const {HttpAgent, Actor} = pkgAgent;

const {idlFactory}= require(idl_factory);


const getIdentity = () => {

    const rawKey = readFileSync(prived_key).toString();

    const rawBuffer = Uint8Array.from(rawKey).buffer;

    const privKey = Uint8Array.from(sha256(rawBuffer, { asBytes: true }));

    const identity = Secp256k1KeyIdentity.fromSecretKey(privKey);

    return identity;

}

//Contract set storage by id real-estate
/**
 * type Contract = {
        name: Text; 
        id: Text;
        ipn: Text;
        addr: Text;
    };
 */


const actorCanisterIdLocal = () => {
    const buffer = readFileSync(canister_ids);
    const ids = JSON.parse(buffer.toString('utf-8'));
    return Principal.fromText( ids[canister_name].local);
};

exports.actorIC = async () => {

    const canisterId = actorCanisterIdLocal();

    const agent = new HttpAgent({identity: getIdentity(), fetch, host});
    await agent.fetchRootKey();
    return Actor.createActor(idlFactory, {
        agent,                                                                                                                                                                                                                                                                                                      
        canisterId
    });
};


exports.set_info = async ({id, info}) => {
    const actor = await actorIC();
    return actor.set(id, info);
};


exports.ic_set_user_profile = async ({id, profile}) => {
    const actor = await actorIC();
    return actor.user_profile_set(id, profile);
}

exports.get_user_profile = async ({key}) => {
    const actor = await actorIC();
    return actor.user_profile_get(key);
}

exports.ic_set_asset_info = async(key, {id, status_rec, addr, name}) => {
    const actor = await actorIC();
    return actor.asset_set(key, {id, status_rec, addr, name});
}

exports.ic_get_asset_info = async(key) => {
    const actor = await actorIC();
    return actor.asset_get(key);
}