import { connectedReduxRedirect } from 'redux-auth-wrapper/history4/redirect'
import connectedAuthWrapper from 'redux-auth-wrapper/connectedAuthWrapper'
import { routerActions } from 'react-router-redux'

// Layout Component Wrappers

export const userIsAuthenticated = connectedReduxRedirect({
  redirectPath: '/',
  authenticatedSelector: state => state.user.data !== null,
  authenticatingSelector: state => state.user.isLoading,
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'UserIsAuthenticated'
})

export const UserIsNotAuthenticated = connectedReduxRedirect({
  redirectPath: (state, ownProps) => ownProps.location.query.redirect || '/boardgame',
  authenticatedSelector: state => state.user.data === null,
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'UserIsNotAuthenticated',
  allowRedirectBack: false
})

// UI Component Wrappers

export const VisibleOnlyAuth = connectedAuthWrapper({
  authenticatedSelector: state => state.user !== null && state.user.data,
  wrapperDisplayName: 'VisibleOnlyAuth'
})

export const HiddenOnlyAuth = connectedAuthWrapper({
  authenticatedSelector: state => state.user !== null && state.user.data,
  wrapperDisplayName: 'HiddenOnlyAuth'
})
