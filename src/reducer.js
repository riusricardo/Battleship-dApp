import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { drizzleReducers } from 'drizzle'
import userReducer from './reducers/userReducer'
import {squaresIsLoading, squaresHasErrored, squares1,  squares2} from './reducers/BoardReducers'
import {updatePlayer1, updatePlayer2} from './reducers/create/updatePlayers'
import {updateGameAddress} from './reducers/create/updateGameAddress'
import {gameContract} from './reducers/game/gameContract'

const reducer = combineReducers({
  routing: routerReducer,
  user: userReducer,
  squaresLoading: squaresIsLoading,
  squaresError: squaresHasErrored,
  squares1,
  squares2,
  gameContract,
  player1: updatePlayer1,
  player2: updatePlayer2,
  gameAddress: updateGameAddress,
  ...drizzleReducers
})

export default reducer
