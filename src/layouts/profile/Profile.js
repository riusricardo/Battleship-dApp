import React, { Component } from 'react'
import ImageAvatar from './imageAvatars'
import { AccountData } from 'drizzle-react-components'

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
            </div>
          </div>
        </div>
      </main>
    )
  }
}

export default Profile
