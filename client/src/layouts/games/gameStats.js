import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import { ContractData } from 'drizzle-react-components'

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
            <strong>Game Data</strong>: <ContractData contract="GameRegistry" method="games" methodArgs={[this.props.gameAddress]} hideIndicator/>
            
            <br/><br/>
          </div>

        </div>
      </main>
    )
  }
}

games.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    accounts: state.accounts,
    gameAddress: state.gameAddress,
    GameRegistry: state.contracts.GameRegistry
  }
}

export default drizzleConnect(games, mapStateToProps);
