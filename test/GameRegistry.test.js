
var GameRegistry = artifacts.require("GameRegistry");

contract('GameRegistry', function(accounts) {
    let gameReg
    let owner = accounts[0]
    const player1 = accounts[1]
    const player2 = accounts[2]
    const factory = accounts[3]
    const gameAddress1 = accounts[4]
    const badboy = accounts[5]

    before(async () => {
        gameReg = await GameRegistry.deployed()
    })

    describe('get owner', () => {
        it('should return the contract owner', async () => {
        const _owner = await gameReg.owner()
        assert.equal(owner, _owner)
        })
    })

    describe('set factory address', () => {
        before(async () => {
          await gameReg.setFactory(factory, {from: owner})
        })
        it('should return the factory address', async () => {
          const _factory = await gameReg.factory()
          assert.equal(factory, _factory)
        })
    })

    describe('set a new game from factory', () => {
        before(async () => {
          await gameReg.setFactoryGame(gameAddress1, player1, player2, {from: factory})
        })
        it('should return true', async () => {
          const _isFactoryGame = await gameReg.gameList(gameAddress1)
          assert.equal(true, _isFactoryGame)
        })
    })

    describe('set a new game not from factory', () => {
        it('should fail', async () => {
          try {
            const tx = await gameReg.setFactoryGame(gameAddress1, player1, player2, {from: badboy})
            assert.equal(tx, undefined, 'this should not happen')
          } catch (error) {
            assert.equal(error.message, 'VM Exception while processing transaction: revert Not factory')
          }
        })
    })

    describe('set game contract as game owner', () => {
        before(async () => {
          await gameReg.setFactoryGame(gameAddress1, player1, player2, {from: factory})
          await gameReg.setGameOwner({from: gameAddress1})
        })
        it('should return game contract as game owner.', async () => {
          const _game = await gameReg.games(gameAddress1)
          assert.equal(gameAddress1, _game[0])
        })
    })

    describe('set game contract as  game owner but not factory game.', () => {
        it('should fail', async () => {
          try {
            await gameReg.setGameOwner({from: gameAddress1})
          } catch (error) {
            assert.equal(error.message, 'VM Exception while processing transaction: revert Game not created by the factory.')
          }
        })
    })

    describe('set game winner from game owner', () => {
        before(async () => {
            await gameReg.setFactoryGame(gameAddress1, player1, player2, {from: factory})
            await gameReg.setGameOwner({from: gameAddress1})
            await gameReg.setWinner(player2,{from: gameAddress1})
          })
        it('should return player2 as game winner.', async () => {
        const _game = await gameReg.games(gameAddress1)
        assert.equal(player2, _game[3])
        })
    })
})

