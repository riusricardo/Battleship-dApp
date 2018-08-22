var ContractFactory = artifacts.require("ContractFactory");


module.exports = function(deployer) {

//var by1 = '0x' + require('crypto').randomBytes(3000).toString('hex');
//var by2 = '0x' + require('crypto').randomBytes(5000).toString('hex');
//var by3 = '0x' + require('crypto').randomBytes(7000).toString('hex');
var by4 = '0x' + require('crypto').randomBytes(9000).toString('hex');
var by5 = '0x' + require('crypto').randomBytes(11000).toString('hex');
var by6 = '0x' + require('crypto').randomBytes(13000).toString('hex');
var by7 = '0x' + require('crypto').randomBytes(15000).toString('hex');


/*
ContractFactory.deployed().then(function(instance) {
instance.setBytecode(by1)
})
ContractFactory.deployed().then(function(instance) {
instance.setBytecode(by2);
})
ContractFactory.deployed().then(function(instance) {
instance.setBytecode(by3);
})
*/
ContractFactory.deployed().then(function(instance) {
instance.setBytecode(by4);
})
ContractFactory.deployed().then(function(instance) {
instance.setBytecode(by5);
})
ContractFactory.deployed().then(function(instance) {
instance.setBytecode(by6);
})
ContractFactory.deployed().then(function(instance) {
instance.setBytecode(by7);
})

};


var ContractFactory = artifacts.require("ContractFactory");
var Battleship = artifacts.require("Battleship");


module.exports = function(deployer) {

function sleep (seconds) {
    return new Promise((resolve, reject) => setTimeout(resolve, seconds * 1000));
}

var battleship = Battleship.bytecode;

var by8 = '0x' + require('crypto').randomBytes(17000).toString('hex');
var by9 = '0x' + require('crypto').randomBytes(19000).toString('hex');
var by10 = '0x' + require('crypto').randomBytes(21000).toString('hex');
var by11 = '0x' + require('crypto').randomBytes(23000).toString('hex');
var by12 = '0x' + require('crypto').randomBytes(25000).toString('hex');


ContractFactory.deployed().then(function(instance) {
instance.setBytecode(by8);
})
ContractFactory.deployed().then(function(instance) {
instance.setBytecode(by9);
})
ContractFactory.deployed().then(function(instance) {
instance.setBytecode(by10);
})
ContractFactory.deployed().then(function(instance) {
instance.setBytecode(by11);
})
ContractFactory.deployed().then(function(instance) {
instance.setBytecode(by12);
})
ContractFactory.deployed().then(function(instance) {
	instance.setBytecode(battleship)
})


};


