var Web3_1 = require('web3')
var web3_1 = new Web3_1()
web3_1.setProvider(web3.currentProvider)

var ethjsABI = require('ethjs-abi')
var EthrDID = require('ethr-did')
var {stringToBytes32, bytes32toString} = require('ethr-did-resolver')

var EthereumDIDRegistry = artifacts.require("EthereumDIDRegistry")
var ContractFactory = artifacts.require("ContractFactory")
var GameRegistry = artifacts.require("GameRegistry")
var Battleship = artifacts.require("Battleship")


//Hacks for web3@1.0 support in truffle tests.
EthereumDIDRegistry.currentProvider.sendAsync = function() {
    return EthereumDIDRegistry.currentProvider.send.apply(EthereumDIDRegistry.currentProvider, arguments);
};
ContractFactory.currentProvider.sendAsync = function() {
    return ContractFactory.currentProvider.send.apply(ContractFactory.currentProvider, arguments);
};
GameRegistry.currentProvider.sendAsync = function() {
    return GameRegistry.currentProvider.send.apply(GameRegistry.currentProvider, arguments);
};
Battleship.currentProvider.sendAsync = function() {
    return Battleship.currentProvider.send.apply(Battleship.currentProvider, arguments);
};


contract('Battleship', function(accounts) {

    let game,factory,notFactoryGame,games,gameAddress,gameReg,ethrReg,joinBattle,joinGamePos
    const owner = accounts[0]
    const player1 = accounts[1]
    const player2 = accounts[2]
    const dummy = accounts[3]

    // Whisper channel topic.
    const topic = "TEST" 

    // Game states.
    const STATE1 = stringToBytes32("Create")
    const STATE2 = stringToBytes32("Set")
    const STATE3 = stringToBytes32("Play")
    const STATE4 = stringToBytes32("GameOver")

    const secretP1 = '0x' + require('crypto').randomBytes(4).toString('hex')
    let ethrDid1
    let signerP1

    const secretP2 = '0x' + require('crypto').randomBytes(4).toString('hex')
    let ethrDid2
    let signerP2
   
    let board1 = 
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

    let board2 = 
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

        ethrDid1 = new EthrDID({provider: web3_1.currentProvider, registry: ethrReg.address, address: player1})
        ethrDid2 = new EthrDID({provider: web3_1.currentProvider, registry: ethrReg.address, address: player2})

        signerP1 = await ethrDid1.createSigningDelegate()
        signerP2 = await ethrDid2.createSigningDelegate()

        for (let i = 0; i < notFactoryGame.contract.abi.length; i++) {
            if (notFactoryGame.contract.abi[i].name === "joinGame") {
                joinGamePos = i;
                joinBattle = ethjsABI.encodeMethod(notFactoryGame.contract.abi[joinGamePos], [player1, player2, topic]);
                break;
            }
        }
    })

    describe('Create a new battleship game contract from factory and send initial data', () => {
        before(async() => {
            // joinBattle is the encoded data to set player1, player2 and bet in the game.
            // player1, player2 in this function are only used for setting data in game registry.
            await factory.createAndCall(player1, player2, joinBattle, {from: owner})
        })
        it('should get game address from game registry', async () => {
            try {
                games = await gameReg.getPlayerGames(player1, {from: owner})
                gameAddress = games[games.length - 1]
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })

    describe('Join the game as player 2 to pay the correct bet', () => {
        let tx,res
        before(async() => {
            Battleship.address = gameAddress // update address to use new created game
            game = await Battleship.deployed()
        })
        it('should join game as player2', async () => {
            try {
                // dummy used because player2 was set at creation time
                tx = await game.joinGame(dummy, dummy, topic, {from: player2})
            } catch (error) {
                assert.equal(error.message, 'undefined')
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
                assert.equal(res, STATE1)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })

    describe('Set hidden board as player1 and validate EthrDID signer', () => {
        let tx,res,signedMessage,signature,boardHash,privateKey
        before(() => {

            boardHash = web3_1.utils.soliditySha3(
                {type: 'uint8[]', value: board1},
                {type: 'bytes4', value: secretP1},
                {type: 'bytes32', value: gameAddress}
            )

            privateKey = '0x'+signerP1.kp.privateKey
            signedMessage = web3_1.eth.accounts.sign(boardHash, privateKey)
            signature = signedMessage.signature
        })
        it('should set board hash player1, signature and validate EthrDID signer', async () => {
            try {
                tx = await game.setHiddenBoard(boardHash, signature, {from: player1})
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
        it('should be on state "Set"', async () => {
            try {
                // getCurrentStateId inherited function from StateMachine
                res = await game.getCurrentStateId({from: player2})
                assert.equal(res, STATE2)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })

    describe('Set hidden board as player2 and validate EthrDID signer', () => {
        let tx,res,signedMessage,signature,boardHash,privateKey
        before(() => {

            boardHash = web3_1.utils.soliditySha3(
                {type: 'uint8[]', value: board2},
                {type: 'bytes4', value: secretP2},
                {type: 'bytes32', value: gameAddress}
            )

            privateKey = '0x'+signerP2.kp.privateKey
            signedMessage = web3_1.eth.accounts.sign(boardHash, privateKey)
            signature = signedMessage.signature
        })
        it('should set board hash player2, signature and validate EthrDID signer', async () => {
            try {
                tx = await game.setHiddenBoard(boardHash, signature, {from: player2})
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
        it('should be on state "Set"', async () => {
            try {
                res = await game.getCurrentStateId({from: player2})
                assert.equal(res, STATE2)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })


    describe('Claim game pot without playing', () => {
        let tx,res
        it('should fail', async () => {
            try {
                tx = await game.claimBet({from: player1})
            } catch (error) {
                assert.equal(error.message, 'VM Exception while processing transaction: revert')
            }
        })
        it('should not change state "Set"', async () => {
            try {
                res = await game.getCurrentStateId({from: player2})

                assert.equal(res, STATE2)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })

    /*
    describe('Start timeout', () => {
        let res
        it('should fail, cannot start timeout on its turn', async () => {
            try {
                await game.conditionalTransitions() //Validate and move to Play state
                await game.startTimeout({from: player2})
            } catch (error) {
                assert.equal(error.message, 'VM Exception while processing transaction: revert , cannot start timeout.')
            }
        })
        it('should be on state "Play"', async () => {
            try {
                res = await game.getCurrentStateId({from: player2})
                assert.equal(res, STATE3)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })
    */

})

