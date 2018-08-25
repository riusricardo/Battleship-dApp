import React, { Component } from 'react'
import ContractDataGames from '../../components/contracts/GamesRegistry/ContractDataGames'
import ContractForm from '../../components/contracts/ContractForm'

class games extends Component {
    constructor(props, context) {
        super(props);
    }
  render() {
    return (


      <main className="container">
        <div className="pure-g">

          <div className="pure-u-1-1">
            <h2>Games</h2>
            <p></p>
            <strong>Game Data</strong>: <ContractDataGames contract="GameRegistry" method="games" methodArgs={['0x13282BD91A6a0D74fDCBA52db81eE9A06803558b']} hideIndicator/>
            <strong>Player Games</strong>: <ContractDataGames contract="GameRegistry" method="playerGames" methodArgs={['0x0b774Fa1bcDcefb52b490f6879be8f8DA0dbd954',0]} hideIndicator/>
        
            <br/><br/>
          </div>

        </div>
      </main>
    )
  }
}

export default games
