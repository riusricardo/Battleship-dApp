
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

  mouseOut() {
    this.setState({mouseOver: false});
  }
  
  mouseOver() {
    this.setState({mouseOver: true});
  }

  renderSquare(pos,hasShip,shot) {
    const x = pos % 10;
    const y = Math.floor(pos / 10);
    const bright = (x + y) % 2 === 1;
    const piece = hasShip ? <Ship colors={'#FFFFFF'} fontsize={24}/> : null;

    if(this.props.num === "1"){
      return (
        <div onMouseOut={() => this.mouseOut()} onMouseOver={() => this.mouseOver()}
        key={pos} 
        style={{ width: '10%', height: '10%' ,opacity: 0.85}}
        >
          <Square bright={bright} shot={shot}> {piece} </Square>
        </div>
      );
    }

    if(this.props.num === "2"){
      return (
        <div onMouseOut={() => this.mouseOut()} onMouseOver={() => this.mouseOver()}
        key={pos} 
        style={{ width: '10%', height: '10%'}}
        onClick={() => this.handleSquareClick(x, y, pos)}
        >
          <Square bright={bright} shot={shot}> {piece} </Square>
        </div>
      );
    }


  }

  render() {

    let hasShip, shot, pos = 0;
    let squares = [];
    
    //hit: 3 miss:2 ship:1
    if(this.props.num === "1"){
      this.props.squares1.forEach(element => {
        hasShip = (element === 1 || element === 3); //ship or hit
        shot = (element === 3 || element === 2) ? element : 0; //hit, miss and nothing
        squares.push(this.renderSquare(pos,hasShip,shot));
        pos++;
      });
    }

    if(this.props.num === "2"){
      this.props.squares2.forEach(element => {
        hasShip = (element === 1 || element === 3);//ship or hit
        shot = (element === 3 || element === 2) ? element : 0;//hit, miss and nothing
        squares.push(this.renderSquare(pos,hasShip,shot));
        pos++;
      });
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

const mapStateToProps = (state) => {
  return {
      squares1: state.squares1,
      squares2: state.squares2,
      hasErrored: state.squaresHasErrored,
      isLoading: state.squaresIsLoading
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
  };
};
export default connect(mapStateToProps,mapDispatchToProps)(Board);