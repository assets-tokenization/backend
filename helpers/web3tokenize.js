const { Web3 } = require("web3");

const Tx = require('ethereumjs-tx').Transaction;
const Common = require('ethereumjs-common').default;

const config = require("../conf/w3ether.json");

async function sendTx(web3, account, transaction, to) {
      // Define the sender and receiver addresses, and the private key
      const sender = account.address;
      const receiver = to;
      const privateKey = Buffer.from(config.privedkey, 'hex');

      console.log(`config.privedkey ${config.privedkey}`);

      console.log(`privateKey ${privateKey}`);

      return {};

      // Define the gas limit
      const gasLimit = await web3.eth.estimateGas({
          from: sender,
          to: receiver,
      });

      console.log(`gasLimit ${gasLimit}`);

  
      // Get the transaction count for the sender address
      const nonce = await web3.eth.getTransactionCount(sender);

      console.log(`nonce ${nonce}`);

  
      // Define the transaction object
      const transactionObject = {
          to: receiver,
          gasPrice: web3.utils.toHex(web3.utils.toWei('50', 'gwei')),
          gasLimit: web3.utils.toHex(gasLimit),
          data    : transaction.encodeABI(),
          nonce: web3.utils.toHex(nonce)
      };


      console.log(`transactionObject ${JSON.stringify(transactionObject) }`);

      let common = null;
  
      try {
      
        // Define the chain configuration
        common = Common.forCustomChain(
            'mainnet', {
                name: 'kit',
                networkId: 5777,
                chainId: 1337,
            },
            'kyiv'
        );
    } catch (err) {
        console.log(`err common ${err}`);
    }

    console.log(`common ${common}`);
  
      // Create a new transaction object to sign 
      const tx = new Tx(transactionObject, {
          common
      });

      console.log(`tx ${tx}`);
  
      // Sign the transaction using the private key  
      const signedTx = tx.sign(config.privedkey);
  
      // Serialize the signed transaction and send it to the blockchain 
      const serializedTx = tx.serialize();
      const rawTransaction = '0x' + serializedTx.toString('hex');

      console.log(`awTransaction ${awTransaction}`);

      const receipt = await web3.eth.sendSignedTransaction(rawTransaction);
      return receipt;

}

async function send(web3, account, transaction, to) {
    const options  = {
        from    : account.address,
        to      : to,
        nonce   : await web3.utils.toHex(web3.eth.getTransactionCount(account.address)),
        data    : transaction.encodeABI(),
        gas     : await transaction.estimateGas({from: account.address}),
        gasPrice: config.gasPriceTokenize,
        common: {
            baseChain: 'ganache',
            hardfork: 'kyiv',
            customChain: {
              name: 'ber-kitsoft',
              chainId: 1337,
              networkId: 5777
            }
          }
    };
    const signed  = await web3.eth.accounts.signTransaction(options, account.privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
    return receipt;
}

async function deploy({info, params}) {

    const { abi, bytecode } = info;

    const { name, symbol, owner, id_real_estate, description, p2p_platform } = params;


    const web3 = new Web3(
        new Web3.providers.HttpProvider(config.url),
    );
    web3.eth.Contract.handleRevert = true;
    

    // Using the signing account to deploy the contract
    const Contract = new web3.eth.Contract(abi);

    const account = web3.eth.accounts.privateKeyToAccount(config.privedkey);

    web3.eth.accounts.wallet.add(account);

    web3.eth.defaultAccount = account.address;


    //return 0;

    const contract = Contract.deploy({
        data: '0x' + bytecode,
        arguments: [name, symbol, config.account, config.drawAddress, owner, description, id_real_estate, p2p_platform],
    });

    // optionally, estimate the gas that will be used for development and log it
    const gas = await contract.estimateGas({
        from: web3.eth.defaultAccount,
    });

    console.log('estimated gas:', gas);

    try {
        const tx = await contract.send({
            from: web3.eth.defaultAccount,
            gas,
            gasPrice: config.gasPriceDeploy
        })
        console.log('Contract deployed at address: ' + tx.options.address);
        return tx.options.address;
    } catch (err){
        console.log(`error by dploy contract ${err}`);
        return err;
    }
}

async function set_owner_tokenize({abi, wallet, token, id_real_estate, name_contract, description}) {

    const web3 = new Web3(
        new Web3.providers.HttpProvider(config.url),
    );
    web3.eth.Contract.handleRevert = true;

    const account = web3.eth.accounts.privateKeyToAccount(config.privedkey);

    console.log(`account ${JSON.stringify(account) }`);

    web3.eth.accounts.wallet.add(account);

    web3.eth.defaultAccount = account.address;

    const contract = new web3.eth.Contract(abi, token);

    //contract.defaultCommon = { customChain: { name: 'ber_kitsoft', chainId: 1337, networkId: 5777}};

    const transaction = contract.methods.tokenize(wallet, id_real_estate, name_contract, description);




        const result = await sendTx(web3, account, transaction, wallet);
        
        //console.log('Transaction Hash: ' + result.transactionHash);

        return result;


}

async function test_network(res){
    // Set up a connection to the Ganache network
    const web3 = new Web3(
        new Web3.providers.HttpProvider(config.url),
    );

    // Log the current block number to the console
    web3.eth
        .getBlockNumber()
        .then(result => {
            console.log('Current block number: ' + result);

            res.json({'block_number': Number(result) });
        })
        .catch(error => {
            console.error(error);
            res.json({ error });
        });
}

exports.deploy = deploy;
exports.set_owner_tokenize = set_owner_tokenize;
exports.test_network = test_network;