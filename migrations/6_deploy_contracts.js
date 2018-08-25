var ContractFactory = artifacts.require("ContractFactory");
var Battleship = artifacts.require("Battleship");

module.exports = function(deployer) {

	var battleship = '0x0';
	battleship = Battleship.bytecode.toString();

	ContractFactory.deployed().then(function(instance) {
			var tx;
			var size = 47492//battleship.lenght;
			var pos=15064;
			var i=0;
			while(i <= size){
				i = pos === size ? size + 1 : pos;
				tx = instance.setBytecode(battleship.slice(0, pos));
				pos = pos > size ? size : (pos + 3000);
				pos = pos > size ? size : pos;
			}
			return tx;
		}
	)
};



