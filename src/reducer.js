import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { drizzleReducers } from 'drizzle'
import userReducer from './reducers/userReducer'
import {squaresIsLoading, squaresHasErrored, squares} from './reducers/BoardReducers'

const reducer = combineReducers({
  routing: routerReducer,
  user: userReducer,
  squaresLoading: squaresIsLoading,
  squaresError: squaresHasErrored,
  squares,
  ...drizzleReducers
})

export default reducer
