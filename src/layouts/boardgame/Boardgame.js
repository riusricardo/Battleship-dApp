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
import {Topic} from '../../whisper/whisper-channel/channel'
import {createChannel} from '../../whisper/whisper-channel/channel'
import {sleep} from '../../whisper/whisper-channel/channel'

class BoardGame extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts


    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChannel = this.handleChannel.bind(this);

    let initialState = {};
    initialState.open = false;
    this.state = initialState;
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleChannel = () => {

      console.log("Channel closed.")
    
  };

  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>The Battle Of The 7 Seas.</h1>
            <Button variant="contained" color="primary" onClick={this.handleChannel}>
             Start Channel
            </Button>
          </div>
            <div className="pure-g-r">
              <div className="pure-u-1-3" style={{width: 300,height: 300}}>
              <h3>My Board</h3>
                  <Board player="2"/>
              </div>
              <div className="pure-u-1-3" style={{width: 200}}>
              </div>
              <div className="pure-u-1-3" style={{width: 300,height: 300}}>
              <h3>Guessing Board</h3>
                  <Board player="1"/>
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
              We'll travel in history into the times of pirates. Let's the game begin !!!
                -- 🎵 Yo-Ho Yo-Ho A Pirate's Life for Me ... 🎶  
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
    contracts: state.contracts,
    accounts: state.accounts
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    
  };
};

export default drizzleConnect(BoardGame,mapStateToProps,mapDispatchToProps);
