import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ethjsABI from 'ethjs-abi'
import {stringToBytes32, bytes32toString} from 'ethr-did-resolver'

class Game extends Component {
    constructor(props, context) {
        super(props);

        this.web3 = context.drizzle.web3;
        
        this.xy = null;
        this.secret = '0x' + require('crypto').randomBytes(4).toString('hex');
        this.currentPlayer = null;
        this.opponentSigner = null;
        this.nonce = null;
        this.board = null;

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
        {type: 'address', value: contractAddress}
    );
    var signer = this.web3.eth.accounts.recover(hash, sig);

      // validate shots
      
      if (signer.toLowerCase() !== this.opponentSigner.toLowerCase()) return;

      this.nonce = nonce;
      this.xy = xy;
      this.currentPlayer = this.props.player1;
      this.sig = sig;
    }

    claimBet() {
      var self = this;

      this.props.gameContract.methods.claimBet().call({from:this.props.player1})
    }

    contractMove(xy) {
      var self = this;
        this.contract.move(xy, this.nonce).call({from:this.props.player1})
    }
    
    move(xy) {

        this.props.gameContract.methods.move(xy,this.nonce).call({from:this.props.player1})
 
        var boardHash = this.web3.utils.soliditySha3(
            {type: 'uint8[]', value: this.props.board},
            {type: 'bytes4', value: this.props.secret},
            {type: 'bytes32', value: this.props.gameAddress}
        );
        var signedMessage = this.web3.eth.accounts.sign(boardHash, this.props.keys.privateKey);
        var sig = signedMessage.signature;
        this.props.channel.send({move: xy, signature: sig});

        this.currentPlayer = this.opponent;
      }


    join() {

      this.props.gameContract.methods.joinGame().call({from:this.props.player1})

    }

    setHiddenBoard() {

        var boardHash = this.web3.utils.soliditySha3(
            {type: 'uint8[]', value: this.props.board},
            {type: 'bytes4', value: this.props.secret},
            {type: 'bytes32', value: this.props.gameAddress}
        );
        var signedMessage = this.web3.eth.accounts.sign(boardHash, this.props.keys.privateKey);
        var sig = signedMessage.signature;

        this.props.gameContract.methods.setHiddenBoard(boardHash, sig).call({from:this.props.player1})

    }
    
}

Game.contextTypes = {
    drizzle: PropTypes.object
  }
  
  /*
   * Export connected component.
   */
  
  const mapStateToProps = state => {
    return {
      contracts: state.contracts,
      accounts: state.accounts,
      player1: state.player1,
      player2: state.player2,
      keys: state.keys,
      gameContract: state.gameContract,
      gameAddress: state.gameAddress,
      board: state.board,
      secret: state.secret,
    }
  }
  const mapDispatchToProps = (dispatch) => {
    return {
      addGameSecret: (secret) => dispatch({type: 'ADD_GAME_SECRET', secret}),
      addGameBoard: (board) => dispatch({type: 'ADD_GAME_BOARD', board})
    };
  };
  
  export default drizzleConnect(Game,mapStateToProps, mapDispatchToProps)