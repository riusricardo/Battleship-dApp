import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import Board from '../../components/board/Board';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { squaresFetchData } from '../../actions/BoardActions';
import { channelCreating } from '../../actions/whisper/channelCreate';
import SuccessSnackbar from '../../components/SuccessSnackbar';
import WarningSnackbar from '../../components/WarningSnackbar';

class BoardGame extends Component {
  constructor(props, context) {
    super(props)

    this.handleClose = this.handleClose.bind(this);
    this.handleStart = this.handleStart.bind(this);

    this.contracts = context.drizzle.contracts;
    this.web3 = context.drizzle.web3;

    let initialState = {};
    
    if(!this.props.gameAddress && this.props.existsP2){
      initialState.open = true;
    }else{
      initialState.open = false;
    }
    
    this.state = initialState;
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  handleStart = () => {

    this.props.fetchData(1);
    this.props.fetchData(2);
    
    this.props.createChannel(this.contracts["EthereumDIDRegistry"].address, this.props.player1, this.props.player2, this.props.topic)
    //this.props.gameContract.methods.getPlayerBoard(this.props.player1).call().then(console.log)

  };

  render() {

    let disable = false;
    if((this.props.existsP2 === 'undefined' || !this.props.existsP2)) {
      disable =  (!(this.web3.utils.isAddress(this.props.gameAddress)) || this.props.waitP2)
    }else {
      disable = true;
    }

    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>The Battle Of The 7 Seas.</h1>
            <h3>Game Address: {this.props.gameAddress}</h3>
            <Button variant="contained" color="primary" onClick={this.handleStart} disabled={disable}>
             Start
            </Button>
            <WarningSnackbar message="Waiting Player 2 To Join The Game." open={disable && this.props.waitP2}/>
            <SuccessSnackbar message="Player 2 Joined The Game" open={this.props.existsP2}/>
          </div>
            <div className="pure-g">
              <div className="pure-u-1-3" style={{width: 300,height: 300}}>
              <h3>My Board</h3>
                  {this.props.player1}
                  <Board num="1"/>
              </div>
              <div className="pure-u-1-3" style={{width: 200}}>
              </div>
              <div className="pure-u-1-3" style={{width: 300,height: 300}}>
              <h3>Guessing Board</h3>
                  {this.props.player2}
                  <Board num="2"/>
              </div>
            </div>
          </div>

      <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"The Adventure Is Just Starting."}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              We'll travel through time and space to the moment when pirates dominated the 7 seas. 
              Let the games begin !!!
                --<span role="img" aria-label="Note">🎵 </span>Yo-Ho Yo-Ho A Pirate's Life for Me ...<span role="img" aria-label="Notes"> 🎶 </span> 
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" autoFocus>
             Ayeee!!!
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    )
  }
}

BoardGame.contextTypes = {
  drizzle: PropTypes.object
}
const mapStateToProps = state => {
  return {
    player1: state.player1,
    player2: state.player2,
    gameAddress: state.gameAddress,
    gameContract: state.gameContract,
    topic: state.topic,
    errorP2: state.errorP2,
    waitP2: state.waitP2,
    existsP2: state.existsP2,

  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: (player) => dispatch(squaresFetchData(player)),
    createChannel: (registryAddress, identity, identity2, topic) => dispatch(channelCreating(registryAddress, identity, identity2, topic))
  };
};

export default drizzleConnect(BoardGame, mapStateToProps, mapDispatchToProps);

