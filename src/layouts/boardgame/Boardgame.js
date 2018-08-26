import React, { Component } from 'react'
import { connect } from 'react-redux'
import Board from '../../components/board/Board';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { squaresFetchData } from '../../actions/BoardActions';

class BoardGame extends Component {
  constructor(props, context) {
    super(props)

    this.handleClose = this.handleClose.bind(this);
    this.handleChannel = this.handleChannel.bind(this);

    let initialState = {};
    initialState.open = false;
    this.state = initialState;
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  handleChannel = () => {
    this.props.fetchData("2");
  };

  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>The Battle Of The 7 Seas.</h1>
            <h3>Game Address: {this.props.gameAddress}</h3>
            <Button variant="contained" color="primary" onClick={this.handleChannel}>
             Start Channel
            </Button>
          </div>
            <div className="pure-g-r">
              <div className="pure-u-1-3" style={{width: 300,height: 300}}>
              <h3>Player 1 Board</h3>
              {this.props.player1}
                  <Board player="2"/>
              </div>
              <div className="pure-u-1-3" style={{width: 200}}>
              </div>
              <div className="pure-u-1-3" style={{width: 300,height: 300}}>
              <h3>Player 2 Board</h3>
              {this.props.player2}
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

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    accounts: state.accounts,
    player1: state.player1,
    player2: state.player2,
    gameAddress: state.gameAddress,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: (player) => dispatch(squaresFetchData(player)),
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(BoardGame);

