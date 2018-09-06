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
    const secretP2 = '0x' + require('crypto').randomBytes(4).toString('hex')
    let ethrDid1, ethrDid2, delegateP1, delegateP2, signerP1, signerP2, privateKeyP1, privateKeyP2
   
    const shipsP1 = [0,11,22,33,44,55,66,77,88,99]
    const shipsP2 = [9,18,27,36,45,54,63,72,81,90]
    let hitsToP1 = [33,55,77,88,99]
    let hitsToP2 = [18,27,54,72]
    let notHitsToP1 = [12,15,43,56,9,28,16,4]
    let notHitsToP2 = [12,15,43,56,9,28,16,4]

    before(async () => {
        factory = await ContractFactory.deployed()
        notFactoryGame = await Battleship.deployed()
        gameReg = await GameRegistry.deployed()
        ethrReg = await EthereumDIDRegistry.deployed()

        ethrDid1 = new EthrDID({provider: web3_1.currentProvider, registry: ethrReg.address, address: player1})
        ethrDid2 = new EthrDID({provider: web3_1.currentProvider, registry: ethrReg.address, address: player2})
        delegateP1 = await ethrDid1.createSigningDelegate()
        delegateP2 = await ethrDid2.createSigningDelegate()
        signerP1 = delegateP1.kp.address
        signerP2 = delegateP2.kp.address
        privateKeyP1 = '0x'+delegateP1.kp.privateKey
        privateKeyP2 = '0x'+delegateP2.kp.privateKey

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
        it('should be on "Create" state', async () => {
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
        let tx,res,signer,signedMessage,signature,boardHash
        before(() => {

            boardHash = web3_1.utils.soliditySha3(
                {type: 'uint8[]', value: shipsP1},
                {type: 'bytes4', value: secretP1},
                {type: 'address', value: gameAddress}
            )

            signedMessage = web3_1.eth.accounts.sign(boardHash, privateKeyP1)
            signature = signedMessage.signature
        })
        it('should set board hash player1, signature and validate EthrDID signer', async () => {
            try {
                tx = await game.setHiddenBoard(boardHash, signature, {from: player1})
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
        it('should return correct player1 signer', async () => {
            try {
                signer = await game.playerSigner(player1, {from: player1})
                assert.equal(signer, signerP1)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
        it('should be on "Set" state', async () => {
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
        let tx,res,signer,signedMessage,signature,boardHash
        before(() => {

            boardHash = web3_1.utils.soliditySha3(
                {type: 'uint8[]', value: shipsP2},
                {type: 'bytes4', value: secretP2},
                {type: 'address', value: gameAddress}
            )

            signedMessage = web3_1.eth.accounts.sign(boardHash, privateKeyP2)
            signature = signedMessage.signature
        })
        it('should set board hash player2, signature and validate EthrDID signer', async () => {
            try {
                tx = await game.setHiddenBoard(boardHash, signature, {from: player2})
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
        it('should return correct player2 signer', async () => {
            try {
                signer = await game.playerSigner(player2, {from: player2})
                assert.equal(signer, signerP2)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
        it('should be on "Set" state', async () => {
            try {
                res = await game.getCurrentStateId({from: player2})
                assert.equal(res, STATE2)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })
    
    describe('Update [0](from: player1) off-chain state move', () => {
        let tx,res
        let xy, nonce, signature, signedMessage,  moveHash
        let replySignature, replyMessage, replyHash, nextTurn
        before(() => {

            // player2 move, starts game.
            xy = 11
            nonce = 0
            moveHash = web3_1.utils.soliditySha3(
                {type: 'uint8', value: xy},
                {type: 'uint8', value: nonce},
                {type: 'address', value: gameAddress}
            )
            
            signedMessage = web3_1.eth.accounts.sign(moveHash, privateKeyP2)
            signature = signedMessage.signature

            // player1 reply (not hit)
            nextTurn = player1; // replier address = no hit, sender address = hit.
            replyHash = web3_1.utils.soliditySha3(
                {type: 'bytes32', value: moveHash},
                {type: 'uint8', value: nonce},
                {type: 'address', value: nextTurn},
                {type: 'address', value: gameAddress}
            )
            replyMessage = web3_1.eth.accounts.sign(replyHash, privateKeyP1)
            replySignature = replyMessage.signature

        })
        it('should update game contract state', async () => {
            try {
                tx = await game.stateMove(xy, nonce, nextTurn, signature, replySignature, {from: player1})
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
        it('should create StateChanged event', () => {
            const event = tx.logs[0]
            assert.equal(event.event, 'StateChanged')
          })
          it('should create State Machine transition event', () => {
            const event = tx.logs[1]
            assert.equal(event.event, 'Transition')
          })
        it('should create TimeoutReseted event', () => {
            const event = tx.logs[2]
            assert.equal(event.event, 'TimeoutReseted')
          })
        it('should fail to update same state without increasing nonce', async () => {
            try {
                await game.stateMove(xy, nonce, nextTurn, signature, replySignature, {from: player1})
            } catch (error) {
                assert.equal(error.message, 'VM Exception while processing transaction: revert , incorrect nonce number.')
            }
        })
        it('should be on "Play" state', async () => {
            try {
                res = await game.getCurrentStateId({from: player1})
                assert.equal(res, STATE3)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })

    describe('Update [1](from: player1) off-chain state move and start timeout', () => {
        let tx,res
        let xy, nonce, signature, signedMessage,  moveHash
        let replySignature, replyMessage, replyHash, nextTurn
        before(() => {

            // player1 move
            xy = 35
            nonce = 1
            moveHash = web3_1.utils.soliditySha3(
                {type: 'uint8', value: xy},
                {type: 'uint8', value: nonce},
                {type: 'address', value: gameAddress}
            )
            signedMessage = web3_1.eth.accounts.sign(moveHash, privateKeyP1)
            signature = signedMessage.signature

            // player2 reply (not hit)
            nextTurn = player2; // replier address = no hit, sender address = hit.
            replyHash = web3_1.utils.soliditySha3(
                {type: 'bytes32', value: moveHash},
                {type: 'uint8', value: nonce},
                {type: 'address', value: nextTurn},
                {type: 'address', value: gameAddress}
            )
            replyMessage = web3_1.eth.accounts.sign(replyHash, privateKeyP2)
            replySignature = replyMessage.signature

        })
        it('should update game contract state', async () => {
            try {
                tx = await game.stateMove(xy, nonce, nextTurn, signature, replySignature, {from: player1})
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
        it('should create TimeoutStarted event', () => {
            const event = tx.logs[0]
            assert.equal(event.event, 'TimeoutStarted')
          })
        it('should be on "Play" state', async () => {
            try {
                res = await game.getCurrentStateId({from: player1})
                assert.equal(res, STATE3)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })

    describe('Update [2](from: player1) off-chain state move and start timeout', () => {
        let tx,res
        let xy, nonce, signature, signedMessage,  moveHash
        let replySignature, replyMessage, replyHash, nextTurn
        before(() => {

            // player2 move
            xy = 43
            nonce = 2
            moveHash = web3_1.utils.soliditySha3(
                {type: 'uint8', value: xy},
                {type: 'uint8', value: nonce},
                {type: 'address', value: gameAddress}
            )
            signedMessage = web3_1.eth.accounts.sign(moveHash, privateKeyP2)
            signature = signedMessage.signature

            // player1 reply (hit)
            nextTurn = player2; // replier address = no hit, sender address = hit.
            replyHash = web3_1.utils.soliditySha3(
                {type: 'bytes32', value: moveHash},
                {type: 'uint8', value: nonce},
                {type: 'address', value: nextTurn},
                {type: 'address', value: gameAddress}
            )
            replyMessage = web3_1.eth.accounts.sign(replyHash, privateKeyP1)
            replySignature = replyMessage.signature

        })
        it('should update game contract state', async () => {
            try {
                tx = await game.stateMove(xy, nonce, nextTurn, signature, replySignature, {from: player1})
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
        it('should create TimeoutStarted event', () => {
            const event = tx.logs[0]
            assert.equal(event.event, 'TimeoutStarted')
          })
        it('should be on "Play" state', async () => {
            try {
                res = await game.getCurrentStateId({from: player1})
                assert.equal(res, STATE3)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })

    describe('Claim game pot without finishing', () => {
        let tx,res
        it('should fail, not on "GameOver" state', async () => {
            try {
                tx = await game.claimBet({from: player1})
            } catch (error) {
                assert.equal(error.message, 'VM Exception while processing transaction: revert')
            }
        })
        it('should remain on "Play" state', async () => {
            try {
                res = await game.getCurrentStateId({from: player2})
                assert.equal(res, STATE3)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })
    
    describe('Update [3](from: player1) off-chain state move and reset timeout', () => {
        let tx,res
        let xy, nonce, signature, signedMessage,  moveHash
        let replySignature, replyMessage, replyHash, nextTurn
        before(() => {

            // player2 move
            xy = 78
            nonce = 3
            moveHash = web3_1.utils.soliditySha3(
                {type: 'uint8', value: xy},
                {type: 'uint8', value: nonce},
                {type: 'address', value: gameAddress}
            )
            signedMessage = web3_1.eth.accounts.sign(moveHash, privateKeyP2)
            signature = signedMessage.signature

            // player1 reply (not hit)
            nextTurn = player1; // replier address = no hit, sender address = hit.
            replyHash = web3_1.utils.soliditySha3(
                {type: 'bytes32', value: moveHash},
                {type: 'uint8', value: nonce},
                {type: 'address', value: nextTurn},
                {type: 'address', value: gameAddress}
            )
            replyMessage = web3_1.eth.accounts.sign(replyHash, privateKeyP1)
            replySignature = replyMessage.signature

        })
        it('should update game contract state', async () => {
            try {
                tx = await game.stateMove(xy, nonce, nextTurn, signature, replySignature, {from: player1})
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
        it('should create TimeoutReseted event', () => {
            const event = tx.logs[0]
            assert.equal(event.event, 'TimeoutReseted')
          })
        it('should be on "Play" state', async () => {
            try {
                res = await game.getCurrentStateId({from: player1})
                assert.equal(res, STATE3)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })

    /*
    describe('Reveal board.', () => {
        let tx,res
        it('should save revealed board on contract', async () => {
            try {
                tx = await game.revealBoard(shipsP1,secretP1,{from: player1})
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
        it('should create StateChanged event', () => {
            const event = tx.logs[0]
            assert.equal(event.event, 'StateChanged')
        })
        it('should create State Machine transition event', () => {
            const event = tx.logs[1]
            assert.equal(event.event, 'Transition')
        })
        it('should create RevealedBoard event', () => {
            const event = tx.logs[2]
            assert.equal(event.event, 'RevealedBoard')
          })
        it('should be on "GameOver" state', async () => {
            try {
                res = await game.getCurrentStateId({from: player1})
                assert.equal(res, STATE4)
            } catch (error) {
                assert.equal(error.message, 'undefined')
            }
        })
    })
    */
})

