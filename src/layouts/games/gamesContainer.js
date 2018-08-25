import games from './games'
import { drizzleConnect } from 'drizzle-react'

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    ContractFactory: state.contracts.ContractFactory,
    GameRegistry: state.contracts.GameRegistry,
    Battleship: state.contracts.Battleship,
    drizzleStatus: state.drizzleStatus
  }
}

const createContainer = drizzleConnect(games, mapStateToProps);

export default createContainer
