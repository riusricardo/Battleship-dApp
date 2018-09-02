var ethjsABI = require('ethjs-abi')
var EthereumDIDRegistry = artifacts.require("EthereumDIDRegistry");
var ContractFactory = artifacts.require("ContractFactory");
var Battleship = artifacts.require("Battleship");


contract('ContractFactory', function(accounts) {
    let instance
	let game;
    let bytecode
	let joinBattle;
    let joinGamePos;
    let owner = accounts[0]
    const player1 = accounts[1]
    const player2 = accounts[2]
    const code = accounts[5]
    const topic = "TEST"


    before(async () => {
      instance = await ContractFactory.deployed()
	  game = await Battleship.deployed()

		for (let i = 0; i < game.contract.abi.length; i++) {
		  if (game.contract.abi[i].name === "joinGame") {
			  joinGamePos = i;
			  joinBattle = ethjsABI.encodeMethod(game.contract.abi[joinGamePos], [player1, player2, topic]);
			  break;
		  }
		}
      bytecode = await Battleship.bytecode
    })

    describe('set bytecode into factory', () => {
      before(async () => {
        await instance.setBytecode(bytecode, {from: owner})
      })
      it('should return the same bytecode', async () => {
        const _bytecode = await instance.getBytecode({from: owner})
        assert.equal(bytecode, _bytecode)
      })
    })


    describe('create a new game contract from factory', () => {
      it('should not revert and pass players to game contract', async () => {
        try {
            await instance.createContract(player1, player2, {from: owner})
          } catch (error) {
			assert.equal(error, 'undefined')
          }
        })
    })

    describe('concatenate to grow bytecode', () => {
      before(async () => {
        await instance.setBytecode(code, {from: owner})
		await instance.concatBytecode(code, {from: owner})
      })
      it('should return original bytecode + new bytecode', async () => {
        const _bytecode = await instance.getBytecode({from: owner})
        assert.equal(code + code.slice(2,42), _bytecode)
      })
    })

    describe('set bytecode into factory after locking', () => {
      let tx
      before(async () => {
        tx = await instance.lockFabric({from: owner})
      })
      it('should create FabricLocked event', () => {
      const event = tx.logs[0]
      assert.equal(event.event, 'FabricLocked')
      assert.equal(event.args.owner, owner)
      })
      it('should fail', async () => {
      try {
          await instance.setBytecode(code, {from: owner})
        } catch (error) {
          assert.equal(error.message, 'VM Exception while processing transaction: revert , contract locked.')

        }
      })
    })
})

