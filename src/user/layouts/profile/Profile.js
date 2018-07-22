import React, { Component } from 'react'
import ImageAvatar from './imageAvatars';
import ExampleC from '../../../components/Example'

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
            <p>
              <strong>Name</strong><br />
              {this.props.authData.name}
            </p>
            <ImageAvatar src={this.props.authData.avatar.uri}/>
            <ExampleC />
          </div>
        </div>
      </main>
    )
  }
}

export default Profile
