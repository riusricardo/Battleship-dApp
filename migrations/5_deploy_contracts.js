var ContractFactory = artifacts.require("ContractFactory");
var GameRegistry = artifacts.require("GameRegistry");
var Battleship = artifacts.require("Battleship");

module.exports = function(deployer) {

	GameRegistry.deployed().then(function(instance) {
	  	instance.setFactory(ContractFactory.address);
	})

/*
	ContractFactory.deployed().then(function(instance) {
		instance.setBytecode(Battleship.bytecode);
	})
*/
};


