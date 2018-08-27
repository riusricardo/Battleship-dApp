import games from './games'
import { drizzleConnect } from 'drizzle-react'

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    accounts: state.accounts,
    gameAddress: state.gameAddress,
    GameRegistry: state.contracts.GameRegistry,
    drizzleStatus: state.drizzleStatus
  }
}

const createContainer = drizzleConnect(games, mapStateToProps);

export default createContainer