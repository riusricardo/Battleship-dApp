import React, { Component } from 'react'
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'

class drizzleTab extends Component {
  render() {
    return (
      <main className="container">
        <div className="pure-g">

          <div className="pure-u-1-1 header">
            <h2>Active Account</h2>
            <AccountData accountIndex="0" units="ether" precision="3" />

            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>ContractFactory</h2>
            <p><strong>ethReg</strong>: <ContractData contract="ContractFactory" method="ethReg" /></p>
            <p><strong>gameReg</strong>: <ContractData contract="ContractFactory" method="gameReg" /></p>
            
            <p><strong>Create Contract</strong>:</p> <ContractForm contract="ContractFactory" method="createContract" labels={['player 1']}/>

            <br/><br/>
          </div>

        </div>
      </main>
    )
  }
}

export default drizzleTab
