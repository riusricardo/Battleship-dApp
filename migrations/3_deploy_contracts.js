var GameRegistry = artifacts.require("GameRegistry");
var ContractFactory = artifacts.require("ContractFactory");
var EthereumDIDRegistry = artifacts.require("EthereumDIDRegistry");

module.exports = function(deployer) {

function sleep (seconds) {
    return new Promise((resolve, reject) => setTimeout(resolve, seconds * 1000));
}

  deployer.deploy(ContractFactory, EthereumDIDRegistry.address, GameRegistry.address)
	.then(function(instance) {
			var tx;
			for(var i = 0 ; i < 2; i++){
					tx = instance.setBytecode('0x' + require('crypto').randomBytes(i * 2000).toString('hex'));
				}
			return tx;
		}
	)
};
