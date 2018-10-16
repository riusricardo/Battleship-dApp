import React, { Component } from 'react'
import { Link } from 'react-router'
import { HiddenOnlyAuth, VisibleOnlyAuth } from './util/wrappers.js'

// UI Components
import LoginButtonContainer from './user/ui/loginbutton/LoginButtonContainer'
import LogoutButtonContainer from './user/ui/logoutbutton/LogoutButtonContainer'
import HeaderAccount from './components/Account'

// Styles
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  render() {
    const OnlyAuthLinks = VisibleOnlyAuth(() =>
      <span>
        <li className="pure-menu-item">
          <HeaderAccount accountIndex="0" units="ether" precision="3" />
        </li>
        <li className="pure-menu-item">
          <Link to="/games" className="pure-menu-link">Games</Link>
        </li>
        <li className="pure-menu-item">
          <Link to="/create" className="pure-menu-link">Create Game</Link>
        </li>
        <li className="pure-menu-item">
          <Link to="/gameStats" className="pure-menu-link">Game Data</Link>
        </li>
        <li className="pure-menu-item">
          <Link to="/boardgame" className="pure-menu-link">Board Game</Link>
        </li>
        <li className="pure-menu-item">
          <Link to="/profile" className="pure-menu-link">Profile</Link>
        </li>
        <LogoutButtonContainer />
      </span>
    )

    const OnlyGuestLinks = HiddenOnlyAuth(() =>
      <span>
        <LoginButtonContainer />
      </span>
    )

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <Link to="/" className="pure-menu-heading pure-menu-link"><span role="img" aria-label="Swords">⚔</span> Battleship <span role="img" aria-label="Anchor">⚓</span></Link>
          <ul className="pure-menu-list navbar-right">
            <OnlyGuestLinks />
            <OnlyAuthLinks />
          </ul>
        </nav>

        {this.props.children}
      </div>
    );
  }
}

export default App
