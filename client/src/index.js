import React from 'react';
import ReactDOM from 'react-dom';
import { DrizzleProvider } from 'drizzle-react'
import { userIsAuthenticated } from './util/wrappers.js'
import { Provider } from 'react-redux'
import { Router, Route} from "react-router-dom";

// Layouts
import App from './App'
import Home from './layouts/home/Home'
import { LoadingContainer } from 'drizzle-react-components'
import Boardgame from './layouts/boardgame/Boardgame'
import Create from './layouts/create/create'
import GamesContainer from './layouts/games/gamesContainer'
import GameStats from './layouts/games/gameStats'
import Profile from './layouts/profile/Profile'

import { history, store } from './store'
import drizzleOptions from './drizzleOptions'


ReactDOM.render((
  <DrizzleProvider options={drizzleOptions} store={store}>
    <Provider store={store}>
      <LoadingContainer>
        <Router history={history} store={store}> 
          <App>
            <Route exact path="/" component={Home} />
            <Route path="/games" component={userIsAuthenticated(GamesContainer)} />
            <Route path="/create" component={userIsAuthenticated(Create)} />
            <Route path="/gameStats" component={userIsAuthenticated(GameStats)} />
            <Route path="/boardgame" component={userIsAuthenticated(Boardgame)} />
            <Route path="/profile" component={userIsAuthenticated(Profile)} />
          </App>
        </Router>
      </LoadingContainer>
    </Provider>
  </DrizzleProvider>

  ),
  document.getElementById('root')
);
