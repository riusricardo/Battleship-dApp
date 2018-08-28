
var EthereumDIDRegistry = artifacts.require("EthereumDIDRegistry");
var ContractFactory = artifacts.require("ContractFactory");


contract('ContractFactory', function(accounts) {
    let instance
    let bytecode
    let owner = accounts[0]
    const player1 = accounts[1]
    const player2 = accounts[2]
    const identity1 = accounts[3]
    const identity2 = accounts[4]
    const badboy = accounts[5]

    before(async () => {
      instance = await ContractFactory.deployed()
      bytecode = await EthereumDIDRegistry.bytecode
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
          await instance.setBytecode(bytecode, {from: owner})
        } catch (error) {
          assert.equal(error.message, 'VM Exception while processing transaction: revert Contract Locked')

        }
      })
    })

    describe('create a new EthrDID Registry contract from factory', () => {
      it('should fail and revert by external call', async () => {
        try {
            await instance.createContract(player1, player2, {from: owner})
          } catch (error) {
            assert.equal(error.message, 'VM Exception while processing transaction: revert')
  
          }
        })
    })
})

