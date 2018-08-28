
var ContractFactory = artifacts.require("ContractFactory");

contract('ContractFactory', function(accounts) {
    let contractAddress
    let owner = accounts[0]
    const player1 = accounts[1]
    const player2 = accounts[2]
    const factory = accounts[3]
    const gameAddress1 = accounts[4]
    const badboy = accounts[5]

    before(async () => {
      contractAddress = await ContractFactory.deployed()
    })

})

