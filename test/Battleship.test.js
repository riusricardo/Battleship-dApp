var ethjsABI = require('ethjs-abi')
var { Buffer } = require('buffer')
var ContractFactory = artifacts.require("ContractFactory")
var Battleship = artifacts.require("Battleship")
var GameRegistry = artifacts.require("GameRegistry")
var EthereumDIDRegistry = artifacts.require("EthereumDIDRegistry")
var ethereumjsUtil = require('ethereumjs-util')
var ethereumjsABI = require('ethereumjs-abi')

function bytes32toString (bytes32) {
    return Buffer.from(bytes32.slice(2), 'hex').toString('utf8').replace(/\0+$/, '')
}
  
function stringToBytes32 (str) {
    const buffstr = '0x' + Buffer.from(str).slice(0, 32).toString('hex')
    return buffstr + '0'.repeat(66 - buffstr.length)
}

function recoverSigner(message, signature) {
    var split = ethereumjsUtil.fromRpcSig(signature)
    var publicKey = ethereumjsUtil.ecrecover(message, split.v, split.r, split.s)
    var signer = "0x" + ethereumjsUtil.pubToAddress(publicKey).toString("hex")
    return signer
}

contract('Battleship', function(accounts) {
    let game,factory,notFactoryGame,games,gameAddress,gameReg,ethrReg,joinBattle,joinGamePos
    const owner = accounts[0]
    const player1 = accounts[1]
    const player2 = accounts[2]
    const dummy = accounts[3]
    const topic = "TEST"

    const STATE1 = stringToBytes32("Create")
    const STATE2 = stringToBytes32("Set")
    const STATE3 = stringToBytes32("Play")
    const STATE4 = stringToBytes32("GameOver")

    const secretP1 = '0x' + require('crypto').randomBytes(4).toString('hex')
    const privateKeyP1 = '0x5ee066211bddbae18c19616b8c17ffaf5b01b69a37942634dec990e8df305d0c'
    const secretP2 = '0x' + require('crypto').randomBytes(4).toString('hex')
    const privateKeyP2 = '0x6aa6c344e007cd84752c55a1d505deca6af11e0375283a462df13ba73532fb38'

   
    let board = 
    [0,0,0,3,0,0,0,0,0,0
    ,1,0,0,0,0,0,0,0,0,0
    ,3,0,2,2,0,0,0,1,0,0
    ,1,0,0,3,0,0,0,0,0,0
    ,0,0,0,0,0,2,0,1,0,0
    ,3,0,0,0,0,0,0,0,0,0
    ,0,0,0,0,0,0,2,0,0,2
    ,1,0,0,3,0,0,0,0,0,0
    ,0,0,0,3,0,0,0,0,0,0
    ,1,0,0,3,0,0,0,0,0,0]

    before(async () => {
        factory = await ContractFactory.deployed()
        notFactoryGame = await Battleship.deployed()
        gameReg = await GameRegistry.deployed()
        ethrReg = await EthereumDIDRegistry.deployed()

        for (let i = 0; i < notFactoryGame.contract.abi.length; i++) {
            if (notFactoryGame.contract.abi[i].name === "joinGame") {
                joinGamePos = i;
                joinBattle = ethjsABI.encodeMethod(notFactoryGame.contract.abi[joinGamePos], [player1, player2, topic]);
                break;
            }
          }
        //joinBattle = ethereumjsABI.encode(notFactoryGame.contract.abi,"joinGame(address address string)", [player1, player2, topic])
      })

    describe('create a new battleship game contract from factory and send initial data', () => {
        before(async() => {
            // joinBattle is the encoded data to set player1, player2 and bet on game.
            // player1, player2 in this function are only used for setting data in game registry.
            await factory.createAndCall(player1, player2, joinBattle, {from: owner})
        })
        it('should get game address from game registry', async () => {
            try {
                games = await gameReg.getPlayerGames(player1, {from: owner})
                gameAddress = games[games.length - 1]
            } catch (error) {
                assert.equal(error, 'undefined')
            }
        })
    })

    describe('join the game as player 2 to pay the correct bet', () => {
        let tx,res
        before(async() => {
            Battleship.address = gameAddress // update address to use new instance
            game = await Battleship.deployed()
        })
        it('should join game as player2', async () => {
            try {
                // dummy used because player2 was set at creation time
                tx = await game.joinGame(dummy, dummy, topic, {from: player2})
            } catch (error) {
                assert.equal(error, 'undefined')
            }
        })
        it('should create JoinedGame event', () => {
            const event = tx.logs[0]
            assert.equal(event.event, 'JoinedGame')
            assert.equal(event.args.player, player2)
        })
        it('should be on state "Create"', async () => {
            try {
                // getCurrentStateId inherited function from StateMachine
                res = await game.getCurrentStateId({from: player2})
                assert.equal(res, STATE1) // Create state
            } catch (error) {
                assert.equal(error, 'undefined')
            }
        })
    })

    describe('Set hidden board as player1', () => {
        let tx,signedMessage,signature,boardHash,prefixed
        before(async() => {

            // issue: board -> uint8[] missing, arrays fail on ethereumjsABI
            // could use web3.utils.soliditySha3({type: 'uint8[]'... but it is web3 1.0
            // truffle is still on web3 0.20
            // workaround: use solidity library to create hash.
            boardHash = ethereumjsABI.soliditySHA3(
                ["bytes4", "bytes32"],
                [secretP1, gameAddress]
            )

            prefixed = ethereumjsABI.soliditySHA3(
                ["string", "bytes32"],
                ["\x19Ethereum Signed Message:\n32", boardHash]
            )

            signedMessage = ethereumjsUtil.ecsign(prefixed, ethereumjsUtil.toBuffer(privateKeyP1))
            signature = "0x" + ethereumjsUtil.setLengthLeft(signedMessage.r, 32).toString("hex") + ethereumjsUtil.setLengthLeft(signedMessage.s, 32).toString("hex") + ethereumjsUtil.toBuffer(signedMessage.v).toString("hex")
        })
        it('should set pass board hash and signature', async () => {
            try {
                
                tx = await game.setHiddenBoard(boardHash.toString("hex"),signature, {from: player1})
            } catch (error) {
                // should not fail. Need to validate signer.
                assert.equal(error, 'undefined')
            }
        })
    })
})

