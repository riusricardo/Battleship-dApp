import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

/*
 * Create component.
 */

class Account extends Component {
  constructor(props, context) {
    super(props);

  }


  render() {
    // No accounts found.
    if(Object.keys(this.props.accounts).length === 0) {
      return (
        <span>Initializing...</span>
      )
    }

    // Get account address and balance.
    const address = this.props.accounts[this.props.accountIndex]

    return(
        <h4 style={{color:'#FFFFFF'}}> ⛓ Account : {address} </h4>
    )
  }
}

Account.contextTypes = {
  drizzle: PropTypes.object
}

/*
 * Export connected component.
 */

const mapStateToProps = state => {
  return {
    accounts: state.accounts, 
  }
}

export default drizzleConnect(Account, mapStateToProps)
