var GameRegistry = artifacts.require("GameRegistry");
var EthereumDIDRegistry = artifacts.require("EthereumDIDRegistry");
var Battleship = artifacts.require("Battleship");

module.exports = function(deployer) {
	deployer.deploy(GameRegistry);
	deployer.deploy(EthereumDIDRegistry);
	deployer.deploy(Battleship);

};
