import React, { Component } from 'react'
import Board from '../../components/board/Board';

class Dashboard extends Component {
  constructor(props, authData ) {
    super(props)
    authData = this.props
  }

  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Battleship</h1>
            <p><strong>Congratulations {this.props.authData.name}!</strong> </p>
          </div>
          <div style={{
          width: 400,//'100%',
          height: 400,//'100%',
        }}>
        <Board ShipPosition={[4,6]}/>
      </div>
        </div>
      </main>
    )
  }
}

export default Dashboard
