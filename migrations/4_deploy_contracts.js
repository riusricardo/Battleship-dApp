var AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
var ContractFactory = artifacts.require("ContractFactory");

module.exports = function(deployer) {

	deployer.deploy(AdminUpgradeabilityProxy, ContractFactory.address);

};


