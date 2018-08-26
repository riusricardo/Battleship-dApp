
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Square from './Square';
import Ship from '../pieces/Ship';


class Board extends Component {
  constructor(props, context) {
    super(props);

    this.handleSquareClick = this.handleSquareClick.bind(this);
    this.renderSquare = this.renderSquare.bind(this);

    let initialState = {};
    this.state = initialState;
  }

  handleSquareClick(toX, toY, pos) {
    this.setState({ move: pos });
    console.log("Position:"+pos, "X:"+toX, "Y:"+toY);
  }

  renderSquare(pos,hasShip,shot) {
    const x = pos % 10;
    const y = Math.floor(pos / 10);
    const bright = (x + y) % 2 === 1;
    const piece = hasShip ? <Ship colors={'#FFFFFF'} fontsize={23}/> : null;

    return (
      <div key={pos} style={{ width: '10%', height: '10%' }}
      onClick={() => this.handleSquareClick(x, y, pos)}>
        <Square bright={bright} shot={shot}> {piece} </Square>
      </div>
    );
  }

  render() {

    let hasShip, shot, pos = 0;
    let squares = [];
    this.props.squares.forEach(element => {
      hasShip = (element === 1 || element === -1);
      shot = (element === -1 || element === -2) ? element : 0;
      squares.push(this.renderSquare(pos,hasShip,shot));
      pos++;
    });

    return (
      <div className="board" style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap'
      }}>
        {squares}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
      squares: state.squares,
      hasErrored: state.squaresHasErrored,
      isLoading: state.squaresIsLoading
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
  };
};
export default connect(mapStateToProps,mapDispatchToProps)(Board);