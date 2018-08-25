import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { DrizzleProvider } from 'drizzle-react'
import { UserIsAuthenticated } from './util/wrappers.js'
import { Provider } from 'react-redux'

// Layouts
import App from './App'
import Home from './layouts/home/Home'
import { LoadingContainer } from 'drizzle-react-components'
import Boardgame from './layouts/boardgame/Boardgame'
import createContainer from './layouts/create/createContainer'
import gamesContainer from './layouts/games/gamesContainer'
import Profile from './layouts/profile/Profile'

import store from './store'
import drizzleOptions from './drizzleOptions'

// Initialize react-router-redux.
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render((
  <DrizzleProvider options={drizzleOptions}>
    <Provider store={store}>
      <LoadingContainer>
        <Router history={history}>
          <Route path="/" component={App}>
            <IndexRoute component={Home} />
            <Route path="games" component={UserIsAuthenticated(gamesContainer)} />
            <Route path="create" component={UserIsAuthenticated(createContainer)} />
            <Route path="boardgame" component={UserIsAuthenticated(Boardgame)} />
            <Route path="profile" component={UserIsAuthenticated(Profile)} />
          </Route>
        </Router>
      </LoadingContainer>
    </Provider>
  </DrizzleProvider>

  ),
  document.getElementById('root')
);
