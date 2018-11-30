import { uport } from './../../../util/connectors.js'
import { history } from '../../../store'

export const USER_LOGGED_IN = 'USER_LOGGED_IN'
function userLoggedIn(user) {
  return {
    type: USER_LOGGED_IN,
    payload: user
  }
}

export function loginUser() {
  return function(dispatch) {
    // UPort and its web3 instance are defined in ./../../../util/connectors.
    // Request uPort persona of account passed via QR

    /*
    uport.requestCredentials({
        requested: ['name', 'avatar', 'country'],
        notifications: true
    }).then((credentials) => {
      dispatch(userLoggedIn(credentials))
    */
    

    dispatch(userLoggedIn({name: "Ricardo Rius", avatar:{uri: "http://sweetclipart.com/multisite/sweetclipart/files/pirate_cute.png"}, country: "7 Seas"}))

      // Used a manual redirect here as opposed to a wrapper.
      // This way, once logged in a user can still access the home page.
    /*var currentLocation = browserHistory.getCurrentLocation()

      if ('redirect' in currentLocation.query)
      {
        return browserHistory.push(decodeURIComponent(currentLocation.query.redirect))
      }
    */
      return history.push('/create')
    //})
  }
}
