import React, { Component } from 'react'
import AccountData from '../../components/contracts/AccountData'
import ContractData from '../../components/contracts/ContractData'
import ContractForm from '../../components/contracts/ContractForm'

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

export default create
