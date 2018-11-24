import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import ImageAvatar from './imageAvatars'
import AccountData from '../../components/contracts/AccountData'
import ContractData from '../../components/contracts/ContractData'

class Profile extends Component {
  constructor(props, { authData }) {
    super(props)
    
    authData = this.props
  }

  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Profile</h1>
            <div className="pure-g-r">
              <div className="pure-u-1-2 header">
              <p>
                <strong>Name</strong><br />
                {this.props.authData.name}
              </p>
                <ImageAvatar src={this.props.authData.avatar.uri}/>
              </div>
              <div className="pure-u-1-2 header">
                <h2>Active Account</h2>
                <AccountData accountIndex="0" units="ether" precision="3" /><br/><br/>
              </div>
              <h3>Player Games: </h3>
              <ContractData contract="GameRegistry" method="getPlayerGames" methodArgs={[this.props.accounts[0]]} hideIndicator/>
            </div>
          </div>
        </div>
      </main>
    )
  }
}

Profile.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    accounts: state.accounts
  }
}

export default drizzleConnect(Profile, mapStateToProps);
