import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import {browserHistory } from 'react-router'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button';
import SendIcon from "@material-ui/icons/Send";
import ethjsABI from 'ethjs-abi'
import {updatingPlayer1, updatingPlayer2} from '../../../actions/create/updatePlayers'
import {updatingGameAddress} from '../../../actions/create/updateGameAddress'
import store from '../../../store';

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

    // Get the contract ABI
    this.BattleshipABI = this.contracts[this.props.factory].abi

    // Get the contract address
    this.address = this.contracts[this.props.contract].address;

    for (let i = 0; i < this.BattleshipABI.length; i++) {
      if (this.BattleshipABI[i].name === this.props.join) {
          this.joinPos = i;
          break;
      }
    }

    let initialState = {};
    initialState["_actor"] = this.props.accounts[this.props.accountIndex];
    initialState["_actor2"]='';
    this.state = initialState;
  }

  handleSubmit() {
    const self = this;

    //this.props.updateP1(self.state["_actor"]); // NOT WORKING on drizzleConnect
    //this.props.updateP2(self.state["_actor2"]); // NOT WORKING on drizzleConnect
    store.dispatch(updatingPlayer1(self.state["_actor"]));
    store.dispatch(updatingPlayer2(self.state["_actor2"]));

    let actor2 = this.web3.utils.isAddress(self.state["_actor2"]) ? self.state["_actor2"] : '0x0000000000000000000000000000000000000000';
    const joinBattle = ethjsABI.encodeMethod(self.BattleshipABI[self.joinPos], [self.state["_actor"], actor2 ]);

    self.contracts[self.props.contract].methods[self.props.method](self.state["_actor"], joinBattle).estimateGas({from: self.state["_actor"]})
    .then(function(gasAmount){
      self.contracts[self.props.contract].methods[self.props.method](self.state["_actor"], joinBattle).send({from: self.state["_actor"], gas:gasAmount})
      .on('receipt', function(receipt){
        store.dispatch(updatingGameAddress(receipt.events.ContractDeployed.returnValues.deployedAddress));
      })
    })
    .catch(function(error){
        console.log(error);
    });

    // CALL external function to random board.
    browserHistory.push('/boardgame')
    
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value });
    
  }

  render() {
    return (
      <div>
      <p><strong>Player 1: </strong></p>{this.state["_actor"]}
      <p><strong>VS</strong></p>
      <p><strong>Player 2: </strong></p>
      <input key="_actor2" type="text" name="_actor2" value={this.state["_actor2"]} placeholder={'0x0000000000000000000000000000000000000000'} onChange={this.handleInputChange} style={{width: "385px"}}/>
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
    updateP2 : (player) => {dispatch(updatingPlayer2(player))}
  };
};

export default drizzleConnect(ContractFormCreate,mapStateToProps, mapDispatchToProps)
