import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
//import ContractForm from '../../components/contracts/ContractForm'

import ContractFormCreate from '../../components/contracts/ContractFactory/ContractFormCreate'

class create extends Component {
  render() {
    return (
      <main className="container">
        <div className="pure-g">

          <div className="pure-u-1-1">
            <h2>Start Playing</h2>
            
            <ContractFormCreate 
            contract="ContractFactory"  
            method="createAndCall" 
            factory="Battleship" 
            join="joinGame" 
            accountIndex="0"
            />

            <br/><br/>
          </div>

        </div>
      </main>
    )
  }
}

create.contextTypes = {
  drizzle: PropTypes.object
}
const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    accounts: state.accounts,
    player1: state.player1,
    player2: state.player2,
    gameAddress: state.gameAddress
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  };
};

export default drizzleConnect(create, mapStateToProps, mapDispatchToProps);
