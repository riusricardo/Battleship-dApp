import PropTypes from 'prop-types';
import { EventEmitter } from 'events';
import fsm from 'fsm-event';
import each from 'async/each';
import series from 'async/series';
import parallel from 'async/parallel';
import store from '../store';
import { stringToBytes32, bytes32toString } from 'ethr-did-resolver';


class Game extends EventEmitter {
  constructor (_options) {
    super()
    this._config = _options.config

    let storeState = store.getState();
    this.account = storeState.accounts.account[0];
    this.web3 = storeState.web3;
    this.battleship = storeState.gameContract;
    this.gameAddress = storeState.gameAddress;
    this.channel = storeState.channel;
    this.player = storeState.player1;
    this.secret = storeState.secret;
    this.keys = storeState.keys;

    this.currentPlayer = null;
    this.opponentSigner = null;
    this.signer = null;
    this.nonce = null;

    this.gamesState = [stringToBytes32("Create"),stringToBytes32("Set"),stringToBytes32("Play"),stringToBytes32("GameOver")];
    
    this.gamesState = new fsm('CREATE', {
      CREATE: { pause: 'PAUSED' },
      SET: { resume: 'START' },
      PLAY: { resume: 'START' },
      GAMEOVER: { resume: 'START' }
    })


    this.state = new fsm('STOPPED', {
      STOPPED: {
          start: 'STARTING',
          stop: 'STOPPED'
      },
      STARTING: {
          done: 'STARTED',
          abort: 'STOPPED',
          stop: 'STOPPING'
      },
      STARTED: {
          stop: 'STOPPING',
          start: 'STARTED'
      },
      STOPPING: {
          stop: 'STOPPING',
          done: 'STOPPED'
      }
    })
    this.state.on('STARTING', () => {
      console.log('game is starting')
    })
    this.state.on('STOPPING', () => {
      console.log('game is stopping')
    })
    this.state.on('STARTED', () => {
      console.log('game has started')
    })
    this.state.on('STOPPED', () => {
      console.log('game has stopped')
    })
    this.state.on('error', (err) => {
      console.log.error(err)
    })
  }

  getPlayerShips(player){
    return this.battleship.methods.getPlayerShips(player).call({from:this.player});
  }

  getTopic(){
    return this.battleship.methods.getTopic().call({from:this.player});
  }

  createSecret(){
    return '0x' + require('crypto').randomBytes(4).toString('hex');
  }

  updateBoard(xy, sig, nonce, currentPlayer, opponent) {
    if (currentPlayer !== opponent) return;
    if (xy >= 0 && xy <= 99) return;

    nonce += 1;
    var hash = this.web3.utils.soliditySha3(
        {type: 'uint8', value: xy},
        {type: 'uint8', value: nonce},
        {type: 'address', value: this.gameAddress}
    );
    var signer = this.web3.eth.accounts.recover(hash, sig);

    // validate shots
    
    if (signer.toLowerCase() !== this.opponentSigner.toLowerCase()) return;
    
    this.currentPlayer = this.props.player1;
    return {nonce, xy, currentPlayer, sig}
  }

  join() {
    this.battleship.methods.joinGame().call({from:this.player})
  }

  claimBet() {
    this.battleship.methods.claimBet().call({from:this.player})
  }
  
  move(xy) {

    this.battleship.methods.move(xy,this.nonce).call({from:this.player})
    var moveHash = this.web3.utils.soliditySha3(
      {type: 'uint8[]', value: xy},
      {type: 'bytes32', value: this.gameAddress}
    );
    var signedMessage = this.web3.eth.accounts.sign(moveHash, this.keys.privateKey);
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

      this.battleship.methods.setHiddenBoard(boardHash, sig).call({from:this.props.player})

  }

  stateMove( xy, nonce, nextTurn, sig, replySig){

  }

  revealMyBoard(ships, hits, notHits, secret){

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