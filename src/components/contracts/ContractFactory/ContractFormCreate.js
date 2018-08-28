import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import {browserHistory } from 'react-router'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button';
import SendIcon from "@material-ui/icons/Send";
import ethjsABI from 'ethjs-abi'
import {updatingPlayer1, updatingPlayer2} from '../../../actions/create/updatePlayers'
import {updatingGameAddress} from '../../../actions/create/updateGameAddress'
import {Topic} from '../../../whisper/whisper-channel/channel'

/*
 * Create component.
 */

class ContractFormCreate extends Component {
  constructor(props, context) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.contracts = context.drizzle.contracts;

    this.web3 = context.drizzle.web3;

    // Get the contract ABI for Battleship
    this.BattleshipABI = this.contracts[this.props.factoryContract].abi
    this.BattleshipContract =  new this.web3.eth.Contract(this.BattleshipABI);

    // Get the factory contract address
    this.address = this.contracts[this.props.contract].address;

    for (let i = 0; i < this.BattleshipABI.length; i++) {
      if (this.BattleshipABI[i].name === this.props.joinMethod) {
          this.joinGamePos = i;
          break;
      }
    }

    for (let i = 0; i < this.BattleshipABI.length; i++) {
      if (this.BattleshipABI[i].name === "setTopic") {
          this.setTopicPos = i;
          break;
      }
    }

    let initialState = {};
    initialState.actor2 ='';
    this.state = initialState;
  }

  handleSubmit() {
    const self = this;
    const topic = Topic();
    
    self.props.updateP1(self.props.accounts[self.props.accountIndex]);
    self.props.updateP2(self.state.actor2); 
    self.props.addGameTopic(topic);


    let actor2 = self.web3.utils.isAddress(self.state.actor2) ? self.state.actor2 : '0x0000000000000000000000000000000000000000';
    const joinBattle = ethjsABI.encodeMethod(self.BattleshipABI[self.joinGamePos], [self.props.accounts[self.props.accountIndex], actor2, topic ]);

    self.contracts[self.props.contract].methods[self.props.method](self.props.accounts[self.props.accountIndex], actor2, joinBattle).estimateGas({from: self.props.accounts[self.props.accountIndex]})
    .then(function(gasAmount){
      self.contracts[self.props.contract].methods[self.props.method](self.props.accounts[self.props.accountIndex], actor2, joinBattle).send({from: self.props.accounts[self.props.accountIndex], gas:gasAmount})
      .on('receipt', function(receipt){

        self.BattleshipContract.options.address = receipt.events.ContractDeployed.returnValues.deployedAddress;
          /*// NOT WORKING (Adding Contracts Dynamically) fails: network id.
          let events = ['GameInitialized','JoinedGame','StateChanged','MoveMade','GameEnded','TimeoutStarted','LogCurrentState','ValidSigner','BetClaimed'];
          let contractConfig = {
            contractName: receipt.events.ContractDeployed.returnValues.deployedAddress,
            web3Contract : self.BattleshipContract
          }
          self.context.drizzle.addContract({contractConfig, events});
          */
        self.props.updateGameAddress(receipt.events.ContractDeployed.returnValues.deployedAddress);
        self.props.addGameContract(self.BattleshipContract);
      })
    })
    .catch(function(error){
        console.log(error);
    });

    // CALL external function to random board.
    browserHistory.push('/boardgame')
    
  }

  handleInputChange(event) {
    this.setState({ actor2:event.target.value });
    
  }

  render() {
    return (
      <div>
      <p><strong>Player 1: </strong></p>{this.props.accounts[this.props.accountIndex]}
      <p><strong>VS</strong></p>
      <p><strong>Player 2: </strong></p>
      <input key="actor2" type="text" name="actor2" value={this.state.actor2} placeholder={'0x0000000000000000000000000000000000000000'} onChange={this.handleInputChange} style={{width: "385px"}}/>
      <p><Button variant="contained" color="primary" onClick={this.handleSubmit}>
        Create Game  -<SendIcon />
      </Button></p>
      Leave player 2 blank if you would like to play against the first player to join.
      </div>
    )
  }
}

ContractFormCreate.contextTypes = {
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
    player2: state.player2
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    updateP1 : (player) => {dispatch(updatingPlayer1(player))},
    updateP2 : (player) => {dispatch(updatingPlayer2(player))},
    updateGameAddress : (game) => {dispatch(updatingGameAddress(game))},
    addGameContract: (gameContract) => dispatch({type: 'ADD_GAME_CONTRACT', gameContract}),
    addGameTopic: (topic) => dispatch({type: 'ADD_GAME_TOPIC', topic})

  };
};

export default drizzleConnect(ContractFormCreate,mapStateToProps, mapDispatchToProps)
