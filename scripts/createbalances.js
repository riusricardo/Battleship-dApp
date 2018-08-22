eth.sendTransaction({from: eth.accounts[0], to: eth.accounts[1], value: web3.toWei(100, "ether")});
eth.sendTransaction({from: eth.accounts[0], to: eth.accounts[2], value: web3.toWei(100, "ether")});
eth.sendTransaction({from: eth.accounts[0], to: eth.accounts[3], value: web3.toWei(100, "ether")});
eth.sendTransaction({from: eth.accounts[0], to: eth.accounts[4], value: web3.toWei(100, "ether")});

/*
personal.unlockAccount(eth.accounts[0], "",36000);
personal.unlockAccount(eth.accounts[1], "",36000);
personal.unlockAccount(eth.accounts[2], "",36000);
personal.unlockAccount(eth.accounts[3], "",36000);
personal.unlockAccount(eth.accounts[4], "",36000);

*/

// PRIVATE KEYS
//eth.accounts[1]: 37FCCE32C2C2877C104FFC3F30801554C3BEA6D9462414BF4D5E64FE1DD73D60
//eth.accounts[2]: 8A19339D45AA79DA244078C755019F915FFB25342F81F4393F8AD0674F880642
//eth.accounts[3]: f0f405ed75968bd400fa27f378780740ecbf8a08a39f73eeec9fb2d3462fe9b5
//eth.accounts[4]: a004e8f49f0ec90970113a68c880547e523d4c15ade45efddab3268c43c4d589
