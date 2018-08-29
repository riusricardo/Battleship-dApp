var ContractFactory = artifacts.require("ContractFactory");
var GameRegistry = artifacts.require("GameRegistry");

module.exports = function(deployer) {
	
	GameRegistry.deployed().then(function(instance) {
	  	instance.setFactory(ContractFactory.address);
	})



};


