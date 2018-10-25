import PropTypes from 'prop-types'
import store from '../store'
import {stringToBytes32, bytes32toString} from 'ethr-did-resolver'


class Game {
    constructor(props) {
        let state = store.getState();

        this.web3 = state.web3;
        this.player = state.player1;
        this.account = state.accounts.account[0];
        this.battleship = state.gameContract;
        this.gameAddress = state.gameAddress;
        this.secret = state.secret;
        this.channel = state.channel;
        this.keys = state.keys;
        this.gameStates = [stringToBytes32("Create"),stringToBytes32("Set"),stringToBytes32("Play"),stringToBytes32("GameOver")];
        this.secret ='0x' + require('crypto').randomBytes(4).toString('hex');
        this.dummy = '0x' + require('crypto').randomBytes(20).toString('hex');
        this.currentPlayer = null;
        this.board = null;
        this.nonce = null;
        this.signer = null;
        this.currentPlayer = null;
        this.opponentSigner = null;
        this.signer = null;
        this.xy = null;
        this.nonce = null;
        this.board = null;
        this.ships = [];
        this.hits = [];
        this.notHits = [];
    }

    updateBoard(xy, sig) {
      if (this.currentPlayer !== this.opponent) return;
      if (xy >= 0 && xy <= 99) return;

      var xy = this.xy;
      var nonce = this.nonce;

      nonce += 1;

      var hash = this.web3.utils.soliditySha3(
          {type: 'uint8', value: xy},
          {type: 'uint8', value: nonce},
          {type: 'address', value: this.props.gameAddress}
      );
      var signer = this.web3.eth.accounts.recover(hash, sig);

      // validate shots
      
      if (signer.toLowerCase() !== this.opponentSigner.toLowerCase()) return;

      this.nonce = nonce;
      this.xy = xy;
      this.currentPlayer = this.props.player1;
      this.sig = sig;
    }

    join() {
      this.battleship.methods.joinGame().call({from:this.player1})
    }

    claimBet() {
      this.battleship.methods.claimBet().call({from:this.player})
    }
    
    move(xy) {

        this.battleship.methods.move(xy,this.nonce).call({from:this.props.player1})
 
        var boardHash = this.web3.utils.soliditySha3(
            {type: 'uint8[]', value: this.props.board},
            {type: 'bytes4', value: this.props.secret},
            {type: 'bytes32', value: this.props.gameAddress}
        );
        var signedMessage = this.web3.eth.accounts.sign(boardHash, this.props.keys.privateKey);
        var sig = signedMessage.signature;
        this.channel.send({move: xy, signature: sig});

        this.currentPlayer = this.opponent;
      }

    setHiddenBoard() {

        var boardHash = this.web3.utils.soliditySha3(
            {type: 'uint8[]', value: this.ships},
            {type: 'bytes4', value: this.secret},
            {type: 'bytes32', value: this.gameAddress}
        );
        var signedMessage = this.web3.eth.accounts.sign(boardHash, this.keys.privateKey);
        var sig = signedMessage.signature;

        this.battleship.methods.setHiddenBoard(boardHash, sig).call({from:this.props.player1})

    }
    
}  

export default Game;



    /*
    stateMove(uint _xy, uint _nonce,  address _nextTurn, bytes _sig, bytes _replySig)
    revealMyBoard(uint[] _ships, uint[] _hits, uint[] _notHits, bytes4 _secret)
    revealOtherBoard(uint[] _hits, uint[] _notHits)
    claimVictory() 
    getplayerShips(address _player)
    getTopic()

    store.dispatch({type: 'ADD_GAME_SECRET', secret});
    store.dispatch({type: 'ADD_GAME_BOARD', board});
    */