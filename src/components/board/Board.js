
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Square from './Square';
import Ship from '../pieces/Ship';


class Board extends Component {
  static propTypes = {
    ShipPosition: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired
  };

	state = {
    square: {sColor:'#000AAA'}
	};

  renderSquare(i) {
    const x = i % 10;
    const y = Math.floor(i / 10);
    const paintFlag = (x + y) % 2 === 1;

    
    const [ShipX, ShipY] = this.props.ShipPosition;
    const piece = (x === ShipX && y === ShipY) ?
      <Ship colors={'#FFFFFF'} fontsize={40}/> 
      //null:
      :null;
    

    return (
      <div key={i} style={{ width: '10%', height: '10%' }}>
        <Square paint={paintFlag}>
          {piece}
        </Square>
      </div>
    );
  }

  render() {
    const squares = [];
    for (let i = 0; i < 100; i++) {
      squares.push(this.renderSquare(i));
    }

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

export default Board;