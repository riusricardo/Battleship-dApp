var GameRegistry = artifacts.require("GameRegistry");
var EthereumDIDRegistry = artifacts.require("EthereumDIDRegistry");

module.exports = function(deployer) {
	deployer.deploy(GameRegistry);
	deployer.deploy(EthereumDIDRegistry);

};
